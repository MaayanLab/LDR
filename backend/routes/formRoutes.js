var jwt = require('express-jwt'),
    DataRelease = require('../models').DataRelease,
    config = require('../config/database');

module.exports = function (app) {

    // FORM/DATASET GET, POST, PUT, DELETE
    app.get('/api/data', function (req, res) {
        var query = {};
        if (req.query.centerId && req.query.formId)
            query = { _id: req.query.formId, center: req.query.centerId };
        else if (req.query.centerId)
            query = { center: req.query.centerId };
        else if (req.query.formId)
            query = { _id: req.query.formId };

        console.log(query)
        DataRelease
            .find(query)
            //.buildMetaData()
            .exec(function (err, allData) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Forms could not be found.');
                }
                res.status(200).send(allData);
            });
    });

    app.post('/api/secure/data', function (req, res) {

        /*
         var getCellLine = function(id, callback) {
         Models.CellLine.find({ '_id': id }, function(err, result) {
         if (err) {
         callback(err, null);
         }
         callback(null, result[0]);
         });
         };

         console.log('Posting To Data');
         var inputData = req.body;
         if (inputData.cellLines.length > 1) {
         inputData._id = 'LINCS-' + inputData.center.name + '-MTPL-' + shortId.generate();
         } else if (inputData.cellLines.length === 1) {
         getCellLine(inputData.cellLines[0], function(err, cellLine) {
         if (err) {
         console.log(err);
         }
         inputData._id = 'LINCS-' + inputData.center.name + '-' + cellLine.name + '-' + shortId.generate();
         });
         } else {
         inputData._id = 'LINCS-' + inputData.center.name + '-NONE-' + shortId.generate();
         }
         */

        console.log('Posting To Data...');
        var inputData = req.body;
        inputData.approved = false;
        inputData.dateModified = new Date();

        var form = new DataRelease(inputData);
        console.log(form);
        form.save(function (err) {
            console.log(err);
        });

        res.status(201).send(form);
    });

    // UPDATE
    app.put('/api/secure/data', function (req, res) {
        var newForm = req.body;
        // delete newForm._id;
        DataRelease.update({ _id: req.query.id }, newForm, function (err, result) {
            if (err)
                res.status(404).send('Form with id ' + req.query.id + ' could not be updated');
            res.status(200).send(result);
        });
    });

    // DELETE
    app.delete('/api/secure/data', function (req, res) {
        var query;
        if (req.query.userId && req.query.formId)
            query = { _id: req.query.formId, userId: req.query.userId };
        else if (req.query.formId)
            query = { _id: req.query.formId };

        if (query) {
            DataRelease.find(query).remove(function (err) {
                if (err) {
                    console.log(err);
                    res.status(404).send('There was an error deleting the form with id ' + req.query.formId + ' Error: ' + err);
                }
                res.status(200).send('The form with id ' + req.query.formId + ' was deleted');
            });
        }
        else {
            res.status(404).send('There was an error deleting form. Invalid url query.');
        }
    });
};
