import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

const teamsCollection = collection(db, "teams");

/**
 * Fetch team using leader email
 *
 * @param {string} email
 * @returns {Object|null}
 */

export const getTeamByLeaderEmail = async (email) => {

    try {

        const q = query(
            teamsCollection,
            where("leaderEmail", "==", email)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            console.log("No Team Found");

            return null;
        }

        const document = snapshot.docs[0];

        return {
            id: document.id,
            ...document.data()
        };

    } catch (error) {

        console.error("Error fetching team:", error);

        throw error;
    }

};


//   Fetch Team using Team ID
//   @param {string} teamId
//   @returns {Object|null}


export const getTeamById = async (teamId) => {

    try {

        const teamRef = doc(db, "teams", teamId);

        const snapshot = await getDoc(teamRef);

        if (!snapshot.exists()) {

            console.log("Team Not Found");

            return null;
        }

        return {

            id: snapshot.id,

            ...snapshot.data()

        };

    } catch (error) {

        console.error("Error fetching team:", error);

        throw error;
    }

};
// Update Team 
// @param {string} teamId
// @param {Object} updatedData


export const updateTeam = async (teamId, updatedData) => {

    try {

        const teamRef = doc(db, "teams", teamId);

        await updateDoc(teamRef, {

            ...updatedData,

            updatedAt: serverTimestamp()

        });

        console.log("Team Updated Successfully");

    } catch (error) {

        console.error("Error updating team:", error);

        throw error;
    }

};


/**
 * Update Coins
 */

export const updateCoins = async (teamId, coins) => {

    try {

        const teamRef = doc(db, "teams", teamId);

        await updateDoc(teamRef, {

            coins,

            updatedAt: serverTimestamp()

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

//Update Current Stall
export const updateCurrentStall = async (

    teamId,

    stall

) => {

    try {

        const teamRef = doc(db, "teams", teamId);

        await updateDoc(teamRef, {

            currentStall: stall,

            updatedAt: serverTimestamp()

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

//Update Score
export const updateScore = async (

    teamId,

    score

) => {

    try {

        const teamRef = doc(db, "teams", teamId);

        await updateDoc(teamRef, {

            totalScore: score,

            updatedAt: serverTimestamp()

        });

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};