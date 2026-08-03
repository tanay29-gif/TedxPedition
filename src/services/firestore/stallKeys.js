export const getStallKey = (stall) => {
  if (typeof stall === "number" && Number.isFinite(stall)) {
    return `STALL${String(stall).padStart(2, "0")}`;
  }

  if (typeof stall === "string") {
    const trimmed = stall.trim();
    if (!trimmed) return "STALL01";

    const match = trimmed.match(/STALL0?([1-7])/i);
    if (match) {
      return `STALL${String(Number(match[1])).padStart(2, "0")}`;
    }

    const numericMatch = trimmed.match(/([1-7])/);
    if (numericMatch) {
      return `STALL${String(Number(numericMatch[1])).padStart(2, "0")}`;
    }

    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      return `STALL${String(parsed).padStart(2, "0")}`;
    }
  }

  return "STALL01";
};

export const getStallNumber = (stall) => {
  const stallKey = getStallKey(stall);
  const match = stallKey.match(/STALL0?([1-7])/i);
  return match ? Number(match[1]) : null;
};

export const getStallProgressValue = (progress, stall) => {
  const stallKey = getStallKey(stall);
  const legacyKey = `stall${getStallNumber(stall) ?? ""}`;

  if (!progress) return null;

  return progress[stallKey] ?? progress[legacyKey] ?? null;
};
