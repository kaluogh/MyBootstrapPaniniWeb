var gulp = require('gulp');
var environments = require('gulp-environments');
var development = environments.development;
var production = environments.production;
var sass = require('gulp-sass');
var path = require('path');
var rimraf = require('rimraf');
var sourcemaps = require('gulp-sourcemaps');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var panini = require('panini');
var browserSync = require('browser-sync');

var port = process.env.SERVER_PORT || 6080;
var nodeModulesPath = 'node_modules';
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded',
    includePaths: path.join(nodeModulesPath,'bootstrap', 'scss')
}

debugger;

gulp.task('clean', async function() {
    // rimraf('_site');
    return await rimraf('_site', function(){});
});

gulp.task('compile-sass', function () {
    return gulp.src('./src/scss/app.scss')
        .pipe(development(sourcemaps.init()))
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(production(cssnano()))
        .pipe(development(sourcemaps.write()))
        .pipe(gulp.dest('./_site/css/'));        
});
gulp.task('compile-js', function(){
    var jqueryPath = path.join(nodeModulesPath,'jquery', 'dist', 'jquery.min.js');
    var popperPath = path.join(nodeModulesPath,'popper.js', 'dist', 'umd', 'popper.min.js');
    var bootstrapPath = path.join(nodeModulesPath,'bootstrap', 'dist','js', 'bootstrap.min.js');
    return gulp.src([jqueryPath, popperPath, bootstrapPath])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./_site/js/'));
})
gulp.task('compile-html', function(){
    var paniniOption = {
        root: 'src/html/pages/',
        layouts: 'src/html/layouts/',
        partials: 'src/html/includes/',
        helpers: 'src/html/helpers/',
        data: 'src/html/data/'
    }
    return gulp.src('src/html/pages/**/*.html')
        .pipe(panini(paniniOption))
        .pipe(gulp.dest('_site'));
})

gulp.task('copy', function() {
    return gulp.src(['assets/**/*']).
        pipe(gulp.dest('_site'));
});

// gulp.task('build', ['clean','copy','compile-js','compile-sass','compile-html']);
gulp.task('build', gulp.series('clean', gulp.series('copy','compile-js','compile-sass','compile-html')));

gulp.task('server', function(){
    browserSync.init({
        server: './_site',
        port: port
    });
});

gulp.task('watch', function() {
    // watch('src/scss/**/*', gulp.series('compile-sass', browserSync.reload));
    // watch('src/scss/**/*', gulp.series('compile-sass')).on('change', browserSync.reload);
    // watch('src/html/pages/**/*', gulp.series('compile-html', browserSync.reload));
    // watch('src/html/pages/**/*', gulp.series('compile-html')).on('change', browserSync.reload);
    // watch(['src/html/{layouts,includes,helpers,data}/**/*'], gulp.series('compile-html', browserSync.reload));
    // watch(['src/html/{layouts,includes,helpers,data}/**/*'], gulp.series('compile-html')).on('change', browserSync.reload);
    // watch('src/scss/**/*', gulp.series('compile-sass')).on('change', browserSync.reload);
    gulp.watch('src/scss/**/*').on('change', gulp.series('compile-sass', browserSync.reload));
    gulp.watch('src/html/pages/**/*').on('change', gulp.series('compile-html', browserSync.reload));
    gulp.watch('src/html/{layouts,includes,helpers,data}/**/*').on('change', gulp.series('compile-html', browserSync.reload))
});

gulp.task('set-production', async function(){ return await production.task});
gulp.task('set-development', async function(){ return await development.task});
gulp.task('deploy', gulp.series('set-production', 'build', gulp.parallel('server', 'watch')));
gulp.task('default', gulp.series('set-development','build', gulp.parallel('server', 'watch')));