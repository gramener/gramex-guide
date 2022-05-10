---
title: Gramex 1.79 release notes
prefix: 1.79
...

[TOC]

Gramex 1.79 supports multiple default filenames, relative opens in templates, and distributed OTP.

## Multiple default filenames

[FileHandler supports multiple default filenames](../../filehandler/#default-filename).

When FileHandler points to a directory, you could specify a default file, e.g. `index.html` like this:

```yaml
url:
  default-filehandler:
    pattern: /dir/
    handler: FileHandler
    kwargs:
      path: dir/
      default_filename: index.html
```

If `index.html` is missing, it serves a [directory listing](../../filehandler/#directory-listing) or reports an error.

But if the default filename may vary, e.g. some folders use a `README.md` and some use an `index.html`, you can specify a sequence of fallbacks like this:

```yaml
url:
  default-filehandler:
    pattern: /dir/
    handler: FileHandler
    kwargs:
      path: dir/
      default_filename:
        - default.template.html     # Serve this as a template, if it exists
        - index.html                # Else serve this as HTML
        - README.md                 # Else serve this as Markdown to HTML
```

## Relative opens in templates

In a Python script, [`gramex.cache.open('data.json', rel=True)`](../../cache/#data-caching) reads
`data.json` relative to the Python script, i.e. from the same folder where the Python script is.

But in a template, [`gramex.cache.open('data.json', rel=True)`](../../cache/#data-caching) used to read
`data.json` relative to where Gramex was run from.

This is now fixed. For example, if an `index.template.html` has this code:

```html
{% set data = gramex.cache.open('data.json', rel=True) %}
```

... it reads `data.json` from the same folder where `index.template.html` is.

## Distributed OTP and API keys

By default, [OTPs](../../auth/#otp) and [API keys](../../auth/#api-key) are stored locally in a SQLite database.

If you load-balance a Gramex app across multiple servers, the OTPs and API keys created on one
server won't be shared with the other servers.

To share the keys, add an `otp:` service to `gramex.yaml` that points to a shared database:

```yaml
otp:
  url: mysql+pymysql://root@server/db
  table: otp
```

The `url` can point to any [FormHandler compatible database](../../formhandler/#supported-databases).
The `table` can be any new table name. Gramex tries to create it with the following columns. You
can point to any existing table with these columns too:

- `user`: TEXT
- `email`: TEXT
- `token`: TEXT
- `expire`: REAL

## Backward compatibility & security

Gramex 1.79 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

[Backward compatibility tests for 1.79](https://travis-ci.com/github/gramener/gramex/builds/TODO){:.btn .btn-lg .btn-primary}

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt){:.btn .btn-xs .btn-success}
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt){:.btn .btn-xs .btn-success}
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt){:.btn .btn-xs .btn-success}
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt){:.btn .btn-xs .btn-success}

## Statistics

The Gramex code base has:

- 20,188 lines of Python (54 more than 1.78)
- 3,364 lines of JavaScript (same as 1.78)
- 12,914 lines of test code (77 more than 1.78)
- 89% test coverage (same as 1.78)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
