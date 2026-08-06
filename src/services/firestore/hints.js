import {
    doc,
    getDoc
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

/**
 * Returns the hint document of a stall.
 */

export const getHint = async (stallId) => {

    try {
        console.log("getHint called with:", stallId);

        const stallRef = doc(db, "stalls", stallId);

        const snapshot = await getDoc(stallRef);

        if (!snapshot.exists()) {

            console.log("Stall not found");

            return null;

        }
        console.log("Hint Location",  snapshot.data().location);
        return {
            id: snapshot.id,
            location: snapshot.data().location
        };

    } catch (error) {

        console.error("Error fetching stall location:", error);

        return null;

    }

};


