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

    //_.each(_.range(1,200), function(searchPNum) {
    var searchPNum = 1;
    ph.createPage(function getToolData(page) {
        page.open(searchUrl + searchPNum.toString(), function(status) {
            console.log('Opening ' + url + ' was a ' + status);
            page.evaluate(function() {
                if (document.querySelector('#main > article > div > header > h3 > a')) {
                    return [].map.call(document.querySelectorAll('#main > article > div > header > h3 > a'), function(link) {
                        return link.getAttribute('href');
                    });
                }
                else {
                    return {
                        title: document.querySelector('#main > article > header > h1').innerHTML,
                        description: document.querySelector('#main > article > div > div > div:nth-child(1)').innerHTML.replace(/(\r\n|\n|\r)/gm, ''),
                        url: document.querySelector('#main > article > div > div > div:nth-child(2) > a').getAttribute('href')
                    };
                }
            }, function(result) {
                console.log(result);
                var def = Q.defer();
                if (result.title) {
                    tools.push(result);
                    def.resolve(result);
                    promisesArr.push(def.promise);
                }
                else {
                    _.each(result, function(endpoint) {
                        getToolData(baseUrl + endpoint);
                    });
                }
            });
        });
    });
    //});
    Q.all(promisesArr).then(function() {
        ph.exit();
    });

});
