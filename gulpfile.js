const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

// browserSync.init({
//   server: './'
// });
// browserSync.stream();

gulp.task('default', () => {
  gulp.watch('sass/**/*.scss', gulp.series('styles'));
});

gulp.task('scripts', () => {
  gulp
    .src('dev/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['env']
      })
    )
    // .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./js'));
});

gulp.task('styles', () => {
  gulp
    .src('sass/**/*.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(gulp.dest('./css'));
});