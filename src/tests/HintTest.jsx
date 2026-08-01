import { useState } from "react";

import {
    getHint
} from "../services/firestore/hints";

function HintTest() {

    const [stallId, setStallId] = useState("STALL01");

    const [result, setResult] = useState(null);

    //------------------------------------------

    const handleGetHint = async () => {

        try {

            const data = await getHint(stallId);

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //------------------------------------------

    return (

        <div style={{ padding: 20 }}>

            <h1>Hint Test</h1>

            <hr />

            <input

                value={stallId}

                onChange={(e) =>
                    setStallId(e.target.value)
                }

                placeholder="STALL01"

            />

            <button onClick={handleGetHint}>

                Get Hint

            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default HintTest;