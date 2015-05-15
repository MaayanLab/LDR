var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    less = require('gulp-less'),
    
    STYLE_SRC = 'public/style/';

gulp.task('less', function() {
    gulp.src(STYLE_SRC + 'less/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(STYLE_SRC + 'css'));
});

gulp.task('watch', function() {
    gulp.watch(STYLE_SRC + 'less/*.less', ['less']); 
});

gulp.task('default', ['watch']);
