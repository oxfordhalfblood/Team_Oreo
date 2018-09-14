const express = require ('express');
const bodyParser = require ('body-parser');

const router = express.Router();
router.use(bodyParser.json());

let database;

module.exports = function(app, db){
	database = db;
    app.use('/User', router);
};

router.put('/:username', (req, res, next) => {
    res.status(403).send("update on user not supported");
});

router.post('/register', (req, res, next) => {
    let user = req.body["username"];
    let fname = req.body["fname"];
    let lname = req.body["lname"];
    let type = "student";
    let p1 = req.body["password"];
    let p2 = req.body["confirm-password"];

    /* Confirm password check */
    if (p1 !== p2) {
        res.status(500).send("Passwords do not match!");
        return;
    }

    database.addUser(
        user, fname, lname, type, p1,
        function(err) {
            if (err) {
                console.log("Error adding user: " + err);
                res.status(500).send(err);
                return;
            }
            res.status(200).send("Added user");
        }
    );
});

router.get('/logout', (req, res, next) => {
    /* Destroy session uuid and redirect user to login page */
    req.session.destroy(function () {
        res.redirect("/login");
    });
});

router.post('/login', (req, res, next) => {
    if (req.session.username) {
        res.end('You are already logged in as: ' + req.session.username + ' cookie expires in: ' + (req.session.cookie.maxAge / 1000));
        return;
    }

	let username = req.body["username"];
    let password = req.body["password"];

	/* Find user */
    database.getUser(username,
        function (err, rows) {
		console.log("attempting search for: " +username + " " + password + "in db");
            if(err){
				console.log ("db error");
                console.error(err);
            }
            else {
                rows.forEach(function(row) {
					console.log ("found");
                	if (row.passwd === password) {
                        console.log("Successful login: " + username);
                        req.session.username = row.username;
                        req.session.fname = row.fname;
                        req.session.lname = row.lname;
                        req.session.usertype = row.usertype;

                        res.redirect("/");
                        res.end("Ok");
					} else {
                        res.end("Invalid password for user: " + username);
					}
                });
            }
            res.status(500).end("Invalid login");
        }
	);
});

/* Updating user's fullname */
router.post('/SetFullName', (req, res, next) => {
    if (req.session.username) {
        let fname = req.body["fname"];
        let lname = req.body["lname"];

        database.updateUserFullname(req.session.username, fname, lname, function (err) {
            if (err) {
                console.log("Database error: " + err);
                return;
            }
            req.session.fname = fname;
            req.session.lname = lname;

            let msg = "Updated full name to: " + fname + ", " + lname;
            console.log(msg);

            res.status(200).redirect("/User/settings");
        });
    } else {
        res.status(403).end("You are not logged in.");
    }
});

/* Updating user's password */
router.post('/SetPassword', (req, res, next) => {
    if (req.session.username) {
        let p1 = req.body["new-password"];
        let p2 = req.body["confirm-new-password"];

        /* Confirm password check */
        if (p1 !== p2) {
            res.status(500).send("Passwords do not match!");
            return;
        }

        database.updateUserPassword(req.session.username, p1, function (err) {
            if (err) {
               console.log("Database error: " + err);
               return;
            }
            let msg = "Updating " + req.session.username + "'s password to: " + p1;
            console.log(msg);

            res.status(200).redirect("/User/settings");
        });
    } else {
        res.status(403).end("You are not logged in.");
    }
});

/* User settings */
router.get('/settings', (req, res, next) => {
    if (req.session.username) {
        res.render('UserSettings', {
            title: 'Change User Settings',
            username: req.session.username,
            fname: req.session.fname,
            lname: req.session.lname,
            isAdmin: (req.session.usertype === "admin")
        });
    } else {
        res.status(403).end("You are not logged in.");
    }
});

/* Utility route for getting userdata with ajax */
router.get('/current', function (req, res, next) {
	if (req.session.username) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            username: req.session.username,
        	fname: req.session.fname,
        	lname: req.session.lname,
        	usertype: req.session.usertype
		}));
	} else {
        res.status(403).end("You are not logged in.");
	}
});