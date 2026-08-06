import { useNavigate } from 'react-router-dom';
import { ref, set } from "firebase/database";
// Import 'realtimeDb' because that is your Realtime Database instance
import { realtimeDb } from "./firebase/firebase.js"; 

const TeamLoader = () => {
  const navigate = useNavigate();

  const handleVerifyAndAdd = async () => {
    // 1. The specific Team ID you provided
    const teamId = "TEAM-I1UJ-650089";
    
    // 2. The exact data object from your request
    const teamData = {
      currentStall: "STALL03",
      status: "VERIFYING",
      updatedAt: 1785756869273
    };

    try {
      // 3. Using 'realtimeDb' and 'ref' to point to the Realtime Database path
      // This will create/update: activeTeams/TEAM-I1UJ-650089
      await set(ref(realtimeDb, `activeTeams/${teamId}`), teamData);
      
      console.log("Realtime DB Updated!");

      // 4. Navigate to your next page
      navigate('/your-next-page-route'); 
      
    } catch (error) {
      console.error("Error writing to Realtime Database:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl mb-4">Team Verification</h1>
      <button 
        onClick={handleVerifyAndAdd}
        className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition"
      >
        Verify Team & Start
      </button>
    </div>
  );
};

export default TeamLoader;