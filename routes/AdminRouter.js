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
        //res.status(403).end("You are not logged in.");
        res.redirect("/login");
        return;
    }
    if (req.session.usertype !== "admin") {
        res.status(403).end("Only admin can access this page.");
        return;
    }
    res.statusCode = 200;
    next()
});

router.get('/dashboard', (req, res, next) => {
    database.getAllUsers(function (err, rows) {

        /* Flag users that are admin to make it easier for the
         * templating engine to determine admins from students
         */
        rows.forEach( function (row) {
            if (row.usertype === "admin") {
                row.isAdmin = true;
            }
        });

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

/* Display profile for specific user */
router.get('/profile/:user', function (req, res, next) {
    let user = req.params.user;
    if (!user) {
        res.status(304).send("username is required to view a users profile!");
        return;
    }

    database.getDocuments(user, function (result) {
        let documents = result;

        /* Get Data for the user of the profile that the admin is viewing */
        database.getUser(user, function(err, rows) {
            if (!err) {
                let userInfo = {
                    username: rows[0].username,
                    fname: rows[0].fname,
                    lname: rows[0].lname
                };
                res.render('UserDocuments', {
                    title: "profile view (as admin)",
                    userInfo: userInfo,
                    username: req.session.username,
                    fname: req.session.fname,
                    lname: req.session.lname,
                    isAdmin: (req.session.usertype === "admin"),
                    documents: documents
                });
            }
        });
    });
});

/* Promote a user to Admin */
router.post('/Promote/:user&:type', (req, res, next) => {
    let paramUser = req.params.user;
    let paramType = req.params.type;

    database.updateUserType(paramUser, paramType, function(err) {
        if (err) {
            res.status(500).end("server error: " + err);
            return;
        }

        res.status(200).send("Updated " + paramUser + " usertype to " + paramType);
    });
});