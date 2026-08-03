import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function getAdmin(adminId) {
    const docRef = doc(db, "admin_users", adminId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return snapshot.data();
    }

    return null;
}