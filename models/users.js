const {Sequelize, DataTypes} = require ('sequelize');
const sequelize = require('../config/connection');

const Users = sequelize.define('users', {
    user_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_strava_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_first: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_last: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_photo: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{timestamps: false}
);

Users.sync();

module.exports = Users;