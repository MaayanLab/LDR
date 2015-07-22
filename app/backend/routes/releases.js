var jwt = require('express-jwt'),
    jsonWT = require('jsonwebtoken'),
    fs = require('fs'),
    _ = require('lodash'),
    Q = require('q'),
    secret = require('../config/database').secret,
    Models = require('../models'),
    DataRelease = Models.DataRelease,
    Group = Models.Group,
    baseUrl = require('../config/baseUrl').baseUrl,
    config = require('../config/database');

module.exports = function(app) {

    // Endpoint for searching releases. NEEDS QUERY PARAMETER.
    app.get(baseUrl + '/api/releases/search', function(req, res) {
        var query = req.query.q;
        if (!query) {
            res.status(400).send('Query string not properly formatted.');
        }
        // 1. Find groups matching query and gather ids
        // 2. Find releases matching from the group that matches an
        //    id found in step 1.
        // 3. Find releases matching query.
        Group
            .find({ name: new RegExp(query, 'i') })
            .lean()
            .exec(function(err, groups) {
                if (err) {
                    res.status(500).send(
                        'There was an error searching for releases.'
                    );
                }

                // _.map() and _.pluck do not work for mongoose arrays
                var ids = [];
                _.each(groups, function(obj) {
                    ids.push(obj._id);
                });
                DataRelease
                    .find({ group: { $in: ids } })
                    .sort({ dateModified: -1 })
                    .populate([
                        { path: 'group', model: 'Group' },
                        { path: 'messages.user', model: 'User' },
                        { path: 'metadata.assay', model: 'Assay' },
                        { path: 'metadata.cellLines', model: 'CellLine' },
                        { path: 'metadata.perturbagens', model: 'Perturbagen' },
                        { path: 'metadata.readouts', model: 'Readout' },
                        { path: 'metadata.manipulatedGene', model: 'Gene' },
                        { path: 'metadata.organism', model: 'Organism' },
                        { path: 'metadata.relevantDisease', model: 'Disease' },
                        { path: 'metadata.analysisTools', model: 'Tool' }
                    ])
                    .lean()
                    .exec(function(err, drgResults) {
                        if (err) {
                            console.log(err);
                            res.status(404).send('Error searching releases');
                        }

                        DataRelease
                            .find({
                                $or: [
                                    { datasetName: new RegExp(query, 'i') },
                                    { 'assay.name': new RegExp(query, 'i') }
                                ]
                            })
                            .sort({ dateModified: -1 })
                            .populate([
                                { path: 'group', model: 'Group' },
                                { path: 'messages.user', model: 'User' },
                                { path: 'metadata.assay', model: 'Assay' },
                                {
                                    path: 'metadata.cellLines',
                                    model: 'CellLine'
                                },
                                {
                                    path: 'metadata.perturbagens',
                                    model: 'Perturbagen'
                                },
                                { path: 'metadata.readouts', model: 'Readout' },
                                {
                                    path: 'metadata.manipulatedGene',
                                    model: 'Gene'
                                },
                                {
                                    path: 'metadata.organism',
                                    model: 'Organism'
                                },
                                {
                                    path: 'metadata.relevantDisease',
                                    model: 'Disease'
                                },
                                {
                                    path: 'metadata.analysisTools',
                                    model: 'Tool'
                                }
                            ])
                            .lean()
                            .exec(function(err, results) {
                                if (err) {
                                    console.log(err);
                                    res.status(404).send('Error searching releases');
                                } else {
                                    var data = _.union(results, drgResults);
                                    var uniqueData = _.uniq(data, 'datasetName');
                                    res.status(200).send(uniqueData);
                                }
                            }
                        );
                    }
                );
            }
        );
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

    // Individual release endpoint.
    // Query id returns form with that id for editing on front end.
    app.get(baseUrl + '/api/releases/form/:id', function(req, res) {
        DataRelease
            .findOne({ _id: req.params.id })
            .populate([
                { path: 'group', model: 'Group' },
                { path: 'messages.user', model: 'User' },
                { path: 'metadata.assay', model: 'Assay' },
                { path: 'metadata.cellLines', model: 'CellLine' },
                { path: 'metadata.perturbagens', model: 'Perturbagen' },
                { path: 'metadata.readouts', model: 'Readout' },
                { path: 'metadata.manipulatedGene', model: 'Gene' },
                { path: 'metadata.organism', model: 'Organism' },
                { path: 'metadata.relevantDisease', model: 'Disease' },
                { path: 'metadata.analysisTools', model: 'Tool' }
            ])
            .lean()
            .exec(function(err, release) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Error: Release could not be found. ' +
                        'Id may be invalid');
                } else if (!release) {
                    res.status(404).send('Error: Release with given id could ' +
                        'not be found.');
                } else {
                    res.status(200).send(release);
                }
            });
    });

    // Multiple releases endpoint for all releases
    app.get(baseUrl + '/api/releases/', function(req, res) {
        DataRelease
            .find({})
            .populate([
                { path: 'group', model: 'Group' },
                { path: 'messages.user', model: 'User' },
                { path: 'metadata.assay', model: 'Assay' },
                { path: 'metadata.cellLines', model: 'CellLine' },
                { path: 'metadata.perturbagens', model: 'Perturbagen' },
                { path: 'metadata.readouts', model: 'Readout' },
                { path: 'metadata.manipulatedGene', model: 'Gene' },
                { path: 'metadata.organism', model: 'Organism' },
                { path: 'metadata.relevantDisease', model: 'Disease' },
                { path: 'metadata.analysisTools', model: 'Tool' }
            ])
            .lean()
            .exec(function(err, allData) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Releases could not be found.');
                } else {
                    res.status(200).send(allData);
                }
            }
        );
    });

    // Multiple releases endpoint for specific group or user
    app.get(baseUrl + '/api/releases/:type(group|user)/:id',
        function(req, res) {
            var query = {};
            if (req.params.type === 'group') {
                query = { group: req.params.id };
            }
            if (req.params.type === 'user') {
                query = { user: req.params.id };
            }
            DataRelease
                .find(query)
                .populate([
                    { path: 'group', model: 'Group' },
                    { path: 'messages.user', model: 'User' },
                    { path: 'metadata.assay', model: 'Assay' },
                    { path: 'metadata.cellLines', model: 'CellLine' },
                    { path: 'metadata.perturbagens', model: 'Perturbagen' },
                    { path: 'metadata.readouts', model: 'Readout' },
                    { path: 'metadata.manipulatedGene', model: 'Gene' },
                    { path: 'metadata.organism', model: 'Organism' },
                    { path: 'metadata.relevantDisease', model: 'Disease' },
                    { path: 'metadata.analysisTools', model: 'Tool' }
                ])
                .lean()
                .exec(function(err, releases) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Releases could not be found.');
                    } else {
                        res.status(200).send(releases);
                    }
                }
            );
        }
    );

    // Releases endpoint to get 25 latest approved releases
    app.get(baseUrl + '/api/releases/approved/', function(req, res) {
            DataRelease
                .find({ approved: true })
                .sort({ released: -1, 'releaseDates.upcoming': 1 })
                .limit(25)
                .populate([
                    { path: 'group', model: 'Group' },
                    { path: 'messages.user', model: 'User' },
                    { path: 'metadata.assay', model: 'Assay' },
                    { path: 'metadata.cellLines', model: 'CellLine' },
                    { path: 'metadata.perturbagens', model: 'Perturbagen' },
                    { path: 'metadata.readouts', model: 'Readout' },
                    { path: 'metadata.manipulatedGene', model: 'Gene' },
                    { path: 'metadata.organism', model: 'Organism' },
                    { path: 'metadata.relevantDisease', model: 'Disease' },
                    { path: 'metadata.analysisTools', model: 'Tool' }
                ])
                .lean()
                .exec(function(err, releases) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Could not return ' +
                            'approved releases');
                    } else {
                        res.status(200).send(releases);
                    }
                }
            );
        }
    );

    // Releases endpoint for homepage infinite scroll
    app.get(baseUrl + '/api/releases/approved/:afterId/', function(req, res) {
        var afterId = req.params.afterId;
        var query = { _id: afterId };
        DataRelease
            .findOne(query)
            .lean()
            .exec(function(err, latestRelease) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Could not return release');
                } else {
                    var dateToSearch = latestRelease.releaseDates.upcoming;
                    if (!(dateToSearch instanceof Date)) {
                        dateToSearch = new Date(dateToSearch);
                    }
                    DataRelease
                        .find(
                        { 'releaseDates.upcoming': { $gt: dateToSearch } })
                        .sort({ released: -1, 'releaseDates.upcoming': 1 })
                        .limit(25)
                        .populate([
                            { path: 'group', model: 'Group' },
                            { path: 'messages.user', model: 'User' },
                            { path: 'metadata.assay', model: 'Assay' },
                            { path: 'metadata.cellLines', model: 'CellLine' },
                            {
                                path: 'metadata.perturbagens',
                                model: 'Perturbagen'
                            },
                            { path: 'metadata.readouts', model: 'Readout' },
                            { path: 'metadata.manipulatedGene', model: 'Gene' },
                            { path: 'metadata.organism', model: 'Organism' },
                            {
                                path: 'metadata.relevantDisease',
                                model: 'Disease'
                            },
                            { path: 'metadata.analysisTools', model: 'Tool' }
                        ])
                        .lean()
                        .exec(function(err, afterReleases) {
                            if (err) {
                                console.log(err);
                                res.status(404).send('Could not find releases' +
                                    ' after ' + latestRelease.releaseDates.upcoming);
                            } else {
                                res.status(200).send(afterReleases);
                            }
                        }
                    );
                }
            }
        );
    });

    /*
     var formatData = function(inputData, cb) {
     DataRelease
     .findOne({ _id: inputData._id })
     .lean()
     .exec(function(err, origData) {
     if (err) {
     console.log(err);
     cb(err, null);
     } else {
     inputData.dateModified = new Date();
     _.each(inputData.releaseDates, function(date) {
     if (date) {
     date = new Date(date);
     }
     return date;
     });
     inputData.releaseDates.upcoming = inputData.releaseDates.level1 !== '' ?
     inputData.releaseDates.level1 : inputData.releaseDates.level2 !== '' ?
     inputData.releaseDates.level2 : inputData.releaseDates.level3 !== '' ?
     inputData.releaseDates.level3 : inputData.releaseDates.level4 !== '' ?
     inputData.releaseDates.level4 : '';
     inputData.releaseDates.upcoming = new Date(inputData.releaseDates.upcoming);

     /!**
     *  If origData doesn't exist than it's either a new release
     *  or something is wrong with the _id field.
     *
     *  If cellLines, perturbagens, and release dates are not
     *  changed, then the NIH does not need to approve.
     *  If the release does not exist, or one of the above fields
     *  have been changed, set approved to false
     *!/

     inputData.approved = origData ? (_.isEqual(inputData.metadata.cellLines, origData.metadata.cellLines) &&
     _.isEqual(inputData.metadata.perturbagens, origData.metadata.perturbagens) &&
     compareDateObjs(inputData.releaseDates, origData.releaseDates)) : false;

     cb(null, inputData);
     }
     }
     );
     };
     */

    var formatData = function(inputData) {
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

    // Post release without id and save it to the database
    app.post(baseUrl + '/api/secure/releases/form/', function(req, res) {
        var inputData = formatData(req.body);

        DataRelease.create(inputData, function(err, form) {
            if (err) {
                console.log(err);
                res.status(400).send('A ' + err.name + ' occurred while ' +
                    'saving JSON to database. Please confirm that your JSON ' +
                    'is formatted properly. Visit http://www.jsonlint.com ' +
                    'to confirm.');
            } else {
                res.status(200).send(form);
            }
        });
    });

    // POST release with id, find it and update
    app.post(baseUrl + '/api/secure/releases/form/:id', function(req, res) {
        var inputData = formatData(req.body);

        inputData.needsEdit = false;
        var query = { _id: req.params.id };
        // Can't update _id field
        delete inputData._id;
        DataRelease.update(query, inputData, function(err, release) {
            if (err) {
                console.log(err);
                res.status(400).send('There was an error updating entry with ' +
                    'id ' + query._id + '. Please try again');
            } else {
                res.status(202).send(release);
            }
        });
    });

    // POST endpoint for released forms. Only update urls
    app.post(baseUrl + '/api/secure/releases/form/:id/urls/', function(req, res) {
        var id = req.params.id;
        var query = { _id: id };
        var urls = req.body;
        DataRelease.findOne(query, function(err, release) {
            if (err) {
                console.log(err);
                res.status(400).send('There was an error updating urls for ' +
                    'entry with id ' + query._id + '. Please try again.');
            } else {
                release.dateModified = new Date();
                release.urls = urls;
                release.save();
                res.status(202).send(release);
            }
        });
    });

    // POST endpoint for messages and superuser to return unapproved releases
    app.post(baseUrl + '/api/secure/releases/form/:id/:type(return|message)/', function(req, res) {
        var id = req.params.id;
        var query = { _id: id };
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
                    res.status(400).send('There was an error updating messages' +
                        ' for entry with id ' + id + '. Please try again.');
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

    app.post(baseUrl + '/api/secure/releases/form/:id/message/remove/', function(req, res) {
        var id = req.params.id;
        var query = { _id: id };
        var messageObj = req.body;

        DataRelease
            .findOne(query)
            .exec(function(err, release) {
                if (err) {
                    console.log(err);
                    res.status(400).send('There was an error updating messages' +
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

        DataRelease
            .find({ _id: { $in: ids } })
            .populate([
                { path: 'group', model: 'Group' },
                { path: 'messages.user', model: 'User' },
                { path: 'metadata.assay', model: 'Assay' },
                { path: 'metadata.cellLines', model: 'CellLine' },
                { path: 'metadata.perturbagens', model: 'Perturbagen' },
                { path: 'metadata.readouts', model: 'Readout' },
                { path: 'metadata.manipulatedGene', model: 'Gene' },
                { path: 'metadata.organism', model: 'Organism' },
                { path: 'metadata.relevantDisease', model: 'Disease' },
                { path: 'metadata.analysisTools', model: 'Tool' }
            ])
            .lean()
            .exec(function(err, releases) {
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

                    stream.write('TKS\t' + meta.tagsKeywords.join('\t') + '\n');

                    try {
                        stream.write('LV1\t' + dates.level1.toString() + '\n');
                    } catch (e) {
                        stream.write('LV1\t' + '' + '\n');
                    }

                    try {
                        stream.write('LV2\t' + dates.level2.toString() + '\n');
                    } catch (e) {
                        stream.write('LV2\t' + '' + '\n');
                    }

                    try {
                        stream.write('LV3\t' + dates.level3.toString() + '\n');
                    } catch (e) {
                        stream.write('LV3\t' + '' + '\n');
                    }

                    try {
                        stream.write('LV4\t' + dates.level4.toString() + '\n');
                    } catch (e) {
                        stream.write('LV4\t' + '' + '\n');
                    }

                    stream.write('PUB\t' + urls.pubMedUrl + '\n');
                    stream.write('DTA\t' + urls.dataUrl + '\n');
                    stream.write('MET\t' + urls.metadataUrl + '\n');
                    stream.write('QCD\t' + urls.qcDocumentUrl + '\n');

                    try {
                        stream.write('MOD\t' + release.dateModified.toString() + '\n');
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
                    res.download(__dirname + '/' + randName + '.txt', 'LDR-export.txt',
                        function(err) {
                            if (err) {
                                console.log(err);
                                res.status(err.status).end();
                            } else {
                                console.log(__dirname + '/' + randName + '.txt SENT');
                                fs.unlink(__dirname + '/' + randName + '.txt', function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log(__dirname + '/' + randName + '.txt DELETED');
                                });
                            }
                        }
                    );
                });
            }
        );
    });

    // Release an entry. Must have a data URL and be approved
    app.put(baseUrl + '/api/secure/releases/form/:id/release',
        function(req, res) {
            var id = req.params.id;
            var query = { _id: id };
            DataRelease
                .findOne(query)
                .exec(function(err, release) {
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
            );
        }
    );

    // DELETE individual release
    app.delete(baseUrl + '/api/secure/releases/form/:id', function(req, res) {
        DataRelease
            .findOne({ _id: req.params.id })
            .remove(function(err) {
                if (err) {
                    console.log(err);
                    res.status(404).send('There was an error deleting the ' +
                        'data release with id ' + req.params.id +
                        ' Error: ' + err);
                }
                res.status(200).send('The data release with id ' +
                    req.params.id + ' was deleted');
            }
        );
    });
};
