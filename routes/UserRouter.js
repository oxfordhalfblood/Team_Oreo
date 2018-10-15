const express = require ('express');
const bodyParser = require ('body-parser');

const router = express.Router();
router.use(bodyParser.json());

let database;

module.exports = function(app, db){
	database = db;
    app.use('/User', router);
};

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

/* Delete a user and all associated data */
router.post('/deleteUser/:user', (req, res, next) => {
    if (req.session.username) {
        let paramUser = req.params.user;

        /* If user is not admin and are trying to delete another user that's not themselves */
        if ((req.session.usertype !== "admin") && req.session.username !== paramUser) {
            res.status(403).send("Only admin can delete other users.");
            return;
        }

        database.deleteUser(paramUser, function(err) {
            if (err) {
                res.status(500).end("server error: " + err);
                return;
            }

            /* If the user deleted themselves, then log them out and erase their session */
            if (paramUser === req.session.username) {
                /* Destroy session uuid and redirect user to login page */
                req.session.destroy(function () {
                    res.redirect("/login");
                });
            } else {
                res.status(200).send("deleted user: " + paramUser);
            }
        });
    } else {
        res.status(403).end("You are not logged in.");
    }
});

/* Updating user's fullname */
router.post('/SetFullName/:user', (req, res, next) => {
    if (req.session.username) {
        let fname = req.body["fname"];
        let lname = req.body["lname"];

        let paramUser = req.params.user;

        /* If user is not admin and are trying to change a username not of their own */
        if ((req.session.usertype !== "admin") && req.session.username !== paramUser) {
            res.status(403).send("Only admin can change another users full name.");
            return;
        }

        database.updateUserFullname(paramUser, fname, lname, function (err) {
            if (err) {
                console.log("Database error: " + err);
                return;
            }
            if (req.session.username === paramUser) {
                /* Update their session details if they are changing their own username */
                req.session.fname = fname;
                req.session.lname = lname;
            }

            let msg = "Updated full name to: " + fname + ", " + lname;
            console.log(msg);

            res.status(200).redirect("/User/settings/" + paramUser);
        });
    } else {
        res.status(403).end("You are not logged in.");
    }
});

/* Updating user's password */
router.post('/SetPassword/:user', (req, res, next) => {
    if (req.session.username) {
        let p1 = req.body["new-password"];
        let p2 = req.body["confirm-new-password"];

        let paramUser = req.params.user;

        /* If user is not admin and are trying to change a password not of their own */
        if ((req.session.usertype !== "admin") && req.session.username !== paramUser) {
            res.status(403).send("Only admin can change another users password.");
            return;
        }

        /* Confirm password check */
        if (p1 !== p2) {
            res.status(500).send("Passwords do not match!");
            return;
        }

        database.updateUserPassword(paramUser, p1, function (err) {
            if (err) {
               console.log("Database error: " + err);
               return;
            }
            let msg = "Updating " + paramUser + "'s password to: " + p1;
            console.log(msg);

            res.status(200).redirect("/User/settings/" + paramUser);
        });
    } else {
        res.status(403).end("You are not logged in.");
    }
});

/* User settings */
router.get('/settings/:user', (req, res, next) => {
    if (req.session.username) {

        let paramUser = req.params.user;
        let isAdmin = (req.session.usertype === "admin");
        let renderVars = {
            title: 'Change User Settings',
            actionOnUser: req.session.username,
            username: req.session.username,
            fname: req.session.fname,
            lname: req.session.lname,
            isAdmin: isAdmin
        };

        if (!paramUser) {
            res.status(403).send("requires username to get settings page.");
            return;
        }

        /* Check if user is accessing a different user's settings page */
        if(paramUser !== req.session.username) {
            if (!isAdmin) {
                /* If user is not admin, they can not view settings page for another user */
                res.status(403).send("Unauthorised to get settings page of other users.");
            } else {
                /* It is admin and is viewing other user's settings page */

                /* Get Data for the user of the settings page that the admin is viewing */
                database.getUser(paramUser, function(err, rows) {
                    if (!err) {
                        renderVars["title"] = 'Change User Settings (as admin)';
                        renderVars["actionOnUser"] = paramUser;
                        renderVars["userInfo"] = {
                            username: rows[0].username,
                            fname: rows[0].fname,
                            lname: rows[0].lname
                        };
                    }
                    /* Render the page for the admin, with variables obtained from the user it is belonging to. */
                    res.render('UserSettings', renderVars);
                });
            }
        } else {
            /* User is accessing their own settings page */
            res.render('UserSettings', renderVars);
        }
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