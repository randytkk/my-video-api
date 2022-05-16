const db = require("../models");
const user = require("../models/user");
const User = db.users;
const video = require("../models/video");
const Video = db.videos;
const Op = db.Sequelize.Op;
const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
    return { limit, offset };
};
const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: videos } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, videos, totalPages, currentPage };
};

// Add a new video
exports.create = (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.url || !req.body.thumbnailUrl ) {
        res.status(400).send({
            message: "Name, URL and/or Thumbnail URL is not provided!"
        });
        return;
    }
    try {
        new URL(req.body.url);
        new URL(req.body.thumbnailUrl );
    } catch (e) {
        res.status(400).send({
            message: "URL or Thumbnail URL is not valid!"
        });
        return;
    }

    // Assign username and api key
    let username = (req.headers.username) ? req.headers.username: null
    let apikey = (req.headers.apikey) ? req.headers.apikey: null

    // Determine video privacy
    let isPrivate = (req.body.isPrivate == "true") ? true: false

    // Create video record in the database
    User.findOne({
        where: {
            username: username,
            apiKey: apikey,
            isDeleted: false
        }
    })
        .then(data => {
            username = (data) ? data.username: null
            if (!data && isPrivate == true) {
                res.status(403).send({
                    message: "Only authorised users can add private videos."
                });
                return;
            }
            const video = {
                name: req.body.name,
                url: req.body.url,
                thumbnailUrl : req.body.thumbnailUrl,
                isPrivate: isPrivate,
                username: username
            };
            Video.create(video)
                .then(data => {
                    res.send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message: "An error occurred while adding the video."
                    });
                });
        });
};

// Retrieve a list of videos
exports.findAll = (req, res) => {
    // Pagination settings, if provided
    const {limit, offset} = getPagination(req.body.page, req.body.size);
    // Add filter to filter by name of video
    let nameFilter = null
    if (req.body.name) {
        nameFilter = {name: {[Op.like]: "%" + req.body.name + "%"}}
    }
    // Add filter for restricting to videos viewed more than 42 times (popular)
    let timesViewed = (req.body.popular == "true") ? 43: 0
    // Assign username and api key
    let username = (req.headers.username) ? req.headers.username: null
    let apikey = (req.headers.apikey) ? req.headers.apikey: null

    // Get all videos based on filters
    User.findOne({
        where: {
            username: username,
            apiKey: apikey,
            isDeleted: false
        }
    })
        .then(data => {
            // Build filter
            let filters = [{isPrivate: false}]
            if (!data && req.body.includePrivate == "true") {
                res.status(403).send({
                    message: "Only authorised users can view private videos."
                });
                return;
            }
            if (data && req.body.includePrivate == "true") {
                if (data.role == "user") {
                    filters.push({isPrivate: true, username: data.username})
                }
                if (data.role == "admin") {
                    filters.push({isPrivate: true})
                }
            }
            Video.findAndCountAll({
                where: {
                    [Op.and]: [
                        {[Op.or]: filters},
                        {timesViewed: {[Op.gte]: timesViewed}},
                        nameFilter
                    ] 
                },
                limit,
                offset
            })
                .then(data => {
                    const response = getPagingData(data, req.body.page, limit);
                    res.send(response);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                        err.message || "Some error occurred while retrieving videos."
                    });
                });
        });
};

// Retrieve a single video
exports.findOne = (req, res) => {
    const video_id = req.params.video_id

    // Assign username and api key
    let username = (req.headers.username) ? req.headers.username: null
    let apikey = (req.headers.apikey) ? req.headers.apikey: null

    // Get a video
    User.findOne({
        where: {
            username: username,
            apiKey: apikey,
            isDeleted: false
        }
    })
        .then(data => {
            // Build filter
            let filters = [{isPrivate: false}]
            if (data) {
                if (data.role == "user") {
                    filters.push({isPrivate: true, username: data.username})
                }
                if (data.role == "admin") {
                    filters.push({isPrivate: true})
                }
            }
            Video.findOne({where: {
                [Op.and]: [
                    {[Op.or]: filters},
                    {id: video_id}
                ] 
            }})
                .then(data => {
                    if (data) {
                        Video.update({
                            timesViewed: data.timesViewed + 1
                        }, {
                            where: { id: video_id }
                        })
                        res.send(data);
                    } else {
                        res.status(404).send({
                            message: `Cannot find video with id=${video_id}.`
                        });
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        message: "Error retrieving video with id=" + video_id
                    });
                });
        });
};

// Update details of a video
exports.update = (req, res) => {
    const video_id = req.params.video_id
    // Validate request
    if (!req.headers.username || !req.headers.apikey) {
        res.status(400).send({
            message: "Username or API key is not provided!"
        });
        return;
    }
    if (!req.body.name && !req.body.url && !req.body.thumbnailUrl && !req.body.isPrivate) {
        res.status(400).send({
            message: "No fields to update are provided!"
        });
        return;
    }
    if (req.body.url) {
        try {
            new URL(req.body.url);
        } catch (e) {
            res.status(400).send({
                message: "URL is not valid!"
            });
            return;
        }
    }
    if (req.body.thumbnailUrl) {
        try {
            new URL(req.body.thumbnailUrl );
        } catch (e) {
            res.status(400).send({
                message: "Thumbnail URL is not valid!"
            });
            return;
        }
    }
    
    // Add fields to update
    let updates = {}
    if (req.body.name) {
        updates["name"] = req.body.name
    }
    if (req.body.url) {
        updates["url"] = req.body.url
    }
    if (req.body.thumbnailUrl) {
        updates["thumbnailUrl"] = req.body.thumbnailUrl
    }
    if (req.body.isPrivate) {
        updates["isPrivate"] = req.body.isPrivate
    }

    // Update a video
    User.findOne({
        where: {
            username: req.headers.username,
            apiKey: req.headers.apikey,
            isDeleted: false
        }
    })
        .then(data => {
            if (data) {
                // Build filter
                let filters = [{isPrivate: false}]
                if (data.role == "user") {
                    filters.push({isPrivate: true, username: data.username})
                }
                if (data.role == "admin") {
                    filters.push({isPrivate: true})
                }
                Video.update(updates, {
                    where: {
                        [Op.and]: [
                            {[Op.or]: filters},
                            {id: video_id}
                        ] 
                    }
                })
                    .then(num => {
                        if (num == 1) {
                            res.send({
                                message: "Video was updated successfully."
                            });
                        } else {
                            res.send({
                                message: `Cannot update video with id=${video_id}.`
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: "Error updating video with id=" + video_id
                        });
                    });
            } else {
                res.status(401).send({
                    message: `User is not authorised to perform this task.`
                });
            }



        })
};

// Delete a video
exports.delete = (req, res) => {
    const video_id = req.params.video_id

    // Validate request
    if (!req.headers.username || !req.headers.apikey) {
        res.status(400).send({
            message: "Username or API key is not provided!"
        });
        return;
    }

    // Get authorised user
    User.findOne({
        where: {
            username: req.headers.username,
            apiKey: req.headers.apikey,
            isDeleted: false
        }
    })
        .then(data => {
            if (data) {
                // Build filter
                let restrictionFilter = null
                if (data.role == "user") {
                    restrictionFilter = {username: data.username}
                }
                Video.destroy({
                    where: {
                        [Op.and]: [
                            restrictionFilter,
                            {id: video_id}
                        ] 
                    }
                })
                    .then(num => {
                        if (num == 1) {
                            res.send({
                                message: "The video was deleted successfully."
                            });
                        } else {
                            res.send({
                                message: `Cannot delete video with id=${video_id}.`
                            });
                        }
                    })
                    .catch(err => {
                        res.status(500).send({
                            message: "Error deleting video with id=" + video_id
                        });
                    });
            } else {
                res.status(401).send({
                    message: `User is not authorised to perform this task.`
                });
            }
        });
};
