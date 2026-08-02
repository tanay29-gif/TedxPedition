import { useState } from "react";
import QRScanner from "../components/QRScanner/QRScanner";
import Timer from "../components/Timer/Timer";
import GameContainer from "../components/game/GameContainer";
import { getStallKey } from "../services/firestore/stallKeys";
import { getQRWord } from "../services/firestore/qr";
import { stallIdToMission } from "../utils/missionUtils";
import "./ChallengePage.css";

export default function ChallengePage({
  team,
  stallNum,
  stallProgress,
  stallMeta,
  hintText,
  onUseHintClick,
  onComplete,
  handleLogout
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // QR Game States (Stall 2)
  const [qrWords, setQrWords] = useState({
    TALK1: "",
    TALK2: "",
    TALK3: "",
    TALK4: "",
    TALK5: "",
    TALK6: ""
  });
  const [activeWordsOrder, setActiveWordsOrder] = useState([]);
  const correctSentence = ["ideas", "worth", "spreading", "can", "change", "lives"];

  // Fallback words database
  const talkFallbackWords = {
    TALK1: "ideas",
    TALK2: "worth",
    TALK3: "spreading",
    TALK4: "can",
    TALK5: "change",
    TALK6: "lives"
  };

  // --- QR Words Puzzle Engine ---
  const handleQRScanSuccess = async (scannedCode) => {
    setError("");
    let rawCode = scannedCode.trim();

    // 1. Try parsing JSON to extract qrId
    let qrId = rawCode;
    try {
      const parsed = JSON.parse(rawCode);
      if (parsed && typeof parsed === "object" && parsed.hasOwnProperty("qrId")) {
        qrId = String(parsed.qrId).trim();
      }
    } catch (e) {
      // Not a JSON string
    }

    // 2. Extract QR number (QR1 to QR6, or QR001 to QR006)
    const qrMatch = qrId.toUpperCase().match(/QR0?([1-6])/);
    if (!qrMatch) {
      setError("Invalid Talk QR Code. It must correspond to one of the 6 QR banners.");
      return;
    }

    const orderNum = parseInt(qrMatch[1], 10);
    const normalizedQrId = `QR${String(orderNum).padStart(3, "0")}`; // e.g. "QR001"

    let talkId = `TALK${orderNum}`; // default fallback mapping
    let word = talkFallbackWords[talkId];

    try {
      // Fetch QR Word document using canonical ID (e.g. "QR001")
      const qrData = await getQRWord(normalizedQrId);
      if (qrData) {
        if (qrData.talkId) {
          talkId = qrData.talkId;
        }
        if (qrData.word) {
          word = qrData.word.toLowerCase();
        }
      }
    } catch (err) {
      console.error("Failed to load QR word from DB, using fallback:", err);
    }

    setQrWords(prev => ({
      ...prev,
      [talkId]: word
    }));
    setIsScannerOpen(false);
  };

  const handleManualWordInput = (talkId, val) => {
    setQrWords(prev => ({
      ...prev,
      [talkId]: val.trim().toLowerCase()
    }));
  };

  const toggleWordInSentence = (word) => {
    if (success) return;
    if (activeWordsOrder.includes(word)) {
      setActiveWordsOrder(activeWordsOrder.filter(w => w !== word));
    } else {
      setActiveWordsOrder([...activeWordsOrder, word]);
    }
  };

  const validateSentenceOrder = () => {
    setError("");
    if (activeWordsOrder.length < correctSentence.length) {
      setError("Please arrange all 6 words before validating.");
      return;
    }

    const isCorrect = activeWordsOrder.every((w, idx) => w === correctSentence[idx]);

    if (isCorrect) {
      setSuccess(true);
    } else {
      setError("Incorrect word sequence. Read the TED slogan and try again.");
    }
  };

  // --- Common Submit ---
  const handleFinishStall = async () => {
    try {
      if (onComplete) {
        await onComplete();
      }
    } catch (err) {
      console.error("Failed to submit mission:", err);
      setError("Error submitting mission. Please try again.");
    }
  };

  return (
    <div className="challenge-page">
      <header className="challenge-header">
        <div className="header-info">
          <span className="badge">{stallIdToMission(stallNum).toUpperCase()} ACTIVE</span>
          <h2>{stallMeta?.name || `${stallIdToMission(stallNum)} Challenge`}</h2>
        </div>
        <div className="header-status">
          <Timer startedAt={stallProgress?.startedAt} />
          <button onClick={handleLogout} className="btn btn-accent">Log Out</button>
        </div>
      </header>

      <main className="challenge-content">
        <section className="challenge-layout">
          {/* Main workspace depending on Stall */}
          
          {stallNum === 1 && (
            <GameContainer
              stallId={getStallKey(stallNum)}
              stallNum={stallNum}
              onComplete={handleFinishStall}
              success={success}
              setSuccess={setSuccess}
              error={error}
              setError={setError}
            />
          )}

          {stallNum === 2 && (
            <div className="glass-card game-container glow-red">
              <div className="game-instructions">
                <h3>TED Talk QR Slogan Puzzle</h3>
                <p>Scan the QR codes located on the six TED Talk banners around the campus. Collect the words and arrange them to form the famous TED slogan.</p>
              </div>

              <div className="qr-words-grid">
                {Object.keys(qrWords).map((talkKey, index) => (
                  <div key={talkKey} className={`qr-word-card ${qrWords[talkKey] ? 'filled' : ''}`}>
                    <span className="talk-label">Talk Banner #{index + 1}</span>
                    {qrWords[talkKey] ? (
                      <span className="talk-word font-mono">{qrWords[talkKey]}</span>
                    ) : (
                      <div className="talk-input-actions">
                        <button onClick={() => setIsScannerOpen(true)} className="btn btn-accent btn-sm">
                          📷 Scan
                        </button>
                        <input
                          type="text"
                          placeholder="Or enter word..."
                          onBlur={(e) => handleManualWordInput(talkKey, e.target.value)}
                          className="word-manual-field"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="sentence-arranger">
                <h4>Arrange collected words into a Slogan:</h4>
                <div className="arranger-pool">
                  {Object.values(qrWords).map((word, idx) => {
                    if (!word) return null;
                    const isUsed = activeWordsOrder.includes(word);
                    return (
                      <button
                        key={idx}
                        className={`pool-word-btn ${isUsed ? 'used' : ''}`}
                        onClick={() => toggleWordInSentence(word)}
                        disabled={success}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>

                <div className="sentence-builder-box">
                  {activeWordsOrder.length === 0 ? (
                    <span className="empty-builder-text">Click words above to construct sentence...</span>
                  ) : (
                    <div className="active-sentence">
                      {activeWordsOrder.map((word, idx) => (
                        <span key={idx} className="sentence-word">{word}</span>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={validateSentenceOrder} 
                  className="btn btn-secondary validate-btn" 
                  disabled={activeWordsOrder.length < correctSentence.length || success}
                >
                  🔒 Validate Slogan
                </button>
              </div>
            </div>
          )}

          {stallNum > 2 && (
            <div className="glass-card game-container">
              <div className="game-instructions offline-challenge-box">
                <h3>Physical Activity Stall</h3>
                <p>This is an <strong>Offline (Physical)</strong> challenge. Reach the stall station and perform the activity instructed by the Stall Administrator.</p>
                
                <div className="offline-details-card">
                  <div className="detail-row">
                    <span className="label">Activity:</span>
                    <span className="value">{stallMeta?.name || `Activity ${stallNum}`}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Max Score Available:</span>
                    <span className="value">100 points</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Stall Location:</span>
                    <span className="value">{stallMeta?.location || `Stall Station ${stallNum}`}</span>
                  </div>
                </div>

                <div className="offline-action-box">
                  <p>When you complete the activity, click below to log your finish and alert the Stall Admin to record your scores.</p>
                  <button onClick={handleFinishStall} className="btn btn-primary finish-offline-btn">
                    🏁 Finish Challenge (Alert Admin)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Common Side panel for Clues, Hints & Error messages */}
          <div className="challenge-sidebar">
            {error && <div className="challenge-error-box animate-shake">⚠️ {error}</div>}
            {success && (
              <div className="challenge-success-box">
                <h3>🎉 Challenge Solved!</h3>
                <p>Your solution has been successfully validated by the system. Stop the timer and submit to notify the administrator.</p>
                <button onClick={handleFinishStall} className="btn btn-primary submit-final-btn">
                  Submit & Finish Mission
                </button>
              </div>
            )}

            <div className="glass-card clue-panel">
              <h4>Mission Clue</h4>
              <p>{stallMeta?.description || `${stallIdToMission(stallNum)} active task. Complete it to unlock the next destination.`}</p>
            </div>

            <div className="glass-card hint-panel">
              <h4>Mission Hint</h4>
              {hintText ? (
                <div className="hint-revealed">
                  <span className="hint-revealed-icon font-mono">💡 Revealed Clue:</span>
                  <p className="hint-revealed-text">{hintText}</p>
                </div>
              ) : (
                <div className="hint-request">
                  <p>Stuck on this mission? Use a Hint Coin to unlock a clue.</p>
                  <button onClick={onUseHintClick} className="btn btn-accent btn-sm hint-btn">
                    💡 Spend Hint Coin
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {isScannerOpen && (
        <QRScanner
          title="Scan Talk QR Banner"
          placeholder="Enter QR Talk (e.g. TALK1)"
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
