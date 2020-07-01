---
title: Gramex 1.61 release notes
prefix: 1.61
...

[TOC]

## Create interactive presentations

When creating presentations with [PPTXHandler](../../pptxhandler/v1/), you couldn't link slides.
This made the presentations static.

In 1.61, [PPTXHandler v2](../../pptxhandler/) lets you:

- Create links from any shape or text into a page
- Add transitions (especially [morph](https://youtu.be/FeUolRLacCw)) to animate your slides
- Style text with a HTML-like language (e.g. `<p bold="y" font-size="13"><a link="last">...</a></p>`)
- Repeat slides or shapes using data to create custom visualizations in PowerPoint

[Here's a bar chart race with PPTXHandler v2](../../pptxhandler/copy-slide/).

![PPTXHandler bar chart race: animated GIF](../../pptxhandler/bar-chart-race.gif)

## Fast, persistent, distributed cache

Gramex uses two kinds of [cache stores](../../cache/#cache-stores) internally:

1. A memory cache that is fast and ephemeral
2. A disk cache that is slow and persistent

Neither cache is distributed, i.e. they cannot be used across different servers.

Now a third cache type is available: Redis cache. It uses Redis as a back-end. This is fast,
persistent, and can be used across servers. If you deploy Gramex on multiple servers, this is a
good default cache to use.

```yaml
cache:
    distributed-cache:          # Define a name for the cache
        type: redis             # This is a redis cache
        path: localhost:6379:0  # Connection string for Redis instance
        size: 1000000000        # Allow ~1GB of data in the cache
```

Thanks [Niyas](@https://github.com/mniyas)!

## Reduce login issues on shared servers

When you deploy multiple apps on a single Gramex instance (e.g. on https://uat.gramener.com/), the
login link of one app often redirects to the login page of another app.

To avoid this issue, [`gramex init`](../../init/) automatically adds this line:

```yaml
auth:
  login_url: /$YAMLURL/login/
```

Your app will now redirect to your own app's login page, not the default `/login/` of the server.

PS: Some Gramex instances raised a [UnicodeError](https://github.com/gramener/gramex/issues/142)
when running Gramex. This is resolved.

## Use Python expressions in YAML

Many Gramex handlers let you use Python functions. [FunctionHandler](../../functionhandler/) lets
you call a function via `function: mymodule.my_method()`. [FormHandler](../../formhandler/) lets
you run a `modify: data.sort_values()`.

But using *expressions* wasn't possible. For example, `modify: data.T` *should* return the
transposed data. But it complains that there's no function called `data.T`.

Now, you can use expressions freely wherever functions were allowed.

## Bug fixes

- [Gramex test cases on Travis](https://travis-ci.com/github/gramener/gramex/builds) have been
  re-factored to have few or no failuers

## Statistics

The Gramex code base has:

- 17,377 lines of Python (33 more than 1.60)
- 1,694 lines JavaScript (715 less than 1.60)
- 10,645 lines of test code (559 more than 1.60)
- 81% test coverage (4% more than 1.60)

## How to upgrade

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
pip install --upgrade gramexenterprise    # If you use DBAuth, LDAPAuth, etc.
gramex setup --all
```
