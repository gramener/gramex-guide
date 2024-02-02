# $.ajaxchain

Chains AJAX requests. [$.ajax][ajax] fetches a single page, like this:

```js
$.ajax({
  url: "formhandler", // Fetch "formhandler" URL
  data: { _offset: 0 }, //    with ?_offset=0
});
```

`$.ajaxchain` keeps fetching more page using a `chain:` function.

```js
var ajaxchain_instance = $.ajaxchain({
  url: 'formhandler',                           // Fetch "formhandler" URL
  data: {_offset: 0, _limit: 10},               //    with ?_offset=0&_limit=10
  chain: function(response, request) {          // When the response is retrieved
    if (response.length > 0)                    //    if the response is non-empty
      return {data: {_offset: request.data._offset + 10}    //    fetch the next page
  },
  limit: 10,                                    // Get at most 10 pages (default)
  // any other $.ajax options can be passed
})
```

The flow when `$.ajaxchain(request)` is called is:

1. Fetch URL using [$.ajax][ajax] using the request options
2. If the page limit is not reached, call the `.chain(response, request, xhr)` function.
   - `request` is the request sent to [$.ajax][ajax]
   - `response` is the response from [$.ajax][ajax]
   - `xhr` is the [jqXHR][jqxhr] object
3. If `.chain()` returns a non-empty object
   - update the `request` with the response of `.chain()`
   - call `$.ajaxchain(request)` with the new request
   - Otherwise, stop.

## $.ajaxchain options

`$.ajaxchain()` accepts the same options as [$.ajax][ajax] with a few additional options:

- `chain`: a function that returns updates to the request object
- `limit`: the maximum number of pages to fetch

The `chain:` function can be used with [FormHandler](https://learn.gramener.com/guide/formhandler/).

```js
  chain: function(response, request) {
    if (response.length > 0)                              // If the response is not empty
      return {data: {_offset: request.data._offset + 10}}   // Fetch the next page
  }
```

You can use a set of pre-defined helper functions for chaining:

- `chain: $.ajaxchain.list()` chains a list of URLs.
  - `chain: $.ajaxchain.list([url1, url2, url3])` fetches `url1`, `url2` and `url3` one after another
- `chain: $.ajaxchain.cursor(target, source)` uses a page cursor or token to identify the next page
  - Requires [lodash](https://lodash.com/)
  - The `source` is the [object path](https://lodash.com/docs/#get) from the
    response that has the next cursor value. For example: `a.b` means `response.a.b`
  - The `target` is the update to be made to the `request`. For example,
    `data.token` sets `?token=`. `headers.X-Token` sets the `X-Token` header.
  - Google APIs like [YouTube PlaylistItems](https://developers.google.com/youtube/v3/docs/playlistItems/list)
    can use `chain: $.ajaxchain.cursor('data.pageToken', 'nextPageToken')`.
    It fetches the next URL with `?pageToken=` as the `nextPageToken` key from the response.
  - [Twitter APIs](https://developer.twitter.com/en/docs/ads/general/guides/pagination.html)
    can use `chain: $.ajaxchain.cursor('data.cursor', 'next_cursor')`
  - [Facebook APIs](https://developers.facebook.com/docs/graph-api/using-graph-api/#paging)
    can use `chain: $.ajaxchain.cursor('url', 'paging.next')`

You can also construct your own `chain:` functions. For example:

On [YouTube](https://developers.google.com/youtube/v3/docs/playlistItems/list):

```js
  chain: function(response, request) {
    if (response.nextPageToken)
      return {data: {pageToken: response.textPageToken}}
  }
```

If the results are at `/page/1`, `/page/2`, etc:

```js
  url: `/page/1`,
  chain: function(response, request) {
    if (response.length > 0)
      return {url: `/page/` + (+request.url.split('/')[-1] + 1)}
  }
```

## $.ajaxchain events

To access the response, we can use the `ajaxchain_instance` events. There are 3 events:

- `done` is fired when ALL pages have been loaded. Event attributes are:
  - `response`: list of responses returned by each [$.ajax][ajax] request
  - `request`: list of requests passed to each [$.ajax][ajax]
- `load` is fired when each page is loaded. Event attributes are:
  - `request`: the parameters passed to [$.ajax][ajax] request
  - `response`: data returned by [$.ajax][ajax] request
  - `xhr`: the [jqXHR][jqxhr] object
- `error` is fired when there is an error. Event attributes are:
  - `request`: the parameters passed to [$.ajax][ajax] request that failed
  - `xhr`: the [jqXHR][jqxhr] object that failed
  - `exception`: any exception thrown when calling the `chain` function

For example:

```js
ajaxchain_instance
  .on("done", function (e) {
    // Called after ALL pages are loaded, or on error
    // Responses are in e.response[0], e.response[1], etc
    // Requests  are in e.request[0],  e.request[1],  etc
  })
  .on("load", function (e) {
    // Called when each page is loaded
    // e.response has the response
    // e.request  has the request
  })
  .on("error", function (e) {
    // Called when there's an error
    // e.request  has the request
    // e.exception is set if the .change() function threw an exception
  });
```

[ajax]: http://api.jquery.com/jQuery.ajax/
[jqxhr]: http://api.jquery.com/Types/#jqXHR
