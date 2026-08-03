import {
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { getStallKey, getStallProgressValue } from "./stallKeys";
import { calculateBonus, calculateFinalScore } from "../scoring";
import { updateActiveTeam } from "../realtime/activeTeams";
import { updateLeaderboard } from "../realtime/leaderboard";

const progressCollection = "team_progress";

// Get complete progress of a team
// @param {string} teamId
// @returns {Object|null}
export const getProgress = async (teamId) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        const snapshot = await getDoc(progressRef);
        if (!snapshot.exists()) {
            console.log("Progress document not found");
            return null;
        }
        return {
            id: snapshot.id,
            ...snapshot.data()
        };
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Returns only one stall's progress
 */
export const getStallProgress = async (teamId, stallNumber) => {
    try {
        const progress = await getProgress(teamId);
        if (!progress) return null;
        return getStallProgressValue(progress, stallNumber);
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Start Stall
 */
export const startStall = async (teamId, stallNumber) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        const stallKey = getStallKey(stallNumber);
        
        // 1. Update Firestore progress document: startedAt and status PLAYING
        await updateDoc(progressRef, {
            [`${stallKey}.startedAt`]: serverTimestamp(),
            [`${stallKey}.status`]: "PLAYING"
        });

        // 2. Update RTDB active teams status to PLAYING
        await updateActiveTeam(teamId, {
            currentStall: stallKey,
            status: "PLAYING"
        });

        console.log("Stall Started");
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Finish Stall
 */
export const finishStall = async (teamId, stallNumber) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        const stallKey = getStallKey(stallNumber);

        // 1. Read startedAt from progress document
        const progressData = await getProgress(teamId);
        const stallProg = getStallProgressValue(progressData, stallNumber);
        const startedAt = stallProg?.startedAt;

        let timeTaken = 0;
        if (startedAt) {
            const startedAtMs = startedAt.toDate 
                ? startedAt.toDate().getTime() 
                : (startedAt.seconds ? startedAt.seconds * 1000 : new Date(startedAt).getTime());
            timeTaken = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
        }

        // 2. Update Firestore progress: endedAt, timeTaken, status VERIFYING
        await updateDoc(progressRef, {
            [`${stallKey}.endedAt`]: serverTimestamp(),
            [`${stallKey}.timeTaken`]: timeTaken,
            [`${stallKey}.status`]: "VERIFYING"
        });

        // 3. Update RTDB active teams status to VERIFYING
        await updateActiveTeam(teamId, {
            currentStall: stallKey,
            status: "VERIFYING"
        });

        console.log("Stall Finished");
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Verify Stall (Saves verification details and marks COMPLETED)
 */
export const verifyStall = async (
    teamId,
    stallNumber,
    { baseScore, penalty, remarks, verifiedBy }
) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        const stallKey = getStallKey(stallNumber);

        // 1. Read timeTaken from the progress document
        const progressData = await getProgress(teamId);
        const stallProg = getStallProgressValue(progressData, stallNumber);
        const timeTaken = stallProg?.timeTaken || 0;

        // 2. Calculate bonus and final score
        const bonus = calculateBonus(timeTaken);
        const finalScore = calculateFinalScore(baseScore, bonus, penalty);

        // 3. Update Firestore progress document status to COMPLETED
        await updateDoc(progressRef, {
            [`${stallKey}.baseScore`]: baseScore,
            [`${stallKey}.bonus`]: bonus,
            [`${stallKey}.penalty`]: penalty,
            [`${stallKey}.finalScore`]: finalScore,
            [`${stallKey}.remarks`]: remarks || "",
            [`${stallKey}.verifiedBy`]: verifiedBy,
            [`${stallKey}.verifiedAt`]: serverTimestamp(),
            [`${stallKey}.status`]: "COMPLETED"
        });

        console.log("Stall Verified");
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Recalculate totals (totalScore & totalTime) across all completed stalls
 */
export const updateTeamTotals = async (teamId) => {
    try {
        const progressData = await getProgress(teamId);
        if (!progressData) throw new Error("Progress document not found");

        const teamRef = doc(db, "teams", teamId);
        const teamSnap = await getDoc(teamRef);
        if (!teamSnap.exists()) throw new Error("Team document not found");
        const teamData = teamSnap.data();

        let totalGameScore = 0;
        let totalTimeBonus = 0;
        let totalTimeTaken = 0;

        // Calculate scores for Stalls 1-6
        for (let i = 1; i <= 6; i++) {
            const stallProg = getStallProgressValue(progressData, i);
            if (stallProg) {
                const score = Number(stallProg.finalScore || stallProg.baseScore || stallProg.score || 0);
                const time = Number(stallProg.timeTaken || 0);
                const bonus = calculateBonus(time);

                totalGameScore += score;
                totalTimeBonus += bonus;
                totalTimeTaken += time;
            }
        }

        // Add final location points (Stall 7) if completed
        const finalProg = getStallProgressValue(progressData, 7);
        if (finalProg && (finalProg.status === "COMPLETED" || finalProg.completed)) {
            totalGameScore += Number(finalProg.finalScore || finalProg.baseScore || finalProg.score || 0);
            totalTimeTaken += Number(finalProg.timeTaken || 0);
        }

        const coinBonus = (teamData.coins || 0) * 10;
        const finalTotalScore = totalGameScore + totalTimeBonus + coinBonus;

        return {
            totalScore: finalTotalScore,
            totalTime: totalTimeTaken,
            teamName: teamData.teamName
        };
    }
    catch (error) {
        console.error("Error in updateTeamTotals:", error);
        throw error;
    }
};

/**
 * Move team to the next stall and update status
 */
export const unlockNextStall = async (teamId, currentStallNumber) => {
    try {
        const nextStallNum = currentStallNumber + 1;
        const nextStallKey = getStallKey(nextStallNum);

        // 1. Recalculate totals across completed stalls
        const { totalScore, totalTime, teamName } = await updateTeamTotals(teamId);

        // 2. In progress document, update the next stall status to READY if nextStallNum <= 6
        if (nextStallNum <= 6) {
            const progressRef = doc(db, progressCollection, teamId);
            await updateDoc(progressRef, {
                [`${nextStallKey}.status`]: "READY"
            });
        }

        // 3. Update Team profile in Firestore
        const teamRef = doc(db, "teams", teamId);
        await updateDoc(teamRef, {
            currentStall: getStallKey(nextStallNum),
            totalScore: totalScore,
            totalTime: totalTime,
            updatedAt: serverTimestamp()
        });

        // 4. Update Realtime Database leaderboard entry
        await updateLeaderboard(teamId, {
            teamName: teamName || teamId,
            totalScore: totalScore,
            totalTime: totalTime,
            currentStall: getStallKey(nextStallNum)
        });

        // 5. Update Realtime Database activeTeam status (status is READY for next stall, or FINISHED)
        await updateActiveTeam(teamId, {
            currentStall: getStallKey(nextStallNum),
            status: nextStallNum > 7 ? "FINISHED" : "READY",
            updatedAt: Date.now()
        });

        console.log(`Unlocked Next Stall ${nextStallNum}`);
    }
    catch (error) {
        console.error("Error in unlockNextStall:", error);
        throw error;
    }
};

/**
 * Mark Hint Used
 */
export const markHintUsed = async (teamId, stallNumber) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        await updateDoc(progressRef, {
            [`${getStallKey(stallNumber)}.hintUsed`]: true
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Legacy Support Utilities (simple wrappers to avoid compilation break if references exist)
 */
export const completeStall = async (teamId, stallNumber) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        await updateDoc(progressRef, {
            [`${getStallKey(stallNumber)}.completed`]: true,
            [`${getStallKey(stallNumber)}.status`]: "COMPLETED"
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateStallScore = async (teamId, stallNumber, score) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        await updateDoc(progressRef, {
            [`${getStallKey(stallNumber)}.finalScore`]: score
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateTimeTaken = async (teamId, stallNumber, seconds) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        await updateDoc(progressRef, {
            [`${getStallKey(stallNumber)}.timeTaken`]: seconds
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};