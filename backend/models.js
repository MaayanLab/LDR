var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    request = require('superagent'),
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
        levelOne: Date,
        levelTwo: Date,
        levelThree: Date,
        levelFour: Date
    },
    metaData: {
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
        dataUrl: String,
        metaDataUrl: String,
        pubMedUrl: String,
        qcDocumentUrl: String
    }
});

/**
 * buildMeta: Make request to name-server and replace IDs with MongoDB documents
 * @param releaseData: JSON stored in local database with pointers to Name Server meta-data
 * @param path: relative path of name server URL for request
 */
var buildMetaData = function(releaseData) {

    var getDataFromNameServer = function(path) {
        request
            .get(nameServerUrl + path)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                if (res.ok) {
                    console.log('GET request to name server successful. Response: ' + JSON.stringify(res.body));
                    return res.body;
                } else {
                    console.log('Error occured during GET request to name server: ' + res.text);
                    return { error: res.text };
                }
            })
    };

    // TODO: Implement suggest server from Miami
    //var getDataFromMiami = function (path, idObj) {};

    lodash(releaseData).forEach(function(release) {
        //if (release.metaData.analysisTools.length === 1)
        //    release.metaData.analysisTools = getDataFromNameServer('/form/tool?_id=' + release.metaData.analysisTools[0]);
        //else if (release.metaData.analysisTools.length > 1)
        //    release.metaData.analysisTools = getDataFromNameServer('/form/tool?_id=' + release.metaData.analysisTools);

        release.metaData.assay = getDataFromNameServer('/form/assay?_id=' + release.metaData.assay[0]);

        if (release.metaData.cellLines.length === 1)
            release.metaData.cellLines = getDataFromNameServer('/form/cell?_id=' + release.metaData.cellLines[0]);
        else if (release.metaData.cellLines.length > 1)
            release.metaData.cellLines = getDataFromNameServer('/form/cell?_id=' + release.metaData.cellLines);

        release.metaData.disease = getDataFromNameServer('/form/disease?_id=' + release.metaData.disease[0]);
        //release.metaData.experiment = getDataFromNameServer('/form/experiment?_id=' + release.metaData.experiment[0]);
        //release.metaData.manipulatedGene = getDataFromNameServer('/form/gene?_id=' + release.metaData.manipulatedGene[0]);
        //release.metaData.organism = getDataFromNameServer('/form/organism?_id=' + release.metaData.organism[0]);

        if (release.metaData.perturbagens.length === 1)
            release.metaData.perturbagens = getDataFromNameServer('/form/perturbagen?_id=' + release.metaData.perturbagens[0]);
        else if (release.metaData.perturbagens.length > 1)
            release.metaData.perturbagens = getDataFromNameServer('/form/perturbagen?_id=' + release.metaData.perturbagens);

        if (release.metaData.readouts.length === 1)
            release.metaData.readouts = getDataFromNameServer('/form/readout?_id=' + release.metaData.readouts[0]);
        else if (release.metaData.readouts.length > 1)
            release.metaData.readouts = getDataFromNameServer('/form/readout?_id=' + release.metaData.readouts);

        //if (release.metaData.tagsKeywords.length === 1)
        //    release.metaData.tagsKeywords = getDataFromNameServer('/form/keyword?_id=' + release.metaData.tagsKeywords[0]);
        //else if (release.metaData.tagsKeywords.length > 1)
        //    release.metaData.tagsKeywords = getDataFromNameServer('/form/keyword?_id=' + release.metaData.tagsKeywords );
    });
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
    buildMetaData: buildMetaData
};
