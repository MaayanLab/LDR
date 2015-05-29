var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    http = require('http'),
    Q = require('q'),
    _ = require('lodash');

http.globalAgent.maxSockets = 100;

var SALT_WORK_FACTOR = 10;
// Uncomment if we want account locking implemented for unsuccessful logins
// var MAX_LOGIN_ATTEMPTS = 100;
// var LOCK_TIME = 2 * 60 * 60 * 1000;


// Mongoose Models and Schemas
var User, Group, DataRelease;
var Schema = mongoose.Schema;

// User
var userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
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
    abbr: { type: String, required: true, index: { unique: true } }
});

try {
    Group = mongoose.model('Group');
} catch (e) {
    Group = mongoose.model('Group', groupSchema, 'groups');
}

var dataReleaseSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    group: { type: Schema.ObjectId, ref: 'Group', required: true },
    approved: { type: Boolean, required: true },
    dateModified: { type: String, required: true },
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

try {
    DataRelease = mongoose.model('DataRelease');
} catch (e) {
    DataRelease = mongoose.model('DataRelease', dataReleaseSchema, 'dataReleases');
}

module.exports = {
    User: User,
    Group: Group,
    DataRelease: DataRelease
};
