# $.urlfilter

`$.urlfilter()` allows links to *update* URL query parameters instead of replacing them.

Example: Let's say the following HTML is on the page `/?city=NY`.

<!-- render:html -->
```html
<a class="urlfilter" href="?name=John">Add ?name=John to URL</a>
<script>
  $('body').urlfilter()
</script>
```

Clicking on any `.urlfilter` (trigger) in `body` (container) opens
`/?city=NY&name=John`. The `href=` in the `.urlfilter` link *updates* the
current page URL instead of replacing it.

`data-mode` controls the way the URL is updated by the `href`:

| URL    | href      | default    | `data-mode="add"` | `data-mode="toggle"` | `data-mode="del"` |
|--------|-----------|------------|-------------------|----------------------|-------------------|
| `?`    | `?x=1`    | `?x=1`     | `?x=1`            | `?x=1`               | `?`               |
| `?x=1` | `?x=1`    | `?x=1`     | `?x=1&x=1`        | `?`                  | `?`               |
| `?x=1` | `?y=1`    | `?x=1&y=1` | `?x=1&y=1`        | `?x=1&y=1`           | `?x=1`            |
| `?x=1` | `?x=2`    | `?x=2`     | `?x=1&x=2`        | `?x=1&x=2`           | `?x=1`            |

For example:

<!-- render:html -->
```html
<li><a class="urlfilter" href="?city=NY">                        Change ?city= to NY</a></li>
<li><a class="urlfilter" href="?city=NY" data-mode="add">        Add ?city= to NY</a></li>
<li><a class="urlfilter" href="?city=NY" data-mode="del">        Remove NY from ?city=</a></li>
<li><a class="urlfilter" href="?city=NY" data-mode="toggle">     Toggle NY in ?city=</a></li>
<li><a class="urlfilter" href="?city=NY" data-bs-target="pushState">Change ?city= to NY using pushState</a></li>
<li><a class="urlfilter" href="?city=NY" data-bs-target="#">        Change location.hash, i.e. #?city= to NY</a></li>
```

This works with `input`, `select` and `form` elements as well.

<!-- render:html -->
```html
<p><label><input type="checkbox" class="urlfilter" name="a" value="1" data-mode="toggle" data-bs-target="#"> a=1</label></p>
<p>
  <label><input type="radio" class="urlfilter" name="b" value="1" data-bs-target="#"> b=1</label>
  <label><input type="radio" class="urlfilter" name="b" value="2" data-bs-target="#"> b=2</label>
</p>
<p><label><input type="range" class="urlfilter" name="c" data-bs-target="#"> c=</label></p>
<p>
  <select name="d" class="urlfilter" data-bs-target="#">
    <option></option>
    <option>1</option>
    <option>2</option>
  </select>
</p>
<p>
  <form class="urlfilter" data-bs-target="#">
    <input name="x" placeholder="x value">
    <input name="y" placeholder="y value">
    <button name="z" value="z2" type="submit">Submit</button>
  </form>
</p>
```

You can target an IFrame or DOM element to change the URL:

<!-- TODO: check these examples. Not working -->
```html
<p><a class="urlfilter" href="?city=NY" data-bs-target="iframe">Change iframe URL ?city= NY</a></p>
<iframe src="?country=US"></iframe>

<p><a class="urlfilter" href="?city=NY" data-bs-target=".block">   Use AJAX to load ?city=NY into .block</a></p>
<div class="block" src="?country=US"></div>
```


## $.urlfilter attributes

When we run `$('body').urlfilter()`, the `body` is called a "container". It listens to events on "triggers", like `<a class=".urlfilter"...>`

Triggers support these attributes:

- `class="urlfilter"` indicates that this is a trigger
- `href=` updates the page URL with this link
- `data-bs-target` defines the target where the URL is updated:
  - default: updates `window.location`
  - `"pushState"`: updates the current page using pushState
  - `"#"`: updates the `window.location.hash`
  - `".class"`: loads URL into `.class` by updating its `src=` attribute as the base URL
- `data-mode` can be
  - empty - updates existing query key with value
  - `add` - adds a new query key and value
  - `del` - deletes query key. If value exists, only deletes the (key, value) combination
  - `toggle` - toggles the query key and value combination
- `data-remove="true"`: removes query parameters without values. e.g. `?x&y=1` becomes `?y=1`
- `data-src` changes which attribute holds the current URL when `data-bs-target=` is a selector. Default: `src`
- for input fields like checkboxes, an `id` or `name` and the `value` attribute is mandatory. e.g
  `<input type="checkbox" id="checkbox" value="x">` will add `?checkbox=x` to the URL

Containers support these attributes:

- `data-selector` defines the triggers, i.e. which nodes $.urlfilter applies to. Default: `.urlfilter`
- `data-attr` changes which attribute updates the URL. Default: `href`
- You can also specify `data-mode`, `data-remove` and `data-src`, which acts as the default for all triggers.


## $.urlfilter events

- `urlfilter` is fired on the trigger when the URL is changed.
  Note: if the page is reloaded (e.g. if there is no `data-bs-target=`),
  the page is reloaded and the event is lost. Attributes:
  - `url`: the new URL
- `load` is fired on the target when the URL is loaded -- only if the `data-bs-target=` is a selector. Attributes:
  - `url`: the new URL
