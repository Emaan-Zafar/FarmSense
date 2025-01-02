const axios = require('axios');
const express = require("express");
let router = express.Router();
var CowHealth = require("../../models/cow_health")

const HUGGINGFACE_API_TOKEN = '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';

router.get('/generate-suggestions/:cowId', async (req, res) => {
  const { cowId } = req.params;

  console.log(`Fetching suggestions for Cow ID: ${cowId}`);

  if (!cowId) {
    return res.status(400).json({ message: 'Cow ID is required.' });
  }

  try {
    // Fetch the most recent cow health data
    const cowHealthData = await CowHealth.findOne({ cow_id: cowId }).sort({ date: -1 });

    if (!cowHealthData) {
      return res.status(404).json({ message: `No health data found for cow ID: ${cowId}` });
    }

    // Create a structured input for the AI model with specified fields
    const inputText = `
      Cow Health Data for Analysis:
      - Cow ID: ${cowHealthData.cow_id}
      - Body Temperature: ${cowHealthData.body_temperature}°C
      - Heart Rate: ${cowHealthData.heart_rate} bpm
      - Respiratory Rate: ${cowHealthData.respiratory_rate} breaths/min
      - Sleeping Duration: ${cowHealthData.sleeping_duration} hours/day
      - Eating Duration: ${cowHealthData.eating_duration} hours/day
      - Walking Capacity: ${cowHealthData.walking_capacity} steps/day

      Please provide actionable farm management suggestions to improve the cow's health and productivity based on this data. Read it carefully understand what the metrics are and know that these metrics are of a cow. make the response in points clear and concise.
    `;

    console.log(`Generated input for AI model: ${inputText}`);

    // Call Hugging Face API
    const response = await axios.post(
      //'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B', // Update to a better model if required
      //'https://api-inference.huggingface.co/models/gpt2',
      //'https://api-inference.huggingface.co/models/gpt2-large',
      //'https://api-inference.huggingface.co/models/ModelCloud/Llama-3.2-1B-Instruct-gptqmodel-4bit-vortex-v2.5',
      //'https://api-inference.huggingface.co/models/gpt2-xl',
      //'https://api-inference.huggingface.co/models/EleutherAI/gpt-neox-20b',
      //'https://api-inference.huggingface.co/models/NbAiLab/nb-gpt-j-6B',
      //'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-1.3B',
      'https://api-inference.huggingface.co/models/gpt2-medium',
      { inputs: inputText },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle API response
    if (response.data && response.data.generated_text) {
      return res.status(200).json({
        cowId,
        suggestions: response.data.generated_text,
      });
    } else {
      return res.status(500).json({
        message: 'Failed to generate suggestions. API returned no text.',
        response: response.data, // Include for debugging
      });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error.message);

    // Handle Hugging Face API errors
    if (error.response && error.response.data) {
      return res.status(500).json({
        message: 'Error from Hugging Face API',
        details: error.response.data,
      });
    }

    // Generic error handler
    return res.status(500).json({
      message: 'An unexpected error occurred.',
      error: error.message,
    });
  }
});
  
module.exports = router;