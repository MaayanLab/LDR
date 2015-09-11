/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .factory('events', events);

  /* @ngInject */
  function events(api) {
    return {
      getAllEvents: getAllEvents,
      getUpcomingEvents: getUpcomingEvents,
      getPastEvents: getPastEvents,
      getHomeEvents: getHomeEvents
    };

    //////////////

    function getAllEvents(eventType) {
      var endpoint = 'events/';
      if (eventType) {
        endpoint += eventType.toString() + '/';
      }
      return api(endpoint).get();
    }

    function getPastEvents(eventType) {
      var endpoint = 'past/';
      if (eventType) {
        endpoint = eventType.toString() + '/past/';
      }
      return api('events/' + endpoint).get();
    }

    function getUpcomingEvents(eventType) {
      var endpoint = 'upcoming/';
      if (eventType) {
        endpoint = eventType.toString() + '/upcoming/';
      }
      return api('events/' + endpoint).get();
    }

    function getHomeEvents() {
      return api('events/home').get();
    }

  }
})();
