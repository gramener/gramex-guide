---
title: FileHandler renders files
prefix: FileHandler
icon: filehandler.png
desc: FileHandler renders files
by: TeamGramener
type: microservice
...

[TOC]

[Video](https://youtu.be/4EAArVzmyGo){.youtube}

[gramex.yaml](../gramex.yaml.source) uses the [FileHandler][filehandler]
to display files. This folder uses the following configuration:

```yaml
url:
  markdown:
    pattern: /$YAMLURL/(.*)               # Any URL under the current gramex.yaml folder
    handler: FileHandler                  # uses this handler
    kwargs:
      path: $YAMLPATH                     # Serve files from this YAML file's directory
      default_filename: README.md         # using README.md as default
      index: true                         # List files if README.md is missing
```

Any file under the current folder is shown as is. If a directory has a
`README.md`, that is shown by default.

`$YAMLURL` is replaced by the current URL's path (in this case, `/filehandler/`)
and `$YAMLPATH` is replaced by the directory of `gramex.yaml`.

**Note**: Gramex comes with a `default` URL handler that automatically serves
files from the home directory of your folder. To prevent that, override the
`default` pattern:

```yaml
url:
  default:                              # This overrides the default URL handler
    pattern: ...
```

## Directory listing

[Video](https://youtu.be/vc6gj1ZFjMo){.youtube}

`index: true` lists all files in the directory if the `default_filename` is
missing. To customize the directory listing, specify `index_template: filename`.
This file will be shown as HTML, with `$path` replaced by the directory's
absolute path, and `$body` replaced by a list of all files in that directory.

For example,

```yaml
url:
  static:
    pattern: /$YAMLURL/static/(.*)        # Any URL starting with /static/
    handler: FileHandler                  # uses this handler
    kwargs:
      path: $YAMLPATH/static/             # Serve files from static/
      default_filename: index.html        # using index.html as default
      index: true                         # List files if index.html is missing
      index_template: $YAMLPATH/template.html   # Use template.html to list directory
```

Here is a trivial `template.html`:

```html
<h1>$path</h1>
$body
```

`index: false` disables directory listing. To disable it for the **default** FileHandler, use:

```yaml
url:
  default:                    # This is a special name for the default Gramex FileHandler
    handler: FileHandler
    kwargs:
      index: false            # Disable directory listing here
```


## File Patterns

[Video](https://youtu.be/h7a-TthAsjY){.youtube}

You can map any URL for any file. For example, to map the file
`filehandler/data.csv` to the URL `/filehandler/data`, use this configuration:

```yaml
    pattern: /$YAMLURL/filehandler/data     # The URL /filehandler/data
    handler: FileHandler                    # uses this handler
    kwargs:
      path: $YAMLPATH/filehandler/data.csv  # and maps to this file
```

You can also map regular expressions to file patterns. For example, to add a
`.yaml` extension automatically to a path, use:

```yaml
url:
  yaml-extensions:
    pattern: /$YAMLURL/yaml/(.*)  # yaml/anything
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/*.yaml      # becomes anything.yaml, replacing the * here
```

For example, [yaml/gramex](yaml/gramex) actually renders [gramex.yaml](gramex.yaml.source).

To replace `.html` extension with `.yaml`, use:

```yaml
url:
  replace-html-with-yaml:
    pattern: /$YAMLURL/(.*)\\.html  # Note the double backslash instead of single backslash
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/*.yaml        # The part in brackets replaces the * here
```

For more complex mappings, use a dictionary of regular expression mappings:

```yaml
url:
  mapping:
    pattern: /$YAMLURL/node/((foo|bar)/.*)  # match /node/foo/... and node//bar/...
    handler: FileHandler
    kwargs:
      path:                                 # If path: is a dict, it's treated as a mapping
        'foo/': $YAMLPATH/foo.html                     # /node/foo/ -> foo.html
        'bar/': $YAMLPATH/bar.html                     # /node/bar/  -> bar.html
        'foo/(.*)': $YAMLPATH/foo/{0}.html             # /node/foo/x -> foo/x.html
        'bar/(?P<file>.*)': $YAMLPATH/bar/{file}.html  # /node/bar/x  -> bar/x.html
        '.*': $YAMLPATH/default.html                   # anything else -> default.html
```

The mapping has keys that are regular expressions. They must match the part of
the URL in brackets. (If there are multiple brackets, it matches the first one.)
Values are file paths. They are formatted as string templates using the regular
expression match groups and URL query parameters. So:

- `{0}` matches the first capture group (in brackets, like `(.*)`),
  `{1}` matches the second capture group, etc.
- `{file}` matches the named capture group `(?P<file>.*)`, etc
- If there's a URL query parameter `?file=`, the first value that replaces
  `{file}` -- but only if there is no such named capture group

When using URL query parameters, you should provide default values in case the
request does not pass the parameter. You can do this using `default:`

```yaml
url:
  mapping:
    pattern: /$YAMLURL/                     # Home page
    handler: FileHandler
    kwargs:
      path:                                 # If path: is a dict, it's treated as a mapping
        '': $YAMLPATH/{dir}/{file}.{ext}    #  /?dir=foo&file=bar&ext=txt -> foo/bar.txt
      default:
        dir: ''             # ?dir= is the default
        file: index         # ?file=index is the default
        ext: html           # ?ext=html is the default
```


If you want to map a subset of files to a folder, you can mark them in the
pattern. For example, this configuration maps `/style.css` and `/script.js` to
the home directory. To ensure that this takes priority over others, you can add
a higher value to the `priority` (which defaults to 0.)

```yaml
url:
  assets:
    pattern: /(style.css|script.js)             # Any of these to URLs
    priority: 2                                 # Give it a higher priority
    handler: FileHandler                        # uses this handler
    kwargs:
      path: .                                   # Serve files from /
```

This can work across directories as well. For example, this maps the `static`
and `bower_components` and specifies a 1-day expiry for any files under them.

```yaml
url:
  static-files:
  # Any file under the current directory, starting with bower_components/
  # or with static/ is mapped to a FileHandler
  pattern: /$YAMLURL/(bower_components/.*|static/.*)
  handler: FileHandler
  kwargs:
    path: $YAMLPATH/                          # Base is the current directory
    headers:
      Cache-Control: public, max-age=86400    # Cache publicly for 1 day
```


## Caching

See how to cache [static files](../cache/#static-files)

## Redirecting files

See [File patterns](#file-patterns)

## Ignore files

To prevent certain files from ever being served, specify the
`handlers.FileHandler.ignore` setting. By default, this is:

```yaml
handlers:
  FileHandler:
    ignore:
      - gramex.yaml     # Always ignore gramex.yaml in Filehandlers
      - ".*"            # Hide dotfiles
```

The `gramex.yaml` file and all files beginning with `.` will be hidden by
default. You can change the above setting in your `gramex.yaml` file. For example:

```yaml
handlers:
  FileHandler:
    ignore:
      - '.*'          # Protect dot-files - they are usually meant to be hidden
      - '*.git*'      # Protect .gitignore, .gitattributes, etc - they list filenames
      - '*.git/*'     # Protect all files under the .git/ repo - they have code history
      - '*.yaml'      # Protect YAML files - they list all URLs
```

You can customize this further for each handler via the `allow:` and `ignore:` configurations.
For example:

```yaml
url:
  my-app-files:
    pattern: /$YAMLURL/(.*)
    handler: FileHandler
    kwargs:
      path: .
      ignore:
        - '*.xls*'          # Ignore all Excel files
      allow:
        - public.xlsx       # But allow public.xlsx
```

Now `public.xlsx` is accessible. But `something-else.xlsx` will raise a HTTP 403 error.
The log reports `Disallow: "something-else.xlsx". It matches "*.xls*"`.

If you import [deploy.yaml](../deploy/#security), FileHandler blocks all files
except specific white-listed exceptions.

## MIME types

[Video](https://youtu.be/wPDo7CEECs4){.youtube}

The URL will be served with the MIME type of the file. CSV files have a MIME
type `text/csv` and a `Content-Disposition` set to download the file. You
can override these headers:

```yaml
    pattern: /filehandler/data
    handler: FileHandler
    kwargs:
        path: filehandler/data.csv
        headers:
            Content-Type: text/plain      # Display as plain text
            Content-Disposition: none     # Do not download the file
```

To convert a file type into an attachment, use:

```yaml
    pattern: /filehandler/data
    handler: FileHandler
    kwargs:
        path: filehandler/data.txt
        headers:
            Content-Type: text/plain
            Content-Disposition: attachment; filename=data.txt    # Save as data.txt
```

From **v1.23.1**, to serve different files with different MIME types, use file patterns:

```yaml
    pattern: /$YAMLURL/(.*)
    handler: FileHandler
    kwargs:
      path: $YAMLPATH
      headers:
        Content-Type: text/plain            # Default header
        "*.json":                           # Override headers on .json files
          Content-Type: application/json
        "json/**"                           # Override headers on json/ directory
          Content-Type: application/json
```

## Templates

[Video](https://youtu.be/0kzphobMQnU){.youtube}

FileHandler uses [Tornado templates][template] to generate content from data.
For example, this `page.tmpl.html` renders 10 images:

```html
{% for id in range(1, 10) %}
  <img src="https://picsum.photos/id/{{ id }}/40">
{% end %}
```

The default, any file that ends with `.tmpl.html` or `.template.html` is rendered as a template.
You can specify amy file patterns using `template: patterns`. For example:

```yaml
url:
  template:
    pattern: ...
    handler: FileHandler
    kwargs:
      path: ...
      template: ['template*.html', '*.tmpl.html', '*.svg']
```

::: example href=template source="https://github.com/gramener/gramex-guide/blob/master/filehandler/template.html"
    Template example

### Template syntax

Templates can use all variables in the [template syntax][template-syntax]. This includes:

- `handler`: the current request handler object
  - all [Tornado handler attributes](../handlers/#tornado-handler-attributes), like
    `handler.request.uri`, `handler.current_user`, etc.
  - ... and [BaseHandler attributes](../handlers/#basehandler-attributes), like
    `handler.args` - a dict of lists containing the URL query parameters
- `request`: alias for `handler.request`
- `current_user`: alias for `handler.current_user`

### Sub-templates

Templates import sub-templates using `{% include path/to/template.html %}`.

- The path is relative to the parent template.
- All parent template variables are available in the sub-template.

For example:

```html
This imports navbar.html in-place as a template.
{% set title, menu = 'App name', ['Home', 'Dashboard'] %}
{% include path/relative/to/template/navbar.html %}

navbar.html can use title and menu variables.
```

### UI Modules

Templates import [modules](https://www.tornadoweb.org/en/stable/guide/templates.html#ui-modules)
using `{% module Template('path/to/template.html', **kwargs) %}`.

- The path is relative to the FileHandler root path (which may be different from the parenttemplate
- Only the variables passed are available to the sub-template.

For example:

```html
This import navbar.html in-place as a template.
{% module Template('path/relative/to/filehandler/navbar.html',
      title='App name',
      menu=['Home', 'Dashboard'])
%}
```

Modules can add CSS and JS to the parent template. For example:

```html
{% set_resources(css_files='/ui/bootstrap/dist/bootstrap.min.css') %} <!-- add Bootstrap -->
{% set_resources(javascript_files='/ui/lodash/lodash.min.js') %}      <!-- add lodash -->
{% set_resources(embedded_css='th { padding: 4px; }') %}    <!-- add CSS -->
{% set_resources(embedded_js='alert("OK")') %}              <!-- add CSS -->
```

### Raw sub-templates

You can also include other files using `{{ gramex.cache.open(...) }}`. For example:

```html
{% raw gramex.cache.open('README.txt') %}   -- inserts README.txt in-place
{% raw gramex.cache.open('README.md') %}    -- inserts README.md as HTML
```

The second open statement converts README.md into HTML. See
[data caching](../caching/#data-caching) for more formats.


## SASS

[Video](https://youtu.be/ryYjE5R9yX4){.youtube}

FileHandler can compile [SCSS files](http://sass-lang.com/). The default FileHandler compiles any
`.scss` or `.sass` file is compiled into CSS. For example, this `color.scss` file:

```scss
$color: red !default;
body { background-color: lighten($color, 40%); }
```

... [is rendered as](color.scss):

```css
body{background-color:#fcc}
```

::: example href=color.scss source="https://github.com/gramener/gramex-guide/blob/master/filehandler/color.scss"
    See color.scss

To enable this in your FileHandler, add:

```yaml
kwargs:
    ...
    sass: '*.scss, *.sass'      # Compile SCSS and SASS files into CSS
```

URL query parameters are automatically passed as variables to the SASS file. For example,
`color.scss?color=green` sets `$color: green`.

::: example href=color.scss?color=blue source="https://github.com/gramener/gramex-guide/blob/master/filehandler/color.scss"
    See `color.scss?color=blue`

You can use this to allow users to customize your theme.


## Vue

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
      greeting: 'Hello'
    }
  }
}
</script>

<style scoped>
p {
  font-size: 2em;
  text-align: center;
}
</style>
```

... [is rendered as](hello-world.vue):

```js
(function(t){var e={};function n(r){if(e[r]) /* JS contents trimmed */
```

::: example href=hello-world.vue source="https://github.com/gramener/gramex-guide/blob/master/filehandler/hello-world.vue"
    See hello-world.vue

To enable this in your FileHandler, add:

```yaml
kwargs:
    ...
    vue: '*.vue'    # Compile .vue files into JS
```


## XSRF

[Video](https://youtu.be/2_rogB8UzXQ){.youtube}

If you're submitting forms using the POST method, you need to submit an
[_xsrf][xsrf] field that has the value of the `_xsrf` cookie.

**When using HTML forms**, you can include it in the template using handlers'
built-in `xsrf_token` property:

```html
<form method="POST">
  <input type="hidden" name="_xsrf" value="{{ handler.xsrf_token }}">
</form>
```

To render a file as a template, use:

```yaml
url:
  template:
    pattern: /page                  # The URL /page
    handler: FileHandler            # displays a file
    kwargs:
      path: page.html               # named page.html
      template: true                # Render as a template
```

[xsrf]: http://www.tornadoweb.org/en/stable/guide/security.html#cross-site-request-forgery-protection

**When using AJAX**, no XSRF token is required. Add an `X-Requested-With: XMLHttpRequest` header to bypass the check.

- If you use XMLHttpRequest, modern browsers automatically send an `X-Requested-With: XMLHttpRequest` header for AJAX
- If not (e.g. if you're [using fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)), add an `X-Requested-With: XMLHttpRequest` header

**When submitting from a server**, add an `X-Requested-With: XMLHttpRequest` header to bypass the check.

You can disable XSRF for a specific handler like this:

```yaml
url:
  name:
    pattern: ...              # When this page is visited,
    handler: ...              # no matter what the handler is,
    kwargs:
      xsrf_cookies: false   # Disable XSRF cookies
```

You can disable XSRF for *all handlers* like this (but this is **not recommended**):

```yaml
app:
  settings:
    xsrf_cookies: false
```

For debugging without XSRF, start Gramex with a `--settings.xsrf_cookies=false` from the command line.

The XSRF cookie is automatically set when a FileHandler [template](#templates)
accesses `handler.xsrf_token`. You can also set it explicitly, by adding a
`set_xsrf: true` configuration to `kwargs` like this:

```yaml
url:
  name:
    pattern: ...              # When this page is visited,
    handler: ...              # no matter what the handler is,
    kwargs:
      ...
      set_xsrf: true        # set the xsrf cookie
```

### How XSRF works

Tornado's XSRF:

- Sets a random non-expiring `_xsrf` cookie when
  `tornado.web.RequestHandler.xsrf_token()` is called. It is `httponly` by
  default in Gramex because of the default `xsrf_cookie_kwargs` setting, but not
  set to `secure` to allow HTTP sites to access it
- Checks if the `_xsrf` GET/POST argument (or the `X-Xsrftoken` or `C-Xsrftoken`
  headers) is a valid XSRF token, and checks that it matches the cookie value

## FileHandler HTTP methods

[Video](https://youtu.be/S86H9FxClYY){.youtube}

By default FileHandler supports `GET`, `HEAD` and `POST` methods. You can map
any of the following methods to the file using the `methods:` configuration as
follows:

```yaml
url:
  name:
    pattern: ...
    handler: FileHandler
    kwargs:
      ...
      methods: [GET, HEAD, POST, DELETE, PATCH, PUT, OPTIONS]
```

## File concatenation

[Video](https://youtu.be/opBiI7LJNns){.youtube}

You can concatenate multiple files and serve them as a single file. For example:

```yaml
    ...
    pattern: /libraries.js
    handler: FileHandler
    kwargs:
      path:
        - bower_components/jquery/dist/jquery.min.js
        - bower_components/bootstrap/dist/bootstrap.min.js
        - bower_components/d3/d3.v3.min.js
      headers:
        Cache-Control: public, max-age=86400    # Cache publicly for 1 day
```

This concatenates all files in `path` in sequence. If transforms are
specified, the transforms are applied before concatenation.

This is useful to pack multiple static files into one, as the example shows.


[filehandler]: https://learn.gramener.com/gramex/gramex.handlers.html#gramex.handlers.FileHandler
[template]: http://www.tornadoweb.org/en/stable/template.html
[template-syntax]: http://www.tornadoweb.org/en/stable/guide/templates.html#template-syntax


## Transforming content

Rather than render files as-is, the following parameters transform the markdown
into HTML:

```yaml
    # ... contd ...
      transform:
        "*.md, *.markdown":                     # Any file matching .md or .markdown
          function: markdown.markdown(content)  #   Convert it to html
          kwargs:                               #   Pass these arguments to markdown.markdown
            output_format: html5                #     Output in HTML5
          headers:                              #   Use these HTTP headers:
            Content-Type: text/html             #     MIME type: text/html
```

Any `.md` file will be displayed as HTML -- including this file (which is [README.md](README.md.source).)

Any transformation is possible. For example, this configuration converts YAML
into HTML using the [BadgerFish](http://www.sklar.com/badgerfish/) convention.

```yaml
    # ... contd ...
        "*.yaml":                               # YAML files use BadgerFish
          function: badgerfish(content)         # transformed via gramex.transforms.badgerfish()
          headers:
            Content-Type: text/html             # and served as HTML
```

Using this, the following file [page.yaml](page.yaml) is rendered as HTML:

```yaml
    html:
      "@lang": en
      head:
        meta:
          - {"@charset": utf-8}
          - {"@name": viewport, "@content": "width=device-width, initial-scale=1.0"}
        title: Page title
        link: {"@rel": stylesheet, "@href": /style.css}
      body:
        h1: Page constructed using YAML
        p: This file was created as YAML and converted into HTML using the BadgerFish convention.
```

Transforms take the following keys:

- **function**: The expression to call. You can use the variables `content` for the file contents
  and `handler` for the handler. Example: `function: mymodule.transform(content, handler)`
- **encoding**: If blank, the file is treated as binary. The transform
  `function` MUST accept the content as binary. If you specify an encoding, the
  file is loaded with that encoding.
- **headers**: HTTP headers for the response.

Any function can be used as a transform. Gramex provides the following (commonly
used) transforms:

1. **template**. See [Templates](#templates). But if you need to pass additional arguments to the
   template, use `function: template(content, handler, **kwargs)`. The `kwargs` are sent as
   variables to the template. For example, this adds `title` and `path` as template variables:

   ```yaml
    transform:
        "template.*.html":
            function: template(content, handler, title='Hello', path=r'$YAMLPATH')
   ```

2. **badgerfish**. Use `function: badgerfish(content, handler)` to convert YAML files into
   HTML. For example, this YAML file is converted into a HTML as you would
   logically expect:

   ```yaml
    html:
        head:
        title: Sample file
        body:
        h1: Sample file
        p:
            - First paragraph
            - Second paragraph
   ```

3. **sass**. Use `function: sass` to convert SASS/SCSS files into CSS. For example:

   ```yaml
    transform:
        "*.scss, *.sass":
            function: sass
   ```
