---
title: Capturing State
prefix: State
---

Capture the state of the application in the URL. All Gramex apps use this approach. This makes it easy to:

- **Understand** what the URL does.
- **Share** the page. They can see the same state as you.
- **Bookmark** the page. You can come back to the same state later.

Do not use the URL to capture state if:

- The URL has **secret** information (e.g. API keys). This is a security risk.
- The URL is **too long** (e.g. too many filters). This looks ugly (but otherwise harmless.)

## Use form-encoding to capture state

When the user performs an action capture the state as form-encoded URL query. For example:

- User selects the city Rome. The query is `city=Rome`
- User adds Olso. The query becomes `city=Rome&city=Olso`
- User selects a checkbox "Top 10 cities". The query becomes `city=Rome&city=Olso&top=10`

You can use the [@gramex/url](https://www.npmjs.com/package/@gramex/url) package to encode/decode state:

```html
<script src="https://cdn.jsdelivr.net/npm/@gramex/url/url.min.js"><script>
<script>
const query = gramex.url.encode({city: ['Rome', 'Oslo'], top: 10})
const state = gramex.url.decode(query)
</script>
```

If you only have single values for keys, use [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams):

```js
const query = (new URLSearchParams({city: 'Rome', top: 10})).toString()
const state = Object.fromEntries(new URLSearchParams(query))
```

## Store state as a search string

**To reload your page** on every action, add the state after a `?`. For example, `/page?city=Rome&top=10`.

[HTML forms](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) do this automatically. For example, submitting this form will reload the page with `?city=Rome&top=10` added.

```html
<form>
  <label>City: <input name="city" value="Rome"></label>
  <label>Top: <input name="top" value="10"></label>
  <button type="submit">Submit</button>
</form>
```

Use [`window.location.search`](https://developer.mozilla.org/en-US/docs/Web/API/Location/search) to reload the page with the new state:

```js
const query = (new URLSearchParams({city: 'Rome', top: 10})).toString()
window.location.search = query
// This will immediately reload the page with ?city=Rome&top=10
```

On page load, you can access the query via `window.location.search`:

```js
const query = window.location.search
const state = Object.fromEntries(new URLSearchParams(query))
// Now do what you want with the state, e.g. update the page filters
```

## Store state as a hash

**To update your page without reloading**, add the state after a `#?`. For example, `/page#?city=Rome&top=10`.

Use [`window.location.hash`](https://developer.mozilla.org/en-US/docs/Web/API/Location/hash) to update the page without reloading:

```js
window.addEventListener('hashchange', function() {
  const query = window.location.hash.slice(2)
  const state = Object.fromEntries(new URLSearchParams(query))
  // Now do what you want with the state, e.g. update the page filters
})
const query = (new URLSearchParams({city: 'Rome', top: 10})).toString()
window.location.hash = '?' + query
```
