---
title: Gramex 1.59 release notes
prefix: 1.59
...

[TOC]

## DriveHandler manages files

[DriveHandler](../../drivehandler/) is a FormHandler-compatible replacement for
[UploadHandler](../../uploadhandler/). It makes it easy to create a Dropbox or
Google Drive clone within Gramex.

## Bug fixes

- [CaptureHandler](../../capturehandler/) ignores HTTPS errors. This prevents
  failures with outdated certificates
  [#225](https://github.com/gramener/gramex/issues/225) [Mohammad Niyas]
- [FileHandler](../../filehandler/)
  - no longer fails to guess the MIME type for capital extensions (e.g. `.JPG`).
    [#213](https://github.com/gramener/gramex/issues/213) [Pratap Vardhan]
  - preserves query parameters on redirect.
    [#221](https://github.com/gramener/gramex/issues/221)
  - does not expose `.git/` directories or other hidden sub-directories.
    [#227](https://github.com/gramener/gramex/issues/227)
- `gramex.cache.open` maps the `.h5` extension to HDF files

## UI component upgrades

- `daterangepickerv3` has been added
- `bootstrap` has been upgraded to 4.4.1 (from 4.3.1)
- `leaflet` has been upgraded to 1.6 (from 1.5)
- `vega-lite` has been upgraded to 4 (from 3)
- `vega-embed` has been upgraded to 6 (from 4)
- Other UI components have also been updated to the latest patch versions.

## API changes

[FormHandler](../../formhandler/) had a `?_format=table` option. It was
deprecated in favor of the [g1](../../g1/) FormHandler table. This is now
removed.

## Statistics

The Gramex code base has:

- 17,984 lines of Python (633 more than 1.58)
- 2,340 lines JavaScript (1 more than 1.58)
- 10,213 lines of test code (246 more than 1.58)
- 78% test coverage (2% less than 1.58)

## How to upgrade

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
pip install --upgrade gramexenterprise    # If you use DBAuth, LDAPAuth, etc.
gramex setup --all
```
