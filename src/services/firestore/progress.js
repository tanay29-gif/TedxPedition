import {
    doc,
    getDoc,
    serverTimestamp,
    increment,
    updateDoc,
} from "firebase/firestore";
import { ref, get } from "firebase/database"; 

import { db, realtimeDb } from "../../firebase/firebase";
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

        // Check RTDB status
        const activeTeamRef = ref(realtimeDb, `activeTeams/${teamId}`);
        const snapshot = await get(activeTeamRef);

        if (!snapshot.exists()) {
            throw new Error("Team is not active.");
        }
        console.log("Active Team Data:", snapshot.val());

        const activeTeam = snapshot.val();

        if (
            activeTeam.status !== "TRAVELLING" ||
            activeTeam.currentStall !== stallKey
        ) {
            throw new Error(
                `Team cannot start this stall. Current Status: ${activeTeam.status}, Current Stall: ${activeTeam.currentStall}`
            );
        }

        // Update Firestore
        await updateDoc(progressRef, {
            [`${stallKey}.startedAt`]: serverTimestamp(),
            [`${stallKey}.status`]: "PLAYING"
        });

        // Update RTDB
        await updateActiveTeam(teamId, {
            currentStall: stallKey,
            status: "PLAYING"
        });

        console.log("Stall Started");

    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Finish Stall
 */
// export const finishStall = async (teamId, stallNumber) => {
//     try {
//         const progressRef = doc(db, progressCollection, teamId);
//         const stallKey = getStallKey(stallNumber);

//         const progressData = await getProgress(teamId);
//         const stallProg = getStallProgressValue(progressData, stallNumber);

//         const startedAt = stallProg?.startedAt;

//         let timeTaken = 0;

//         if (startedAt) {
//             const startedAtMs = startedAt.toDate
//                 ? startedAt.toDate().getTime()
//                 : startedAt.seconds * 1000;

//             timeTaken = Math.max(
//                 0,
//                 Math.floor((Date.now() - startedAtMs) / 1000)
//             );
//         }

//         await updateDoc(progressRef, {
//             [`${stallKey}.endedAt`]: serverTimestamp(),
//             [`${stallKey}.timeTaken`]: timeTaken
//         });

//         console.log("Timer Stopped");
//     }
//     catch (error) {
//         console.error(error);
//         throw error;
//     }
// };

export const finishStall = async (teamId, stallNumber) => {
    try {
        const progressRef = doc(db, progressCollection, teamId);
        const stallKey = getStallKey(stallNumber);

        // Check RTDB status
        const activeTeamRef = ref(realtimeDb, `activeTeams/${teamId}`);
        const snapshot = await get(activeTeamRef);

        if (!snapshot.exists()) {
            throw new Error("Team is not active.");
        }

        const activeTeam = snapshot.val();

        if (
            activeTeam.status !== "PLAYING" ||
            activeTeam.currentStall !== stallKey
        ) {
            throw new Error(
                `Team cannot finish this stall. Current Status: ${activeTeam.status}, Current Stall: ${activeTeam.currentStall}`
            );
        }

        const progressData = await getProgress(teamId);
        const stallProg = getStallProgressValue(progressData, stallNumber);

        const startedAt = stallProg?.startedAt;

        let timeTaken = 0;

        if (startedAt) {
            const startedAtMs = startedAt.toDate
                ? startedAt.toDate().getTime()
                : startedAt.seconds * 1000;

            timeTaken = Math.max(
                0,
                Math.floor((Date.now() - startedAtMs) / 1000)
            );
        }

        await updateDoc(progressRef, {
            [`${stallKey}.endedAt`]: serverTimestamp(),
            [`${stallKey}.timeTaken`]: timeTaken
        });

        // Team is now waiting for admin verification

        console.log("Timer Stopped");

    } catch (error) {
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
    { baseScore, penalty, hintUsed, remarks, verifiedBy }
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

            [`${stallKey}.hintUsed`]: hintUsed,

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
export const unlockNextStall = async (teamId, hintUsed) => {
    try {
        // 1. Get Team Details
        const teamRef = doc(db, "teams", teamId);
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
            throw new Error("Team not found.");
        }

        const teamData = teamSnap.data();

        const stallSequence = teamData.stallSequence || [];
        const currentIndex = Number(teamData.currentStallIndex ?? 0);

        const nextIndex = currentIndex + 1;

        // 2. Update total score & total time
        const { totalScore, totalTime, teamName } =
            await updateTeamTotals(teamId);

        // ======================================================
        // EVENT COMPLETED (LAST STALL FINISHED)
        // ======================================================
        if (nextIndex >= stallSequence.length) {

            await updateDoc(teamRef, {
                totalScore,
                totalTime,
                updatedAt: serverTimestamp()
            });

            await updateLeaderboard(teamId, {
                teamName: teamName || teamId,
                totalScore,
                totalTime,
                currentStall: teamData.currentStall
            });

            await updateActiveTeam(teamId, {
                currentStall: teamData.currentStall,
                status: "COMPLETED"
            });

            console.log(`${teamId} completed the event.`);
            return;
        }

        // ======================================================
        // NEXT RANDOM STALL
        // ======================================================

        const nextStall = stallSequence[nextIndex];

        // Unlock next stall
        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {
            [`${nextStall}.status`]: "TRAVELLING"
        });

        // Update Team document
        const teamUpdate = {
            currentStall: nextStall,
            currentStallIndex: nextIndex,
            totalScore,
            totalTime,
            updatedAt: serverTimestamp(),
        };

        if (hintUsed) {
            teamUpdate.coins = increment(-1);
        }

        await updateDoc(teamRef, teamUpdate);

        // Update Leaderboard
        await updateLeaderboard(teamId, {
            teamName: teamName || teamId,
            totalScore,
            totalTime,
            currentStall: nextStall
        });

        // Update Active Team
        await updateActiveTeam(teamId, {
            currentStall: nextStall,
            status: "TRAVELLING"
        });

        console.log(`${teamId} unlocked ${nextStall}`);

    } catch (error) {
        console.error("Error unlocking next stall:", error);
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

