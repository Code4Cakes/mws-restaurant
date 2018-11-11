const gulp = require('gulp'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  browserSync = require('browser-sync').create(),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  cssnano = require('cssnano'),
  sourcemaps = require('gulp-sourcemaps');

let paths = {
  styles: {
    src: 'sass/**/*.scss',
    dest: './css'
  },
  scripts: {
    src: 'js/**/*.js',
    dest: 'public/js'
  },
  html: {
    src: './'
  }
};

function scripts() {
  gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['env'] }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(paths.scripts.dest);
}

function reload() {
  browserSync.reload();
}

function styles() {
  return gulp
    .src('sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.html.src, reload);
}

exports.styles = styles;
exports.watch = watch;
exports.default = watch;
