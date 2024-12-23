const express = require("express");
let router = express.Router();
var healthModel = require("../../models/cow_health")
var catalogModel = require("../../models/catalog")

router.get("/", async(req,res) => {
    let health = await catalogModel.find();
    return res.send(health);
});

router.get('/unhealthy-cows', async (req, res) => {
    try {
      const unhealthyCows = await catalogModel.find({ Health_Status: "Unhealthy" });
      console.log(unhealthyCows);
      const unhealthyCowsWithDetails = unhealthyCows.map(cow => ({
        id: cow.Id,
        description: `Cow ID: ${cow.Id} is unhealthy`,
      }));
      res.json(unhealthyCowsWithDetails);
    } catch (error) {
      console.error('Error fetching unhealthy cows:', error);
      res.status(500).json({ message: 'Error fetching unhealthy cows' });
    }
  });

  router.get('/healthy-cows', async (req, res) => {
    try {
      const unhealthyCows = await catalogModel.find({ Health_Status: "Healthy" });
      console.log(unhealthyCows);
      const unhealthyCowsWithDetails = unhealthyCows.map(cow => ({
        id: cow.Id,
        description: `Cow ID: ${cow.Id} is unhealthy`,
      }));
      res.json(unhealthyCowsWithDetails);
    } catch (error) {
      console.error('Error fetching unhealthy cows:', error);
      res.status(500).json({ message: 'Error fetching unhealthy cows' });
    }
  });

// router.get('/predict/all', async (req, res) => {
//     try {
//       // Fetch all unique cow IDs
//       const allCows = await healthModel.distinct("cow_id");
//       console.log(allCows);
  
//       if (!allCows || allCows.length === 0) {
//         return res.status(404).json({ message: 'No cows found in the database' });
//       }
  
//       const predictions = [];
  
//       // Loop through each cow to get the latest health data and predict
//       for (const cowId of allCows) {
//         // Find the latest entry for this cow by sorting on date and time separately
//         const cowHealthData = await healthModel.findOne({ cow_id: cowId.toString() })
//         .sort({ date: -1, time: -1 }) // Uncomment to sort by date and time if needed
//         .exec();
  
//         console.log(cowHealthData);
//         if (!cowHealthData) {
//           console.log("None");
//           continue;
//         }
  
//         // Prepare data for model prediction
//         const formattedData = {
//           body_temperature: cowHealthData.body_temperature,
//           milk_production: cowHealthData.milk_production,
//           respiratory_rate: cowHealthData.respiratory_rate,
//           walking_capacity: cowHealthData.walking_capacity,
//           sleeping_duration: cowHealthData.sleeping_duration,
//           body_condition_score: cowHealthData.body_condition_score,
//           heart_rate: cowHealthData.heart_rate,
//           eating_duration: cowHealthData.eating_duration,
//           lying_down_duration: cowHealthData.lying_down_duration,
//           ruminating: cowHealthData.ruminating,
//           rumen_fill: cowHealthData.rumen_fill,
//         };
  
//         console.log(`Sending data to model for cow ${cowId}:`, formattedData);
  
//         // Send data to the model
//         const modelResponse = await axios.post(
//           'http://127.0.0.1:8000/predict-cow-health',
//           formattedData,
//           {
//             headers: {
//               'Cache-Control': 'no-cache',
//               Pragma: 'no-cache',
//             },
//           }
//         );
  
//         const predictionLabel = modelResponse.data.predicted_health_status;
//         console.log(`Prediction result for cow ${cowId}:`, predictionLabel);
  
//         // Add the cow's prediction result to the array
//         predictions.push({ cowId, prediction: predictionLabel });
  
//         // Update the health status in the database for this cow
//         await catalogModel.updateOne(
//           { Id: cowId.toString() },
//           { $set: { Health_Status: predictionLabel } }
//         );
        
//       }
  
//       // Send the collection of predictions as a response
//       res.json(predictions);
  
//     } catch (error) {
//       console.error('Error fetching cow health data or predicting:', error);
//       res.status(500).json({ error: 'An error occurred' });
//     }
//   });
  
module.exports = router;