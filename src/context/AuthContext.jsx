import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { authListener } from "../services/auth";
import { getAdmin } from "../services/firestore";
import { getTeamByLeaderEmail } from "../services/firestore/teams";

// Create Context
const AuthContext = createContext();

// Provider Component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authListener(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    // 1. Check if admin
                    const admin = await getAdmin(firebaseUser.uid);
                    setAdminData(admin);

                    // 2. If not admin, check if team leader
                    if (!admin) {
                        const team = await getTeamByLeaderEmail(firebaseUser.email);
                        setTeamData(team);
                    } else {
                        setTeamData(null);
                    }
                } catch (err) {
                    console.error("Auth context load error:", err);
                    setAdminData(null);
                    setTeamData(null);
                }
            } else {
                setUser(null);
                setAdminData(null);
                setTeamData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                adminData,
                teamData,
                loading,
                setTeamData // Expose setter so we can update context locally when coins/scores update
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook
export function useAuth() {
    return useContext(AuthContext);
}