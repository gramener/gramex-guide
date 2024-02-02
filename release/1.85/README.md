---
title: Gramex 1.85 release notes
prefix: 1.85
...

[TOC]

Gramex 1.85 enables DriveHandler post-processing, FilterHandler hierarchies, Secure Docker builds, and more.

## DriveHandler post-processing

[DriveHandler](../../drivehandler/) accepts all the [FormHandler transform functions](../../formhandler/#formhandler-transforms).

To process a file **after** uploading, use [`modify:`](../../formhandler/#formhandler-modify):

```yaml
url:
  drivehandler:
    pattern: /$YAMLURL/drive
    handler: DriveHandler
    kwargs:
      path: $GRAMEXDATA/apps/guide/drive-data/ # ... save files here
      modify: mymodule.modify(handler)
```

When `modify:` is called, you can use `handler.files` to iterate through the updated files:

```python
def modify(handler):
    '''Return the file size on disk for each file'''
    root = handler.kwargs.path
    modify_data = {'filesize': {}}
    if handler.request.method in {'POST', 'PUT'}:
        for file in handler.files['path']:
            path = os.path.join(root, file)
            # Process the files any way you want
            modify_data['filesize'][file] = len(open(path).read())
    return modify_data
```

See [post-process uploads](../../drivehandler/#post-process-uploads).

## FilterHandler hierarchies

[FilterHandler](../../filterhandler/) lets you create dropdowns for filters from data.

Earlier, FilterHandler only returned unique values for each column, assuming all columns are independent.

But sometimes, columns have hierarchies. For example, Country and City. You don't want to filter independently for country and city.

FilterHandler now returns unique values across _multiple_ columns. Use `/filter?_c=country,city` to get unique values for the `country,city` combination, like this:

```json
{
  "country,city": [
    { "country": "Norway", "city": "Oslo" },
    { "country": "Norway", "city": "Bergen" },
    { "country": "Italy", "city": "Rome" },
    { "country": "Italy", "city": "Venice" }
  ]
}
```

## FormHandler POST supports templates

Earlier, [FormHandler POST](../../formhandler/#formhandler-post) requests returned a JSON object with
metadata about what was inserted.

Now, Gramex lets you render the response as any template, e.g. to acknowledge submitting a form,
using [FormHandler templates](../../formhandler/#formhandler-templates). For example:

```yaml
handler: FormHandler
kwargs:
  url: "postgresql://$USER:$PASS@server/db"
  table: sales
  id: id
  default:
    _format: submit-template
  formats:
    submit-template:
      format: template
      template: $YAMLPATH/template-file.html
      headers:
        Content-Type: text/html
```

`template-file.html` can be any [Tornado template](../../filehandler/#templates). It has access to the
same variables as any [FormHandler template](../../formhandler/#formhandler-templates). For example:

```html
<p>You entered name = {{ handler.get_arg('name', '') }}</p>
<p>The inserted ID(s) are {{ meta['inserted'] }}</p>
```

## FormHandler columns support default functions

FormHandler automatically creates columns in tables via the
[`columns`](../../formhandler/#formhandler-columns) kwarg.

Now, the `default` value for a column can be a
[SQL expression](https://docs.sqlalchemy.org/en/14/core/functions.html),
like the current time, date, a random number, etc. For example:

```yaml
handler: FormHandler
kwargs:
  # ...
  columns:
    timestamp:
      type: TIMESTAMP
      default: { function: func.now() }
```

## Fetch no longer requires XSRF

Gramex blocks HTTP POST requests unless they have an [XSRF cookie](../../filehandler/#xsrf).
This prevents hackers from creating external forms that submit to a Gramex app.

This made it inconvenient when using JavaScript,
e.g. [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) or
[`XMLHTTPRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

But thanks to CORS, browsers cannot submit forms to a different server unless permitted.

From Gramex 1.85 onwards, such requests are auto-detected and do NOT need to send an XSRF cookie.
This reduces the need to set the `xsrf_cookies: false` option, improving security.

## Secure Docker builds

[Gramex Docker builds](https://hub.docker.com/r/gramener/gramex) are built on Alpine Linux, rather than Ubuntu.
This makes them:

1. **Smaller**.
   [Gramex 1.85](https://hub.docker.com/layers/gramener/gramex/1.85.0/images/sha256-982aa204924dd8ac1e50e16bc2c317b977cd1a71da398b2062a5f7c9fcb0d2e5?context=explore)
   is 480MB, almost half the size of
   [Gramex 1.84](https://hub.docker.com/layers/gramener/gramex/1.84.0/images/sha256-f7a73b2485487ee9e5b1c351e0a4e2625108f63c5a1c251e562c393d4cd8c1c8?context=explore)
2. **Secure**. As of 8 Nov 2022,
   [Gramex 1.85](https://trivy.dev/results/?image=gramener/gramex:1.85.0) has 4 vulnerabilities on Trivy compared to
   [Gramex 1.84](https://trivy.dev/results/?image=gramener/gramex:1.84.0) with 667.

Going forward, all Gramex Docker images be scanned by Trivy.

## Redirect old UI libraries

In [Gramex 1.84](../1.84/), we [deprecated old UI libraries](../1.84/#deprecate-old-ui-libraries).

In this version, these libraries are redirected to [JSDelivr](https://jsdelivr.com/). For example:

- `/ui/g1/dist/g1.min.js` is redirected to `https://cdn.jsdelivr.net/npm/g1@0.18.0/dist/g1.min.js`.
- `/ui/d3v5/dist/d3.min.js` is redirected to `https://cdn.jsdelivr.net/npm/d3@5/dist/d3.min.js`.

If users can access the Internet, apps will continue seamlessly.
If users are behind a firewall, please `npm install` the packages and serve them via a FileHandler.

## Code reformatted

Gramex code was formatted using [EditorConfig](https://editorconfig.org/).

But EditorConfig cannot auto-reformat code -- it doesn't understand any languages.

So we moved to

- [`black`](https://black.readthedocs.io/) for Python
- [`prettier`](https://prettier.io/) for JS, CSS, YAML, and Markdown
- Nothing for HTML, since the code since no formatters handle Tornado templates well

We also had a new contributor to Gramex, [boneyag](https://github.com/boneyag), who
[simplified a string concatenation test](https://github.com/gramener/gramex/pull/604/files).

## Bug fixes

- FileHandler templates report the HTML file and line number that caused an error, instead of just `<string>.generated.py`
  [#610](https://github.com/gramener/gramex/pull/610)
- Gramex has been tested on and refactored to work with all versions of Python 3.7 - 3.9 and Pandas 1.3 - 1.5
  [#628](https://github.com/gramener/gramex/pull/628)

## Backward compatibility & security

Gramex 1.85 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt)
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt)
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt)
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt)
5. [Trivy](https://trivy.dev/) for container scans.
   [See Trivy results](https://github.com/gramener/gramex/blob/master/reports/trivy.txt)

## Statistics

The Gramex code base has:

- 21,786 lines of Python (1,019 more than 1.84)
- 3,859 lines of JavaScript (535 more than 1.84)
- 14,627 lines of test code (1,334 more than 1.84)
- 89% test coverage (same as 1.84)

Note: The increased lines of code are mainly due to [re-formatting with Prettier and Black](#code-reformatted).

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
