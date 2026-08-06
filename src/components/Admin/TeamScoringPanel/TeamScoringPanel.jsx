import "./TeamScoringPanel.css";

import ActionButtons from "./ActionButtons";
import ScoreForm from "./ScoreForm";
import ScoreSummary from "./ScoreSummary";
import TeamInfoGrid from "./TeamInfoGrid";
import TeamVerificationHeader from "./TeamVerificationHeader";

export default function TeamScoringPanel({
    selectedTeam,
    selectedTeamStallProgress,

    score,
    setScore,

    bonus,
    setBonus,

    penalty,
    setPenalty,

    remarks,
    setRemarks,
 
    hintUsed,
    setHintUsed,


    onSubmit,
    submitting,
    onBack,
}) {

    if (!selectedTeam) return null;

    return (

        <section className="team-scoring-card">

            <TeamVerificationHeader
                selectedTeam={selectedTeam}
                selectedTeamStallProgress={selectedTeamStallProgress}
                onBack={onBack}
            />

            <TeamInfoGrid
                selectedTeam={selectedTeam}
                selectedTeamStallProgress={selectedTeamStallProgress}
            />

            <ScoreForm
                score={score}
                setScore={setScore}

                bonus={bonus}
                setBonus={setBonus}

                penalty={penalty}
                setPenalty={setPenalty}

                hintUsed={hintUsed}
                setHintUsed={setHintUsed}

                remarks={remarks}
                setRemarks={setRemarks}
            />

            <ScoreSummary
                score={score}
                bonus={bonus}
                penalty={penalty}
            />

            <ActionButtons
                score={score}
                submitting={submitting}
                onSubmit={onSubmit}
                onBack={onBack}
            />

        </section>

    );

}