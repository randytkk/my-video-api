const db = require("../models");
const user = require("../models/user");
const User = db.users;
const Op = db.Sequelize.Op;

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
    // Validate request
    if (!req.headers.username || !req.headers.apikey) {
        res.status(400).send({
            message: "Username or API key is not provided!"
        });
        return;
    }

    // Get all users only if authorised
    const username = req.params.username;
    User.findOne({
        where: {
            username: req.headers.username,
            apiKey: req.headers.apikey,
            isDeleted: false
        }
    })
        .then(data => {
            if (data) {
                if (data.role == "admin" || username == req.headers.username) {
                    User.findAll()
                        .then(data => {
                            res.send(data);
                        })
                        .catch(err => {
                            res.status(500).send({
                                message:
                                err.message || "Some error occurred while retrieving users."
                            });
                        });
                    } else {
                        res.status(401).send({
                            message: `User is not authorised to perform this task.`
                        });
                    }
                } else {
                    res.status(404).send({
                        message: `Authorised user is not found.`
                    });
                }
            });
};

// Find a user using the id
exports.findOne = (req, res) => {
    // Validate request
    if (!req.headers.username || !req.headers.apikey) {
        res.status(400).send({
            message: "Username or API key is not provided!"
        });
        return;
    }

    // Get user only if authorised
    const username = req.params.username;
    User.findOne({
        where: {
            username: req.headers.username,
            apiKey: req.headers.apikey,
            isDeleted: false
        }
    })
        .then(data => {
            if (data) {
                if (data.role == "admin" || username == req.hader.username) {
                    User.findOne({ where: { username: username } })
                        .then(data => {
                            if (data) {
                                res.send(data);
                            } else {
                                res.status(404).send({
                                    message: `Cannot find user with username=${username}.`
                                });
                            }
                        })
                        .catch(err => {
                        res.status(500).send({
                            message: "Error retrieving user with username=" + username
                        });
                    });
                } else {
                    res.status(401).send({
                        message: `User is not authorised to perform this task.`
                    });
                }
            } else {
                res.status(404).send({
                    message: `Authorised user is not found.`
                });
            }
        });
};

// Create a new user
exports.create = (req, res) => {
    // Validate request
    if (!req.body.username) {
        res.status(400).send({
            message: "Username is not provided!"
        });
        return;
    }
    // Create a user
    const user = {
        username: req.body.username
    };
    // Save user in the database
    User.create(user)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "An error occurred while creating the user."
            });
        });
};

// 'Delete' a user
exports.update = (req, res) => {
    // Validate request
    if (!req.headers.username || !req.headers.apikey) {
        res.status(400).send({
            message: "Username or API key is not provided!"
        });
        return;
    }

    // Update user only if authorised
    const username = req.params.username;
    User.findOne({
        where: {
            username: req.body.username,
            apiKey: req.body.apikey,
            isDeleted: false
        }
    })
        .then(data => {
            if (data) {
                if (data.role == "admin" || username == req.body.username) {
                    User.update({
                        isDeleted: true
                    }, {
                        where: { username: username }
                    })
                    .then(num => {
                        if (num == 1) {
                            res.send({
                                message: "User was updated successfully."
                            });
                        } else {
                            res.send({
                                message: `Cannot update user with username=${username}. Maybe user requesting was not found or req.body is empty!`
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: "Error updating user with username=" + username
                        });
                    });
                } else {
                    res.status(401).send({
                        message: `User is not authorised to perform this task.`
                    });
                }
            } else {
                res.status(404).send({
                    message: `Authorised user is not found.`
                });
            }
        });
};
