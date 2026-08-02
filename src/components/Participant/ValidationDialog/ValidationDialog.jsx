import React from "react";
import { stallIdToMission } from "../../../utils/missionUtils";
import "./ValidationDialog.css";

export default function ValidationDialog({ isOpen, result, onClose }) {
  if (!isOpen || !result) return null;

  const { valid, scannedStall, expectedStall } = result;

  const scannedLabel = scannedStall ? stallIdToMission(scannedStall) : "Unknown Location";
  const expectedLabel = expectedStall ? stallIdToMission(expectedStall) : "Target Location";

  return (
    <div className="validation-dialog-overlay animate-fade-in">
      <div className={`validation-dialog-card glass-card ${valid ? "glow-green" : "glow-red"} animate-scale-up`}>
        <div className="validation-dialog-icon-container">
          {valid ? (
            <span className="validation-dialog-icon correct-icon animate-pulse-green">✅</span>
          ) : (
            <span className="validation-dialog-icon wrong-icon animate-shake">❌</span>
          )}
        </div>

        <h3 className="validation-dialog-title">
          {valid ? "Correct Location" : "Wrong Location"}
        </h3>

        <div className="validation-dialog-message">
          {valid ? (
            <p className="success-text">Starting Challenge...</p>
          ) : (
            <>
              <p>This isn't your next destination.</p>
              <div className="scanned-info-box">
                <p className="info-detail">Scanned: <span className="highlight-wrong">{scannedLabel}</span></p>
                <p className="info-detail">Required: <span className="highlight-right">{expectedLabel}</span></p>
              </div>
              <p className="instruction-text">Please continue following your active clue.</p>
            </>
          )}
        </div>

        {!valid && (
          <button className="btn btn-primary validation-dialog-btn" onClick={onClose}>
            Keep Searching
          </button>
        )}
      </div>
    </div>
  );
}
