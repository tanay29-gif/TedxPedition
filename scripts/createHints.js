import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebaseNode.js";

const HINTS = [
  {
    stallId: "STALL01",
    coinCost: 1,
    hintText: "Try solving the addition one number at a time."
  },
  {
    stallId: "STALL02",
    coinCost: 1,
    hintText: "The word starts with the letter 'T'."
  },
  {
    stallId: "STALL03",
    coinCost: 1,
    hintText: "Look behind the main banner."
  },
  {
    stallId: "STALL04",
    coinCost: 1,
    hintText: "Think about the theme of TEDx."
  },
  {
    stallId: "STALL05",
    coinCost: 1,
    hintText: "Keep your balance steady."
  },
  {
    stallId: "STALL06",
    coinCost: 1,
    hintText: "Answer as fast as possible."
  },
  {
    stallId: "STALL07",
    coinCost: 1,
    hintText: "Search near the entrance of Jasubhai Auditorium."
  }
];

const seedHints = async () => {
  console.log("========================");
  console.log("Creating Hints");
  console.log("========================");

  try {
    const batch = writeBatch(db);

    for (const hint of HINTS) {
      console.log(`Creating ${hint.stallId}`);
      const hintRef = doc(db, "hints", hint.stallId);
      batch.set(hintRef, hint, { merge: true });
    }

    await batch.commit();

    console.log("========================");
    console.log("Completed Successfully");
    console.log("========================");
  } catch (error) {
    console.error("========================");
    console.error("Error creating hints:", error);
    console.error("========================");
    process.exit(1);
  }
};

seedHints();
