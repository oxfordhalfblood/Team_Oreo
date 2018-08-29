const express = require ('express');
const bodyParser = require ('body-parser');
const router = express.Router();

router.use(bodyParser.json());

var database;

module.exports = function(app, db) {
	app.use('/dbtest', router);
	database = db;
};

function processData(res, sql){
	database.serialize(function() {
	  database.all(sql, 
		function(err, rows) {
		  if(err){
			console.error(err);
			res.status(500).send(err);
		  }
		  else
			sendData(res, rows, err);
	  });
	});
}

function sendData(res, data, err){
	res.setHeader("Access-Control-Allow-Origin","*");

	if(data[0])
		res.send(data);
	else{
		res.status(404).send("empty rows returned by database.");
	}
}

router.get('/api/user/:id', (req, res) => {
	//console.log(req.params.id);
    processData(res, "SELECT * FROM USER where fname = '" + req.params.id + "'");
});
router.get('/api/user', (req, res) => {
	processData(res, "SELECT * FROM USER");
});


router.post('/api/user', (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");

	usr = req.body;
    var username = usr.username;
    var fname = usr.fname;
    var lname = usr.lname;
    var usertype = usr.usertype;
    var passwd = usr.passwd;

	// TODO: Validation.
    var sql = "insert into USER (username, fname, lname, usertype, passwd) VALUES (?, ?, ?, ?, ?);";

    var values = [username, fname, lname, usertype, passwd];

	console.log(values);

    database.serialize(function () {
        database.run(sql, values, function (err) {
            if (err){
                console.error(err);
                res.status(500).send(err);
            }
            else {
                res.status(200).send('Query success!');
			}
        });
    });
});


router.put('/api/user', (req, res) => {
	res.status(400).send("put not suported");
});

router.delete('/api/user/:id', (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	var id = req.params.id;

    if(!id){
        res.status(400).send("ID is mandatory");
		console.log(id);
    }

    else{
        var sql = `delete from  USER where username = ?;`;
        var values = [id];

        database.serialize(function () {
            database.run(sql, values, function (err) {
                if (err){
                    console.error(err);
                    res.status(500).send(err);
                }
                else
                    res.send();
            });
        });
    }
});

router.get('/', function (req, res, next) {
	var dbData = [];
	database.serialize(() => {
		database.each(`SELECT * FROM USER`, (err, row) => {
			if (err) {
				console.error(err.message);
			}
			dbData.push(
				row.username + " " +
				row.fname + " " +
				row.lname + " " +
				row.usertype + " " +
				row.passwd
			);
			console.log(row.username + "\t" + row.passwd);
		});
	});
    res.render('databaseDisplay', {
        title: 'Database stuff',
        condition: false,
        anyArray: dbData
    });
});

/*
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});
*/

