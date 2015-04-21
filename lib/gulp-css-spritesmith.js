// Dependencies
var assert = require('assert');
var gutil = require('gulp-util');
var through2 = require('through2');

var cssSpriteSmith = require('css-spritesmith');

// Default options
var defautlOptions = cssSpriteSmith.defautlOptions;

function gulpCssSprite(options) {
    options = options || {};
    for(var k in defautlOptions) {
        if(options[k] === undefined) {
            options[k] = defautlOptions[k];
        }
    }

    assert(options.imagepath, 'An `imagepath` parameter was not provided');
    assert(options.spritedest, 'An `spritedest` parameter was not provided');

    function onData(file, encoding, cb) {
        var self = this;
        var filepath = file.path;

        if(!filepath) {
            return cb();
        }

        options.cssfile = filepath;

        cssSpriteSmith(options, function(err, data) {
            if(err) {
                return cb(err);
            }

            if(data.cssData === null) {
                return cb();
            }

            var cssFile = new gutil.File({
                contents: new Buffer(data.cssData),
                path: filepath
            });
            self.push(cssFile);

            // sprite file
            var spriteData = data.spriteData;
            var spriteFile = new gutil.File({
                contents: new Buffer(spriteData.image, 'binary'),
                path: spriteData.imagePath
            });
            self.push(spriteFile);

            var retinaSpriteData = data.retinaSpriteData;
            if(retinaSpriteData) {
                var retinaSpriteFile = new gutil.File({
                    contents: new Buffer(retinaSpriteData.image, 'binary'),
                    path: retinaSpriteData.imagePath
                });
                self.push(retinaSpriteFile);
            }

            cb();
        });
    }

    var retStream = through2.obj(onData);

    return retStream;
}

module.exports = gulpCssSprite;
