import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase.js';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

/**
 * useTeam
 * Subscribes in realtime to the signed-in participant's team document.
 * Returns { team, teamId, loading, error }.
 *
 * How it works:
 * 1. Reads the current user's doc from `users/{uid}` to find their teamId.
 * 2. Opens a live subscription (onSnapshot) to `teams/{teamId}`.
 * 3. Any change an admin makes (new clue, coins, stall update) appears
 *    instantly on the participant's screen — no refresh needed.
 */
export function useTeam() {
  const [team, setTeam] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeTeam = () => {};

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        setError('Not signed in.');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data().teamId) {
          setLoading(false);
          setError('No team linked to this account yet.');
          return;
        }

        const linkedTeamId = userSnap.data().teamId;
        setTeamId(linkedTeamId);

        // Live subscription — updates automatically when admin changes anything
        unsubscribeTeam = onSnapshot(
          doc(db, 'teams', linkedTeamId),
          (teamSnap) => {
            if (teamSnap.exists()) {
              setTeam({ id: teamSnap.id, ...teamSnap.data() });
              setError(null);
            } else {
              setError('Team data not found.');
            }
            setLoading(false);
          },
          (err) => {
            console.error('Team subscription error:', err);
            setError('Could not load team data.');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('useTeam error:', err);
        setError('Something went wrong loading your team.');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTeam();
    };
  }, []);

  return { team, teamId, loading, error };
}
