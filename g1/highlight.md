# $.highlight

`$.highlight()` highlights elements when hovering on or clicking another element.

Example:

```html
<div data-bs-toggle="highlight" data-bs-target="a.red" data-classes="active">Link</a>
<div data-bs-toggle="highlight" data-bs-target="a.red" data-classes="active" data-mode="click">Link</a>
<script>
  $('body').highlight({
    classes: 'shadow',
    mode: 'click'
  })
</script>
```


## $.highlight attributes

When we run `$('body').highlight()`, the `body` is called a "container". It
listens to events on "triggers", like `<... data-bs-toggle="highlight">`

Highlight triggers support these attributes:

- `data-bs-toggle="highlight"` indicates that the element acts as a highlighter
- `data-bs-target=` selectors to highlight (required)
- `data-mode="click"` highlights on click. Default: `data-mode="hover"`
- `data-classes=` space-separated class names to toggle on target elements. Default: `active`

Highlight containers support these attributes:

- `data-selector=` is a selector that picks the triggers for highlight. Default: `[data-bs-toggle="highlight"]`
- Any other `data-*` attribute acts as a default `data-*` attribute for the trigger.


## $.highlight events

- `highlight` is fired on the trigger when activated. Attributes:
  - `target`: elements that match the `data-bs-target=` selector
