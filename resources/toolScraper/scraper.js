/**
 * @author Michael McDermott
 * Created on 6/3/15.
 */

var phantom = require('phantom');
var _ = require('lodash');
var Q = require('q');
var AnalysisTool = require('../../app/backend/models').AnalysisTool;

phantom.create(function(ph) {
    var baseUrl = 'http://www.omictools.com';
    // Blank search on omictools.com returns all tools.
    var searchUrl = baseUrl + '/site/search/?go=Search&isNewSearch=true&page=';
    var tools = [];

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
                        if (document.querySelector('#main > article > div > div > div:nth-child(2) > a').getAttribute('href')) {
                            resultObj.url = document.querySelector('#main > article > div > div > div:nth-child(2) > a').getAttribute('href');
                        }
                        else if (document.querySelector('#main > article > div > div > table > tbody > tr:nth-child(9) > td > a').getAttribute('href')) {
                            resultObj.url = document.querySelector('#main > article > div > div > table > tbody > tr:nth-child(9) > td > a').getAttribute('href')
                        }
                        return resultObj;
                    }
                    else {
                        console.log('error');
                    }
                }, function(result) {
                    if (result) {
                        if (!Array.isArray(result)) {
                            console.log(result);
                            if (result.title) {
                                tools.push(result);
                            }
                        }
                        else if (Array.isArray(result) && result.length > 0) {
                            var toolIterLeft = result.length - 1;
                            if (toolIterLeft === 0) {
                                finished();
                            }
                            else {
                                for (var i = 1; i < result.length; i++) {
                                    (function(i) {
                                        setTimeout(function() {
                                            getToolData(baseUrl + result[i]);
                                            toolIterLeft--;
                                            console.log(toolIterLeft + ' tools left.');
                                            if (toolIterLeft === 0) {
                                                finished();
                                            }
                                        }, 1000 * i);
                                    }(i));
                                }
                            }
                        }
                    }
                });
            });
        };
        var finished = function() {
            var request = require('superagent');
            request
                .post('http://146.203.54.165:3001/LDR/api/tools/')
                .send({ data: tools })
                .end(function(err, res){
                    if (res.ok) {
                        console.log('yay got ' + JSON.stringify(res.body));
                    } else {
                        console.log('Oh no! error ' + res.text);
                    }
                });
        };

        var overallIterLeft = 200;
        getToolData(searchUrl + '1');
        for (var j = 0; j < overallIterLeft - 1; j++) {
            (function(j) {
                setTimeout(function() {
                    getToolData(searchUrl + j.toString());
                    overallIterLeft--;
                    console.log(overallIterLeft + ' pages left.');
                    if (overallIterLeft === 0) {
                        finished();
                    }
                }, 60000 * j);
            }(j));
        }
    });
});
