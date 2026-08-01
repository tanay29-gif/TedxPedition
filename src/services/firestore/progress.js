import {
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

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

export const getStallProgress = async (

    teamId,

    stallNumber

) => {

    try {

        const progress = await getProgress(teamId);

        if (!progress) return null;

        return progress[`stall${stallNumber}`];

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};


/**
 * Start Stall
 */

export const startStall = async (

    teamId,

    stallNumber

) => {

    try {

        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {

            [`stall${stallNumber}.startedAt`]:

                serverTimestamp()

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

export const finishStall = async (

    teamId,

    stallNumber

) => {

    try {

        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {

            [`stall${stallNumber}.endedAt`]:

                serverTimestamp()

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};


/**
 * Mark Stall Completed
 */

export const completeStall = async (

    teamId,

    stallNumber

) => {

    try {

        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {

            [`stall${stallNumber}.completed`]:

                true

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};


/**
 * Update Stall Score
 */

export const updateStallScore = async (

    teamId,

    stallNumber,

    score

) => {

    try {

        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {

            [`stall${stallNumber}.score`]:

                score

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

/**
 * Mark Hint Used
 */

export const markHintUsed = async (

    teamId,

    stallNumber

) => {

    try {

        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {

            [`stall${stallNumber}.hintUsed`]:

                true

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

/**
 * Save Admin UID
 */

export const verifyStall = async (

    teamId,

    stallNumber,

    adminUid

) => {

    try {

        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {

            [`stall${stallNumber}.verifiedBy`]:

                adminUid

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

/**
 * Update Time Taken
 */

export const updateTimeTaken = async (

    teamId,

    stallNumber,

    seconds

) => {

    try {

        const progressRef = doc(db, progressCollection, teamId);

        await updateDoc(progressRef, {

            [`stall${stallNumber}.timeTaken`]:

                seconds

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};