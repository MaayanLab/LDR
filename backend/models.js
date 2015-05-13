var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    request = require('superagent'),
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

dataReleaseSchema.statics.buildMetaData = function() {
    /**
     * getDataFromNameServer: Make request to name-server returning JSON of meta-data
     * @param path: relative path of name server URL for POST request
     * @param idObj: { id: String } or { id: [Strings] }
     */
    var getDataFromNameServer = function(path, idObj) {
        if (idObj) {
            request
                // TODO: Change path once Qiaonan creates the API
                .post(nameServerUrl + path)
                .set('Content-Type', 'application/json')
                .send(idObj)
                .set('Accept', 'application/json')
                .end(function(err, res) {
                    if (res.ok) {
                        console.log('POST request returned from name server ' + JSON.stringify(res.body));
                        return res.body;
                    } else {
                        console.log('Error occurred during POST to name server: ' + res.text);
                        return { error: res.text };
                    }
                });
        }
        else {
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
        }
    };

    // TODO: Implement suggest server from Miami
    //var getDataFromMiami = function (path, idObj) {};

    if (this.metaData.analysisTools.length === 1)
        this.metaData.analysisTools = getDataFromNameServer('/form/tool?id=' + this.metaData.analysisTools[0]);
    else if (this.metaData.analysisTools.length > 1)
        this.metaData.analysisTools = getDataFromNameServer('/form/tool', { id: this.metaData.analysisTools });

    this.metaData.assay = getDataFromNameServer('/form/assay?id=' + this.metaData.assay[0]);

    if (this.metaData.cellLines.length === 1)
        this.metaData.cellLines = getDataFromNameServer('/form/cell?id=' + this.metaData.cellLines[0]);
    else if (this.metaData.cellLines.length > 1)
        this.metaData.cellLines = getDataFromNameServer('/form/cell', { id: this.metaData.cellLines });

    this.metaData.disease = getDataFromNameServer('/form/disease?id=' + this.metaData.disease[0]);
    this.metaData.experiment = getDataFromNameServer('/form/experiment?id=' + this.metaData.experiment[0]);
    this.metaData.manipulatedGene = getDataFromNameServer('/form/gene?id=' + this.metaData.manipulatedGene[0]);
    this.metaData.organism = getDataFromNameServer('/form/organism?id=' + this.metaData.organism[0]);

    if (this.metaData.perturbagens.length === 1)
        this.metaData.perturbagens = getDataFromNameServer('/form/perturbagen?id=' + this.metaData.perturbagens[0]);
    else if (this.metaData.perturbagens.length > 1)
        this.metaData.perturbagens = getDataFromNameServer('/form/perturbagen', { id: this.metaData.perturbagens });

    if (this.metaData.readouts.length === 1)
        this.metaData.readouts = getDataFromNameServer('/form/readout?id=' + this.metaData.readouts[0]);
    else if (this.metaData.readouts.length > 1)
        this.metaData.readouts = getDataFromNameServer('/form/readout', { id: this.metaData.readouts });

    if (this.metaData.tagsKeywords.length === 1)
        this.metaData.tagsKeywords = getDataFromNameServer('/form/keyword?id=' + this.metaData.tagsKeywords[0]);
    else if (this.metaData.tagsKeywords.length > 1)
        this.metaData.tagsKeywords = getDataFromNameServer('/form/keyword', { id: this.metaData.tagsKeywords });
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
    DataRelease: DataRelease
};
