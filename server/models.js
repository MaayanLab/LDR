var mongoose = require('mongoose'),
    shortId = require('shortid'),
    bcrypt = require('bcrypt-nodejs');


var genId = function () {
    return mongoose.Types.ObjectId();
};

// Mongoose Models and Schemas
var User;
var Assay;
var CellLine;
var Perturbagen;
var Readout;
var ReleaseDate;
var Data;

var Schema = mongoose.Schema;

var centerSchema = new Schema({
    name: {type: String, required: true, index: {unique: true}}
});

try {
    Center = mongoose.model('Center');
} catch (e) {
    Center = mongoose.model('Center', centerSchema, 'centers');
}

var userSchema = new Schema({
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    email: {type: String, required: true, index: {unique: true}},
    center: {type: Schema.ObjectId, required: true, ref: 'Center'}
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

try {
    User = mongoose.model('User');
} catch (e) {
    User = mongoose.model('User', userSchema, 'users');
}


var releaseDateSchema = new Schema({
    levelOne: {type: Date, required: true},
    levelTwo: Date,
    levelThree: Date,
    levelFour: Date
});

var perturbagenSchema = new Schema({
    center: {type: Schema.ObjectId, ref: 'Center'},
    name: {type: String, required: true, index: {unique: true}},
    type: {type: String, required: true}
});

try {
    Perturbagen = mongoose.model('Perturbagen');
} catch (e) {
    Perturbagen = mongoose.model('Perturbagen', perturbagenSchema, 'perturbagens');
}

var countTypeSchema = new Schema({
    count: Number,
    type: String
});

var cellLineSchema = new Schema({
    center: {type: Schema.ObjectId, ref: 'Center'},
    controlOrDisease: String,
    name: {type: String, required: true, index: {unique: true}},
    type: {type: String, required: true},
    class: String,
    tissue: String
});

try {
    CellLine = mongoose.model('CellLine');
} catch (e) {
    CellLine = mongoose.model('CellLine', cellLineSchema, 'cellLines');
}

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
    map: [mapSchema]
});

var readoutSchema = new Schema({
    center: {type: Schema.ObjectId, ref: 'Center'},
    name: {type: String, required: true, index: {unique: true}},
    datatype: String
});

try {
    Readout = mongoose.model('Readout');
} catch (e) {
    Readout = mongoose.model('Readout', readoutSchema, 'readouts');
}

var diseaseSchema = new Schema({
    center: {type: Schema.ObjectId, ref: 'Center'},
    name: {type: String, required: true, index: {unique: true}},
    info: {type: String, required: true}
});

try {
    Disease = mongoose.model('Disease');
} catch (e) {
    Disease = mongoose.model('Disease', diseaseSchema, 'diseases');
}

var assaySchema = new Schema({
    center: {type: Schema.ObjectId, ref: 'Center'},
    name: {type: String, required: true, index: {unique: true}},
    info: {type: String, required: true}
});

try {
    Assay = mongoose.model('Assay');
} catch (e) {
    Assay = mongoose.model('Assay', assaySchema, 'assays');
}

var dataSchema = new Schema({
    _id: {type: String, required: true, index: {unique: true}},
    user: {type: Schema.ObjectId, ref: 'User'},
    center: {type: Schema.ObjectId, ref: 'Center'},
    centerName: String, // Used for creation of IDs and for Qiaonan's Milestones Page
    status: String,
    dateModified: Date,
    assay: {type: Schema.ObjectId, ref: 'Assay'},
    readoutCount: Number,
    releaseDates: {
        levelOne: Date,
        levelTwo: Date,
        levelThree: Date,
        levelFour: Date
    },
    perturbagens: [{type: Schema.ObjectId, ref: 'Perturbagen'}],
    perturbagensMeta: {
        pair: Boolean,
        dose: [String],
        doseCount: Number,
        time: [String],
        timeUnit: String,
        timePoints: Number,
        countType: [countTypeSchema]
    },
    cellLines: [{type: Schema.ObjectId, ref: 'CellLine'}],
    cellLinesMeta: [cellLineMetaSchema],
    instanceMeta: {
        reps: Number,
        techReps: Number,
        map: [mapSchema]
    },
    readouts: [{type: Schema.ObjectId, ref: 'Readout'}]
});

try {
    Data = mongoose.model('Data');
} catch (e) {
    Data = mongoose.model('Data', dataSchema, 'data');
}

module.exports = {
    genId: genId,
    User: User,
    Center: Center,
    Assay: Assay,
    CellLine: CellLine,
    Perturbagen: Perturbagen,
    Readout: Readout,
    Disease: Disease,
    Data: Data
};

// Use to re-init db. Must do mongorestore using dump from oldDb folder
// var initDb = require('./initDb.js');
