import { useState } from "react";

import {
    completeStall,
    finishStall,
    getProgress,
    getStallProgress,
    markHintUsed,
    startStall,
    updateStallScore,
    updateTimeTaken,
    verifyStall
} from "../services/firestore/progress";

function ProgressTest() {

    const [teamId, setTeamId] = useState("TEAM001");
    const [stall, setStall] = useState("stall1");
    const [score, setScore] = useState("");

    const [result, setResult] = useState(null);

    // -----------------------------

    const handleGetProgress = async () => {

        const data = await getProgress(teamId);

        setResult(data);

    };

    // -----------------------------

    const handleGetStallProgress = async () => {

        const data = await getStallProgress(teamId, stall);

        setResult(data);

    };

    // -----------------------------

    const handleStartStall = async () => {

        await startStall(teamId, stall);

        alert("Stall Started");

    };

    // -----------------------------

    const handleFinishStall = async () => {

        await finishStall(teamId, stall);

        alert("Stall Finished");

    };

    // -----------------------------

    const handleCompleteStall = async () => {

        await completeStall(teamId, stall);

        alert("Completed");

    };

    // -----------------------------

    const handleUpdateScore = async () => {

        await updateStallScore(
            teamId,
            stall,
            Number(score)
        );

        alert("Score Updated");

    };

    // -----------------------------

    const handleUseHint = async () => {

        await markHintUsed(teamId, stall);

        alert("Hint Used");

    };

    // -----------------------------

    const handleVerify = async () => {

        await verifyStall(teamId, stall);

        alert("Verified");

    };

    // -----------------------------

    const handleUpdateTime = async () => {

        await updateTimeTaken(teamId, stall);

        alert("Time Updated");

    };

    return (

        <div style={{ padding: 20 }}>

            <h1>Progress Test</h1>

            <hr />

            <input
                value={teamId}
                onChange={(e) =>
                    setTeamId(e.target.value)
                }
                placeholder="TEAM001"
            />

            <input
                value={stall}
                onChange={(e) =>
                    setStall(e.target.value)
                }
                placeholder="stall1"
            />

            <button onClick={handleGetProgress}>
                Get Progress
            </button>

            <button onClick={handleGetStallProgress}>
                Get Stall
            </button>

            <hr />

            <button onClick={handleStartStall}>
                Start Stall
            </button>

            <button onClick={handleFinishStall}>
                Finish Stall
            </button>

            <button onClick={handleCompleteStall}>
                Complete Stall
            </button>

            <button onClick={handleUseHint}>
                Use Hint
            </button>

            <button onClick={handleVerify}>
                Verify
            </button>

            <button onClick={handleUpdateTime}>
                Update Time
            </button>

            <hr />

            <input
                type="number"
                placeholder="Score"
                value={score}
                onChange={(e) =>
                    setScore(e.target.value)
                }
            />

            <button onClick={handleUpdateScore}>
                Update Score
            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default ProgressTest;