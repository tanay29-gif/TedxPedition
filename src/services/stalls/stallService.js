import { startStall, finishStall } from "../firestore/progress";

/**
 * Validates scanned QR code against the expected stall ID.
 * The scanned code can be a JSON string like {"stallId": "STALL01"} or a raw string.
 * Returns a structured object with validation status and stall codes.
 */
export const validateScannedStall = (scannedCode, expectedStallId) => {
  if (!scannedCode || !expectedStallId) {
    return {
      valid: false,
      scannedStall: "",
      expectedStall: String(expectedStallId || "")
    };
  }

  let scannedStall = String(scannedCode).trim();
  try {
    const parsed = JSON.parse(scannedCode);
    if (parsed && typeof parsed === "object" && parsed.hasOwnProperty("stallId")) {
      scannedStall = String(parsed.stallId).trim();
    }
  } catch (e) {
    // Treat as raw string
  }

  const expectedStall = String(expectedStallId).trim();
  const valid = scannedStall.toUpperCase() === expectedStall.toUpperCase();

  return {
    valid,
    scannedStall,
    expectedStall
  };
};

/**
 * Coordinate starting a mission
 */
export const startMission = async (teamId, stallNum) => {
  await startStall(teamId, stallNum);
};

/**
 * Coordinate finishing a mission
 */
export const finishMission = async (teamId, stallNum) => {
  await finishStall(teamId, stallNum);
};
