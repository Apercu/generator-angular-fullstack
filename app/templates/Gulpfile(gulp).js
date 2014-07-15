'use strict';

var gulp = require('gulp'),
  _g = require('gulp-load-plugins')();

var rimraf = require('rimraf'),
  es = require('event-stream'),
  runSequence = require('run-sequence'),
  wiredep = require('wiredep');

var yeoman = {
  client: require('./bower.json').appPath || 'client',
  server: 'server',
  dist: 'dist'
  },
  paths = {
    client: {
      main: yeoman.client + '/index.html',
      views: yeoman.client + '/{app,components}/**/*.<% if(filters.jade) { %>jade<% } %><% else { %>html<% } %>',
      scripts: yeoman.client + '/{app,components}/**/*.<% if(filters.coffee) { %>coffee<% } %><% else { %>js<% } %>'
    },
    server: {
      scripts: [yeoman.server + '**/*.js', '!' + yeoman.server + '/**/*.spec.js'],
      tests: yeoman.server + '/**/*.spec.js'
    }
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

gulp.task('watch', function () {
  gulp.watch([
    yeoman.client + '/{app,components}/**/*.js',
    '!' + yeoman.client + '/{app,components}/**/*.spec.js',
    '!' + yeoman.client + '/{app,components}/**/*.mock.js',
    '!' + yeoman.client + '/app/app.js'
  ], ['injector:scripts']);

  gulp.watch([
    yeoman.client + '/{app,components}/**/*.spec.js',
    yeoman.client + '/{app,components}/**/*.mock.js'
  ], ['newer:jshint:all', 'karma']);

  gulp.watch(yeoman.server + '/**/*.spec.js', ['env:test', 'mochaTest']);
  gulp.watch(yeoman.client + '/{app,components}/**/*.css', ['injector:css'])
  //<% if(filters.stylus) { %>

  gulp.watch(yeoman.client + '/{app,components}/**/*.styl', ['injector:stylus', 'stylus', 'autoprefixer']);
  //<% } %>
  //<% if(filters.sass) { %>

  gulp.watch(yeoman.client + '/{app,components}/**/*.{scss,sass}', ['injector:sass', 'sass', 'autoprefixer']);
  //<% } %>
  //<% if(filters.less) { %>

  gulp.watch(yeoman.client + '/{app,components}/**/*.less', ['injector:less', 'less', 'autoprefixer']);
  //<% } %>
  //<% if(filters.jade) { %>

  gulp.watch([
    yeoman.client + '/{app,components}/*',
    yeoman.client + '/{app,components}/**/*.jade'
  ], ['jade']);
  //<% } %>
  //<% if(filters.coffee) { %>

  gulp.watch([
      yeoman.client + '/{app,components}/**/*.{coffee,litcoffee,coffee.md}',
      '!' + yeoman.client + '/{app,components}/**/*.spec.{coffee,litcoffee,coffee.md}'
  ], ['newer:coffee', 'injector:scripts']);

  gulp.watch(yeoman.client + '/{app,components}/**/*.spec.{coffee,litcoffee,coffee.md}', ['karma']);
  //<% } %>

});

gulp.task('autoprefixer', function () {
  return gulp.src('{,*/}*.css')
    .pipe(prefix('last 1 version'))
    .pipe(gulp.dest('./.tmp'));
});

gulp.task('bower', function () {
  return  gulp.src(paths.client.main)
    .pipe(wiredep({
      directory: yeoman.client + '/bower_components',
      ignorePath: '..'
    }))
    .pipe(yeoman.client);
});

gulp.task('build', function (cb) {
  runSequence('clean:dist');
});

gulp.task('default', ['newer:jshint', 'test', 'build']);