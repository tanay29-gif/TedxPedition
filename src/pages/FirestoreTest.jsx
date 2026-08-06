import { useState } from "react";

import { signInGoogle } from "../services/auth";

import {
    getTeamByLeaderEmail,
    updateTeam
} from "../services/firestore/teams";

function FirestoreTest() {

    const [user, setUser] = useState(null);

    const [team, setTeam] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    //-----------------------------------------
    // Google Login
    //-----------------------------------------

    const handleLogin = async () => {

        setLoading(true);

        setError("");

        try {

            const loggedUser = await signInGoogle();

            setUser(loggedUser);

            console.log(loggedUser);

        }

        catch (error) {

            console.error(error);

            setError(error.message);

        }

        finally {

            setLoading(false);

        }

    };

    //-----------------------------------------
    // Fetch Team
    //-----------------------------------------

    const fetchTeam = async () => {

        if (!user) {

            alert("Please Login First");

            return;

        }

        setLoading(true);

        try {

            const teamData = await getTeamByLeaderEmail(user.email);

            if (!teamData) {

                alert("No Team Found");

                return;

            }

            console.log(teamData);

            setTeam(teamData);

        }

        catch (error) {

            console.error(error);

            setError(error.message);

        }

        finally {

            setLoading(false);

        }

    };

    //-----------------------------------------
    // Update Coins
    //-----------------------------------------

    const increaseCoins = async () => {

        if (!team) {

            alert("Load Team First");

            return;

        }

        try {

            const newCoins = team.coins + 1;

            await updateTeam(team.id, {

                coins: newCoins

            });

            setTeam({

                ...team,

                coins: newCoins

            });

            alert("Coins Updated");

        }

        catch (error) {

            console.error(error);

        }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h1>Firestore Test</h1>

            <hr />

            <button onClick={handleLogin}>

                Google Login

            </button>

            <br />

            <br />

            <button onClick={fetchTeam}>

                Fetch Team

            </button>

            <br />

            <br />

            <button onClick={increaseCoins}>

                Increase Coins

            </button>

            <hr />

            {
                loading &&

                <h3>Loading...</h3>
            }

            {
                error &&

                <h3>{error}</h3>
            }

            {
                user &&

                <div>

                    <h2>User</h2>

                    <p>Name : {user.displayName}</p>

                    <p>Email : {user.email}</p>

                </div>
            }

            <hr />

            {
                team &&

                <div>

                    <h2>Team Details</h2>

                    <p>Team ID : {team.teamId}</p>

                    <p>Team Name : {team.teamName}</p>

                    <p>Coins : {team.coins}</p>

                    <p>Status : {team.status}</p>

                    <p>Current Stall : {team.currentStall}</p>

                    <p>Total Score : {team.totalScore}</p>

                    <p>Total Time : {team.totalTime}</p>

                    <hr />

                    <h3>Leader</h3>

                    <p>Name : {team.member[0]}</p>

                    <p>Email : {team.leaderEmail}</p>

                    <p>Phone : {team.leader.phone}</p>

                </div>
            }

        </div>

    );

}

export default FirestoreTest;