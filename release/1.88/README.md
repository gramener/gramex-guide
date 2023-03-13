---
title: Gramex 1.88 release notes
prefix: 1.88
...

[TOC]

Gramex 1.88 supports Breakpoint debugging and templates for the IDE.

## Breakpoint Debugging

Gramex used to prefer `ipdb` as the default [debugger](../../debug/#python-debugger).
Now, Gramex uses the default `breakpoint()` mechanism.

In any [FunctionHandler](../../functionhandler/), transform, or any Python code, add `breakpoint()`
to pause execution and enter the debugger.

You can replace the default Python debugger `pdb` by setting the [`PYTHONBREAKPOINT`](https://peps.python.org/pep-0553/) environment variable:

- [`PYTHONBREAKPOINT=ipdb.set_trace`](https://github.com/gotcha/ipdb) - IPython-enabled pdb
- [`PYTHONBREAKPOINT=pdbpp.set_trace`](https://github.com/pdbpp/pdbpp) - a drop-in replacement for pdb
- [`PYTHONBREAKPOINT=pudb.set_trace`](https://documen.tician.de/pudb/) - a full-screen console-based debugger
- [`PYTHONBREAKPOINT=wdb.set_trace`](https://github.com/Kozea/wdb) - a web debugger
- [`PYTHONBREAKPOINT=webpdb.set_trace`](https://github.com/romanvm/python-web-pdb) - a web UI for pdb

[#691](https://github.com/gramener/gramex/pull/691)

## IDE templates

Run `gramex init ide` to create a new Gramex project that is used on the [Gramex IDE](https://gramex.gramener.com/).

This is a lightweight template that has:

- An `index.html` that says "Welcome to Gramex"
- A `gramex.yaml` that imports [Gramex UI](../../uicomponents/)

## Build improvements

The Gramex Docker build is now based on [Alpine 3.17](https://hub.docker.com/layers/frolvlad/alpine-glibc/alpine-3.17/images/sha256-3bdc51a29c1ffb44cd866c489f0d64feb65dea5380775c88909d6c855917d3f6?context=explore)
(from [3.16](https://hub.docker.com/layers/frolvlad/alpine-glibc/alpine-3.16/images/sha256-a3e7c6fa4bc1d99bff330273a7cde972190a363f591c3bd0ad79564eb019092e?context=explore)). This is a security update.
[#676](https://github.com/gramener/gramex/pull/676)

## Bug fixes

- The `gramex` command is now available from the PATH of the Gramex Docker images [#683](https://github.com/gramener/gramex/pull/683)
- [CaptureHandler](../../capturehandler/) is refactored to use the more modern Puppeteer v19 (instead of v14) [#686](https://github.com/gramener/gramex/pull/686)
- [Schedules](../../scheduler/) now log the entire exception when a schedule fails, not just the error message [#689](https://github.com/gramener/gramex/pull/689)
- [User store](../../auth/#user-store) migrations from pre 1.87 `gramex.auth.db` to 1.87+ now work on Unix [#678](https://github.com/gramener/gramex/pull/678)
- Gramex will not use SQLAlchemy 2.x until full support across libraries becomes available [#690](https://github.com/gramener/gramex/pull/690)

## Backward compatibility & security

Gramex 1.88 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 22,184 lines of Python (18 more than 1.87)
- 3,626 lines of JavaScript (same as 1.87)
- 15,136 lines of test code (5 less than 1.87)
- We are migrating to pytest from nose. Code coverage will be reported post migration.

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
