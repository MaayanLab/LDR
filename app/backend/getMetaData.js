/**
 * @author Michael McDermott
 * Created on 5/20/15.
 */

var _ = require('lodash'),
    Q = require('q'),
    http = require('http'),
    nameServerUrl = require('./config/nameServer').url;

/**
 * buildMeta: Make request to name-server and replace arrays of IDs with arrays of JSON data
 * @param releaseData: JSON stored in local database with pointers to Name/Metadata Server
 * @param cb: Callback function given error or releaseData with populated metadata
 */
module.exports = function(releaseData, cb) {
    var resultObj = {};
    var promisesArr = [];
    var metadataObj = releaseData.metadata.toObject();

    _.each(metadataObj, function(valArray, key) {
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
                cb(null, resultObj);
            });
            promisesArr.push(def.promise);
        }
    });
    Q.all(promisesArr).then(function() {
        releaseData.metadata = resultObj;
        cb(null, releaseData);
    });
};