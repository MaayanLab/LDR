/**
 * @author Michael McDermott
 * Created on 6/3/15.
 */

// MAKE SURE THAT SERVER IS RUNNING TO KEEP MONGOOSE CONNECTION
var phantom = require('phantom');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var AnalysisTool = require('../../app/backend/models').AnalysisTool;

phantom.create(function(ph) {
    var baseUrl = 'http://www.omictools.com';
    // Blank search on omictools.com returns all tools. 50 per page
    var searchUrl = baseUrl + '/site/search/?go=Search&isNewSearch=true&page=';
    var tools = [];
    var file = fs.createWriteStream('tools.json');
    var sep = '';

    ph.createPage(function(page) {
        var getToolData = function(url) {
            page.open(url, function(status) {
                console.log('Opening ' + url + ' was a ' + status);
                page.evaluate(function() {
                    if (document.querySelector('#main > article > div > header > h3 > a')) {
                        return [].map.call(document.querySelectorAll('#main > article > div > header > h3 > a'), function(link) {
                            return link.getAttribute('href');
                        });
                    }
                    else if (document.querySelector('#main > article > header > h1')) {
                        var resultObj = {};
                        resultObj.title = document.querySelector('#main > article > header > h1').innerHTML;
                        resultObj.description = document.querySelector('#main > article > div > div > div:nth-child(1)').innerHTML.replace(/(\r\n|\n|\r)/gm, '');
                        if (document.querySelector('#main > article > div > div > div:nth-child(2) > a')) {
                            resultObj.url = document.querySelector('#main > article > div > div > div:nth-child(2) > a').getAttribute('href');
                        }
                        else if (document.querySelector('#main > article > div > div > table > tbody > tr:nth-child(9) > td > a')) {
                            resultObj.url = document.querySelector('#main > article > div > div > table > tbody > tr:nth-child(9) > td > a').getAttribute('href')
                        }
                        return resultObj;
                    }
                    else {
                        console.log('------------ERROR--------------');
                    }
                }, function(result) {
                    if (result) {
                        if (!Array.isArray(result)) {
                            if (result.title) {
                                file.write(sep + JSON.stringify(result));
                                if (!sep) {
                                    sep = ',\n';
                                }
                                tools.push(result);
                            }
                        }
                        else if (Array.isArray(result) && result.length > 0) {
                            var toolIterLeft = result.length - 1;
                            for (var i = 1; i < result.length; i++) {
                                (function(i) {
                                    setTimeout(function() {
                                        getToolData(baseUrl + result[i]);
                                        toolIterLeft--;
                                        console.log(toolIterLeft + ' tools left.');
                                        if (toolIterLeft === 0) {
                                            tryToFinish();
                                        }
                                    }, 1100 * i);
                                }(i));
                            }
                        }
                    }
                    else {
                        tryToFinish();
                    }
                });
            });
        };

        var numPagesToSearch = 182;
        file.write('[\n');
        for (var j = 1; j <= numPagesToSearch; j++) {
            (function(j) {
                setTimeout(function() {
                    numPagesToSearch--;
                    getToolData(searchUrl + j.toString());
                }, 60000 * j);
            }(j));
        }
        var tryToFinish = function() {
            console.log('Checking pages left...');
            console.log(numPagesToSearch + ' pages left.');
            if (numPagesToSearch === 0) {
                file.write('\n]');
                file.end();
                ph.exit();
            }
        };
    });
});

/*
 Fails

 */
