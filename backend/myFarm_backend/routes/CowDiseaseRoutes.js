const express = require('express');
// const Cow = require('../Models/CowDisease'); // Adjust the path according to your project structure

const axios = require('axios');
const router = express.Router();

const CowDisease = require('../models/CowDisease');

router.get('/fetch-cow-activity/:cowId/:date', async (req, res) => {
  const { cowId, date } = req.params;

  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    console.log(startDate);
    endDate.setDate(startDate.getDate() + 1); // Querying the full day's data

    const data = await CowDisease.find({
      cow: Number(cowId),
      date: startDate,
    }).sort({ hour: 1 }); // Sorting by hour to get data in time order

    if (data.length === 0) {
      return res.status(404).json({
        message: 'No records found for the specified cow and date',
      });
    }

    // Extract activity levels from the data
    const activityLevels = data.map((doc) => doc.ACTIVITY_LEVEL || 0);

    console.log(activityLevels);

    res.json({ cowId, date, activityLevels });
  } catch (error) {
    console.error('Error fetching cow activity data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Route to fetch data from MongoDB and send to model
router.get('/fetch-data/', async (req, res) => {
  try {
    // Fetch only the first 24 documents from MongoDB
    const data = await CowDisease.find({}).limit(24);

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

module.exports = router;
