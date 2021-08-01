---
title: Gramex 1.57 release notes
prefix: 1.57
...

[TOC]

## UI component upgrades

g1 is upgraded from 0.17.1 to 0.17.3, which introduces

- [g1.scale](../../g1/scales) supports `reverse: true` and discrete scales
- Expose ES6 modules in `modules.js`. Allows `require('g1')` in node
- Following libraries have been upgraded
  - `leaftlet` to 1.5
  - `lodash` to 4.17.15
  - `select2` to 4.0.8
  - `vega-embed` to 4.2.2
- Other UI components have also been updated to the latest patch versions.

## Other enhancements

- [pptxhandler](../../pptxhandler) now supports pptgen table column can be positional identifiers.
via [@nivedita.deshmukh](https://code.gramener.com/nivedita.deshmukh)

## Developer updates

- `cachetools >= 3.0.0` is required from `gramex >= 1.57`.
Fixes [#179](https://github.com/gramener/gramex/issues/179)
- Added `gramex.cache.set_cache` to setup TTL caches.
Fixes [#178](https://github.com/gramener/gramex/issues/178)
- [gramex-guide](https://github.com/gramener/gramex-guide/) is now a separate repo
on [GitHub](https://github.com/gramener/gramex-guide/).
- `DataHandler`, `QueryHandler` are deperacted. Use [FormHandler](../../formhandler/)

## Bug fixes

- `gramex.cache.query` key serialization fixed with `str(sql)` and `kwargs`.
Fixes [#179](https://github.com/gramener/gramex/issues/179)


## Statistics

The Gramex code base has:

- 17,343 lines of Python
- 2,339 lines JavaScript
- 9,962 lines of test code
- 80% test coverage

## How to upgrade

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
pip install --upgrade gramexenterprise    # If you use DBAuth, LDAPAuth, etc.
gramex setup --all
```
