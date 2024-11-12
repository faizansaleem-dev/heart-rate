export const sendHeartRateDataToBackend = async (data) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/get_bpm", {
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
