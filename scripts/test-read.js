import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseNode.js";

async function testRead() {
  console.log("Testing Firestore collection read...");
  try {
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    console.log(`Snapshot empty: ${teamsSnapshot.empty}`);
    console.log(`Document count: ${teamsSnapshot.size}`);
    teamsSnapshot.forEach(doc => {
      console.log(`Found Team ID: ${doc.id}, Data:`, doc.data());
    });
  } catch (error) {
    console.error("Read error:", error);
  }
}

testRead();
