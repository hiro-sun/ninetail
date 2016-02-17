var gulp = require("gulp");
var typescript = require("gulp-typescript");
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
var browserify = require("browserify");
var tsify = require("tsify");
var source = require("vinyl-source-stream");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var merge = require("merge2");

var ts_project = typescript.createProject("tsconfig.json");
gulp.task("compile-nt", function() {
    var result = gulp.src(["./src/NT/**/*.ts"])
            .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
            .pipe(typescript(ts_project));
    return merge([
        result.dts.pipe(concat("nt.d.ts")).pipe(gulp.dest("./out/js/lib")),
        result.js.pipe(concat("nt.js")).pipe(gulp.dest("./out/js/lib"))
    ]);
});



gulp.task('uglify-nt', function() {
  return gulp.src('./out/js/lib/nt.js')
    .pipe(plumber())
    .pipe(uglify('nt.min.js'))
    .pipe(gulp.dest('./out/js/lib/min'));
});

gulp.task('make', ['compile-nt', 'uglify-nt']);
