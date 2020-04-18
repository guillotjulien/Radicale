const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const gulp = require('gulp')
const nunjucks = require('gulp-nunjucks-html');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uuid = require('uuid');

const buildHash = uuid();

sass.compiler = require('node-sass');

/**
 * Build html from nunjucks template files and inject build hash for assets cache busting
 */
function template(callback) {
	gulp.src(['src/*.html'])
		.pipe(data(() => ({ buildHash: buildHash })))
        .pipe(nunjucks({
			searchPaths: ['src/components', 'src/pages']
        }))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.stream());

    callback();
}

/**
 * Compile scss files, autoprefix and create source maps
 */
function scss(callback) {
	gulp.src('src/styles/**/*.scss', { sourcemaps: true })
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('build', { sourcemaps: true }))
        .pipe(browserSync.reload({ stream: true }));

    callback();
}

/**
 * Copy assets to build forlder
 */
function copy(callback) {
    // copy fonts
    gulp.src(['src/assets/fonts/**/*', '!src/assets/fonts/fontawesome/**/*'])
        .pipe(gulp.dest('build/assets/fonts'));

    // FontAwesome
    gulp.src('src/assets/fonts/fontawesome/**/*')
        .pipe(gulp.dest('build/assets/fonts/fontawesome'));

    callback();
}

/**
 * Watch for changes in files
 */
function watch(callback) {
    browserSync.init({
		server: {
            baseDir: 'build',
        },
        open: false,
        ui: false
	});

    callback();
}

/**
 * Definition of build task, handle templating, building scss and copying assets
 */
function build(callback) {
    // place code for your default task here
    gulp.series(template, scss, copy);

    callback();
}

/**
 * Definition of dev task, handle templating, building scss and copying assets
 *
 * Watch files for hot reload
 */
function dev(callback) {
    gulp.watch("src/*.html", template);
    gulp.watch("src/templates/**/*.html", template);
	gulp.watch('src/styles/**/*.scss', scss);
    gulp.watch(['src/assets/**/*'], copy);
	gulp.watch('build/**/*.js', browserSync.reload);

    callback();
}

exports.build = build;
exports.default = gulp.series(watch, scss, template, copy, dev);
