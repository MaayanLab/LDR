var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    request = require('superagent-promise'),
    _ = require('lodash'),
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
        level1: String,
        level2: String,
        level3: String,
        level4: String
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
        dataUrl: String,
        metadataUrl: String,
        pubMedUrl: String,
        qcDocumentUrl: String
    }
});

/**
 * buildMeta: Make request to name-server and replace arrays of IDs with arrays of JSON data
 * @param releaseData: JSON stored in local database with pointers to Name/Metadata Server
 * @param path: relative path of name server URL for request
 */
var buildMetadata = function(releaseData) {
    var promisesArr = [];
    var metadataObj = releaseData.metadata.toObject();

    _.forEach(metadataObj, function(valArray, key) {
        var path;
        var id = valArray.length === 1 ? valArray[0] : valArray;

        //if (key === 'analysisTools')
        //    path = '/form/tool?_id=' + id;
        if (key === 'assay')
            path = '/form/assay?_id=' + id;
        else if (key === 'cellLines')
            path = '/form/cell?_id=' + id;
        else if (key === 'disease')
            path = '/form/disease?_id=' + id;
        //else if (key === 'experiment')
        //    path = '/form/experiment?_id=' + id;
        //else if (key === 'manipulatedGene')
        //    path = '/form/gene?_id=' + id;
        //else if (key === 'organism')
        //    path = '/form/organism?_id=' + id;
        else if (key === 'perturbagens')
            path = '/form/perturbagen?_id=' + id;
        else if (key === 'readouts')
            path = '/form/readout?_id=' + id;
        //else if (key === 'tagsKeywords')
        //    path = '/form/keyword?_id=' + va


        if (path) {
            var promise = request('GET', nameServerUrl + path)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                    }
                    _.forEach(valArray, function(val, i) {
                        valArray[i] = res.body;
                    });
                });
            promisesArr.push(promise);
        }
    });
    return promisesArr;
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
