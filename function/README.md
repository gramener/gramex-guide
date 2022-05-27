---
title: Functions
prefix: Functions
desc: Functions run configurable Python code
by: TeamGramener
---

[TOC]

## Expressions

The [`gramex.yaml` configuration](../config/) uses functions in several places. For example, in:

- [FunctionHandler](../functionhandler/)'s `function:` key
- [FormHandler](../formhandler/#formhandler-transforms)'s `prepare`, `queryfunction`, `function`, and `modify` keys
- [Alert](../alert/#send alerts on condition)'s `condition` key
- [Computed variables](../config/#computed-variables)
- ... and many more

Whenever `gramex.yaml` uses a function, it accepts any Python expression. For example:

```yaml
url:
  example:
    pattern: /example
    handler: FunctionHandler
    kwargs:
      # Use **ONE** of these examples
      function: 1 + 2                     # Returns 3
      function: json.dumps(None)          # Returns "null"
      function: pd.read_csv('data.csv')   # Returns DataFrame
      function: myapp.myfunc(handler)
```

Gramex automatically imports modules, e.g. `import mymodule` in the above example.

**Quote the expression**. Else the YAML parser may misinterpret it. For example:

```yaml
      function: json.dumps({"x": 1})    # Invalid YAML because of the colon (:)
      function: 'json.dumps({"x": 1})'  # Valid: quoted string
      function: >                       # Valid: multi-line string
        json.dumps({"x": 1})
```

## Pipelines

You can also write a list of steps for a function. We call these pipelines. For example, to generate a random number in [FunctionHandler](../functionhandler/):

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

When you visit [`/random`](random), it always runs the 2 steps in order: `random.seed(0)` first, then `random.randint(0, 100)`. It returns the *same random number* every time.

::: example href=random source=https://github.com/gramener/gramex-guide/tree/master/function/gramex.yaml
    Visit /random


To assign the output of a step to a variable, use `{name: ...}`. For example:

```yaml
url:
  random-sum:
    pattern: /randomsum
    handler: FunctionHandler
    kwargs:
      function:
        - {name: x, function: random.randint(0, 100)}
        - {name: y, function: random.randint(0, 100)}
        - x + y
```

The output will be the sum of 2 random numbers between 0-100 that changes on every reload.

::: example href=randomsum source=https://github.com/gramener/gramex-guide/tree/master/function/gramex.yaml
    Visit /randomsum
