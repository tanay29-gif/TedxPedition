import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

export async function startEventForAllTeams() {
    const batch = writeBatch(db);

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
    });

    // -----------------------
    // Event Status
    // -----------------------

    batch.update(doc(db, "event_status", "current"), {
        status: "RUNNING",
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await batch.commit();
}