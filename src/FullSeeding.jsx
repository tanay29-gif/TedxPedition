import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, realtimeDb } from "./firebase/firebase"; // adjust path

function randomScore() {
  return Math.floor(Math.random() * 21) + 80; // 80-100
}

function randomTime() {
  return Math.floor(Math.random() * 181) + 120; // 120-300 sec
}

export async function seedTreasureHunt() {
  try {
    const batch = writeBatch(db);

    // ------------------------------------------------
    // 1. CREATE STALLS
    // ------------------------------------------------
    const stalls = [
      { id: "1", name: "QR Challenge", type: "Offline", location: "Main Gate" },
      { id: "2", name: "Library Hunt", type: "Offline", location: "Library" },
      { id: "3", name: "Crossword", type: "Online", location: "Academic Block" },
      { id: "4", name: "Puzzle Box", type: "Offline", location: "Student Activity Center" },
      { id: "5", name: "Treasure Code", type: "Online", location: "Hostel Square" },
      { id: "6", name: "Final Vault", type: "Offline", location: "Auditorium" },
    ];

    stalls.forEach((stall, index) => {
      batch.set(doc(db, "stalls", stall.id), {
        stallId: Number(stall.id),
        name: stall.name,
        type: stall.type,
        maxScore: 100,
        order: index + 1,
        location: stall.location,
      });
    });

    // ------------------------------------------------
    // 2. CREATE HINTS
    // ------------------------------------------------
    const hints = [
      { id: "2", text: "Look near the library entrance." },
      { id: "4", text: "The answer is hidden where students gather after classes." },
      { id: "6", text: "The final clue is closer to the stage than the audience." },
    ];

    hints.forEach((hint) => {
      batch.set(doc(db, "hints", hint.id), {
        stallId: Number(hint.id),
        hintText: hint.text,
        coinCost: 1,
      });
    });

    // ------------------------------------------------
    // 3. FETCH ALL TEAMS
    // ------------------------------------------------
    const teamSnapshot = await getDocs(collection(db, "teams"));

    for (const teamDoc of teamSnapshot.docs) {
      const team = teamDoc.data();
      const teamId = team.teamId; // your document id is team name, but teamId field exists

      const score1 = randomScore();
      const score2 = randomScore();
      const time1 = randomTime();
      const time2 = randomTime();

      const totalScore = score1 + score2;
      const totalTime = time1 + time2;

      // -------- Stall 1 (Completed) --------
      batch.set(doc(db, "team_progress", teamId, "stalls", "1"), {
        startedAt: serverTimestamp(),
        endedAt: serverTimestamp(),
        timeTaken: time1,
        score: score1,
        completed: true,
        hintUsed: false,
        verifiedBy: "admin01",
      });

      // -------- Stall 2 (Completed) --------
      batch.set(doc(db, "team_progress", teamId, "stalls", "2"), {
        startedAt: serverTimestamp(),
        endedAt: serverTimestamp(),
        timeTaken: time2,
        score: score2,
        completed: true,
        hintUsed: Math.random() < 0.3,
        verifiedBy: "admin01",
      });

      // -------- Stall 3 (Current) --------
      batch.set(doc(db, "team_progress", teamId, "stalls", "3"), {
        startedAt: serverTimestamp(),
        endedAt: null,
        timeTaken: 0,
        score: 0,
        completed: false,
        hintUsed: false,
        verifiedBy: null,
      });

      // -------- Stall 4-6 (Pending) --------
      ["4", "5", "6"].forEach((stallId) => {
        batch.set(doc(db, "team_progress", teamId, "stalls", stallId), {
          startedAt: null,
          endedAt: null,
          timeTaken: 0,
          score: 0,
          completed: false,
          hintUsed: false,
          verifiedBy: null,
        });
      });

      // ------------------------------------------------
      // UPDATE TEAM STATUS
      // ------------------------------------------------
      batch.update(doc(db, "teams", teamDoc.id), {
        status: "IN_PROGRESS",
        currentStall: 3,
        startTime: serverTimestamp(),
        finishTime: null,
        totalScore,
        totalTime,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();

    console.log("✅ Treasure hunt data seeded successfully");
    return { success: true, message: "Seed completed" };
  } catch (error) {
    console.error("❌ Seed failed:", error);
    return { success: false, error: error.message };
  }
}


export const seedRealtimeDatabase = async () => {
  try {
    const teamsSnapshot = await getDocs(collection(db, "teams"));

    const leaderboard = {};

    teamsSnapshot.forEach((doc) => {
      const team = doc.data();

      leaderboard[team.teamId] = {
        teamName: team.teamName,
        totalScore: team.totalScore ?? 0,
        totalTime: team.totalTime ?? 0,
        currentStall: team.currentStall ?? 1,
      };
    });

    // Seed leaderboard
    await set(ref(realtimeDb, "leaderboard"), leaderboard);

    // Seed event status
    await set(ref(realtimeDb, "eventStatus"), {
      status: "STARTED",
    });

    console.log("✅ Realtime Database seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding Realtime Database:", error);
  }
};