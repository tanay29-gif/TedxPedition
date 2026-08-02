export const calculateBonus = (seconds) => {
    if (!seconds) return 0;
    const mins = seconds / 60;
    if (mins <= 1) return 50;
    if (mins <= 2) return 40;
    if (mins <= 3) return 30;
    if (mins <= 4) return 20;
    if (mins <= 5) return 10;
    return 0;
};

export const calculateFinalScore = (baseScore, bonus, penalty = 0) => {
    return Math.max(0, Number(baseScore || 0) + Number(bonus || 0) - Number(penalty || 0));
};
