# g1.datafilter

`g1.datafilter(data, filters)` returns the filtered data based on the filters. While urlfilter on [$.formhandler](#formhandler) applies filtering on data server side, `datafilter` applies urlfilter on frontend loaded data.

For example:

```js
var data = [
  {"ID": "1", "product": "Fan", "sales": "100", "city": "NY"},
  {"ID": "2", "product": "Fan", "sales": "80", "city": "London"},
  {"ID": "3", "product": "Fan", "sales": "120", "city": "NJ"},
  {"ID": "4", "product": "Fan", "sales": "130", "city": "London"},
  {"ID": "5", "product": "Light", "sales": "500", "city": "NY"},
  {"ID": "5", "product": "Light", "sales": "100", "city": "London"}
]

g1.datafilter(data, {
  'sales>': ['100'],
  'city': ['London', 'NJ'],
  'product': ['Fan']
})
// Returns [{"ID": "3", "product": "Fan", "sales": "120", "city": "NJ"}, {"ID": "4", "product": "Fan", "sales": "130", "city": "London"}]
```

g1.datafilter with multiple datasets:

```js
var data1 = [
  {"ID": "1", "product": "Fan", "sales": "100", "city": "NY"},
  {"ID": "2", "product": "Fan", "sales": "80", "city": "London"},
  {"ID": "3", "product": "Fan", "sales": "120", "city": "NJ"},
  {"ID": "4", "product": "Fan", "sales": "130", "city": "London"},
  {"ID": "5", "product": "Light", "sales": "500", "city": "NY"},
  {"ID": "5", "product": "Light", "sales": "100", "city": "London"}
]

var data2 = [
  {"ID": "1", "city": "NY"},
  {"ID": "2", "city": "London"},
  {"ID": "3", "city": "NJ"},
  {"ID": "4", "city": "London"},
  {"ID": "5", "city": "NY"},
  {"ID": "5", "city": "London"}
]

g1.datafilter(data1, {
  'datsetname2:city': ['London', 'NJ'],
  'sales>~': [100],
  'datsetname1:product': ['Fan']
}, 'datsetname1'))
// ignores datsetname2:city: ['London', 'NJ']

// Returns [{"ID": "3", "product": "Fan", "sales": "120", "city": "NJ"}, {"ID": "4", "product": "Fan", "sales": "130", "city": "London"}, {"ID": "1", "product": "Fan", "sales": "100", "city": "NY"}]


g1.datafilter(data2, {
  'datsetname2:city': ['London', 'NJ'],
  'sales>~': [100],
  'datsetname1:product': ['Fan']
}, 'datsetname2'))

// ignores datsetname1:product: ['Fan']

// Return [
//   {"ID": "2", "city": "London"},
//   {"ID": "3", "city": "NJ"},
//   {"ID": "4", "city": "London"},
//   {"ID": "5", "city": "London"}
// ]
```

- `data`: a list of objects
- `filters`: [formhandler filters][formhandler-filters] extracted using
  `g1.url.parse(url).searchList`. This converts `?city=London&sales>=1000` to
  this filters object: `{'city': ['London'], 'sales>': ['1000']}`
- `namespace`: (optional) If `namespace` is not given, all filters are applied
  on the dataset. If `namespace` is given, only filters that begin with
  `<namespace>:` or that have no `:` are applied

[formhandler-filters]: https://learn.gramener.com/guide/formhandler/#formhandler-filters
