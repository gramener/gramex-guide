---
title: Gramex 1.61.1 release notes
prefix: 1.61.1
...

This patch release fixes these bugs in [Gramex 1.61 (1 May 2020)](../1.61/).

- [#257](https://github.com/gramener/gramex/issues/257): When using [PPTXHandler](../../pptxhandler/) or importing `gramex.pptgen2`, Gramex raised a `FileNotFoundError`.
- [PPTXHandler](../../pptxhandler/) only uses the last image when setting images on cloned shapes
- [PPTXHandler](../../pptxhandler/) did not warn user if an invalid command or shape is used
- [PPTXHandler](../../pptxhandler/) did not accept `unit: Inches` unless it was in lowercase
- NumPy version 1.17 has RMarkdown installation issues. Restricting version to >= 1.16, < 1.17
- [Gramex init](../../init/) generated a gramex.yaml that had special characters in keys if the folder name has special characters
- [Scheduler](../../scheduler/) rest cases revised to speed up local testing

It also features a preview of [PPTXHandler's table features](../../pptxhandler/#table).

## Statistics

The Gramex code base has:

- 17,625 lines of Python (248 more than 1.61)
- 1,694 lines JavaScript (same as 1.61)
- 10,645 lines of test code (254 more than 1.61)
- 81% test coverage (4% more than 1.60)

## How to upgrade

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
pip install --upgrade gramexenterprise    # If you use DBAuth, LDAPAuth, etc.
gramex setup --all
```
