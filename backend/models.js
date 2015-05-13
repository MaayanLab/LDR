var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    request = require('superagent-promise'),
    lodash = require('lodash');
    nameServerUrl = require('./config/nameServer').url;

var genId = function() {
    return mongoose.Types.ObjectId();
};

// Mongoose Models and Schemas
var User, Center, DataRelease;
var Schema = mongoose.Schema;

// User
var userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true } },
    center: { type: Schema.ObjectId, required: true, ref: 'Center' },
    admin: { type: Boolean, required: true, default: false }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

try {
    User = mongoose.model('User');
} catch (e) {
    User = mongoose.model('User', userSchema, 'users');
}

// Center
var centerSchema = new Schema({
    name: { type: String, required: true, index: { unique: true } }
});

try {
    Center = mongoose.model('Center');
} catch (e) {
    Center = mongoose.model('Center', centerSchema, 'centers');
}

var dataReleaseSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    center: { type: Schema.ObjectId, ref: 'Center' },
    approved: { type: Boolean, required: true },
    dateModified: { type: Date, required: true },
    releaseDates: {
        level1: { val: String},
        level2: { val: String},
        level3: { val: String},
        level4: { val: String}
    },
    metadata: {
        // These are arrays of IDs pointing to the name-metadata server
        analysisTools: [String],
        assay: [String], // Always length 1
        cellLines: [String],
        disease: [String], // Always length 1
        experiment: [String], // Always length 1
        manipulatedGene: [String], // Always length 1
        organism: [String], // Always length 1
        perturbagens: [String],
        readouts: [String],
        tagsKeywords: [String]
    },
    urls: {
        dataUrl: { val: String },
        metadataUrl: { val: String },
        pubMedUrl: { val: String },
        qcDocumentUrl: { val: String }
    }
});

/**
 * buildMeta: Make request to name-server and replace IDs with MongoDB documents
 * @param releaseData: JSON stored in local database with pointers to Name Server meta-data
 * @param path: relative path of name server URL for request
 */
var buildMetadata = function(releaseData) {
    var metadataObj = releaseData.metadata.toObject();

    // TODO: Need to return promises and wait for all of them in route logic
    //lodash.forEach(metadataObj, function(valArray, key) {
    //
    //    if (valArray.length === 1) {
    //        if (key === 'cellLines') {
    //            var path = '/form/cell?_id=' + valArray[0];
    //
    //        request('GET', nameServerUrl + path)
    //            .end()
    //            .then(function(res) {
    //                console.log('GET request to name server successful. Response: ' + JSON.stringify(res.body));
    //                valArray[0] = JSON.stringify(res.body);
    //            });
    //        }
    //    }
    //
    //});
    //return releaseData;
};

try {
    DataRelease = mongoose.model('DataRelease');
} catch (e) {
    DataRelease = mongoose.model('DataRelease', dataReleaseSchema, 'dataReleases');
}

module.exports = {
    genId: genId,
    User: User,
    Center: Center,
    DataRelease: DataRelease,
    buildMetadata: buildMetadata
};
