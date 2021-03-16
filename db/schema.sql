DROP DATABASE IF EXISTS strava_app_db;
CREATE DATABASE strava_app_db;
USE strava_app_db;

CREATE TABLE users (
    id int NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    user_strava_id int,
    user_first VARCHAR(255),
    user_last VARCHAR(255),
    user_photo VARCHAR(255)
    
    PRIMARY KEY (id)
);