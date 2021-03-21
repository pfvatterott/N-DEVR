const router = require('express').Router();
const stravaApi = require('strava-v3');
const stravaPassport = require('../config/passport-setup')
const Users = require('../models/users'); 



const authCheck = (req, res, next) => {
    // checks if user is logged in
    if(!req.user){
        // if user is not logged in
        res.redirect('/auth/login');
    }
    else {
        next();
    }
}

router.get('/', authCheck, (req, res) => {
    console.log(req.user[0]._previousDataValues)
    const hbsObject = {
        user: req.user[0]._previousDataValues,
    }
    console.log(hbsObject)
    res.render('profile', hbsObject);
})

router.get('/activity', (req, res) => {
    res.render('activity')

})

router.get('/activity/:coords', (req, res) => {
    let data = [];
    var bounds = ({
        bounds: req.params.coords,
        activity_type: 'road'});
    var callback = function(error, data, response) {
        if (error) {
          console.error(error);
        } else {
            console.log(data)
          res.json(data)
        }
    };

    // Pulls access token from database to access strava segments API
    const strava = new stravaApi.client(req.user[0]._previousDataValues.access_token)

    strava.segments.explore(bounds, callback)
});

router.get('/segment/:stream', (req, res) => {
    const id = req.params.stream;
    const keys = ['distance', 'latlng', 'altitude'];
    const key_by_type = true;
    let args = ({
        id: id,
        types: keys,
        key_by_type: key_by_type
    })

    var callback = function(error, data, response) {
        if (error) {
          console.error(error);
        } else {
            console.log(data)
          res.json(data)
        }
    };

    const strava = new stravaApi.client(req.user[0]._previousDataValues.access_token)
    strava.streams.segment(args, callback)



})

module.exports = router;