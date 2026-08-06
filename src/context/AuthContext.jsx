import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { authListener } from "../services/auth";
import { getAdminByEmail } from "../services/admin/adminService";
import { isSuperAdmin } from "../services/auth/adminAuth";
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
            setLoading(true); 
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    console.log("Firebase UID:", firebaseUser.uid);
                    console.log("Email:", firebaseUser.email);
                    
                    let admin = null;
                    // 1. Check if super admin
                    if (isSuperAdmin(firebaseUser)) {
                        admin = {
                            name: firebaseUser.displayName || "Super Admin",
                            email: firebaseUser.email,
                            role: "Super Admin",
                            stallAssigned: "All",
                            active: true
                        };
                    } else {
                        // 2. Check if admin in Firestore
                        const adminDoc = await getAdminByEmail(firebaseUser.email);
                        if (adminDoc && adminDoc.active) {
                            admin = adminDoc;
                        }
                    }

                    setAdminData(admin);

                    // 3. If not admin, check if team leader
                    if (!admin) {
                        const team = await getTeamByLeaderEmail(firebaseUser.email);
                        setTeamData(team);
                        console.log("Team Data:", team);
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