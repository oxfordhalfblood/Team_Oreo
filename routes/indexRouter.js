const express = require ('express');
const bodyParser = require ('body-parser');

const router = express.Router();

const links = ["dbtest", "documents"];

router.use(bodyParser.json());

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'NoDupli Index',
        condition: false,
        anyArray: links
    });
});
//router.route('/');

module.exports = router;
