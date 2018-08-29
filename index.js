const express = require ('express');
const http = require ('http');
const path = require('path');
const morgan = require ('morgan');
const bodyParser = require ('body-parser');
const hbs = require('express-handlebars');

const sqlite3 = require ('sqlite3').verbose();

let db = new sqlite3.Database("./db/nodupli.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("sucessfully connected to nodupli database.");
});

const hostname = 'localhost';
const port = 3420;

const app = express();


/* Setup routing */
const indexRouter = require('./routes/indexRouter.js');
const documentRouter = require('./routes/DocumentRouter.js');
const databaseRouter = require('./routes/DatabaseRouter.js')(app, db);

/* View engine setup */
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/', indexRouter);
app.use('/documents', documentRouter);


app.use(express.static('public'))

app.use ((req, res, next) => {
	res.statusCode = 200;
	res.setHeader('content-type', 'text/html');
	res.end('<html><body><h1>404.</h1></body></html>')
});

const server = http.createServer(app);

server.listen(port, hostname, ()=> {
	console.log(`running: http://${hostname}:${port}`)
});
