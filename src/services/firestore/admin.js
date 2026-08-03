import {
    doc,
    getDoc
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

const adminCollection = "admin_users";

/**
 * Get admin details by Firebase UID.
 */
export const getAdmin = async (uid) => {

    try {
        console.log("Searching admin with UID:", uid);

        const adminRef = doc(db, adminCollection, uid);

        const snapshot = await getDoc(adminRef);

        if (!snapshot.exists()) {

            return null;

        }
        console.log("Admin data:", snapshot.data());

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