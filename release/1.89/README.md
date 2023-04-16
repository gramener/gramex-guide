---
title: Gramex 1.89 release notes
prefix: 1.89
...

[TOC]

Gramex 1.89 supports case-insensitive search, distributed user logs, feature usage reports, and complexity reports.

## Case insensitive search

[FormHandler filters](../../formhandler/#formhandler-filters) has 2 new operators `*=` and `!*=` that match case-insensitively.

[?Name\*=united](../../formhandler/flags?Name*=united&_format=html) matches "united" in any case, e.g. "United" and "UNITED"

| ID  | Name                 | Continent | ... |
| --- | -------------------- | --------- | --- |
| ARE | United Arab Emirates | Asia      | ... |
| GBR | United Kingdom       | Europe    | ... |
| USA | United States North  | America   | ... |

Similarly, [?Name!\*=united](../../formhandler/flags?Name!*=united&_format=html) skips "united" in any case, e.g. "United" and "UNITED"

This currently works for in-memory data frames as well as all SQLAlchemy databases, but not yet for MongoDB, InfluxDB and ServiceNow.

## Distributed user logs

When a user logs in or out, [Gramex logs the event to a user log store](../../config/#user-logging).
This is useful for auditing, reporting, and debugging.

Earlier, this was stored as `logs/user.csv` under [$GRAMEXDATA](../config/#predefined-variables).
But this could not be shared across multiple machines.

Now, this is stored in a database. The default database is `sqlite:///$GRAMEXDATA/auth.user.db`
and the default table is `userlog`. You can change these in `gramex.yaml`:

```yaml
storelocations:
  userlog:
    url: postgresql://$USER:$PASS@server/db
    # url: mysql+pymysql://$USER:$PASS@server/db
    # ...
    table: userlog
```

You can set the columns to log with any key in [request logging](../../config/#request-logging).
Below is the default.

```yaml
storelocations:
  userlog:
    columns:
      # You MUST add these 3 columns
      event: TEXT # Type of event: login/logout/fail
      datetime: TEXT # Time of event, ISO8601 encoded (YYYY-MM-DD HH:MM:SSZ)
      user: TEXT # User ID (e.g. user name or email address, depending on handler)
      # You can change / update any of these
      port: INTEGER # Port on which Gramex is running
      uri: TEXT # URL where the user logged in
      name: TEXT # Name of the handler
      class: TEXT # Class of the handler (e.g. SimpleAuth, GoogleAuth, etc)
      ip: TEXT # IP address of the client
      browser: TEXT # Browser name
      # request.method: TEXT
      # env.HOME: TEXT
```

## Measure Gramex usage

Run [`gramex features`](../../features/#feature-usage) on any Gramex app to list the features used.
Here's an example:

```text
$ gramex features
      type                       feature  count
0       MS                CaptureHandler      2
1       MS                  ComicHandler      1
2       MS                   FileHandler     67
...
18   KWARG                Access Control     53
19   KWARG                      Security     12
...
27     SVC                  Microservice      2
28     SVC                        Import      0
...
41  ERR-MS     handlerutil.CustomHandler      1
42  ERR-MS      handlerutil.SetupHandler      1
```

The columns are:

- `type`: The type of feature. One of `MS` (microservice), `KWARG` (configuration), `SVC` (service).
   `ERR-MS` indicates a custom or missing microservice
- `feature`: The name of the feature
- `count`: The number of times the feature is used

You can render the output in different formats:

- `--format=table` prints a table (default)
- `--format=csv` prints a CSV file
- `--format=json` prints a JSON file

Pass multiple folders, e.g. `gramex features /project1/ /project2/`, to sum features used across folders.


## Measure code complexity

[Run `gramex complexity`](../../complexity/) on any Gramex app to measure the
[Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
of the code.

Here's an example:

```text
$ gramex complexity
    py   js  gramex
0  121  345    2782
```

The columns are:

- `py`: Python code complexity
- `js`: JavaScript code complexity
- `gramex`: Complexity of the Gramex codebase used by the project

This is useful to see what % of the code re-uses Gramex code, and what % is custom code.

Put another way, without Gramex, the project would have a complexity of 122 + 345 + 2,782 = 3,249.

Gramex reduces 2,782 / 3,249 = 86% of the code.


## Backward compatibility & security

Gramex 1.89 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 22,391 lines of Python (207 more than 1.88)
- 3,626 lines of JavaScript (same as 1.88)
- 15,303  lines of test code (167 more than 1.88)
- We are migrating to pytest from nose. Code coverage will be reported post migration.

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
