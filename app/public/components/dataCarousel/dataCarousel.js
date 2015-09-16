(function() {
  'use strict';

  angular
    .module('ldr.carousel', [
      'slick',
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
    function LDRCarouselController($scope, lodash) {

      var vm = this;
      vm.initCarousel = initCarousel;
      vm.carouselData = {};
      vm.slider = {
        disabled: false,
        handleChange: function() {
          rebuildCarousel();
          $scope.$apply();
        },
        min: 0,
        max: 23,
        rangeMin: 0,
        rangeMax: 23
      };

      // Need this to maintain proper order on homepage
      var centerOrder = [
        'Broad-LINCS-Transcriptomics',
        'HMS-LINCS',
        'NeuroLINCS',
        // 'MEP-LINCS',
        'Broad-LINCS-PCCSE',
        'DTOXS'
      ];

      // Key-name: Center-declared Acronym
      var centerMap = {
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
        vm.carouselData.doneLoading = false;
        angular.forEach(vm.carouselData, function(obj, groupName) {
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
              release.hideInSlides = false;
              console.log('Center: ' + groupName);
              console.log('Release Count: ' + rCount);
              console.log(release.datasetName);
              console.log('Filter Index: ' + filterIndex);
              console.log('Slider Min: ' + vm.slider.min);
              console.log('Slider Max: ' + vm.slider.max);
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
            obj.centerMode = centerMode;
            obj.slidesToShow = slidesToShow;
            obj.slidesToScroll = slidesToShow;
            obj.breakpoints = rCount > 1 ? breakpoints : [];
          });
        });
        vm.carouselData.doneLoading = true;
      }

      function initCarousel() {
        vm.carouselData.doneLoading = false;
        vm.resultPromise
          .success(function(releaseArray) {
            vm.carouselData.centerMap = centerMap;
            vm.carouselData.centerOrder = centerOrder;
            angular.forEach(releaseArray, function(release) {
              if (!release.released) {
                return;
              }
              // Convert strings to actual date objects
              release.releaseDates = strToDates(release.releaseDates);
              var key = release.group.name;
              if (lodash.has(vm.carouselData, release.group.name)) {
                vm.carouselData[key].releasesArr.push(release);
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
                vm.carouselData[key].centerMode = centerMode;
                vm.carouselData[key].slidesToShow = slidesToShow;
                vm.carouselData[key].slidesToScroll = slidesToShow;
                vm.carouselData[key].breakpoints = rCount > 1 ? breakpoints : [];
              } else {
                vm.carouselData[key] = {
                  breakpoints: [],
                  centerMode: false,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  releasesArr: [release]
                };
              }
            });
          });
        vm.carouselData.doneLoading = true;
      }

      initCarousel();
    }
  }
})();
