export const sendHeartRateDataToBackend = async (data) => {
  try {
    const response = await fetch(`https://api.faizan-saleem.com/get_bpm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: data }), // Send the heart rate data
    });
    const result = await response.json();
    if (result.bpm) return result;
  } catch (error) {
    console.error("Error sending data to backend:", error);
  }
};
