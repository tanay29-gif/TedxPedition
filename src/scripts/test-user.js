import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseNode.js"; // or "./firebase.js"

async function createUser() {
  try {
    await setDoc(doc(db, "users", "USER001"), {
      name: "John Doe",
      age: 21,
    });

    console.log(" User created successfully!");
  } catch (error) {
    console.error(" Error:", error);
  }
}

await createUser();