import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { authListener } from "../services/auth";
import { getAdmin } from "../services/firestore";

// Create Context
const AuthContext = createContext();

// Provider Component
export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = authListener(async (firebaseUser) => {

            if (firebaseUser) {

                setUser(firebaseUser);

                const admin = await getAdmin(firebaseUser.uid);

                setAdminData(admin);

            } else {

                setUser(null);
                setAdminData(null);

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
                loading
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