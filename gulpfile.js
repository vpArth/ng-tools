var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var del = require('del');
var path = require('path');

var JS = '**/*.js';
var SRC = 'src/';
var DEST = 'dist/';

gulp.task('dist.min', ['dist'], function() {
    return gulp.src(SRC+JS)
        .pipe(jshint({laxcomma: true}))
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(gulp.dest(DEST))
        .pipe(concat('arth.min.js'))
        .pipe(gulp.dest(DEST))
        ;
});

gulp.task('dist', function () {
    return gulp.src(SRC+JS)
        .pipe(jshint({laxcomma: true}))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(DEST))
        .pipe(concat('arth.js'))
        .pipe(gulp.dest(DEST))
});

gulp.task('clean', function () {
  return del.sync(DEST);
});

gulp.task('build', ['clean', 'dist.min']);

gulp.task('watch', function(){
    gulp.watch([SRC+JS], ['build']);
});

gulp.task('default', ['watch', 'build']);
