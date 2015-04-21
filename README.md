# gulp-css-spritesmith

## 这是什么

这是一个帮助前端开发工程师将 css 代码中的切片合并成雪碧图的工具；
它的主要功能是：

1. 对 css 文件进行处理，收集切片序列，生成雪碧图
2. 在原css代码中为切片添加`background-position`属性
3. 生成用于高清设备的高清雪碧图，并在css文件末尾追加媒体查询代码
4. 生成高清设备雪碧图，使用 `image-set`
5. 支持选择器提取，进一步优化CSS文件大小
6. 在引用雪碧图的位置打上时间戳
7. 在样式末尾追加时间戳
8. 按照时间戳命名文件


## 配置说明

```
// 自动雪碧图
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
```

* **options**

    * `imagepath`
        必填项，sprite背景图源文件夹，只有匹配此路径才会处理，默认 images/slice/

    * `imagepath_map`
        映射CSS中背景路径，支持函数和数组，默认为 null

    * `spritedest`
        必填项，雪碧图输出目录，注意，会覆盖之前文件！默认 images/

    * `spritepath`
        必填项，替换后的背景路径，默认 ../images/

    * `padding`
        可选项，指定各图片间间距，默认 0

    * `useimageset`
        可选项，是否使用 image-set 作为2x图片实现，默认不使用

    * `spritestamp`
        可选项，是否给雪碧图追加时间戳，默认不追加

    * `cssstamp`
        可选项，是否在CSS文件末尾追加时间戳，默认不追加

    * `engine`
        可选项，指定图像处理引擎，默认选择`pngsmith`

    * `algorithm`
        可选项，指定排列方式，有`top-down` （从上至下）, `left-right`（从左至右）, `diagonal`（从左上至右下）, `alt-diagonal` （从左下至右上）和 `binary-tree`（二叉树排列） 五种供选择，默认 `binary-tree`；参考 [Layout](https://github.com/twolfson/layout/)


## 载入插件

请不要忘了载入插件

```
var cssSprite = require('gulp-css-spritesmith');
```

## 打个比方

有一个类似这样的目录结构：

```
├── test/
        ├── css/
            └── icon.css
        ├── images/
            ├── slice/
                ├── icon-a.png
                ├── icon-a@2x.png
                ├── icon-b.png
                └── icon-b@2x.png
        └── publish/
            ├── css/
                └── icon.css
            └── images/
                ├── icon.png
                └── icon@2x.png
```

`css/icon.css` 调用`images/slice/`目录下的切片，`gulp-css-spritesmith` 将对 `css/icon.css` 进行处理。


## 特别注意

1. 生成后的雪碧图将以源 css 文件名来命名
2. 仅当CSS中定义`url(xxxx)`的路径匹配参数`imagepath`才进行处理，和具体`background`，`background-image`CSS无关
3. 理论上高清切片都应该是源切片尺寸的2倍，所以所有高清切片的尺寸宽和高都必须是偶数
4. 理论上所有的切片都应该是 `.png` 格式，`png8` `png24` 和 `png32`不限
5. `spritesmith` 默认只支持png格式，如果有其他格式需要，请参考 *可选依赖*

## 可选依赖

`gulp-css-spritesmith` 使用 [spritesmith](https://github.com/Ensighten/spritesmith) 作为内部核心实现

如果需要将图片处理引擎切换为`gm`或者其他引擎，请手动安装对应的依赖包。
举例 [Graphics Magick(gm)](http://www.graphicsmagick.org/) 依赖的安装流程：

* **Graphics Magick(gm)**

    * Mac
        // 安装GM图形库
        ```
        brew install GraphicsMagick
        npm install gmsmith
        ```

    * Windows
        前往官方网站[下载安装GM图形库](http://www.graphicsmagick.org/download.html)
        然后命令行执行：
        ```
        npm install gmsmith
        ```


## 版本记录

`0.0.1` 完善功能

`0.0.5` Fix #1 ，感谢 [@thewei](https://github.com/thewei)


## 致谢

感谢 [spritesmith](https://github.com/Ensighten/spritesmith)

