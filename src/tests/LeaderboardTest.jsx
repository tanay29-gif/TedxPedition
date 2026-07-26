import { useState } from "react";

import {
    getLeaderboard,
    getTeamLeaderboard,
    updateLeaderboard
} from "../services/realtime/leaderboard";

function LeaderboardTest() {

    const [teamId, setTeamId] = useState("");

    const [score, setScore] = useState(0);

    const [coins, setCoins] = useState(0);

    const [result, setResult] = useState(null);

    //-----------------------------------------

    const handleGetLeaderboard = async () => {

        try {

            const data = await getLeaderboard();

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //-----------------------------------------

    const handleGetTeam = async () => {

        try {

            const data = await getTeamLeaderboard(teamId);

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //-----------------------------------------

    const handleUpdate = async () => {

        try {

            await updateLeaderboard(teamId, {

                score: Number(score),

                coins: Number(coins)

            });

            alert("Leaderboard Updated");

        }

        catch (error) {

            console.error(error);

        }

    };

    //-----------------------------------------

    return (

        <div style={{ padding: 20 }}>

            <h1>Leaderboard Test</h1>

            <hr />

            <button onClick={handleGetLeaderboard}>

                Get Leaderboard

            </button>

            <hr />

            <input

                placeholder="Team ID"

                value={teamId}

                onChange={(e) =>
                    setTeamId(e.target.value)
                }

            />

            <button onClick={handleGetTeam}>

                Get Team

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

            <input

                type="number"

                placeholder="Coins"

                value={coins}

                onChange={(e) =>
                    setCoins(e.target.value)
                }

            />

            <button onClick={handleUpdate}>

                Update Leaderboard

            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default LeaderboardTest;