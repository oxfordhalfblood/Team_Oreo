const express = require ('express');
const bodyParser = require ('body-parser');
const path = require('path');
const multer = require('multer');

const router = express.Router();

router.use(bodyParser.json());


var storage = multer.diskStorage({
	destination: function(req, file, callback) {
			callback(null, './uploads');
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

router.route('/');

router.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('content-type', 'text/plain');
    next()
});

router.get('/', function (req, res, next) {
    res.render('documentUpload', {
        title: 'Upload documents here.',
        condition: false
    });
});

router.post('/', (req, res, next) => {
	/*
    res.end('adding document: ' + req.body.name
        + ' w/details: ' + req.body.description)
	*/

	var upload = multer({
		storage: storage
	}).single('userFile');

	upload(req, res, function(err) {
		res.end('File is uploaded')
	})
});

/*
.put((req, res, next) => {
	res.statusCode = 403; // Operation not supported.
	res.end('PUT operation not supported on documents')
})

.delete((req, res, next) => {
	res.end('deleting all the documents')
})

.get('/:documentId', (req, res, next) => {
	res.end('Get details of document ID: ' + req.params.documentId)
})
.post('/:documentId', (req, res, next) => {
	res.statusCode = 403;
	res.end('post operation not supported on documents/' + req.params.documentId)
})
.put('/:documentId', (req, res, next) => {
	res.write('updating document : ' + req.params.documentId);
	res.end(' document: ' + req.body.name
    + ' - ' + req.body.description)
})
.delete('/:documentId', (req, res, next) => {
	res.end('deleting document: ' + req.params.documentId)
})
*/
module.exports = router;
