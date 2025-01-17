const express = require("express");
let router = express.Router();
const moment = require('moment');
var catalogModel = require("../../models/catalog")
var healthModel = require("../../models/cow_health")

// Age Pie Chart
router.get('/age', async (req, res) => {
  try {
    // Fetch only the 'Age' field from the catalogModel
    const catalogs = await catalogModel.find({}, { Age: 1 }); 

    // Map to extract only the 'Age' values
    const ages = catalogs.map(catalog => catalog.Age);

    // Group and count occurrences of each age
    const ageCounts = ages.reduce((acc, age) => {
      acc[age] = (acc[age] || 0) + 1;
      return acc;
    }, {});

    // Format the result into the desired format and sort by age
    const formattedAges = Object.entries(ageCounts)
      .sort(([ageA], [ageB]) => parseFloat(ageA) - parseFloat(ageB)) // Sort by age in ascending order
      .map(([age, count]) => `Age ${age}: ${count}`);

    return res.json(formattedAges); // Send back the formatted array
  } catch (error) {
    console.error('Error fetching ages:', error);
    res.status(500).json({ message: 'Error fetching ages' });
  }
});



// Health Metrics Chart
router.get("/metrics", async (req, res) => {
    try {
      const health = await healthModel.aggregate([
        // Sort all records by cow_id and date fields
        { $sort: { cow_id: 1, date: -1, time: -1 } },
        
        // Group by cow_id and get the latest record per cow
        { 
          $group: {
            _id: "$cow_id", // Group by cow_id
            cow_id: { $first: "$cow_id" },
            body_temperature: { $first: "$body_temperature" },
            respiratory_rate: { $first: "$respiratory_rate" },
            date: { $first: "$date" },
            time: { $first: "$time" }
          }
        },
        
        // Select only the fields to return to the frontend
        {
          $project: {
            _id: 0, // Exclude the MongoDB _id
            cow_id: 1,
            body_temperature: 1,
            respiratory_rate: 1
          }
        }
      ]);
  
      res.json(health);
    } catch (error) {
      console.error("Error fetching health data:", error);
      res.status(500).json({ message: "Error fetching health data" });
    }
  });

// Ruminating Time
router.get("/ruminate", async (req, res) => {
    try {
        // Aggregation to group by cow_id
        const healthRecords = await healthModel.aggregate([
            {
                $sort: { date: 1 } // Sort by date in ascending order
            },
            {
                $group: {
                    _id: "$cow_id", // Group by cow_id
                    records: {
                        $push: { // Push each record for this cow
                            date: "$date",
                            ruminating: "$ruminating"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id from the result
                    cow_id: "$_id", // Rename _id to cow_id
                    records: 1 // Include the grouped records
                }
            }
        ]);

        console.log('Grouped health records by cow_id:', healthRecords);

        return res.send(healthRecords); // Send the grouped records as response
    } catch (error) {
        console.error('Error fetching health data:', error);
        return res.status(500).send('Error fetching health data');
    }
});

module.exports = router;
  