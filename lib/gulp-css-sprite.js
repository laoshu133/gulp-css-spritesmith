// Dependencies
var fs = require('fs');
var path = require('path');
var async = require('async');
var assert = require('assert');
var gutil = require('gulp-util');
var through2 = require('through2');
var spritesmith = require('spritesmith');
var Readable = require('stream').Readable;

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

    // Define output streams
    var imgStream = new Readable({objectMode: true});
    var cssStream = new Readable({objectMode: true});

    // Do nothing, let the `finish` handler take care of this
    imgStream._read = cssStream._read = noop;








    var retStream = through2.obj();
    retStream.css = cssStream;
    retStream.img = imgStream;
    return retStream;
}

function noop() {
    // No operation
}

function gulpSpritesmith(params) {
  var imgName = params.imgName;
  var cssName = params.cssName;
  assert(imgName, 'An `imgName` parameter was not provided to `gulp.spritesmith` (required)');
  assert(cssName, 'A `cssName` parameter was not provided to `gulp.spritesmith` (required)');

  // Define our output streams
  var imgStream = new Readable({objectMode: true});
  imgStream._read = function imgRead () {
    // Do nothing, let the `finish` handler take care of this
  };
  var cssStream = new Readable({objectMode: true});
  cssStream._read = function cssRead () {
    // Do nothing, let the `finish` handler take care of this
  };

  // Create a stream to take in images
  var images = [];
  var onData = function (file, encoding, cb) {
    var filepath = file.path;
    if (filepath) {
      images.push(filepath);
    }
    cb();
  };

  // When we have completed our input
  var onEnd = function (cb) {
    // If there are no images present, exit early
    // DEV: This is against the behavior of `spritesmith` but pro-gulp
    // DEV: See https://github.com/twolfson/gulp.spritesmith/issues/17
    if (images.length === 0) {
      imgStream.push(null);
      cssStream.push(null);
      return cb();
    }

    // Determine the format of the image
    var imgOpts = params.imgOpts || {};
    var imgFormat = imgOpts.format || imgFormats.get(imgName) || 'png';

    // Set up the defautls for imgOpts
    imgOpts = _.defaults({}, imgOpts, {format: imgFormat});

    // Run through spritesmith
    var spritesmithParams = {
      src: images,
      engine: params.engine,
      algorithm: params.algorithm,
      padding: params.padding || 0,
      algorithmOpts: params.algorithmOpts || {},
      engineOpts: params.engineOpts || {},
      exportOpts: imgOpts
    };
    var that = this;
    spritesmith(spritesmithParams, function (err, result) {
      // If an error occurred, emit it
      if (err) {
        return cb(err);
      }

      // Otherwise, write out the image
      var imgFile = new gutil.File({
        path: imgName,
        contents: new Buffer(result.image, 'binary')
      });
      that.push(imgFile);
      imgStream.push(imgFile);
      imgStream.push(null);

      // START OF BARELY MODIFIED SECTION FROM grunt-spritesmith@1.22.0
      // Generate a listing of CSS variables
      var coordinates = result.coordinates;
      var properties = result.properties;
      var spritePath = params.imgPath || url.relative(cssName, imgName);
      var spritesheetInfo = {
        width: properties.width,
        height: properties.height,
        image: spritePath
      };
      var cssVarMap = params.cssVarMap || function noop () {};
      var cleanCoords = [];

      // Clean up the file name of the file
      Object.getOwnPropertyNames(coordinates).sort().forEach(function (file) {
        // Extract the image name (exlcuding extension)
        var fullname = path.basename(file);
        var nameParts = fullname.split('.');

        // If there is are more than 2 parts, pop the last one
        if (nameParts.length >= 2) {
          nameParts.pop();
        }

        // Extract out our name
        var name = nameParts.join('.');
        var coords = coordinates[file];

        // Specify the image for the sprite
        coords.name = name;
        coords.source_image = file;
        // DEV: `image`, `total_width`, `total_height` are deprecated as they are overwritten in `spritesheet-templates`
        coords.image = spritePath;
        coords.total_width = properties.width;
        coords.total_height = properties.height;

        // Map the coordinates through cssVarMap
        coords = cssVarMap(coords) || coords;

        // Save the cleaned name and coordinates
        cleanCoords.push(coords);
      });

      // Render the variables via `spritesheet-templates`
      var cssFormat = params.cssFormat || cssFormats.get(cssName) || 'json';
      var cssTemplate = params.cssTemplate;

      // If there's a custom template, use it
      if (cssTemplate) {
        cssFormat = 'spritesmith-custom';
        if (typeof cssTemplate === 'function') {
          templater.addTemplate(cssFormat, cssTemplate);
        } else {
          templater.addMustacheTemplate(cssFormat, fs.readFileSync(cssTemplate, 'utf8'));
        }
      }

      var cssStr = templater({
        items: cleanCoords,
        spritesheet: spritesheetInfo
      }, {
        format: cssFormat,
        formatOpts: params.cssOpts || {},
        spritesheetName: params.cssSpritesheetName
      });
      // END OF BARELY MODIFIED SECTION FROM grunt-spritesmith@1.22.0

      // Output the CSS
      var cssFile = new gutil.File({
        path: cssName,
        contents: new Buffer(cssStr)
      });
      that.push(cssFile);
      cssStream.push(cssFile);
      cssStream.push(null);
      cb();
    });
  };

  // Return output stream with two sub-streams:
  // - master stream includes all files
  // - 'css' stream for css only
  // - 'img' stream for images only
  var retStream = through2.obj(onData, onEnd);
  retStream.css = cssStream;
  retStream.img = imgStream;
  return retStream;
}



module.exports = gulpCssSprite;