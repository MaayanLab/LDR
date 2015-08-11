/**
 * @author Michael McDermott
 * Created on 7/29/15.
 */

'use strict';

var _ = require('lodash'),
  Models = require('../models'),
  Workshop = Models.Workshop,
  Webinar = Models.Webinar,
  Course = Models.Course,
  FundingOpp = Models.FundingOpp,
  baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {

  // Async function for getting event information
  // Provide Model, options (date, upcoming, past, and lean), and a cb function
  var getEvent = function(mongooseModel, options, callback) {
    var opts, cb, chain, today;
    today = new Date();

    if (_.isFunction(options) && _.isUndefined(callback)) {
      cb = options;
      opts = {};
    } else if (_.isFunction(callback) && _.isObject(options)) {
      opts = options;
      cb = callback;
    } else {
      throw new Error('Options and Callback are not properly formatted');
    }

    if (mongooseModel && opts.home) {
      chain = mongooseModel.find({showAtHome: true});
    } else if (mongooseModel) {
      chain = mongooseModel.find({});
    }
    if (opts.date) {
      chain = chain.sort({date: 1});
    }
    if (opts.upcoming) {
      chain = chain.where('date').gte(today);
    } else if (opts.past) {
      chain = chain.where('date').lte(today);
    }
    if (opts.lean) {
      chain = chain.lean();
    }

    chain
      .exec(function(err, data) {
        if (err) {
          console.log(err);
          cb(err, null);
        } else {
          cb(null, data);
        }
      }
    );
  };

  // Get all events, all upcoming events, or all past events
  app.get(baseUrl +
    '/api/events/:eventType(events|webinars|workshops|fundingOpps|courses)?/:eventOpts(upcoming|past|home)?',
    function(req, res) {
      var eventType = req.params.eventType;
      var eventOpts = req.params.eventOpts;
      var allEvents = [];
      var numEvents = _.isUndefined(eventType) ? 4 : 1;
      var numFinished = 0;
      var options = {
        lean: true
      };

      if (eventOpts === 'upcoming') {
        options.upcoming = true;
      } else if (eventOpts === 'past') {
        options.past = true;
      } else if (eventOpts === 'home') {
        options.home = true;
      }

      function callback(err, data) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting events');
        } else {
          allEvents = _.union(allEvents, data);
          // Sort events by date with closest date first
          allEvents.sort(function(eventOne, eventTwo) {
            return eventOne.date.getTime() - eventTwo.date.getTime();
          });
          // ASYNC functions. Increment number finished and only send
          // results when all have finished.
          numFinished++;
          if (numFinished === numEvents) {
            res.status(200).send(allEvents);
          }
        }
      }

      if (eventType === 'webinars') {
        getEvent(Webinar, options, callback);
      } else if (eventType === 'workshops') {
        getEvent(Workshop, options, callback);
      } else if (eventType === 'courses') {
        getEvent(Course, options, callback);
      } else if (eventType === 'fundingOpps') {
        getEvent(FundingOpp, options, callback);
      } else {
        getEvent(Workshop, options, callback);
        getEvent(Webinar, options, callback);
        getEvent(Course, options, callback);
        getEvent(FundingOpp, options, callback);
      }

    }
  );
};
