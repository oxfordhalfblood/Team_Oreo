const express = require ('express');
const bodyParser = require ('body-parser');

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

let session;

module.exports = function(app, ss) {
	app.use('/', router);
	session = ss;
};

router.all('/', (req, res, next) => {
    /* Setup any rendering variables or whatever.. */
    res.statusCode = 200;
    next()
});

router.get('/login', function(req, res, next) {
    res.render('login', {
        title: 'login/register',
        username: req.session.username,
        fname: req.session.fname,
        lname: req.session.lname,
        isAdmin: (req.session.usertype === "admin")
    });
});

router.get('/', function (req, res, next) {
    res.redirect("/documents");
});

router.get('/AboutUs', function(req, res, next) {
    res.render('AboutUs', {
        title: 'About Us',
        username: req.session.username,
        fname: req.session.fname,
        lname: req.session.lname,
        isAdmin: (req.session.usertype === "admin")
    });
});

router.get('/MeetUs', function(req, res, next) {
    res.render('MeetUs', {
        title: 'Meet Us',
        username: req.session.username,
        fname: req.session.fname,
        lname: req.session.lname,
        isAdmin: (req.session.usertype === "admin")
    });
});