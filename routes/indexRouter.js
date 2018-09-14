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

const links = ["dbtest", "documents", "login"];

router.all((req, res, next) => {
    res.statusCode = 200;
    //res.setHeader('content-type', 'text/plain');
    next()
});

router.all('/', (req, res, next) => {
    /* Setup any rendering variables or whatever.. */
    res.statusCode = 200;
    next()
});

router.get('/login', function(req, res, next) {
    res.render('login', {
        title: 'login/register',
        anyArray: links,
        username: req.session.username,
        fname: req.session.fname,
        lname: req.session.lname,
        isAdmin: (req.session.usertype === "admin")
    });
});

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'NoDupli Index',
        anyArray: links,
        username: req.session.username,
        fname: req.session.fname,
        lname: req.session.lname,
        isAdmin: (req.session.usertype === "admin")
    });
});

