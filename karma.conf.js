/**
 * Karma Configuration
 * @author Michael McDermott
 * Created on 5/12/15.
 */

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/karma-sinon-chai/chai-adapter.js',
      'node_modules/sinon-chai/lib/sinon-chai.js',
      'vendor/angular/angular.js',
      'vendor/angular-mocks/angular-mocks.js',
      'vendor/jquery/dist/jquery.js',
      'vendor/**/*min.js',
      'vendor/angular-rangeslider/angular.rangeSlider.js',
      'vendor/ng-lodash/build/ng-lodash.js',
      // Load sourcemaps but don't include them --> leads to PhantomJS errors
      {
        pattern: '**/*.map',
        included: false
      },
      'app/public/{*.js,**/*.js}',
      'test/**/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
      // Prevent some libraries from loading twice
      'app/public/vendor/angular/angular.min.js',
      'app/public/vendor/jquery/dist/jquery.min.js'
    ],


    // pre-process matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // Cover all files except public/vendor
      '**/*.js': ['sourcemap'],
      'public/{*.js,!(vendor)/**/*.js}': ['coverage']
    },

    // reporter options
    coverageReporter: {
      type: 'text-summary',
      dir: 'coverage/'
    },

    mochaReporter: {
      output: 'autowatch'
    },

    // log to console
    client: {
      captureConsole: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [ /*'Chrome',*/ 'PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
