const router = require('express').Router();
const stravaApi = require('strava-v3');
// This is the Access Token that expires every now and then. Grab it from oAuth?
const strava = new stravaApi.client('623a9a58d2f4c79c5ac3422ab85b46bd4d5d3889');

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
        activity_type: 'cycling'});
    var callback = function(error, data, response) {
        if (error) {
          console.error(error);
        } else {
            console.log(data)
          res.json(data)
        }
    };

    strava.segments.explore(bounds, callback)
})

module.exports = router;