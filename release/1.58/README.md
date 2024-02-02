---
title: Gramex 1.58 release notes
prefix: 1.58
...

[TOC]

## UI component upgrades

- Following libraries have been upgraded
  - `fontawesome` to 5.11.2
  - `bootstrap-select` to 1.13.12
  - `d3v5` to 5.14.1
  - `morphdom` to 2.5.10
  - `select2` to 4.0.12
  - `vega-embed` to 4.2.5
  - `vega` to 5.8.1
- Other UI components have also been updated to the latest patch versions.

## Developer updates

- `request` dependency is added to gramex
  Fixes [#201](https://github.com/gramener/gramex/issues/201)
- `psycopg2` is now optional dependency.
  If you're using PostgreSQL connector, you'd need to install this.

## Azure Active Directory

Sample configuration for [Azure Active Directory](../../auth/#azure-active-directory)
is added to the guide.

## Bug fixes

- Since `1.52` a bug was introduced in `FileHandler` that allowed access
  to files beyond parent directory/drive. This is now fixed.

## Statistics

The Gramex code base has:

- 17,351 lines of Python
- 2,339 lines JavaScript
- 9,967 lines of test code
- 80% test coverage

## How to upgrade

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
pip install --upgrade gramexenterprise    # If you use DBAuth, LDAPAuth, etc.
gramex setup --all
```
