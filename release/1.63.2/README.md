---
title: Gramex 1.63.2 release notes
prefix: 1.63.2
...

This is an internal release, and not intended for public use.

## Details

On 15 Sep, we pushed [Gramex 1.63.1](https://pypi.org/project/gramex/1.63.1/) to PyPi without an associated [tag](https://github.com/gramener/gramex/tags).

This caused the docker build to break, since it relies on the latest tag.

This release resolves the problem by creating a 1.63.2 release on PyPi and an associated 1.63.2 git tag.
