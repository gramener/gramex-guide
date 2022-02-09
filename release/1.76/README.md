---
title: Gramex 1.76 release notes
prefix: 1.76
...

[TOC]

Gramex 1.76 has Python 3.9 support, schedulers that run every second, and more tutorial videos.

## Gramex is ready for Python 3.9

Gramex only worked on Python 3.7 so far. This was mainly Tornado 6, SQLAlchemy 1.4 and Pandas 1.0 had breaking changes.

Rather than break backward compatibility, Gramex has been re-written to work with the older *and* newer versions of all of these libraries. Specifically, it works with:

- Tornado 5 *and* Tornado 6
- SQLAlchemy 1.3 *and* SQLAlchemy 1.4
- Pandas 0.x *and* Pandas 1.x

In future releases, the Gramex Conda package will migrate to Python 3.9, allowing you to use:

- [Assignment expressions](https://docs.python.org/3/whatsnew/3.8.html#assignment-expressions) like `if n := len(a):`
- [f-strings with `=`](https://docs.python.org/3/whatsnew/3.8.html#f-strings-support-for-self-documenting-expressions-and-debugging) like `f'{value=}'`
- [Dictionary merge](https://docs.python.org/3/whatsnew/3.9.html#dictionary-merge-update-operators), e.g. `{'x':1} | {'y':2}`
- [`asyncio.run()`](https://docs.python.org/3/whatsnew/3.8.html#asyncio)
- ... and much more

## Schedulers run every second

Earlier, [schedulers](../../scheduler/) and [alerts](../../alert/) could run every minute, at most.

But it wasn't possible to run a scheduler every second, or 90 seconds.

Now, schedulers and alerts support an `every:` kwarg that specifies the frequency of runs.

For example, this schedule runs every 1 minute 30 seconds:

```yaml
schedule:
    run-at-specific-interval:
        function: print(time.time())
        every: 1m 30s
```

## Tutorial videos

The Gramex Guide now has video tutorials explaining most features in several pages:

- [FunctionHandler](../../functionhandler/)
- [FileHandler](../../filehandler/)
- [FormHandler](../../formhandler/)
- [CaptureHandler](../../capturehandler/)
- [PPTXHandler](../../pptxhandler/)
- [Caching](../../cache/)
- [Debugging Gramex](../../debug/)

## Bug fixes

- [FormHandler](../../formhandler/) MongoDB engine supports PUT/POST/DELETE on all versions of PyMongo
- [FormHandler](../../formhandler/) ServiceNow engine accepts the `table:` parameter
- [CaptureHandler](../../capturehandler/) handles PhantomJS timeout correctly, using the PhamtomJS API
- `gramex.cache.open(excel_file)` accepts the `name=` for named range (not the incorrect `defined_name=`)
- `gramex.data.insert()` converts empty `?args=` to None instead of empty strings, making FormHandler insert operations work across numbers and strings


## Backward compatibility & security

Gramex 1.76 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

[Backward compatibility tests for 1.76](https://travis-ci.com/github/gramener/gramex/builds/TODO){:.btn .btn-lg .btn-primary}

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

- 19,546 lines of Python (17 more than 1.75)
- 3,360 lines of JavaScript (1 more than 1.75)
- 12,774 lines of test code (8 less than 1.75)
- 89% test coverage (same as 1.75)


## How to install

See the [Gramex installation and upgrade instructions](../../install/).

Note: Gramex 1.76 works with Python 3.7+ but has been fully tested only with Python 3.7.
