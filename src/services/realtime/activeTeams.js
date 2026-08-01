import {
    get,
    ref,
    update
} from "firebase/database";

import { realtimeDb } from "../../firebase/firebase";

const activeTeamsRef = "activeTeams";

/**
 * Get all active teams.
 */
export const getActiveTeams = async () => {

    try {

        const snapshot = await get(ref(realtimeDb, activeTeamsRef));

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
 * Get one active team's live status.
 */
export const getActiveTeam = async (teamId) => {

    try {

        const snapshot = await get(
            ref(realtimeDb, `${activeTeamsRef}/${teamId}`)
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
 * Update a team's live status.
 */
export const updateActiveTeam = async (teamId, data) => {

    try {

        await update(
            ref(realtimeDb, `${activeTeamsRef}/${teamId}`),
            {
                ...data,
                updatedAt: Date.now()
            }
        );

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};
