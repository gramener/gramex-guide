---
title: Websockets in Gramex
prefix: Tip
...

We can use websockets to persist bidirectional connections with server. [WebSocketHandler docs](https://learn.gramener.com/guide/websockethandler/).

## How to use websockets

Useful for real-time applications: insights or feed or data extraction, chat bots.

Gramex supports Websockets - YAML

```yaml
url:
  ws/load:
    pattern: /$YAMLURL/ws
    handler: WebSocketHandler
    kwargs:
        open:
            function: app.ws_open
        on_message:
            function: app.ws_on_message
        on_close:
            function: app.close
        auth: true
```

## Send a websocket request

```js
protocols = {http: 'ws://', https: 'wss://'}
ws = new WebSocket(protocols[window.location.protocol] + window.location.hostname + ":+ window.location.port + "/ws")

ws.onopen = function() {
  // your code
}

ws.onmessage = function() {
  // your functionality
}

ws.onerror = function() {
  // error handling
}
```

Requests are served as they are complete. Examples of backend can be found for Autolysis below.
