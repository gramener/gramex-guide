# $.urlchange

`$.urlchange()` triggers custom events when the URL changes. This makes it easy
to build URL-driven applications.

Suppose we have buttons that sort based on "City" or "Sales". These are usually
bound directly to DOM events like this:

```html
<!-- DO NOT DO THIS -- this example shows a BAD practice -->
<button class="sort">City</button>
<button class="sort">Sales</button>
<script>
  $('.sort').on('click', function(e) { action($(this).text()) })
</script>
```

**Problem**: In the example above, the sort is lost when the page is reloaded.

**Solution**: DOM events should not trigger actions directly. DOM events should
change the URL like this:

```html
<button href="?_sort=City" class="urlfilter" target="#">City</button>
<button href="?_sort=Sales" class="urlfilter" target="#">Sales</button>
<script>
  $('body').urlfilter()
</script>
```

Now, changes in the URL should trigger actions:

```js
$(window)
  .on('#?city', function(e, city) { action(city) })   // Listen to #? events
  .urlchange()                                        // Enable these events
```

Examples:

- `#?x=1` triggers 3 events on `window`:
  - `.on('#', function(e) { e.hash.searchKey.x == '1' }`
  - `.on('#?', function(e) { e.hash.searchKey.x == '1' }`
  - `.on('#?x', function(e, val) { val == '1' && && e.old == [] })`
- When the URL changes from `#?x=1` to `#?x=1&y=2`, it triggers 3 events on `window`:
  - `.on('#', function(e) { e.hash.searchKey == {x: '1', y: '2'} }`
  - `.on('#?', function(e) { e.hash.searchKey == {x: '1', y: '2'} }`
  - `.on('#?y', function(e, val) { val == '2' && e.old == [] })`
  - No `#?x` event is fired, since x has not changed
- When the URL changes from `#?x=1` to `#?x=1&x=2`, it triggers 3 events on `window`:
  - `.on('#', function(e) { e.hash.searchKey == {x: '1', y: '2'} }`
  - `.on('#?', function(e) { e.hash.searchKey == {x: '1', y: '2'} }`
  - `.on('#?x', function(e, val) { val == '1' && && e.old == ['1'] })`
  - The `#?x` event is fired since x has a new value
- When the URL changes from `#a` to `#b`, it triggers 2 events on `window`:
  - `.on('#', function(e) { e.hash.pathname == 'b' }`
  - `.on('#/', function(e, val) { val == 'b' && e.old == 'a' }`
- Combinations of keys can be listened to simultaneously
  - `.on('#?x #?y', function(e){})` will only be triggered if both x and y change
- When the hashkey is reset, `location.hash=''`
  - `.on('#', function(e){})` as the location.hash is now `{}`


## $.urlchange events

- `.on('#', function(e, val) {}` is fired when any part of the URL hash changes.
  - `val` is the changed hash as a [URL](#urlparse) object
  - `e.change` is a dict with the changed key-values
    For example, if the hash changes from `#a?x=1&y=1` to `#b?x=1&y=2`,
    then `change={'/':'b', 'y': ['2']}`
  - `e.hash` is the [parsed URL hash](#urlparse) object
  - `e.old` is the previous [parsed URL hash](#urlparse) object
- `.on('#?', function(e, val) {}` is fired when *any* URL hash **key** changes.
  - `val` is the changed hash as a [URL](#urlparse) object
  - `e.change` is a dict with the changed key-values
  - `e.hash` is the [parsed URL hash](#urlparse) object
  - `e.old` is the previous [parsed URL hash](#urlparse) object
- `.on('#/', function(e, val) {}` is fired when the URL hash **path** changes.
  - `val` is the changed path
  - `e.hash` is the [parsed URL hash](#urlparse) object
  - `e.old` is the previous [parsed URL hash](#urlparse) object
- `.on('#?<key>', function(e, val) {}` is fired when the specified URL hash **key** changes.
  - `val` is the changed hash value
  - `e.vals` is the list of new hash values -- same as `e.hash.searchList[<key>]`
  - `e.hash` is the [parsed URL hash](#urlparse) object
  - `e.old` is the previous [parsed URL hash](#urlparse) object
