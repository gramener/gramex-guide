---
title: Gramex 1.75 release notes
prefix: 1.75
...

[TOC]

Gramex 1.75 includes a ServiceNow connector for FormHandler, and the ability to update data in MongoDB.

## ServiceNow data connector

[FormHandler](../../formhandler/) supports the `servicenow://` URL to read from ServiceNow tables.
For example:

```yaml
url:
  servicenow:
    pattern: /$YAMLURL/servicenow
    handler: FormHandler
    kwargs:
      url: "servicenow://user:password@hostname.com/table/incident"
```

To use this, [get REST API access](https://docs.servicenow.com/bundle/rome-application-development/page/integrate/inbound-rest/concept/c_RESTAPI.html)
ServiceNow account and [query the tables](https://developer.servicenow.com/dev.do#!/reference/api/rome/rest/c_TableAPI).

Note: Only read access is provided. Write-back is not supported.

Thanks [@radheyakale](https://github.com/radheyakale)

## FormHandler writes data to MongoDB

[Gramex 1.70 introduced read access to MongoDB](../1.70/#mongodb-support). This release enables write-back.

In the FormHandler configuration, add an `id:` column. For PUT and DELETE operations, this is used to identify the record to delete.

```yaml
url:
  mongo:
    pattern: /$YAMLURL/mongo
    handler: FormHandler
    kwargs:
      url: mongodb://localhost:27017
      database: testdatabase
      collection: testcollection
      id: name
      xsrf_cookies: false # Optional
```

Now, the following operations work:

```bash
curl -X POST   localhost:9988/mongo -d 'name=value&key=value'   # Add a record
curl -X PUT    localhost:9988/mongo -d 'name=value&key=value2'  # Update the record
curl -X DELETE localhost:9988/mongo -d 'name=value'             # Delete the record
```

Thanks [@radheyakale](https://github.com/radheyakale)

## Gramex diagnostics

To help developers debug Gramex issues better, `gramex -V` now prints more diagnostics:

```text
$ gramex -V
Gramex version: 1.75.1
Gramex path: d:\gramex\gramex
Python version: 3.7.3
Python path: D:\anaconda\3.7\python.exe
```

This particularly helps identify:

- Which directory Gramex is running from (if developers have multiple versions installed)
- Which directory Python is running from (if developers have multiple Python environments)

## Users are not logged out unexpectedly

All auth handlers support an [`ensure_single_session`](../../auth/#ensure-single-login-session)
action that logs the user out from all other sessions.

But Gramex would [log all users out, not just the logged in user](https://github.com/gramener/gramex/issues/482).
This bug went undetected due to poor test coverage
(and the [author's stupidity](https://github.com/gramener/gramex/blob/a575db7e11bad2668bf78eeaf6a1920f0ee45b64/gramex/transforms/auth.py)).

Now, Gramex only logs out the user who logged in from other sessions.

## Gramex reloads after invalid configurations

Gramex auto-reloads the `gramex.yaml` configuration whenever it's changed. This is useful for fast
debugging -- you don't need to manually restart Gramex. This works even if the YAML is invalid.

But if the _configuration_ is invalid (e.g. you specified `handler: NonexistentHandler`),
[Gramex would never reload `gramex.yaml` configurations again](https://github.com/gramener/gramex/issues/485)

Now, even if there's any incorrect configuration, Gramex reports an error and reloads on the next
change.

## FileHandler reloads index templates

[FileHandler directory listing](../../filehandler/#directory-listing) lets you specify an
`index_template:`

But it was hard to try different designs for the template -- you needed
to [restart Gramex every time `index_template` changed](https://github.com/gramener/gramex/issues/484).

Now, if the `index_template` file changes, Gramex automatically reloads it. It's much faster to
iterate and create new index templates.

## Page redirection works after restart

Gramex stores [session data](../../auth/#session-data) in a JSON file store, by default. This is
fast and persistent (though it doesn't share session data across multiple Gramex instances.)

When a user logs in, the page they should be redirected back to is stored along with the session.
But [if Gramex restarts, this information is lost](https://github.com/gramener/gramex/issues/483).

This is now resolved. Gramex keeps track of _all_ changes in session information and saves it.

## Allow computing variables from functions on first load

[`gramex.yaml` supports computed variables](../../config/#computed-variables). This lets you change
the configuration based on the environment.

For example, you could define `$DB_URL` that connects to a different databases based on the OS.

```yaml
variables:
  DB:
    function: 'sqlite:///...' if os.name == 'nt' else 'mysql:///'
```

But if this was defined inside a local Python file (e.g. `my_module.py` below),
[it raised a `NameError: name ... is not defined` on startup](https://github.com/gramener/gramex/issues/481).

```yaml
variables:
  DB:
    function: my_module.get_db_url()
```

Now, Gramex checks local Python modules for functions and loads them as required.

## Gramex Windows Service shutdown is graceful

Earlier, when we stop a Gramex Windows service from `services.msc` or via `gramex service stop`,
[it would not stop the service](https://github.com/gramener/gramex/issues/486).

This was because `gramex.shutdown()` internally did not allow shutting down from an external thread,
which was used in the Windows Service.

Now, the Windows Service shuts down gracefully.

## Backward compatibility & security

Gramex 1.75 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 19,529 lines of Python (407 less than 1.74)
- 3,359 lines of JavaScript (same as 1.74)
- 12,782 lines of test code (217 more than 1.74)
- 89% test coverage (same as 1.74)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).

Note: Gramex 1.75 does not work with Python 3.8 or 3.9. Use Python 3.7.
