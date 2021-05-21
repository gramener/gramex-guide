---
title: FunctionHandler runs Python code
prefix: FunctionHandler
icon: functionhandler.png
desc: FunctionHandler runs a function and displays the output
by: TeamGramener
type: microservice
---

[TOC]

The [FunctionHandler][functionhandler] runs a function and displays the output.

For example, this configuration maps the URL [total](total) to a FunctionHandler:

```yaml
url:
    total:
        pattern: /total                             # The "total" URL
        handler: FunctionHandler                    # runs a function
        kwargs:
            function: calculations.total(100, 200)  # total() from calculations.py
            headers:
                Content-Type: application/json      # Display as JSON
```

It runs `calculations.total()` with the arguments `100, 200` and returns
result `300` as `application/json`. [calculations.py](calculations.py) defines
`total` as below:

```python
def total(*items):
    return sum(float(item) for item in items)
```

::: example href=total source="https://github.com/gramener/gramex-guide/blob/master/functionhandler/calculations.py"
    See `total`

To see all configurations used in this page, see [gramex.yaml](gramex.yaml.source):

## Function output

The output of the function is rendered as a string.

String and byte outputs are rendered as-is. Other types (int, float, bool, datetime, DataFrame) are converted to JSON as follows:

- `None`: this returns an empty string (as before), but without a warning
- `bool`, `np.bool`: rendered as JSON, e.g. `true`, `false` (note the lowercase)
- `int`, `float`, `np.integer`, `np.float`: rendered as JSON, e.g. `3`, `1.5`
- `datetime.datetime` and `np.datetime`: rendered as ISO date, e.g. `1997-07-16T19:20:30+01:00`
- `list`, `tuple`, `np.ndarray`: rendered as JSON arrays, e.g. `[1, "abc", true]`
- `dict`: rendered as JSON, e.g. `{"x": 1, "y": "abc"}`. Keys *must* be strings
- `pd.DataFrame`: rendered as JSON via `.to_json(orient="records", date_format="iso")`

## Function methods

FunctionHandler handles `GET` *and* `POST` requests by default. That is, the
same function is called irrespective of whether the method is `GET` or `POST`.

To change this, add a `methods:` key. For example:

```yaml
url:
    total:
        pattern: /total
        handler: FunctionHandler
        kwargs:
            function: calculations.total(100, 200)
            methods: [POST, PUT, DELETE]            # Allow only these 3 HTTP methods
```

## Function arguments

You can define what parameters to pass to the function. By default, the Tornado
[RequestHandler][requesthandler] is passed. The [add](add) URL takes the
handler and sums up numbers you specify. [add?x=1&x=2](add?x=1&x=2) shows 3.0.
Try it below:

```html
<form action="add">
  <div><input name="x" value="10"></div>
  <div><input name="x" value="20"></div>
  <button type="submit">Add</button>
</form>
```

To set this up, [gramex.yaml](gramex.yaml.source) used the following configuration:

```yaml
url:
    add:
        pattern: /add                               # The "add" URL
        handler: FunctionHandler                    # runs a function
        kwargs:
            function: calculations.add              # add() from calculations.py
            headers:
                Content-Type: application/json      # Display as JSON
```

[calculations.add(handler)](calculations.py) is called with the Tornado
[RequestHandler][requesthandler]. It accesses the URL query parameters to add up
all `x` arguments.

```python
def add(handler):
    args = handler.argparse(x={'nargs': '*', 'type': float})
    return sum(args.x)
```

::: example href="add?x=10&x=20&x=30" source="https://github.com/gramener/gramex-guide/blob/master/functionhandler/calculations.py"
    Try `add?x=10&x=20&x=30`

## Function arguments from URL

`gramex.transforms.handler` maps a function's arguments *directly* from the URL as a REST API.

For example, to pass `combinations?n=10&k=4` as a function call `combinations(n=10, k=4)`, add this
to `calculations.py`:

```python
from gramex.transforms import handler
from math import factorial

@handler
def combinations(n:int, k:int) -> float:
    '''combinations(10, 4): ways to pick 4 objects from 10 ignoring order'''
    return factorial(n) / factorial(k) / factorial(n - k)
```

Expose it via this `gramex.yaml` configuration:

```yaml
url:
    combinations:
        pattern: /combinations
        handler: FunctionHandler
        kwargs:
            function: calculations.combinations
            headers:
                Content-Type: application/json
```

Now, [`combinations?n=10&k=4`](combinations?n=10&k=4) returns 210, the number of ways to pick 4
items from 10 ignoring order)

::: example href="combinations?n=10&k=4" source="https://github.com/gramener/gramex-guide/blob/master/functionhandler/calculations.py"
    Try `combinations?n=10&k=4`

`gramex.transforms.handler` calculates exposes all function arguments into a REST API. If you
provide a type hint (e.g. `n: int`), it converts the argument to the correct type.

Apart from `int`, `float`, `str` and `bool`, you can specify **lists** of a specific type as well.
For example:

```python
from gramex.transforms import handler
from numpy import prod
from typing import List

@handler
def multiply(v: List[int]):
    return prod(v)
```

... will get `v` as a list of int. In [`multiply?v=10&v=20&v=30`](multiply?v=10&v=20&v=30), `v` is
passed as a list `v = [10, 20, 30]` to return 10 x 20 x 30 = 6,000.

::: example href="multiply?v=10&v=20&v=30" source="https://github.com/gramener/gramex-guide/blob/master/functionhandler/calculations.py"
    Try `multiply?v=10&v=20&v=30`

## URL path arguments

You can specify wildcards in the URL pattern. For example:

```yaml
url:
    lookup:
        pattern: /name/([a-z]+)/age/([0-9]+)        # e.g. /name/john/age/21
        handler: FunctionHandler                    # Runs a function
        kwargs:
            function: calculations.name_age         # Run this function
```

When you access `/name/john/age/21`, `john` and `21` can be accessed
via `handler.path_args` as follows:

```python
def name_age(handler):
    name = handler.path_args[0]
    age = handler.path_args[1]
    return name + ' is ' + age + ' years old'
```

You can pass any options you want to functions. For example, to call
`random.randrange(start=0, stop=100)`, you can use:

```yaml
url:
  method:
    pattern: /method          # The URL /method
    handler: FunctionHandler  # Runs a function
    kwargs:
        function: random.randrange(start=0, stop=100)
```

You can also pass these directly in the `function:`

```yaml
url:
    path:
        pattern: /path/(.*?)/(.*?)
        handler: FunctionHandler
        kwargs:
            function: handler.path_args
```

Sample output:

- [path/city/Tokyo](path/city/Tokyo) shows `["city", "Tokyo"]`
- [path/age/30](path/age/30) shows `["age", "30"]`

`path_args` is available to [all handlers](../handlers/#basehandler-attributes).

## Parse URL arguments

All URL query parameters are stored in ``handler.args`` as a dict with Unicode
keys and list values. For example:

```text
?x=1        => {'x': ['1']}
?x=1&x=2    => {'x': ['1', '2']}
?x=1&y=2    => {'x': ['1'], 'y': ['2']}
```

It is better to use ``handler.args`` than Tornado's ``.get_arguments()`` because
Tornado does not support Unicode keys well.

To simplify URL query parameter parsing, all handlers have a `handler.argparse()`
function. This returns the URL query parameters as an attribute dictionary.

For example:

```python
def method(handler):
    args = handler.argparse('x', 'y')  # x and y will be loaded as strings by default
    args.x      # This is the same as the last value of ?x
    args.y      # This is the same as the last value of ?y
```

When you pass `?x=a&y=b`, `args.x` is `a` and `args.y` is `b`. With multiple
values, e.g. `?x=a&x=b`, `args.x` is takes the last value, `b`.

A missing `?x=` or `?y=` raises a HTTP 400 error mentioning the missing key.

For optional arguments, use:

```python
args = handler.argparse(z={'default': ''})
args.z          # returns '' if ?z= is missing
```

You can convert the value to a type:

```python
args = handler.argparse(limit={'type': int, 'default': 100})
args.limit      # returns ?limit= as an integer
```

You can restrict the choice of values. If the query parameter is not in
choices, we raise a HTTP 400 error mentioning the invalid key & value:

```python
args = handler.argparse(gender={'choices': ['M', 'F']})
args.gender      # returns ?gender= which will be 'M' or 'F'
```

You can retrieve multiple values as a list::

```python
args = handler.argparse(cols={'nargs': '*', 'default': []})
args.cols       # returns an array with all ?col= values
```

`type:` conversion and `choices:` apply to each value in the list.

To return all arguments as a list, pass `list` as the first parameter::

```python
args = handler.argparse(list, 'x', 'y')
args.x          # ?x=1 sets args.x to ['1'], not '1'
args.y          # Similarly for ?y=1
```

You can combine all these options. For example:

```python
args = handler.argparse(
    'name',                         # Raise error if ?name= is missing
    department={'name': 'dept'},    # ?dept= is mapped to args.department
    org={'default': 'Gramener'},    # If ?org= is missing, defaults to Gramener
    age={'type': int},              # Convert ?age= to an integer
    married={'type': bool},         # Convert ?married to a boolean
    alias={'nargs': '*'},           # Convert all ?alias= to a list
    gender={'choices': ['M', 'F']}, # Raise error if gender is not M or F
)
```

## Function headers

If you have a `download.pdf` in your folder and display it using a function, the output will be rendered as text, by default. For example:

```yaml
url:
    download-pdf:
        pattern: /download-pdf
        handler: FunctionHandler
        kwargs:
            function: gramex.cache.open('download.pdf', 'bin')
```

... will show output like:

```
%PDF-1.7 %���� 9 0 obj << /Type /Page...
```

To render this as a PDF, add this header:

```yaml
            headers:
                Content-Type: application/pdf       # MIME type of download
```

This displays the file as a PDF in the browser.

Further, to download it (instead of rendering it in the browser), add this header:

```yaml
                Content-Disposition: attachment; filename=download.pdf
```

You can also specify this in your function:

```python
def method(handler):
    handler.set_header('Content-Type', 'application/pdf')
    handler.set_header('Content-Disposition', 'attachment; filename=download.pdf')
    return open('download.pdf', 'rb').read()
```

See [Common MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types).

## Function redirection

After the function executes, users can be redirected via the `redirect:` config
documented the [redirection configuration](../config/#redirection).

## Streaming output

If you perform slow calculations and want to flush interim calculations out to
the browser, use `yield`. For example, [slow?x=1&x=2&x=3](slow?x=1&x=2&x=3) uses
the function below to print the values 1, 2, 3 as soon as they are "calculated".
(You won't see the effect on learn.gramener.com. Try it on your machine.)

```python
def slow_print(handler):
    for value in handler.args.get('x', []):
        time.sleep(1)
        yield 'Calculated: %s\n' % value
```

When a function yields a string value, it will be displayed immediately. The
function can also yield a Future, which will be displayed as soon as it is
resolved. (Yielded Futures will be rendered in the same order as they are
yielded.)

::: example href="slow?x=1&x=2&x=3" source="https://github.com/gramener/gramex-guide/blob/master/functionhandler/calculations.py"
    Trye `slow?x=1&x=2&x=3`

## Asynchronous functions

If you are using an asynchronous Tornado function, like
[AsyncHTTPClient][asynchttpclient], they will not block the server. The function
runs in parallel while Gramex continues. When the function ends, the code
resumes. Use [coroutines][coroutines] to achieve this. For example, this fetches
a URL's body without blocking:

```python
async_http_client = tornado.httpclient.AsyncHTTPClient()

@tornado.gen.coroutine
def fetch_body(url):
    'A co-routine that fetches the URL and returns the URL body'
    result = yield async_http_client.fetch(url)
    raise tornado.gen.Return(result.body)
```

You can combine this with the `yield` statement to fetch
multiple URLs asynchronously, and display them as soon as the results are
available, in order:

```python
def urls(handler):
    # Initiate the requests
    args = handler.argparse(x={'nargs': '*'})
    # Initiate the requests
    futures = [fetch_body('https://httpbin.org/delay/%s' % x) for x in args.x]
    # Yield the futures one by one
    for future in futures:
        yield future
```

::: example href="fetch?x=0&x=1&x=2" source="https://github.com/gramener/gramex-guide/blob/master/functionhandler/calculations.py"
    See `fetch?x=0&x=1&x=2`

The simplest way to call *any blocking function* asynchronously is to use a
[ThreadPoolExecutor][ThreadPoolExecutor]. For example, using this code in a
`FunctionHandler` will run `slow_calculation` in a separate thread without
blocking Gramex. Gramex provides a global threadpool that you can use. It's at
`gramex.service.threadpool`.

```python
from gramex import service      # Available only if Gramex is running
result = yield service.threadpool.submit(slow_calculation, *args, **kwargs)
```

[ThreadPoolExecutor]: https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.ThreadPoolExecutor

You can run execute multiple steps in parallel and consolidate their result as
well. For example:

```python
@tornado.gen.coroutine
def calculate(data1, data2):
    from gramex import service      # Available only if Gramex is running
    group1, group2 = yield [
        service.threadpool.submit(data1.groupby, ['category']),
        service.threadpool.submit(data2.groupby, ['category']),
    ]
    result = service.threadpool.submit(pd.concat, [group1, group2])
    raise tornado.gen.Return(result)
```

[requesthandler]: https://tornado.readthedocs.org/en/stable/web.html#request-handlers
[asynchttpclient]: https://tornado.readthedocs.org/en/latest/httpclient.html#tornado.httpclient.AsyncHTTPClient
[functionhandler]: https://learn.gramener.com/gramex/gramex.handlers.html#gramex.handlers.FunctionHandler
[coroutines]: https://tornado.readthedocs.org/en/latest/guide/coroutines.html
