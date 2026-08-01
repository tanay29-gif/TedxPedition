import {
    doc,
    getDoc
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

const adminCollection = "admin_users";

/**
 * Get admin details by Firebase UID.
 */
export const getAdminByUID = async (uid) => {

    try {

        const adminRef = doc(db, adminCollection, uid);

        const snapshot = await getDoc(adminRef);

        if (!snapshot.exists()) {

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