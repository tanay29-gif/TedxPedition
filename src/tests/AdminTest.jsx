
import { useState } from "react";

import {
    getAdminByUID
} from "../services/firestore/admin";

function AdminTest() {

    const [uid, setUid] = useState("");

    const [result, setResult] = useState(null);

    //---------------------------------------

    const handleGetAdmin = async () => {

        try {

            const data = await getAdminByUID(uid);

            setResult(data);

        }

        catch (error) {

            console.error(error);

        }

    };

    //---------------------------------------

    return (

        <div style={{ padding: 20 }}>

            <h1>Admin Test</h1>

            <hr />

            <input

                type="text"

                placeholder="Firebase UID"

                value={uid}

                onChange={(e) =>
                    setUid(e.target.value)
                }

            />

            <button onClick={handleGetAdmin}>

                Get Admin

            </button>

            <hr />

            <pre>

                {JSON.stringify(result, null, 2)}

            </pre>

        </div>

    );

}

export default AdminTest;