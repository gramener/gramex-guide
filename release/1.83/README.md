---
title: Gramex 1.83 release notes
prefix: 1.83
...

[TOC]

Gramex 1.83 supports Named Entity Recognition, distributed OTPs, a slim Docker build, and more.

## Named Entity Recognition

To set it up, install:

```shell
pip install spacy transformers torch datasets
```

Then use this configuration:

```yaml
url:
  ner:
    pattern: /ner
    handler: MLHandler
    kwargs:
      model:
        class: NER
      xsrf_cookies: false
```

Now visit:

```text
/ner?
  text=Narendra Modi is the PM of India&
  text=Joe Biden is the President of the United States and lives in Washington DC
```

... to see the following output. This infers that `Narendra Modi` is a person, `India` is a location,
`Joe Biden` is a person, `States` is a location, and `Washington DC` is a location.

```json
[
  {
    "text": "Narendra Modi is the PM of India.",
    "labels": [{
      "start": 0,
      "end": 13,
      "label": "PER"
    },
    {
      "start": 27,
      "end": 32,
      "label": "LOC"
    }
    ]
  },
  {
    "text": "Joe Biden is the President of the United States and lives in Washington DC.",
    "labels": [{
      "start": 0,
      "end": 9,
      "label": "PER"
    },
    {
      "start": 40,
      "end": 47,
      "label": "LOC"
    },
    {
      "start": 61,
      "end": 74,
      "label": "LOC"
    },
    ]
   }
]
```

## Distributed OTP and API keys

By default, [OTPs](../../auth/#otp) and [API keys](../../auth/#api-key) are stored locally in a SQLite database.

If you load-balance a Gramex app across multiple servers, the OTPs and API keys created on one
server won't be shared with the other servers.

To share the keys, add an `storelocations.otp` configuration to `gramex.yaml` that points to a shared database:

```yaml
storelocations:
  otp:
    url: mysql+pymysql://root@server/db
    table: otp
```

The `url` can point to any [FormHandler compatible database](../formhandler/#supported-databases).
The `table` can be any new table name. Gramex tries to create it with the following columns. You
can point to any existing table with these columns too:

- `user`: TEXT
- `email`: TEXT
- `token`: TEXT
- `expire`: REAL

## Slim Docker build

The full [gramener/gramex Docker image](https://hub.docker.com/repository/docker/gramener/gramex)
was well over 2GB. This is mainly because the [UI components](../../uicomponents/) took up considerable space.

Gramex now has a [gramener/gramex-base Docker image](https://hub.docker.com/repository/docker/gramener/gramex-base)
that's half the size (just over 1GB). It does not support
[UI components](../../uicomponents/),
[CaptureHandler](../../capturehandler/) or
[SASS](../../filehandler/#sass),
but can be used to run schedulers, alerts, and serve APIs through
[FormHandler](../../formhandler/),
[MLHandler](../../mlhandler/),
[FunctionHandler](../../functionhandler/), etc.

```text
$ docker images gramener/gramex*:latest
REPOSITORY             TAG       IMAGE ID       CREATED       SIZE
gramener/gramex        latest    0112c1530693   2 weeks ago   2.44GB
gramener/gramex-base   latest    f4d46b4a75ee   2 weeks ago   1.08GB
```

## RMarkdown is removed

Support for [RMarkdown](../../r/#rmarkdown) was deprecated in [v1.81](../1.81/) and has been removed.

## Bug fixes

- [LogViewer](../../logviewer/) allows `LOGVIEWER_SCHEDULER_PORT: 8000`. You don't need to specify `LOGVIEWER_SCHEDULER_PORT: "8000"` in quotes
- [OpenAPIHandler](../../openapihandler/) was missing a configuration file `openapiconfig.yaml` in the packaging and would report an error. This is fixed
- [`gramex.data.alter()`](../../api/data/#gramex.data.alter) documentation explains how to alter tables to add columns correctly

## Backward compatibility & security

Gramex 1.83 is backward compatible with [previous releases](../) unless the release notes say otherwise.
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

- 20,725 lines of Python (211 more than 1.82)
- 3,324 lines of JavaScript (same as 1.82)
- 13,202 lines of test code (12 more than 1.82)
- 89% test coverage (same as 1.82)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
