---
title: Gramex 1.87 release notes
prefix: 1.87
...

[TOC]

Gramex 1.87 supports FormHandler argument typing, distributed user stores, flexible deletions, and more.

## FormHandler argument type

[FormHandler filter](../../formhandler/#formhandler-filters) values are converted from strings to the column type, where possible.
To explicitly set the type, use `argstype`:

```yaml
url:
  flags:
    pattern: /people
    handler: FormHandler
    kwargs:
      url: people.csv
      argstype:
        age: { type: int }
        weight: { type: float }
        is_married: { type: bool }
        date_of_birth: { type: pd.to_datetime }
        date_of_death: { type: pd.to_datetime(_val) if _val else None }
```

`argstype` is a dictionary of column names and their types. The type can be:

- any Python type, e.g. `int`, `float`, `bool`, `datetime.date`, `datetime.datetime`
- any Python expression that takes a string called `_val` and returns a value, e.g. `pd.to_datetime(_val)`

Note: `argstype` values can also include an `{expanding: true}` to treat values as lists.
This is used in [FormHandler queries](../../formhandler/#formhandler-query) to
[prevent SQL injection](../../formhandler/#preventing-sql-injection) in the `IN` operator.

[Reference](../../formhandler/#formahandler-argument-type)

## Distributed user stores

User information (including [attributes](../../auth/#user-attributes)) is stored in a user store that is configured as follows:

```yaml
storelocations:
  user:
    url: sqlite:///$GRAMEXDATA/auth.user.db
    table: user
    columns:
      key: { type: TEXT, primary_key: true }
      value: { type: TEXT }
```

If you use Gramex on multiple servers, change this to a remote database with the same syntax as
[FormHandler](../../formhandler/). For example, add this in your `gramex.yaml`:

```yaml
storelocations:
  user:
    url: postgresql://$USER:$PASS@server/db
    # url: mysql+pymysql://$USER:$PASS@server/db
    # ...
    table: user
```

[Reference](../../auth/#user-store)

## Flexible Delete

[FormHandler DELETE](../../formhandler/#formhandler-delete) required a primary key to be specified via `kwargs.id`.

This is no longer required. DELETE now works exactly like GET, except that it deletes rows instead of filtering them.

Similarly, `gramex.data.delete()` now works like `gramex.data.filter()`. For example:

```python
# Fetches data based on a filter
rows = gramex.data.filter('sqlite:///sales.db', table='sales', where={'city': 'Olso'})
# Returns the number of rows deleted. Same as len(rows)
count = gramex.data.delete('sqlite:///sales.db', table='sales', where={'city': 'Olso'})
```

## MS SQL ordering

If we use OFFSET or LIMIT with MS SQL, we must specify an ORDER BY clause. Otherwise, it raises:
`MSSQL requires an order_by when using an OFFSET or a non-simple LIMIT`.

Gramex now does this automatically. If the query is not sorted, Gramex sorts by the first
column in the table. [#626](https://github.com/gramener/gramex/issues/626)

## Old Admin App deprecated

The [first version of the Admin app](../../admin/#admin-page-old) (imported from `$GRAMEXAPPS/admin/gramex.yaml`) was deprecated in Gramex 1.33.

This version of Gramex removes it.

## Bug fixes

- [OpenAPIHandler](../../openapihandler/) automatically added a `GET` method to all FunctionHandlers, even if it only mentions a POST method. [Fixed #660](https://github.com/gramener/gramex/pull/660)
- If `gramex.yaml` specifies the listen.port as a string (e.g. `port: '9988'`), Gramex logging would fail. [Fixed #664](https://github.com/gramener/gramex/pull/664)
- If Gramex is installed on Windows as a non-root user, it's installed under a `.conda` folder which is protected by FileHandler by default. FileHandler now specifically allows `.conda` folders. [Fixed #670](https://github.com/gramener/gramex/pull/670)

## Backward compatibility & security

Gramex 1.87 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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
5. [Trivy](https://trivy.dev/) for container scans.
   [See Trivy results](https://github.com/gramener/gramex/blob/master/reports/trivy.txt)

## Statistics

The Gramex code base has:

- 22,166 lines of Python (102 more than 1.86)
- 3,626 lines of JavaScript (233 less than 1.86) -- [admin module removed](#old-admin-app-deprecated)
- 15,141 lines of test code (269 more than 1.86)
- We are migrating to pytest from nose. Code coverage will be reported post migration.

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
