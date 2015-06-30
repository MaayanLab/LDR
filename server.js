var express = require('express'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    morgan = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    timeout = require('connect-timeout'),
    compress = require('compression'),
    multer = require('multer');

var app = express();
var port = 3001;

var configDB = require('./backend/config/database');

mongoose.connect(configDB.url);

app.use(cors());
app.use(timeout('20s'));
if (process.env.NODE_ENV != 'production') { // if production
    app.use(morgan('dev')); // log every request to console
    mongoose.set('debug', true); // More verbose mongoose queries
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({
    dest: __dirname + '/hdfs/',
    onFileUploadStart: function(file) {
        console.log('Starting upload of ' + file.originalname);
    },
    onFileUploadFinish: function(file) {
        console.log('Finished uploading ' + file.originalname);
    }
}));
app.use(compress());

var publicDir = __dirname + '/';
console.log('Serving static files from ' + publicDir);
app.use('/LDR/uploads', express.static(path.join(publicDir, 'backend/uploads')));
app.use('/LDR', express.static(path.join(publicDir)));

require('./backend/routes')(app);

app.get('/', function (req, res) {
    res.status(200).sendFile(publicDir + 'index.html');
});

app.use(function (err, req, res) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Token invalid. You must be logged in to proceed.');
    }
});

app.use(haltOnTimeout);
function haltOnTimeout(req, res, next) {
    if (!req.timeout) {
        next();
    }
}

app.listen(3001, function() {
    if (process.send) {
        process.send('online');
    } else {
        console.log('The server is running on port ' + 3001);
    }
});