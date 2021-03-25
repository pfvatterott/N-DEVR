const {Sequelize, DataTypes} = require ('sequelize');
const sequelize = require('../config/connection');

const Activities = sequelize.define('activities', {
    activity_name: {
        type: DataTypes.STRING,
    },
    elevation_gained: {
        type: DataTypes.INTEGER,
    },
    elevation_lost: {
        type: DataTypes.INTEGER,
    },
    activity_creator: {
        type: DataTypes.STRING,
    },
    activity_segments: {
        type: DataTypes.STRING,
    }
},
{timestamps: false}
);

Activities.sync();

module.exports = Activities;