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

  function ldrCarousel() {
    return {
      bindToController: true,
      controller: LDRCarouselController,
      controllerAs: 'vm',
      restrict: 'E',
      scope: {
        resultPromise: '='
      },
      templateUrl: 'partials/dataCarousel.html'
    };

    /////////////////////////////////////////

    /* @ngInject */
    function LDRCarouselController($scope, $timeout, lodash) {

      var vm = this;
      vm.initCarousel = initCarousel;
      vm.carouselData = {};
      vm.slider = {
        disabled: false,
        handleUp: function() {
          vm.loaded = false;
          rebuildCarousel();
          vm.loaded = true;
          $scope.$apply();
        },
        handleDown: function() {
          vm.loaded = false;
        },
        min: 0,
        max: 23,
        rangeMin: 0,
        rangeMax: 23
      };

      // Need this to maintain proper order on homepage
      vm.centerOrder = [
        'Broad-LINCS-Transcriptomics',
        'HMS-LINCS',
        'NeuroLINCS',
        // 'MEP-LINCS',
        'Broad-LINCS-PCCSE',
        'DTOXS'
      ];

      // Key-name: Center-declared Acronym
      vm.centerMap = {
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

      function rebuildCarousel(callback) {
        angular.forEach(vm.carouselData, function(obj, groupName) {
          obj.slides = [];
          angular.forEach(obj.releasesArr, function(release) {
            var rCount = obj.releasesArr.length;
            var currMonth = release.releaseDates.upcoming.getMonth();
            var currYear = release.releaseDates.upcoming.getFullYear();
            var filterIndex = (currYear === 2016) ? currMonth + 12 :
              (currYear === 2015) ? currMonth : -1;
            if (filterIndex < vm.slider.min || filterIndex > vm.slider.max) {
              release.hideInSlides = true;
              rCount--;
            } else {
              obj.slides.push(release);
            }
            var breakpoints = [{
              breakpoint: 1200,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }];

            var centerMode = !!(rCount > 4);
            var slidesToShow = centerMode ? 5 : rCount;
            obj.slick.centerMode = centerMode;
            obj.slick.slidesToShow = slidesToShow;
            obj.slick.slidesToScroll = slidesToShow;
            obj.slick.responsive = rCount > 1 ? breakpoints : [];
          });
        });
      }

      function initCarousel() {
        vm.loaded = true;
        vm.resultPromise
          .success(function(releaseArray) {
            angular.forEach(releaseArray, function(release) {
              if (!release.released) {
                return;
              }
              // Convert strings to actual date objects
              release.releaseDates = strToDates(release.releaseDates);
              var key = release.group.name;
              if (lodash.has(vm.carouselData, release.group.name)) {
                vm.carouselData[key].releasesArr.push(release);
                vm.carouselData[key].slides.push(release);
                var rCount = vm.carouselData[key].releasesArr.length;

                var breakpoints = [{
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                }];
                var centerMode = !!(rCount > 4);
                var slidesToShow = centerMode ? 5 : rCount;
                vm.carouselData[key].slick.centerMode = centerMode;
                vm.carouselData[key].slick.slidesToShow = slidesToShow;
                vm.carouselData[key].slick.slidesToScroll = slidesToShow;
                vm.carouselData[key].slick.responsive = rCount > 1 ? breakpoints : [];
              } else {
                vm.carouselData[key] = {
                  slick: {
                    dots: true,
                    arrows: true,
                    responsive: [],
                    centerMode: true,
                    slidesToScroll: 1,
                    slidesToShow: 1,
                  },
                  slides: [release],
                  releasesArr: [release]
                };
              }
            });
          });
      }

      initCarousel();
    }
  }
})();
