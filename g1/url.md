# g1.url

`g1.url` provides URL manipulation utilities.

## g1.url.parse

`g1.url.parse(url_string)` parses a URL into an object mostly compatible with
[URL](https://developer.mozilla.org/en-US/docs/Web/API/URL), and with a few
additional features.

## url attributes

```js
var url = g1.url.parse("https://user:pwd@example.com:80/~folder/subfolder/filename.html?a=1&a=2&b=3%2E&d#hash")
```

This parses the URL and returns an object with the following attributes matching `window.location`:

| Attribute  | Value                              |
|------------|------------------------------------|
| `href`     | the original URL                   |
| `protocol` | `https`                            |
| `origin`   | `user:pwd@example.com:80`          |
| `username` | `user`                             |
| `password` | `pwd`                              |
| `hostname` | `example.com`                      |
| `port`     | `80`                               |
| `pathname` | `folder/subfolder/filename.html`   |
| `search`   | `a=1&a=2&b=3%2E&d`                 |
| `hash`     | `hash`                             |

... and additional attributes:

| Attribute    | Value                                                  |
|--------------|--------------------------------------------------------|
| `userinfo`   | `user:pwd`                                             |
| `relative`   | `folder/subfolder/filename.html?a=1&a=2&b=3%2E&d#hash` |
| `directory`  | `folder/subfolder/`                                    |
| `file`       | `filename.html`                                        |
| `searchKey`  | `{'a:'2', b:'3.', d:''}`                               |
| `searchList` | `{'a:['1', '2'], b:['3.'], d:['']}`                    |

It can also parse URL query strings.

```js
var url = g1.url.parse('?a=1&a=2&b=3%2E&d#hash')
```

| Attribute    | Value                            |
|--------------|----------------------------------|
| `search`     | `a=1&a=2&b=3%2E&d`               |
| `hash`       | `hash`                           |
| `searchKey`  | `{a:'2', b:'3.', d:''}`          |
| `searchList` | `a:['1', '2'], b:['3.'], d:['']` |

These attributes are **not mutable**. To change the URL, use
[url.join](#urljoin) or [url.update](#urlupdate).

## url.toString

The url object has a `.toString()` method that converts the object back into a
string.

## url.join

```js
var url = url.join(another_url)
```

updates the `url` with the attributes from `another_url`. For example:

| url                    | joined with          | gives                      |
|------------------------|----------------------|----------------------------|
| `/path/p`              | `a/b/c`              | `/path/a/b/c`              |
| `/path/p/q/`           | `../a/..`            | `/path/p/`                 |
| `http://host1/p`       | `http://host2/q`     | `http://host2/q`           |
| `https://a:b@host1/p`  | `//c:d@host2/q?x=1`  | `https://c:d@host2/q?x=1`  |
| `/path/p?b=1`          | `./?a=1#top`         | `/path/?a=1#top`           |

`.join()` updates the query parameters and hash fragment as well. To prevent this, use:

```js
url.join(another_url, {query: false, hash: false})
```

For example:

```js
g1.url.parse('/').join('/?x=1#y=1', {hash: false}).toString() == '/?x=1'
g1.url.parse('/').join('/?x=1#y=1', {query: false}).toString() == '/#y=1'
```


## url.update

```js
var url = url.update(object)
```

updates the `url` query parameters with the attributes from `object`. For example:

| url          | updated with         | gives                 |
|--------------|----------------------|-----------------------|
| `/`          | `{a:1}`              | `/?a=1`               |
| `/?a=1&b=2`  | `{b:3, a:4, c:''}`   | `/?a=4&b=3&c=`        |
| `/?a=1&b=2`  | `{a:null}`           | `/?b=2`               |
| `/?a=1&b=2`  | `{a:[3,4], b:[4,5]}` | `/?a=3&a=4&b=4&b=5`   |

By default, it *updates* the query parameters. But:

- `url.update(object, 'add')` *adds* the query parameters instead of updating
- `url.update(object, 'del')` *deletes* the query parameters instead of updating
- `url.update(object, 'toggle')` *toggles* the query parameters (i.e. adds if missing, deletes if present)

For example:

| url                 | updated with         | in mode             | gives                 |
|---------------------|----------------------|---------------------|-----------------------|
| `/?a=1&a=2`         | `{a:3, b:1}`         | `add`               | `/?a=1&a=2&a=3&b=1`   |
| `/?a=1&a=2'`        | `{a:[3,4]}`          | `add`               | `/?a=1&a=2&a=3&a=4`   |
| `/?a=1&a=2&b=1`     | `{a:2, b:2}`         | `del`               | `/?a=1&b=1`           |
| `/?a=1&a=2&b=1`     | `{a:[1,4]}`          | `del`               | `/?a=2&b=1`           |
| `/?a=1&a=2`         | `{a:1, b:1}`         | `toggle`            | `/?a=2&b=1`           |
| `/?a=1&a=2&b=1&b=2` | `{a:[2,3], b:[1,3]}` | `toggle`            | `/?a=1&a=3&b=2&b=3`   |

You can specify different modes for different query parameters.


```js
g1.url.parse('/?a=1&b=2&c=3&d=4')       // Update this URL
  .update({a:1, b:[2,3], c:6, d:7},     // With this object
          'a=del&b=toggle&c=add')       // Delete ?a, Toggle ?b, Add ?c, Update ?d
// Returns /?b=3&c=3&c=6&d=7
```
