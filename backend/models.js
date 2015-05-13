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
        //if (release.metadata.analysisTools.length === 1)
        //    release.metadata.analysisTools = getDataFromNameServer('/form/tool?_id=' + release.metadata.analysisTools[0]);
        //else if (release.metadata.analysisTools.length > 1)
        //    release.metadata.analysisTools = getDataFromNameServer('/form/tool?_id=' + release.metadata.analysisTools);

        release.metadata.assay = getDataFromNameServer('/form/assay?_id=' + release.metadata.assay[0]);

        if (release.metadata.cellLines.length === 1)
            release.metadata.cellLines = getDataFromNameServer('/form/cell?_id=' + release.metadata.cellLines[0]);
        else if (release.metadata.cellLines.length > 1)
            release.metadata.cellLines = getDataFromNameServer('/form/cell?_id=' + release.metadata.cellLines);

        release.metadata.disease = getDataFromNameServer('/form/disease?_id=' + release.metadata.disease[0]);
        //release.metadata.experiment = getDataFromNameServer('/form/experiment?_id=' + release.metadata.experiment[0]);
        //release.metadata.manipulatedGene = getDataFromNameServer('/form/gene?_id=' + release.metadata.manipulatedGene[0]);
        //release.metadata.organism = getDataFromNameServer('/form/organism?_id=' + release.metadata.organism[0]);

        if (release.metadata.perturbagens.length === 1)
            release.metadata.perturbagens = getDataFromNameServer('/form/perturbagen?_id=' + release.metadata.perturbagens[0]);
        else if (release.metadata.perturbagens.length > 1)
            release.metadata.perturbagens = getDataFromNameServer('/form/perturbagen?_id=' + release.metadata.perturbagens);

        if (release.metadata.readouts.length === 1)
            release.metadata.readouts = getDataFromNameServer('/form/readout?_id=' + release.metadata.readouts[0]);
        else if (release.metadata.readouts.length > 1)
            release.metadata.readouts = getDataFromNameServer('/form/readout?_id=' + release.metadata.readouts);

        //if (release.metadata.tagsKeywords.length === 1)
        //    release.metadata.tagsKeywords = getDataFromNameServer('/form/keyword?_id=' + release.metadata.tagsKeywords[0]);
        //else if (release.metadata.tagsKeywords.length > 1)
        //    release.metadata.tagsKeywords = getDataFromNameServer('/form/keyword?_id=' + release.metadata.tagsKeywords );
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
    buildMetadata: buildMetadata
};
