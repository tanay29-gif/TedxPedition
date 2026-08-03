import { useState } from "react";

export default function BlocklyGame({
    success,
    setSuccess,
    error,
    setError,
    onComplete,
}) {
    const [blocklyWorkspace, setBlocklyWorkspace] = useState([]);
    const [blocklyOutput, setBlocklyOutput] = useState({ text: "", colors: [] });

    const blocklyOptions = [
        { id: "color_white", type: "action", label: 'Set Fill Color: White', color: '#ffffff' },
        { id: "color_red", type: "action", label: 'Set Fill Color: Red', color: '#e10600' },
        { id: "draw_ted", type: "draw", label: 'Draw Text: "TED"', text: "TED" },
        { id: "draw_x", type: "draw", label: 'Draw Text: "x"', text: "x" }
    ];

    const addBlockToWorkspace = (block) => {
        if (success) return;
        setBlocklyWorkspace((prev) => [...prev, block]);
    };

    const clearBlocklyWorkspace = () => {
        if (success) return;
        setBlocklyWorkspace([]);
        setBlocklyOutput({ text: "", colors: [] });
        setError("");
    };

    const runBlocklyCode = () => {
        setError("");

        let currentColor = "#ffffff";
        let outputText = "";
        let outputColors = [];

        blocklyWorkspace.forEach((block) => {
            if (block.type === "action") {
                currentColor = block.color;
            } else if (block.type === "draw") {
                outputText += block.text;
                for (let i = 0; i < block.text.length; i++) {
                    outputColors.push(currentColor);
                }
            }
        });

        setBlocklyOutput({ text: outputText, colors: outputColors });

        const seq = blocklyWorkspace.map((b) => b.id).join(",");
        const correctSeq = "color_white,draw_ted,color_red,draw_x";

        if (seq === correctSeq) {
            setSuccess(true);
            setError("");
        } else {
            if (outputText === "TEDx") {
                setError("Colors are incorrect! TED should be White, x should be Red.");
            } else {
                setError("Recreation failed. Check your block sequence and try again.");
            }
        }
    };

    return (
        <div className="glass-card game-container glow-red">
            <div className="game-instructions">
                <h3>Blockly Coding Challenge</h3>
                <p>TEDx needs a logo! Recreate the official <strong>TED<span>x</span></strong> logo by executing block instructions in the correct order.</p>
                <div className="target-logo-preview">
                    Target Logo: <span className="logo-preview-white">TED</span><span className="logo-preview-red">x</span>
                </div>
            </div>

            <div className="blockly-editor-grid">
                <div className="blockly-toolbox">
                    <h4>Available Blocks</h4>
                    <div className="blocks-list">
                        {blocklyOptions.map((block) => (
                            <button
                                key={block.id}
                                className={`block-item ${block.type}`}
                                onClick={() => addBlockToWorkspace(block)}
                                disabled={success}
                            >
                                🧩 {block.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="blockly-workspace">
                    <div className="workspace-header">
                        <h4>Workspace (Drag & Drop order)</h4>
                        <button onClick={clearBlocklyWorkspace} className="btn btn-accent btn-sm" disabled={success}>
                            Clear
                        </button>
                    </div>
                    <div className="workspace-slots">
                        {blocklyWorkspace.length === 0 ? (
                            <div className="empty-workspace-placeholder">
                                Click blocks on the left to add them here in execution order...
                            </div>
                        ) : (
                            blocklyWorkspace.map((block, idx) => (
                                <div key={idx} className={`workspace-block-card ${block.type}`}>
                                    <span>{idx + 1}. {block.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="blockly-control-panel">
                <button onClick={runBlocklyCode} className="btn btn-secondary run-btn" disabled={blocklyWorkspace.length === 0 || success}>
                    ▶️ Run Code
                </button>

                <div className="rendered-output-box">
                    <span className="output-label">Output Preview:</span>
                    <div className="rendered-canvas">
                        {blocklyOutput.text ? (
                            blocklyOutput.text.split("").map((char, index) => (
                                <span key={index} style={{ color: blocklyOutput.colors[index] || '#fff' }}>
                                    {char}
                                </span>
                            ))
                        ) : (
                            <span className="empty-canvas-text">[Empty Canvas]</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
