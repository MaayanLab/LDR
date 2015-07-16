var mongoose = require('mongoose'),
    version = require('mongoose-version'),
    bcrypt = require('bcrypt'),
    http = require('http'),
    Q = require('q'),
    _ = require('lodash');

http.globalAgent.maxSockets = 100;

var SALT_WORK_FACTOR = 10;
// Uncomment if we want account locking implemented for unsuccessful log-ins
// var MAX_LOGIN_ATTEMPTS = 100;
// var LOCK_TIME = 2 * 60 * 60 * 1000;


// Mongoose Models and Schemas
var User, Group, Assay, CellLine, Perturbagen, Readout, Gene, Disease,
    Organism, Tool, DataRelease;
var Schema = mongoose.Schema;

// User
var userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: {
        data: Buffer,
        contentType: String
    },
    // Make email unique?
    email: { type: String, required: true/*, index: { unique: true }*/ },
    group: { type: Schema.ObjectId, required: true, ref: 'Group' },
    admin: { type: Boolean, required: true, default: false },
    admitted: { type: Boolean, required: true, default: false },
    location: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    homepage: { type: String, default: '' }
    // For checking login attempts and locking account
    //loginAttempts: { type: Number, required: true, default: 0 },
    //lockUntil: { type: Number }
});

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the clear-text password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.checkPassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

try {
    User = mongoose.model('User');
} catch (e) {
    User = mongoose.model('User', userSchema, 'users');
}

// UNCOMMENT FOR CHECKING LOGIN ATTEMPTS
//
//userSchema.methods.incLoginAttempts = function(cb) {
//    // if we have a previous lock that has expired, restart at 1
//    if (this.lockUntil && this.lockUntil < Date.now()) {
//        return this.update({
//            $set: { loginAttempts: 1 },
//            $unset: { lockUntil: 1 }
//        }, cb);
//    }
//    // otherwise we're incrementing
//    var updates = { $inc: { loginAttempts: 1 } };
//    // lock the account if we've reached max attempts and it's not locked already
//    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
//        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
//    }
//    return this.update(updates, cb);
//};
//
//// expose enum on the model, and provide an internal convenience reference
//var reasons = userSchema.statics.failedLogin = {
//    NOT_FOUND: 0,
//    PASSWORD_INCORRECT: 1,
//    MAX_ATTEMPTS: 2
//};
//
//userSchema.statics.getAuthenticated = function(username, password, cb) {
//    this.findOne({ username: username }, function(err, user) {
//        if (err) return cb(err);
//
//        // make sure the user exists
//        if (!user) {
//            return cb(null, null, reasons.NOT_FOUND);
//        }
//
//        // check if the account is currently locked
//        if (user.isLocked) {
//            // just increment login attempts if account is already locked
//            return user.incLoginAttempts(function(err) {
//                if (err) return cb(err);
//                return cb(null, null, reasons.MAX_ATTEMPTS);
//            });
//        }
//
//        // test for a matching password
//        user.checkPassword(password, function(err, isMatch) {
//            if (err) return cb(err);
//
//            // check if the password was a match
//            if (isMatch) {
//                // if there's no lock or failed attempts, just return the user
//                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
//                // reset attempts and lock info
//                var updates = {
//                    $set: { loginAttempts: 0 },
//                    $unset: { lockUntil: 1 }
//                };
//                return user.update(updates, function(err) {
//                    if (err) return cb(err);
//                    return cb(null, user);
//                });
//            }
//
//            // password is incorrect, so increment login attempts before responding
//            user.incLoginAttempts(function(err) {
//                if (err) return cb(err);
//                return cb(null, null, reasons.PASSWORD_INCORRECT);
//            });
//        });
//    });
//};

// Group
var groupSchema = new Schema({
    name: { type: String, required: true, index: { unique: true } },
    homepage: { type: String, default: '' },
    icon: {
        path: { type: String, default: '/usr/src/app/hdfs/97a6f65cb0c61d48704153af6bdc4c3c.png' },
        type: { type: String, default: 'image/png' }
    },
    email: String,
    about: { type: String, default: '' },
    location: String
});

groupSchema.index({ name: 'text' });

try {
    Group = mongoose.model('Group');
} catch (e) {
    Group = mongoose.model('Group', groupSchema, 'groups');
}

var asSchema = new Schema({
    name: String,
    description: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

asSchema.index({ name: 'text' });

try {
    Assay = mongoose.model('Assay');
} catch (e) {
    Assay = mongoose.model('Assay', asSchema, 'assays');
}

var clSchema = new Schema({
    name: String,
    type: String,
    class: String,
    controlOrDisease: String,
    tissue: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

clSchema.index({ name: 'text' });

try {
    CellLine = mongoose.model('CellLine');
} catch (e) {
    CellLine = mongoose.model('CellLine', clSchema, 'cellLines');
}

var pertSchema = new Schema({
    name: { type: String, index: { unique: true } },
    type: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

pertSchema.index({ name: 'text' });

try {
    Perturbagen = mongoose.model('Perturbagen');
} catch (e) {
    Perturbagen = mongoose.model('Perturbagen', pertSchema, 'perturbagens');
}

var roSchema = new Schema({
    name: { type: String, index: { unique: true } },
    datatype: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

roSchema.index({ name: 'text' });

try {
    Readout = mongoose.model('Readout');
} catch (e) {
    Readout = mongoose.model('Readout', roSchema, 'readouts');
}

var geneSchema = new Schema({
    name: { type: String, index: { unique: true } },
    organism: String,
    url: String,
    description: String,
    reference: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

geneSchema.index({ name: 'text' });

try {
    GeneGene = mongoose.model('Gene');
} catch (e) {
    Gene = mongoose.model('Gene', geneSchema, 'genes');
}

var disSchema = new Schema({
    name: { type: String, index: { unique: true } },
    description: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

disSchema.index({ name: 'text' });

try {
    Disease = mongoose.model('Disease');
} catch (e) {
    Disease = mongoose.model('Disease', disSchema, 'diseases');
}

var orgSchema = new Schema({
    name: { type: String, index: { unique: true } },
    commonName: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

orgSchema.index({ name: 'text' });

try {
     Organism = mongoose.model('Organism');
} catch (e) {
     Organism = mongoose.model('Organism', orgSchema, 'organisms');
}

var toolSchema = new Schema({
    name: { type: String, index: { unique: true } },
    description: String,
    url: String,
    group: { type: Schema.ObjectId, ref: 'Group' }
});

toolSchema.index({ name: 'text' });

try {
     Tool = mongoose.model('Tool');
} catch (e) {
     Tool = mongoose.model('Tool', toolSchema, 'tools');
}

var msgSchema = new Schema({
    message: String,
    date: Date,
    user: { type: Schema.ObjectId, ref: 'User'},
    return: Boolean // True if reason for returning, otherwise false
});


var dataReleaseSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    group: { type: Schema.ObjectId, ref: 'Group', required: true },
    approved: { type: Boolean, required: true, default: false },
    released: { type: Boolean, required: true, default: false },
    dateModified: { type: Date, required: true },
    needsEdit: { type: Boolean, default: false },
    messages: [msgSchema], // Messages between center and NIH
    did: { type: String, required: true },
    datasetName: { type: String, required: true },
    description: { type: String, default: '' }, // Brief description of exp.
    releaseDates: {
        upcoming: Date,
        level1: { type: Date, required: true },
        level2: Date,
        level3: Date,
        level4: Date
    },
    // These are arrays of IDs pointing to the name-metadata server
    metadata: {
        assay: { type: [{ type: Schema.ObjectId, ref: 'Assay'}], default: [] },
        cellLines: { type: [{ type: Schema.ObjectId, ref: 'CellLine' }], default: [] },
        perturbagens: { type: [{ type: Schema.ObjectId, ref: 'Perturbagen' }], default: [] },
        readouts: { type: [{ type: Schema.ObjectId, ref: 'Readout' }], default: [] },
        manipulatedGene: { type: [{ type: Schema.ObjectId, ref: 'Gene' }], default: [] }, // Always length 1
        organism:{ type: [{ type: Schema.ObjectId, ref: 'Organism' }], default: [] }, // Always length 1
        relevantDisease: { type: [{ type: Schema.ObjectId, ref: 'Disease' }], default: [] }, // Always length 1
        analysisTools: { type: [{ type: Schema.ObjectId, ref: 'tool' }], default: [] },
        tagsKeywords: { type: [], default: [] }
    },
    urls: {
        dataUrl: { type: String, default: '' },
        metadataUrl: { type: String, default: '' },
        pubMedUrl: { type: String, default: '' },
        qcDocumentUrl: { type: String, default: '' }
    }
});

// TODO: Check implementation of mongoose-version
// https://github.com/saintedlama/mongoose-version
// dataReleaseSchema.plugin(version);

dataReleaseSchema.pre('save', function(next) {

    //var generateId = function() {
    //    DataRelease
    //        .find({})
    //        .sort({'_id': -1})
    //        .limit(1)
    //        .exec(function(err, latestDoc) {
    //            if (err) {
    //                console.log(err);
    //                next(new Error(err));
    //            } else {
    //                var lDid = latestDoc.did;
    //                var didNum = parseInt(lDid.substr(lDid.length - 5));
    //                this.did = ''
    //                next();
    //            }
    //        });
    //};

    // Update dateModified
    this.dateModified = new Date();

    // Generate 'upcoming' field with closest release date
    //this.releaseDates.upcoming = this.releaseDates.level1 !== '' ?
    //    this.releaseDates.level1 : this.releaseDates.level2 !== '' ?
    //    this.releaseDates.level2 : this.releaseDates.level3 !== '' ?
    //    this.releaseDates.level3 : this.releaseDates.level4 !== '' ?
    //    this.releaseDates.level4 : 'NA';

    // Check if any ids are null. If they are, throw an error
    _.each(this.metadata, function(arr, key) {
        _.each(arr, function(id) {
            if (id === null) {
                next(new Error('An id in the ' + key + ' array was null!'));
            }
        })
    });

    //generateId();
    next();
});

dataReleaseSchema.index({
    datasetName: 'text',
    'metadata.**': 'text',
    'releaseDates.**': 'text',
    'urls.**': 'text'
});

try {
    DataRelease = mongoose.model('DataRelease');
} catch (e) {
    DataRelease = mongoose.model('DataRelease',
        dataReleaseSchema, 'dataReleases');
}
/*

// DANGEROUS: Make updates to every release
DataRelease
    .find({})
    .exec(function(err, releases) {
        _.each(releases, function(release) {
            release.save();
        });
});

*/
module.exports = {
    User: User,
    Group: Group,
    Assay: Assay,
    CellLine: CellLine,
    Perturbagen: Perturbagen,
    Readout: Readout,
    Gene: Gene,
    Disease: Disease,
    Organism: Organism,
    Tool: Tool,
    DataRelease: DataRelease
};
