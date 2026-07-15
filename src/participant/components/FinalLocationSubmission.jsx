import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';

const FinalLocationSubmission = ({ team }) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const allStallsDone =
    team.totalStalls > 0 && (team.stallsCompleted?.length || 0) >= team.totalStalls;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setMessage('Please enter your final location answer.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await updateDoc(doc(db, 'teams', team.id), {
        finalLocationAnswer: answer.trim(),
        finalLocationSubmitted: true,
        finalLocationSubmittedAt: new Date(),
      });
      setMessage('Submitted! Waiting for admin verification.');
    } catch (err) {
      console.error(err);
      setMessage('Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (team.finalLocationSubmitted) {
    return (
      <div className="card">
        <h3>Final Location</h3>
        <p>✅ You've already submitted: <strong>{team.finalLocationAnswer}</strong></p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Final Location</h3>
      {!allStallsDone && (
        <p style={{ opacity: 0.7 }}>
          Complete all stalls before submitting your final answer.
        </p>
      )}
      <input
        type="text"
        placeholder="Enter final location"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={!allStallsDone || submitting}
        style={{ width: '100%', padding: '8px', marginTop: '8px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={!allStallsDone || submitting}
        style={{ marginTop: '8px' }}
      >
        {submitting ? 'Submitting...' : 'Submit Final Answer'}
      </button>
      {message && <p style={{ marginTop: '8px' }}>{message}</p>}
    </div>
  );
};

export default FinalLocationSubmission;
