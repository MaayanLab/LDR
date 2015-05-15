var gulp = require('gulp');
var path = require('path');
var runSequence = require('run-sequence');
var del = require('del');
var karma = require('karma').server;
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

gulp.task('clean', function() {
    return del([BUILD_DIRECTORY + '*'], function(err, deletedFiles) {
        if (err) {
            console.log(err);
        }
        console.log('Files deleted:', deletedFiles.join(', '));
    });
});

gulp.task('html', function() {
    return gulp.src(SRC_DIRECTORY + '**/*')
        .pipe($.plumber())
        .pipe(htmlFilter)
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('copyFavIconInfo', function() {
    return gulp.src(SRC_DIRECTORY + '/images/**/*.{xml,json}')
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('fonts', function() {
    return gulp.src(SRC_DIRECTORY + '**/*')
        .pipe($.plumber())
        .pipe(fontFilter)
        .pipe($.flatten())
        .pipe(gulp.dest(BUILD_DIRECTORY + 'fonts/'));
});

gulp.task('images', function() {
    return gulp.src(SRC_DIRECTORY + '/images/**/*.{jpg,jpeg,png,gif,ico}')
        .pipe($.plumber())
        .pipe($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest(BUILD_DIRECTORY))
        .pipe($.size());
});

gulp.task('js', function() {
    return gulp.src([SRC_DIRECTORY + '**/*.js', '!' + SRC_DIRECTORY + 'vendor/**'])
        .pipe($.plumber())
        .pipe($.concat('bundle.js'))
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('less', function() {
    return gulp.src(SRC_DIRECTORY + 'style/less/main.less')
        .pipe($.plumber())
        .pipe($.order([
            SRC_DIRECTORY + 'style/less/main.less'
        ]))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe(minifyCss())
        .pipe($.sourcemaps.write())
        .pipe($.concat('bundle.min.css'))
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('karma', function(callback) {
    return karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, callback);
});

gulp.task('jshint', function() {
    return gulp.src([SRC_DIRECTORY + '**/*.js', '!' + SRC_DIRECTORY + 'vendor/**'])
        .pipe($.plumber())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('vendor', function() {
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
        .pipe($.size())
        .pipe(gulp.dest(BUILD_DIRECTORY))
        .pipe(jsFilter.restore())

        .pipe(cssFilter)
        .pipe($.concat('vendor.min.css'))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.init())
        .pipe(minifyCss())
        .pipe($.sourcemaps.write())
        .pipe($.size())
        .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('build:dev', function(callback) {
    runSequence('clean', 'vendor', 'html', 'less', 'js', 'fonts',
        'images', 'copyFavIconInfo', 'node:dev', callback)
});

gulp.task('build:prod', function(callback) {
    runSequence('clean', 'vendor', 'html', 'less', 'js', 'fonts',
        'images', 'copyFavIconInfo', 'jshint', 'node:prod', 'karma', callback)
});

gulp.task('node:dev', function() {
    $.nodemon({
        script: 'server.js',
        ext: 'js less html',
        env: { 'NODE_ENV': 'development' },
        ignore: ['node_modules', 'public/vendor', 'dist', '.git', '.idea', '.DS_Store', '.bowerrc', 'gulpfile.js'],
        tasks: function(changedFiles) {
            var tasks = [];
            changedFiles.forEach(function(file) {
                if (path.extname(file) === '.js' && !~tasks.indexOf('js')) tasks.push('js');
                if (path.extname(file) === '.less' && !~tasks.indexOf('less')) tasks.push('less');
                if (path.extname(file) === '.html' && !~tasks.indexOf('html')) tasks.push('html');
            });
            return tasks
        }
    })
});

gulp.task('default', ['build:dev']);