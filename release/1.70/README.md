---
title: Gramex 1.70 release notes
prefix: 1.70
...

[TOC]

Gramex 1.70 introduces support for MongoDB, Bootstrap 5, VueJS, minimal scaffolding, and more.

## MongoDB support

[FormHandler](../../formhandler/) now supports MongoDB as a data source.

![MongoDB logo](mongodb-logo.svg){: height=150}

To use it, create a FormHandler with this configuration:

```yaml
url:
  mongodb-data:
    pattern: /data
    handler: FileHandler
    kwargs:
      url: plugin:mongodb://localhost:27017
      database: database-name
      collection: collection-name
```

The contents of the collection can be queried via the `/data` URL. You can also use
[FormHandler query](../../formhandler/#formhandler-query) feature to construct complex queries.

## Bootstrap 5 support

[Bootstrap 5](https://getbootstrap.com/docs/5.0/getting-started/introduction/) is released, and Gramex is ready. You can use
[floating labels](https://getbootstrap.com/docs/5.0/forms/floating-labels/),
[offcanvas](https://getbootstrap.com/docs/5.0/components/offcanvas/),
[custom switches](https://getbootstrap.com/docs/5.0/forms/checks-radios/) and more.

![Bootstrap logo](bootstrap-logo.svg){: height=150}

The full list of [UI Components](../../uicomponents/) is available for Bootstrap 5. So, instead of adding the default Bootstrap 4 theme to your HTML:

```html
<link rel="stylesheet" href="ui/theme/default.scss" />
```

... add the Bootstrap 5 theme instead:

```html
<link rel="stylesheet" href="ui/theme/bootstrap5.scss" />
```

That's it. All Bootstrap 5 styles are available.

## VueJS support

FileHandler can compile [Vue single-file components](https://vuejs.org/v2/guide/single-file-components.html).
The default FileHandler compiles any `.vue` file into CSS. For example, this `hello-world.vue` file:

```html
<template>
  <p>{{ greeting }} World!</p>
</template>

<script>
  module.exports = {
    data: function () {
      return {
        greeting: "Hello",
      };
    },
  };
</script>

<style scoped>
  p {
    font-size: 2em;
    text-align: center;
  }
</style>
```

... [is rendered as](../../filehandler/hello-world.vue):

```js
(function(t){var e={};function n(r){if(e[r]) /* JS contents trimmed */
```

To enable this in your FileHandler, add:

```yaml
kwargs:
    ...
    vue: '*.vue'    # Compile .vue files into JS
```

## Minimal scaffolding

To install the minimal files required to run Gramex, run `gramex init minimal` (instead of `gramex init`) on your terminal.

<link rel="stylesheet" type="text/css" href="../../node_modules/asciinema-player/resources/public/css/asciinema-player.css">
<asciinema-player src="../../init/gramex-init-minimal.rec" cols="100" rows="20" idle-time-limit="0.5" font-size=""></asciinema-player>
<script src="../../node_modules/asciinema-player/resources/public/js/asciinema-player.js"></script>

It initializes a `git` repository and creates these files:

- `gramex.yaml`: Gramex [configuration](../../config/)
- `index.html`: default home page

## Other improvements

- [MLHandler](../../mlhandler/) templates supports data transformations, and an improved default template that includes more accuracy metrics.
- [CaptureHandler](../../capturehandler/) now prints all console logs and error messages from the captured page. This makes debugging errors easier.
- Gramex works on Python 3.8 on Linux -- but not yet on Windows

## Bug fixes

- [PPTXHandler](../../pptxhandler/) no longer creates invalid PPTX files when cloning images in copied slides
- [FilterHandler](../../filterhandler/) now works with CSV files, and does not need an invalid `table` parameter
- [GoogleAuth](../../auth/#google-auth) works out-of-box again, since the deprecated `approval_prompt` parameter is removed
- [Gramex init](../../init/) now converts the `{{ appname }}` in README.md into the actual app name
- Gramex now works with SQLAlchemy 1.4 and above

## Statistics

The Gramex code base has:

- 19,059 lines of Python (87 more than 1.69)
- 3,447 lines of JavaScript (1,301 more than 1.69)
- 12,256 lines of test code (161 more than 1.69)
- 89% test coverage (same as 1.69)

## Credits

- [Kamlesh Jaiswal](https://github.com/kamleshdjango) for FormHandler MongoDB support
- [Prakruti Singh](https://github.com/prakrutisingh24) for MLHandler template enhancements

## How to install

See the [Gramex installation and upgrade instructions](../../install/).

Note: Gramex 1.70 does not work with Python 3.8 or 3.9. We recommend Python 3.7.
