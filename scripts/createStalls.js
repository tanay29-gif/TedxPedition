import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebaseNode.js";

const STALLS = [
  {
    stallId: "STALL01",
    name: "Blockly Coding Challenge",
    location: "Innovation Center",
    type: "interactive",
    gameType: "addition",
    order: 1,
    maxScore: 100
  },
  {
    stallId: "STALL02",
    name: "TED Talk QR Slogan Puzzle",
    location: "Campus Banners",
    type: "interactive",
    gameType: "word",
    order: 2,
    maxScore: 100
  },
  {
    stallId: "STALL03",
    name: "Offline Puzzle Station",
    location: "Main Lawn",
    type: "offline",
    gameType: "offline",
    order: 3,
    maxScore: 100
  },
  {
    stallId: "STALL04",
    name: "Offline Quiz Challenge",
    location: "Seminar Hall",
    type: "offline",
    gameType: "offline",
    order: 4,
    maxScore: 100
  },
  {
    stallId: "STALL05",
    name: "Physical Coordination Test",
    location: "Sports Complex",
    type: "offline",
    gameType: "offline",
    order: 5,
    maxScore: 100
  },
  {
    stallId: "STALL06",
    name: "Speed Trivia Challenge",
    location: "Cafeteria Area",
    type: "offline",
    gameType: "offline",
    order: 6,
    maxScore: 100
  },
  {
    stallId: "STALL07",
    name: "Final Location Hunt",
    location: "Jasubhai Auditorium",
    type: "final",
    gameType: "final",
    order: 7,
    maxScore: 100
  }
];

const seedStalls = async () => {
  console.log("========================");
  console.log("Creating Stalls");
  console.log("========================");

  try {
    const batch = writeBatch(db);

    for (const stall of STALLS) {
      console.log(`Creating ${stall.stallId}`);
      const stallRef = doc(db, "stalls", stall.stallId);
      batch.set(stallRef, stall, { merge: true });
    }

    await batch.commit();

    console.log("========================");
    console.log("Completed Successfully");
    console.log("========================");
  } catch (error) {
    console.error("========================");
    console.error("Error creating stalls:", error);
    console.error("========================");
    process.exit(1);
  }
};

seedStalls();
