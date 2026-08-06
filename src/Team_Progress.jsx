import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase/firebase"; // Change the path if needed

export default function UploadTeamProgress() {
  const uploadData = async () => {
    try {
      await setDoc(doc(db, "team_progress", "TEAM-I1UJ-650089"), {
        STALL01: {
          baseScore: 100,
          bonus: -4,
          endedAt: Timestamp.fromDate(new Date("2026-08-03T16:58:06+05:30")),
          finalScore: 96,
          hintUsed: false,
          penalty: 0,
          remarks: "Completed successfully",
          startedAt: Timestamp.fromDate(new Date("2026-08-03T16:53:15+05:30")),
          status: "COMPLETED",
          timeTaken: 291,
          verifiedAt: Timestamp.fromDate(new Date("2026-08-03T16:58:06+05:30")),
          verifiedBy: "system",
        },

        STALL02: {
          baseScore: 100,
          bonus: -8,
          endedAt: Timestamp.fromDate(new Date("2026-08-03T17:02:13+05:30")),
          finalScore: 92,
          hintUsed: false,
          penalty: 0,
          remarks: "Completed successfully",
          startedAt: Timestamp.fromDate(new Date("2026-08-03T16:58:06+05:30")),
          status: "COMPLETED",
          timeTaken: 247,
          verifiedAt: Timestamp.fromDate(new Date("2026-08-03T17:02:13+05:30")),
          verifiedBy: "system",
        },

        STALL03: {
          baseScore: 100,
          bonus: 0,
          endedAt: Timestamp.fromDate(new Date("2026-08-03T17:04:26+05:30")),
          finalScore: 0,
          hintUsed: false,
          penalty: 0,
          remarks: "",
          startedAt: Timestamp.fromDate(new Date("2026-08-03T17:02:13+05:30")),
          status: "VERIFYING",
          timeTaken: 134,
          verifiedAt: null,
          verifiedBy: null,
        },

        STALL04: {
          status: "READY",
        },

        STALL05: {
          status: "READY",
        },

        STALL06: {
          status: "READY",
        },

        STALL07: {
          status: "READY",
        },
      });

      alert("Successfully added TEAM-I1UJ-650089!");
      console.log("Upload complete");
    } catch (err) {
      console.error(err);
      alert("Error uploading data");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <button
        onClick={uploadData}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Upload Team Progress
      </button>
    </div>
  );
}