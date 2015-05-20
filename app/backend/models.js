var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    http = require('http'),
    Q = require('q'),
    _ = require('lodash'),
    nameServerUrl = require('./config/nameServer').url;

http.globalAgent.maxSockets = 100;

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
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    center: { type: Schema.ObjectId, ref: 'Center', required: true },
    approved: { type: Boolean, required: true },
    dateModified: { type: Date, required: true },
    releaseDates: {
        level1: { type: String, default: "" },
        level2: { type: String, default: "" },
        level3: { type: String, default: "" },
        level4: { type: String, default: "" }
    },
    metadata: {
        // These are arrays of IDs pointing to the name-metadata server
        analysisTools: { type: [], default: [] },
        assay: { type: [], default: [] }, // Always length 1
        cellLines: { type: [], default: [] },
        disease: { type: [], default: [] }, // Always length 1
        experiment: { type: [], default: [] }, // Always length 1
        manipulatedGene: { type: [], default: [] }, // Always length 1
        organism: { type: [], default: [] }, // Always length 1
        perturbagens: { type: [], default: [] },
        readouts: { type: [], default: [] },
        tagsKeywords: { type: [], default: [] }
    },
    urls: {
        dataUrl: { type: String, default: "" },
        metadataUrl: { type: String, default: "" },
        pubMedUrl: { type: String, default: "" },
        qcDocumentUrl: { type: String, default: "" }
    }
});

/**
 * buildMeta: Make request to name-server and replace arrays of IDs with arrays of JSON data
 * @param releaseData: JSON stored in local database with pointers to Name/Metadata Server
 * @param resultObj: Object to be populated with results upon fulfillment of promises
 */
var buildMetadata = function(releaseData, resultObj) {
    var promisesArr = [];
    var metadataObj = releaseData.metadata.toObject();

    _.forEach(metadataObj, function(valArray, key) {
        var path;
        var id = valArray.length === 1 ? valArray[0] : JSON.stringify(valArray);

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
            var def = Q.defer();
            http.get(nameServerUrl + path, function(res) {
                //console.log('HEADERS: ' + JSON.stringify(res.headers));
                var jsonString = '';
                res.on('data', function(chunk) {
                    jsonString += chunk;
                });
                res.on('end', function() {
                    var body = JSON.parse(jsonString);
                    if (valArray.length === 1) {
                        resultObj[key] = [body];
                    }
                    else {
                        resultObj[key] = body;
                    }
                    def.resolve(resultObj);
                });
            }).on('error', function(err) {
                console.log('Error in request to name server: ' + err.message);
                def.reject('A server error occurred while populating releases from name server');
            });
            promisesArr.push(def.promise);
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
