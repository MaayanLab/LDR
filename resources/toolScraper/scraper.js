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
    var promisesArr = [];

    var getToolData = function(url, cb) {
        ph.createPage(function(page) {
            page.open(url, function(status) {
                console.log('Opening ' + url + ' was a ' + status);
                page.evaluate(function() {
                    return [].map.call(document.querySelectorAll('#main > article > div > header > h3 > a'), function(link) {
                        return link.getAttribute('href');
                    });
                }, function(result) {
                    var resultUrls = [];
                    _.each(result, function(endpoint) {
                        resultUrls.push(baseUrl + endpoint);
                    });
                    cb(resultUrls);
                });
            });
        });
    };

    var saveTool = function(url) {
        ph.createPage(function(toolPage) {
            toolPage.open(url, function(status) {
                console.log('Opening ' + url + ' was a ' + status);
                toolPage.evaluate(function() {
                    return {
                        title: document.querySelector('#main > article > header > h1').innerHTML,
                        description: document.querySelector('#main > article > div > div > div:nth-child(1)').innerHTML.replace(/(\r\n|\n|\r)/gm, ""),
                        url: document.querySelector('#main > article > div > div > div:nth-child(2) > a').getAttribute('href')
                    };
                }, function(result) {
                    console.log(result);
                    tools.push(result);
                    var newTool = new AnalysisTool(result);
                    newTool.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                });
            });
        });
    };

    _.each(_.range(1, 200), function(pageNumber) {
        getToolData(searchUrl + pageNumber.toString(), function(resultUrls) {
            console.log('Saving tools...');
            _.each(resultUrls, function(url) {
                saveTool(url);
            })
        });
    });
    setTimeout(function() {
        ph.exit();
    }, 50000);
});
