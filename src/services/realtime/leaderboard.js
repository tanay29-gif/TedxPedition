import {
    get,
    ref,
    update
} from "firebase/database";

import { realtimeDb } from "../../firebase/firebase";

const leaderboardRef = "leaderboard";

/**
 * Get the complete leaderboard.
 */
export const getLeaderboard = async () => {

    try {

        const snapshot = await get(ref(realtimeDb, leaderboardRef));

        if (!snapshot.exists()) {

            return {};

        }

        return snapshot.val();

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

/**
 * Get one team's leaderboard entry.
 */
export const getTeamLeaderboard = async (teamId) => {

    try {

        const snapshot = await get(
            ref(realtimeDb, `${leaderboardRef}/${teamId}`)
        );

        if (!snapshot.exists()) {

            return null;

        }

        return snapshot.val();

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

/**
 * Update a team's leaderboard entry.
 */
export const updateLeaderboard = async (teamId, data) => {

    try {

        await update(
            ref(realtimeDb, `${leaderboardRef}/${teamId}`),
            data
        );

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

