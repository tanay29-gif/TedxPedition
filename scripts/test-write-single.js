import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseNode.js";

async function testWriteSingle() {
  console.log("Writing single team doc...");
  try {
    const teamRef = doc(db, "teams", "TEAM001");
    await setDoc(teamRef, {
      teamId: "TEAM001",
      teamName: "Alpha Geeks",
      leader: {
        name: "Tanay Leader",
        email: "tanay.test@example.com"
      },
      members: [],
      coins: 5,
      currentStall: "STALL01",
      totalScore: 0,
      totalTime: 0
    });
    console.log("Document set successfully. Now reading it back...");
    const snap = await getDoc(teamRef);
    if (snap.exists()) {
      console.log("Read success:", snap.data());
    } else {
      console.log("Read failed: Document does not exist!");
    }
  } catch (error) {
    console.error("Write/Read Error:", error);
  }
}

testWriteSingle();
