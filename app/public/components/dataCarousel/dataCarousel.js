(function() {
  'use strict';

  angular
    .module('ldr.carousel', [
      'slickCarousel',
      'ui-rangeSlider'
    ])
    .filter('monthName', monthName)
    .directive('ldrCarousel', ldrCarousel);


  function monthName() {
    return function(monthNumber) {
      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      if (monthNumber < 12) {
        return monthNames[monthNumber] + ' 2015';
      } else {
        return monthNames[monthNumber - 12] + ' 2016';
      }
    };
  }

  function ldrCarousel($timeout, lodash) {
    return {
      restrict: 'E',
      scope: {
        resultPromise: '='
      },
      templateUrl: 'partials/dataCarousel.html',
      link: ldrCarouselLink,
    };

    /////////////////////////////////////////

    /* @ngInject */
    function ldrCarouselLink(scope) {

      scope.initCarousel = initCarousel;
      scope.carouselData = {};
      scope.slider = {
        disabled: false,
        handleUp: function() {
          scope.loaded = false;
          rebuildCarousel();
          $timeout(function() {
            scope.loaded = true;
          }, 1500);
          scope.$apply();
        },
        handleDown: function() {
          scope.loaded = false;
        },
        min: 0,
        max: 23,
        rangeMin: 0,
        rangeMax: 23
      };

      // Need this to maintain proper order on homepage
      scope.centerOrder = [
        'Broad-LINCS-Transcriptomics',
        'HMS-LINCS',
        'NeuroLINCS',
        'MEP-LINCS',
        'Broad-LINCS-PCCSE',
        'DTOXS'
      ];

      // Key-name: Center-declared Acronym
      scope.centerMap = {
        'Broad-LINCS-Transcriptomics': 'BroadT LINCS',
        'HMS-LINCS': 'HMS LINCS',
        'NeuroLINCS': 'NeuroLINCS',
        'MEP-LINCS': 'MEP LINCS',
        'Broad-LINCS-PCCSE': 'PCCSE',
        'DTOXS': 'DToxS'
      };

      function strToDates(strObj) {
        var dates = {};
        angular.forEach(strObj, function(str, key) {
          dates[key] = new Date(str);
        });
        return dates;
      }

      function rebuildCarousel() {
        angular.forEach(scope.carouselData, function(obj, groupName) {
          obj.slides = [];
          angular.forEach(obj.releasesArr, function(release) {
            var currMonth = release.releaseDates.upcoming.getMonth();
            var currYear = release.releaseDates.upcoming.getFullYear();
            var filterIndex = (currYear === 2016) ? currMonth + 12 :
              (currYear === 2015) ? currMonth : -1;
            if (filterIndex > scope.slider.min && filterIndex < scope.slider.max) {
              obj.slides.push(release);
            }
            var breakpoints = [{
              breakpoint: 1200,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }];
            var slideCount = obj.slides.length;
            var centerMode = (slideCount > 5);
            var slidesToShow = centerMode ? 5 : slideCount;
            obj.slick.centerMode = centerMode;
            obj.slick.slidesToShow = slidesToShow;
            obj.slick.slidesToScroll = 1;
            obj.slick.responsive = slideCount > 1 ? breakpoints : [];
          });
        });
      }

      function initCarousel() {
        scope.loaded = false;
        scope.resultPromise
          .success(function(releaseArray) {
            angular.forEach(releaseArray, function(release) {
              // Convert strings to actual date objects
              release.releaseDates = strToDates(release.releaseDates);
              var key = release.group.name;
              if (lodash.has(scope.carouselData, release.group.name)) {
                scope.carouselData[key].releasesArr.push(release);
                scope.carouselData[key].slides.push(release);
                var rCount = scope.carouselData[key].releasesArr.length;

                var breakpoints = [{
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                }];
                var centerMode = (rCount > 5);
                var slidesToShow = centerMode ? 5 : rCount;
                scope.carouselData[key].slick.centerMode = centerMode;
                scope.carouselData[key].slick.slidesToShow = slidesToShow;
                scope.carouselData[key].slick.slidesToScroll = 1;
                scope.carouselData[key].slick.responsive = rCount > 1 ? breakpoints : [];
              } else {
                scope.carouselData[key] = {
                  slick: {
                    dots: false,
                    arrows: true,
                    responsive: [],
                    centerMode: false,
                    slidesToScroll: 1,
                    slidesToShow: 1,
                    event: {}
                  },
                  slides: [release],
                  releasesArr: [release]
                };
              }
            });
            $timeout(function() {
              scope.loaded = true;
            }, 1500);
          });
      }

      initCarousel();
    }
  }
})();
