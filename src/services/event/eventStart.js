import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

import { ref, update } from "firebase/database";

import { db,realtimeDb } from "../../firebase/firebase";

export async function startEventForAllTeams() {

    const batch = writeBatch(db);

    const activeTeamsUpdates = {};

    // Fetch all teams
    const teamsSnapshot = await getDocs(collection(db, "teams"));

    teamsSnapshot.forEach((teamDoc) => {

        const team = teamDoc.data();

        const firstStall = team.stallSequence?.[0];

        if (!firstStall) return;


        // -----------------------
        // Update Team Document
        // -----------------------

        batch.update(doc(db, "teams", teamDoc.id), {

            currentStall: firstStall,

            currentStallIndex: 0,

            updatedAt: serverTimestamp(),

        });


        // -----------------------
        // Update Progress Document
        // -----------------------

        batch.set(
            doc(db, "team_progress", teamDoc.id),
            {
                [firstStall]: {
                    status: "TRAVELLING",
                },
            },
            { merge: true }
        );


        // -----------------------
        // Prepare RTDB activeTeams Update
        // -----------------------

        activeTeamsUpdates[`/${teamDoc.id}/currentStall`] = firstStall;

        activeTeamsUpdates[`/${teamDoc.id}/status`] = "TRAVELLING";

        activeTeamsUpdates[`/${teamDoc.id}/updatedAt`] = Date.now();

    });


    // -----------------------
    // Event Status
    // -----------------------

    batch.update(doc(db, "event_status", "current"), {

        status: "RUNNING",

        startedAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

    });


    // Commit Firestore changes first
    await batch.commit();


    // -----------------------
    // Update Realtime Database
    // -----------------------

    if (Object.keys(activeTeamsUpdates).length > 0) {

        await update(
            ref(realtimeDb, "activeTeams"),
            activeTeamsUpdates
        );

    }

}