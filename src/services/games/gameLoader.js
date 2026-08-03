export const loadGame = async (stallId) => {
    try {
        const response = await fetch(`/assets/games/${stallId}/game.json`);
        if (!response.ok) {
            throw new Error(`Failed to load game config for ${stallId}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in loadGame:", error);
        return null;
    }
};
