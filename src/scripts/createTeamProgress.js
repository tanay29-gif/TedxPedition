import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

import { app, db } from "./firebaseNode.js";

import {
    getDatabase,
    ref,
    set,
} from "firebase/database";

const realtimeDB = getDatabase(app);

const STALLS = [
    "STALL01",
    "STALL02",
    "STALL03",
    "STALL04",
    "STALL05",
    "STALL06",
];

const initializeEvent = async () => {

    try {

        console.log("Loading Teams...");

        const teamsSnapshot = await getDocs(
            collection(db, "teams")
        );

        if (teamsSnapshot.empty) {

            console.log("No Teams Found.");

            return;

        }

        for (const teamDoc of teamsSnapshot.docs) {

            const teamId = teamDoc.id;

            console.log(`Initializing ${teamId}`);

            const batch = writeBatch(db);

            /*
            ---------------------------------
            Reset Team Document
            ---------------------------------
            */

            batch.set(

                doc(db, "teams", teamId),

                {

                    currentStall: "STALL01",

                    coins: 5,

                    totalScore: 0,

                    totalTime: 0,

                    updatedAt: serverTimestamp(),

                },

                {
                    merge: true,
                }

            );

            /*
            ---------------------------------
            Team Progress
            ---------------------------------
            */

            const progress = {};

            STALLS.forEach((stall, index) => {

                progress[stall] = {

                    status:
                        index === 0
                            ? "READY"
                            : "LOCKED",

                    startedAt: null,

                    endedAt: null,

                    verifiedAt: null,

                    verifiedBy: "",

                    timeTaken: 0,

                    baseScore: 0,

                    bonus: 0,

                    finalScore: 0,

                    hintUsed: false,

                    remarks: "",

                    nextStall:
                        index < STALLS.length - 1
                            ? STALLS[index + 1]
                            : "FINISHED",

                };

            });

            batch.set(

                doc(
                    db,
                    "team_progress",
                    teamId
                ),

                progress,

                {
                    merge: true,
                }

            );

            await batch.commit();

            /*
            ---------------------------------
            Realtime Database
            ---------------------------------
            */

            await set(

                ref(
                    realtimeDB,
                    `activeTeams/${teamId}`
                ),

                {

                    currentStall: "STALL01",

                    status: "WAITING",

                    updatedAt: Date.now(),

                }

            );

            console.log(`${teamId} Initialized`);

        }

        /*
        ---------------------------------
        Event Status
        ---------------------------------
        */

        await set(

            ref(
                realtimeDB,
                "eventStatus"
            ),

            {

                status: "READY",

                message: "Waiting for Super Admin",

                updatedAt: Date.now(),

            }

        );

        console.log("================================");

        console.log("Event Initialized Successfully");

        console.log("================================");

    }

    catch (error) {

        console.error("Initialization Error:");

        console.error(error);

    }

};

initializeEvent();