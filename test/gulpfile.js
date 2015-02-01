// Dependencies
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var cssSprite = require('../');

// Tasks
gulp.task('autoSprite', function() {
    gulp.src('css/*.css').pipe(cssSprite({
        // sprite背景图源文件夹，只有匹配此路径才会处理，默认 images/slice/
        imagepath: 'slice/',
        // 映射CSS中背景路径，支持函数和数组，默认为 null
        imagepath_map: null,
        // 雪碧图输出目录，注意，会覆盖之前文件！默认 images/
        spritedest: 'publish/images/',
        // 替换后的背景路径，默认 ../images/
        spritepath: '../images/',
        // 各图片间间距，如果设置为奇数，会强制+1以保证生成的2x图片为偶数宽高，默认 0
        padding: 2,
        // 是否使用 image-set 作为2x图片实现，默认不使用
        useimageset: false,
        // 是否以时间戳为文件名生成新的雪碧图文件，如果启用请注意清理之前生成的文件，默认不生成新文件
        newsprite: false,
        // 给雪碧图追加时间戳，默认不追加
        spritestamp: true,
        // 在CSS文件末尾追加时间戳，默认不追加
        cssstamp: true
    }))
    .pipe(gulp.dest('publish/css/'));
});

gulp.task('jshint', function() {
    gulp.src([
        '../lib/*.js',
        './*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['jshint', 'autoSprite']);

return;


// Load in dependencies
var gulp = require('gulp');
var through2 = require('through2');
var spritesmith = require('../');

// Define our test tasks
var images = [
  'test-files/sprite1.png',
  'test-files/sprite2.png',
  'test-files/sprite3.png'
];
gulp.task('sprite-default', function () {
  gulp.src(images).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }))
  .pipe(gulp.dest('actual-files/default/'));
});

gulp.task('sprite-two-streams', function () {
  var data = gulp.src(images).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  data.img.pipe(gulp.dest('actual-files/two-streams/'));
  data.css.pipe(gulp.dest('actual-files/two-streams/'));
});

gulp.task('sprite-formats', function () {
  gulp.src(images).pipe(spritesmith({
    imgName: 'sprite.jpg',
    cssName: 'sprite.css',
    imgOpts: {
      format: 'png'
    },
    cssFormat: 'stylus',
    engine: 'phantomjssmith',
    // Use `top-down` for easier testing
    algorithm: 'top-down'
  }))
  .pipe(gulp.dest('actual-files/formats/'));
});

gulp.task('sprite-options', function () {
  gulp.src(images).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css',
    imgPath: '../../everywhere.png',
    algorithm: 'alt-diagonal'
  }))
  .pipe(gulp.dest('actual-files/options/'));
});

gulp.task('sprite-template', function () {
  gulp.src(images).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.scss',
    cssTemplate: 'test-files/scss.template.mustache',
    // Use `top-down` for easier testing
    algorithm: 'top-down'
  }))
  .pipe(gulp.dest('actual-files/template/'));
});

gulp.task('sprite-spritesheet-name', function () {
  gulp.src(images).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.scss',
    cssSpritesheetName: 'icons',
    // Use `top-down` for easier testing
    algorithm: 'top-down'
  }))
  .pipe(gulp.dest('actual-files/spritesheet-name/'));
});

gulp.task('sprite-empty', function () {
  gulp.src(images).pipe(through2.obj(
    // On data, do nothing and callback
    function onEmptyData (file, encoding, cb) {
      cb();
    },
    // On end, callback with nothing
    function onEmptyEnd (cb) {
      cb();
    }
  )).pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.scss'
  }))
  .pipe(gulp.dest('actual-files/empty/'));
});
