export async function loadClue(stallId) {
  try {
    const response = await fetch(`/assets/clues/${stallId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch clue for stall ${stallId}: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      title: data.title,
      description: data.description
    };
  } catch (error) {
    console.error("Error loading clue:", error);
    throw error;
  }
}
