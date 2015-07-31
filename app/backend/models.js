/**
 * @author Michael McDermott
 * Created on 7/29/15.
 */

'use strict';

var mongoose = require('mongoose'),
  // version = require('mongoose-version'),
  bcrypt = require('bcrypt'),
  http = require('http'),
  // Q = require('q'),
  _ = require('lodash');

http.globalAgent.maxSockets = 100;

var SALT_WORK_FACTOR = 10;

// Mongoose Models and Schemas
var User, Group, Assay, CellLine, Perturbagen, Readout, Gene, Disease,
  Organism, Tool, DataRelease, Publication;
var Schema = mongoose.Schema;

// User
var userSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    data: Buffer,
    contentType: String
  },
  // Make email unique?
  email: {
    type: String,
    required: true /*, index: { unique: true }*/
  },
  group: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Group'
  },
  admin: {
    type: Boolean,
    required: true,
    default: false
  },
  admitted: {
    type: Boolean,
    required: true,
    default: false
  },
  location: {
    type: String,
    default: ''
  },
  fieldOfStudy: {
    type: String,
    default: ''
  },
  homepage: {
    type: String,
    default: ''
  }
});

userSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(saltErr, hash) {
      if (saltErr) {
        return next(saltErr);
      }

      // override the clear-text password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.checkPassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

try {
  User = mongoose.model('User');
} catch (e) {
  User = mongoose.model('User', userSchema, 'users');
}

// Group
var groupSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  homepage: {
    type: String,
    default: ''
  },
  icon: {
    path: {
      type: String,
      default: '/usr/src/app/hdfs/97a6f65cb0c61d48704153af6bdc4c3c.png'
    },
    type: {
      type: String,
      default: 'image/png'
    }
  },
  email: String,
  about: {
    type: String,
    default: ''
  },
  location: String
});

groupSchema.index({
  name: 'text'
});

try {
  Group = mongoose.model('Group');
} catch (e) {
  Group = mongoose.model('Group', groupSchema, 'groups');
}

var asSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  description: String,
  abbr: {
    type: String,
    index: {
      unique: true
    }
  },
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

asSchema.index({
  name: 'text'
});

try {
  Assay = mongoose.model('Assay');
} catch (e) {
  Assay = mongoose.model('Assay', asSchema, 'assays');
}

var clSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  type: String,
  class: String,
  controlOrDisease: String,
  tissue: String,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

clSchema.index({
  name: 'text'
});

try {
  CellLine = mongoose.model('CellLine');
} catch (e) {
  CellLine = mongoose.model('CellLine', clSchema, 'cellLines');
}

var pertSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  type: String,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

pertSchema.index({
  name: 'text'
});

try {
  Perturbagen = mongoose.model('Perturbagen');
} catch (e) {
  Perturbagen = mongoose.model('Perturbagen', pertSchema, 'perturbagens');
}

var roSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  datatype: String,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

roSchema.index({
  name: 'text'
});

try {
  Readout = mongoose.model('Readout');
} catch (e) {
  Readout = mongoose.model('Readout', roSchema, 'readouts');
}

var geneSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  organism: String,
  url: String,
  description: String,
  reference: String,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

geneSchema.index({
  name: 'text'
});

try {
  Gene = mongoose.model('Gene');
} catch (e) {
  Gene = mongoose.model('Gene', geneSchema, 'genes');
}

var disSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  description: String,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

disSchema.index({
  name: 'text'
});

try {
  Disease = mongoose.model('Disease');
} catch (e) {
  Disease = mongoose.model('Disease', disSchema, 'diseases');
}

var orgSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  commonName: String,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

orgSchema.index({
  name: 'text'
});

try {
  Organism = mongoose.model('Organism');
} catch (e) {
  Organism = mongoose.model('Organism', orgSchema, 'organisms');
}

var toolSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  description: String,
  url: String,
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  }
});

toolSchema.index({
  name: 'text'
});

try {
  Tool = mongoose.model('Tool');
} catch (e) {
  Tool = mongoose.model('Tool', toolSchema, 'tools');
}

var msgSchema = new Schema({
  message: String,
  date: Date,
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  return: Boolean // True if admin's 'reason for returning', otherwise false
});


var dataReleaseSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: Schema.ObjectId,
    ref: 'Group',
    required: true
  },
  approved: {
    type: Boolean,
    required: true,
    default: false
  },
  released: {
    type: Boolean,
    required: true,
    default: false
  },
  dateModified: {
    type: Date,
    required: true
  },
  needsEdit: {
    type: Boolean,
    default: false
  },
  messages: [msgSchema], // Messages between center and NIH
  did: {
    type: String,
    required: true
  },
  datasetName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }, // Brief description of exp.
  releaseDates: {
    upcoming: Date,
    level1: {
      type: Date,
      required: true
    },
    level2: Date,
    level3: Date,
    level4: Date
  },
  // These are arrays of IDs pointing to the name-metadata server
  metadata: {
    assay: {
      type: [{
        type: Schema.ObjectId,
        ref: 'Assay'
      }],
      default: []
    },
    cellLines: {
      type: [{
        type: Schema.ObjectId,
        ref: 'CellLine'
      }],
      default: []
    },
    perturbagens: {
      type: [{
        type: Schema.ObjectId,
        ref: 'Perturbagen'
      }],
      default: []
    },
    readouts: {
      type: [{
        type: Schema.ObjectId,
        ref: 'Readout'
      }],
      default: []
    },
    manipulatedGene: {
      type: [{
        type: Schema.ObjectId,
        ref: 'Gene'
      }],
      default: []
    }, // Always length 1
    organism: {
      type: [{
        type: Schema.ObjectId,
        ref: 'Organism'
      }],
      default: []
    }, // Always length 1
    relevantDisease: {
      type: [{
        type: Schema.ObjectId,
        ref: 'Disease'
      }],
      default: []
    }, // Always length 1
    analysisTools: {
      type: [{
        type: Schema.ObjectId,
        ref: 'tool'
      }],
      default: []
    },
    tagsKeywords: {
      type: [],
      default: []
    }
  },
  urls: {
    dataUrl: {
      type: String,
      default: ''
    },
    metadataUrl: {
      type: String,
      default: ''
    },
    pubMedUrl: {
      type: String,
      default: ''
    },
    qcDocumentUrl: {
      type: String,
      default: ''
    }
  }
});

// TODO: Check implementation of mongoose-version
// https://github.com/saintedlama/mongoose-version
// dataReleaseSchema.plugin(version);

dataReleaseSchema.pre('save', function(next) {
  var rel = this;

  // ID format: LINCS_CENTERNAME_ASSAYABBR_NUMBER
  // Example: LINCS_DTOXS_RNS_001
  //var generateId = function() {
  //    DataRelease
  //        .find({})
  //        .sort({_id: -1})
  //        .limit(1)
  //        .exec(function(err, latestDoc) {
  //            if (err) {
  //                console.log(err);
  //                next(new Error(err));
  //            } else {
  //                // Get Group name and Assay Abbr
  //                Group
  //                    .findOne({_id: rel.group})
  //                    .lean()
  //                    .exec(function(err, group) {
  //                        if (err) {
  //                            next(new Error(err));
  //                        } else {
  //                            var groupName = group.name;
  //                            // Replace space with hyphen
  //                            groupName.split(' ').join('-');
  //
  //                            Assay
  //                                .find({_id: rel.metadata.assay[0]})
  //                                .lean()
  //                                .exec(function(err, assay) {
  //                                    if (err) {
  //                                        next(new Error(err));
  //                                    } else {
  //                                        var assayAbbr = assay.abbr;
  //                                        var didArr = latestDoc[0].did.split('_');
  //                                        var didNum = parseInt(didArr[didArr.length - 1]) + 1;
  //                                        var didNumStr = didNum.toString();
  //
  //                                        var lenGrThree = function(string) {
  //                                            if (string.length < 3) {
  //                                                string = '0' + string;
  //                                                lenGrThree(string);
  //                                            }
  //                                            return string
  //                                        };
  //
  //                                        rel.did = 'LINCS_' + groupName +
  //                                            '_' + assayAbbr + '_' +
  //                                            lenGrThree(didNumStr);
  //
  //                                        next();
  //                                    }
  //                                }
  //                            );
  //                        }
  //                    }
  //                );
  //            }
  //        }
  //    );
  //};

  // Update dateModified
  rel.dateModified = new Date();

  // Check if any ids are null. If they are, throw an error
  _.each(rel.metadata, function(arr, key) {
    _.each(arr, function(id) {
      if (id === null) {
        next(new Error('An id in the ' + key + ' array was null!'));
      }
    });
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

var publicationSchema = new Schema({
  citation: {
    authors: [String],
    articleName: String,
    journalName: String,
    volume: String,
    issue: String,
    ppPages: String,
    yearPublished: String,
    pmId: {
      type: String,
      required: true
    },
    pmcId: String,
    doi: String
  },
  readoutAssay: [String],
  compTools: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Tool'
    }],
    default: []
  },
  link: String
});

try {
  Publication = mongoose.model('Publication');
} catch (e) {
  Publication = mongoose.model('Publication',
    publicationSchema, 'publications');
}

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
  DataRelease: DataRelease,
  Publication: Publication
};
