import { useState } from "react";

export default function AdditionGame({
    game,
    onComplete
}) {

    const [answer, setAnswer] = useState("");

    const [error, setError] = useState("");

    if (!game) return null;

    const checkAnswer = () => {

        const userAnswer = Number(answer);

        if (userAnswer === game.answer) {

            onComplete({
    correct: true,
    score: game.maxScore,
    message: game.successMessage,
});

        }

        else {

            setError(game.failureMessage);

        }

    };

    return (

        <div className="game-card">

            <h2>{game.title}</h2>

            <p>{game.description}</p>

           <h1>{game.question}</h1>

            <input

                type="number"

                placeholder="Enter Answer"

                value={answer}

                onChange={(e) => {

                    setAnswer(e.target.value);

                    setError("");

                }}

            />

            <br /><br />

            <button
                onClick={checkAnswer}
            >

                Submit

            </button>

            {

                error &&

                <p style={{ color: "red" }}>

                    {error}

                </p>

            }

        </div>

    );

}