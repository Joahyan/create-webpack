const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const path = require('path');
const glob = require('glob');
const autoprefixer = require('autoprefixer');

const projectRoot = process.cwd();


// 获取html-webpack-plugin参数的方法
const getHtmlConfig = (name, title) => ({
  template: path.join(projectRoot, `src/${pageName}/index.html`),

  template: 'index.html', // 指定产出的模板
  filename: `view/${name}.html`, // 产出的文件名cls
  title, // 可以给模板设置变量名，在html模板中调用 htmlWebpackPlugin.options.title 可以使用
  inject: true,
  hash: true,
  chunks: ['common', name], // 在产出的HTML文件里引入哪些代码块
});

const setMPA = () => {

  const entry = {};
  const htmlwebpackPlugin = [];
  // 使用glob遍历目录文件
  const itemPath = './test/smoke/template/src/*/index.js';
  // ./src/*/index.js
  const entryFiles = glob.sync(path.join(projectRoot,itemPath));
  console.log("bak",entryFiles);
  Object.keys(entryFiles).map((index) => {
    const entryFile = entryFiles[index];
    const match = entryFile.match(/src\/(.*)\/index\.js/);
    // const match = entryFile.match(/common\/(.*)\/index\.js/);
    const pageName = match && match[1];
    htmlwebpackPlugin.push(new HtmlWebpackPlugin(getHtmlConfig(pageName, pageName)));
    entry[pageName] = entryFile;
    return null;
  });
  console.log(entry);
  return {
    entry,
    htmlwebpackPlugin,
  };
};

const { entry, htmlwebpackPlugin } = setMPA();

module.exports = {

  entry,

  // output: {
  //   filename: '[name]_[chunkhash:8].js', // name相当于通配符
  //   path: path.join(projectRoot, 'dist'),
  // },


  // 资源解析
  module: {
    /* * 【改动】：loader的使用中，loaders字段变为rules，用来放各种文件的加载器，用rules确实更为贴切 */
    rules: [
      /* * 【改动】：css样式的加载方式变化 */ // css文件的处理
      // 引入css-loader
      // npm install --save-dev css-loader style-loader
      {
        test: /\.css$/,
        // loader: 'style-loader!css-loader'
        use: [
          // MiniCssExtractPlugin.loader, // style-loader和mini-css-extract-plugin有冲突，只能取其一
          'style-loader',
          'css-loader',
        ], // 上述格式不正确，加载多个插件，需要用useccl
      },
      {
        test: /\.less$/,
        use: [
          // 'style-loader',
          {
            loader: 'style-loader',
            options: {
              insertAt: 'top', // 样式插入到head
              singleton: true, // 将所有的style标签合并成一个
            },
          },
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => {
                autoprefixer({
                  overrideBrowserslist: ['last 2 version', '>1%', 'ios 7'],
                });
              },
            },
         
          },
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75, // 1 rem = 75px
              remPrecesion: 8, // px转rem 小数点后面位数
            },
          },
        ],
      },
      /* * 【改动】：模板文件的加载方式变化 */ // 模板文件的处理
      {
        test: /\.string$/,
        use: { loader: 'html-loader', options: { minimize: true, removeAttributeQuotes: false } },
      },
      /* * 【改动】：图片文件的加载方式变化，并和字体文件分开处理 */ // 图片的配置
      {
        test: /\.(png|jpg|gif)$/,
        use: [{
          loader: 'file-loader',
          options: {/* * 【改动】：图片小于2kb的按base64打包 */
            limit: 2048, name: 'view/resource/[name]_[hash:8].[ext]',
          },
        }],
      },
      /* * 【改动】：字体文件的加载方式变化 */ // 字体图标的配置
      {
        test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            limit: 8192, name: 'view/resource/[name]_[hash:8].[ext]',
          },
        }],
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    // css 文件提取
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',
    }),
    new CleanWebpackPlugin(), // 打包时先清空dist目录

    // 日志输出捕获
    new FriendlyErrorsWebpackPlugin(),
    function () {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          console.log('build error'); // 可以进行错误上报等处理
          process.exit(1); // 退出进程并设置错误码
        }
      });
    },
  ].concat(htmlwebpackPlugin),

  stats: 'errors-only',
};
