---
title: Gramex Code Complexity
prefix: Complexity
...

Run `gramex complexity` on any Gramex app to measure the
[Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
of the code.

Here's an example:

```text
$ gramex complexity
    py   js  gramex
0  121  345    2782
```

The columns are:

- `py`: Python code complexity
- `js`: JavaScript code complexity
- `gramex`: Complexity of the Gramex codebase used by the project

This is useful to see what % of the code re-uses Gramex code, and what % is custom code.

Put another way, without Gramex, the project would have a complexity of 122 + 345 + 2,782 = 3,249.

Gramex reduces 2,782 / 3,249 = 86% of the code.
