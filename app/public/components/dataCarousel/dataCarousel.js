(function() {
  'use strict';

  angular
    .module('ldr')
    .directive('ldrCarousel', ldrCarousel);

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
    function LDRCarouselController(lodash) {

      var vm = this;

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

      function buildCarousel() {
        vm.resultPromise
          .success(function(releaseArray) {
            vm.carouselData = {};
            vm.carouselData.centerMap = centerMap;
            vm.carouselData.centerOrder = centerOrder;
            angular.forEach(releaseArray, function(release) {
              if (!release.released) {
                return;
              }
              if (lodash.has(vm.carouselData, release.group.name)) {
                var key = release.group.name;
                vm.carouselData[key].releasesArr.push(release);
                var rCount = vm.carouselData[key].releasesArr.length;
                var centerMode = !!(rCount > 4);
                var breakpoints = [];
                var lgBreakpoint = {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                };
                if (!!(rCount > 1)) {
                  breakpoints.push(lgBreakpoint);
                }
                var slidesToShow = centerMode ? 5 : rCount;
                vm.carouselData[key].centerMode = centerMode;
                vm.carouselData[key].breakpoints = breakpoints;
                vm.carouselData[key].slidesToShow = slidesToShow;
                vm.carouselData[key].slidesToScroll = slidesToShow;
              } else {
                vm.carouselData[release.group.name] = {
                  breakpoints: [],
                  centerMode: false,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  releasesArr: [release]
                };
              }
            });
          });
      }

      buildCarousel();
    }
  }
})();
