---
title: Gramex 1.91 release notes
prefix: 1.91
...

[TOC]

Gramex 1.91 adds multiple rate limits and better test cases.

## Multiple rate limits




## Better test cases


## Bug fixes

FIX: HTTP 403 template works with any user object. Fixes #731


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
