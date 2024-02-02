---
title: MessageHandler
prefix: MessageHandler
icon: messagehandler.png
desc: MessageHandler is a publish-subscribe queue for secure, live communication between users.
by: TeamGramener
type: microservice
...

[TOC]

[MessageHandler][messagehandler] is a publish-subscribe queue for secure, live communication between users.
It is used for chat, live commenting, and message queues via WebSockets.

[messagehandler]: https://gramener.com/gramex/guide/api/handlers/#gramex.handlers.MessageHandler

::: example href=messages.html source=https://github.com/gramener/gramex-guide/blob/master/messagehandler/messages.html
MessageHandler example

## MessageHandler configuration

The configuration is similar to [FormHandler databases](../formhandler/#supported-databases):

```yaml
url:
  messagehandler/simple:
    pattern: /$YAMLURL/simple
    handler: MessageHandler
    kwargs:
      url: sqlite:///$YAMLPATH/messages.db
      table: simple
      columns:
        body: TEXT
```

This opens a WebSocket connection to `/messages`. You can send messages to it using:

```js
var url = location.href.replace(/^http/, "ws").replace(/\/[^/]*$/, "/messages");
var ws = new WebSocket(url);
ws.send(JSON.stringify({ _method: "POST", body: "Hello" }));
```

This will insert a message into the `simple` table with these columns:

| id    | user             | timestamp           | body  |
| ----- | ---------------- | ------------------- | ----- |
| Xjs3k | user@example.org | 2023-01-02T03:04:05 | Hello |

`id`, `user`, `timestamp` are **always** present in the table. The rest are specified by `columns:`
in the [FormHandler columns](../formhandler/#formhandler-columns) syntax.

- `id`: a unique ID for each message. Defaults to a random string. See [MessageHandler defaults][#messagehandler-defaults]
- `user`: the user who sent the message. If not specified, it is set to `
- `timestamp`: the time the message was sent. If not specified, it is set to the current time

It also broadcasts the messages to all clients, which you can listen to on the websocket.

```js
ws.onmessage = function (response) {
  const msg = JSON.parse(response.data);
  console.log(msg);
};
```

When opened, the websocket sends **all** past message. You can limit it with [MessageHandler filters](#messagehandler-filters).

## MessageHandler filters

By default, MessageHandlers listen to all messages. You can specify arguments like
[FormHandler filters](../formhandler/formhandler-filters) to restrict the messages received.

For example:

- `?topic=Help` will only receive messages with a topic "Help"
- `?timestamp>=2023-03-01` will only receive messages after 1 Mar 2023
- `?user=user@example.org` will only receive messages created by user@example.org
- `?topic=Help&timestamp>=2023` will only receive messages with a topic "Help" and created in 2023

These are only applied when **receiving, not sending**. To filter or validate sent messages,
use [MessageHandler prepare](#messagehandler-prepare)

## MessageHandler open

To perform tasks when the websocket is opened, use `open:`. You can write any Python expression using:

- `handler`: MessageHandler instance
- `args`: same as [handler.args](../handlers/#basehandler-attributes)

To log the user who opened the websocket:

```yaml
kwargs:
  open: logging.info('MessageHandler opened by %s', handler_current_user)
```

To ensure the websocket only receives messages where a `recipient` column has the user ID:

```yaml
open: args.update(recipient=[handler.current_user.id])
```

To ensure the websocket only receives messages processed after 2023 Apr:

```yaml
open: >
  args.update({"timestamp>~": ["2023-04"]})
```

Note that the values for [handler.args](../handlers/#basehandler-attributes) must be arrays.

## MessageHandler defaults

You can update the default values for messages using the `message_default` configuration. For example:

```yaml
kwargs:
  message_default:
    POST:
      to: f'all@example.org'
      length: msg['message'].length
      session: handler.session['id']
    PUT:
      length: msg['message'].length
```

When a MessageHandler receives any `message`, it picks the section based on `_method`.
(E.g. if `_method` is `POST`, it picks the `POST` section).

It updates the `message` based on the keys. Values can be expression that uses `msg` and `handler`.

By default, message defaults are set for `POST` (new messages) for:

- `id`: Set to a new unique string (UUID4, Base-64 encoded)
- `user`: Set to the current user's ID (or None if not logged in)
- `timestamp`: Current time in ISO format

```yaml
message_default:
  POST:
    id: base64.urlsafe_b64encode(uuid.uuid4().bytes).strip(b"=").decode('utf-8')
    user: handler.current_user.get('id', None) if handler.current_user else None
    timestamp: datetime.datetime.utcnow().isoformat()
```

## MessageHandler prepare

To validate modify each message _before_ updating the database, use `prepare:`. Example:

```yaml
prepare: >
  msg.update(message='MSG: ' + msg['message']) if msg['_method'] == 'POST' else ''
```

This `prepare:` expression updates POST methods with the "message" key by prefixing "MSG: " in front of it. You can use

- `msg`: the message object passed from the client
- `handler`: MessageHandler instance

For example, to allow only certain users to post to certain topics, use
`prepare: mymodule.my_prepare(msg, handler)` where `mymodule.py` has:

```python
def my_prepare(msg, handler):
    allowed = valid_users.get(msg['topic'], [])
    if not handler.current_user or handler.current_user['id'] not in allowed:
        raise ValueError(f"You cannot write to {msg['topic']}")
```

## MessageHandler modify

To modify each message _after_ updating the database, use `modify:`.
This changes the message object that is used in [alerts](#messagehandler-alerts) and broadcasted.

```yaml
modify: >
  msg.update(message='MSG: ' + msg['message']) if msg['_method'] == 'POST' else ''
```

This `modify:` expression updates POST methods with the "message" key by prefixing "MSG: " in front of it. You can use

- `msg`: the message object passed from the client
- `handler`: MessageHandler instance

## MessageHandler alert

To email users when a message is added, deleted, or modified, use `alert:`. This section has the
same structure as [Gramex alerts](../alert/). It sends an email alert for each message. For example:

```yaml
alert:
  to: "{{ to }}"
  subject: "Message: {{ body }}"
  html: >
    {% import pandas as pd %}
    {% import time %}
    <p>Message from {{ user }} at {{ pd.to_datetime(time.time() * 1E9).strftime('%d %b %Y %H:%M') }}.</p>
    <p>{{ body }}</p>
```

All keys in the message (e.g. `id`, `user`, `timestamp`, anything specified in columns) are
available to use as Tornado templates.

By default, it sends alerts only for `_method: POST`. To send messages for other methods, use:

```yaml
alert:
  methods: [POST, PUT, DELETE]
```

<!--

## MessageHandler nested replies

To enable nested replies, add a `parent_id` column, e.g.

```yaml
      columns:
        parent_id: TEXT
        body: TEXT
        ...
```

This lets you keep track of which message is a reply to, and even allows replies to replies.
-->
