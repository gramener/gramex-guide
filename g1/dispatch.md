# $.dispatch

Triggers a native JavaScript event. For example:

```js
$('a.action').dispatch('click')
```

sends a click to `a.action`. Like [$.trigger](https://api.jquery.com/trigger/),
but this will fire non-jQuery event handlers as well.

## $.dispatch options

You can add an optional dict as the second parameter. It can have any
[event properties](https://developer.mozilla.org/en-US/docs/Web/API/Event#Properties)
as attributes. For example:

```js
$('a.action').dispatch('click', {bubbles: true, cancelable: false})
```

- bubbles: whether the event bubbles or not. default: true
- cancelable: whether the event is cancelable or not. default: true
- All other `new Event()` options will also work

<!--
Reference: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
-->
