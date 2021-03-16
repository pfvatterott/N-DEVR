const router = require('express').Router();

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

module.exports = router;