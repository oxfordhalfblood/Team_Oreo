const express = require ('express');
const bodyParser = require ('body-parser');

const router = express.Router();
router.use(bodyParser.json());

let database;

module.exports = function(app, db){
	database = db;
    app.use('/Admin', router);
};

router.all('/*', (req, res, next) => {
    if (!req.session.username) {
        res.status(403).end("You are not logged in.");
        return;
    }
    if (req.session.usertype !== "admin") {
        res.status(403).end("Only admin can view this page.");
        return;
    }
    res.statusCode = 200;
    next()
});

router.get('/dashboard', (req, res, next) => {
    database.getAllUsers(function (err, rows) {
        if (err) {
            return;
        }
        res.render('AdminDashboard', {
            title: 'Admin Dashboard',
            username: req.session.username,
            fname: req.session.fname,
            lname: req.session.lname,
            isAdmin: (req.session.usertype === "admin"),
            users: rows
        });
    });
});

/* Delete a user and all associated data */
router.post('/deleteUser', (req, res, next) => {
    res.status(403).send("Not implemented");
});