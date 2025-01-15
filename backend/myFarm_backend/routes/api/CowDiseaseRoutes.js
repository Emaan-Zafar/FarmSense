const express = require('express');
// const Cow = require('../Models/CowDisease'); // Adjust the path according to your project structure

const axios = require('axios');
const router = express.Router();

const CowDisease = require('../../models/activity_level');
const CowHealth = require('../../models/cow_health');
const Cow = require('../../models/catalog');

// I3D ROUTE - BEHAVIOUR ANALYSIS
router.get('/predict-video', async (req, res) => {
  const staticFolderPath = 'C:/Users/aamna/Downloads/uploads/videos/';
  // const output = "C:/Users/aamna/Documents/GitHub/FarmSense/models/";
  const staticOutputPath = "C:/Users/aamna/Documents/GitHub/FarmSense/models/";

  const { videoPath } = req.query; // Change to 'videoPath' to match the frontend parameter
  const fullVideoPath = `${staticFolderPath}${videoPath}`;

  if (!videoPath) {
    return res.status(400).json({ error: 'Video path is required.' });
  }

  try {
    // Construct the URL for FastAPI
    const fastApiUrl = `http://127.0.0.1:8000/predict-video?video_path=${encodeURIComponent(fullVideoPath)}`;

    // Make a GET request to FastAPI
    const response = await axios.get(fastApiUrl);

    // const { annotated_video, csv_file } = response.data;
    console.log(response.data);
    // const { annotated_video} = response.data;
    const { annotated_video, csv_data, message } = response.data;

    annotatedVideoPath= `${staticFolderPath}${annotated_video}`, 
  

    res.json({
      message: response.data.message,
      annotatedVideoPath: `http://localhost:4000/uploaded-videos/${annotated_video}`, // Adjust this URL based on your frontend's static file server
      csvData: csv_data,
    });
  } catch (error) {
    console.error('Error calling FastAPI:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while calling the FastAPI service.' });
  }
});



// RANDOM FOREST - HEALTHY UNHEALTHY
// router.get('/predict-cow-health/:cowId', async (req, res) => {
//   const { cowId } = req.params;

//   try {
//     // Fetch the CowHealth object by cowId
//     const cowHealthData = await CowHealth.findOne({ cow_id: cowId });

//     if (!cowHealthData) {
//       return res.status(404).json({
//         message: 'No health data found for the specified cow',
//       });
//     }

//     // Prepare the data to send to the model
//     const formattedData = {
//       body_temperature: cowHealthData.body_temperature,
//       milk_production: cowHealthData.milk_production,
//       respiratory_rate: cowHealthData.respiratory_rate,
//       walking_capacity: cowHealthData.walking_capacity,
//       sleeping_duration: cowHealthData.sleeping_duration,
//       body_condition_score: cowHealthData.body_condition_score,
//       heart_rate: cowHealthData.heart_rate,
//       eating_duration: cowHealthData.eating_duration,
//       lying_down_duration: cowHealthData.lying_down_duration,
//       ruminating: cowHealthData.ruminating,
//       rumen_fill: cowHealthData.rumen_fill,
//     };

//     console.log('Sending data to model:', formattedData);

//     // Post the data to the model at port 8000
//     const modelResponse = await axios.post(
//       'http://127.0.0.1:8000/predict-cow-health',
//       formattedData,
//       {
//         headers: {
//           'Cache-Control': 'no-cache',
//           Pragma: 'no-cache',
//         },
//       }
//     );

//     console.log('Model response:', modelResponse.data);

//     // Send the model response back to the client
//     res.json(modelResponse.data);
//   } catch (error) {
//     console.error('Error fetching cow health data or predicting:', error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });

// LSTM - DISEASE PREDICTION - ADD ID
// Route to fetch data from MongoDB and send to model
router.get('/fetch-data/:cowId', async (req, res) => {
  const { cowId } = req.params;
  try {
    // const cowHealthData = await CowHealth.find({ cow_id: cowId });
    // Fetch only the first 24 documents from MongoDB
    const data = await CowDisease.find({cow : cowId}).limit(24);

    // Transform the data into the format required by your model
    const transformedData = {
      IN_ALLEYS: [],
      REST: [],
      EAT: [],
      ACTIVITY_LEVEL: [],
    };

    // Populate transformedData with values from MongoDB documents
    // Populate transformedData with values from MongoDB documents
    data.forEach((doc) => {
      transformedData.IN_ALLEYS.push(
        doc.IN_ALLEYS !== undefined ? doc.IN_ALLEYS : 0
      );
      transformedData.REST.push(doc.REST !== undefined ? doc.REST : 0);
      transformedData.EAT.push(doc.EAT !== undefined ? doc.EAT : 0);
      transformedData.ACTIVITY_LEVEL.push(
        doc.ACTIVITY_LEVEL !== undefined ? doc.ACTIVITY_LEVEL : 0
      );
    });

    // Print out lengths of each array for debugging
    console.log('Lengths of each array:');
    console.log('IN_ALLEYS length:', transformedData.IN_ALLEYS.flat().length);
    console.log('REST length:', transformedData.REST.flat().length);
    console.log('EAT length:', transformedData.EAT.flat().length);
    console.log(
      'ACTIVITY_LEVEL length:',
      transformedData.ACTIVITY_LEVEL.flat().length
    );

    // Convert arrays to correct shape for LSTM input
    // Ensure each array in transformedData is converted to arrays of numbers
    const formattedData = {
      IN_ALLEYS: transformedData.IN_ALLEYS.flat().map(Number),
      REST: transformedData.REST.flat().map(Number),
      EAT: transformedData.EAT.flat().map(Number),
      ACTIVITY_LEVEL: transformedData.ACTIVITY_LEVEL.flat().map(Number),
    };

    console.log(formattedData);

    // Example: Fetch model predictions
    const modelResponse = await axios.post(
      'http://127.0.0.1:8000/predict',
      formattedData,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      }
    );

    console.log(modelResponse.data);

    res.json(modelResponse.data);
  } catch (error) {
    console.error('Error fetching data or predicting:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// DASHBOARD - BAR CHART MILK PRODUCTION
router.get('/average-milk-production', async (req, res) => {
  try {
    console.log('Fetching average milk production from cowhealth collection...');

    // Run aggregation
    const averageMilkProduction = await CowHealth.aggregate([
      {
        $match: {
          // Optional: match criteria to ensure we have valid documents
          cow_id: { $exists: true },
          milk_production: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$cow_id', // Group by cow_id
          averageMilkProduction: { $avg: '$milk_production' }, // Calculate average milk production
        },
      },
      {
        $sort: { _id: 1 }, // Sort by cow_id
      },
    ]);

    console.log('Average Milk Production:', averageMilkProduction);

    // Prepare the response to match your requirements
    const response = averageMilkProduction.map(item => ({
      cow_id: item._id, // Use your custom cow_id
      average_milk_production: item.averageMilkProduction, // Include the average milk production
    }));

    // Send the response back to the frontend
    res.json(response);
  } catch (error) {
    console.error('Error fetching average milk production:', error);
    res.status(500).json({
      error: 'An error occurred while fetching average milk production.',
    });
  }
});



// BEHAVIOUR ANALYSIS - ALL COWS ACTIVITY CHART
router.get('/fetch-all-cow-activity', async (req, res) => {
  try {
    // Fetch all cows from the Cow model
    const cows = await Cow.find({}); // Adjust the model name according to your project structure

    if (cows.length === 0) {
      return res.status(404).json({
        message: 'No cows found in the database',
      });
    }

    // Prepare an array to hold activity levels for each cow
    const cowActivityLevels = [];

    // Iterate over each cow to fetch their activity levels
    for (const cow of cows) {
      // Fetch activity levels for the current cow
      const activityData = await CowDisease.find({
        cow: cow.id,
        date: '2018-10-26',
      }).sort({
        hour: 1,
      });

      // Extract activity levels
      const activityLevels = activityData.map((doc) => doc.ACTIVITY_LEVEL || 0);

      // Push the cow ID and activity levels to the array
      cowActivityLevels.push({
        cowId: cow.id,
        activityLevels,
      });
    }

    // Return the cow activity levels to the client
    res.json(cowActivityLevels);
  } catch (error) {
    console.error('Error fetching all cow activity data:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching cow activity data.' });
  }
});


// ACTIVITY CHART FOR INDIVIDUAL COW
router.get('/fetch-cow-activity/:cowId', async (req, res) => {
  const { cowId } = req.params;

  try {
    const data = await CowDisease.find({
      cow: cowId,
      date: "2023-10-25",
    }).sort({ hour: 1 }); // Sorting by hour to get data in time order

    if (data.length === 0) {
      return res.status(404).json({
        message: 'No records found for the specified cow and date',
      });
    }

    // Extract hours and activity levels separately
    const hours = data.map((doc) => doc.hour);
    const activityLevels = data.map((doc) => doc.ACTIVITY_LEVEL || 0); // Use 0 if activity level is not defined

    console.log('Hours:', hours);
    console.log('Activity Levels:', activityLevels);

    res.json({ cowId, hours, activityLevels }); // Return separately
  } catch (error) {
    console.error('Error fetching cow activity data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;