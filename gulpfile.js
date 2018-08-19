//Includes
var gulp = require("gulp");
var sass = require("gulp-sass");
var styleInject = require("gulp-style-inject");
var inlineCss = require("gulp-inline-css");
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var del = require("del");
var cache = require("gulp-cache");
var rename = require("gulp-rename");
var server = require("browser-sync").create();

//Clean build folder
gulp.task("clean", function() {
  return del("build");
});

//Copy HTML
gulp.task("html", function() {
  return gulp.src("src/*.html")
    .pipe(gulp.dest("build/"));
});

//Copy images
gulp.task("copy-images", function() {
  return gulp.src("src/img/*")
    .pipe(gulp.dest("build/img/"));
});

//Compress images
gulp.task("imagemin", function() {
  return gulp.src("src/img/*")
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      use: [pngquant()]
    })))
    .pipe(gulp.dest("build/img/"));
});

//Compile sass
gulp.task("sass", function() {
  return gulp.src("src/styles/main.scss")
    .pipe(sass({
      outputStyle: "compact",
      indentWidth: 2
    }).on("error", sass.logError))
    .pipe(gulp.dest("build/css/"));
});

//Inject CSS (to <style></style> block)
gulp.task("styleInject", function() {
  return gulp.src("build/*.html")
    .pipe(styleInject())
    .pipe(gulp.dest("build/"));
});

//Inline CSS
gulp.task("inline", function() {
  return gulp.src("build/*.html")
    .pipe(inlineCss({
      applyStyleTags: true,
      applyLinkTags: false,
      removeStyleTags: true,
      removeLinkTags: true,
      preserveMediaQueries: true,
    }))
    .pipe(rename({suffix: "-inline"}))
    .pipe(gulp.dest("build/"));
});

//Watcher
gulp.task("watch", function() {
  
  gulp.watch("src/styles/**/*.s*ss", gulp.series("sass", "html", "styleInject"));
  gulp.watch("src/**/*.html", gulp.series("html", "sass", "styleInject"));
  gulp.watch("src/img/*", gulp.series("copy-images", "html", "sass", "styleInject"));

});

//Create browser-sync server
gulp.task("serve", function() {
  server.init({
    server: {
      baseDir: "build/",
      index: "index.html"
    },
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  server.watch("src/**/*.*").on("change", server.reload);
});

//Final build task
gulp.task("build", gulp.series(
  "clean",
  "imagemin",
  "html",
  "sass",
  "styleInject",
  "inline"
));

//Dev process task with browser-sync
gulp.task("dev", gulp.series("build", gulp.parallel("watch", "serve")));