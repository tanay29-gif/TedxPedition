import { useState, useEffect } from "react";
import { finishStall } from "../services/firestore/progress";
import { updateActiveTeam } from "../services/realtime/activeTeams";
import { getQRWord } from "../services/firestore/qr";
import Timer from "../components/Timer/Timer";
import QRScanner from "../components/QRScanner/QRScanner";
import "./ChallengePage.css";

export default function ChallengePage({
  team,
  progress,
  stallNum,
  stallProgress,
  stallMeta,
  hintText,
  onUseHintClick,
  handleLogout
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Blockly Game States (Stall 1)
  const [blocklyWorkspace, setBlocklyWorkspace] = useState([]);
  const [blocklyOutput, setBlocklyOutput] = useState({ text: "", colors: [] });
  const blocklyOptions = [
    { id: "color_white", type: "action", label: 'Set Fill Color: White', color: '#ffffff' },
    { id: "color_red", type: "action", label: 'Set Fill Color: Red', color: '#e10600' },
    { id: "draw_ted", type: "draw", label: 'Draw Text: "TED"', text: "TED" },
    { id: "draw_x", type: "draw", label: 'Draw Text: "x"', text: "x" }
  ];

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

  // --- Blockly Engine ---
  const addBlockToWorkspace = (block) => {
    if (success) return;
    setBlocklyWorkspace([...blocklyWorkspace, block]);
  };

  const clearBlocklyWorkspace = () => {
    if (success) return;
    setBlocklyWorkspace([]);
    setBlocklyOutput({ text: "", colors: [] });
    setError("");
  };

  const runBlocklyCode = () => {
    setError("");
    let currentColor = "#ffffff";
    let outputText = "";
    let outputColors = [];

    blocklyWorkspace.forEach((block) => {
      if (block.type === "action") {
        currentColor = block.color;
      } else if (block.type === "draw") {
        outputText += block.text;
        for (let i = 0; i < block.text.length; i++) {
          outputColors.push(currentColor);
        }
      }
    });

    setBlocklyOutput({ text: outputText, colors: outputColors });

    // Validate Blockly Logic
    // Correct sequence: White Color -> Draw "TED" -> Red Color -> Draw "x"
    const seq = blocklyWorkspace.map(b => b.id).join(",");
    const correctSeq = "color_white,draw_ted,color_red,draw_x";

    if (seq === correctSeq) {
      setSuccess(true);
      setError("");
    } else {
      if (outputText === "TEDx") {
        setError("Colors are incorrect! TED should be White, x should be Red.");
      } else {
        setError("Recreation failed. Check your block sequence and try again.");
      }
    }
  };

  // --- QR Words Puzzle Engine ---
  const handleQRScanSuccess = async (scannedCode) => {
    setError("");
    let code = scannedCode.trim().toUpperCase();

    // Check if URL scanned, parse query params or path
    // Format could be: TALK1, TALK2 or TALK1:ideas or full URL containing TALK1
    let talkId = "";
    let word = "";

    const talkMatch = code.match(/TALK([1-6])/);
    if (talkMatch) {
      talkId = `TALK${talkMatch[1]}`;
    }

    if (!talkId) {
      setError("Invalid Talk QR Code. It must correspond to one of the 6 TED Talks.");
      return;
    }

    // Attempt to parse word if included in QR, otherwise fetch from db / fallback
    if (code.includes(":") || code.includes("=")) {
      const parts = code.split(/[:=]/);
      word = parts[parts.length - 1].toLowerCase();
    } else {
      try {
        const qrData = await getQRWord(talkId);
        word = qrData?.word?.toLowerCase() || talkFallbackWords[talkId];
      } catch (err) {
        word = talkFallbackWords[talkId];
      }
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
      // 1. Mark endedAt in progress
      await finishStall(team.id, stallNum);

      // 2. Set activeTeam status to VERIFYING in RTDB
      await updateActiveTeam(team.id, {
        currentStall: stallNum,
        status: "VERIFYING"
      });
    } catch (err) {
      console.error("Failed to submit stall:", err);
      alert("Error submitting stall. Please try again.");
    }
  };

  return (
    <div className="challenge-page">
      <header className="challenge-header">
        <div className="header-info">
          <span className="badge">STALL {stallNum} ACTIVE</span>
          <h2>{stallMeta?.name || `Stall ${stallNum} Challenge`}</h2>
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
            <div className="glass-card game-container glow-red">
              <div className="game-instructions">
                <h3>Blockly Coding Challenge</h3>
                <p>TEDx needs a logo! Recreate the official <strong>TED<span>x</span></strong> logo by executing block instructions in the correct order.</p>
                <div className="target-logo-preview">
                  Target Logo: <span className="logo-preview-white">TED</span><span className="logo-preview-red">x</span>
                </div>
              </div>

              <div className="blockly-editor-grid">
                <div className="blockly-toolbox">
                  <h4>Available Blocks</h4>
                  <div className="blocks-list">
                    {blocklyOptions.map((block) => (
                      <button 
                        key={block.id} 
                        className={`block-item ${block.type}`}
                        onClick={() => addBlockToWorkspace(block)}
                        disabled={success}
                      >
                        🧩 {block.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="blockly-workspace">
                  <div className="workspace-header">
                    <h4>Workspace (Drag & Drop order)</h4>
                    <button onClick={clearBlocklyWorkspace} className="btn btn-accent btn-sm" disabled={success}>
                      Clear
                    </button>
                  </div>
                  <div className="workspace-slots">
                    {blocklyWorkspace.length === 0 ? (
                      <div className="empty-workspace-placeholder">
                        Click blocks on the left to add them here in execution order...
                      </div>
                    ) : (
                      blocklyWorkspace.map((block, idx) => (
                        <div key={idx} className={`workspace-block-card ${block.type}`}>
                          <span>{idx + 1}. {block.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="blockly-control-panel">
                <button onClick={runBlocklyCode} className="btn btn-secondary run-btn" disabled={blocklyWorkspace.length === 0 || success}>
                  ▶️ Run Code
                </button>

                <div className="rendered-output-box">
                  <span className="output-label">Output Preview:</span>
                  <div className="rendered-canvas">
                    {blocklyOutput.text ? (
                      blocklyOutput.text.split("").map((char, index) => (
                        <span key={index} style={{ color: blocklyOutput.colors[index] || '#fff' }}>
                          {char}
                        </span>
                      ))
                    ) : (
                      <span className="empty-canvas-text">[Empty Canvas]</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
                  Submit & Finish Stall
                </button>
              </div>
            )}

            <div className="glass-card clue-panel">
              <h4>Stall Clue</h4>
              <p>{stallMeta?.description || `Stall ${stallNum} active task. Complete it to unlock the next destination.`}</p>
            </div>

            <div className="glass-card hint-panel">
              <h4>Stall Hint</h4>
              {hintText ? (
                <div className="hint-revealed">
                  <span className="hint-revealed-icon font-mono">💡 Revealed Clue:</span>
                  <p className="hint-revealed-text">{hintText}</p>
                </div>
              ) : (
                <div className="hint-request">
                  <p>Stuck on this stall? Use a Hint Coin to unlock a clue.</p>
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
