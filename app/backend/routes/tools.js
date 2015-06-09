/**
 * @author Michael McDermott
 * Created on 6/5/15.
 */

var _ = require('lodash'),
    Q = require('q'),
    baseUrl = require('../config/baseUrl').baseUrl,
    AnalysisTool = require('../models').AnalysisTool;

// Post a tool and save it to the db
module.exports = function(app) {
    app.post(baseUrl + '/api/tools/', function(req, res) {
        var inputTools = req.body.data;
        var promisesArr = [];
        var tools = [];

        _.each(inputTools, function(inputTool) {
            var def = Q.defer();
            var tool = new AnalysisTool(inputTool);
            tool.save(function(err) {
                if (err) {
                    console.log(err);
                    res.status(400).send('A ' + err.name + ' occurred while ' +
                        'saving tool to database. Please confirm that your JSON ' +
                        'is formatted properly. Visit http://www.jsonlint.com ' +
                        'to confirm.');
                }
                else {
                    tools.push(tool);
                    def.resolve(tool);
                    promisesArr.push(def.promise);

                }
            });
        });
        Q.all(promisesArr).then(function() {
            res.status(200).send(tools);
        })
    });
};