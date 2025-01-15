const express = require("express");
let router = express.Router();
const axios = require("axios");
var symptomModel = require("../../models/symptoms");
// var catalogModel = require("../../models/catalog")

router.get("/", async (req, res) => {
  let symptom = await symptomModel.find();
  return res.send(symptom);
});

router.get("/:id", async (req, res) => {
  try {
    // Fetch all unique cow IDs
    const cowId = req.params.id;

    // Fetch the latest entry for the specified cow by sorting on date and time
    const cowHealthData = await symptomModel
      .findOne(
        { cow_id: cowId.toString() }
        // ,
        //  { disease: 0 }
      )
      .sort({ date: -1, time: -1 })
      .exec();

    // Check if health data was found for the cow
    if (!cowHealthData) {
      return res
        .status(404)
        .json({ message: `No health data found for cow ID: ${cowId}` });
    }

    // Prepare data for model prediction
    const formattedData = {
      anorexia: cowHealthData.anorexia,
      abdominal_pain: cowHealthData.abdominal_pain,
      anaemia: cowHealthData.anaemia,
      abortions: cowHealthData.abortions,
      acetone: cowHealthData.acetone,
      aggression: cowHealthData.aggression,
      arthrogyposis: cowHealthData.arthrogyposis,
      ankylosis: cowHealthData.ankylosis,
      anxiety: cowHealthData.anxiety,
      bellowing: cowHealthData.bellowing,
      blood_loss: cowHealthData.blood_loss,
      blood_poisoning: cowHealthData.blood_poisoning,
      blisters: cowHealthData.blisters,
      colic: cowHealthData.colic,
      Condemnation_of_livers: cowHealthData.Condemnation_of_livers,
      conjunctivae: cowHealthData.conjunctivae,
      coughing: cowHealthData.coughing,
      depression: cowHealthData.depression,
      discomfort: cowHealthData.discomfort,
      dyspnea: cowHealthData.dyspnea,
      dysentery: cowHealthData.dysentery,
      diarrhoea: cowHealthData.diarrhoea,
      dehydration: cowHealthData.dehydration,
      drooling: cowHealthData.drooling,
      dull: cowHealthData.dull,
      decreased_fertility: cowHealthData.decreased_fertility,
      diffculty_breath: cowHealthData.diffculty_breath,
      emaciation: cowHealthData.emaciation,
      encephalitis: cowHealthData.encephalitis,
      fever: cowHealthData.fever,
      facial_paralysis: cowHealthData.facial_paralysis,
      frothing_of_mouth: cowHealthData.frothing_of_mouth,
      frothing: cowHealthData.frothing,
      gaseous_stomach: cowHealthData.gaseous_stomach,
      highly_diarrhoea: cowHealthData.highly_diarrhoea,
      high_pulse_rate: cowHealthData.high_pulse_rate,
      high_temp: cowHealthData.high_temp,
      high_proportion: cowHealthData.high_proportion,
      hyperaemia: cowHealthData.hyperaemia,
      hydrocephalus: cowHealthData.hydrocephalus,
      isolation_from_herd: cowHealthData.isolation_from_herd,
      infertility: cowHealthData.infertility,
      intermittent_fever: cowHealthData.intermittent_fever,
      jaundice: cowHealthData.jaundice,
      ketosis: cowHealthData.ketosis,
      loss_of_appetite: cowHealthData.loss_of_appetite,
      lameness: cowHealthData.lameness,
      lack_of_coordination: cowHealthData.lack_of_coordination ?? 0,
      lethargy: cowHealthData.lethargy,
      lacrimation: cowHealthData.lacrimation,
      milk_flakes: cowHealthData.milk_flakes,
      milk_watery: cowHealthData.milk_watery,
      milk_clots: cowHealthData.milk_clots,
      mild_diarrhoea: cowHealthData.mild_diarrhoea,
      moaning: cowHealthData.moaning,
      mucosal_lesions: cowHealthData.mucosal_lesions,
      milk_fever: cowHealthData.milk_fever,
      nausea: cowHealthData.nausea,
      nasel_discharges: cowHealthData.nasel_discharges,
      oedema: cowHealthData.oedema,
      pain: cowHealthData.pain,
      painful_tongue: cowHealthData.painful_tongue,
      pneumonia: cowHealthData.pneumonia,
      photo_sensitization: cowHealthData.photo_sensitization,
      quivering_lips: cowHealthData.quivering_lips,
      reduction_milk_vields: cowHealthData.reduction_milk_vields,
      rapid_breathing: cowHealthData.rapid_breathing,
      rumenstasis: cowHealthData.rumenstasis,
      reduced_rumination: cowHealthData.reduced_rumination,
      reduced_fertility: cowHealthData.reduced_fertility,
      reduced_fat: cowHealthData.reduced_fat,
      reduces_feed_intake: cowHealthData.reduces_feed_intake,
      raised_breathing: cowHealthData.raised_breathing,
      stomach_pain: cowHealthData.stomach_pain,
      salivation: cowHealthData.salivation,
      stillbirths: cowHealthData.stillbirths,
      shallow_breathing: cowHealthData.shallow_breathing,
      swollen_pharyngeal: cowHealthData.swollen_pharyngeal,
      swelling: cowHealthData.swelling,
      saliva: cowHealthData.saliva,
      swollen_tongue: cowHealthData.swollen_tongue,
      tachycardia: cowHealthData.tachycardia,
      torticollis: cowHealthData.torticollis,
      udder_swelling: cowHealthData.udder_swelling,
      udder_heat: cowHealthData.udder_heat,
      udder_hardeness: cowHealthData.udder_hardeness,
      udder_redness: cowHealthData.udder_redness,
      udder_pain: cowHealthData.udder_pain,
      unwillingness_to_move: cowHealthData.unwillingness_to_move,
      ulcers: cowHealthData.ulcers,
      vomiting: cowHealthData.vomiting,
      weight_loss: cowHealthData.weight_loss,
      weakness: cowHealthData.weakness,
    };
    console.log(formattedData);

    const activeSymptoms = Object.entries(formattedData)
    .filter(([key, value]) => value === 1)
    .map(([key]) => key);


    const modelResponse = await axios.post(
      "http://127.0.0.1:8000/symptoms",
      formattedData,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    const predictionLabel = modelResponse.data.predicted_cow_disease;
    console.log(`Prediction result for cow ${cowId}:`, predictionLabel);

    // Update the health status in the database for this cow
    await symptomModel.updateOne(
      { cow_id: cowId.toString() },
      { $set: { disease: predictionLabel } }
    );

    // Send the prediction as a response
    res.json({ cowId, prediction: predictionLabel, activeSymptoms});
  } catch (error) {
    console.error("Error fetching cow health data or predicting:", error);
    res.status(500).json({ error: "An error occurred during prediction" });
  }
});

module.exports = router;
