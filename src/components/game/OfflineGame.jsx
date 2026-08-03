export default function OfflineGame({
    game,
    onComplete,
}) {

    if (!game) return null;

    const finishChallenge = () => {

        onComplete({
            correct: true,
            score: game.maxScore,
            message: game.successMessage,
        });

    };

    return (

        <div className="game-card">

            <h2>{game.title}</h2>

            <p>{game.description}</p>

            <p>

                {game.instruction}

            </p>

            <button
                onClick={finishChallenge}
            >

                Finish Challenge

            </button>

        </div>

    );

}