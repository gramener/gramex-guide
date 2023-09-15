---
title: ChatGPTHandler
prefix: ChatGPTHandler
icon: chatgpthandler.png
desc: ChatGPTHandler is an interface to OpenAI's chat API that maintains message history
by: TeamGramener
type: microservice
...

[TOC]

ChatGPTHandler is an interface to OpenAI's chat API that maintains message history.

## ChatGPTHandler

This is a minimal configuration. Replace the `key` with your [OpenAI API key](https://platform.openai.com/account/api-keys) ([help](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key)).

```yaml
url:
  chatgpthandler:
    pattern: /$YAMLURL/chat
    handler: ChatGPTHandler
    kwargs:
      key: sz-....
```

This opens a WebSocket connection to `/chat`. You can send messages to it using:

```js
const url = location.href.replace(/^http/, 'ws').replace(/\/[^/]*$/, '/chat');
const ws = new WebSocket(url);
ws.onopen = () => ws.send('What rhymes with silk?');
ws.onmessage = message => console.log(message.data);
```

This sends a question "What rhymes with silk?" to OpenAI, and logs the response to the console.

```text
milk, bilk, ilk, wilk, filk
```

```html
<!DOCTYPE html>
<form><input id="input" value="What rhymes with milk?"> <button>Send</button></form>
<pre id="output"></pre>
<script type="module">
  const ws = new WebSocket(location.href.replace(/^http/, 'ws') + 'chatgpt?stream');
  const input = document.querySelector('#input');
  const output = document.querySelector('#output');
  ws.onmessage = (event) => output.insertAdjacentHTML('beforeend', event.data || '\n\n');
  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    ws.send(input.value);
    output.insertAdjacentHTML('beforeend', `\n${input.value}\n\n`);
  }, false);
</script>
```

## ChatGPTHandler configuration

You can use the following parameters:

- `key`: your OpenAI API key
- `max_history`: maximum number of messages to store. Default: None (unlimited)
- [`model`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-model): ID of the model. Default: `gpt-3.5-turbo`
- [`temperature`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-temperature): randomness to use (from 0 to 2). Default: 1
- [`top_p`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-top_p): pick the top p% most likely tokens. Default: 1
- [`n`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-n): number of chat completions. Currently, only 1 is supported
- [`stream`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-stream): `true` [streams the response](#chatgpt-streaming). Else the entire response is returned. Default: false
- [`stop`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-stop): sequence that stops the API from generating further tokens. Default: None
- [`max_tokens`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-max_tokens): maximum tokens to generate. Default: None (unlimited)
- [`frequency_penalty`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-frequency_penalty): higher values reduce repetition. Ranges from -2.0 to +2.0. Default: 0
- [`presence_penalty`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-presence_penalty): higher values increase novelty. Ranges from -2.0 to +2.0. Default: 0
- [`user`](https://platform.openai.com/docs/api-reference/chat/create#chat/create-model): unique identifier of the user. Default: None


## ChatGPTHandler parameter substitution

Any of the [configurations](#chatgpthandler-configuration) can be a Python expression that uses `handler`. For example:

```yaml
url:
  chatgpthandler:
    pattern: /$YAMLURL/chat
    handler: ChatGPTHandler
    kwargs:
      key: {function: handler.get_arg('key)}
      model: {function: handler.get_arg('model', 'gpt-3.5-turbo')}
```

This lets the front-end pass the key and model to use. For example:

- `/chat?key=sz-...` uses the key `sz-...` and the default model `gpt-3.5-turbo`
- `/chat?key=sz-...&model=gpt-4` uses the key `sz-...` and model `gpt-4`


## ChatGPTHandler history

By default, ChatGPTHandler stores the entire conversation history from the time the WebSocket is opened.
This history is sent to OpenAI with every message.

To limit the number of messages (e.g. to reduce the number of tokens processed), use `max_history`. For example:

```yaml
url:
  chatgpthandler:
    pattern: /$YAMLURL/chat
    handler: ChatGPTHandler
    kwargs:
      key: sz-....
      max_history: 5
```

This stores and sends only the last 5 messages to OpenAI.


## ChatGPTHandler streaming



## ChatGPTHandler transforms
