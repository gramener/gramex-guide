---
title: Gramex 1.92 release notes
prefix: 1.92
...

[TOC]

Gramex 1.92 adds ChatGPTHandler, OTP custom keys and Excel Hyperlink support.

## ChatGPTHandler

[ChatGPTHandler](../../chatgpthandler/) provides interface to OpenAI's chat API.


```yaml
url:
  chatgpthandler:
    pattern: /$YAMLURL/chat
    handler: ChatGPTHandler
    kwargs:
      key: sz-....
```
Replace the `key` with your [OpenAI API key](https://platform.openai.com/account/api-keys)

This opens a WebSocket connection to `/chat`. You can read more about how to send messages to it [here](../../chatgpthandler/)

## OTP custom keys

OTPs and API keys store a user object as JSON. 
You can add additional keys to this object with this configuration.


```yaml
storelocations:
  otp:
    columns:
      role: TEXT
      group: TEXT
```

You can populate these columns using keyword arguments to `handler.otp()` and `handler.api_key()`. More details [here](../../auth/#otp-custom-keys)

## Excel hyperlink support in gramex.cache.open()

`gramex.cache.open()` now offers support to extract hyperlinks from an excel column


For example, `gramex.cache.open('file.xlsx', extractLink={'issue': 'issue_url', 'website': 'website_url'})` will add 2 new columns to the output

`issue_url` will contain the hyperlinks from the issue column (or None)

`website_url` will contain the hyperlinks from the website column (or None)


## FileHandler TypeScript allows ESM/IIFE via esbuild - does this qualify??
## FileHandler no longer compiles .vue SFCs  - does this qualify??

## Bug fixes

- DriveHandler deletes all files [#738](https://github.com/gramener/gramex/issues/738)
- Ratelimit does not accept a function to specify frequency [#739](https://github.com/gramener/gramex/issues/739)
- Setting a default Redis cache fails [#748](https://github.com/gramener/gramex/issues/748)
- On AWS SES, if sender is restricted, DBAuth forgot password fails [#752](https://github.com/gramener/gramex/issues/752)
- Bandit security vulnerability [#757](https://github.com/gramener/gramex/issues/757)

## Backward compatibility & security

Gramex 1.92 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 23,018 lines of Python (285 more than 1.91)
- 3,552 lines of JavaScript (same as 1.91)
- 15,759 lines of test code (277 more than 1.91)
- We are migrating to pytest from nose. Code coverage will be reported post migration.

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
