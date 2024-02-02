---
title: TopCause does root cause analysis
prefix: TopCause
icon: topcause.png
desc: TopCause finds the single largest action to improve a performance metric
by: TeamGramener
type: component
---

[TOC]

**v1.72.0** TopCause is an algorithm that answers the question **_What's the single biggest change I can make to improve my outcome?_**.

<div class="ratio ratio-16x9">
  <iframe src="https://www.youtube.com/embed/5JfSryDrSVY" allowfullscreen></iframe>
</div>

TopCause takes two inputs:

- `X`: all input variables that you can change as a DataFrame
- `y`: an outcome variable you want to improve as a series

Say a Rugby team is recruiting for heavy people, and have [weight data](weight.csv) like this.

| male | age  | height | weight |
| :--: | :--: | :----: | :----: |
|  1   | 90.0 | 151.7  |  47.8  |
|  0   | 90.0 | 139.7  |  36.4  |
|  0   | 90.0 | 136.5  |  31.8  |
|  1   | 20.0 | 156.8  |  53.0  |
|  0   | 10.0 | 145.4  |  41.2  |

::: example href=data?\_format=html source=https://github.com/gramener/gramex-guide/blob/master/topcause/weight.csv
See the data

If they want to know **What's the single biggest driver of weight?**, TopCause can answer that.
Here is `topcausecalc.py` which has a [FunctionHandler](../functionhandler/) that returns the drivers.

```python
import gramex.ml
import gramex.cache
from gramex.transforms import handler

@handler
def drivers():
    data = gramex.cache.open('weight.csv')
    model = gramex.ml.TopCause()
    model.fit(data, data['weight'])
    return model.result_
```

To set this up, use this `gramex.yaml`:

```yaml
url:
  topcause-drivers:
    pattern: drivers
    handler: FunctionHandler
    kwargs:
      function: topcausecalc.drivers
```

::: example href=drivers source=https://github.com/gramener/gramex-guide/blob/master/topcause/topcausecalc.py
See the drivers

## TopCause results

The result in `model.result_` is a DataFrame. For every column (feature) in `X`, there is a row in
the result that shows the impact of that feature.

Here is a sample row

|        | value | gain |    p    | type |
| :----: | :---: | :--: | :-----: | :--: |
| height | 164.5 | 12.7 | 8.4e-13 | num  |

The columns show:

- **value**: the best value for this feature. Set the feature to this value for maximum impact (e.g. recruit people with `height` of 164.5cm)
- **gain**: improvement in y if feature = value (e.g. this increases team average `weight` by 12.7 kg)
- **p**: probability that this feature does not impact y (e.g. almost zero chance that `height` does not impact weight)
- **type**: how this feature's impact was calculated (e.g. `num` or `cat`)

The above example returns:

|        | value | gain |    p     | type |
| :----: | :---: | :--: | :------: | :--: |
| weight | 55.0  | 16.9 | 1.8e-267 | num  |
| height | 164.5 | 12.7 | 8.4e-13  | num  |
|  male  |  NaN  | NaN  |  0.057   | num  |
|  age   |  NaN  | NaN  |  0.453   | num  |

This example says that:

1. **weight** has the biggest impact on weight (obviously) -- let's ignore this
2. **height** has the second biggest impact on weight. Specifically:
   - **value**: Picking people with the (high) height of 164.5 cm
   - **gain**: This can increase average weight by 12.7 kg.
   - **p**: The probability of error is small (8E-13), i.e. height definitely impacts weight
   - **type**. This column was treated as a number
3. **male** does not impact weight with enough confidence. There's a 5.7% chance it doesn't. (The default cutoff is 5%)
4. **age** does not impact weight with enough confidence. There's a 45.3% chance it doesn't.

Summary: **Recruiting tall people (~164cm) can increase team weight by ~12.7kg**

## TopCause configuration

The constructor `gramex.ml.TopCause()` accepts these parameters:

- `max_p`: float - maximum allowed probability of error (default: `0.05`).
  - To see the impact of every feature on the metric (even if it could be wrong), set `max_p=1`
  - To only see features that you're 99% sure impact the metric, set `max_p=0.01`
- `percentile`: float - ignore high-performing outliers beyond this percentile (default: `0.95`)
  - To convey "Be like the best -- even if they're an exception", set `percentile=1`
  - To convey "Be like the best -- leaving out the top 10% as outliers", set `percentile=0.95`
- `min_weight`: int - minimum samples in a group. Drop groups with fewer (default: `3`)
  - If average performance of small groups (e.g. less than 5) could be outliers, ignore them with `min_weight=5`
  - If you want to evaluate the performance of every group, set `min_weight=0`

<script>
  for (tag of document.querySelectorAll('.content table'))
    tag.classList.add('table', 'table-sm')
</script>
