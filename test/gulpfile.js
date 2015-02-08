// Dependencies
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var cssSprite = require('../lib/gulp-css-spritesmith');

// autoSprite, with media query
gulp.task('autoSprite', function() {
    gulp.src('css/*.css').pipe(cssSprite({
        // sprite背景图源文件夹，只有匹配此路径才会处理，默认 images/slice/
        imagepath: 'slice/',
        // 映射CSS中背景路径，支持函数和数组，默认为 null
        imagepath_map: null,
        // 雪碧图输出目录，注意，会覆盖之前文件！默认 images/
        spritedest: 'images/',
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
    .pipe(gulp.dest('publish/'));
});

// imageSetSprite, with image-set
gulp.task('imageSetSprite', function() {
    gulp.src('css/*.css').pipe(cssSprite({
        cssfile: 'css/icon.css',
        imagepath: 'slice/',
        padding: 20,
        useimageset: true,
        spritestamp: true,
        // imagepath_map: ['/w/grunt-css-sprite/test/', '../'],
        /*
        imagepath_map: function(uri) {
            return String(uri).replace('/w/grunt-css-sprite/test/', '../');
        },
        */
        spritepath: '../images/',
        spritedest: 'images/'
    }))
    .pipe(gulp.dest('publish/imageset/'));
});

gulp.task('jshint', function() {
    gulp.src([
        '../lib/*.js',
        './*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['jshint', 'autoSprite', 'imageSetSprite']);
