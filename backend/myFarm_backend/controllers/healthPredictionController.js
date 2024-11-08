const axios = require('axios');
const healthModel = require('../models/cow_health'); // Adjust the path to your model
var catalogModel = require("../models/catalog");

// Function to initialize health predictions
async function initializeHealthPredictions() {
  try {
    console.log('Starting initial health predictions...');

    const allCows = await healthModel.distinct("cow_id");
    if (!allCows || allCows.length === 0) {
      console.log('No cows found in the database');
      return;
    }

    for (const cowId of allCows) {
      const cowHealthData = await healthModel.findOne({ cow_id: cowId }).sort({ date: -1, time: -1 });
      if (!cowHealthData) continue;

      const formattedData = {
        body_temperature: cowHealthData.body_temperature,
        milk_production: cowHealthData.milk_production,
        respiratory_rate: cowHealthData.respiratory_rate,
        walking_capacity: cowHealthData.walking_capacity,
        sleeping_duration: cowHealthData.sleeping_duration,
        body_condition_score: cowHealthData.body_condition_score,
        heart_rate: cowHealthData.heart_rate,
        eating_duration: cowHealthData.eating_duration,
        lying_down_duration: cowHealthData.lying_down_duration,
        ruminating: cowHealthData.ruminating,
        rumen_fill: cowHealthData.rumen_fill,
      };

      const modelResponse = await axios.post('http://127.0.0.1:8000/predict-cow-health', formattedData);
      const predictionLabel = modelResponse.data.predicted_health_status;

      await catalogModel.updateOne({ Id: cowId }, { $set: { Health_Status: predictionLabel } });
      console.log(`Health status for cow ${cowId} updated to: ${predictionLabel}`);
    }
  } catch (error) {
    console.error('Error during initial health predictions:', error);
  }
}

module.exports = { initializeHealthPredictions };
