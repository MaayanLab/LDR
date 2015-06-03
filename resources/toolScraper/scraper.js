/**
 * @author Michael McDermott
 * Created on 6/3/15.
 */

var phantom = require('phantom');

var getUrl = function() {
};

var getData = function() {
};

phantom.create(function(ph) {
    var baseUrl = 'http://www.omictools.com';
    var tools = [];


    var getToolData = function(url) {
        ph.createPage(function(page) {
            page.open(url, function(status) {
                console.log('Opening ' + url + ' was a ' + status);
                var result = page.evaluate(function() {
                    if (document.querySelector('li.maincat a')) {
                        return document.querySelectorAll('#main > div > nav > ul > li > a');
                    }
                    else if (document.querySelector('h3 a')) {
                        return document.querySelector('h3 a').getAttribute('href');
                    }
                    else {
                        return {
                            title: document.querySelector('header.header1.navbar h1').innerHTML,
                            description: document.querySelector('div.site-details div.mg-s').innerHTML.replace(/(\r\n|\n|\r)/gm, ""),
                            pubMedUrl: document.querySelector('td.infos_details a').getAttribute('href'),
                            toolUrl: document.querySelector('div.site-details div.mg-s a').getAttribute('href')
                        };
                    }
                });

                if (result && !result.title) {
                    console.log(result);
                    //return getToolData(baseUrl + result);
                }
                else {
                    tools.push(result);
                    console.log(tools);
                }
                ph.exit();
            });
        });
    };

    var checkUrl = function(url) {

    };

    getToolData(baseUrl);
});

