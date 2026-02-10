const axios = require('axios');

// Default forecast structure if AI is offline
const fallbackForecast = {
    projected: [],
    total_forecast: 0
};

exports.getForecast = async (dailyTotals) => {
    try {
        // AI Service URL (Make sure Python is running on Port 5002)
        const AI_URL = 'http://127.0.0.1:5002/predict';
        
        console.log(`🤖 Connecting to AI Service at ${AI_URL}...`);

        const response = await axios.post(AI_URL, {
            data: dailyTotals
        });

        if (response.data && response.data.forecast) {
            console.log("✅ AI Prediction Received:", response.data.total_forecast);
            return {
                projected: response.data.forecast,
                total_forecast: response.data.total_forecast
            };
        }
        
        return fallbackForecast;

    } catch (error) {
        console.error("⚠️ AI Service Offline or Error:", error.message);
        // Return fallback (empty prediction) instead of crashing
        return fallbackForecast;
    }
};