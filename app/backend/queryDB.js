var http = require('http');
var Q = require('q');
var mongoose = require('mongoose');
var Models = require('./models');
var CellLine = Models.CellLine;
var DataRelease = Models.DataRelease;
var Group = Models.Group;

function queryDBWithData(data) {
  var cLineIds = [];
  data.forEach(function(dataArr) {
    var geoAcc = dataArr[0];
    if (geoAcc === 'geo_accession') {
      return;
    }
    var cellName = dataArr[1];
    var cellType = dataArr[2];
    var subType = dataArr[3];
    Group.findOne({
      name: 'MEP-LINCS'
    })
    .lean()
    .exec(function(err, group) {
      if (err) {
        console.log(err);
      } else if (group._id) {
        CellLine.create({
          name: cellName,
          type: 'cancer line',
          tissue: 'breast',
          group: group._id
        }, function(err, cellLine) {
          if (err) {
            console.log(err);
          } else {
            console.log(cellLine.name);
          }
        });
      } else {
        console.log(group);
      }
    });
  });

}

// http.get({
//   host: 'www.eh3.uc.edu',
//   path: '/ocpu/tmp/x0e097dbcf2/R/.val/json'
// }, function(response) {
//   var body = '';
//   response.on('data', function(d) {
//     body += d;
//   });
//   response.on('end', function() {
//     var parsed = JSON.parse(body);
//     var innerParsed = JSON.parse(parsed[0]);
//     queryDBWithData(innerParsed);
//   });
// });
