var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');
var del = require('del');
var path = require('path');

var paths = {
    src: ['src/**/*.js', 'src/**/*.html'],
    test: ['tests/**/*.js'],
    dest: 'dist/'
};

var JS = '**/*.js';
var SRC = 'src/';
var DEST = 'dist/';

gulp.task('dist.min', ['dist'], function() {
    return gulp.src(paths.src)
        .pipe(jshint({laxcomma: true}))
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dest))
        .pipe(concat('arth.min.js'))
        .pipe(gulp.dest(paths.dest))
        ;
});

gulp.task('dist', function () {
    return gulp.src(paths.src)
        .pipe(jshint({laxcomma: true}))
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(paths.dest))
        .pipe(concat('arth.js'))
        .pipe(gulp.dest(paths.dest))
});

gulp.task('clean', function () {
  return del.sync(paths.dest);
});

gulp.task('build', ['unit-test', 'clean', 'dist.min']);

gulp.task('test', ['unit-test', 'e2e-test']);
gulp.task('unit-test', shell.task('npm test', {
    ignoreErrors: true
}));
gulp.task('e2e-test',  shell.task(
    'npm run-script e2e-test && notify-send "Ng-tools: E2E Tests - SUCCESS" || notify-send "Ng-tools: E2E Tests - FAIL"', {
    ignoreErrors: true
}));

gulp.task('watch', ['build'], function(){
    gulp.watch([paths.src], ['build']);
    gulp.watch([paths.test], ['unit-test']);
});

gulp.task('default', ['build', 'watch']);
