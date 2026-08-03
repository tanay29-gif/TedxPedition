import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebaseNode.js";

const TEAMS = [
  {
    teamId: "TEAM001",
    teamName: "Alpha Geeks",
    leader: {
      name: "Tanay Leader",
      email: "tanay.test@example.com"
    },
    members: [
      { name: "John Member", email: "john@example.com" },
      { name: "Alice Member", email: "alice@example.com" }
    ],
    coins: 5,
    currentStall: "STALL01",
    totalScore: 0,
    totalTime: 0,
    status: "READY",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    teamId: "TEAM002",
    teamName: "Beta Hackers",
    leader: {
      name: "Bob Leader",
      email: "bob.test@example.com"
    },
    members: [
      { name: "Charlie Member", email: "charlie@example.com" }
    ],
    coins: 5,
    currentStall: "STALL01",
    totalScore: 0,
    totalTime: 0,
    status: "READY",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const seedTeams = async () => {
  console.log("========================");
  console.log("Creating Teams");
  console.log("========================");

  try {
    const batch = writeBatch(db);

    for (const team of TEAMS) {
      console.log(`Creating ${team.teamId}`);
      const teamRef = doc(db, "teams", team.teamId);
      batch.set(teamRef, team, { merge: true });
    }

    await batch.commit();

    console.log("========================");
    console.log("Completed Successfully");
    console.log("========================");
  } catch (error) {
    console.error("========================");
    console.error("Error creating teams:", error);
    console.error("========================");
    process.exit(1);
  }
};

seedTeams();
