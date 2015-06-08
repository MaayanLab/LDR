/**
 * @author Michael McDermott
 * Created on 6/5/15.
 */

var baseUrl = require('../config/baseUrl').baseUrl,
    AnalysisTool = require('../models').AnalysisTool;

// Post a tool and save it to the db
module.exports = function(app) {
    app.post(baseUrl + '/api/secure/tools/', function(req, res) {
        var inputTool = req.body;

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
                res.status(200).send(tool);
            }
        });
    });
};