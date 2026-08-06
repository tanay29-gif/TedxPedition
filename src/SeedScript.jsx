import { db, realtimeDb } from "./firebase/firebase.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  setDoc,
  Timestamp,
} from "firebase/firestore";

import {
  ref,
  set,
} from "firebase/database";

const STALLS = [
  {
    stallId: "STALL01",
    name: "QR Hunt",
    description: "Scan the QR code to receive the first clue.",
    location: "Academic Block",
    order: 1,
  },
  {
    stallId: "STALL02",
    name: "Crossword Challenge",
    description: "Complete the crossword puzzle.",
    location: "Library",
    order: 2,
  },
  {
    stallId: "STALL03",
    name: "Logic Puzzle",
    description: "Solve the logical reasoning puzzle.",
    location: "Lecture Hall",
    order: 3,
  },
  {
    stallId: "STALL04",
    name: "Treasure Decode",
    description: "Decode the encrypted clue.",
    location: "Sports Complex",
    order: 4,
  },
  {
    stallId: "STALL05",
    name: "Final Cipher",
    description: "Break the cipher to continue.",
    location: "Hostel Road",
    order: 5,
  },
  {
    stallId: "STALL06",
    name: "Rapid Fire",
    description: "Answer the rapid-fire questions.",
    location: "Student Activity Center",
    order: 6,
  },
  {
    stallId: "STALL07",
    name: "Final Stage",
    description: "Reach the auditorium and finish.",
    location: "Auditorium",
    order: 7,
  },
];

const HINTS = [
  {
    stallId: "STALL01",
    hintText: "Look near the notice board.",
  },
  {
    stallId: "STALL03",
    hintText: "Every clue has a pattern.",
  },
  {
    stallId: "STALL05",
    hintText: "The answer is hidden in plain sight.",
  },
];

const randomScore = () =>
  Math.floor(Math.random() * 21) + 80;

const randomTime = () =>
  Math.floor(Math.random() * 181) + 120;

export default async function seedDatabase() {
  try {
    console.log("Checking seed status...");

    const seedRef = doc(db, "seed", "initial");

    const seedSnapshot = await getDoc(seedRef);

    if (seedSnapshot.exists()) {
      console.log("Database already seeded.");
      return;
    }

    const batch = writeBatch(db);

    console.log("Creating stalls...");

    STALLS.forEach((stall) => {
      batch.set(
        doc(db, "stalls", stall.stallId),
        {
          ...stall,
        },
        { merge: true }
      );
    });

    console.log("Creating hints...");

    HINTS.forEach((hint) => {
      batch.set(
        doc(db, "hints", hint.stallId),
        hint,
        { merge: true }
      );
    });

    console.log("Creating event status...");

    batch.set(
      doc(db, "event_status", "current"),
      {
        status: "RUNNING",
        startedAt: Timestamp.now(),
        endedAt: null,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    console.log("Fetching teams...");

    const teamsSnapshot = await getDocs(
      collection(db, "teams")
    );

    if (teamsSnapshot.empty) {
      console.log("No teams found.");
      return;
    }

    // ===========================
    // PART 2 STARTS FROM HERE
    // ===========================
    //
    // For every team:
    // 1. Generate progress
    // 2. Update totals
    // 3. Update Firestore team
    // 4. Create leaderboard object
    // 5. Create activeTeams object
    // 6. Commit batch
    // 7. Mark seed complete
        const leaderboard = {};
    const activeTeams = {};

    for (const teamDoc of teamsSnapshot.docs) {
      const team = teamDoc.data();

      const score1 = randomScore();
      const score2 = randomScore();

      const time1 = randomTime();
      const time2 = randomTime();

      const totalScore = score1 + score2;
      const totalTime = time1 + time2;

      const now = Timestamp.now();

      const startTime = now;

      const stall1End = Timestamp.fromMillis(
        startTime.toMillis() + time1 * 1000
      );

      const stall2Start = stall1End;

      const stall2End = Timestamp.fromMillis(
        stall2Start.toMillis() + time2 * 1000
      );

      const stall3Start = stall2End;

      // -----------------------------
      // team_progress
      // -----------------------------

      batch.set(
        doc(db, "team_progress", team.teamId),
        {
          STALL01: {
            status: "COMPLETED",
            startedAt: startTime,
            endedAt: stall1End,
            timeTaken: time1,
            hintUsed: false,
            baseScore: 100,
            bonus: score1 - 100,
            penalty: 0,
            finalScore: score1,
            remarks: "Completed successfully",
            verifiedBy: "system",
            verifiedAt: stall1End,
          },

          STALL02: {
            status: "COMPLETED",
            startedAt: stall2Start,
            endedAt: stall2End,
            timeTaken: time2,
            hintUsed: false,
            baseScore: 100,
            bonus: score2 - 100,
            penalty: 0,
            finalScore: score2,
            remarks: "Completed successfully",
            verifiedBy: "system",
            verifiedAt: stall2End,
          },

          STALL03: {
            status: "PLAYING",
            startedAt: stall3Start,
            endedAt: null,
            timeTaken: 0,
            hintUsed: false,
            baseScore: 100,
            bonus: 0,
            penalty: 0,
            finalScore: 0,
            remarks: "",
            verifiedBy: null,
            verifiedAt: null,
          },

          STALL04: {
            status: "READY",
          },

          STALL05: {
            status: "READY",
          },

          STALL06: {
            status: "READY",
          },

          STALL07: {
            status: "READY",
          },
        },
        { merge: true }
      );

      // -----------------------------
      // Update Team
      // -----------------------------

      batch.update(doc(db, "teams", teamDoc.id), {
        coins: 3,
        currentStall: "STALL03",
        totalScore,
        totalTime,
        status: "IN_PROGRESS",
        startTime,
        finishTime: null,
        updatedAt: now,
      });

      // -----------------------------
      // Realtime Database
      // -----------------------------

      leaderboard[team.teamId] = {
        teamName: team.teamName,
        totalScore,
        totalTime,
        currentStall: "STALL03",
      };

      activeTeams[team.teamId] = {
        currentStall: "STALL03",
        status: "PLAYING",
        updatedAt: Date.now(),
      };
    }

    // -----------------------------
    // Commit Firestore
    // -----------------------------

    await batch.commit();

    // -----------------------------
    // Seed RTDB
    // -----------------------------

    await set(
      ref(realtimeDb, "leaderboard"),
      leaderboard
    );

    await set(
      ref(realtimeDb, "activeTeams"),
      activeTeams
    );

    // -----------------------------
    // Mark database seeded
    // -----------------------------

    await setDoc(seedRef, {
      completed: true,
      completedAt: Timestamp.now(),
    });

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error(error);
  }
}