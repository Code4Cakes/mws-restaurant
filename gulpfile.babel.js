'use strict'
import '@babel/polyfill'

import gulp from 'gulp'
import autoprefixer from 'autoprefixer'
import babel from 'gulp-babel'
import browser_sync from 'browser-sync'
import clean from 'gulp-clean'
import concat from 'gulp-concat'
import cssnano from 'cssnano'
import del from 'del'
import imagemin from 'gulp-imagemin'
import postcss from 'gulp-postcss'
import rename from 'gulp-rename'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'

const browserSync = browser_sync.create()

let paths = {
  styles: {
    src: 'src/sass/*.scss',
    dest: 'public/css'
  },
  scripts: {
    src: 'src/js/*.js',
    dest: 'public/js'
  },
  images: {
    src: 'src/img/*',
    dest: 'public/img'
  },
  html: {
    src: '*.html'
  }
}

function images() {
  return gulp
    .src(paths.images.src)
    .pipe(
      imagemin({
        progressive: true,
        interlaced: true
      })
    )
    .pipe(gulp.dest(paths.images.dest))
}

function cleanScripts() {
  return gulp
    .src(paths.scripts.dest, { read: false, allowEmpty: true })
    .pipe(clean())
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.dest))
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(
      rename({
        basename: 'main',
        suffix: '.min'
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

const build = gulp.parallel(styles, scripts, images)

function watch() {
  gulp.watch('src/sass/**/*.scss', styles)
  gulp.watch(paths.scripts.src, gulp.series(cleanScripts, scripts))
  gulp.watch(paths.images.src, images)
  gulp.watch(paths.html.src).on('change', browserSync.reload)
}

exports.styles = styles
exports.scripts = gulp.series(cleanScripts, scripts)
exports.images = images
exports.watch = watch

gulp.task('default', build)
