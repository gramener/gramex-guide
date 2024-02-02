---
title: WebSocketHandler
prefix: WebSocketHandler
icon: websockethandler.png
desc: WebSocketHandler is used for persistent connections and server-side push
by: TeamGramener
type: microservice
...

[TOC]

[WebSocketHandler][websockethandler] is used for persistent connections and
server-side push.

Here is a sample configuration:

```yaml
url:
  pingbot:
    pattern: /pingbot
    handler: WebSocketHandler
    kwargs:
      open: # When websocket is opened
        function: pingbot.open #   call open(handler) in pingbot.py
      on_message: # When client sends a message
        function: pingbot.on_message #   call on_message(handler, msg) in pingbot.py
      on_close: # When websocket is closed
        function: pingbot.on_close #   call on_close(handler) in pingbot.py
      origins: # Optional: Allow only from these domains.
        - gramener.com # If unspecified, all domains are allowed.
        - localhost
        - 127.0.0.1
      # You can also add the auth: configuration like other handlers. For example:
      # auth: true
```

`open`, `on_message` and `on_close` are [expressions or pipelines](../function/).
Here's a sample definition from [`pingbot.py`](pingbot.py.source):

```python
def open(handler):
    print('Chatbot opened for', handler.session['id'])

def on_message(handler, message):
    print('Got message', message, 'for', handler.session['id'])
    handler.write_message('Got message: ' + message)

def on_close(handler):
    print('Chatbot closed for', handler.session['id'])
```

Now we can use [WebSockets in JavaScript][websocket-clients] to open and interact with the websocket.
Paste this in a browser's JavaScript console. You should see the message returned by the server.

```js
// Open the websocket
var url = location.href.replace(/^http/, "ws") + "pingbot";
var ws = new WebSocket(url);

// When we receive any message, log it to the console
ws.onmessage = console.log;

// Send a message to the server a second later.
setTimeout(function () {
  ws.send("Hello world");
}, 1000);

// You may use ws.close() to close the socket. Sockets automatically close
// when the user closes the page, so this is not often used.
// ws.close()
```

## Websocket chat messages

This simple server [`messages.py`](https://github.com/gramener/gramex-guide/blob/master/websockethandler/messages.py)
uses [blinker](https://blinker.readthedocs.io/en/stable/) to send a message to all connected clients,
creating a sort of chat room.

```python
from blinker import signal


def open(handler):
    signal('msg-queue').connect(handler.write_message)


def on_message(handler, message):
    signal('msg-queue').send(message)
```

Using this [gramex.yaml](https://github.com/gramener/gramex-guide/blob/master/websockethandler/gramex.yaml):

```yaml
url:
  websockethandler/messages:
    pattern: /$YAMLURL/messages
    handler: WebSocketHandler
    kwargs:
      open:
        function: messages.open
      on_message:
        function: messages.on_message
```

... and this JavaScript in [messages.html](https://github.com/gramener/gramex-guide/blob/master/websockethandler/messages.html):

```js
// Set up websockets. When we receive a message, add it to the screen
var url = location.href.replace(/^http/, "ws").replace(/\/[^/]*$/, "/messages");
var ws = new WebSocket(url);
var chats = document.querySelector("#chats");
ws.onmessage = function (event) {
  chats.insertAdjacentHTML("beforeend", `<li>${event.data}</li>`);
};

// When the user types a message, send it to the server
var input = document.querySelector("#message");
input.focus();
document.querySelector("form").addEventListener(
  "submit",
  function (e) {
    e.preventDefault();
    ws.send(input.value);
    input.value = "";
  },
  false,
);
```

::: example href=messages.html source=https://github.com/gramener/gramex-guide/blob/master/websockethandler/messages.py
Messages example

You can also have the server trigger scheduled messages using Tornado's
[PeriodicCallback](https://www.tornadoweb.org/en/stable/ioloop.html#tornado.ioloop.PeriodicCallback).
The example below shows how to send an idle message at random intervals.

::: example href=chat.html source=https://github.com/gramener/gramex-guide/blob/master/websockethandler/websocketchat.py
Chatbot example

## Websockets via nginx

To serve WebSockets from behind an nginx reverse proxy, use the following config:

```nginx
http {
  # Add this configuration inside the http section
  # ----------------------------------------------
  map $http_upgrade $connection_upgrade {
      default upgrade;
      ''      close;
  }

  server {
    location / {
      proxy_pass ...;

      # Add this configuration inside the http > server > location section
      # ------------------------------------------------------------------
      proxy_http_version 1.1;
      proxy_set_header Upgrade    $http_upgrade;
      proxy_set_header Connection $connection_upgrade;
      proxy_set_header Host       $host;
      proxy_set_header X-Scheme   $scheme;
    }
  }
}
```

[websockethandler]: https://gramener.com/gramex/guide/api/handlers/#gramex.handlers.WebSocketHandler
[chatbot-source]: https://github.com/gramener/gramex-guide/blob/master/websockethandler/websocketchat.py
[websocket-clients]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications

<script>
var pre = [].slice.call(document.querySelectorAll('pre'))

function next() {
  var element = pre.shift(),
      text = element.textContent
  if (text.match(/new WebSocket/))
    eval(text)
  if (pre.length > 0) { next() }
}
next()
</script>
