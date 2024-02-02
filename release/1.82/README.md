---
title: Gramex 1.82 release notes
prefix: 1.82
...

[TOC]

Gramex 1.82 allows revoking API keys, setting session cookie paths, and Bootstrap 5 support in g1.

## Revoke API keys and OTPs

Gramex allows creating an [API key](../../auth/#api-key) using `handler.apikey()`, like this:

```python
user = {id: 'user@example.com'}       # Ensure there's an 'id' key
expiry = 24 * 60 * 60                 # Expires in 24 hours
key = handler.apikey(expire=expiry, user=user)  # Create key as specified user
```

To revoke an API key created this way, you can now use:

```python
handler.revoke_apikey(key)
```

You can also revoke an [OTP](../../auth/#otp) using:

```python
handler.revoke_apikey(otp)
```

## Session cookie path

As part of the [session settings](../../auth/#session-security), you can add a
[Cookie Path](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
e.g. `cookiepath: /app/path`.

This restricts the cookie to `/app/path` and its subdirectories, and ensures that the cookie
does not leak to other applications on the same server.

## Bootstrap 5 support in G1

[g1](../../g1) components such as [FormHandler](../../g1/formhandler) used Bootstrap 4 classes and attributes, e.g. `data-dismiss="modal"`.

[g1 0.18.0](https://www.npmjs.com/package/g1/v/0.18.0) enhances such components to work both with Bootstrap 4 and Bootstrap 5.

## Bug fixes

- SASS [sourcemaps](https://sourcemaps.info/spec.html) are now enabled. When SASS files are served (e.g. `/style.scss`), the source map is linked to and served at `/style.scss?_map`
- When using a disk or Redis cache, Gramex would throw an error `TypeError: can't pickle _thread.RLock objects`. This was because error messages use templates that cannot be pickled. Gramex now caches such objects in an in-memory fallback cache.
- [MLHandler](../../mlhandler/) stored its model files under `<model-name>/<model-name>.pkl`. This made the models less portable. When renaming the model, the file has to be renamed too. Now, MLHandler stores models as `<model-name>/model.pkl`. Renaming the model is the same as renaming the directory.
- The Gramex README was written in reST, which works well with [PyPi](https://pypi.org/project/gramex/) but not on [Github](https://github.com/gramener/gramex/). This is now written in Markdown, which works well in both.
- Gramex Docker builds are now a bit smaller. Earlier, the "FileManager" app used the bulky Puppetteer library for tests. Now they've been moved to the tests folder and are not included in the Docker builds.

## Backward compatibility & security

Gramex 1.82 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 20,514 lines of Python (79 more than 1.81)
- 3,324 lines of JavaScript (41 less than 1.81)
- 13,190 lines of test code (42 more than 1.81)
- 89% test coverage (same as 1.81)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
