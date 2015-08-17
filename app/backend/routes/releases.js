var jsonWT = require('jsonwebtoken'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  objectId = require('mongoose').Types.ObjectId,
  secret = require('../config/database').secret,
  Models = require('../models'),
  Group = Models.Group,
  DataRelease = Models.DataRelease,
  baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {
  'use strict';

  var populateArr = [{
        path: 'group',
        model: 'Group'
      }, {
        path: 'messages.user',
        model: 'User'
      }, {
        path: 'metadata.assay',
        model: 'Assay'
      }, {
        path: 'metadata.cellLines',
        model: 'CellLine'
      }, {
        path: 'metadata.perturbagens',
        model: 'Perturbagen'
      }, {
        path: 'metadata.readouts',
        model: 'Readout'
      }, {
        path: 'metadata.manipulatedGene',
        model: 'Gene'
      }, {
        path: 'metadata.organism',
        model: 'Organism'
      }, {
        path: 'metadata.relevantDisease',
        model: 'Disease'
      }, {
        path: 'metadata.analysisTools',
        model: 'Tool'
      }];

  var findReleases = function(options, callback) {
    var opts, cb, mongChain;

    // Properly manage arguments of findReleases function
    if (_.isFunction(options) && _.isUndefined(callback)) {
      cb = options;
      opts = {};
    } else if (_.isFunction(callback) && _.isObject(options)) {
      opts = options;
      cb = callback;
    } else {
      throw new Error('Options and Callback are not properly formatted');
    }

    opts.query = opts.query;
    console.log(opts);
    mongChain = DataRelease.find(opts.query);
    if (opts.where) {
      mongChain = mongChain.where(opts.where);
    }
    if (opts.in) {
      mongChain = mongChain.in(opts.in);
    }
    if (opts.lean) {
      mongChain = mongChain.lean();
    }
    if (opts.sort && Object.keys(opts.sort).length > 0) {
      mongChain = mongChain.sort(opts.sort);
    }
    if (opts.populate) {
      mongChain = mongChain.populate(populateArr);
    }

    mongChain
      .exec(function(err, results) {
        if (err) {
          console.log(err);
          cb(err, null);
        } else if (results.length === 1) {
          cb(null, results[0]);
        } else {
          cb(null, results);
        }
      });
  };

  // Endpoint for searching releases. NEEDS QUERY PARAMETER.
  app.get(baseUrl + '/api/releases/search', function(req, res) {

    // Results array to be returned
    var allReleases = [];
    var query = req.query.q;
    if (!query) {
      res.status(400).send('Query string not properly formatted.');
    }
    // 1. Find groups matching query and gather ids
    // 2. Find releases matching from the group that matches an
    //    id found in step 1.
    // 3. Find releases matching query.
    Group
      .find({
        name: new RegExp(query, 'i')
      })
      .lean()
      .exec(getGroups());

    function getGroups(err, groups) {
      if (err) {
        res.status(500).send('There was an error searching for releases.');
      }
      // _.map() and _.pluck do not work for mongoose arrays
      var ids = [];
      _.each(groups, function(obj) {
        ids.push(obj._id);
      });
      var opts = {
        query: {
          group: { $in: ids }
        },
        sort: {
          dateModified: -1
        },
        populate: true,
        lean: true
      };

      findReleases(opts, getReleases);
    }

    function getReleases(err, releases) {
      if (err) {
        console.log(err);
        res.status(404).send('Error searching releases');
      }
      // Add unique releases to total array
      allReleases = _.union(allReleases, releases);

      var newOpts = {
        query: {
          $or: [
            { datasetName: new RegExp(query, 'i') },
            { 'assay.name': new RegExp(query, 'i') }
          ]
        },
        sort: { dateModified: -1 },
        populate: true,
        lean: true
      };

      findReleases(newOpts, sendAllResults);
    }

    function sendAllResults(err, releases) {
      if (err) {
        console.log(err);
        res.status(404).send('Error searching releases');
      } else {
        allReleases = _.union(allReleases, releases);
        // Check that datasetName field is unique
        var uniqueReleases = _.uniq(allReleases, 'datasetName');
        res.status(200).send(uniqueReleases);
      }
    }
  });

  // Returns empty release for initialization on front-end
  app.get(baseUrl + '/api/releases/form/', function(req, res) {
    var releaseInit = {
      datasetName: '',
      description: '',
      metadata: {
        assay: [],
        cellLines: [],
        perturbagens: [],
        readouts: [],
        manipulatedGene: [],
        organism: [],
        relevantDisease: [],
        analysisTools: [],
        tagsKeywords: []
      },
      releaseDates: {
        level1: '',
        level2: '',
        level3: '',
        level4: ''
      },
      urls: {
        pubMedUrl: '',
        dataUrl: '',
        metadataUrl: '',
        qcDocumentUrl: ''
      }
    };
    res.status(200).send(releaseInit);
  });

  // Releases GET endpoint
  app.get(baseUrl + '/api/releases/:type(group|user|form|approved)?/:id?',
    function(req, res) {
      var qType = req.params.type;
      var qId = req.params.id;
      var query = {};
      var sort = {};
      if (qType === 'group' && !_.isUndefined(qId)) {
        query = {
          group: qId
        };
      } else if (qType === 'user' && !_.isUndefined(qId)) {
        query = {
          user: qId
        };
      } else if (qType === 'form' && !_.isUndefined(qId)) {
        query = {
          _id: qId
        };
      } else if (qType === 'approved' && _.isUndefined(qId)) {
        query = {
          approved: true
        };
        sort = {
          released: -1,
          'releaseDates.upcoming': -1
        };
      }

      var options = {
        query: query,
        sort: sort,
        populate: true,
        lean: true
      };

      function callback(err, releases) {
        if (err) {
          console.log(err);
          res.status(404).send('Releases could not be found.');
        } else {
          res.status(200).send(releases);
        }
      }

      findReleases(options, callback);
    }
  );

  // Get all releases that have a certain sample
  // /api/releases/sample?ids=1234,3456,4567
  app.get(baseUrl + '/api/releases/samples/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)',
    function(req, res) {
      var sampleIds = req.query.ids.split(',');
      var s = req.params.sample;
      var metaQuery = 'metadata.';

      if (s === 'assays') {
        metaQuery += 'assay';
      } else if (s === 'cellLines') {
        metaQuery += 'cellLines';
      } else if (s === 'perturbagens') {
        metaQuery += 'perturbagens';
      } else if (s === 'readouts') {
        metaQuery += 'readouts';
      } else if (s === 'genes') {
        metaQuery += 'manipulatedGene';
      } else if (s === 'diseases') {
        metaQuery += 'relevantDisease';
      } else if (s === 'organisms') {
        metaQuery += 'organism';
      } else if (s === 'tools') {
        metaQuery += 'analysisTools';
      }

      var opts = {
        query: {},
        where: metaQuery,
        in: sampleIds,
        populate: true,
        lean: false
      };

      function metaCb(err, releases) {
        if (err) {
          console.log(err);
          res.status(404).send('Error finding releases');
        } else {
          res.status(200).send(releases);
        }
      }

      findReleases(opts, metaCb);
    }
  );

  var formatDataForSave = function(inputData) {
    inputData.approved = true;
    inputData.dateModified = new Date();
    _.each(inputData.releaseDates, function(date) {
      if (date) {
        date = new Date(date);
      }
    });
    inputData.releaseDates.upcoming = inputData.releaseDates.level1 !== '' ?
      inputData.releaseDates.level1 : inputData.releaseDates.level2 !== '' ?
      inputData.releaseDates.level2 : inputData.releaseDates.level3 !== '' ?
      inputData.releaseDates.level3 : inputData.releaseDates.level4 !== '' ?
      inputData.releaseDates.level4 : '';
    inputData.releaseDates.upcoming = new Date(inputData.releaseDates.upcoming);
    return inputData;
  };

  // Create or update a release, or update its urls.
  // If a release is posted with an id, update it
  // No id --> create it
  // Urls endpoint only updates release urls
  app.post(baseUrl + '/api/secure/releases/form/:id?/urls?', function(req,
    res) {
    var inputData = req.body;
    var qId = req.params.id;
    var urls = req.params.urls;

    if (!_.isUndefined(qId) && _.isUndefined(urls)) {
      inputData = formatDataForSave(inputData);
      // /api/secure/releases/form/id
      inputData.needsEdit = false;
      updateRelease(qId, inputData);
    } else if (!_.isUndefined(qId) && !_.isUndefined(urls)) {
      // /api/secure/releases/form/id/urls
      // inputData is an object with urls
      updateUrls(qId, inputData);
    } else if (_.isUndefined(qId) && _.isUndefined(urls)) {
      // /api/secure/releases/form/
      createNewRelease(inputData);
    } else {
      // /api/secure/releases/form/urls
      // THIS URL SHOULD NEVER BE CALLED
      res.status(400).send('URL is not correct');
    }

    function updateUrls(relId, newUrls) {
      var opts = {
        query: {
          _id: relId
        },
        populate: false,
        lean: false
      };
      findReleases(opts, function(err, release) {
        if (err) {
          console.log(err);
          res.status(400).send(
            'There was an error updating urls for ' +
            'entry with id ' + query._id +
            '. Please try again.');
        } else {
          release.dateModified = new Date();
          release.urls = newUrls;
          release.save();
          res.status(202).send(release);
        }
      });
    }

    function updateRelease(relId, updatedRelease) {
      // Can't update _id field
      delete updatedRelease._id;
      var query = {
        _id: relId
      };
      DataRelease.update(query, updatedRelease, function(err, release) {
        if (err) {
          console.log(err);
          res.status(400).send(
            'There was an error updating entry with ' +
            'id ' + query._id + '. Please try again');
        } else {
          res.status(202).send(release);
        }
      });
    }

    function createNewRelease(releaseData) {
      DataRelease.create(releaseData, function(err, release) {
        if (err) {
          console.log(err);
          res.status(400).send('A ' + err.name + ' occurred while ' +
            'saving JSON to database. Please confirm that your JSON ' +
            'is formatted properly. Visit http://www.jsonlint.com ' +
            'to confirm.');
        } else {
          res.status(200).send(release);
        }
      });
    }
  });

  // POST endpoint for messages and superuser to return unapproved releases
  app.post(baseUrl + '/api/secure/releases/form/:id/:type(return|message)/',
    function(req, res) {
      var id = req.params.id;
      var query = {
        _id: id
      };
      var messageObj = req.body;
      messageObj.date = new Date();

      if (req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer') {
        var token = req.headers.authorization.split(' ')[1];
        var user = jsonWT.verify(token, secret, {
          issuer: 'http://amp.pharm.mssm.edu/LDR/'
        });
        messageObj.user = user._id;
        DataRelease.findOne(query, function(err, release) {
          if (err) {
            console.log(err);
            res.status(400).send(
              'There was an error updating messages' +
              ' for entry with id ' + id +
              '. Please try again.');
          } else {
            if (req.params.type === 'return') {
              release.needsEdit = true;
              messageObj.return = true;
            } else {
              messageObj.return = false;
            }
            release.messages.push(messageObj);
            release.save();
            res.status(202).send('Message POSTed');
          }
        });
      } else {
        res.status(401).send('Token or URL are invalid. Try again.');
      }
    });

  app.post(baseUrl + '/api/secure/releases/form/:id/message/remove/',
    function(req, res) {
      var id = req.params.id;
      var query = {
        _id: id
      };
      var messageObj = req.body;

      DataRelease
        .findOne(query)
        .exec(function(err, release) {
          if (err) {
            console.log(err);
            res.status(400).send(
              'There was an error updating messages' +
              ' for entry with id ' + id + '. Please try again.');
          } else {
            // Need to call .toObject() in order for lodash to work
            var releaseObj = release.toObject();
            var messages = releaseObj.messages;
            _.remove(messages, function(msg) {
              console.log(messageObj._id === msg._id.toString());
              return messageObj._id === msg._id.toString();
            });
            release.messages = messages;
            release.save();
            res.status(202).send('Message deleted');
          }
        });
    });

  app.get(baseUrl + '/api/releases/export', function(req, res) {

    var randName = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (var i = 0; i < 5; i++) {
      randName += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    var ids = req.query.ids;
    ids = ids.split(',');

    var stream = fs.createWriteStream(__dirname + '/' + randName + '.txt');

    var opts = {
      query: {
        _id: {
          $in: ids
        }
      },
      populate: true,
      lean: true
    };

    findReleases(opts, exportReleases);

    function exportReleases(err, releases) {
      if (err) {
        console.log(err);
        res.status(404).send('Error getting releases');
      }
      _.each(releases, function(release) {
        var meta = release.metadata;
        var dates = release.releaseDates;
        var urls = release.urls;

        stream.write('DID\t' + release.did + '\n');
        stream.write('DSN\t' + release.datasetName + '\n');
        try {
          stream.write('CTR\t' + release.group.name + '\n');
        } catch (e) {
          console.log('ERROR FOR ' + release._id);
        }
        stream.write('DES\t' + release.description + '\n');
        stream.write('ASY\t' + meta.assay[0].name + '\n');

        _.each(meta.cellLines, function(obj) {
          var appStr = 'CLN\t' + obj.name;
          if (obj.type) {
            appStr += '\t' + obj.type;
          } else {
            appStr += '\t';
          }
          if (obj.class) {
            appStr += '\t' + obj.class;
          } else {
            appStr += '\t';
          }
          if (obj.tissue) {
            appStr += '\t' + obj.tissue;
          } else {
            appStr += '\t';
          }
          stream.write(appStr + '\n');
        });

        _.each(meta.perturbagens, function(obj) {
          var appStr = 'PRT\t' + obj.name;
          if (obj.type) {
            appStr += '\t' + obj.type;
          } else {
            appStr += '\t';
          }
          stream.write(appStr + '\n');
        });

        _.each(meta.readouts, function(obj) {
          var appStr = 'RDO\t' + obj.name;
          if (obj.datatype) {
            appStr += '\t' + obj.datatype;
          } else {
            appStr += '\t';
          }
          stream.write(appStr + '\n');
        });

        _.each(meta.manipulatedGene, function(obj) {
          var appStr = 'PRT\t' + obj.name;
          if (obj.organism) {
            appStr += '\t' + obj.organism;
          } else {
            appStr += '\t';
          }
          if (obj.reference) {
            appStr += '\t' + obj.reference;
          } else {
            appStr += '\t';
          }
          if (obj.url) {
            appStr += '\t' + obj.url;
          } else {
            appStr += '\t';
          }
          if (obj.description) {
            appStr += '\t' + obj.description;
          } else {
            appStr += '\t';
          }
          stream.write(appStr + '\n');
        });

        _.each(meta.organism, function(obj) {
          var appStr = 'ORG\t' + obj.name;
          if (obj.commonName) {
            appStr += '\t' + obj.commonName;
          } else {
            appStr += '\t';
          }
          stream.write(appStr + '\n');
        });

        _.each(meta.relevantDisease, function(obj) {
          var appStr = 'DIS\t' + obj.name;
          if (obj.description) {
            appStr += '\t' + obj.description;
          } else {
            appStr += '\t';
          }
          stream.write(appStr + '\n');
        });

        _.each(meta.analysisTools, function(obj) {
          var appStr = 'ATL\t' + obj.name;
          if (obj.url) {
            appStr += '\t' + obj.url;
          } else {
            appStr += '\t';
          }
          if (obj.description) {
            appStr += '\t' + obj.description;
          } else {
            appStr += '\t';
          }
          stream.write(appStr + '\n');
        });

        stream.write('TKS\t' + meta.tagsKeywords.join('\t') +
          '\n');

        try {
          stream.write('LV1\t' + dates.level1.toString() +
            '\n');
        } catch (e) {
          stream.write('LV1\t' + '' + '\n');
        }

        try {
          stream.write('LV2\t' + dates.level2.toString() +
            '\n');
        } catch (e) {
          stream.write('LV2\t' + '' + '\n');
        }

        try {
          stream.write('LV3\t' + dates.level3.toString() +
            '\n');
        } catch (e) {
          stream.write('LV3\t' + '' + '\n');
        }

        try {
          stream.write('LV4\t' + dates.level4.toString() +
            '\n');
        } catch (e) {
          stream.write('LV4\t' + '' + '\n');
        }

        stream.write('PUB\t' + urls.pubMedUrl + '\n');
        stream.write('DTA\t' + urls.dataUrl + '\n');
        stream.write('MET\t' + urls.metadataUrl + '\n');
        stream.write('QCD\t' + urls.qcDocumentUrl + '\n');

        try {
          stream.write('MOD\t' + release.dateModified.toString() +
            '\n');
        } catch (e) {
          stream.write('MOD\t' + '' + '\n');
        }

        var approved = release.approved ? 'YES' : 'NO';
        stream.write('APR\t' + approved + '\n');

        var released = release.released ? 'YES' : 'NO';
        stream.write('REL\t' + released + '\n');

        stream.write('\n');

      });
      stream.end();
      stream.on('finish', function() {
        res.download(path.join(__dirname, '/', randName, '.txt'),
          'LDR-export.txt',
          function(dlErr) {
            if (dlErr) {
              console.log(dlErr);
              res.status(dlErr.status).end();
            } else {
              fs.unlink(path.join(__dirname, '/', randName, '.txt'),
                function(deleteErr) {
                  if (deleteErr) {
                    throw deleteErr;
                  }
                }
              );
            }
          }
        );
      });
    }
  });

  // Release an entry. Must have a data URL and be approved
  app.put(baseUrl + '/api/secure/releases/form/:id/release',
    function(req, res) {
      var opts = {
        query: {
          _id: req.params.id
        },
        populate: false,
        lean: false
      };

      findReleases(opts, releaseCb);

      function releaseCb(err, release) {
        if (err) {
          console.log(err);
          res.status(404).send('An error occurred getting ' +
            'release with id: ' + id);
        } else if (release.urls.dataUrl === "") {
          res.status(403).send('Data URL required!');
        } else if (release.approved === false) {
          res.status(403).send('Dataset must be approved!');
        } else {
          release.released = true;
          release.save();
          res.status(204).send('Dataset successfully released.');
        }
      }
    }
  );

  // DELETE individual release
  app.delete(baseUrl + '/api/secure/releases/form/:id', function(req, res) {
    DataRelease
      .findOne({_id: req.params.id})
      .remove(function(err) {
        if (err) {
          console.log(err);
          res.status(404).send('There was an error deleting the ' +
            'data release with id ' + req.params.id +
            ' Error: ' + err);
        }
        res.status(200).send('The data release with id ' +
          req.params.id + ' was deleted');
      });
  });
};
