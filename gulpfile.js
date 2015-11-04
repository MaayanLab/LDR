/*
 * Gulpfile
 * @author Michael McDermott
 * Created on 5/12/15.
 */

'use strict';

var gulp = require('gulp');
var path = require('path');
var runSequence = require('run-sequence');
var del = require('del');
var karma = require('karma').server;
var minifyCss = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var $ = require('gulp-load-plugins')();
var argv = require('minimist')(process.argv.slice(2));

var SERVER_DIRECTORY = 'app/backend/';
var SRC_DIRECTORY = 'app/public/';
var BUILD_DIRECTORY = 'dist/';

var mainBowerFiles = require('main-bower-files');
var BOWER_DIRECTORY = 'vendor/';
var BOWER_JSON_DIRECTORY = './bower.json';
var BOWER_RC_DIRECTORY = './.bowerrc';

var src = {};
var browserSync;

// Clean output directory
gulp.task('clean', del.bind(
  null, ['.tmp', BUILD_DIRECTORY + '*', SRC_DIRECTORY +
    'style/_vendor.scss'
  ], {
    dot: true
  }
));

gulp.task('html', function() {
  gulp.src(SRC_DIRECTORY + 'index.html')
    .pipe(gulp.dest(BUILD_DIRECTORY));
  return gulp.src(SRC_DIRECTORY + 'components/**/*.html')
    .pipe($.plumber())
    .pipe($.flatten())
    .pipe(gulp.dest(BUILD_DIRECTORY + 'partials/'));
});

gulp.task('favIcons', function() {
  return gulp.src(SRC_DIRECTORY + 'images/favicons/*.*')
    .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('fonts', function() {
  gulp.src(BOWER_DIRECTORY + '**/{bootstrap,font-awesome}/**/*.{svg,ttf,woff,woff2}')
    .pipe($.plumber())
    .pipe($.changed(BUILD_DIRECTORY + 'fonts/'))
    .pipe($.flatten())
    .pipe(gulp.dest(BUILD_DIRECTORY + 'fonts/'));
  return gulp.src(BOWER_DIRECTORY + '**/slick/**/*.{svg,ttf,woff,woff2}')
    .pipe($.plumber())
    .pipe($.changed(BUILD_DIRECTORY + 'style/fonts/'))
    .pipe($.flatten())
    .pipe(gulp.dest(BUILD_DIRECTORY + 'style/fonts/'));
});

gulp.task('images', function() {
  gulp.src(BOWER_DIRECTORY + 'slick-carousel/**/*.gif')
    .pipe($.flatten())
    .pipe(gulp.dest(BUILD_DIRECTORY + 'style/'));
  return gulp.src([
    SRC_DIRECTORY + 'images/**/*.{jpg,jpeg,png,gif,ico,svg}',
    '!' + SRC_DIRECTORY + 'images/favicons/**',
    '!' + SRC_DIRECTORY + 'images/favicons'
  ])
    .pipe($.plumber())
    .pipe($.changed(BUILD_DIRECTORY + 'images/'))
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe($.size({ title: 'images' }))
    .pipe(gulp.dest(BUILD_DIRECTORY + 'images/'));
});

gulp.task('serverJs', function() {
  gulp.src(SERVER_DIRECTORY + '**/*')
    .pipe($.changed(BUILD_DIRECTORY))
    .pipe(gulp.dest(BUILD_DIRECTORY + 'backend/'));
  return gulp.src('server.js')
    .pipe($.changed(BUILD_DIRECTORY))
    .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('js', function() {
  var jsChain = gulp.src([
    SRC_DIRECTORY + '**/*.js',
    '!' + SRC_DIRECTORY + 'vendor/**'
  ])
    .pipe($.plumber());
  if (!argv.production) {
    jsChain = jsChain
      .pipe($.sourcemaps.init())
      .pipe($.concat('bundle.min.js', { newLine: ';' }))
      .pipe(ngAnnotate({ add: true }))
      .pipe($.uglify({ mangle: true }))
      .pipe($.sourcemaps.write());
  } else {
    jsChain = jsChain
      .pipe($.concat('bundle.min.js', { newLine: ';' }))
      .pipe(ngAnnotate({ add: true }))
      .pipe($.uglify({ mangle: true }));
  }
  jsChain = jsChain.pipe(gulp.dest(BUILD_DIRECTORY));
  return jsChain;
});

gulp.task('karma', function(callback) {
  return karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, callback);
});

gulp.task('jshint', function() {
  return gulp.src([SRC_DIRECTORY + '**/*.js', '!' + SRC_DIRECTORY +
      'vendor/**'
    ])
    .pipe($.plumber())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('vendorJs', function() {
  var jsFilter = $.filter('**/*.js');

  gulp.src([
    BOWER_DIRECTORY + 'jquery/dist/jquery.min.js',
    BOWER_DIRECTORY + 'jquery/dist/jquery.min.map',
    BOWER_DIRECTORY + 'angular/angular.js',
    BOWER_DIRECTORY + 'angular/angular.min.js.map'
  ])
    .pipe(gulp.dest(BUILD_DIRECTORY));

  return gulp.src(mainBowerFiles({
    paths: {
      bowerDirectory: BOWER_DIRECTORY,
      bowerrc: BOWER_RC_DIRECTORY,
      bowerJson: BOWER_JSON_DIRECTORY
    }
  }))
    .pipe($.plumber())
    .pipe(jsFilter)
    .pipe($.concat('vendor.js'))
    .pipe($.size({
      title: 'vendor.js'
    }))
    .pipe(gulp.dest(BUILD_DIRECTORY))
    .pipe(jsFilter.restore());
});

gulp.task('vendorCss', function(callback) {
  var cssFilter = $.filter('**/*.css');
  var cssChain =  gulp.src(mainBowerFiles({
    paths: {
      bowerDirectory: BOWER_DIRECTORY,
      bowerrc: BOWER_RC_DIRECTORY,
      bowerJson: BOWER_JSON_DIRECTORY
    }
  }))
    .pipe(cssFilter);
  if (!argv.production) {
    cssChain = cssChain
      .pipe($.sourcemaps.init())
      .pipe(minifyCss())
      .pipe($.concat('_vendor.scss'))
      .pipe($.sourcemaps.write());
  } else {
    cssChain = cssChain
      .pipe(minifyCss())
      .pipe($.concat('_vendor.scss'));
  }
  cssChain = cssChain
    .pipe($.size({
      title: '_vendor.scss'
    }))
    .pipe(gulp.dest(SRC_DIRECTORY + 'style/'));
  return cssChain;
});

gulp.task('scss', ['vendorCss'], function() {
  var scssChain = gulp.src(SRC_DIRECTORY + 'style/main.scss')
    .pipe($.plumber())
  if (!argv.production) {
    scssChain = scssChain
      .pipe($.sourcemaps.init())
      .pipe($.sass().on('error', $.sass.logError))
      .pipe($.autoprefixer())
      .pipe(minifyCss())
      .pipe($.sourcemaps.write());
  } else {
    scssChain = scssChain
      .pipe($.sass())
      .pipe($.autoprefixer())
      .pipe(minifyCss());
  }
  scssChain = scssChain
    .pipe($.concat('bundle.min.css'))
    .pipe(gulp.dest(BUILD_DIRECTORY + 'style/'));
  return scssChain;
});

gulp.task('build', ['clean'], function(callback) {
  runSequence(['vendorJs', 'vendorCss', 'fonts', 'images', 'favIcons', 'html',
    'scss', 'js', 'serverJs'
  ], callback);
});

gulp.task('build:watch', function(callback) {
  runSequence('build', function() {
    gulp.watch(SRC_DIRECTORY + '**/*.js', ['js']);
    gulp.watch(SERVER_DIRECTORY + '**/*.js', ['serverJs']);
    gulp.watch('./server.js', ['serverJs']);
    gulp.watch(SRC_DIRECTORY + '**/*.scss', ['scss']);
    gulp.watch(SRC_DIRECTORY + '**/*.html', ['html']);
    callback();
  });
});

// Run node
gulp.task('serve', ['build:watch'], function(cb) {
  src.server = [
    BUILD_DIRECTORY + 'server.js',
    BUILD_DIRECTORY + 'backend/**/*',
    '!' + BUILD_DIRECTORY + 'backend/**/uploads/**'
  ];

  var started = false;
  var cp = require('child_process');
  var assign = require('object-assign');

  var server = (function startup() {
    var child = cp.fork(BUILD_DIRECTORY + 'server.js', {
      env: assign({
        NODE_ENV: 'development'
      }, process.env)
    });
    child.once('message', function(message) {
      if (message.match(/^online$/)) {
        if (browserSync) {
          browserSync.reload();
        }
        if (!started) {
          started = true;
          gulp.watch(src.server, function() {
            $.util.log('Restarting development server.');
            server.kill('SIGTERM');
            server = startup();
          });
          cb();
        }
      }
    });
    return child;
  })();

  process.on('exit', function() {
    server.kill('SIGTERM');
  });
});

// Launch BrowserSync server
gulp.task('sync', ['serve'], function(cb) {
  browserSync = require('browser-sync');

  browserSync({
    browser: 'Google Chrome Canary',
    https: false,
    logPrefix: 'LDR',
    notify: true,
    proxy: 'localhost:3001/LDR/'
  }, cb);

  process.on('exit', function() {
    browserSync.exit();
  });

  gulp.watch([BUILD_DIRECTORY + '**/*.*'].concat(
    src.server.map(function(file) {
      return '!' + file;
    })
  ), function(file) {
    browserSync.reload(path.relative(__dirname, file.path));
  });
});

gulp.task('default', ['sync']);
