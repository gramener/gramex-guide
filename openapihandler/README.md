---
title: OpenAPIHandler documents APIs
prefix: OpenAPIHandler
icon: openapihandler.png
desc: OpenAPIHandler automatically generates OpenAPI specifications you can expose to Swagger
by: TeamGramener
type: microservice
---

[TOC]

**v1.72.0** OpenAPIHandler automatically generates [OpenAPI specifications][openapi] for your APIs.

## OpenAPIHandler

Let's start with a [FunctionHandler](../functionhandler/):

```yaml
url:
  compare:
    pattern: /compare
    handler: FunctionHandler
    kwargs:
      function: openapicalc.compare
      methods: GET      # Only allow GET, not PUT/POST/...
      openapi:          # Optional OpenAPI info
        summary: List Comparison FunctionHandler
```

... which exposes the function `compare(x, y)` from [`openapicalc.py`](openapicalc.py.source).
It checks if `sum(x) > sum(y)`, where `x` and `y` are arrays of numbers.

```python
from gramex.transforms import handler
from typing import List
from typing_extensions import Annotated


@handler
def compare(
    x: Annotated[List[float], 'First list'] = [],
    y: Annotated[List[float], 'Second list'] = [],
) -> bool:
    '''
    Return True if the first list (x) is larger than the second list (y)
    '''
    return True if sum(x) > sum(y) else False
```

::: example href=compare?x=2&x=3&y=4 source=https://github.com/gramener/gramex-guide/tree/master/openapihandler/gramex.yaml
    Compare sum(2, 3) > sum(4)


You can now add an OpenAPIHandler that generates an [OpenAPI JSON][openapi]
for this FunctionHandler.

```yaml
url:
  compare:
    pattern: /$YAMLURL/my-compare-url
    handler: FunctionHandler
    kwargs:
      function: str('Hello world')
  openapi:
    pattern: /$YAMLURL/docs
    handler: OpenAPIHandler
    kwargs:
      info:
        title: Gramex Microservices
        description: >
          [Gramex](https://gramener.com/gramex/) OpenAPIHandler
        version: 0.1.2
      servers:
        - url: ..
          description: Gramex OpenAPIHandler demo
      urls:         # List of url: keys (not pattern) to expose.
        - compare   # "compare" is the key under url:, not the pattern
        - '*'       # Use '*' to match any string
```

::: example href=docs?indent=2 source=https://github.com/gramener/gramex-guide/tree/master/openapihandler/gramex.yaml
    See the OpenAPI output

You can control the indentation by passing `?indent=` to the OpenAPIHandler.

- `?indent=2` indents with 2 spaces
- `?indent=0` shows compressed output (same as not specifying an indent)

To allow users to interact with the API with a UI, use [Swagger UI](https://swagger.io/tools/swagger-ui/).


```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui.css">

<div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
<script>
  const ui = SwaggerUIBundle({
    url: 'docs',    // OpenAPIHandler URL
    dom_id: '#swagger-ui',
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIBundle.SwaggerUIStandalonePreset
    ]
  })
</script>
```

::: example href=example.html source=https://github.com/gramener/gramex-guide/tree/master/openapihandler/example.html
    See the API UI for `compare`


## OpenAPIHandler Configuration

The `kwargs:` can take the following optional keys:

- `urls:` A list of `url:` keys to expose as OpenAPI. For example:
  - `urls: ['compare', 'max']` exposes the URLs `compare:` and `max:`
  - `urls: ['server-*']` exposes all URLs beginning with the key `server-`
  - `urls: ['*']` exposes all URLs
- `info:` Sets the `info:` object in the [OpenAPI spec](https://swagger.io/specification/#info-object). Under `info:`
  - `title:` sets the title
  - `description:` sets the overall API description
  - [More `info:` attributes](https://swagger.io/specification/#info-object)
- `server:` Sets the `server:` object in the [OpenAPI spec](https://swagger.io/specification/#server-object). Under `server:`
  - `url:` sets the root location of the API. Typically, this is `/`, or the URL where Gramex is hosted
  - `description`: sets the server description
  - [More `server:` attributes](https://swagger.io/specification/#server-object)

In addition, the handlers it exposes (e.g. [FunctionHandler](../functionhandler/)) can use these `kwargs:`

- `methods:` list of HTTP methods supported. For example:
  - `methods: GET` only exposes the GET method on the handler
  - `methods: [GET, PUT, DELETE]` exposes GET, PUT and DELETE
- `openapi:` adds to the [Path Item Object](https://swagger.io/specification/#path-item-object)
  in the [OpenAPI spec](https://swagger.io/specification/#server-object). Under `openapi:`
  - `summary:` sets the path summary
  - `description`: sets the path description
  - `get:` sets the GET request parameters. Specifically, under `get:`, you can add [responses:](https://swagger.io/specification/#responses-object)

```yaml
    openapi:
      get:
        responses:
          '200':
            description: Successful Response
            content:
              application/json: {}
          '400':
            description: Bad request
            content:
              text/html:
                example: Bad request
```

Note that this **overrides** any configurations OpenAPIHandler generates.
So if you have a [FunctionHandler with `@handler`](#functionhandler-openapi), any parameters
it generates will be over-written by your `kwargs.openapi:` configuration.

## FunctionHandler OpenAPI

If you expose a [FunctionHandler](../functionhandler/) via OpenAPIHandler, it's best to use it with
[gramex.transforms.handler](../functionhandler/#function-arguments-from-url), like this:

```python
from gramex.transforms import handler

@handler
def compare(x, y):
    '''Describe the function'''
    return sum(x) > sum(y)
```

The function docstring (e.g. `Describe the function` above) will describe the API endpoint.

You can add function annotations that will define types in the OpenAPI. For example, the argument `x` can be defined as:

- `x`: accepts any input, e.g. `?x=a` or `?x=1`
- `x: float`: accepts only a number, e.g. `?x=1`
- `x: List[float]` accepts a list of numbers, e.g. `?x=1&x=2`. You can import `List` from `typing`
- `x: Annotated[float, 'first value']` accepts a number, and adds the description "first value"
- `x: Annotated[List[float], 'first list']` accepts a list of number, and adds the description "first list"

[openapi]: https://swagger.io/specification/

## FormHandler OpenAPI

If you expose a [FormHandler](../formhandler/) via OpenAPIHandler, you must explicitly
[specify the columns](../formhandler/#formhandler-columns), like this:

```yaml
url:
  flagdata:
    pattern: flagdata
    handler: FormHandler
    kwargs:
      url: flags.csv
      columns: [Name, Continent, Symbols, Shapes, Stripes]
```

::: example href=example.html source=https://github.com/gramener/gramex-guide/tree/master/openapihandler/example.html
    See the API UI for `flagdata`
