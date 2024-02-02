---
title: JSONHandler writes JSON data
prefix: JSONHandler
icon: jsonhandler.png
desc: JSONHandler offers a persistent key-value store with an API
by: TeamGramener
type: microservice
...

JSONHandler offers a persistent key-value store with an API inspired by
[Firebase](https://www.firebase.com/docs/rest/api/).

Set it up with:

```yaml
url:
  jsonhandler-data:
    pattern: /$YAMLURL/data/(.*)
    handler: JSONHandler
    kwargs:
      path: $GRAMEXDATA/jsonhandler.json # JSON data source
      data: { x: 1 } # Initial dataset. Used if path: is not specified. Default: null
```

To [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) this data, you can use this code in JavaScript:

```js
let response = await fetch('data/', { method: 'GET' })
if (response.ok)
  let result = await response.json()
```

## GET - read data

You can read data via a HTTP GET request.

| Request        | Response |                                 |
| :------------- | :------: | :------------------------------ |
| `GET data/`    |    ⌛    | Fetches all data                |
| `GET data/y`   |    ⌛    | Fetches key `data.y`            |
| `GET data/y/a` |    ⌛    | Fetches sub-key `data.y.a`      |
| `GET data/z/0` |    ⌛    | Fetches array value `data.z[0]` |
| `GET data/na`  |    ⌛    | Missing paths return null       |

## PUT - write data

You can write JSON data via a HTTP PUT request.

| Request         |    Data    | Response |                              |
| :-------------- | :--------: | :------: | :--------------------------- |
| `PUT data2/new` | `{"x": 1}` |    ⌛    | Set data to `{"x": 1}`       |
| `GET data2/new` |            |    ⌛    | Result is set                |
| `PUT data2/new` |   `xxx`    |    ⌛    | Invalid JSON raises an error |

## DELETE - remove data

You can delete any key via DELETE.

| Request                |       Data        | Response |                       |
| :--------------------- | :---------------: | :------: | :-------------------- |
| `PUT data2/tmp`        | `{"x": {"y": 1}}` |    ⌛    | Set `tmp.x.y: 1`      |
| `DELETE data2/tmp/x/y` |                   |    ⌛    | Delete `tmp.x.y`      |
| `GET data2/tmp`        |                   |    ⌛    | Result is `tmp.x: {}` |
| `DELETE data2/tmp/x`   |                   |    ⌛    | Delete `tmp.x`        |
| `GET data2/tmp`        |                   |    ⌛    | Result is `tmp: {}`   |
| `DELETE data2/tmp`     |                   |    ⌛    | Delete `tmp`          |
| `GET data2/tmp`        |                   |    ⌛    | Result is `{}`        |

## POST - add data

You can add new records via a POST request.

| Request             |    Data    | Response |                               |
| :------------------ | :--------: | :------: | :---------------------------- |
| `DELETE data2/list` |            |    ⌛    | Delete `.list`                |
| `POST data2/list`   | `{"x": 1}` |    ⌛    | Creates unique random key     |
| `GET data2/list`    |            |    ⌛    | Record stored with unique key |
| `POST data2/list`   | `{"x": 2}` |    ⌛    | Creates unique random key     |
| `GET data2/list`    |            |    ⌛    | Record stored with unique key |

## PATCH - update data

You can update existing data via PATCH.

| Request           |    Data    | Response |                             |
| :---------------- | :--------: | :------: | :-------------------------- |
| `PUT data2/new`   | `{"x": 1}` |    ⌛    | Creates a new record        |
| `PATCH data2/new` | `{"y": 2}` |    ⌛    | Update record with new data |
| `GET data2/new`   |            |    ⌛    | Result has both entries     |

## Escaping slash in keys

If your key has a `/` in it, use `%5C/` (`\/`) to escape it in the URL.

| Request                |     Data     | Response |                                 |
| :--------------------- | :----------: | :------: | :------------------------------ |
| `PUT data2/esc`        | `{"x/y": 1}` |    ⌛    | Creates a record with `/` in it |
| `GET data2/esc/x%5C/y` |              |    ⌛    | Use `%5C/` to escape the `/`    |

## Method override

You can use the `X-HTTP-Method-Override` header or the `?x-http-method-override=` query parameter
to override the HTTP method. For example, these three are equivalent:

```js
fetch("data/new", { method: "DELETE" });
fetch("data/new", { headers: { "X-HTTP-Method-Override": "DELETE" } });
fetch("data/new?x-http-method-override=DELETE");
```

**NOTE:** The method must be in capitals, e.g. `PUT`, `DELETE`, `PATCH`, etc.

<script src="script.js"></script>
