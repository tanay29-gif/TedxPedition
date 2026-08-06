import { useMemo, useState } from "react";
import "./TedTalkGame.css";
import { db } from "../../firebase/firebase.js";
import {
    doc,
    updateDoc,
    increment,
    runTransaction
} from "firebase/firestore";

export default function TedTalkGame({
    game,
    team,
    onComplete
}) {

    if (!game) return null;

    // Randomly select one sentence set
    const challenge = useMemo(() => {
        return game.sets[
            Math.floor(Math.random() * game.sets.length)
        ];
    }, [game]);

    // Shuffle the clues
    const clues = useMemo(() => {
        return [...challenge.words].sort(() => Math.random() - 0.5);
    }, [challenge]);

    // Random hint
    const randomHint = useMemo(() => {
        return challenge.words[0];
    }, [challenge]);

    const [answer, setAnswer] = useState("");
    const [showHint, setShowHint] = useState(false);
    const [verified, setVerified] = useState(false);
    const [message, setMessage] = useState("");
    const [coins, setCoins] = useState(team?.coins ?? 0);

    const verifySentence = () => {

        const userAnswer = answer
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        const actualAnswer = challenge.sentence
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        if (userAnswer === actualAnswer) {

            setVerified(true);

            setMessage(
                "✅ Correct! Ask a volunteer to verify your challenge."
            );

        } else {

            setVerified(false);

            setMessage(
                "❌ Incorrect sentence. Watch the TED Talks again and try once more."
            );

        }
    };

    const finishChallenge = async () => {

        try {

            const teamRef = doc(db, "teams", team.teamId);

            await updateDoc(teamRef, {
                coins: increment(game.coins)
            });

            onComplete();

        } catch (err) {

            console.error(err);

        }

    };

    const useHint = async () => {

        if (showHint) return;

        try {

            const teamRef = doc(db, "teams", team.teamId);

            await runTransaction(db, async (transaction) => {

                const teamSnap = await transaction.get(teamRef);

                if (!teamSnap.exists()) {

                    throw new Error("Team not found");

                }

                let currentCoins =
                    teamSnap.data().coins || 0;

                if (currentCoins <= 0) {

                    throw new Error("NO_COINS");

                }

                transaction.update(teamRef, {

                    coins: currentCoins - 1

                });

                setCoins(currentCoins - 1);

            });

            setShowHint(true);

        }

        catch (err) {

            if (err.message === "NO_COINS") {

                setMessage(
                    "❌ You don't have any Hint Coins remaining."
                );

            } else {

                console.error(err);

                setMessage(
                    "Something went wrong."
                );

            }

        }

    };

    return (
        <div className="ted-page">

            <div className="ted-container">

                {/* Hero */}

                <section className="ted-hero">

                    <div className="ted-status">

                        <span className="ted-tag">
                            TED TALK CHALLENGE
                        </span>

                        <div className="coin-card">

                            <div className="coin-icon">
                                🪙
                            </div>

                            <div>

                                <h4>{coins}</h4>

                                <span>Hint Coins</span>

                            </div>

                        </div>

                    </div>
                    <h1>
                        {game.title}
                    </h1>

                    <p>
                        {game.description}
                    </p>

                </section>

                {/* Description */}

                <section className="ted-section">

                    <h3>
                        Challenge
                    </h3>

                    <div className="ted-box">

                        <p>
                            Six different TED Talk clips contain six hidden
                            words.
                            Visit every TED Talk, jump to the timestamp,
                            discover the word being spoken, and arrange
                            all six words into one meaningful sentence.
                        </p>

                    </div>

                </section>

                {/* Instructions */}

                <section className="ted-section">

                    <h3>
                        Instructions
                    </h3>

                    <div className="ted-box instruction-box">

                        {game.instruction
                            .split("\n")
                            .filter(Boolean)
                            .map((step, index) => (

                                <div
                                    key={index}
                                    className="instruction-item"
                                >

                                    <div className="step-number">

                                        {index + 1}

                                    </div>

                                    <p>
                                        {step}
                                    </p>

                                </div>

                            ))}

                    </div>

                </section>

                {/* Clues */}

                <section className="ted-section">

                    <h3>
                        Word Clues
                    </h3>

                    <div className="clue-grid">

                        {clues.map((clue, index) => (

                            <div
                                key={index}
                                className="clue-card"
                            >

                                <div className="clue-number">

                                    Clue {index + 1}

                                </div>

                                <div className="timestamp">

                                    ⏱ {clue.timestamp}

                                </div>

                                <a
                                    href={clue.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="video-button"
                                >
                                    Open TED Talk
                                </a>

                            </div>

                        ))}

                    </div>

                </section>

                {/* Hint */}

                <section className="ted-section">

                    <h3>
                        Need a Hint?
                    </h3>

                    <div className="ted-box">

                        {!showHint ? (

                            <>
                                <p>
                                    Stuck on one of the clues?
                                    Reveal a small hint.
                                </p>

                                <button
                                    className="hint-button"
                                    onClick={useHint}

                                >
                                    Reveal Hint
                                </button>
                            </>

                        ) : (

                            <>
                                <div className="hint-card">

                                    <h2>
                                        Hint
                                    </h2>

                                    <p>

                                        <strong>
                                            Starts With
                                        </strong>

                                        {" "}

                                        {randomHint.word[0]}
                                        <pre>
                                            {JSON.stringify(randomHint, null, 2)}
                                        </pre>

                                    </p>

                                    <p>

                                        <strong>
                                            Length
                                        </strong>

                                        {" "}

                                        {randomHint.word.length} letters

                                    </p>

                                </div>

                            </>
                        )}

                    </div>

                </section>

                {/* ---------- CONTINUES IN PART 1B ---------- */}
                {/* Answer */}

                <section className="ted-section">

                    <h3>
                        Enter the Secret Sentence
                    </h3>

                    <div className="ted-box">

                        <p className="answer-text">
                            Arrange all six words in the correct order and
                            enter the complete sentence below.
                        </p>

                        <input
                            type="text"
                            className="sentence-input"
                            placeholder="Type the complete sentence..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />

                        <button
                            className="verify-button"
                            onClick={verifySentence}
                        >
                            Verify Sentence
                        </button>

                        {message && (
                            <div
                                className={`verification-message ${verified ? "success" : "error"
                                    }`}
                            >
                                {message}
                            </div>
                        )}

                    </div>

                </section>

                {/* Finish */}

                {verified && (

                    <section className="ted-section">

                        <div className="finish-card">

                            <h2>
                                🎉 Challenge Completed
                            </h2>

                            <p>
                                Great job! You've successfully discovered the
                                secret sentence.
                            </p>

                            <p>
                                Ask the volunteer to verify your answer and
                                unlock the next stall.
                            </p>

                            <button
                                className="finish-button"
                                onClick={finishChallenge}
                            >
                                Finish Challenge
                            </button>

                        </div>

                    </section>

                )}

            </div>

        </div>

    );

}