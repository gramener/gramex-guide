# $.translate

`$.translate()` translates text across languages using an API compatible with
[Gramex translate](https://learn.gramener.com/guide/translate/), which is
based on [Google Translate](https://cloud.google.com/translate/docs/reference/rest).

```html
<div lang="en" lang-target="nl">
  <h1>Hello <em>world</em></h1>
  <p>This is some <em>English</em> text</p>
</div>
<script>
  // Translate text nodes under element with lang-target=
  $("[lang-target]").translate({
    url: "./translate", // The Gramex translate URL endpoint
  });
</script>
```

`$.translate()` translates child text nodes under the selector. For example:

```html
<body>
  <h1>This will be translated</h1>
  <h2>This will also be translated</h2>
</body>
<script>
  $("body").translate({ target: "nl", url: "..." }); // Translates h1, h2 to Dutch (nl)
  $("h1").translate({ target: "de", url: "..." }); // Translates only h1 to German (de)
</script>
```

Each selected element can have only one source and target language. But
different selected elements may have different source and target languages. For
example:

```html
<div lang="en" lang-target="nl">Translate from English to Dutch</div>
<div lang-target="hi">
  Translate from auto-detected source language to Hindi
</div>
<script>
  $("div").translate({ url: "..." }); // Translates as per the description above
</script>
```

## $.translate attributes

Translated nodes can have these attributes:

- `lang-target=` specifies the target language
- `lang=` specifies the source language. Defaults to auto-detect
- `lang-url` specifies the translation URL endpoint

For example:

```html
<!-- Translates from English to Hindi using ./translate?... as the endpoint -->
<p lang="en" lang-target="hi" lang-url="./translate">...</p>
<script>
  $("[lang-target]").translate();
</script>
```

This is the same as

```js
$("p").translate({
  source: "en", // same as lang=
  target: "hi", // same as lang-target=
  url: "./translate", // same as lang-url=
});
```

## $.translate events

Once each translation is done, it fires a `translate` event on each DOM node
that was translated. The event has these attributes:

- `translate`: an array of objects, each with these keys:
  - `q`: the source text
  - `t`: the target text
  - `source`: the source language
  - `target`: the target language
  - `node`: the DOM text node that was translated

For example:

```js
$("[lang-to]")
  .translate()
  .on("translate", function (e) {
    // Triggered on each [lang-to] node
    // e.target is the translated node
    // e.translate[0].q is the first source text
    // e.translate[0].t is the first translated text
    // etc.
  })
  .translate();
```

If the translation results in a HTTP error, it fires an `error` event on each
DOM node that resulted in an error. The event has these attributes:

- `xhr`: the XMLHTTPRequest object
- `request`: the query parameters sent as part of the request
