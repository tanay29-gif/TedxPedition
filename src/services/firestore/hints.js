import {
    doc,
    getDoc
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

const hintsCollection = "hints";

/**
 * Returns the hint document of a stall.
 */

export const getHint = async (stallId) => {

    try {

        const hintRef = doc(db, hintsCollection, stallId);

        const snapshot = await getDoc(hintRef);

        if (!snapshot.exists()) {

            console.log("Hint not found");

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


