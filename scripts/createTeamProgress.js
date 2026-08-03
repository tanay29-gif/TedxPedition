import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, realtimeDB } from "./firebaseNode.js";

const STALLS = [
  "STALL01",
  "STALL02",
  "STALL03",
  "STALL04",
  "STALL05",
  "STALL06",
];

const initializeEvent = async () => {
  console.log("========================");
  console.log("Creating Team Progress");
  console.log("========================");

  try {
    console.log("Loading Teams...");
    const teamsSnapshot = await getDocs(collection(db, "teams"));

    if (teamsSnapshot.empty) {
      console.log("No Teams Found.");
      console.log("========================");
      console.log("Completed Successfully (Empty)");
      console.log("========================");
      return;
    }

    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;
      console.log(`Creating ${teamId}`);

      const batch = writeBatch(db);

      /*
      ---------------------------------
      1. Reset Team Document
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
        { merge: true }
      );

      /*
      ---------------------------------
      2. Create Progress Map
      ---------------------------------
      */
      const progress = {};
      STALLS.forEach((stall, index) => {
        progress[stall] = {
          status: index === 0 ? "READY" : "LOCKED",
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
        doc(db, "team_progress", teamId),
        progress,
        { merge: true }
      );

      await batch.commit();

      /*
      ---------------------------------
      3. Reset RTDB Active Team Status
      ---------------------------------
      */
      await set(
        ref(realtimeDB, `activeTeams/${teamId}`),
        {
          currentStall: "STALL01",
          status: "READY", // Synchronized with STALL01 status READY in Firestore
          updatedAt: Date.now(),
        }
      );
    }

    /*
    ---------------------------------
    4. Reset RTDB Event Status
    ---------------------------------
    */
    await set(
      ref(realtimeDB, "eventStatus"),
      {
        status: "READY",
        message: "Waiting for Super Admin",
        updatedAt: Date.now(),
      }
    );

    console.log("========================");
    console.log("Completed Successfully");
    console.log("========================");
  } catch (error) {
    console.error("========================");
    console.error("Initialization Error:", error);
    console.error("========================");
    process.exit(1);
  }
};

initializeEvent();
