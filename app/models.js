'use strict()';

var mongoose    = require('mongoose'),
    shortId     = require('shortid'),
    bcrypt      = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
// Schemas

var centerSchema = new Schema({
    _id: { type: String, unique: true, default: shortId.generate },
    name: { type: String, required: true, index: { unique: true } }

});

var releaseDateSchema = new Schema({
    levelOne: { type: Date, required: true },
    levelTwo: Date,
    levelThree: Date,
    levelFour: Date
});

var perturbagenSchema = new Schema({
    _id: { type: String, unique: true, default: shortId.generate },
    centerId: String,
    userId: String,
    name: { type: String, required: true, index: { unique: true } },
    type: { type: String, required: true }
});

var countTypeSchema = new Schema({
    count: Number,
    type: String
});

var cellLineSchema = new Schema({
    _id: { type: String, unique: true, default: shortId.generate },
    centerId: String,
    userId: String,
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
    _id: { type: String, unique: true, default: shortId.generate },
    centerId: String,
    userId: String,
    name: { type: String, required: true, index: { unique: true } },
    datatype: String
});

var diseaseSchema = new Schema({
    _id: { type: String, unique: true, default: shortId.generate },
    centerId: String,
    userId: String,
    name: { type: String, required: true, index: { unique: true } },
    info: { type: String, required: true }
});

var assaySchema = new Schema({
    _id: { type: String, unique: true, default: shortId.generate },
    centerId: String,
    userId: String,
    name: { type: String, required: true, index: { unique: true } },
    info: { type: String, required: true }
});


var dataSchema = new Schema({
    _id: { type: String, unique: true, default: shortId.generate },
    userId: String,
    centerId: String,
    status: String,
    dateModified: Date,
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
    _id: { type: String, unique: true, default: shortId.generate },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    center: {
        _id: { type: String, required: true },
        name: { type: String, required: true },
    }
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

modelName = 'Center';
schema = centerSchema;
collectionName = 'centers';

try {
    Center = mongoose.model(modelName);
} catch(e) {
    Center = mongoose.model(modelName, schema, collectionName);
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

modelName = 'Disease';
schema = diseaseSchema;
collectionName = 'diseases';

try {
    Disease = mongoose.model(modelName);
} catch(e) {
    Disease = mongoose.model(modelName, schema, collectionName);
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

module.exports = {
    User: User,
    Center: Center,
    Assay: Assay,
    CellLine: CellLine,
    Perturbagen: Perturbagen, 
    Readout: Readout,
    Disease: Disease,
    ReleaseDate: ReleaseDate,
    Data: Data
};

/*
var queryOne = {'centerId': 'm1GRAI9cF', userId: {$exists: false}};
var queryTwo = {'centerId': 'Qy7CRU5qK', userId: {$exists: false}};
var queryThree = {'centerId': 'mJNR0Uq5t', userId: {$exists: false}};
var queryFour = {'centerId': 'XyrCALq9t', userId: {$exists: false}};
var queryFive = {'centerId': 'XJUACU55K', userId: {$exists: false}};
var querySix = {'centerId': 'm1DACLccF', userId: {$exists: false}};

var options = {};
function callback (err, numAffected) {
    console.log(numAffected);
}

for (i = 0; i < 500; i++) {
Assay.update(queryOne, { userId: 'X1IKfN4QK' }, options, callback);
CellLine.update(queryOne, { userId: 'X1IKfN4QK' }, options, callback);
Perturbagen.update(queryOne, { userId: 'X1IKfN4QK' }, options, callback);
Readout.update(queryOne, { userId: 'X1IKfN4QK' }, options, callback);

Assay.update(queryTwo, { userId: 'my4tf4EXF' }, options, callback);
CellLine.update(queryTwo, { userId: 'my4tf4EXF' }, options, callback);
Perturbagen.update(queryTwo, { userId: 'my4tf4EXF' }, options, callback);
Readout.update(queryTwo, { userId: 'my4tf4EXF' }, options, callback);

Assay.update(queryThree, { userId: '7ymtzNVXY' }, options, callback);
CellLine.update(queryThree, { userId: '7ymtzNVXY' }, options, callback);
Perturbagen.update(queryThree, { userId: '7ymtzNVXY' }, options, callback);
Readout.update(queryThree, { userId: '7ymtzNVXY' }, options, callback);

Assay.update(queryFour, { userId: 'QyBYGV4XF' }, options, callback);
CellLine.update(queryFour, { userId: 'QyBYGV4XF' }, options, callback);
Perturbagen.update(queryFour, { userId: 'QyBYGV4XF' }, options, callback);
Readout.update(queryFour, { userId: 'QyBYGV4XF' }, options, callback);

Assay.update(queryFive, { userId: 'QkGvJ7Hrt' }, options, callback);
CellLine.update(queryFive, { userId: 'QkGvJ7Hrt' }, options, callback);
Perturbagen.update(queryFive, { userId: 'QkGvJ7Hrt' }, options, callback);
Readout.update(queryFive, { userId: 'QkGvJ7Hrt' }, options, callback);

Assay.update(querySix, { userId: '7JQPkXBBF' }, options, callback);
CellLine.update(querySix, { userId: '7JQPkXBBF' }, options, callback);
Perturbagen.update(querySix, { userId: '7JQPkXBBF' }, options, callback);
Readout.update(querySix, { userId: '7JQPkXBBF' }, options, callback);

}
/*
// USE TO REMOVE USERS
User.remove({ username: {$exists: true}}, function (err, events) {
    console.log('Users db cleared');
});

// USE TO RE-ENTER USERS

var admin = User.create({
    _id: 'm1MYMVNQt',
    username: 'admin',
    password: bcrypt.hashSync('maaya0', bcrypt.genSaltSync(8)),
    center: 'NIH',
});

var hmsUser = User.create({
    _id: '7ymtzNVXY',
    username: 'hmssorger',
    password: bcrypt.hashSync('harvardS24', bcrypt.genSaltSync(8)),
    center: 'HMS-Sorger',
});

var broadGUser = User.create({
    _id: 'my4tf4EXF',
    username: 'broadgolub',
    password: bcrypt.hashSync('broadG42', bcrypt.genSaltSync(8)),
    center: 'Broad-Golub',
});

var broadJUser = User.create({
    _id: 'QyBYGV4XF',
    username: 'broadjaffe',
    password: bcrypt.hashSync('broadJ32', bcrypt.genSaltSync(8)),
    center: 'Broad-Jaffe',
});

var ismmsUser = User.create({
    _id: 'X1IKfN4QK',
    username: 'ismmsiyengar',
    password: bcrypt.hashSync('ismmsI21', bcrypt.genSaltSync(8)),
    center: 'ISMMS-Iyengar',
});

var neuroLincsUser = User.create({
    _id: 'QkGvJ7Hrt',
    username: 'neurolincs',
    password: bcrypt.hashSync('neuroL12', bcrypt.genSaltSync(8)),
    center: 'NeuroLINCS',
});

var ohsuUser = User.create({
    _id: '7JQPkXBBF',
    username: 'ohsu',
    password: bcrypt.hashSync('ohsu36', bcrypt.genSaltSync(8)),
    center: 'OHSU',
});

var temporaryUser = User.create({
    _id: 'X1GR82xnF',
    username: 'temporary',
    password: bcrypt.hashSync('temp123', bcrypt.genSaltSync(8)),
    center: 'Example',
});

console.log('Users re-entered');
*/
