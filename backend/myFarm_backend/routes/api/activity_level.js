const express = require("express");
let router = express.Router();
var activityModel = require("../../models/activity_level")

router.get("/", async(req,res) => {
    let activity = await activityModel.find();
    return res.send(activity);
});

module.exports = router;