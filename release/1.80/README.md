---
title: Gramex 1.80 release notes
prefix: 1.80
...

[TOC]

Gramex 1.80 includes sentiment analysis, function pipelines, and API documentation.

## Sentiment analysis with Huggingface transformers

[MLHandler](../../mlhandler/) now supports sentiment analysis.

To set it up, install:

```bash
pip install spacy transformers torch datasets
```

Then use this configuration:

```yaml
url:
  sentiment:
    pattern: /sentiment
    handler: MLHandler
    kwargs:
      model:
        class: SentimentAnalysis
      xsrf_cookies: false
```

Now visit `/sentiment?text=wrong&text=right` to see the following output:

```json
["NEGATIVE", "POSITIVE"]
```

## Function pipelines

The [`gramex.yaml` configuration](../../config/) uses functions in several places. For example, in:

- [FunctionHandler](../../functionhandler/)'s `function:` key
- [FormHandler](../../formhandler/#formhandler-transforms)'s `prepare`, `queryfunction`, `function`, and `modify` keys
- [Alert](../../alert/#send alerts on condition)'s `condition` key
- [Computed variables](../../config/#computed-variables)
- ... and many more

In every case, instead of a single function, you can use a list of steps.
[We call these pipelines](../../function/#pipelines).
For example, to generate a random number in [FunctionHandler](../../functionhandler/):

```yaml
url:
  random-function:
    pattern: /random
    handler: FunctionHandler
    kwargs:
      function:
        - random.seed(0)
        - random.randint(0, 100)
```

This pipeline (i.e. a function with multiple steps) has 2 steps.

When you visit [`/random`](../../function/random), it always runs the 2 steps in order: `random.seed(0)` first, then `random.randint(0, 100)`. It returns the _same random number_ every time.

::: example href=../../function/random source=https://github.com/gramener/gramex-guide/tree/master/function/gramex.yaml
Visit /random

To assign the output of a step to a variable, use `{name: ...}`. For example:

```yaml
url:
  random-sum:
    pattern: /randomsum
    handler: FunctionHandler
    kwargs:
      function:
        - { name: x, function: random.randint(0, 100) }
        - { name: y, function: random.randint(0, 100) }
        - x + y
```

The output will be the sum of 2 random numbers between 0-100 that changes on every reload.

::: example href=../../function/randomsum source=https://github.com/gramener/gramex-guide/tree/master/function/gramex.yaml
Visit /randomsum

## Command-line logging control

Gramex logs all messages (debug, info, warning, etc) by default. To restrict the logging to
warnings, you could add this [logging configuration](../../config/#logging):

```yaml
log:
  loggers:
    gramex:
      level: WARNING
```

From this version, you can also use the `--log.level=` command line argument. For example:

```bash
gramex --log.level=WARNING
```

## Displaying logger

Gramex logs did not display the logging handler name by default. A typical output looks like:

```text
DEBUG   28-Jun 13:51:21 registry registered 'sha256_crypt' handler: ...
DEBUG   28-Jun 13:51:33 font_manager findfont: score(FontEntry(fname='...
DEBUG   28-Jun 13:51:41 __init__ PORT Running callback: app
```

Now, the logging handler is displayed as well:

```text
DEBUG   28-Jun 13:51:21 passlib.registry:registry registered 'sha256_crypt' handler: ...
DEBUG   28-Jun 13:51:33 matplotlib.font_manager:font_manager findfont: score(FontEntry(fname=...
DEBUG   28-Jun 13:51:41 gramex:__init__ PORT Running callback: app
```

This allows apps to change the logging level for specific handlers. For example:

```yaml
log:
  loggers:
    gramex: { level: WARNING } # Only show warnings form Gramex
    matplotlib: { level: INFO } # Ignore matplotlib debug messages
    passlib: { level: INFO } # Ignore passlib debug messages
```

## API Documentation

We are rewriting the documentation for all the Gramex modules, functions and classes to make them easier.

[This Gramex API documentation](https://gramener.com/gramex/guide/api/) has been rewritten in Markdown. For example:

- [gramex.cache](https://gramener.com/gramex/guide/api/cache/)
- [gramex.data](https://gramener.com/gramex/guide/api/data/)
- [gramex.ml](https://gramener.com/gramex/guide/api/ml/)
- [... and more](https://gramener.com/gramex/guide/api/)

These functions and methods can be imported and used as part of any [function](../../function/) or
[template](../../filehandler/#templates).

## JS security updates

The underlying libraries for the following have been upgraded to more secure versions:

- [UI Components](../../uicomponents/)
- [PyNode](../../node/)
- [Capture](../../capturehandler/)

These will not trigger warnings in security scans that incorporate `npm audit`.

## Deprecations

The root-level key `otp:` held the config for [encrypted users](../../auth/#encrypted-user).
This is now moved to `storelocations.otp:`.

## Backward compatibility & security

Gramex 1.80 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 20,272 lines of Python (84 more than 1.79)
- 3,364 lines of JavaScript (same as 1.79)
- 13,144 lines of test code (231 more than 1.79)
- 89% test coverage (same as 1.79)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
