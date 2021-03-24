DROP DATABASE IF EXISTS strava_app_db;
CREATE DATABASE strava_app_db;
USE strava_app_db;

CREATE TABLE users (
    id int NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255),
    user_strava_id int,
    user_first VARCHAR(255),
    user_last VARCHAR(255),
    user_photo VARCHAR(255),
    access_token VARCHAR(255),
    
    PRIMARY KEY (id)
);

CREATE TABLE activities {
    id int NOT NULL AUTO_INCREMENT,
    activity_name VARCHAR(255),
    activity_description VARCHAR(255),
    elevation_gained VARCHAR(255),
    elevation_lost VARCHAR(255),
    activity_creator int,
    invited_members SET,
    activity_segments SET,

    PRIMARY KEY (id)

}