---
title: Gramex 1.91 release notes
prefix: 1.91
...

[TOC]

Gramex 1.91 adds multiple rate limits and Pytest based testing.

## Multiple rate limits
Rate limit now supports multiple configuration values.

`ratelimit` can be an array of rate limit configurations. For example, to set 2 limit:

- 10 requests / user / day
- 100 requests / day globally

```yaml
      ratelimit:
        - pool: daily-user-pool
          keys: [daily, user]
          limit: 30
        - pool: daily-pool
          keys: [daily]
          limit: 100
```

To get ratelimit info use `handler.get_ratelimit()`

More details about `ratelimit` can be found [here](../../ratelimit/)

## Pytest based testing

Earlier we used [nosetests](https://nose.readthedocs.io/en/latest/) to run gramex test cases. We are migrating to use [pytest](https://docs.pytest.org/). 

`nosetests` used to run `gramex`. Now, we run `gramex` and THEN run `pytest`. 

Advantage: clean shutdown of the tests. (nosetests sometimes doesn't cleanly shutdown)


## Bug fixes

- HTTP 403 template now works with any user object [#731](https://github.com/gramener/gramex/issues/731)

## Backward compatibility & security

Gramex 1.91 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 22,733 lines of Python (125 more than 1.90)
- 3,552 lines of JavaScript (same as 1.90)
- 15,482 lines of test code (100 more than 1.90)
- We are migrating to pytest from nose. Code coverage will be reported post migration.

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
