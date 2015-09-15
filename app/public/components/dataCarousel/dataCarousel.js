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

    ///////////////////

    /* @ngInject */
    function LDRCarouselController(lodash) {

      var vm = this;
      // Need this to maintain proper order on homepage
      var centerOrder = [
        'Broad-LINCS-Transcriptomics',
        'HMS-LINCS',
        'NeuroLINCS',
        'MEP-LINCS',
        'Broad-LINCS-PCCSE',
        'DTOXS'
      ];

      function buildCarousel() {
        vm.resultPromise
          .success(function(releaseArray) {
            vm.carouselData = {};
            vm.carouselData.centerOrder = centerOrder;
            angular.forEach(releaseArray, function(release) {
              if (lodash.has(vm.carouselData, release.group.name)) {
                var key = release.group.name;
                vm.carouselData[key].releasesArr.push(release);
                var rCount = vm.carouselData[key].releasesArr.length;
                var centerMode = !!(rCount > 3);
                var breakpoints = [];
                var lgBreakpoint = {
                  breakpoint: 1100,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                };
                if (!!(rCount > 1)) {
                  breakpoints.push(lgBreakpoint);
                }
                var slidesToShow = centerMode ? 3 : rCount;
                vm.carouselData[key].centerMode = centerMode;
                vm.carouselData[key].breakpoints = breakpoints;
                vm.carouselData[key].slidesToShow = slidesToShow;
                vm.carouselData[key].slidesToScroll = slidesToShow;
              } else {
                vm.carouselData[release.group.name] = {
                  breakpoints: [],
                  centerMode: false,
                  slidesToShow: 0,
                  slidesToScroll: 0,
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