/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

var _ = require('lodash'),
    Q = require('q'),
    http = require('http'),
    Models = require('./models'),
    User = Models.User,
    Group = Models.Group,
    DataRelease = Models.DataRelease,
    nameServerUrl = require('./config/nameServer').url;

/**
 * getStats: Get counts for users, releases, and metadata of a group
 * @param groupId: id of group to get stats for
 * @param cb: callback function given error or statResponse
 */
module.exports = function(groupId, cb) {

    var statResponse = {};
    var promisesArr = [];
    User
        .where({ group: groupId })
        .count(function(err, userCount) {
            if (err) {
                console.log(err);
                cb(err, null);
            }
            statResponse.user = userCount;
        });

    DataRelease
        .where({ group: groupId })
        .count(function(err, releaseCount) {
            if (err) {
                console.log(err);
                cb(err, null);
            }
            statResponse.release = releaseCount;
        });

    Group.findOne({ _id: groupId })
        .lean()
        .exec(function(err, group) {
            if (err) {
                console.log(err);
                cb(err, null);
            }
            var metadataEndpoints = ['assay', 'cell', 'perturbagen', 'readout'];
            _.each(metadataEndpoints, function(endpoint) {
                var def = Q.defer();
                var path = '/form/' + endpoint + '?group=' + group.abbr;

                http.get(nameServerUrl + path, function(res) {
                    var jsonString = '';
                    res.on('data', function(chunk) {
                        jsonString += chunk;
                    });
                    res.on('end', function() {
                        var body = JSON.parse(jsonString);
                        statResponse[endpoint] = body.length;
                        def.resolve(statResponse);
                    });
                }).on('error', function(err) {
                    console.log('Error in request to name server: ' + err.message);
                    def.reject('A server error occurred while populating releases from name server');
                });
                promisesArr.push(def.promise);
            });

            Q.all(promisesArr).then(function() {
                cb(null, statResponse);
            })
        });

};
