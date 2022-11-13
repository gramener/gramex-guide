# $.template

`$(selector).template()` renders HTML templates with JavaScript mixed inside them.

Example:

```html
<template>Your platform is <%= navigator.userAgent %></template>
<script>
  $('body').template()
</script>
```

renders all `template` or `script[type="text/html"]` elements as
[lodash templates](https://lodash.com/docs/#template).
This displays `Your platform is ...` and shows the userAgent just below the script tag.

- Anything inside `<% ... %>` is executed as Javascript.
- Anything inside `<%= ... %>` is evaluated and rendered in-place.

Notes:

- `<template>` tag is not supported by Internet Explorer. Use
  `<script type="text/html">` for IE compatibility.
- `<template>` requires valid HTML. `<a <%= classes %>>` is invalid HTML since
  it contains `<` inside a tag. Use `<script type="text/html">` in such cases.


## $.template variables

Templates can access any global variable. You can pass additional variables
using as `.template({var1: value, var2: value, ...})`. For example:

<!-- render:html -->
```html
<template class="sample">
  <% list.forEach(function(item) { %>
    <div><%= item %></div>
  <% }) %>
</template>
<script>
  $('.sample').template({list: ['a', 'b', 'c']})
</script>
```

To re-render the template, run `.template(data)` again with different data.

Templates can also use these default variables:

- `obj`: the full data object passed to the template
- `$node`: the generating `<template>` element as a jQuery object
  - `$node.attr('class')` returns the class of the template
  - `$node.data('key')` returns `data-key` in `<template data-key="...">`
- `$data`: a shortcut for `$node.data()`.
  `$data.key` is the same as `$node.data('key')`

If you pass `obj`, `$node` or `$data` explicitly to `.template({...})`, it
overrides the default variables. The values you pass take priority.

You can pass any JSON object as a data attribute. In the example below,
`data-list` and `data-obj` are interpreted as JSON objects:

<!-- render:html -->
```html
<template class="datavar" data-list="[1,2,3]" data-obj="{x:1,y:[2,3]}">
  list = <%= JSON.stringify($data.list) %>,
  obj = <%= JSON.stringify($data.obj) %>,
</template>
<script>
  $('.datavar').template()
</script>
```

This is particularly useful with [external sources](#template-external-source).
For example, using an external [datavars.html](datavars.html) template:

<!-- render:html -->
```html
<template class="datavars" src="datavars.html" data-x="[1,2]"></template>
<template class="datavars" src="datavars.html" data-x="[3,4,5]"></template>
<script>
  $('.datavars').template()
</script>
```


## $.template subtemplates

You can use sub-templates as follows:

<!-- render:html -->
```html
<template class="row" data-bs-target="false">
  <li class="<%- classes %>"><a href="<%- link  %>"><%- text %></a></li>
</template>
<template class="main-template" data-template-item=".row">
  <ul>
    <%= item({classes: "active", link: '..', text: 'Parent'}) %>
    <%= item({classes: "", link: '.', text: 'Current'}) %>
  </ul>
</template>
<script>
  $('.main-template').template()
</script>
```

`data-bs-target="false"` ensures that the template `.row` is not rendered.
(This is typically used by sub-templates.)

`data-template-item=".row"` creates a function `item()` inside `.main-template`.
Calling `item()` renders `.row` as a sub-template.


**Notes**:

- The sub-template `name` in `data-template-<name>` can only contain
  lowercase letters, numbers and underscore.
- Sub-templates may themselves depend on, and call, other sub-templates.
- Sub-templates require a [Promise polyfill](https://www.npmjs.com/package/es6-promise) for IE.

Sub-templates can be from an [external source](#template-external-source) as
well. For example, this sub-template is loaded from `heading.html`:

```html
<template class="tmpl-head" src="heading.html" data-bs-target="false"></template>
<template class="main-template" data-template-header=".tmpl-head">
  <%= header({title: "Page title"}) %>
</template>
```


## $.template animation

When using `type="text/html"`, templates are re-rendered. To *update* existing
elements, use `data-engine="vdom"` instead. This only changes attributes or
elements that need change. This allows us to animate attributes via CSS.

You need to include [morphdom](https://github.com/patrick-steele-idem/morphdom)
for this to work.

For example, this shows a circle in SVG bouncing around smoothly.

<!-- render:html -->
```html
<style>
  circle { transition: all 1s ease; }
</style>
<script src="../../ui/morphdom/dist/morphdom-umd.min.js"></script>
<script type="text/html" data-engine="vdom" class="bouncing-ball">
  <svg width="500" height="50">
    <circle cx="<%= x %>" cy="<%= y %>" r="5" fill="red"></circle>
  </svg>
</script>
<script>
  setInterval(function() {
    var x = Math.random() * 500
    var y = Math.random() * 50
    $('.bouncing-ball').template({x: x, y: y})    // Update the template to animate
  }, 1000)
</script>
```

You can also specify a `data-engine` via an option. For example:

```js
$('.animate').template(data, {engine: 'vdom'})
```


## $.template targets

To re-use the template or render the same template on a different DOM node,
run `.template(data, {target: selector})`. This allows you to declare templates
once and apply them across the body. For example:

<!-- render:html -->
```html
<div class="panel1 bg-primary text-white px-3"></div>
<div class="panel2 bg-success text-white px-3"></div>
<script type="text/html" class="targeted">
  The same template is rendered in <%- heading %>
</script>
<script>
$('.targeted')
    .template({heading: 'panel 1'}, {target: '.panel1'})
    .template({heading: 'panel 2'}, {target: '.panel2'})
</script>
```

The target can also be specified via a `data-bs-target=".panel1"` on the script
template. This is the same as specifying `{target: '.panel'}`. For example:

```html
<script class="chart" data-bs-target=".panel1">...</script>
<script class="chart" data-bs-target=".panel2">...</script>
```


## $.template append

To append instead of replacing, use `data-append="true"`. Every time `.template`
is called, it appends rather than replaces. For example:

<!-- render:html -->
```html
<script type="text/html" class="list" data-append="true">
  <li>New item #<%- n %> appended</li>
</script>
<script>
$('.list')
  .template({n: 1})
  .template({n: 2})
</script>
```

You can also specify this as `.template(data, {append: true})`. You can also
append to an [existing target](#template-targets). For example:

<!-- render:html -->
```html
<ul class="existing-list">
  <li>Existing item</li>
  <!-- Every time .template() is called, the result is added as a list item here -->
</ul>
<script>
$('.list')
    .template({n: 1}, {append: true, target: '.existing-list'})
    .template({n: 2}, {append: true, target: '.existing-list'})
</script>
```

## $.template external source

Template containers can have an `src=` attribute that loads the template from a file:

<!-- render:html -->
```html
<script type="text/html" src="template.html" class="source"></script>
<script>
  $('.source').template()
</script>
```

If the `src=` URL returns a HTTP error, the HTML *inside* the script is rendered
as a template. The template can use:

- all data passed by the `$().template()` function, and
- an [xhr](http://api.jquery.com/Types/#jqXHR) object - which has error details.

For example:

<!-- render:html -->
```html
<script type="text/html" src="missing.html" class="missing">
  Template returned HTTP error code: <%= xhr.status %>.
  Data is <%= data %>
</script>
<script>
  $('.missing').template({data: [1, 2, 3]})
</script>
```

## $.template selector

`$(...).template()` renders all `script[type="text/html"]` nodes in or under the
selected node. Use `data-selector=` attribute to change the selector. For
example:

<!-- render:html -->
```html
<section data-selector=".render">
  <script type="text/html" class="no-render">This will not render</script>
  <script type="text/html" class="render">This will render</script>
</section>
<script>
  $('section[data-selector]').template()
</script>
```

You can also use the `selector: ...` option. For example:

<!-- render:html -->
```html
<div class="selector-target"></div>
<script type="text/html" class="try no-render">This will not render</script>
<script type="text/html" class="try render">This will render</script>
<script>
  $('.try').template({}, {selector: '.render', target: '.selector-target'})
</script>
```


## $.template dispose

Deletes the output of a rendered template, use `$('...').template('dispose')`.
This removes the DOM elements last created by the template.

This is useful for deleting error messages or previous output that's no longer
relevant.

```js
  $.getJSON('data').then(function (data) {
    // When we get data, show the dashboard, dispose any previous error
    $('.dashboard').template({ data: data })
    $('.error').template('dispose')
  }).fail(function (xhr, error, msg) {
    // If there's an error, dispose any previous dashboard, show the error
    $('.dashboard').template('dispose')
    $('.error').template({ error: msg })
  })
```

When [appending](#template-append), this only deletes the last rendered
template. But this behavior may change.


## $.template events

When a template is rendered or disposed, `template` is fired on the source. Attributes:

- `templatedata`: the passed data argument (e.g. `{...}`, `'dispose'`)
- `target`: the target nodes rendered or disposed (if any), as a jQuery object

For example:

<!-- render:html -->
```html
<script type="text/html" class="event">
  <pre>Event e.templatedata = <span class="data">filled by event handler</span></pre>
</script>
<script>
$('.event')
  .on('template', function(e) {       // When the template is rendered,
    e.target.find('.data')            // find the .data class inside target nodes
      .html(JSON.stringify(e.templatedata)) // and enter the template data
  })
  .template({x: 1})                   // Trigger template AFTER .on('template')
</script>
```
