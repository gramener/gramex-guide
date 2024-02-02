# g1

`g1` is a micro-framework collection that makes it easy to write front-end data
applications. It's a humble alternative to [Vue.js](https://vuejs.org/),
[AngularJS](https://angularjs.org/) and [React](https://reactjs.org/).

It not a framework -- more a collection of tools that work together. Sort of
like UNIX.

If you need a library to build data applications without a learning curve and
low overhead, g1 may be for you.

## Installation

You can add g1 _and its dependencies_ with a single script tag:

```html
<script src="https://cdn.jsdelivr.net/combine/npm/jquery,npm/lodash,npm/g1"></script>
```

or install it using:

```bash
yarn install jquery lodash g1
# ... OR ...
npm install jquery lodash g1
```

... and add this to your HTML file:

```html
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="node_modules/lodash/lodash.min.js"></script>
<script src="node_modules/g1/dist/g1.min.js"></script>
```

## Render templates

You can create dynamic content from data using templates. To create a template:

1. Write HTML inside `<template>..</template>`.
2. Embed JavaScript inside `<% .. %>` in the template
3. Call [$(el).template(data)](template).

This renders your template with your data. For example:

<!-- render:html -->

```html
<template class="sample">
  <% list.forEach(function(item) { %>
  <div>item <%= item %></div>
  <% }) %>
</template>
<script>
  $("template.sample").template({ list: [1, 2, 3] });
</script>
```

Templates use [lodash](https://lodash.com/docs/#template), which is
plain HTML and JavaScript. You don't need to learn a new template language.

- Anything inside `<% ... %>` is executed as Javascript.
- Anything inside `<%= ... %>` is evaluated and displayed.
- To re-render the template, run `.template()` again with different data.

TODO: show a full-blown example of this.

## URL-based state

Apps shows different content based on what the user requests. A good way to
capture this is to store the requests in the URL. This lets the user bookmark
the page and share the URL. This URL represents the **state** of the app.

For example, `/view=sales&year=2019` may show the sales in year 2019.

### Parse URLs

To parse a URL, use [g1.url.parse](url):

```js
var url = g1.url.parse(location.href);
url.searchKey == { view: "sales", year: "2019" };
```

This can affect what template to render, and what data to render. For example:

```html
<template class="sales">Sales was <%- data %> in <%- q.year %>.</template>
<template class="profit">Profit was <%- data %> in <%- q.year %>.</template>
<script>
  var data = {
    sales: { 2018: 250, 2019: 260 },
    profit: { 2018: 50, 2019: 60 },
  };
  var q = g1.url.parse(location.href).searchKey;
  $("template." + q.view).template({ data: data[q.view][q.year], q: q });
</script>
```

When the URL is `?view=sales&year=2019`, it renders "Sales was 260 in 2019."
When the URL is `?view=profit&year=2018`, it renders "Profit was 50 in 2018."

TODO: show a full-blown example of this.

### Change URL state

To change the state, we change the query. For example:

- `?view=sales&year=2018` changes year to become...
- `?view=sales&year=2019`

We can do this using `<a href="?view=sales&year=2019">`. But we usually change
_only some of the keys_ at a time (e.g. change year to 2019 _without_ changing
`view`.)

[$().urlfilter()](urlfilter) makes this easier.
`<a class="urlfilter" href="?year=2019">` changes _just the year_ to 2019, and
keeps other keys constant.

<!-- render:html -->

```html
<ul>
  <li>
    <a class="urlfilter" href="?view=sales">Set ?view=sales, keep the rest</a>
  </li>
  <li>
    <a class="urlfilter" href="?view=profit">Set ?view=profit, keep the rest</a>
  </li>
  <li>
    <a class="urlfilter" href="?year=2018">Set ?year=2018, keep the rest</a>
  </li>
</ul>
<script>
  $("body").urlfilter(); // activates URL filtering on the entire page
</script>
```

TODO: show a full-blown example of this.

## Single page apps

Changing the URL reloads the page. To build single page apps that don't reload,
you can store the state in the location hash, like `/#?view=sales&year=2019`.

To make [$().urlfilter()](urlfilter) update the hash (instead of the query),
use `$('body').urlfilter({target: '#'})`.

To listen to hash change events, use [$(window).urlchange()](urlchange).
For example:

```js
$(window)
  .on("#?view", function (e, view) {
    console.log("view is", view);
  })
  .on("#?year", function (e, year) {
    console.log("year is", year);
  })
  .on("#", function (e, url) {
    console.log("hash is", url);
  });
```

TODO: show a full-blown example of this.

### Virtual DOM

Normally, re-rendering a template deletes the content and re-creates the DOM
elements. But if you use `<template data-engine="vdom">`, it only updates
changed elements. This has 3 advantages:

- You can use CSS to animate the changes
- Any events bound to the DOM elements are preserved
- The DOM updates faster

TODO: show a full-blown example of this.

## Interactions

- [$.urlfilter](urlfilter) changes URL queries when clicked. Used to filter data.
- [$.urlchange](urlchange) listens to hash changes and routes events
- [$.search](search) highlights elements as you type in a search box
- [$.highlight](highlight) toggles classes on elements when clicked or hover

## Components

- [$.formhandler](formhandler) renders a HTML table from a [FormHandler URL](https://learn.gramener.com/guide/formhandler/)
- [$.template](template) renders lodash templates. Requires [lodash](https://lodash.com/)
- [$.dropdown](dropdown) renders a Bootstrap dropdown. Requires [Bootstrap](https://getbootstrap.com/docs/4.2/)
- [$.translate](translate) translates text to other languages using [Gramex translate](https://learn.gramener.com/guide/translate/)
- [g1.sanddance](sanddance) moves DOM elements smoothly based on data
- [g1.mapviewer](mapviewer) renders leaflet maps and simplifies adding layers from data.
  - Note: Mapviewer is not included in [g1.min.js](../ui/g1/dist/g1.min.js). Include [mapviewer.min.js](../ui/g1/dist/mapviewer.min.js)

## Utilities

- [g1.url.parse](url) parses a URL into a structured object
  - [url.join](url#urljoin) joins two URLs
  - [url.update](url#urlupdate) updates a URL's query parameters
- [g1.fuzzysearch](fuzzysearch) searches for text with fuzzy matching
- [$.ajaxchain](ajaxchain) chains AJAX requests, loading multiple items in sequence
- [L.TopoJSON](topojson) loads TopoJSON files just like GeoJSON. Requires [topojson](https://github.com/topojson/topojson)
- [$.dispatch](dispatch) is like [trigger](https://api.jquery.com/trigger/) but sends a native event (triggers non-jQuery events too)
- [g1.datafilter](datafilter) filters the data based on the options
- [g1.types](types) returns the data types of columns in a DataFrames

## Libraries

You can import either [g1.min.js](../ui/g1/dist/g1.min.js) -- which has all of these functions --
or one of the individual libraries below:

- [ajax.min.js](../ui/g1/dist/ajax.min.js)
- [datafilter.min.js](../ui/g1/dist/datafilter.min.js)
- [event.min.js](../ui/g1/dist/event.min.js)
- [formhandler.min.js](../ui/g1/dist/formhandler.min.js)
- [highlight.min.js](../ui/g1/dist/highlight.min.js)
- [leaflet.min.js](../ui/g1/dist/leaflet.min.js)
- [sanddance.min.js](../ui/g1/dist/sanddance.min.js)
- [search.min.js](../ui/g1/dist/search.min.js)
- [template.min.js](../ui/g1/dist/template.min.js)
- [translate.min.js](../ui/g1/dist/translate.min.js)
- [types.min.js](../ui/g1/dist/types.min.js)
- [urlchange.min.js](../ui/g1/dist/urlchange.min.js)
- [urlfilter.min.js](../ui/g1/dist/urlfilter.min.js)

[mapviewer.min.js](../ui/g1/dist/mapviewer.min.js) is not part of [g1.min.js](../ui/g1/dist/g1.min.js).

For debugging, use [dist/g1.js](../ui/g1/dist/g1.js) -- an un-minified version.
