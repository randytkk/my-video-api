module.exports = (sequelize, Sequelize) => {
    const Video = sequelize.define('video', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        url: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        thumbnailUrl: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isPrivate: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        timesViewed: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    });
    return Video
};
