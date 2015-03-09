'use strict()';

var mongoose    = require('mongoose'),
    bcrypt      = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
// Schemas

var releaseDateSchema = new Schema({
    levelOne: { type: Date, required: true },
    levelTwo: Date,
    levelThree: Date,
    levelFour: Date
});

var perturbagenSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true, index: { unique: true } },
    type: { type: String, required: true }
});

var countTypeSchema = new Schema({
    count: Number,
    type: String
});

var cellLineSchema = new Schema({
    _id: Schema.Types.ObjectId,
    controlOrDisease: String,
    name: { type: String, required: true, index: { unique: true } },
    type: { type: String, required: true },
    class: String,
    tissue: String
});

var cellLineMetaSchema = new Schema({
    count: Number,
    type: String
});

var mapSchema = new Schema({
    perturbagen: String,
    cellLine: String
});

var instanceMetaSchema = new Schema({
    reps: Number,
    techReps: Number,
    map: [ mapSchema ]
});

var readoutSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true, index: { unique: true } },
    datatype: { type: String, required: true }
});

var assaySchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true, index: { unique: true } },
    info: { type: String, required: true }
});


var dataSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    status: String,
    dateModified: Date,
    center: { type: String, required: true },
    assay: {
        name: { type: String, required: true },
        info: String
    },
    readoutCount: Number,
    releaseDates: {
        levelOne: Date,
        levelTwo: Date,
        levelThree: Date,
        levelFour: Date
    },
    perturbagens: [ perturbagenSchema ],
    perturbagensMeta: {
        pair: Boolean,
        dose: [ String ],
        doseCount: Number,
        time: [ String ],
        timeUnit: String,
        timePoints: Number,
        countType: [ countTypeSchema ]
    },
    cellLines: [ cellLineSchema ],
    cellLinesMeta: [ cellLineMetaSchema ],
    instanceMeta: {
        reps: Number,
        techReps: Number,
        map: [ mapSchema ]
    },
    readouts: [ readoutSchema ]
});

var userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    institution: { type: String, required: true }
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
var Readout;
var ReleaseDate;
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

modelName = 'Readout';
schema = readoutSchema;
collectionName = 'readouts';

try {
  Readout = mongoose.model(modelName);
} catch(e) {
  Readout = mongoose.model(modelName, schema, collectionName);
}

modelName = 'ReleaseDate';
schema = releaseDateSchema;
collectionName = 'releaseDates';

try {
  ReleaseDate = mongoose.model(modelName);
} catch(e) {
  ReleaseDate = mongoose.model(modelName, schema, collectionName);
}

modelName = 'Data';
schema = dataSchema;
collectionName = 'data';

try {
  Data = mongoose.model(modelName);
} catch(e) {
  Data = mongoose.model(modelName, schema, collectionName);
}

var genId = function() {
    return mongoose.Types.ObjectId();
};

module.exports = {
    genId: genId,
    User: User,
    Assay: Assay,
    CellLine: CellLine,
    Perturbagen: Perturbagen, 
    Readout: Readout,
    ReleaseDate: ReleaseDate,
    Data: Data
};


/*
// USE TO REMOVE USERS
User.remove({ username: {$exists: true}}, function (err, events) {
    console.log('Users db cleared');
});

// USE TO RE-ENTER USERS

var id = mongoose.Types.ObjectId();


var admin = User.create({
    _id: genId(),
    username: 'admin',
    password: bcrypt.hashSync('maaya0', bcrypt.genSaltSync(8)),
    institution: 'All',
});

var hmsUser = User.create({
    _id: genId(),
    username: 'hmssorger',
    password: bcrypt.hashSync('harvardS24', bcrypt.genSaltSync(8)),
    institution: 'HMS-Sorger',
});

var broadGUser = User.create({
    _id: genId(),
    username: 'broadgolub',
    password: bcrypt.hashSync('broadG42', bcrypt.genSaltSync(8)),
    institution: 'Broad-Golub',
});

var broadJUser = User.create({
    _id: genId(),
    username: 'broadjaffe',
    password: bcrypt.hashSync('broadJ32', bcrypt.genSaltSync(8)),
    institution: 'Broad-Jaffe',
});

var ismmsUser = User.create({
    _id: genId(),
    username: 'ismmsiyengar',
    password: bcrypt.hashSync('ismmsI21', bcrypt.genSaltSync(8)),
    institution: 'ISMMS-Iyengar',
});

var uciUser = User.create({
    _id: genId(),
    username: 'ucirvinethompson',
    password: bcrypt.hashSync('ucirvineT12', bcrypt.genSaltSync(8)),
    institution: 'UCIrive-Thompson',
});

console.log('Users re-entered');
*/
