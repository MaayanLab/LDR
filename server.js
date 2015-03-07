var express         = require('express'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    cors            = require('cors'),
    flash           = require('connect-flash'),

//    formsAngular    = require('forms-angular'),

    morgan          = require('morgan'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    session         = require('express-session');


var app = express();
var port = process.env.PORT || 3001;

var configDB = require('./config/database');

mongoose.connect(configDB.url);

require('./config/passport')(passport); // pass passport for configuration

app.use(cors());

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(session({ secret: configDB.secret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes.js')(app, passport);

// var DataFormHandler = new (formsAngular)(app, { urlPrefix: '/api/' });
// DataFormHandler.newResource(require('./app/models'));

app.listen(port);
console.log('Everything\'s going down on port ' + port);
