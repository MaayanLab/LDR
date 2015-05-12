var jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database');

module.exports = function(app) {

// PERTURBAGENS GET, POST, PUT, DELETE
    app.get('/api/perturbagens', function(req, res) {
        // params are blank, id, or center
        var query;
        if (req.query.id) {
            query = { '_id': req.query.id };
        }
        else if (req.query.centerId) {
            query = { 'center': req.query.centerId };
        }
        else {
            query = {};
        }
        Models.Perturbagen
            .find(query)
            .populate('center')
            .exec(function(err, perturbagens) {
                if (err) {
                    console.log(err);
                    res.status(404).send(err);
                }
                res.status(200).send(perturbagens);
            });
    });

    app.post('/api/secure/perturbagens', function(req, res) {
        console.log('Posting To Perturbagens');
        var inputData = req.body;
        inputData._id = Models.genId();
        var saveData = Models.Perturbagen.create(inputData);
        res.status(201).send(saveData);
    });

    app.put('/api/secure/perturbagens', function(req, res) {
        console.log('Updating perturbagen with id ' + req.query.id);
        if (req.query.id) {
            var query = { '_id': req.query.id };
            var newPert = req.body;
            delete newPert._id;
            Models.Perturbagen.update(query, newPert, function(err, result) {
                if (err) {
                    console.log(err);
                    res.status(404).send(err);
                }
                res.status(200).send(result);
            });
        }
        else {
            res.status(404).send('Perturbagen id wasn\'t given, or the URL query was invalid');
        }
    });

    app.delete('/api/secure/perturbagens', function(req, res) {
        Models.Perturbagen.find({ '_id': req.query.id }).remove(function(err, result) {
            if (err) {
                console.log(err);
                res.status(404).send('Could not delete assay with id: ' + req.query.id + ' Error: ' + err);
            }
            res.status(200).send('Assay with id ' + req.query.id + ' deleted.');
        });

    });

};