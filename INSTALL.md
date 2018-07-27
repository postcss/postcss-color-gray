# Installing PostCSS Gray

[PostCSS Gray] runs in all Node environments, with special instructions for:

| [Node](#node) | [Webpack](#webpack) | [Create React App](#create-react-app) | [Gulp](#gulp) | [Grunt](#grunt) |
| --- | --- | --- | --- | --- |

## Node

Add [PostCSS Gray] to your project:

```bash
npm install postcss-color-gray --save-dev
```

Use [PostCSS Gray] to process your CSS:

```js
import postcssGray from 'postcss-color-gray';

postcssGray.process(YOUR_CSS /*, processOptions, pluginOptions */);
```

Or use it as a [PostCSS] plugin:

```js
import postcss from 'postcss';
import postcssGray from 'postcss-color-gray';

postcss([
  postcssGray(/* pluginOptions */)
]).process(YOUR_CSS /*, processOptions */);
```

## Webpack

Add [PostCSS Loader] to your project:

```bash
npm install postcss-loader --save-dev
```

Use [PostCSS Gray] in your Webpack configuration:

```js
import postcssGray from 'postcss-color-gray';

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader: 'postcss-loader', options: {
            ident: 'postcss',
            plugins: () => [
              postcssGray(/* pluginOptions */)
            ]
          } }
        ]
      }
    ]
  }
}
```

## Create React App

Add [React App Rewired] and [React App Rewire PostCSS] to your project:

```bash
npm install react-app-rewired react-app-rewire-postcss --save-dev
```

Use [React App Rewire PostCSS] and [PostCSS Gray] in your
`config-overrides.js` file:

```js
import reactAppRewirePostcss from 'react-app-rewire-postcss';
import postcssGray from 'postcss-color-gray';

export default config => reactAppRewirePostcss(config, {
  plugins: () => [
    postcssGray(/* pluginOptions */)
  ]
});
```

## Gulp

Add [Gulp PostCSS] to your project:

```bash
npm install gulp-postcss --save-dev
```

Use [PostCSS Gray] in your Gulpfile:

```js
import postcss from 'gulp-postcss';
import postcssGray from 'postcss-color-gray';

gulp.task('css', () => gulp.src('./src/*.css').pipe(
  postcss([
    postcssGray(/* pluginOptions */)
  ])
).pipe(
  gulp.dest('.')
));
```

## Grunt

Add [Grunt PostCSS] to your project:

```bash
npm install grunt-postcss --save-dev
```

Use [PostCSS Gray] in your Gruntfile:

```js
import postcssGray from 'postcss-color-gray';

grunt.loadNpmTasks('grunt-postcss');

grunt.initConfig({
  postcss: {
    options: {
      use: [
       postcssGray(/* pluginOptions */)
      ]
    },
    dist: {
      src: '*.css'
    }
  }
});
```

[Gulp PostCSS]: https://github.com/postcss/gulp-postcss
[Grunt PostCSS]: https://github.com/nDmitry/grunt-postcss
[PostCSS]: https://github.com/postcss/postcss
[PostCSS Loader]: https://github.com/postcss/postcss-loader
[PostCSS Gray]: https://github.com/postcss/postcss-color-gray
[React App Rewire PostCSS]: https://github.com/csstools/react-app-rewire-postcss
[React App Rewired]: https://github.com/timarney/react-app-rewired
