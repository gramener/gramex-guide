---
title: Gramex 1.48 Release Notes
prefix: 1.48
...

[TOC]

## Template components

You can now use `{% include "component.html" %}` to include a template inside
another template. This makes it easier to share components across pages.

This uses [FileHandler templates](../../filehandler#templates), so ensure that
`template: true` is enabled in your YAML file.

Variables from the parent template are available to the component. This allows
programmable components. It's like using functions to generate the template
content. For example, if your `navbar.html` has:

```html
...
<a class="navbar-brand">{{ title }}</a>
...
```

... you can change the title from the calling template.

```html
{% set title = 'Main dashboard' %} {% include "navbar.html" %}
<!-- renders title as Main dashboard -->
```

Some components you may use commonly across pages are:

- `navbar.html`
- `filters.html`
- `footer.html`

## Automated translations

Gramex supports [automated translations](../../translate/). The
`gramex.ml.translator` function translates data using the Google Translate API,
and caches the results in a FormHandler compatible table.

For example, [translate?q=Apple&q=Orange&target=de](../../translate/translate?q=Apple&q=Orange&target=de)
returns a JSON list with the translations.

```json
[
  { "q": "Apple", "t": "Apfel", "source": "en", "target": "de" },
  { "q": "Orange", "t": "Orange", "source": "en", "target": "de" }
]
```

The translations are [stored in a table](../../translate/cache?_format=html)
that you can edit using FormHandlers.

## Better gramex init

`gramex init` automatically adds

- the new [admin page](../../admin/) at `/admin/`
- [custom error pages](../../config/#error-handlers)
- security options from [deploy.yaml](../../deploy/#security) -- but only if you're running in production

You can decide which servers are production servers by editing
the `'YOUR-PROD-SERVER-NAME'` generated by `gramex init`.
(You can also use [any other check](../..//config/#conditions) for production.)

```yaml
import:
  # To secure application for production,
  # replace 'YOUR-PROD-SERVER-NAME' with your production server host name.
  deploy if socket.gethostname() in {'YOUR-PROD-SERVER-NAME'}: $GRAMEXPATH/deploy.yaml
```

## Auto-create tables

[FormHandler](../../formhandler/) can create tables automatically.

If the database table or file that the `url:` points to does not exist, it
returns an empty dataset.

When we `POST` into the table, it automatically creates a table with the columns
available in the `POST` request.

## Admin page enhancements

The [admin page](../../admin/) features a `home:` parameter that lets you link
to the dashboard back from the admin page. It also displays a loading icon when
fetching data -- making slow pages more user-friendly.

## SASS support

[UI components](../../uicomponents/) use [SASS](https://sass-lang.com/) to
simplify CSS code. Gramex now converts SASS files into CSS on the fly:

```yaml
url:
  my-css-handler:
    pattern: ...
    handler: FunctionHandler
    kwargs:
      function: gramex.apps.ui.sass(handler, r"$YAMLPATH/style.scss")
```

This converts `style.scss` into CSS. With this, you can create custom UI components,
modify existing components, or write your CSS more efficiently in SASS.

## Documentation

- The [UI components](../../uicomponents/) page is formatted better.
- The [Contributing](../../contributing/) page explains how to
  [test Gramex](../../contributing/#test-gramex) more clearly

## Bugfixes

- Gramex used to lock an `events.db` SQLite database.
  This prevented a large number of Gramex instances (e.g. 32) from running on a single server.
  Now, over 100 instances can run on the same server.
- Gramex was unable to run subprocesses in a thread since Tornado 5.0.
  As a result, UI components via `bootstraptheme.css` would never load on Python 2.7,
  but work fine on reload. This is fixed.

## Stats

- Code base: 29,357 lines (python: 17,601, javascript: 1,852, tests: 9,904)
- Test coverage: 78%

## Upgrade

To upgrade Gramex, run:

```bash
pip install --verbose gramex==1.48
```

To upgrade apps dependencies, run:

```bash
gramex setup --all
```

This downloads Chromium and other front-end dependencies. That may take time.
