import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase/firebase.js";

const adminCollection = "admin_users";

/**
 * Normalizes email address to trimmed lowercase.
 */
const normalizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : "";
};

/**
 * Creates a new admin user in the admin_users collection.
 * Uses email as the document ID.
 */
export const createAdmin = async ({ name, email, role, stallAssigned }) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.endsWith("@iitgn.ac.in")) {
    return {
      success: false,
      message: "Invalid email. Only IIT Gandhinagar accounts (@iitgn.ac.in) are allowed."
    };
  }

  if (!name || !name.trim()) {
    return {
      success: false,
      message: "Name is required."
    };
  }

  try {
    const docRef = doc(db, adminCollection, cleanEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: false,
        message: "Admin with this email already exists."
      };
    }

    // Map roles to database values
    const dbRole = (role === "Super Admin" || role === "super_admin") ? "super_admin" : "stall_admin";

    // Map stall assigned (e.g., number 1-7 or "STALL01" to standard STALL0X format)
    let dbStall = "All";
    if (dbRole === "stall_admin") {
      if (typeof stallAssigned === "string" && stallAssigned.startsWith("STALL")) {
        dbStall = stallAssigned;
      } else {
        const stallNum = parseInt(stallAssigned, 10);
        if (isNaN(stallNum) || stallNum < 1 || stallNum > 7) {
          return {
            success: false,
            message: "Assigned stall must be between 1 and 7."
          };
        }
        dbStall = `STALL0${stallNum}`;
      }
    }

    await setDoc(docRef, {
      name: name.trim(),
      email: cleanEmail,
      role: dbRole,
      stallAssigned: dbStall,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: "Admin created successfully."
    };
  } catch (error) {
    console.error("Error creating admin:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating the admin."
    };
  }
};

/**
 * Gets admin details by their email address.
 */
export const getAdminByEmail = async (email) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;

  try {
    const docRef = doc(db, adminCollection, cleanEmail);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error("Error getting admin by email:", error);
    throw error;
  }
};

/**
 * Gets all admin documents.
 */
export const getAllAdmins = async () => {
  try {
    const snapshot = await getDocs(collection(db, adminCollection));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting all admins:", error);
    throw error;
  }
};

/**
 * Updates an admin document.
 */
export const updateAdmin = async (email, { name, role, stallAssigned, active }) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) {
    return { success: false, message: "Email is required." };
  }

  try {
    const docRef = doc(db, adminCollection, cleanEmail);
    const updateData = {
      updatedAt: serverTimestamp()
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (role !== undefined) {
      updateData.role = (role === "Super Admin" || role === "super_admin") ? "super_admin" : "stall_admin";
    }

    if (stallAssigned !== undefined) {
      if (updateData.role === "super_admin" || role === "Super Admin" || role === "super_admin") {
        updateData.stallAssigned = "All";
      } else {
        if (typeof stallAssigned === "string" && stallAssigned.startsWith("STALL")) {
          updateData.stallAssigned = stallAssigned;
        } else {
          const stallNum = parseInt(stallAssigned, 10);
          if (!isNaN(stallNum) && stallNum >= 1 && stallNum <= 7) {
            updateData.stallAssigned = `STALL0${stallNum}`;
          }
        }
      }
    }

    if (active !== undefined) {
      updateData.active = !!active;
    }

    await updateDoc(docRef, updateData);

    return {
      success: true,
      message: "Admin updated successfully."
    };
  } catch (error) {
    console.error("Error updating admin:", error);
    return {
      success: false,
      message: error.message || "An error occurred while updating the admin."
    };
  }
};

/**
 * Soft deletes an admin by setting active to false.
 */
export const disableAdmin = async (email) => {
  return await updateAdmin(email, { active: false });
};

/**
 * Set up real-time listener for the admin list.
 */
export const subscribeAdmins = (callback) => {
  const q = collection(db, adminCollection);
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(list);
  }, (error) => {
    console.error("Error subscribing to admins:", error);
  });
};
