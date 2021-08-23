---
title: Gramex 1.71 release notes
prefix: 1.71
...

[TOC]

Gramex 1.71 introduces ComicHandler to serve comics as an API, security fixes, and more.


## ComicHandler serves comics

[ComicHandler](../../comichandler/) serves comics as SVG files. It's based on the [Comicgen](https://gramener.com/comicgen/) library. Here's how to create a ComicHandler:

```yaml
url:
  comics:
    pattern: /$YAMLURL/comics
    handler: ComicHandler
```

Now, [`name=dee&angle=straight&emotion=smile&pose=super`](name=dee&angle=straight&emotion=smile&pose=super) serves this SVG image:

![Sample comic](../../comichandler/sample.svg){.img-fluid}

This lets you create a variety of comic data stories. For examples, see [gramener.com/datacomics/](https://gramener.com/datacomics/).


## More robust security

Gramex passes security tests from 4 security testing tools:

- [Bandit](https://bandit.readthedocs.io/en/latest/) for Python security tests
- [npm audit](https://docs.npmjs.com/cli/v7/commands/npm-audit) for front-end vulnerabilities
- [Snyk](https://snyk.io/) for overall code security
- [ClamAV](https://www.clamav.net/) for anti-virus tests

Future releases will be tested against these.
[See the results.](https://github.com/gramener/gramex/tree/master/reports)


## Specify URL where Gramex is running

If you're redirected to the wrong page after logging in, this feature may help fix that issue.


If you run Gramex at `example.com` on port 9988, and use an
[nginx proxy](../../deploy/#nginx-reverse-proxy) to redirect `/project` to that port:

```nginx
    location /project/ {                    # example.com/project/* maps to
        proxy_pass http://127.0.0.1:9988/;  # 127.0.0.1:9988/
    }
```

... you can send Gramex a `X-Gramex-Root` header, telling Gramex that the application is hosted at
`/project/`:

```nginx
    location /project/ {                    # example.com/project/* maps to
        proxy_pass http://127.0.0.1:9988/;  # 127.0.0.1:9988/
        proxy_set_header X-Gramex-Root /project/;
    }
```


Now, redirects are interpreted **relative to** `/project/`.

So `example.com/project/login?next=/` will now redirect the user to `example./project/` instead of
`example.com`.


## Gramex prefers npm over yarn

Gramex has fully migrated from yarn to npm as the preferred package manager -- to reduce dependencies.

Specifically, when you run [`gramex install`](../../install/):

1. If `package-lock.json` exists, it runs `npm ci` to re-install all packages without changing `package-lock.json`
2. Else if `yarn.lock` exists, it runs `yarn install`
3. Else if `package.json` exists, it runs `npm install` -- not `yarn install`



## JSONHandler escapes slashes in keys

[JSONHandler](../../jsonhandler/) now supports
[keys that have a `/` in them](../../jsonhandler/#escaping-slash-in-keys).

Earlier, if there was a key called `"home/page"`, there was no way to directly fetch its value.

Now, you can fetch `"home\/page"` instead. The `\/` escapes slashes.
[Read more](../../jsonhandler/#escaping-slash-in-keys).


## Deprecations

`gramex.cache.open()` no longer reads XML, RSS, ATOM or SVG files as lxml trees. This is a rarely (perhaps never) used feature.

You can still use `ext="txt"` to open them as text files, or use your own custom transform to read them.


## Bug fixes

- [Session inactive expiry](../../auth/#inactive-expiry) did not work with Redis cache -- because
  we were saving the session *before* updating the last active time. This is fixed.
- [pynode.node.js()](../../node/) installs npm packages into a new directory `$GRAMEXDATA/pynode/` by default.
  So, Gramex's own `gramex/apps/pynode/package.json` source code is not affected when users install new libraries.
- The [Gramex Windows Service](../../deploy/#windows-service) writes logs to a `service.log` in the
  current folder. This helps debug Windows services messages.
- MongoDB object IDs are converted into strings. [#430](https://github.com/gramener/gramex/issues/430)
- We've fully switched to Python 3 and eliminated the `six` package


## Backward compatibility & security

Gramex 1.71 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

[Backward compatibility tests for 1.71](https://travis-ci.com/github/gramener/gramex/builds/234220301){:.btn .btn-lg .btn-primary}

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

- 19,193 lines of Python (134 more than 1.70)
- 3,361 lines of JavaScript (86 less than 1.70)
- 12,320 lines of test code (64 more than 1.70)
- 89% test coverage (same as 1.70)


## How to install

See the [Gramex installation and upgrade instructions](../../install/).

Note: Gramex 1.71 does not work with Python 3.8 or 3.9. We recommend Python 3.7.
