---
title: Gramex 1.93 release notes
prefix: 1.93
...

[TOC]

Gramex 1.93 is mainly a bug-fix release for FormHandler, error handlers, and OTP keys.

## Bug fixes

- **Non-standard SQLAlchemy URLs are supported**. [FormHandler](../../formhandler/) would treat non-standard SQLAlchemy URLs like `snowflake://` as invalid. This is fixed.
- **Forbidden error templates do not fail.** [Error handlers](../../config/#error-handlers) show the user info as YAML. But if the info is not serializable (e.g. it has a function), these fail. This is fixed.
- **OTP override does not delete custom attributes**. Using an OTP overwrote all use attr attributes available from the OTP table (e.g. `email`, `id`). For [EmailAuth](../../emailauth/) this also cleared essential keys when these attributes were empty. This is fixed. [#759](https://github.com/gramener/gramex/issues/759)


## Backward compatibility & security

Gramex 1.93 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 23,014 lines of Python (4 less than 1.92)
- 3,554 lines of JavaScript (2 more than 1.92)
- 15,759 lines of test code (same as 1.92)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
