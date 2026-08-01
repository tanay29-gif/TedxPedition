import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, getDoc, updateDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { db, realtimeDb } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth";
import { getTeamById } from "../services/firestore/teams";
import { getProgress, verifyStall, completeStall, updateStallScore, updateTimeTaken, finishStall } from "../services/firestore/progress";
import { updateActiveTeam } from "../services/realtime/activeTeams";
import { updateLeaderboard } from "../services/realtime/leaderboard";
import QRScanner from "../components/QRScanner/QRScanner";
import Timer from "../components/Timer/Timer";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, adminData } = useAuth();
  const navigate = useNavigate();

  // Selected Stall Admin State
  const [selectedStallNum, setSelectedStallNum] = useState(1);
  const [activeTeamsList, setActiveTeamsList] = useState({});
  const [teamsMetadata, setTeamsMetadata] = useState({});
  const [loading, setLoading] = useState(true);

  // QR Scanning and Team Selection States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamProgress, setSelectedTeamProgress] = useState(null);
  const [selectedTeamStallProgress, setSelectedTeamStallProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Score Form States
  const [scoreInput, setScoreInput] = useState("100");
  const [bonusInput, setBonusInput] = useState("0");
  const [penaltyInput, setBonusPenalty] = useState("0");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set default stall from admin profile
  useEffect(() => {
    if (adminData?.stallAssigned) {
      // Expecting stallAssigned to be like "STALL02" or 2
      const match = String(adminData.stallAssigned).match(/STALL0?([1-7])/);
      if (match) {
        setSelectedStallNum(Number(match[1]));
      } else if (typeof adminData.stallAssigned === "number") {
        setSelectedStallNum(adminData.stallAssigned);
      }
    }
  }, [adminData]);

  // Listen to Active Teams from RTDB in Real-time
  useEffect(() => {
    const activeTeamsRef = ref(realtimeDb, "activeTeams");
    const unsubscribe = onValue(activeTeamsRef, (snapshot) => {
      if (snapshot.exists()) {
        setActiveTeamsList(snapshot.val());
      } else {
        setActiveTeamsList({});
      }
      setLoading(false);
    });

    // Fetch team metadata once (IDs to Names mapping)
    const fetchTeamsMetadata = async () => {
      try {
        const teamsColl = collection(db, "teams");
        const snap = await getDocs(teamsColl);
        const meta = {};
        snap.forEach((doc) => {
          meta[doc.id] = doc.data();
        });
        setTeamsMetadata(meta);
      } catch (err) {
        console.error("Error fetching teams metadata:", err);
      }
    };
    fetchTeamsMetadata();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  // Admin scans a Team QR code to open scoring
  const handleTeamQRScan = async (scannedCode) => {
    setErrorMsg("");
    let teamId = scannedCode.trim().toUpperCase();

    // Parse teamId in case full QR URL is scanned
    if (teamId.includes("TEAM")) {
      const match = teamId.match(/TEAM0?([0-9]+)/);
      if (match) {
        teamId = `TEAM${match[1].padStart(3, "0")}`; // Normalizes TEAM001
      }
    }

    try {
      const teamData = await getTeamById(teamId);
      if (!teamData) {
        setErrorMsg("Team not found. Please check the QR code / ID.");
        return;
      }

      await loadTeamScoringData(teamData);
      setIsScannerOpen(false);
    } catch (err) {
      console.error("Error finding scanned team:", err);
      setErrorMsg("Error communicating with database.");
    }
  };

  const loadTeamScoringData = async (teamData) => {
    setErrorMsg("");
    try {
      const progressData = await getProgress(teamData.id);
      const stallProg = progressData?.[`stall${selectedStallNum}`];

      if (!stallProg) {
        setErrorMsg(`Stall ${selectedStallNum} has not been unlocked or started by this team.`);
        return;
      }

      setSelectedTeam(teamData);
      setSelectedTeamProgress(progressData);
      setSelectedTeamStallProgress(stallProg);
      
      // Default score values
      setScoreInput("100");
      setBonusInput("0");
      setBonusPenalty("0");
      setRemarks("");
    } catch (err) {
      console.error("Failed to load scoring details:", err);
      setErrorMsg("Failed to load team progress details.");
    }
  };

  const getMs = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
    if (typeof timestamp === "object" && timestamp.seconds) return timestamp.seconds * 1000;
    return new Date(timestamp).getTime();
  };

  const calculateTimeBonus = (seconds) => {
    if (!seconds) return 0;
    const mins = seconds / 60;
    if (mins <= 1) return 50;
    if (mins <= 2) return 40;
    if (mins <= 3) return 30;
    if (mins <= 4) return 20;
    if (mins <= 5) return 10;
    return 0;
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam || submitting) return;
    setSubmitting(true);

    try {
      const now = new Date();
      const stallKey = `stall${selectedStallNum}`;

      // 1. Double check / enforce timer finish (stops active clock if participant hasn't done so)
      let endedAtMs = getMs(selectedTeamStallProgress.endedAt);
      if (!endedAtMs) {
        await finishStall(selectedTeam.id, selectedStallNum);
        endedAtMs = now.getTime();
      }

      const startedAtMs = getMs(selectedTeamStallProgress.startedAt);
      const elapsedSeconds = startedAtMs ? Math.max(0, Math.floor((endedAtMs - startedAtMs) / 1000)) : 0;

      // Update time taken if not already populated
      await updateTimeTaken(selectedTeam.id, selectedStallNum, elapsedSeconds);

      // 2. Calculate Stalled points
      const baseStallScore = Number(scoreInput) || 0;
      const additionalBonus = Number(bonusInput) || 0;
      const penaltyDeduction = Number(penaltyInput) || 0;
      const finalStallScore = Math.max(0, baseStallScore + additionalBonus - penaltyDeduction);

      // 3. Update Stall values in progress document
      await updateStallScore(selectedTeam.id, selectedStallNum, finalStallScore);
      await verifyStall(selectedTeam.id, selectedStallNum, user.uid);
      await completeStall(selectedTeam.id, selectedStallNum);

      // Fetch fresh progress document to recalculate overall score
      const progressRef = doc(db, "team_progress", selectedTeam.id);
      const progressSnap = await getDoc(progressRef);
      const freshProgress = progressSnap.exists() ? progressSnap.data() : selectedTeamProgress;

      // 4. Calculate Final Score across all completed stalls
      let calculatedGameScore = 0;
      let calculatedTimeBonus = 0;
      let calculatedTimeTaken = 0;

      for (let i = 1; i <= 6; i++) {
        const stallProg = freshProgress?.[`stall${i}`];
        if (stallProg) {
          const score = Number(stallProg.score || 0);
          const time = Number(stallProg.timeTaken || 0);
          const bonus = calculateTimeBonus(time);

          calculatedGameScore += score;
          calculatedTimeBonus += bonus;
          calculatedTimeTaken += time;
        }
      }

      // Add final location points if already done
      const finalProg = freshProgress?.stall7;
      if (finalProg && finalProg.completed) {
        calculatedGameScore += Number(finalProg.score || 0);
        calculatedTimeTaken += Number(finalProg.timeTaken || 0);
      }

      // Coin bonus
      const coinBonus = (selectedTeam.coins || 0) * 10;
      const finalTotalScore = calculatedGameScore + calculatedTimeBonus + coinBonus;

      // 5. Unlock next stall for the team
      const nextStallNum = selectedStallNum + 1;

      // 6. Update Team profile in Firestore
      await updateDoc(doc(db, "teams", selectedTeam.id), {
        currentStall: nextStallNum,
        totalScore: finalTotalScore,
        totalTime: calculatedTimeTaken,
        updatedAt: now
      });

      // 7. Update Realtime Database leaderboard entry
      await updateLeaderboard(selectedTeam.id, {
        teamName: selectedTeam.teamName,
        totalScore: finalTotalScore,
        totalTime: calculatedTimeTaken,
        currentStall: nextStallNum
      });

      // 8. Reset Team active status to PLAYING for next stall (if not game finished)
      await updateActiveTeam(selectedTeam.id, {
        currentStall: nextStallNum,
        status: nextStallNum > 7 ? "FINISHED" : "PLAYING",
        updatedAt: now.getTime()
      });

      alert("Score saved and verified successfully!");
      setSelectedTeam(null);
      setSelectedTeamProgress(null);
      setSelectedTeamStallProgress(null);

    } catch (err) {
      console.error("Error submitting admin score:", err);
      alert("Failed to submit score. Please check connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-branding">
          <h2>TED<span>X</span>pedition Admin Panel</h2>
          <span className="admin-name">Welcome, {adminData?.name || user?.displayName} ({adminData?.role || "Stall Staff"})</span>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="btn btn-accent">Log Out</button>
        </div>
      </header>

      <main className="admin-content">
        {/* Stall selector header */}
        <section className="glass-card stall-selector-card">
          <div className="selector-title-row">
            <h3>Select Managed Stall Station</h3>
            <span className="active-stall-pill font-mono">STALL #{selectedStallNum} ACTIVE</span>
          </div>
          <div className="stall-buttons-row">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                className={`stall-select-btn ${selectedStallNum === num ? "active" : ""}`}
                onClick={() => {
                  setSelectedStallNum(num);
                  setSelectedTeam(null);
                }}
              >
                Stall {num}
              </button>
            ))}
          </div>
        </section>

        {selectedTeam ? (
          /* Scored Team Panel */
          <section className="glass-card scoring-panel glow-red">
            <div className="panel-header">
              <h3>Verify & Score Team: <span className="text-red">{selectedTeam.teamName}</span></h3>
              <button className="btn btn-accent btn-sm" onClick={() => setSelectedTeam(null)}>Back to Dashboard</button>
            </div>

            <div className="team-progress-info">
              <div className="info-stat">
                <span className="lbl">Team ID:</span>
                <span className="val font-mono">{selectedTeam.teamId}</span>
              </div>
              <div className="info-stat">
                <span className="lbl">Stall Started At:</span>
                <span className="val">
                  {selectedTeamStallProgress?.startedAt 
                    ? new Date(getMs(selectedTeamStallProgress.startedAt)).toLocaleTimeString() 
                    : "Not Started"}
                </span>
              </div>
              <div className="info-stat">
                <span className="lbl">Active Elapsed Time:</span>
                <span className="val">
                  <Timer startedAt={selectedTeamStallProgress?.startedAt} endedAt={selectedTeamStallProgress?.endedAt} />
                </span>
              </div>
              <div className="info-stat">
                <span className="lbl">Remaining Coins:</span>
                <span className="val text-gold">🪙 {selectedTeam.coins}</span>
              </div>
            </div>

            <form onSubmit={handleScoreSubmit} className="scoring-form">
              <div className="form-fields-grid">
                <div className="field-group">
                  <label htmlFor="score-val">Base Stall Score (0-100)</label>
                  <input
                    id="score-val"
                    type="number"
                    min="0"
                    max="100"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="bonus-val">Bonus Points (Optional)</label>
                  <input
                    id="bonus-val"
                    type="number"
                    min="0"
                    value={bonusInput}
                    onChange={(e) => setBonusInput(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="penalty-val">Penalties (Optional)</label>
                  <input
                    id="penalty-val"
                    type="number"
                    min="0"
                    value={penaltyInput}
                    onChange={(e) => setBonusPenalty(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group textarea-group">
                <label htmlFor="remarks-val">Verification Remarks / Notes</label>
                <textarea
                  id="remarks-val"
                  rows="3"
                  placeholder="e.g. Completed logo recreated / Pictureka solved successfully..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary submit-score-btn" disabled={submitting}>
                {submitting ? "Saving verification..." : "✅ Submit Performance & Unlock Next Stall"}
              </button>
            </form>
          </section>
        ) : (
          /* Default dashboard showing active teams */
          <section className="admin-teams-grid">
            {/* Left Column: Actions */}
            <div className="glass-card admin-action-card glow-red">
              <h3>Scan Team Code</h3>
              <p>Scan a team's QR code or enter their Team ID manually to record their scores.</p>
              
              {errorMsg && <div className="admin-error-box">⚠️ {errorMsg}</div>}

              <button onClick={() => setIsScannerOpen(true)} className="btn btn-primary admin-scan-btn">
                📷 Scan Team QR
              </button>
            </div>

            {/* Right Column: List of playing teams */}
            <div className="glass-card active-teams-list-card">
              <h3>Teams Active Status</h3>
              {loading ? (
                <div className="list-loading">Loading active teams...</div>
              ) : Object.keys(activeTeamsList).length === 0 ? (
                <div className="empty-list-placeholder">No teams are currently playing.</div>
              ) : (
                <div className="active-teams-table-wrapper">
                  <table className="active-teams-table">
                    <thead>
                      <tr>
                        <th>Team ID</th>
                        <th>Team Name</th>
                        <th>Current Stall</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(activeTeamsList).map((teamId) => {
                        const activeTeam = activeTeamsList[teamId];
                        const meta = teamsMetadata[teamId] || {};
                        const isWaitingForThisStall = 
                          activeTeam.currentStall === selectedStallNum && 
                          activeTeam.status === "VERIFYING";

                        return (
                          <tr key={teamId} className={isWaitingForThisStall ? "needs-verification-row" : ""}>
                            <td className="font-mono">{teamId}</td>
                            <td className="bold">{meta.teamName || "Loading..."}</td>
                            <td>Stall {activeTeam.currentStall}</td>
                            <td>
                              <span className={`status-badge ${activeTeam.status.toLowerCase()}`}>
                                {activeTeam.status}
                              </span>
                            </td>
                            <td>
                              {activeTeam.currentStall === selectedStallNum && (
                                <button
                                  className={`btn btn-accent btn-sm ${isWaitingForThisStall ? "glow-btn" : ""}`}
                                  onClick={() => loadTeamScoringData({ id: teamId, ...meta })}
                                >
                                  {isWaitingForThisStall ? "⚠️ Verify Now" : "Score Team"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {isScannerOpen && (
        <QRScanner
          title={`Scan Team QR (Stall ${selectedStallNum})`}
          placeholder="Enter Team ID (e.g. TEAM001)"
          onScanSuccess={handleTeamQRScan}
          onClose={() => {
            setIsScannerOpen(false);
            setErrorMsg("");
          }}
        />
      )}
    </div>
  );
}