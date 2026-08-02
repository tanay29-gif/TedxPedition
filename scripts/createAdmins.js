import { doc, writeBatch } from "firebase/firestore";
import { db } from "./firebaseNode.js";

const ADMINS = [
  {
    uid: "test_admin_uid",
    name: "Event Administrator",
    role: "Stall Admin",
    stallAssigned: 1
  }
];

const seedAdmins = async () => {
  console.log("========================");
  console.log("Creating Admins");
  console.log("========================");

  try {
    const batch = writeBatch(db);

    for (const admin of ADMINS) {
      console.log(`Creating Admin: ${admin.name} (${admin.uid})`);
      // Use uid as the document ID in admin_users collection
      const adminRef = doc(db, "admin_users", admin.uid);
      batch.set(adminRef, admin, { merge: true });
    }

    await batch.commit();

    console.log("========================");
    console.log("Completed Successfully");
    console.log("========================");
  } catch (error) {
    console.error("========================");
    console.error("Error creating admins:", error);
    console.error("========================");
    process.exit(1);
  }
};

seedAdmins();
