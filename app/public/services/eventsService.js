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
      getNextFourEvents: getNextFourEvents,
      getHomeEvents: getHomeEvents
    };

    //////////////

    function getAllEvents() {
      return api('events/').get();
    }

    function getNextFourEvents() {
      return api('events/upcoming').get();
    }

    function getHomeEvents() {
      return api('events/home').get();
    }

  }
})();
