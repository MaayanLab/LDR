var gulp = require('gulp');
var path = require('path');
var runSequence = require('run-sequence');
var del = require('del');
var minifyCss = require('gulp-minify-css');
var $ = require('gulp-load-plugins')();

var SRC_DIRECTORY = 'public/';
var BUILD_DIRECTORY = 'dist/';

var mainBowerFiles = require('main-bower-files');
var BOWER_DIRECTORY = SRC_DIRECTORY + 'vendor/';
var BOWER_JSON_DIRECTORY = './bower.json';
var BOWER_RC_DIRECTORY = './.bowerrc';

var jsFilter = $.filter('**/*.js');
var cssFilter = $.filter('**/*.css');
var htmlFilter = $.filter('**/*.html');
var fontFilter = $.filter('**/*.{svg,ttf,woff,woff2}');

gulp.task('build-clean', function () {
    return del([BUILD_DIRECTORY + '*'], function (err, deletedFiles) {
        if (err) {
            console.log(err);
        }
        console.log('Files deleted:', deletedFiles.join(', '));
    });
});

gulp.task('html', function () {
    return gulp.src(SRC_DIRECTORY + '**/*')
        .pipe(htmlFilter)
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('copyFavIconInfo', function () {
    return gulp.src(SRC_DIRECTORY + '/images/**/*.{xml,json}')
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('fonts', function () {
    return gulp.src(SRC_DIRECTORY + '**/*')
        .pipe(fontFilter)
        .pipe($.flatten())
        .pipe(gulp.dest(BUILD_DIRECTORY + 'fonts/'));
});

gulp.task('images', function () {
    return gulp.src(SRC_DIRECTORY + '/images/**/*.{jpg,jpeg,png,gif,ico}')
        .pipe($.imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
        .pipe(gulp.dest(BUILD_DIRECTORY))
        .pipe($.size());
});

gulp.task('js', function () {

    return gulp.src([SRC_DIRECTORY + '**/*.js', '!' + SRC_DIRECTORY + 'vendor/**'])
        .pipe($.concat('bundle.js'))
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('css', function () {

    return gulp.src(SRC_DIRECTORY + 'css/index.css')
        .pipe($.order([
            SRC_DIRECTORY + 'css/index.css'
        ]))
        //.pipe($.concat('bundle.css'))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.init())
        .pipe(minifyCss())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(BUILD_DIRECTORY))
});

gulp.task('watch', function () {
    return gulp.watch(SRC_DIRECTORY + 'index.html', ['copyIndex']);
});

gulp.task('jshint', function () {
    return gulp.src([SRC_DIRECTORY + '**/*.js', '!' + SRC_DIRECTORY + 'vendor/**'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

// this tells gulp to combine my Angular dependencies and to output the vendor.js file into the dist/ folder
gulp.task('vendor', function () {
    return gulp.src(mainBowerFiles({
        paths: {
            bowerDirectory: BOWER_DIRECTORY,
            bowerrc: BOWER_RC_DIRECTORY,
            bowerJson: BOWER_JSON_DIRECTORY
        }
    }))
        .pipe(jsFilter)
        .pipe($.concat('vendor.js'))
        .pipe($.size())
        .pipe(gulp.dest(BUILD_DIRECTORY))
        .pipe(jsFilter.restore())

        .pipe(cssFilter)
        .pipe($.concat('vendor.css'))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.init())
        .pipe(minifyCss())
        .pipe($.sourcemaps.write())
        .pipe($.size())
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('buildWithoutLint', function (callback) {
    runSequence('build-clean', ['vendor', 'html', 'css', 'js', 'fonts', 'images', 'copyFavIconInfo'],
        'nodemon', 'watch', callback)
});

gulp.task('buildWithLint', function (callback) {
    runSequence('build-clean', ['vendor', 'html', 'css', 'js', 'fonts', 'images', 'copyFavIconInfo'],
        'jshint', 'nodemon', 'watch', callback)
});

gulp.task('nodemon', function () {
    $.nodemon({
        script: 'server.js',
        ext: 'js html',
        env: {'NODE_ENV': 'development'},
        ignore: ['*.*'],
        tasks: ['build']
    })
});

gulp.task('default', ['buildWithLint']);