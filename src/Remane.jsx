import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
// const auth = getAuth();

export default async function renameDocument() {
    // const user = auth.currentUser;
    // if (!user) return console.error("No user logged in");

    const oldDocRef = doc(db, "teams", "M9qElO0pVHRLav2QRUPvw3bd22G3M9qElO0pVHRLav2QRUPvw3bd22G3"); // e.g., "testing"
    const newDocRef = doc(db, "teams", "TEAM-I1UJ-650089"); // Your Auth UID

    const docSnap = await getDoc(oldDocRef);

    if (docSnap.exists()) {
        // 1. Create the new document with the same data
        await setDoc(newDocRef, docSnap.data());
        
        // 2. Delete the old document
        await deleteDoc(oldDocRef);
        
        console.log("Document successfully moved to:", user.uid);
    } else {
        console.log("No such document found!");
    }
}

// Call the function
// renameDocument("testing");