# g1.scale

Scales is an abstraction over d3-scales and d3-scale-chromatic libraries using configurations.

Background: Scales can be thought of functions that maps input (`domain`) of numbers/categoricals to output(`range`) of numbers/categoricals. The output range can be colors, height/width pixel values of a chart.

```html
<script src="https://cdn.jsdelivr.net/combine/npm/d3-scale,npm/d3-scale-chromatic,npm/g1"></script>
```

External dependpencies: [d3-scale](https://github.com/d3/d3-scale/) and [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic)

[Read the documentation](https://learn.gramener.com/guide/g1/scales) for usage.
([source](docs/scales.md))

Scales are dictionaries with the following keys:

- `scale:` d3 scale to use. Defaults to `'linear'`.
- `domain`: a list that contains the scale's domain or `{metric: 'col_name'}`
- `range`:  a list that contains the scale's range or `{scheme: 'schemeName', count: k}`. `k` can be between 3-11 (Refer `k` value for schemes in https://github.com/d3/d3-scale-chromatic).


`scale` can take any of the values from below scale types.

**Scale Types**:

- **Quantitative Scales**
  - `Linear`
  - `Log`
  - `Pow`
  - `Sqrt`
  - `Sequential`
- **Discrete Scales**
  - `Ordinal`
  - `Band`
  - `Point`
- **Discretizing Scales**
  - `Quantile`
  - `Quantize`
  - `Threshold`


Linear scale mapping numericals to colors (Red white Green)

```js
var numericals_to_color = g1.scale(data, {
    scale: 'linear', // default
    domain: [0, 50, 100],  // can be {metric: 'age'} to auto-calculate domain
    range: ['red', 'white', 'green']
})

numericals_to_color('0') // "#efedf5"
numericals_to_color('50') // "#bcbddc"
numericals_to_color('100') // "#756bb1"
```

To map qualitative data to color scheme

```js
var categorical_to_colorscheme = g1.scale(data, {
    domain: ['hyd', 'chennai', 'bnglr', 'delhi'], // can be {metric: 'city'} to auto-calculate domain
    scale: 'Ordinal',
    range: {scheme: 'purples', count: 3}
})

categorical_to_colorscheme('hyd') // "#756bb1"
categorical_to_colorscheme('chennai') // "#bcbddc"
categorical_to_colorscheme('bnglr') // "#efedf5"
categorical_to_colorscheme('delhi') // "#756bb1" (rotates to first color because count is 3)
```

To map qualitative data to *reverse* color scheme

```js
var categorical_to_colorscheme = g1.scale(data, {
    domain: [], // if left empty, first categorical value will be mapped to first color from range
    scale: 'Ordinal',
    range: {
        scheme: 'schemePurples',
        count: 3,
        reverse: true
    }
})

categorical_to_colorscheme('apple') // "#756bb1"
categorical_to_colorscheme('orange') // "#bcbddc"
categorical_to_colorscheme('grapes') // "#efedf5"
```



To map continuous data (numericals) to color schemes:

**Notes**:

- Quantile scale divides *total data points* to bins, with each bin containing equal number of data points.
- Quantile scale takes domain as entire dataset. Metric is mandatory and should be continuous data.

```js
var quantile_scale = g1.scale(data, {
    domain: {metric: 'age'},
    scale: 'Quantile',
    range: {scheme: 'BrBG', count: 3}
})
```


**Notes**:

- Quantize scale divides *the domain* into bins of equi value (not count).

```js

var quantize_scale = g1.scale([], {
    domain: [0, 100],
    scale: 'Quantize',
    range: {
        scheme: 'Purples',
        count: 3,
        reverse: true
    }
})

quantize_scale(15) // "#efedf5" [0 - 33.3]
quantize_scale(40) // "#bcbddc" [33.3 - 66.6]
quantize_scale(70) // "#756bb1" [66.6 - 100]


var quantize_scale = g1.scale(data, {
    domain: {metric: 'age'},
    scale: 'Quantize',
    range: {
        scheme: 'schemePurples',
        count: 3
    }
})
quantize_scale(15) // "#756bb1"
quantize_scale(40) // "#bcbddc"
quantize_scale(70) // "#efedf5"

```

**Notes**:

- Threshold scales should have `n+1` values in range, when `n` is the number of values in domain.

```js
var quantize_scale = g1.scale([], {
    scale: 'Threshold',
    domain: [35],
    range: ['red', 'green'] // <35 maps to Red, >35 maps to Green
})
quantize_scale(25) // 'red'
quantize_scale(75) // 'green'


var quantize_scale = g1.scale([], {
    scale: 'Threshold',
    domain: [35],
    range: ['red', 'green'], // <35 maps to Red, >35 maps to Green
    reverse: true
})
quantize_scale(25) // 'green'
quantize_scale(75) // 'red'
```
