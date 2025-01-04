/*const axios = require('axios');
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
  
module.exports = router;*/

const express = require("express");
const axios = require("axios");

let router = express.Router();

const OPENAI_API_KEY = "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"; // Replace with your actual API key

router.post("/cowChat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant specialized in cow health, behavior, and farm management. Only provide responses related to cows. Provide responses in short, clear points. Keep it concise and actionable.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const suggestions = response.data.choices[0].message.content;

    return res.status(200).json({ suggestions });
  } catch (error) {
    // Log detailed error info to console for debugging
    console.error("Error with OpenAI API:", error.response?.data || error.message);

     // Send back an error message if the API call fails
    return res.status(500).json({
      error: "Failed to fetch suggestions from ChatGPT. Try again later.",
      details: error.response?.data || error.message, // Add detailed error response
    });
  }
});

module.exports = router;

/*const express = require("express");
const router = express.Router();

const conversationFlow = {
  start: {
    question: "What issue is your cow experiencing?",
    options: ["Low productivity", "Health concerns", "Behavioral issues"],
    next: {
      "Low productivity": "lowProductivity",
      "Health concerns": "healthConcerns",
      "Behavioral issues": "behavioralIssues",
    },
  },

  lowProductivity: {
    question: "How many liters of milk is your cow producing daily?",
    options: ["Less than 5", "5-10", "More than 10"],
    next: {
      "Less than 5": "lowMilkProduction",
      "5-10": "normalMilkProduction",
      "More than 10": "highMilkProduction",
    },
  },

  lowMilkProduction: {
    suggestions: [
      "Introduce high-protein supplements to improve milk production.",
      "Ensure the cow has access to clean water and proper hydration.",
      "Consult a nutritionist for a better feed plan tailored to milk production.",
      "Check if the cow is stressed due to environmental factors.",
    ],
    followUpQuestion: "Would you like more tips or suggestions on improving milk production?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "feedTips",
      No: "endConversation",
    },
  },

  normalMilkProduction: {
    suggestions: [
      "Your cow's milk production seems normal. Ensure the cow is receiving balanced feed.",
      "Monitor the cow's health to ensure optimal conditions for milk production.",
      "Provide a consistent feeding schedule to avoid disruptions in milk production.",
    ],
    followUpQuestion: "Would you like more information on maintaining normal milk production?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "maintenanceTips",
      No: "endConversation",
    },
  },

  highMilkProduction: {
    suggestions: [
      "High milk production requires careful management. Make sure your cow is not overworked.",
      "Monitor the cow’s diet to ensure it's balanced with sufficient nutrients for sustained milk production.",
      "Provide rest periods to prevent overexertion and ensure long-term productivity.",
    ],
    followUpQuestion: "Would you like more tips on managing high milk production?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "highProductionManagement",
      No: "endConversation",
    },
  },

  feedTips: {
    suggestions: [
      "Store feed in a cool, dry place to preserve its nutrients.",
      "Gradually transition to new feed types to avoid upsetting the cow’s digestive system.",
      "Ensure the feed is rich in fiber and protein to promote milk production.",
      "Check feed labels for nutritional information and ensure it’s appropriate for lactating cows.",
    ],
    followUpQuestion: "Would you like more information about feed tips?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "feedTips",
      No: "endConversation",
    },
  },

  maintenanceTips: {
    suggestions: [
      "Ensure the cow is grazing in a comfortable environment with adequate space.",
      "Keep the cow’s living area clean and free of stressors.",
      "Provide regular health check-ups to ensure the cow is free from infections.",
    ],
    followUpQuestion: "Would you like more advice on maintaining a healthy cow for optimal productivity?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "maintenanceTips",
      No: "endConversation",
    },
  },

  highProductionManagement: {
    suggestions: [
      "Regularly monitor the cow’s weight to ensure it is not overworked.",
      "Provide additional feed supplements to support high milk output.",
      "Ensure the cow has plenty of rest and avoid milking it too frequently.",
    ],
    followUpQuestion: "Would you like more advice on managing cows with high milk production?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "highProductionManagement",
      No: "endConversation",
    },
  },

  healthConcerns: {
    question: "What health issue is your cow facing?",
    options: ["Lameness", "Mastitis", "Bloating", "Fever", "Other"],
    next: {
      "Lameness": "lameness",
      "Mastitis": "mastitis",
      "Bloating": "bloating",
      "Fever": "fever",
      "Other": "otherHealthIssues",
    },
  },

  lameness: {
    suggestions: [
      "Check for visible injuries or swelling in the legs.",
      "Consult a veterinarian for a lameness diagnosis.",
      "Ensure the cow is not walking on rough or uneven surfaces.",
    ],
    followUpQuestion: "Would you like more information on treating lameness?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "lamenessTreatment",
      No: "endConversation",
    },
  },

  mastitis: {
    suggestions: [
      "Mastitis can cause swelling and pain in the udder. Contact a vet for antibiotics if necessary.",
      "Ensure proper hygiene during milking to reduce the risk of infection.",
      "Use milking machines that are gentle and have the correct suction pressure.",
    ],
    followUpQuestion: "Would you like more information on treating mastitis?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "mastitisTreatment",
      No: "endConversation",
    },
  },

  bloating: {
    suggestions: [
      "Monitor for signs of excessive gas and distension in the cow’s abdomen.",
      "Ensure the cow has access to fresh water and appropriate feed.",
      "Consult a vet immediately if bloating symptoms persist.",
    ],
    followUpQuestion: "Would you like more information on treating bloating?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "bloatingTreatment",
      No: "endConversation",
    },
  },

  fever: {
    suggestions: [
      "Monitor the cow’s temperature regularly. A temperature over 39.5°C may indicate infection.",
      "Provide supportive care with fresh water and nutritious feed.",
      "Consult a veterinarian if the fever persists for more than 24 hours.",
    ],
    followUpQuestion: "Would you like more information on treating a fever?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "feverTreatment",
      No: "endConversation",
    },
  },

  otherHealthIssues: {
    question: "Please provide more details about the cow's health issue.",
    options: ["Digestive problems", "Breathing problems", "Skin conditions"],
    next: {
      "Digestive problems": "digestiveProblems",
      "Breathing problems": "breathingProblems",
      "Skin conditions": "skinConditions",
    },
  },

  behavioralIssues: {
    question: "What type of behavioral issue is your cow showing?",
    options: ["Aggression", "Separation anxiety", "Excessive vocalization", "Other"],
    next: {
      "Aggression": "aggression",
      "Separation anxiety": "separationAnxiety",
      "Excessive vocalization": "excessiveVocalization",
      "Other": "otherBehavioralIssues",
    },
  },

  aggression: {
    suggestions: [
      "Ensure the cow has enough space to move freely and isn’t stressed.",
      "Avoid sudden movements and loud noises around the cow.",
      "Consult a veterinarian or behavior specialist if aggression persists.",
    ],
    followUpQuestion: "Would you like more information on handling aggressive cows?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "aggressionHandling",
      No: "endConversation",
    },
  },

  separationAnxiety: {
    suggestions: [
      "Ensure the cow has a companion to reduce stress.",
      "Create a comfortable and familiar environment to ease anxiety.",
      "Consider providing extra attention or soothing routines to calm the cow.",
    ],
    followUpQuestion: "Would you like more advice on dealing with separation anxiety in cows?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "separationAnxietyHandling",
      No: "endConversation",
    },
  },

  excessiveVocalization: {
    suggestions: [
      "Ensure the cow has sufficient food and water supply.",
      "Excessive vocalization can also be a sign of distress. Look for any discomfort.",
      "Consult a veterinarian if the vocalization is persistent and unusual.",
    ],
    followUpQuestion: "Would you like more information on dealing with excessive vocalization?",
    followUpOptions: ["Yes", "No"],
    next: {
      Yes: "vocalizationHandling",
      No: "endConversation",
    },
  },

  otherBehavioralIssues: {
    question: "Please provide more details about the behavioral issue.",
    options: ["Stress-related", "Habitat-related", "Feeding-related"],
    next: {
      "Stress-related": "stressBehavior",
      "Habitat-related": "habitatBehavior",
      "Feeding-related": "feedingBehavior",
    },
  },

  endConversation: {
    message: "Thank you for using this service! Your cow's health and well-being are important. Please feel free to reach out again if you need more help.",
  },
};

function getNextStep(currentStep, userResponse) {
  if (!currentStep) return conversationFlow.start; // Start if no step is provided
  const nextStepKey = currentStep.next[userResponse];
  return conversationFlow[nextStepKey];
}

router.post("/conversation", (req, res) => {
  const { currentStepKey, userResponse } = req.body;

  const currentStep = conversationFlow[currentStepKey || "start"];
  if (!currentStep) {
    return res.status(400).json({ error: "Invalid conversation step." });
  }

  const nextStepKey = currentStep.next?.[userResponse];
  if (!nextStepKey) {
    return res.status(200).json({
      end: true,
      message: currentStep.message || "Conversation ended.",
    });
  }

  const nextStep = conversationFlow[nextStepKey];
  res.status(200).json({
    question: nextStep.question || null,
    options: nextStep.options || null,
    suggestions: nextStep.suggestions || null,
    followUpQuestion: nextStep.followUpQuestion || null,
    followUpOptions: nextStep.followUpOptions || null,
    stepKey: nextStepKey,
  });
});

module.exports = router;*/


