'use strict()';

var mongoose    = require('mongoose'),
    bcrypt      = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
// Schemas

var releaseDateSchema = new Schema({
    date: Date,
    'release-level': Number
});

var perturbagenSchema = new Schema({
    name: { type: String, required: true, index: { unique: true } },
    type: String
});

var countTypeSchema = new Schema({
    count: Number,
    type: String
});

var cellLineSchema = new Schema({
    'control-or-disease': String,
    name: { type: String, required: true, index: { unique: true } },
    type: String,
    class: String,
    tissue: String
});

var cellLineMetaSchema = new Schema({
    count: Number,
    type: String
});

var mapSchema = new Schema({
    perturbagen: String,
    'cell-line': String
});

var instanceMetaSchema = new Schema({
    reps: Number,
    'tech-reps': Number,
    map: [ mapSchema ]
});

var readoutSchema = new Schema({
    name: String,
    datatype: String
});

var assaySchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true, index: { unique: true } },
    info: String,
});


var dataSchema = new Schema({
    _id: Schema.Types.ObjectId,
    dateModified: Date,
    center: { type: String, required: true },
    assay: { type: String, required: true },
    'assay-info': String,
    'readout-count': Number,
    'release-dates': [ releaseDateSchema ],
    perturbagens: [ perturbagenSchema ],
    'perturbagens-meta': {
        pair: Boolean,
        dose: [ String ],
        'dose-count': Number,
        time: [ String ],
        'time-unit': String,
        'time-points': Number,
        'count-type': [ countTypeSchema ]
    },
    'cell-lines': [ cellLineSchema ],
    'cell-lines-meta': [ cellLineMetaSchema ],
    'instance-meta': {
        reps: Number,
        'tech-reps': Number,
        map: [ mapSchema ]
    },
    'readouts': [ readoutSchema ]
});

var userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    institution: { type: String, required: true },
    data: [ dataSchema ]
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Models
var User;
var Assay;
var CellLine;
var Perturbagen;
var Data;

var modelName = 'User';
var schema = userSchema;
var collectionName = 'users';

try {
  User = mongoose.model(modelName);
} catch(e) {
  User = mongoose.model(modelName, schema, collectionName);
}

modelName = 'Assay';
schema = assaySchema;
collectionName = 'assays';

try {
  Assay = mongoose.model(modelName);
} catch(e) {
  Assay = mongoose.model(modelName, schema, collectionName);
}

modelName = 'CellLine';
schema = cellLineSchema;
collectionName = 'cellLines';

try {
  CellLine = mongoose.model(modelName);
} catch(e) {
  CellLine = mongoose.model(modelName, schema, collectionName);
}

modelName = 'Perturbagen';
schema = perturbagenSchema;
collectionName = 'perturbagens';

try {
  Perturbagen = mongoose.model(modelName);
} catch(e) {
  Perturbagen = mongoose.model(modelName, schema, collectionName);
}

modelName = 'Data';
schema = dataSchema;
collectionName = 'data';

try {
  Data = mongoose.model(modelName);
} catch(e) {
  Data = mongoose.model(modelName, schema, collectionName);
}

module.exports = {
    User: User,
    Assay: Assay,
    CellLine: CellLine,
    Perturbagen: Perturbagen, 
    Data: Data
};


/*
// USE TO REMOVE USERS
//User.remove({ username: {$exists: true}}, function (err, events) {
//    console.log('Users db cleared');
//});

// USE TO RE-ENTER USERS

var id = mongoose.Types.ObjectId();

var genId = function() {
    return mongoose.Types.ObjectId();
};

var admin = User.create({
    _id: genId(),
    username: 'admin',
    password: bcrypt.hashSync('maaya0', bcrypt.genSaltSync(8)),
    institution: 'All',
    data: []
});

var hmsUser = User.create({
    _id: genId(),
    username: 'hmssorger',
    password: bcrypt.hashSync('harvardS24', bcrypt.genSaltSync(8)),
    institution: 'HMS-Sorger',
    data: []
});

var broadGUser = User.create({
    _id: genId(),
    username: 'broadgolub',
    password: bcrypt.hashSync('broadG42', bcrypt.genSaltSync(8)),
    institution: 'Broad-Golub',
    data: []
});

var broadJUser = User.create({
    _id: genId(),
    username: 'broadjaffe',
    password: bcrypt.hashSync('broadJ32', bcrypt.genSaltSync(8)),
    institution: 'Broad-Jaffe',
    data: []
});

var ismmsUser = User.create({
    _id: genId(),
    username: 'ismmsiyengar',
    password: bcrypt.hashSync('ismmsI21', bcrypt.genSaltSync(8)),
    institution: 'ISMMS-Iyengar',
    data: []
});

var uciUser = User.create({
    _id: genId(),
    username: 'ucirvinethompson',
    password: bcrypt.hashSync('ucirvineT12', bcrypt.genSaltSync(8)),
    institution: 'UCIrive-Thompson',
    data: []
});

console.log('Users re-entered');
*/
