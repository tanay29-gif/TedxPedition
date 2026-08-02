export const stallIdToNumber = (stallId) => {
  if (!stallId) return 1;
  if (typeof stallId === "number") return stallId;
  const match = String(stallId).match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

export const stallIdToMission = (stallId) => {
  const num = stallIdToNumber(stallId);
  return num === 7 ? "Final Mission" : `Mission ${num}`;
};
