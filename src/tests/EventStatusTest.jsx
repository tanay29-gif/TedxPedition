import { useState } from "react";

import {
    getEventStatus,
    updateEventStatus
} from "../services/realtime/eventStatus";

function EventStatusTest() {

    const [status, setStatus] = useState("RUNNING");

    const [result, setResult] = useState(null);

    //------------------------------------------

    const handleGetStatus = async () => {

        try {

            const data = await getEventStatus();

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //------------------------------------------

    const handleUpdateStatus = async () => {

        try {

            await updateEventStatus({

                status

            });

            alert("Event Status Updated");

        }

        catch (error) {

            console.error(error);

        }

    };

    //------------------------------------------

    return (

        <div style={{ padding: 20 }}>

            <h1>Event Status Test</h1>

            <hr />

            <button onClick={handleGetStatus}>

                Get Event Status

            </button>

            <hr />

            <input

                value={status}

                onChange={(e) =>
                    setStatus(e.target.value)
                }

                placeholder="RUNNING"

            />

            <button onClick={handleUpdateStatus}>

                Update Event Status

            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default EventStatusTest;