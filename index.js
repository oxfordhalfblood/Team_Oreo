const express = require ('express');
const http = require ('http');
const path = require('path');
const morgan = require ('morgan');
const bodyParser = require ('body-parser');
const hbs = require('express-handlebars');
const session = require ('express-session');
const Dbhelper = require ('./db/DBhelper.js');

const db = new Dbhelper();
//db.test();

const hostname = 'localhost';
const port = 3420;
const app = express();

app.use(session({secret: 'password123',	cookie: { maxAge: 900000 } }));

/* Setup routing */
const indexRouter = require('./routes/indexRouter.js')(app, session);
const documentRouter = require('./routes/DocumentRouter.js')(app, db);
const userRouter = require('./routes/UserRouter.js')(app, db);
const adminRouter = require('./routes/AdminRouter.js')(app, db);

/* View engine setup */
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/', partialsDir: __dirname + '/views/partials/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/* setup middlewares */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('public'));

/* redirect all non matching routes to 404 */
app.use ((req, res, next) => {
	res.statusCode = 404;
	res.setHeader('content-type', 'text/html');
	res.end('<html><body><h1>404.</h1></body></html>')
});

const server = http.createServer(app);

server.listen(port, hostname, ()=> {
	console.log(`running: http://${hostname}:${port}`)
});
