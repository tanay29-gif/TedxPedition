import { useState } from "react";

import {
    getActiveTeam,
    getActiveTeams,
    updateActiveTeam
} from "../services/realtime/activeTeams";

function ActiveTeamTest() {

    const [teamId, setTeamId] = useState("");

    const [stall, setStall] = useState(1);

    const [status, setStatus] = useState("PLAYING");

    const [result, setResult] = useState(null);

    //------------------------------------------

    const handleGetAll = async () => {

        try {

            const data = await getActiveTeams();

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //------------------------------------------

    const handleGetTeam = async () => {

        try {

            const data = await getActiveTeam(teamId);

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //------------------------------------------

    const handleUpdate = async () => {

        try {

            await updateActiveTeam(teamId, {

                currentStall: Number(stall),

                status

            });

            alert("Active Team Updated");

        }

        catch (error) {

            console.error(error);

        }

    };

    //------------------------------------------

    return (

        <div style={{ padding: 20 }}>

            <h1>Active Team Test</h1>

            <hr />

            <button onClick={handleGetAll}>

                Get All Active Teams

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

                Get Active Team

            </button>

            <hr />

            <input

                type="number"

                placeholder="Current Stall"

                value={stall}

                onChange={(e) =>
                    setStall(e.target.value)
                }

            />

            <input

                placeholder="Status"

                value={status}

                onChange={(e) =>
                    setStatus(e.target.value)
                }

            />

            <button onClick={handleUpdate}>

                Update Active Team

            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default ActiveTeamTest;