const express = require ('express');
const bodyParser = require ('body-parser');
const path = require('path');
const multer = require('multer');

/* Setup router stuff */
const router = express.Router();
router.use(bodyParser.json());

/* Populate locals with passed in modules */
let database;
module.exports = function(app, db) {
    database = db;
	app.use('/documents', router);
};

/* Setup file uploading */
let storage = multer.diskStorage({
	destination: function(req, file, callback) {
			callback(null, './uploads');
	},
	filename: function(req, file, callback) {
	    /* Storing date as unix epoch time for uniqueness */
		callback(null, req.session.username + '-' + Date.now() + ".txt");
	}
});
let upload = multer({ storage: storage }).single('userFile');

/* Define routes */
router.all('/*', (req, res, next) => {
	if (!req.session.username) {
        res.status(403).end("You are not logged in.");
        return;
	}
    res.statusCode = 200;
    next()
});

router.get('/', function (req, res, next) {
    let documents;
    database.getDocuments(req.session.username, function (result) {
        documents = result;

        res.render('documentUpload', {
            title: 'Upload documents here.',
            condition: false,
            username: req.session.username,
            fname: req.session.fname,
            lname: req.session.lname,
            isAdmin: (req.session.usertype === "admin"),
            documents: documents
        });
    });
});

router.post('/', (req, res, next) => {
    upload(req, res, function(err) {
        if (err){
            res.status(500).send("File upload failed!");
            return;
        }
        if (!req.file) {
            res.status(500).send("No file selected!");
            return;
        }

        /* Store a database record of the uploaded file */
        let date = new Date;
        database.addDocument(req.session.username, req.file.filename, req.file.originalname, date.toISOString(), function (err) {
            if(err) {
                console.log("Database error: " + err);
                return;
            }
            console.log("Uploaded: " + req.file.filename);
            res.redirect("/documents");
            res.end("File is uploaded");
        });
    });
});

/* Delete a document.
* Justification for using GET instead of DELETE:
* I don't want to make a ajax call from client side.
*
* Has a security flaw where if a user can guess a filename, they can delete any document
* not belonging to them, but this is fine since this is a non-srs project. */
router.get('/delete/:filename', (req, res, next) => {
    let filename = req.params.filename;
    if (!filename) {
        res.status(304).send("filename is required to delete a document!");
        return;
    }
    database.deleteDocument(filename, function (err) {
        if (err) {
            res.status(500).send("Error deleting document: " + err);
            return;
        }
        res.status(200).send("Deleted: " + filename);
    });
});

/* Returns the contents of a file provided a filename
* Has same security flaw as the function above. */
router.get('/content/:filename', (req, res, next) => {
    let filename = req.params.filename;
    if (!filename) {
        res.status(304).send("filename is required to get contents.");
        return;
    }
    database.getDocumentContent(filename, function (err, data) {
        if (err) {
            res.status(500).send("Error getting document: " + err);
            return;
        }
        res.setHeader('content-type', 'text/plain');
        res.status(200).end(data);
    });
});
/* Saves content to file */
router.put('/content/:filename', (req, res, next) => {
    let filename = req.params.filename;
    let content = req.body["data"];
    if (!filename) {
        res.status(304).send("filename is required to get contents.");
        return;
    }
    database.saveDocumentContent(filename, content, function (err) {
        if (err) {
            res.status(500).send("Error getting document: " + err);
            return;
        }
        res.status(200).end("saved");
    });
});
