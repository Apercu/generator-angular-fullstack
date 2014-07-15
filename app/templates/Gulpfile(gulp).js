'use strict';

var gulp = require('gulp'),
  _g = require('gulp-load-plugins')();

var rimraf = require('rimraf'),
  es = require('event-stream'),
  runSequence = require('run-sequence'),
  wiredep = require('wiredep');

var yeoman = {
  client: require('./bower.json').appPath || './client',
  server: './server',
  dist: './dist'
  },
  paths = {
    client: {
      main: yeoman.client + '/index.html',
      views: yeoman.client + '/{app,components}/**/*.<% if(filters.jade) { %>jade<% } else { %>html<% } %>',
      scripts: yeoman.client + '/{app,components}/**/*.<% if(filters.coffee) { %>coffee<% } else { %>js<% } %>'
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
  rimraf(yeoman.dist, cb);
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});

//Copy tasks
gulp.task('copy:dist', function () {
  var main = gulp.src([
    yeoman.client + '*.{ico,png,txt}',
    yeoman.client + 'bower_components/**/*',
    yeoman.client + 'assets/images/{,*/}*.{webp}',
    yeoman.client + 'assets/fonts/**/*',
    yeoman.client + '.htaccess',
    yeoman.client + 'index.html'
  ])
    .pipe(gulp.dest(yeoman.dist + '/public'));

  var extra = gulp.src(['package.json', 'server/**/*'])
    .pipe(gulp.dest(yeoman.dist));

  var images = gulp.src('.tmp/images/generated/*')
    .pipe(gulp.dest(yeoman.dist + '/public/assets/images'));

  return es.merge(main, extra, images);
});

gulp.task('copy:styles', function () {
  return gulp.src('{app,components}/**/*.css')
    .pipe(gulp.dest(yeoman.client));
});

//Watches
gulp.task('watch', function () {

  _g.livereload.listen();

  gulp.watch(yeoman.client + '/{app,components}/**/*.html').on('change', _g.livereload.changed);
  gulp.watch(yeoman.client + '/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}').on('change', _g.livereload.changed);

  gulp.watch([
    yeoman.client + '/{app,components}/**/*.js',
    '!' + yeoman.client + '/{app,components}/**/*.spec.js',
    '!' + yeoman.client + '/{app,components}/**/*.mock.js',
    '!' + yeoman.client + '/app/app.js'
  ], ['injector:scripts']).on('change', _g.livereload.changed);

  gulp.watch([
    yeoman.client + '/{app,components}/**/*.spec.js',
    yeoman.client + '/{app,components}/**/*.mock.js'
  ], ['newer:jshint:all', 'karma']);

  gulp.watch(yeoman.server + '/**/*.spec.js', ['env:test', 'mochaTest']);
  gulp.watch(yeoman.client + '/{app,components}/**/*.css', ['injector:css']).on('change', _g.livereload.changed);
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

gulp.task('imagemin', function () {
  return gulp.src(yeoman.client + '/assets/images/{,*/}*.{png,jpg,jpeg,gif}')
    .pipe(_g.imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(yeoman.dist + '/public/assets/images'));
});

gulp.task('autoprefixer', function () {
  return gulp.src('{,*/}*.css')
    .pipe(_g.prefix('last 1 version'))
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

gulp.task('jshint', function () {
  return gulp.src('')
    .pipe(_g.jshint())
    .pipe(_g.jshint.reporter('jshint-stylish'));
});

gulp.task('start:server', function () {
  nodemon({
    script: 'server/app.js',
    nodeArgs: ['--debug-brk']
  })
    .on('log', function (e) {
      console.log(e.colour);
    })
    .on('config:update', function () {
      //open browser
    });
});

//Importants tasks
gulp.task('serve', function (cb) {
  runSequence('clean:tmp', 'start:server', 'start:client', 'watch', cb);
});

gulp.task('build', function (cb) {
  runSequence('clean:dist');
});

gulp.task('default', ['newer:jshint', 'test', 'build']);
