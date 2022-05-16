module.exports = app => {
    const users = require("../handlers/user.js");
    var router = require("express").Router();

    // Create a new user
    router.post("/register", users.create);
    // 'Delete' a user
    router.put("/:username/unregister", users.update);
    // Retrieve all users
    router.get("/all", users.findAll);
    // Retrieve a single user with id
    router.get("/:username", users.findOne);

    app.use('/user', router);
};