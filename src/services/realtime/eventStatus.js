import {
    get,
    ref,
    update
} from "firebase/database";

import { realtimeDb } from "../../firebase/firebase";

const eventStatusRef = "eventStatus";

/**
 * Get the current event status.
 */
export const getEventStatus = async () => {

    try {

        const snapshot = await get(ref(realtimeDb, eventStatusRef));

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
 * Update the event status.
 */
export const updateEventStatus = async (data) => {

    try {

        await update(
            ref(realtimeDb, eventStatusRef),
            data
        );

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};