import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

const stallsCollection = "stalls";


/**
 * Returns all stalls ordered by their sequence.
 */

export const getAllStalls = async () => {

    try {

        const stallsRef = collection(db, stallsCollection);

        const q = query(stallsRef, orderBy("order"));

        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({

            id: doc.id,

            ...doc.data()

        }));

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};


/**
 * Returns one stall
 */

export const getStallById = async (stallId) => {

    try {

        const stallRef = doc(db, stallsCollection, stallId);

        const snapshot = await getDoc(stallRef);

        if (!snapshot.exists()) {

            console.log("Stall not found");

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
 * Returns next stall
 */

export const getNextStall = async (currentOrder) => {

    try {

        const stalls = await getAllStalls();

        return (

            stalls.find(

                (stall) =>

                    stall.order === currentOrder + 1

            ) || null

        );

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};

/**
 * Returns stall using order number.
 */

export const getStallByOrder = async (order) => {

    try {

        const stalls = await getAllStalls();

        return (

            stalls.find(

                (stall) =>

                    stall.order === order

            ) || null

        );

    }

    catch (error) {

        console.error(error);

        throw error;

    }

};