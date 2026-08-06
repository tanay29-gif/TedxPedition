import { useEffect, useState } from "react";

import { loadGame } from "../../services/games/gameLoader";

import GameRenderer from "./GameRenderer";

const GameContainer = ({
    stallId,
    onComplete,
    ...rest
}) => {

    const [game, setGame] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        const fetchGame = async () => {

            try {

                setLoading(true);

                console.log("Loading game for stallId:", stallId);
                const gameData = await loadGame(stallId);

                if (!gameData) {

                    setError("Unable to load game.");

                    return;

                }

                setGame(gameData);

            }

            catch (err) {

                console.error(err);

                setError("Something went wrong.");

            }

            finally {

                setLoading(false);

            }

        };

        if (stallId) {

            fetchGame();

        }

    }, [stallId]);

    if (loading) {

        return (

            <div className="game-loading">

                Loading Game...

            </div>

        );

    }

    if (error) {

        return (

            <div className="game-error">

                {error}

            </div>

        );

    }

    return (

        <GameRenderer
            game={game}
            onComplete={onComplete}
            {...rest}
        />

    );

};

export default GameContainer;