---
title: Gramex 1.90 release notes
prefix: 1.90
...

[TOC]

Gramex 1.90 introduces MessageHandler for live communication, WebsocketHandler arguments,
lighter gramex init, and gramex features formatting.

## MessageHandler for live communication

[MessageHandler](../../messagehandler/) is a publish-subscribe queue for secure, live communication between users.
It is used for chat, live commenting, and message queues via WebSockets.

::: example href=../../messagehandler/messages.html source=https://github.com/gramener/gramex-guide/blob/master/messagehandler/messages.html
    MessageHandler example

The configuration is similar to [FormHandler databases](../../formhandler/#supported-databases):

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
var url = location.href.replace(/^http/, 'ws').replace(/\/[^/]*$/, '/messages');
var ws = new WebSocket(url);
ws.send(JSON.stringify({_method: 'POST', body: 'Hello'}));
```

This will insert a message into the `simple` table with these columns:

| id    | user             | timestamp           | body  |
|-------|------------------|---------------------|-------|
| Xjs3k | user@example.org | 2023-01-02T03:04:05 | Hello |

`id`, `user`, `timestamp` are **always** present in the table. The rest are specified by `columns:`
in the [FormHandler columns](../../formhandler/#formhandler-columns) syntax.

- `id`: a unique ID for each message. Defaults to a random string. See [MessageHandler defaults][#messagehandler-defaults]
- `user`: the user who sent the message. If not specified, it is set to `
- `timestamp`: the time the message was sent. If not specified, it is set to the current time

It also broadcasts the messages to all clients, which you can listen to on the websocket.

```js
ws.onmessage = function (response) {
  const msg = JSON.parse(response.data);
  console.log(msg);
}
```

When opened, the websocket sends **all** past message. You can limit it with [MessageHandler filters](../../messagehandler/#messagehandler-filters).


## WebsocketHandler arguments

[WebsocketHandler](../../websockethandler/) now supports all [BaseHandler attributes](../../handlers/#basehandler-attributes),
including `handler.args`.

Earlier, `handlers.args` was not available in WebsocketHandler methods. This made it hard to
re-use the same Websocket for different purposes.

Now, you can use `handler.args` to pass arguments to WebsocketHandler methods. For example:

```yaml
url:
  pingbot:
    pattern: /pingbot
    handler: WebSocketHandler
    kwargs:
      on_message:
        # On every message, reply with a prefix followed by the same message
        function: handler.write(handler.args['prefix'] + message)
```


## Lighter gramex init

[`gramex init`](../../init/) is now lighter and more modern. Specifically:

- It uses [Bootstrap 5](https://getbootstrap.com/docs/5.2/) instead of [Bootstrap 4](https://getbootstrap.com/docs/4.5) by default.
- The login page uses [Web crypto](#web-crypto-for-hashing) to hash passwords, instead of the js-sha256 library
- Removed custom error pages. We find that in practice, most apps don't create custom error pages.
- Removed `favicon.ico`. The default favicon is the Gramex logo. This is a 12KB saving.
- Removed `test:` section from `gramex.yaml`. This held testing credentials for the [deprecated `gramextest` app](../../test/).
- Removed [admin app](../../admin/) from `gramex.yaml`. Apps may import this on demand.
- Removed the sample Formhandler charts from index.html. The home page is now smaller and simpler.
- Removed common libraries from index.html like [g1](https://www.npmjs.com/package/g1),
  [d3](https://www.npmjs.com/package/d3),
  [dayjs](https://www.npmjs.com/package/dayjs),
  [daterangepicker](https://www.npmjs.com/package/daterangepicker), etc. Add these as required.
- Removed `.stylelintrc.js`, `.htmllintrc`, `.editorconfig` in favor of the new
  [gramex/builderrors](https://github.com/gramener/builderrors#migrate-from-gramex--184) linters.
  Added eslint plugins as package.json dev-dependencies.
- Removed package.json libraries like
  [lodash](https://www.npmjs.com/package/lodash) and
  [uifactory](https://www.npmjs.com/package/uifactory).


## Gramex features formatting

[`gramex feature`](../../features/#feature-usage) now accepts a `--format=table|json|csv` argument.
For example:

```bash
$ gramex features --format=table
      type         feature  count
0       MS  CaptureHandler      1
1       MS    ComicHandler      0
2       MS     FileHandler     14
3       MS    DriveHandler      0
...

$ gramex features --format=csv
type,feature,count
MS,CaptureHandler,1
MS,ComicHandler,0
MS,FileHandler,14
MS,DriveHandler,0
...

$ gramex features --format=json
[
  {"type":"MS","feature":"CaptureHandler","count":1},
  {"type":"MS","feature":"ComicHandler","count":0},
  {"type":"MS","feature":"FileHandler","count":14},
  {"type":"MS","feature":"DriveHandler","count":0},
  ...
]
```

## Web Crypto for hashing

Earler, [Gramex auth templates](https://github.com/gramener/gramex/blob/master/gramex/handlers/auth.template.html) used the [js-sha256](https://www.npmjs.com/package/js-sha256) library to hash passwords.

But thanks to the popularity of the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) in browsers, the default [auth template](https://github.com/gramener/gramex/blob/master/gramex/handlers/auth.template.html)
uses `crypto.subtle.digest("SHA-256", msg)` to hash passwords. This is faster and more secure.

## Backward-incompatible changes

[FunctionHandler output](../../functionhandler/#function-output) automatically serializes data.
For example, Pandas DataFrames are converted into JSON as an array of objects.

The behavior for Pandas Series was not documented, but it was returned as a list of values.

For example, this FunctionHandler:

```yaml
url:
  series:
    pattern: /series
    handler: FunctionHandler
    kwargs:
      function: 'pd.Series({"x": 1, "y": 2, "z": 3}'
```

... would return:

```json
[1, 2, 3]
```

Now, FunctionHandler returns Pandas Series as an `{index: value}` object. This preserves the
index, which is often useful for a series. (The index remains ignored for DataFrames.)

```json
{"x": 1, "y": 2, "z": 3}
```

## Backward compatibility & security

Gramex 1.90 is backward compatible with [previous releases](../) unless the release notes say otherwise.
We ensure this with automated tests.

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt)
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt)
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt)
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt)
5. [Trivy](https://trivy.dev/) for container scans.
   [See Trivy results](https://github.com/gramener/gramex/blob/master/reports/trivy.txt)

## Statistics

The Gramex code base has:

type,loc
Python,22608
JavaScript,3552
Tests,15382

- 22,608 lines of Python (217 more than 1.89)
- 3,552 lines of JavaScript (74 less than 1.89)
- 15,382  lines of test code (79 more than 1.89)
- We are migrating to pytest from nose. Code coverage will be reported post migration.

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
