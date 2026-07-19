import { useCallback, useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase.js';
import { doc, getDoc } from 'firebase/firestore';

/**
 * useTeam
 * Fetches the signed-in participant's team data ONCE per call (not a live
 * subscription). With many teams all writing coin/clue/stall updates during
 * the event, a real-time listener on every participant's screen would rack
 * up Firestore reads fast. Instead, this hook fetches on mount and exposes
 * a `refresh()` function so the dashboard can have a manual "Refresh" button.
 *
 * Returns { team, teamId, loading, error, refresh }.
 */
export function useTeam() {
  const [team, setTeam] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Not signed in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().teamId) {
        setError('No team linked to this account yet.');
        setLoading(false);
        return;
      }

      const linkedTeamId = userSnap.data().teamId;
      setTeamId(linkedTeamId);

      const teamSnap = await getDoc(doc(db, 'teams', linkedTeamId));

      if (!teamSnap.exists()) {
        setError('Team data not found.');
        setLoading(false);
        return;
      }

      setTeam({ id: teamSnap.id, ...teamSnap.data() });
    } catch (err) {
      console.error('useTeam fetch error:', err);
      setError('Could not load team data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) fetchTeam();
      else {
        setLoading(false);
        setError('Not signed in.');
      }
    });
    return () => unsubscribeAuth();
  }, [fetchTeam]);

  return { team, teamId, loading, error, refresh: fetchTeam };
}
