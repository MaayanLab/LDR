/**
 * @author Michael McDermott
 * Created on 8/19/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .factory('wordpress', wordpress);

  /* @ngInject */
  function wordpress($http) {
    return {
      get: {
        allPages: allPages,
        pageFromId: pageFromId,
        pageFromSlug: pageFromSlug
      }
    };

    //////////////

    function allPages() {
      return $http
        .get('http://www.lincsproject.org/wp-json/wp/v2/pages?filter[posts_per_page]=100000');
    }

    function pageFromId(id) {
      return $http
        .get('http://www.lincsproject.org/wp-json/wp/v2/pages/' + id.toString());
    }

    function pageFromSlug(slug) {
      return $http
        .get('http://www.lincsproject.org/wp-json/wp/v2/pages?filter[name]=' + slug.toString());
    }

  }
})();
