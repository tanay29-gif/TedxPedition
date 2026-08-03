import { useState } from "react";

import {
    getTeamById,
    getTeamByLeaderEmail,
    updateCoins,
    updateCurrentStall,
    updateScore
} from "../services/firestore/teams";

function TeamTest() {

    const [email, setEmail] = useState("");
    const [teamId, setTeamId] = useState("");
    const [coins, setCoins] = useState("");
    const [score, setScore] = useState("");
    const [stall, setStall] = useState("");

    const [result, setResult] = useState(null);

    // ------------------------------

    const handleGetByEmail = async () => {

        try {

            const data = await getTeamByLeaderEmail(email);

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    // ------------------------------

    const handleGetById = async () => {

        try {

            const data = await getTeamById(teamId);

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    // ------------------------------

    const handleUpdateCoins = async () => {

        try {

            await updateCoins(teamId, Number(coins));

            alert("Coins Updated");

        }

        catch (error) {

            console.error(error);

        }

    };

    // ------------------------------

    const handleUpdateScore = async () => {

        try {

            await updateScore(teamId, Number(score));

            alert("Score Updated");

        }

        catch (error) {

            console.error(error);

        }

    };

    // ------------------------------

    const handleUpdateStall = async () => {

        try {

            await updateCurrentStall(teamId, Number(stall));

            alert("Current Stall Updated");

        }

        catch (error) {

            console.error(error);

        }

    };

    // ------------------------------

    return (

        <div style={{ padding: "20px" }}>

            <h1>Team Service Test</h1>

            <hr />

            <h3>Get Team By Leader Email</h3>

            <input
                type="text"
                placeholder="Leader Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={handleGetByEmail}>
                Get Team
            </button>

            <hr />

            <h3>Get Team By Team ID</h3>

            <input
                type="text"
                placeholder="TEAM001"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
            />

            <button onClick={handleGetById}>
                Get Team
            </button>

            <hr />

            <h3>Update Coins</h3>

            <input
                type="number"
                placeholder="Coins"
                value={coins}
                onChange={(e) => setCoins(e.target.value)}
            />

            <button onClick={handleUpdateCoins}>
                Update Coins
            </button>

            <hr />

            <h3>Update Score</h3>

            <input
                type="number"
                placeholder="Score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
            />

            <button onClick={handleUpdateScore}>
                Update Score
            </button>

            <hr />

            <h3>Update Current Stall</h3>

            <input
                type="number"
                placeholder="Current Stall"
                value={stall}
                onChange={(e) => setStall(e.target.value)}
            />

            <button onClick={handleUpdateStall}>
                Update Stall
            </button>

            <hr />

            <h2>Output</h2>

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default TeamTest;    