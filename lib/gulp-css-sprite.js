// Dependencies
var fs = require('fs');
var path = require('path');
var async = require('async');
var assert = require('assert');
var gutil = require('gulp-util');
var through2 = require('through2');
var spritesmith = require('spritesmith');
var Readable = require('stream').Readable;

var cssSpriteSmith = require('../css-spritesmith/lib/css-spritesmith');

// Default options
var defautlOptions = {
    // sprite背景图源文件夹，只有匹配此路径才会处理，默认 images/slice/
    imagepath: 'images/slice/',
    // 映射CSS中背景路径，支持函数和数组，默认为 null
    imagepath_map: null,
    // 雪碧图输出目录，注意，会覆盖之前文件！默认 images/
    spritedest: 'images/',
    // 替换后的背景路径，默认为css文件与`spritedest`相对位置
    spritepath: null,
    // 各图片间间距，如果设置为奇数，会强制+1以保证生成的2x图片为偶数宽高，默认 0
    padding: 0,
    // 是否使用 image-set 作为2x图片实现，默认不使用
    useimageset: false,
    // 是否以时间戳为文件名生成新的雪碧图文件，如果启用请注意清理之前生成的文件，默认不生成新文件
    newsprite: false,
    // 给雪碧图追加时间戳，默认不追加
    spritestamp: false,
    // 在CSS文件末尾追加时间戳，默认不追加
    cssstamp: false,
    // 默认使用二叉树最优排列算法
    algorithm: 'binary-tree',
    // 默认使用`pixelsmith`图像处理引擎
    engine: 'pixelsmith'
};

function gulpCssSprite(options) {
    options = options || {};
    for(var k in defautlOptions) {
        if(options[k] === undefined) {
            options[k] = defautlOptions[k];
        }
    }

    assert(options.imagepath, 'An `imagepath` parameter was not provided');
    // assert(options.spritedest, 'An `spritedest` parameter was not provided');

    var cssFiles = [];
    function onData(file, encoding, cb) {
        var filepath = file.path;
        if(filepath) {
          cssFiles.push(filepath);
        }

        cb();
    }

    var imgStream = new Readable({objectMode: true});
    imgStream._read = noop;

    function onEnd(cb) {
        if(!cssFiles.length) {
            return cb();
        }

        var self = this;

        cssSpriteSmith(options, function(err, data) {
            if(err) {
                return cb(err);
            }

            // Otherwise, write out the image
            var imgFile = new gutil.File({
                contents: new Buffer(data.image, 'binary'),
                path: data.imgPath
            });

            self.push(imgFile);
            imgStream.push(imgFile);
            imgStream.push(null);

            var cssFile = new gutil.File({
                contents: new Buffer(data.cssData),
                path: ''
            });
            self.push(cssFile);

            cb();
        });
    }

    var retStream = through2.obj(onData, onEnd);
    retStream.img = imgStream;

    return retStream;
}

function noop() {
    // No operation
}

module.exports = gulpCssSprite;
