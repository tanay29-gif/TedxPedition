import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";

import "./Blockly.css";

import { toolbox } from "./blockly.js";
import "./generator";

import { generateInstructions } from "./generator";
import { validateProgram } from "./validator";

const BlocklyGame = ({
    onComplete,
    success,
    setSuccess,
    error,
    setError
}) => {

    /* ---------------------------------------------------------------------- */
    /* Refs */
    /* ---------------------------------------------------------------------- */

    const blocklyDiv = useRef(null);

    const workspaceRef = useRef(null);

    /* ---------------------------------------------------------------------- */
    /* State */
    /* ---------------------------------------------------------------------- */

    const [running, setRunning] = useState(false);

    const [previewData, setPreviewData] = useState([]);

    const [attempts, setAttempts] = useState(0);

    const [workspaceReady, setWorkspaceReady] = useState(false);

    /* ---------------------------------------------------------------------- */
    /* Helpers */
    /* ---------------------------------------------------------------------- */

    const clearMessages = () => {

        setError("");

        setSuccess("");

    };

    /* ---------------------------------------------------------------------- */
    /* Blockly Initialization */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {

        if (!blocklyDiv.current) return;

        workspaceRef.current = Blockly.inject(
            blocklyDiv.current,
            {
                toolbox,

                trashcan: true,

                renderer: "zelos",

                scrollbars: true,

                move: {
                    drag: true,
                    scrollbars: true,
                    wheel: false
                },

                zoom: {
                    controls: true,
                    wheel: false,
                    startScale: 1,
                    maxScale: 1.5,
                    minScale: 0.6,
                    scaleSpeed: 1.2
                },

                grid: {
                    spacing: 20,
                    length: 3,
                    colour: "#444",
                    snap: true
                },

                theme: Blockly.Themes.Dark
            }
        );

        setWorkspaceReady(true);

        workspaceRef.current.addChangeListener(() => {

            if (!workspaceRef.current) return;

            const instructions =
                generateInstructions(workspaceRef.current);

            setPreviewData(instructions);

        });

        return () => {

            if (workspaceRef.current) {

                workspaceRef.current.dispose();

                workspaceRef.current = null;

            }

        };

    }, []);

    /* ---------------------------------------------------------------------- */
    /* Run Program */
    /* ---------------------------------------------------------------------- */

    const handleRun = () => {

        if (!workspaceRef.current || running) return;

        clearMessages();

        setRunning(true);

        const instructions = generateInstructions(workspaceRef.current);

        setPreviewData(instructions);

        const result = validateProgram(instructions);

        setAttempts(prev => prev + 1);

        setTimeout(() => {

            setRunning(false);

            if (result.success) {

                setSuccess(result.message);

                if (onComplete) {

                    setTimeout(() => {

                        onComplete();

                    }, 1500);

                }

            } else {

                setError(result.message);

            }

        }, 1000);

    };


    /* ---------------------------------------------------------------------- */
    /* Reset Workspace */
    /* ---------------------------------------------------------------------- */

    const handleReset = () => {

        if (!workspaceRef.current) return;

        workspaceRef.current.clear();

        setPreviewData([]);

        clearMessages();

    };


    /* ---------------------------------------------------------------------- */
    /* Preview Helpers */
    /* ---------------------------------------------------------------------- */

    const getColour = (colour) => {

        switch (colour) {

            case "red":
                return "#E10600";

            case "white":
                return "#FFFFFF";

            case "black":
                return "#000000";

            case "gray":
                return "#808080";

            default:
                return "#FFFFFF";

        }

    };


    const getFontSize = (size) => {

        switch (size) {

            case "small":
                return "16px";

            case "medium":
                return "22px";

            case "large":
                return "34px";

            case "extra_large":
                return "48px";

            default:
                return "20px";

        }

    };


    const getFontWeight = (weight) => {

        return weight === "bold"
            ? "700"
            : "400";

    };

    return (

        <div className="blockly-game">

            <div className="blockly-layout">

                {/* ================= Left Panel ================= */}

                <div className="blockly-workspace-card">

                    <div className="blockly-card-header">

                        <div>

                            <h2>TEDx Display Recovery</h2>

                            <p>
                                Arrange the Blockly blocks and configure each
                                logo element correctly.
                            </p>

                        </div>

                        <div className="attempt-badge">

                            Attempts

                            <span>{attempts}</span>

                        </div>

                    </div>

                    <div className="workspace-wrapper">

                        <div
                            ref={blocklyDiv}
                            className="blockly-workspace"
                        />

                    </div>

                    <div className="workspace-actions">

                        <button
                            className="run-btn"
                            onClick={handleRun}
                            disabled={!workspaceReady || running}
                        >

                            {running
                                ? "Running..."
                                : "▶ Run Program"}

                        </button>

                        <button
                            className="reset-btn"
                            onClick={handleReset}
                        >

                            ↺ Reset

                        </button>

                    </div>

                    {error && (

                        <div className="blockly-error">

                            <strong>Program Failed</strong>

                            <p>{error}</p>

                        </div>

                    )}

                    {success && (

                        <div className="blockly-success">

                            <strong>Success!</strong>

                            <p>{success}</p>

                        </div>

                    )}

                </div>

                {/* ================= Right Panel Starts Here ================= */}

                <div className="blockly-side-panel">

                    {/* ================= Mission Card ================= */}

                    <div className="mission-card">

                        <h3>Mission</h3>

                        <p>
                            Restore the TEDx IIT Gandhinagar display by
                            configuring each Blockly block correctly.
                        </p>

                        <div className="mission-info">

                            <div className="mission-item">

                                <span>Difficulty</span>

                                <strong>★★★☆☆ Medium</strong>

                            </div>

                            <div className="mission-item">

                                <span>Estimated Time</span>

                                <strong>5 Minutes</strong>

                            </div>

                        </div>

                    </div>

                    {/* ================= Target Output ================= */}

                    <div className="target-card">

                        <h3>Target Output</h3>

                        <p>
                            Configure the blocks so the preview matches the
                            TEDx logo below.
                        </p>

                        <div className="target-preview">

                            <img
                                src="/assets/games/1/tedx-logo.png"
                                alt="TEDx IIT Gandhinagar"
                                className="ted-logo"
                            />

                        </div>

                    </div>

                    {/* ================= Rules ================= */}

                    <div className="rules-card">

                        <h3>Challenge Rules</h3>

                        <ul>

                            <li>Arrange the blocks in the correct order.</li>

                            <li>Select the correct colour.</li>

                            <li>Select the correct font size.</li>

                            <li>Select the correct font weight.</li>

                            <li>Press <strong>Run Program</strong> to verify your solution.</li>

                        </ul>

                    </div>

                    {/* ===== Preview Card Starts Here (Part 1D-B) ===== */}

                    {/* ================= Live Preview ================= */}

                    <div className="preview-card">

                        <h3>Live Preview</h3>

                        <p>
                            This preview updates automatically as you configure
                            your Blockly blocks.
                        </p>

                        <div className="preview-canvas">

                            {previewData.length === 0 ? (

                                <div className="preview-placeholder">

                                    <span>📝</span>

                                    <p>
                                        Drag the Blockly blocks into the
                                        workspace to see your TEDx logo here.
                                    </p>

                                </div>

                            ) : (

                                <div
                                    className="preview-logo"
                                    style={{
                                        background: "#000",
                                        padding: "24px",
                                        borderRadius: "12px",
                                        minHeight: "180px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >

                                    {previewData.map((item, index) => (

                                        <div
                                            key={index}
                                            style={{
                                                color: getColour(item.colour),
                                                fontSize: getFontSize(item.size),
                                                fontWeight: getFontWeight(item.weight),
                                                lineHeight: 1.1
                                            }}
                                        >

                                            {item.type === "ted" && "TED"}

                                            {item.type === "x" && "x"}

                                            {item.type === "iitgn" &&
                                                "IIT Gandhinagar"}

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>

                    {/* ================= Game Status ================= */}

                    <div className="status-card">

                        <h3>Game Status</h3>

                        <div className="status-item">

                            <span>Workspace</span>

                            <strong>

                                {workspaceReady
                                    ? "Ready"
                                    : "Loading..."}

                            </strong>

                        </div>

                        <div className="status-item">

                            <span>Blocks Added</span>

                            <strong>{previewData.length} / 3</strong>

                        </div>

                        <div className="status-item">

                            <span>Attempts</span>

                            <strong>{attempts}</strong>

                        </div>

                    </div>
                </div>
            </div>

        </div>



    );

};

export default BlocklyGame;