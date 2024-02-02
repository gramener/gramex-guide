---
title: Gramex 1.86 release notes
prefix: 1.86
...

[TOC]

Gramex 1.86 supports API rate limiting, an improved FilterHandler, non-root Docker usage, and more.

## API rate limits

Every handler supports [rate-limiting via the `ratelimit` config](../../ratelimit/).
For example, this allows **50** hits per **user** per **day**:

```yaml
url:
  page:
    pattern: /api
    handler: FormHandler # or any handler
    kwargs:
      # ...
      ratelimit:
        keys: [daily, user]
        limit: 50
```

::: example href=../../ratelimit/example source=https://github.com/gramener/gramex-guide/blob/master/ratelimit/gramex.yaml
Rate limit example

## Improved FilterHandler

[FilterHandler](../../filterhandler/) can return ranges of values for a column using the `_c=<col>|range` syntax.

::: example href=../../filterhandler/flags?\_c=c1|range&\_c=c2|range&\_format=html source=https://github.com/gramener/gramex-guide/blob/master/filterhandler/gramex.yaml
FilterHandler range example

For example, `?_c=c1|range&_c=c2|range` returns the min and max values of columns `c1` and `c2`:

```json
{
  "c1|range": [
    {
      "c1|min": 0,
      "c1|max": 97
    }
  ],
  "c2|range": [
    {
      "c2|min": 0,
      "c2|max": 50
    }
  ]
}
```

This is useful for [range filters](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) like:

```html
<input
  type="range"
  min="${filter['c1|range'][0]['c1|min']}"
  max="${filter['c1|range'][0]['c1|max']}"
/>
```

[FilterHandler](../../filterhandler/) runs a database query for _each_ column that you request.

For slow database connections, you can speed this up with `in_memory: true`. For example:

```yaml
url:
  flags:
    pattern: /filter
    handler: FilterHandler
    kwargs:
      url: $YAMLPATH/city-products.csv
      in_memory: true
```

When you request `?_c=city&_c=product`, FilterHandler fetches all unique combinations of `city` and
`product` into memory. **Then** it further creates combinations.

This only runs a single query, but uses a bit more memory.

## Non-root Docker usage

Since [Gramex 1.85](../../release/1.85/), Gramex Docker builds smaller images

- [gramener/gramex-base](https://hub.docker.com/r/gramener/gramex-base) (240MB)
- [gramener/gramex](https://hub.docker.com/r/gramener/gramex) (480MB, down from 880MB)

The images now make it easier to run Gramex apps as a non-root user.
Specifically, you can run `npm install -g` without `sudo` or `doas`.
(Credits: [Shraddheya](https://github.com/shraddheya)).

## Modern Python packaging

Python has moved to using [pyproject.toml](https://packaging.python.org/en/latest/specifications/declaring-project-metadata/)
as the standard way to package libraries.

Gramex now uses a `pyproject.toml` rather than `setup.py`.

Also, Gramex no longer ships as a conda package. Instead, you can install it with:

```bash
pip install gramex
gramex setup --all
```

## Bug fixes

- [`gramex.cache.open()`](../../api/cache/#gramex.cache) can now read a single Excel cell value, e.g. `gramex.cache.open('file.xlsx', range='A1')`.
- [OpenAPIHandler](../../openapihandler/) had a bug that reported parameter types as a list. They've been corrected to strings
- Handlers can be specified as `handler: <HandlerName>` or as `handler: gramex.handler.<HandlerName>`. On Windows, the latter wasn't working. This is fixed.

## Backward compatibility & security

Gramex 1.86 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 22064 lines of Python (279 more than 1.85)
- 3,859 lines of JavaScript (same as 1.85)
- 14,872 lines of test code (245 more than 1.85)
- We are migrating to pytest from nose. Code coverage will be reported post migration.

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
