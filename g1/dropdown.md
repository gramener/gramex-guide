# $.dropdown

`$.dropdown()` creates dropdowns that integrate well with
[$.urlfilter](#urlfilter) and [$.urlchange](#urlchange).

It requires the [bootstrap-select](https://developer.snapappointments.com/bootstrap-select/)
library and its dependencies.

```html
  <link rel="stylesheet" href="ui/bootstrap-select/dist/css/bootstrap-select.min.css">
  <script src="ui/bootstrap-select/dist/js/bootstrap-select.min.js"></script>
```

Example:

```html
<div class="container1"></div>
<script>
  $('.container1').dropdown({data: ['Red', 'Green', 'Blue'] })
</script>
```

This renders a dropdown with 3 options -- Red, Green, Blue.

```html
<div class="container2"></div>
<script>
  $('.container2').dropdown({ key: 'colors', data: ['Red', 'Green', 'Blue'] })
</script>
```

`key` enables urlfilter for dropdown. If Red option is selected from dropdown, URL is appended with `?colors=Red`

If the labels are different from the values, you can use a list of
`{value: ..., label: ...}` objects.

```html
<div class="dropdown-object"></div>
<script>
  $('.dropdown-object').dropdown({
    data: [{ label: 'Red', value: 1 }, { label: 'Green', value: 2 }]
  ])
</script>
```

The data objects need not use `label:` and `value:` as keys. You can pick any
other key using the `label:` and `value:` options.

```html
<div class="dropdown-object"></div>
<script>
  $('.dropdown-object').dropdown({
    data: [{ x: 'Red', y: 1 }, { x: 'Green', y: 2 }],
    label_key: 'x',   // use data[*].x as the label, instead of data[*].label
    value_key: 'y'    // use data[*].y as the value, instead of data[*].value
  ])
</script>
```

You can set the default value of the dropdown using the `value:` key.

```html
<div class="dropdown-default"></div>
<script>
$('.dropdown-default').dropdown({
  key: 'colors',
  data: ['Red', 'Green', 'Blue'],
  value: $('#color').val(url.searchKey.city)    // Must match data string or .value
})
</script>
```

By default, the selected dropdown values are appended to URL query string. To append to the hash instead, use `target: '#'`.

```html
<div class="container3"></div>
<script>
  $('.container3').dropdown({
    key: 'colors',
    data: ['Red', 'Green', 'Blue'],
    target: '#'
  })
</script>
```

To change URL without reloading the page, use `target: 'pushState'`.

```html
<div class="container4"></div>
<script>
  $('.container4').dropdown(
    { key: 'colors',
      data: ['Red', 'Green', 'Blue'],
      target: 'pushState'
    })
</script>
```

To use bootstrap-select options, use `options:`

```html
<div class="container5"></div>
<script>
  $('.container5').dropdown({
    data: ['Red', 'Green', 'Blue'], key: 'colors',
    options: {
      style: 'btn-primary',
      liveSearch: true
    }
  })
</script>
```


## $.dropdown options

- `data`: Array of values. Values may be strings, or objects. Objects have keys:
  - `label`: text to display in the dropdown
  - `value`: value to submit when item is selected
- `value`: default selected value. This must match the `value` key in the `data` object
- `url`: End point that returns the `data`. If `data:` is also given, `data` takes priority.
- `target`: defines how URL is updated. Can be `''` (Default), `#` or `pushState`
- `key`: key with which URL is updated.
- `value_key`: name of the key that defines the value in `data:` objects. Default: `"value"`
- `label_key`: name of the key that defines the label in `data:` objects. Default: `"label"`
- `multiple`: To render a dropdown that supports multi-select. Can be `true` or `false` (Default).
- `options`: Supports same options as [bootstrap-select options](https://developer.snapappointments.com/bootstrap-select/options/)


## $.dropdown events

- `load` is triggered after dropdown is rendered
- `change` is triggered whenever dropdown value is changed

```html
<div class="container6"></div>
<script>
  $('.container6')
  .on('load', function() {
    // Your code here
  })
  .on('change', function() {
    // Your code here
  })
  .dropdown({
    key: 'colors',
    data: ['Red', 'Green', 'Blue']
  })
</script>
```
