import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebaseNode.js";

const STALLS = [
    "STALL01",
    "STALL02",
    "STALL03",
    "STALL04",
    "STALL05",
    "STALL06"
];

function createEmptyStall(index) {
    return {
        status: index === 0 ? "WAITING" : "LOCKED",

        startedAt: null,
        endedAt: null,
        verifiedAt: null,

        timeTaken: 0,

        hintsConsumed: 0,

        challengeCompleted: false,

        adminId: "",

        baseScore: 100,

        timeBonus: 0,

        hintDeduction: 0,

        manualBonus: 0,

        rulePenalty: 0,

        finalScore: 0,

        remarks: ""
    };
}

async function createTeamProgress(teamId) {

    const progress = {};

    STALLS.forEach((stall, index) => {
        progress[stall] = createEmptyStall(index);
    });

    progress.createdAt = serverTimestamp();
    progress.updatedAt = serverTimestamp();

    await setDoc(
        doc(db, "team_progress", teamId),
        progress
    );

    console.log(`Created progress for ${teamId}`);
}

createTeamProgress("TEAM001");