---
title: Gramex 1.66 release notes
prefix: 1.66
...

[TOC]

Gramex 1.66 lets you auto-create table schema, fetch inserted rows, cache queries, auto-compile
SASS files, add pre-defined themes, restrict HTTP methods on any handler, Git LFS support, and
more.

## Auto-create table schema

[FormHandler POST](../../formhandler/#formhandler-post) automatically creates a table (if required)
when inserting a row. But the table structure may not be what you intended.

For example, if the *first* user POSTs:

- `?password=123`, the password column becomes an integer, not string
- `?age=`, the age column becomes a string, not an integer

Use [`Columns:`](../../formhandler/#formhandler-columns) to define column type when creating
tables. For example:

```yaml
    handler: FormHandler
    kwargs:
      url: 'postgresql://$USER:$PASS@server/db'       # Pick any database
      table: profile              # Pick any table name to create
      id: id                      # The "id" column is primary key
      # Define your table's columns
      columns:
        user: TEXT                # Use any SQL type allowed by DB
        password: VARCHAR(40)     # including customizations
        age:
          type: INTEGER           # You can also specify as a dict
          nullable: true          # Allows NULL values for this field
          default: 0              # that default to zero
        id:
          type: INTEGER           # Define an integer ID column
          primary_key: true       # as a primary key
          autoincrement: true     # that auto-increments
```

If the `profile` table already has any of these columns, it is left unaltered. Else, the missing
columns are *added*. No columns are removed.

## Fetch inserted rows

When a user inserts a row using [FormHandler POST](../../formhandler/#formhandler-post), it's
useful to show details about the row added. For example, if the user submits an employee record,
it's useful to link to the new record added.

The JSON object returned by [FormHandler POST](../../formhandler/#formhandler-post) now has an
array of inserted IDs. For example, in the [auto-created table above](#auto-create-table-schema),
the user POSTS `?user=alpha&password=alpha`, the response would look like:

```json
{
  "data": {
    "filters": [],
    "ignored": [],
    "inserted": [
      {
        "id": 1
      }
    ]
  }
}
```

`"inserted": [...]` has the list of records inserted, with the primary keys' values populated in
each record.

Note: This works only if **one record is inserted** in the current release. Future releases will
support fetching IDs for multiple inserts.

## Cache database queries

If a [FormHandler query](../../formhandler/#formhandler-query) is slow, you can cache it using a
fast-to-test condition.

For example:

- Re-run the query once per day
- Re-run the query only if the number of records in the table has changed
- Re-run the query only if the last updated date in another table has changed

[FormHandler](../../formhandler/) supports a `state:` kwarg that can be set as any Python
expression. This is evaluated every time the FormHandler is accessed. If the returned value
changes, the query is run. Else, the previously cached query value is returned.

For example:

```yaml
    kwargs:
      query: ...    # Some long-running query
      # Use any ONE such state: in your gramex.yaml
      # 1. Re-run query once per day
      state: datetime.date.today()      # Run once per day
      # OR: 2. Re-run when the number of records in `table` changes
      state: "gramex.data.filter(
                'sqlite:///my.db',
                query='SELECT COUNT(*) FROM table')"
      # OR: 3. Re-run when the latest `date` in `table` changes
      state: "gramex.data.filter(
                'sqlite:///my.db',
                query='SELECT MAX(date) FROM table')"
      # OR: 4. Re-run when any utils.cache_func()'s result changes
      state: utils.cache_func(args, handler)
```

## Auto-compile SASS files

[SASS](http://sass-lang.com/) is a superset of CSS that supports variables, color and size
operators, nested rules, custom functions, and more. It makes writing CSS faster and easier.

[FileHandler now auto-compiles SASS files](../../filehandler/#sass). Any `.scss` file is compiled
into CSS using [node-sass](https://www.npmjs.com/package/node-sass). To enable this in your
FileHandler, just add:

```yaml
    kwargs:
      sass: '*.scss, *.sass'
```

If you haven't created your own FileHandler, the default FileHandler automatically compiles SASS.

Any URL query parameters are automatically passed to your SASS file as variables. For example,
[color.scss?color=red](../../filehandler/color.scss?color=red) is the same as adding `$color: red;`
before your `color.scss`.

## Bootstrap themes

This release adds a number of pre-defined Bootstrap themes from
[Bootswatch](https://bootswatch.com/) and [Bootstrap Themes Guide](http://bootstrap.themes.guide/).
Browse these at [/ui/theme/](../../ui/theme/). You can link to these directly. For example:

- [/ui/theme/default.scss](../../ui/theme/default.scss)
- [/ui/theme/bootswatch/slate.scss](../../ui/theme/bootswatch/slate.scss)
- [/ui/theme/themes-guide/fresca.scss](../../ui/theme/themes-guide/fresca.scss)

Or, you can import them in your `style.scss`. For example:

```scss
// Include any one of these lines to import the theme
@import "theme/default";
@import "theme/bootswatch/slate";
@import "theme/themes-guide/fesca";
```

## Gramex UI components in SASS

Gramex UI components are available as pure SASS files that you can import in your `stye.scss`. For
example, your `style.scss` can include:

```scss
// Add any Bootstrap variables here. For example:
$dark: #204066;
// Import the Gramex UI components, which include Bootstrap
@import "gramexui";
// Add your custom CSS/SCSS code that overrides Bootstrap / Gramex UI components
.component { border: 1px solid $dark; }
```

## Transform multiple file types

[FileHandler transforms](../../filehandler/#transforming-content) now lets you pick multiple
extensions for the same transform. For example, to treat all `template*.html` and `template*.svg`
files as templates, use:

```yaml
    kwargs:
      template: 'template*.html, template*.svg'
```

This is useful when you want to render files normally, *except* certain files that are templates.

Similarly, to treat all `*.scss` and `*.sass` files as SASS files, use:

```yaml
    kwargs:
      sass: '*.scss, *.sass'
```

File patterns can be joined one or more spaces and/or commas.

This can also be used in FileHandler under `kwargs.transform:` like this:

```yaml
    kwargs:
      transform:
        "*.md, *.markdown":     # Convert .md and .markdown files
          function: markdown.markdown(content)
```

## Restrict HTTP methods on any handler

Some handlers support multiple HTTP methods. For example, you can send a GET or a POST request to a
[FileHandler](../../filehandler/), [FunctionHandler](../../functionhandler/), or
[FormHandler](../../formhandler/).

To [allow only specific HTTP methods](../../config/#http-methods) (e.g. to disable PUT/DELETE for a
FileHandler), use:

```yaml
    kwargs:
      # Use any one of these lines
      methods: GET            # Only allows the GET method
      methods: GET, POST      # Only allow GET/POST, not PUT, DELETE, etc
      methods: [GET, POST]    # Same as above
      methods: GET, POST, PUT, DELETE, OPTIONS, PATCH     # Allow all methods
```

This works for **all handlers**. If the user requests a non-allowed method, or the underlying
handler does not support it, Gramex raises a `HTTP 405: Method not allowed` response.

## Git LFS support

[Git LFS](https://git-lfs.github.com/) stores large files in Git repos without slowing or bloating
the repo.

If Git LFS is installed on your system when you run [`gramex init`](../../init/), it will
automatically track all files under `assets/**` via Git LFS.

Earlier, these files were in `.gitignore`. If your system does not have Git LFS, they will continue
to be in `.gitignore`.

## Other improvements

- `gramex init` automatically creates a `style.scss` instead of `style.css`. SCSS is encouraged.
  It also uses the default theme via `@import "theme/default"`.
- [deploy.yaml](../../deploy/#deployyaml) blocks pages with XSS vulnerability via the
  `X-XSS-Protection: 1; mode=block` HTTP header. (Earlier, it just set `X-XSS-Protection: 1;`
  without the `mode=block`, which is less secure.)
- [@handler](../../functionhandler/#function-arguments-from-url) in FunctionHandler detects whether
  the function uses an argument called `handler`. If it does, it passes the current
  [handler](../../handlers/) object.
- Gramex internally uses the [python-slugify](https://pypi.org/project/python-slugify/) library to
  create a series of slug functions like `gramex.config.slug.filename()` and
  `gramex.config.slug.module()`. These convert user-provided strings into valid filenames and
  modules more reliably.

## Bug fixes

- [#133](https://github.com/gramener/gramex/issues/323):
  [DriveHandler's File Manager](../../drivehandler/#file-manager) always showed only the first drive's
  data even when multiple drives were specified.
  Raised by [Nikhil Kabbin](https://github.com/nikhilkabbin)
- [Redis cache stores](../../cache/#cache-stores) did not support parameters (e.g. user ID or
  password) that have `=` in them.
  Fixed by [Mohammed Niyas](https://github.com/mniyas) and Naveen Manukonda
- Once a [ModelHandler](../../modelhandler/) model is trained, it was still mark it as untrained.
  This is fixed.
- [FormHandler](../../formhandler/) raised a warning on the console if the return value is `None`.
  This happens when using a `modify` to render custom output, for example.
  Now, Gramex does not raise this warning.


## What next

Gramex 1.67 will be released on 1 Dec and will feature:

- A new `MLHandler` class that makes it easy to create and deploy machine learning models. This
  will include scikit-learn, Keras and PyTorch models. This will deprecate
  [ModelHandler](../../modelhandler/).
- A new "Forms" app that supports UI-based form creation and deployment in any Gramex app
- A more extensive UI component library with ready-to-use components such as navbar, sidebar,
  carousel, accordion, etc.

4 of the features promised in this release are delayed. 2 will be released in December.

1. [ModelHandler support](https://github.com/gramener/gramex/issues/303) for TensorFlow,
   [Keras](https://github.com/gramener/gramex/pull/310) and PyTorch models. This will flow under
   `MLHandler`.
2. Add a 1-year **roadmap** for Gramex

2 are deferred to a future release.

1. [Python 3.8 support](https://github.com/gramener/gramex/issues/300)
2. [Notification for errors in alerts](https://github.com/gramener/gramex/issues/292)


## Statistics

The Gramex code base has:

- 18,260 lines of Python (235 more than 1.65)
- 1,776 lines of JavaScript (67 more than 1.65)
- 11,614 lines of test code (527 more than 1.65)
- 89% test coverage (same as 1.65)

## Credits

- [Abhilash Madireddy](https://github.com/println2) for
  [restricting HTTP methods on any handler](#restrict-http-methods-on-any-handler)
- [Mohammed Niyas](https://github.com/mniyas) for
    [caching database queries](#cache-database-queries) and
    fixing [redis cache configurations](../../cache/#cache-stores) that have `=` in them
- Naveen Manukonda for
    fixing [redis cache configurations](../../cache/#cache-stores) that have `=` in them
- [Nikhil Kabbin](https://github.com/nikhilkabbin) for raising
    [#133](https://github.com/gramener/gramex/issues/323): multi-drive support

## How to install

See the [Gramex installation and upgrade instructions](../../install/).

**NOTE**: The 1.66 Conda package has an
[installation issue](https://github.com/gramener/gramex/issues/353). Use Docker or PyPi.

Note: Gramex 1.66 does not work with Python 3.8. We recommend Python 3.7.
