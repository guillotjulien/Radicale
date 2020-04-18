const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const data = require('gulp-data');
const gulp = require('gulp')
const nunjucks = require('gulp-nunjucks-html');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uuid = require('uuid');

const buildHash = uuid.v4();

sass.compiler = require('node-sass');

/**
 * Build html from nunjucks template files and inject build hash for assets cache busting
 */
function template(callback) {
	gulp.src(['src/pages/*.html'])
		.pipe(data(() => ({ buildHash: buildHash })))
        .pipe(nunjucks({
			searchPaths: ['src']
        }))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.stream());

    callback();
}

/**
 * Compile scss files, autoprefix and create source maps
 */
function scss(callback) {
	gulp.src(['src/styles/**/*.scss', 'src/components/**/*.scss'], { sourcemaps: true })
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(concat('main.min.css'))
		.pipe(gulp.dest('build', { sourcemaps: true }))
        .pipe(browserSync.reload({ stream: true }));

    callback();
}

/**
 * Copy assets to build folder. This version copy the minified versions of the
 * vendor scripts.
 */
function copy(callback) {
    gulp.src([
        'src/assets/*.svg',
        'src/assets/*.jpeg',
        'src/assets/*.png',
        'src/assets/*.jpg',
    ]).pipe(gulp.dest('build/assets'));

    gulp.src([
        'node_modules/@clr/ui/clr-ui.min.css',
        'node_modules/@clr/icons/clr-icons.min.css',
        'node_modules/@webcomponents/custom-elements/custom-elements.min.js',
        'node_modules/@clr/icons/clr-icons.min.js',
        'src/assets/vendor/**/*.min.js',
    ]).pipe(gulp.dest('build/assets/vendor'));

    callback();
}

/**
 * Copy assets to build folder. This version copy the development versions of the
 * vendor scripts.
 */
function copyDev(callback) {
    gulp.src([
        'src/assets/*.svg',
        'src/assets/*.jpeg',
        'src/assets/*.png',
        'src/assets/*.jpg',
    ]).pipe(gulp.dest('build/assets'));

    gulp.src([
        'node_modules/@clr/ui/clr-ui.min.css',
        'node_modules/@clr/icons/clr-icons.min.css',
        'node_modules/@webcomponents/custom-elements/custom-elements.min.js',
        'node_modules/@clr/icons/clr-icons.min.js',
    ])
    .pipe(gulp.dest('build/assets/vendor'));

    gulp.src([
        'src/assets/vendor/**/*.js',
        '!src/assets/vendor/**/*.min.js',
    ])
    // Rename to make import easier
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('build/assets/vendor'));

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
 * Extract every string that are marked as i18n and generate a single .pot file
 */
function i18n(callback) {
    // TODO: Extract string in tags that have a 'i18n' attribute
    // TODO: Extract string in attributes whose name starts with 'i18n-*'
    //
    // https://gist.github.com/bosskovic/5930785
    //
    // Example: <h1 i18n>I'm a translatable string!</h1>
    // Example: <h1 i18n="A little bit more context">I'm a translatable string!</h1>
    // Example: <button i18n i18n-aria-label aria-label="I'm a translatable aria-label!">I'm a translatable string!</>
    // Example: <button i18n i18n-aria-label="A little bit more context" aria-label="I'm a translatable aria-label!">
    //              I'm a translatable string!
    //          </button>
    //
    // Result: msgid "I'm a translatable string!"
    //         msgstr "Je suis une chaine de caractères traduisible!"
    //
    // Result: msgctxt "A little bit more context"
    //         msgid "I'm a translatable string!"
    //         msgstr "Je suis une chaine de caractères traduisible!"

    console.log('TODO: Implements i18n extraction');

    callback();
}

/**
 * Definition of dev task, handle templating, building scss and copying assets
 *
 * Watch files for hot reload
 */
function dev(callback) {
    gulp.watch("src/**/*.html", template);
    gulp.watch('src/styles/**/*.scss', scss);
	gulp.watch('src/components/**/*.scss', scss);
    gulp.watch('src/assets/**/*', copyDev);
	gulp.watch('build/**/*', browserSync.reload);

    callback();
}

exports.build = build;
exports.i18n = i18n;
exports.default = gulp.series(watch, scss, template, copyDev, dev);
