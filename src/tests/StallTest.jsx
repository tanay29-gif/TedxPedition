import { useState } from "react";

import {
    getAllStalls,
    getNextStall,
    getStallById,
    getStallByOrder
} from "../services/firestore/stalls";

function StallTest() {

    const [stallId, setStallId] = useState("STALL01");
    const [order, setOrder] = useState(1);

    const [result, setResult] = useState(null);

    //-----------------------------------------

    const handleGetAll = async () => {

        const data = await getAllStalls();

        setResult(data);

    };

    //-----------------------------------------

    const handleGetById = async () => {

        const data = await getStallById(stallId);

        setResult(data);

    };

    //-----------------------------------------

    const handleGetByOrder = async () => {

        const data = await getStallByOrder(
            Number(order)
        );

        setResult(data);

    };

    //-----------------------------------------

    const handleNextStall = async () => {

        const data = await getNextStall(
            Number(order)
        );

        setResult(data);

    };

    //-----------------------------------------

    return (

        <div style={{ padding: 20 }}>

            <h1>Stall Test</h1>

            <hr />

            <button onClick={handleGetAll}>
                Get All Stalls
            </button>

            <hr />

            <input

                value={stallId}

                onChange={(e) =>
                    setStallId(e.target.value)
                }

                placeholder="STALL01"

            />

            <button onClick={handleGetById}>

                Get Stall By ID

            </button>

            <hr />

            <input

                type="number"

                value={order}

                onChange={(e) =>
                    setOrder(e.target.value)
                }

            />

            <button onClick={handleGetByOrder}>

                Get Stall By Order

            </button>

            <button onClick={handleNextStall}>

                Get Next Stall

            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default StallTest;