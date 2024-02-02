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

OTPs and API keys store a user JSON object. You can pass additional keys to this object using the `columns` configuration.

```yaml
storelocations:
  otp:
    columns:
      role: TEXT
      group: TEXT
```

You can populate these columns using keyword arguments to `handler.otp()` and `handler.api_key()`. More details [here](../../auth/#otp-custom-keys)

## Excel hyperlink support in gramex.cache.open()

`gramex.cache.open()` now extracts hyperlinks from an Excel column. For example, this Excel file `city-sales.xlsx` has a "City" column with hyperlinks.

| Country | City                                                      | Sales |
| ------- | --------------------------------------------------------- | ----- |
| Italy   | <a href="https://en.wikipedia.org/wiki/Rome">Rome</a>     | 10    |
| Norway  | <a href="https://en.wikipedia.org/wiki/Oslo">Oslo</a>     | 20    |
| UK      | <a href="https://en.wikipedia.org/wiki/London">London</a> | 30    |
| France  | <a href="https://en.wikipedia.org/wiki/Paris">Paris</a>   | 40    |

Using `gramex.cache.open('city-sales.xlsx', links=True)` will read it as a DataFrame with a new `City_links` column with the hyperlinks.

| Country | City   | Sales | City_link                            |
| ------- | ------ | ----- | ------------------------------------ |
| Italy   | Rome   | 10    | https://en.wikipedia.org/wiki/Rome   |
| Norway  | Oslo   | 20    | https://en.wikipedia.org/wiki/Oslo   |
| UK      | London | 30    | https://en.wikipedia.org/wiki/London |
| France  | Paris  | 40    | https://en.wikipedia.org/wiki/Paris  |

You can specify column names to extract from explicitly as a dictionary. For example:

```python
gramex.cache.open('city-sales.xlsx', links={
   'City': 'city_url',
   'Country': 'country_url'
})
```

This extracts the hyperlink from `City` into `city_url` and `Country` into `country_url`. Empty hyperlinks are stored as `NaN`.

## Backward incompatible changes

- [FileHandler .vue compilation is removed](../../filehandler/#vue).

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
