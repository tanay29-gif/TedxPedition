import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase/firebase.js";

const eventDocRef = doc(db, "event_status", "current");

/**
 * Starts the event. Sets status to RUNNING.
 */
// export const startEvent = async () => {
//   try {
//     await setDoc(eventDocRef, {
//       status: "RUNNING",
//       startedAt: serverTimestamp(),
//       endedAt: null,
//       updatedAt: serverTimestamp()
//     }, { merge: true });
//     return { success: true };
//   } catch (error) {
//     console.error("Error starting event:", error);
//     throw error;
//   }
// };

/**
 * Ends the event. Sets status to ENDED.
 */
export const endEvent = async () => {
  try {
    await updateDoc(eventDocRef, {
      status: "ENDED",
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error ending event:", error);
    throw error;
  }
};

/**
 * Gets the current event status.
 */
export const getEventStatus = async () => {
  try {
    const docSnap = await getDoc(eventDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return { status: "READY", startedAt: null, endedAt: null };
  } catch (error) {
    console.error("Error getting event status:", error);
    throw error;
  }
};

/**
 * Subscribes to event status changes in real-time.
 * If no state is present, defaults to READY.
 */
export const subscribeEventStatus = (callback) => {
  return onSnapshot(eventDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback({ status: "READY", startedAt: null, endedAt: null });
    }
  }, (error) => {
    console.error("Error subscribing to event status:", error);
  });
};
