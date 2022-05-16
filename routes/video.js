module.exports = app => {
    const videos = require("../handlers/video.js");
    var router = require("express").Router();

    // Add a new video
    router.post("/", videos.create);
    // Retrieve a list of videos
    router.get("/list", videos.findAll);
    // Retrieve a single video
    router.get("/:video_id", videos.findOne);
    // Update details of a video
    router.put("/:video_id/update", videos.update);
    // Delete a video
    router.delete("/:video_id", videos.delete);

    app.use('/video', router);
};
