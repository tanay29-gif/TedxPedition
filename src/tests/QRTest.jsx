import { useState } from "react";

import {
    getQRWord
} from "../services/firestore/qr";

function QRTest() {

    const [qrId, setQrId] = useState("QR001");

    const [result, setResult] = useState(null);

    //------------------------------------------

    const handleGetQR = async () => {

        try {

            const data = await getQRWord(qrId);

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //------------------------------------------

    return (

        <div style={{ padding: 20 }}>

            <h1>QR Test</h1>

            <hr />

            <input

                value={qrId}

                onChange={(e) =>
                    setQrId(e.target.value)
                }

                placeholder="QR001"

            />

            <button onClick={handleGetQR}>

                Get QR Data

            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default QRTest;