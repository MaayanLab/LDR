var express         = require('express'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    cors            = require('cors'),
    flash           = require('connect-flash'),

//    formsAngular    = require('forms-angular'),

    morgan          = require('morgan'),
    path            = require('path'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    compress        = require('compression'),
    session         = require('express-session');


var app = express();
var port = process.env.PORT || 3001;

var configDB = require('./config/database');

mongoose.connect(configDB.url);

require('./config/passport')(passport); // pass passport for configuration

app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(session({ secret: configDB.secret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(compress());

var publicDir = __dirname + '/public';
console.log(publicDir);

app.use('/js', express.static(path.join(publicDir + '/js')));
app.use('/css', express.static(path.join(publicDir + '/css')));
app.use('/views', express.static(path.join(publicDir + '/views')));
app.use('/vendor', express.static(path.join(publicDir + '/vendor')));

app.get('/js', function(req, res, next) {
    res.setHeader('Content-Type', 'application/javascript');
});

app.get('/*.png', function(req, res, next) {
    res.setHeader('Content-Type', 'image/png');
});

require('./routes.js')(app, passport);

app.get('/*', function(req, res) {
    res.sendfile(publicDir + '/index.html');
  });

app.listen(port);
console.log('Everything\'s going down on port ' + port);
