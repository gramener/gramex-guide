# g1.fuzzysearch

`g1.fuzzysearch(data, options)` returns a fuzzy search function that filters
the data based on the text.

For example:

```js
var data = [
  { product: "Cider Apple Vinegar" },
  { product: "JBL In-Ear Headphones" },
  { product: "Vaseline Body Lotion" },
  { product: "Redux Men's Watch" },
  { product: "Omega3 Fish Oil" },
];

var search = g1.fuzzysearch(data, {
  keys: ["product"], // Search within these keys
  limit: 2, //  Return only the top 2 results
});

search("omega");
// Returns {product: "Omega3 Fish Oil", ...} since it's the only one
search("red");
// Returns {product: "Redux Men's Watch"} and {product: "JBL In-Ear Headphones"}
// The second matches r (in "Ear"), followed by e then d in "Headphones"
```

It matches with the following priority. For example, if the string is "alpha
beta", then:

1. Match the exact phrase ("alpha beta")
2. Match all words in the same order ("alp bet")
3. Match words in any order ("bet alp")
4. Match partial words in any order ("ba aph")
5. Match letters in order ("abt")

It accepts an `options` dict with these keys:

- `keys`: a list of keys to search in. The keys are calculated and joined with a
  space. (Default: assumes that data is a string list.) Each key can be either:
  - a string (e.g. `"name"`, `"title"`) picks keys from the objects in the
    `data` list.
  - a function (e.g. `function (v) { return v['key'] })`) runs the function on
    each element in the `data` list
- `limit`: the maximum number of results to return. (Default: `100`)
- `case`: `true` for case-sensitive comparisons. (Default: `false`)
