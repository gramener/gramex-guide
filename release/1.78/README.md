---
title: Gramex 1.78 release notes
prefix: 1.78
...

[TOC]

Gramex 1.78 supports TypeScript, Time series models, CORS with auth, and more.

## TypeScript

[FileHandler](../../filehandler/#typescript) can compile [TypeScript](https://www.typescriptlang.org/).
The default FileHandler compiles any `.ts` file into JS. For example, this `typescript.ts` file:

```ts
type WindowStates = "open" | "closed" | "minimized";
function getLength(obj: WindowStates | WindowStates[]) {
  return obj.length;
}
```

... [is rendered as](../../filehandler/typescript.ts):

```js
function getLength(obj) {
    return obj.length;
}
//# sourceMappingURL=typescript.ts?map
```

::: example href=../../filehandler/typescript.ts source="https://github.com/gramener/gramex-guide/blob/master/filehandler/typescript.ts"
    See typescript.ts

To enable this in your [FileHandler](../../filehandler/#typescript), add:

```yaml
kwargs:
    ...
    ts: '*.ts'      # Compile .ts files into JS
```

## Time Series Models

[MLHandler supports time series forecasting](../../mlhandler/#time-series-forecasting).

This now lets MLHandler perform 3 distinct tasks:

1. Classification: Categorize a data point into discrete buckets (e.g. good/bad)
2. Regression: Predict a number based on other values (e.g. temperature based on pressure)
3. Time series: Predict a number based on time and, optionally, other values (e.g. stock price)

To specify a time series model, use `class: SARIMAX`. This uses the
[`SARIMAX` algorithm in `statsmodels`](https://www.statsmodels.org/dev/generated/statsmodels.tsa.statespace.sarimax.SARIMAX.html).

```yaml
  mlhandler/forecast:
    pattern: /$YAMLURL/forecast
    handler: MLHandler
    kwargs:
      data:
        url: $YAMLPATH/inflation.csv  # Inflation dataset
      model:
        index_col: index    # Use index column as timestamps
        target_col: R
        class: SARIMAX
        params:
          order: [7, 1, 0]  # Creates ARIMA estimator with (p,d,q)=(7,1,0)
                            # Add other parameters similarly
```

## CORS with auth

When one server sends a request to another server via browser JavaScript, we need to enable
[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

This release makes CORS easy. Just add `cors: true` to the URL's `kwargs` to enable CORS.
For example, this page returns session information to pages from any server:

```yaml
url:
  deploy-cors:
    pattern: /$YAMLURL/cors
    handler: FunctionHandler
    kwargs:
      function: handler.session
      cors: true  # Enable CORS
```

You can [restrict CORS](../../deploy/#cors) to specific domains or HTTP methods.
[Read more about CORS](../../deploy/#cors).

## Authorization HTTP methods

To authorize the user for some HTTP methods (e.g. `POST`, `PUT`, `DELETE`) but not others (e.g.
`GET`), use this:

```yaml
url:
  public-read:
    pattern: /$YAMLURL/public-read
    handler: FunctionHandler
    kwargs:
      function: f'Method = $${handler.request.method}, User = $${handler.current_user}'
      auth:
        methods: [POST, PUT, DELETE]
```

Any `GET`, `OPTIONS` or other HTTP requests to `/public-read` can be made by anyone. But `POST`,
`PUT`, `DELETE` can only be made by logged-in users.

::: example href=../../auth/methods source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Auth HTTP methods

## Dynamic SASS imports

[FileHandler](../../filehandler/#sass) supports ○a `?@import=path/to/filename.sass` to import SASS
files dynamically into other SASS files. The import file path must be relative to the requested
SASS file or the directory Gramex is running in.

## Bug fixes

- [FormHandler](../../formhandler/) warns on unknown dialects but does not raise an error. This lets you use new SQLAlchemy dialects, e.g. [snowflake](https://pypi.org/project/snowflake-sqlalchemy/)

## Backward compatibility & security

Gramex 1.78 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

[Backward compatibility tests for 1.78](https://travis-ci.com/github/gramener/gramex/builds/TODO){:.btn .btn-lg .btn-primary}

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt){:.btn .btn-xs .btn-success}
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt){:.btn .btn-xs .btn-success}
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt){:.btn .btn-xs .btn-success}
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt){:.btn .btn-xs .btn-success}

## Statistics

The Gramex code base has:

- 20,134 lines of Python (529 more than 1.77)
- 3,364 lines of JavaScript (4 more than 1.77)
- 12,837 lines of test code (20 more than 1.77)
- 89% test coverage (same as 1.77)


## How to install

See the [Gramex installation and upgrade instructions](../../install/).
