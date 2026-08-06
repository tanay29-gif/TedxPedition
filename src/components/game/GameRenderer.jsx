import AdditionGame from "./AdditionGame";
import BlocklyGame from "./BlocklyGame";
import OfflineGame from "./OfflineGame";
import TypingGame from "./TypingGame";
import TedTalkGame from "./TedTalkGame";

const GameRenderer = ({
    game,
    stallNum,
    onComplete,
    success,
    setSuccess,
    error,
    setError,
}) => {

    switch (game.type) {

        case "blockly":
    return (
        <BlocklyGame
            game={game}
            success={success}
            setSuccess={setSuccess}
            error={error}
            setError={setError}
            onComplete={onComplete}
        />
    );

case "ted-talk":
    return (
        <TedTalkGame
    game={game}
    team={team}
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