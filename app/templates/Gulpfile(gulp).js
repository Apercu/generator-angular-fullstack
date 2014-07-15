'use strict';

var gulp = require('gulp'),
  _g = require('gulp-load-plugins')();

var rimraf = require('rimraf');
var es = require('event-stream');

var yeoman = {
  client: require('./bower.json').appPath || 'client',
  dist: 'dist'
  },
  express = {
    options: {
      port: process.env.port || 9000
    }
  };

// Clean tasks
// Maybe we just want to clean content and not delete, will try
gulp.task('clean:dist', function (cb) {
  rimraf('./dist', cb);
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});

//Copy tasks
gulp.task('copy:dist', function () {
  var main = gulp.src([
    '*.{ico,png,txt}',
    'bower_components/**/*',
    'assets/images/{,*/}*.{webp}',
    'assets/fonts/**/*',
    '.htaccess',
    'index.html'
  ])
    .pipe(gulp.dest(yeoman.dist + '/public'));

  var extra = gulp.src(['package.json', 'server/**/*'])
    .pipe(gulp.dest(yeoman.dist));

  var images = gulp.src('generated/*')
    .pipe(gulp.dest(yeoman.dist + '/public/assets/images'));

  return es.merge(main, extra, images);
});

gulp.task('copy:styles', function () {
  return gulp.src('{app,components}/**/*.css')
    .pipe(gulp.dest(yeoman.client));
});
