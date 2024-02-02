---
title: Gramex 1.77 release notes
prefix: 1.77
...

[TOC]

Gramex 1.77 supports API keys, secure MongoDB access, session cookies, and more.

## API keys support

[API keys](../../auth/#api-key) let users access services as if they were logged-in users.
These are like [one-time passwords](../../auth/#otp), but can be used multiple times, until expiry.

These are useful to provide allow services (e.g. bots, apps, scripts) to act on behalf of a user.
For example, to fetch data, trigger a refresh, etc.

Add this code to a [FunctionHandler](../../functionhandler/) or any Python code in a handler:

```python
expiry = 24 * 60 * 60                 # Expires in 24 hours
key = handler.apikey(expire=expiry)   # Create API key as current user
```

This creates an API `key` string for the currently logged-in user that expires after 24 hours.

To create an API `key` for a different user, use:

```python
expiry = 24 * 60 * 60                           # Expires in 24 hours
user = {'id': 'alpha'}                          # User to create API key for
key = handler.apikey(expire=expiry, user=user)  # Create key as specified user
```

When a user visits any page with `?gramex-key=<key>` added, or with a `X-Gramex-Key: <key>` header,
the user is logged in _for that session_. `handler.current_user` is set to the user object.

::: example href=../../auth/apikey source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
API key example

## Secure MongoDB access

It's now possible to connect securely to a MongoDB instance using
[TLS/SSL](https://pymongo.readthedocs.io/en/stable/examples/tls.html).

An example of a secure MongoDB access configuration is:

```yaml
url:
  mongodb:
    pattern: /mongodb/
    handler: FormHandler
    kwargs:
      url: "mongodb://$USER:$PASS@mongodb.example.com:27017"
      database: db_name
      collection: collection_name
      tls: true
      tlsCAFile: /path/to/ca.pem # OPTIONAL path to CA certificate
      tlsCertificateKeyFile: /path/to/client.pem # OPTIONAL path to Client certificate
```

[Here are tips on troubleshooting errors](https://pymongo.readthedocs.io/en/stable/examples/tls.html#troubleshooting-tls-errors)

## Session cookies

Gramex allows setting session cookies (that expire when the browser is closed, normally). To enable these, use:

```yaml
app:
  session:
    expiry: false # Sessions expire when browser closes
```

You can specify it just for a single login handler rather than the entire app:

```yaml
url:
  auth/expiry:
    pattern: /$YAMLURL/expiry
    handler: SimpleAuth # session_expiry works on DBAuth, GoogleAuth, etc too
    kwargs:
      session_expiry: false # Sessions expire when browser closes
      # ...
```

## SameSite cookies

Gramex also supports the
[`samesite`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value)
cookie attribute. `Strict` sends cookies only for requests from the same site. `Lax` (the default) sends cookies across sites.

An example of a secure cookie configuration is:

```yaml
app:
  session:
    httponly: true # Allow JavaScript access via document.cookie
    secure: true # Cookies can be accessed only via HTTPS (not HTTP)
    samesite:
      Strict # Browser sends the cookie only for same-site requests.
      # Values can be Strict, Lax or None. (Case-sensitive)
    domain: example.org # All subdomains in *.example.org can access session
```

## Bug fixes

- [AuthHandlers](../../auth/) support a [failed login delay](../../auth/#failed-login-delay) consistently with `delay: <number>`
- HTTP headers no longer use custom HTTP reasons, since custom HTTP reasons are not standardized and deprecated
- [FormHandler](../../formhandler/) supports querying MongoDB collections
- [FormHandler](../../formhandler/) supports all [MongoClient attributes](https://pymongo.readthedocs.io/en/stable/api/pymongo/mongo_client.html#pymongo.mongo_client.MongoClient),
  allowing control on timeouts, SSL configuration, etc
- [Gramex Windows service](../../deploy/#windows-service) now runs on Python 3.9

## Backward compatibility & security

Gramex 1.77 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt)
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt)
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt)
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt)

## Statistics

The Gramex code base has:

- 19,605 lines of Python (59 more than 1.76)
- 3,360 lines of JavaScript (same as 1.76)
- 12,817 lines of test code (43 more than 1.76)
- 89% test coverage (same as 1.76)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
