import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QRScanner.css";

export default function QRScanner({ onScanSuccess, onScanFailure, onClose, title = "Scan QR Code", placeholder = "Or enter code manually..." }) {
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  useEffect(() => {
    let html5QrCode;
    const qrRegionId = "qr-reader-viewport";

    if (cameraActive) {
      const initializeScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode(qrRegionId);
          setScannerInitialized(true);

          await html5QrCode.start(
            
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              // On success
              console.log("Scanner started", decodedText);
              onScanSuccess(decodedText);
              stopScanner(html5QrCode);
            },
            (errorMessage) => {
              // Silent failure (polling scans constantly)
              console.log("Scanner error:", errorMessage);
              if (onScanFailure) onScanFailure(errorMessage);
            }
          );
        } catch (err) {
          console.error("Camera scanner initialization failed:", err);
          setError("Could not access camera. Please enter the code manually.");
          setCameraActive(false);
        }
      };

      // Small timeout to allow element to render in DOM
      const timer = setTimeout(() => {
        initializeScanner();
      }, 300);

      return () => {
        clearTimeout(timer);
        stopScanner(html5QrCode);
      };
    }
  }, [cameraActive]);

  const stopScanner = async (scannerInstance) => {
    if (scannerInstance && scannerInstance.isScanning) {
      try {
        await scannerInstance.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setScannerInitialized(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal glass-card glow-red">
        <div className="qr-scanner-header">
          <h3>{title}</h3>
          <button className="qr-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="qr-scanner-body">
          {cameraActive ? (
            <div className="qr-camera-container">
              <div id="qr-reader-viewport"></div>
              <div className="scanner-laser-line"></div>
              {!scannerInitialized && <div className="scanner-loading">Initializing camera...</div>}
            </div>
          ) : (
            <div className="qr-camera-fallback">
              <div className="fallback-icon">📷❌</div>
              <p className="fallback-text">{error || "Camera is disabled."}</p>
            </div>
          )}

          <div className="qr-scanner-divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleManualSubmit} className="qr-manual-form">
            <input
              type="text"
              placeholder={placeholder}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="qr-manual-input"
            />
            <button type="submit" className="btn btn-primary qr-submit-btn">
              Submit Code
            </button>
          </form>

          {cameraActive && (
            <button 
              type="button" 
              className="btn btn-secondary toggle-camera-btn"
              onClick={() => setCameraActive(false)}
            >
              Enter Manually Instead
            </button>
          )}
          {!cameraActive && (
            <button 
              type="button" 
              className="btn btn-secondary toggle-camera-btn"
              onClick={() => setCameraActive(true)}
            >
              Try Camera Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
