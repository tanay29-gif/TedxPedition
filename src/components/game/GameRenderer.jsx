import AdditionGame from "./AdditionGame";
import BlocklyGame from "./BlocklyGame";
import OfflineGame from "./OfflineGame";
import TypingGame from "./TypingGame";

const GameRenderer = ({
    game,
    stallNum,
    onComplete,
    success,
    setSuccess,
    error,
    setError,
}) => {

    if (!game && stallNum === 1) {
        return (
            <BlocklyGame
                success={success}
                setSuccess={setSuccess}
                error={error}
                setError={setError}
                onComplete={onComplete}
            />
        );
    }

    if (!game) {
        return (
            <div className="game-loading">
                Loading Game...
            </div>
        );
    }

    switch (game.type) {

        case "addition":
            return (
                <AdditionGame
                    game={game}
                    onComplete={onComplete}
                />
            );

        case "word":
            return (
                <TypingGame
                    game={game}
                    onComplete={onComplete}
                />
            );

        case "offline":
            return (
                <OfflineGame
                    game={game}
                    onComplete={onComplete}
                />
            );

        default:
            return (
                <div className="unknown-game">
                    <h2>
                        Unsupported Game Type
                    </h2>
                    <p>
                        Game type "{game.type}" is not supported.
                    </p>
                </div>
            );
    }
};

export default GameRenderer;