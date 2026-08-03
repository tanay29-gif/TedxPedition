import { useState } from "react";

export default function TypingGame({
    game,
    onComplete,
}) {

    const [answer, setAnswer] = useState("");

    const [error, setError] = useState("");

    if (!game) return null;

    const checkAnswer = () => {

        const userAnswer = answer.trim().toUpperCase();

        const correctAnswer = game.answer.trim().toUpperCase();

        if (userAnswer === correctAnswer) {

            onComplete({
                correct: true,
                score: game.maxScore,
                message: game.successMessage,
            });

            return;

        }

        setError(game.failureMessage);

    };

    return (

        <div className="game-card">

            <h2>{game.title}</h2>

            <p>{game.description}</p>

            <h1>{game.question}</h1>

            <input
                type="text"
                placeholder="Type Here"
                value={answer}
                onChange={(e) => {

                    setAnswer(e.target.value);

                    setError("");

                }}
            />

            <br />
            <br />

            <button onClick={checkAnswer}>

                Submit

            </button>

            {

                error && (

                    <p style={{ color: "red" }}>

                        {error}

                    </p>

                )

            }

        </div>

    );

}