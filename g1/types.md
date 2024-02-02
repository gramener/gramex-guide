# g1.types

`g1.types(data)` returns the column data types. For example:

```js
var data = [
  { a: 1, b: 1.1, c: "c", d: "2014-04-04", e: true, f: new Date() },
  { a: 2, b: 2 },
];
g.types(data); // {"a":"number","b":"number","c":"string","d":"string","e":"boolean","f":"date"}
g1.types(data, { convert: true }); // {"a":"number","b":"number","c":"string","d":"date","e":"boolean","f":"date"}
```

## g1.types options

`types()` accepts 2 parameters:

- `data`: a list of objects
- `options`: a dictionary that may contain these keys:
  - `convert`: converts values to the right type. For example, "1" is converted to 1. default: `false`
  - `limit`: number of rows to evaluate. default: 1000
  - `ignore`: list of values that should be ignored. default: `[null, undefined]`

Rules:

- Evaluate up to `limit` rows
- Ignore values that are keys in the `ignore` option. Only consider the rest
- If `convert` is `false`, then for each column:
  - If all values are Date objects -> `date`
  - Else if all values are numbers -> `number`
  - Else if all values are strings -> `string`
  - Else if all values are bools -> `boolean`
  - Else if there are no values or is undefined or null -> `null`
  - Else -> `mixed`
- Else if `convert` is `true`, then for each column:
  - If all values can be converted to Date -> `date`
  - Else if all values can be converted to numbers -> `number`
  - Else if all values are bools -> `boolean`
  - Else if there are no values or is undefined or null -> `null`
  - Else -> `string`
