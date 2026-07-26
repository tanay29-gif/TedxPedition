import {
    doc,
    getDoc
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

const qrCollection = "qr_words";

/**
 * Get QR data by QR ID.
 */
export const getQRWord = async (qrId) => {

    try {

        const qrRef = doc(db, qrCollection, qrId);

        const snapshot = await getDoc(qrRef);

        if (!snapshot.exists()) {

            console.log("QR not found");

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