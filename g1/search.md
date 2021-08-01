# $.search

`$.search()` hides or shows matching elements as the user types in a search box.

In this example, searching in the text box highlights the matching elements in the list.

```html
<input type="search" data-search="@text" data-target=".list .item" data-hide-class="d-none">
<ul class="list">
  <li class="item">First item</li>
  <li class="item">Second item</li>
  <li class="item">Third item</li>
</ul>
<script>
  $('body').search()
</script>
```


## $.search attributes

When we run `$('body').search()`, the `body` is called a "container". It
listens to events on "triggers", like `<... data-search="...">`

Search triggers support these attributes:

- `data-search=` identifies the attribute that will be searched.
  - `data-search="@text"` searches the text inside target elements
  - `data-search="title"` searches the `title` attribute of target elements
  - `data-search="data-text"` searches the `data-title` attribute of target elements
  - ... and so on
- `data-target=` is a selector that picks target elements. Example:
  `data-target=".item"` searches within all `item` classes
- `data-hide-class=` adds classes elements not matching the search. Example:
  `data-hide-class="d-none"` adds a `d-none` class to all non-matching items.
  This is useful to hide non-matches.
- `data-show-class=` adds classes elements matching elements. Example:
  `data-hide-class="bg-success"` adds a `bg-success` class to all matching items.
  This is useful to highlight matches.

<!--
TODO: Document
- `data-transform="strip"`
- `data-change="words"`
-->

Search containers support these attributes:

- `data-selector=` is a selector that picks the triggers for search. Default: `[data-search]`
- Any other `data-*` attribute acts as a default `data-*` attribute for the trigger.

## $.search events

- `shown` is fired on the trigger when activated. Attributes:
  - `searchText`: the original search keyword
  - `search`: the transformed search used
  - `matches`: the number of shown nodes (same as `results.length`)
  - `results`: the list of target nodes searched. (Some are shown, some hidden)
- `refresh` can be fired on the trigger to refresh search cache. The DOM is
  slow. We cache search text. Run `$(input_to_be_refreshed).trigger('refresh')`
  to refresh the cache.
- `search` can be fired on the trigger if the DOM changes, and you need to
  re-run the same search. Run `$(input_to_be_refreshed).trigger('search')`.
  Note: `.trigger('change')` and `.dispatch('change')` won't work because the
  code will refuse to search again since the query has not changed.
