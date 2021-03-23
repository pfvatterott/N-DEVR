const {Sequelize, DataTypes} = require ('sequelize');
const sequelize = require('../config/connection');

const Users = sequelize.define('users', {
    user_name: {
        type: DataTypes.STRING,
    },
    user_strava_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_first: {
        type: DataTypes.STRING,
    },
    user_last: {
        type: DataTypes.STRING,
    },
    user_photo: {
        type: DataTypes.STRING,
    },
    access_token: {
        type: DataTypes.STRING,
    }
},
{timestamps: false}
);

Users.sync();

module.exports = Users;