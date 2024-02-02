---
title: Gramex 1.81 release notes
prefix: 1.81
...

[TOC]

Gramex 1.81 makes distributed instances better with logging, table schema caching and computed variables.

## Distributed Logging

[LogViewer](../../logviewer/) used to aggregate data into a SQLite database.

This works well for a single instance of Gramex. But if Gramex is deployed on multiple servers, one instance of LogViewer can't access the SQLite file from another server.

Now, LogViewer supports setting a [database location](../../logviewer/#logviewer-database-location) using `LOGVIEWER_DB`. For example, to store Logviewer data in MySQL, use:

```yaml
import:
  logviewer:
    path: $GRAMEXAPPS/logviewer/gramex.yaml
    YAMLURL: $YAMLURL/log/
    LOGVIEWER_DB:
      url: mysql+pymysql://root@localhost/logviewer
```

## Better table schema caching

Internally, Gramex uses [`gramex.data.alter`](https://gramener.com/gramex/guide/api/data/#gramex.data.alter) to change database table schemas.

This caches each table's schema. This can cause a problem if 2 instances of Gramex alter a schema:

1. Instance 1 creates a table with columns `A` and `B`. It caches columns `{A, B}`
2. Instance 2 adds column `B`, `C`. It reads the table, and only inserts `C`.
3. Instance 1 adds columns `C`, `D`. It uses the cached columns `{A, B}`, tries to insert `C`, and fails because the column exists

This is now fixed. Instance 1 will read the list of columns from the table before inserting columns.

## Better computed variables

`gramex.yaml` can contain [computed variables](../../config/#computed-variables), for example:

```yaml
variables:
  SERVERNAME:
    function: open('/etc/hostname').read()
    default: NON-LINUX-SYSTEM
```

This sets `SERVERNAME` to the contents of `/etc/hostname`. But if the file does not exist, it would throw an error, and Gramex would not start.

This is now fixed. If the `function:` raises an exception, Gramex logs it and uses the default value.

## Transform variable arguments

[`gramex.transforms.build_transform`](../../api/transforms/#gramex.transforms.build_transform)
is the core utility that compiles Python expressions in YAML configurations. For example:

```python
action = build_transform({'function': 'x + 1'}, vars={'x': 0}, iter=False)
```

... roughly compiles to:

```python
def transform(x=0):
    return x + 1
```

This lets us pass keyword arguments like `x=0` using `vars`. But there was no way to pass variable arguments, e.g. `**kwargs`. But now:

```python
action = build_transform({'function': 'x + 1'}, vars={'x': 0}, kwargs=True, iter=False)
```

... roughly compiles to:

```python
def transform(x=0, **kwargs):
    return x + 1
```

## Deprecations

- [RMarkdown](../../r/#rmarkdown) support in [FileHandler](../../filehandler/) is deprecated and will be removed in v1.83.
  RMarkdown is rarely used with Gramex. The underlying packages have several installation issues and compatibility issues with NumPy. Rather than switch to older NumPy versions for support, we're deprecating RMarkdown.
- `gramex.transforms.badgerfish()` is an unused [FileHandler](../../filehandler/) transformation. It converts XML to JSON using the [Badgerfish convention](https://badgerfish.ning.com/). This has been removed

## Bug fixes

- Gramex uses [Node.js](../../node/) to compile [SASS](../../filehandler/#sass) and [Vue](../../filehandler/#vue) files.
  This caches files in [`$GRAMEXDATA`](../../config/#predefined-variables) under a `pynode` directory.
  If this directory does not exist, Gramex creates it.

## Backward compatibility & security

Gramex 1.81 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 20,435 lines of Python (2,837 more than 1.80 -- mostly documentation)
- 3,365 lines of JavaScript (1 more than 1.80)
- 13,148 lines of test code (4 more than 1.80)
- 89% test coverage (same as 1.80)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
