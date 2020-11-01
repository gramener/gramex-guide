---
title: Gramex 1.65 release notes
prefix: 1.65
...

[TOC]

Gramex 1.65 comes with Excel table support, exposes functions as REST APIs, and support for logging
via ElasticSearch.

## Excel ranges supported

Gramex expects Excel files to be organized neatly -- with one table per sheet, and no empty rows or columns at the beginning.

Spreadsheets are rarely organized this well.

From this release, Gramex can now read **any**
[cell range](https://support.microsoft.com/en-us/office/select-specific-cells-or-ranges-3a0c91c5-8a64-4cd2-8625-7f5b7f1eed87),
[table](https://support.microsoft.com/en-us/office/overview-of-excel-tables-7ab0bb7d-3a9e-4b56-a3c9-6c94334e492c) or
[defined name](https://support.microsoft.com/en-us/office/define-and-use-names-in-formulas-4d0f13ac-53b7-422e-afd2-abd7ff379c64)
from an Excel sheet.

For example, this [cash flow projection sheet](../../formhandler/cashflow/cashflow.xlsx) has multiple sections, each created as Excel tables.

[![Cash flow projection sheet](../../formhandler/cashflow/template-structure.png){.img-fluid}](../../formhandler/cashflow/cashflow.xlsx)

To read a specific table from this sheet, e.g. the `OtherOperationalData` table, use this FormHandler configuration:

```yaml
    pattern: /data                  # The URL /data
    handler: FormHandler
    kwargs:
      url: cashflow.xlsx            # Reads from cashflow.xlsx
      table: OtherOperationalData   # and shows a specific table
```

... and render it as data or charts.

This lets you read un-structured or manually created Excel reports directly as a data source.

You can also call this from Python code as
`gramex.cache.open('cashflow.xlsx', table='OtherOperationalData')`.

To read from a
[cell range](https://support.microsoft.com/en-us/office/select-specific-cells-or-ranges-3a0c91c5-8a64-4cd2-8625-7f5b7f1eed87):

```yaml
      url: cashflow.xlsx            # Reads from cashflow.xlsx
      range: B55:P61                # cells B55 to P61
      sheet_name: Cash Flow         # from the sheet named Cash Flow
```

To read from a
[defined name](https://support.microsoft.com/en-us/office/define-and-use-names-in-formulas-4d0f13ac-53b7-422e-afd2-abd7ff379c64):

```yaml
      url: cashflow.xlsx            # Reads from cashflow.xlsx
      name: CashChart               # all cells in the name "CashChart"
      sheet_name: Cash Flow         # from the sheet named Cash Flow
```

## Functions converted to JSON

Earlier, [FunctionHandler](../../functionhandler/) would only render string or dict values.
Now you may return any of these types. They are converted to JSON as follows:

- `None`: this returns an empty string (as before), but without a warning
- `bool`, `np.bool`: rendered as JSON, e.g. `true`, `false` (note the lowercase)
- `int`, `float`, `np.integer`, `np.float`: rendered as JSON, e.g. `3`, `1.5`
- `datetime.datetime` and `np.datetime`: rendered as ISO date, e.g. `1997-07-16T19:20:30+01:00`
- `list`, `tuple`, `np.ndarray`: rendered as JSON arrays, e.g. `[1, "abc", true]`
- `dict`: rendered as JSON, e.g. `{"x": 1, "y": "abc"}`. Keys *must* be strings
- `pd.DataFrame`: rendered as JSON via `.to_json(orient="records", date_format="iso")`

This means you don't have to explicitly convert return values into strings. They are automatically
converted using a JSON-compatible format. For example:

```python
def myfunction(handler):
    # Instead of encoding booleans into strings...
    return json.dumps(os.path.exists(file))
    # ... you can now use...
    return os.path.exists(file)

    # Instead of converting datetimes to a specific format...
    return today.isoformat()
    # ... you can return them directly
    return today

    # Instead of wrapping lists in a dict...
    return {'result': mylist}
    # ... you can return it directly
    return mylist
```


## Functions as REST APIs

Passing URL query parameters directly to a Python function is much easier now. Suppose you have
this function:

```python
def combinations(n=10, k=1):
    return factorial(n) / factorial(k) / factorial(n - k)
```

To let this accept URL query parameters via `/combinations?n=10&k=4`, you'd write:

```python
# Old code -- no longer required in Gramex 1.65+
def combinations(handler):
    n = int(handler.get_arg('n', '10'))
    k = int(handler.get_arg('k', '1'))
    return factorial(n) / factorial(k) / factorial(n - k)
```

... or:

```python
# Old code -- no longer required in Gramex 1.65+
def combinations(handler):
    args = handler.argparse({
      n={'type': int, 'default': 10},
      k={'type': int, 'default': 1}
    })
    return factorial(n) / factorial(k) / factorial(n - k)
```

Instead, you can use type hints along with the new `gramex.transforms.handler` wrapper:

```python
@gramex.transforms.handler
def combinations(n: int=10, k: int=1):
    return factorial(n) / factorial(k) / factorial(n - k)
```

This automatically parses `/combinations?n=10&k=4` into `n = 10` and `k = 4` along with type
conversions. See a [live example](../../functionhandler/combinations?n=10&k=4) in the
[FunctionHandler](../../functionhandler/) docs.

## Flexible logging

Gramex has a new [`gramexlog` service](../../logging/) that lets you log any user or system event.

To set this up, you need to install
[install ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html)
and configure `gramex.yaml`:

```yaml
gramexlog:
  gramexguide:              # Log name. We'll call this via gramex.log('gramexguide')
    host: hostname          # OPTIONAL: ElasticSearch server name. default: localhost
    port: 9200              # OPTIONAL: port to connect to. default: 9200
    index: gramexguide      # OPTIONAL: index to connect to. default: same as log name
    http_auth: user:pass    # OPTIONAL: user name and password. default: None
    keys: [datetime, user.id, headers.User-Agent]   # OPTIONAL: additional keys. default: None
```

Then, call `gramex.log(x=1, y=2)` (or use any other keyword arguments.)
This will log `{"port": 9988, "time": ..., "user.id": ..., "x": 1, "y": 2}` into your ElasticSearch
server's index `gramexguide`.

You can also use `gramex.log` as a [FunctionHandler](../../functionhandler/) endpoint directly. For
example:

```yaml
url:
  log:
    pattern: /log
    handler: FunctionHandler
    kwargs:
      function: gramex.log(handler, 'gramexguide', event='handler')
```

When a user visit `/log?x=1&y=2`, it logs into `gramexguide` an object with these keys:

- `"x": "1"` from the URL
- `"y": "2"` from the URL
- `"event": "handler"` from the function call
- `"datetime": ...` from the `gramexguide` index configuration
- `"user.id": ...` from the `gramexguide` index configuration
- `"header.User-Agent": ...` from the `gramexguide` index configuration

Since [FormHandler](../../formhandler/) supports ElasticSearch (after running
`pip install elasticsearch-dbapi`), you can view the logs via this FormHandler configuration:

```yaml
    kwargs:
      url: elasticsearch+http://localhost:9200
      table: gramexguide
```


## Other improvements

- [`gramex.cache.open`](../../cache/#data-caching) supports custom callbacks. For example, to load
  `.pickle` files, use `gramex.cache.open_callback['pickle'] = gramex.cache.opener(pickle.load)`.
  Now, `gramex.cache.open('data.pickle')` loads data from a pickle file.
- [`gramex init`](../../init/) replaces `npm install` and `bower install` with `yarn install` in
  `.gitlab-ci.yml`. `pytest` is now optional. Python 3 is now the default CI instance to push to.
- New issues templates on the [Gramex Github repo](https://github.com/gramener/gramex/issues/new/choose)
  make it easier to report issues in a structured way.
- [`slidesense`](../../pptxhandler/) was unable to import modules from the current folder, and
  raised an `os.startfile` error on Linux. Both are resolved.

## What next

6 of the features promised in this release are delayed. 4 of these will be released in December.

1. [Python 3.8 support](https://github.com/gramener/gramex/issues/300)
2. [ModelHandler support](https://github.com/gramener/gramex/issues/303) for TensorFlow,
   [Keras](https://github.com/gramener/gramex/pull/310) and PyTorch models
3. [Notification for errors in alerts](https://github.com/gramener/gramex/issues/292)
4. Add a 1-year **roadmap** for Gramex

2 are deferred to a future release.

1. [Extend PPTXHandler with custom charts](https://github.com/gramener/gramex/issues/243)
2. [Logviewer components that you can embed in any page to track usage](https://github.com/gramener/gramex/issues/288)


## Statistics

The Gramex code base has:

- 18,025 lines of Python (313 more than 1.64)
- 1,709 lines JavaScript (same as  1.64)
- 11087 lines of test code (289 more than 1.64)
- 89% test coverage (same as 1.64)

## Credits

- [vinothsm](https://github.com/vinothsm) for the [Excel range support](#excel-ranges-supported)
  and [ElasticSearch logging](#flexible-logging)

## How to install

See the [Gramex installation and upgrade instructions](../../install/)

Note: Gramex 1.65 does not work with Python 3.8. We recommend Python 3.7.
