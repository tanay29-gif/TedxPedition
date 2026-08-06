export const loadGame = async (stallId) => {
  try {
    const response = await fetch(`/games/${stallId}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load game config for ${stallId}`);
    }

    const data = await response.json();
    console.log("Loaded game:", data);

    return data;
  } catch (error) {
    console.error("Error in loadGame:", error);
    return null;
  }
};