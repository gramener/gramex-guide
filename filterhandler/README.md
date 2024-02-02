---
title: FilterHandler
prefix: FilterHandler
icon: filterhandler.png
desc: FilterHandler lets you filter columns from files and databases
by: TeamGramener
type: microservice
...

[TOC]

## Populate filter values

FilterHandler lets you create dropdowns for filters from data.

Creating filters is a non-trivial problem. Take this table:

| city | product |
| :--- | :------ |
| Rome | Doll    |
| Rome | Cap     |
| Oslo | Doll    |
| Oslo | Belt    |

By default, filters should show:

- `city: Rome | Oslo`
- `product: Doll | Cap | Belt`

But if the user **SELECTS** Rome, the filters should show:

- `city: Rome | Oslo`. Though Olso is selected, Rome is visible. That's to allow **CHANGING** the city
- `product: Doll | Belt`. Not Cap, since they are not sold in Oslo

![FilterHandler values example](filterhandler-values.gif)

FilterHandler returns the list of filter values to display **when a selection is made**.

## FilterHandler usage

Here is a sample configuration to filter data columns from a CSV file:

```yaml
url:
  flags:
    pattern: /filter
    handler: FilterHandler
    kwargs:
      url: $YAMLPATH/city-products.csv
```

`/filter` returns `{}`, since we haven't specified any columns to return

`/filter?_c=city` returns unique values for `city`:

```json
{
  "city": [{ "city": "Oslo" }, { "city": "Rome" }]
}
```

`/filter?_c=city&_c=product` returns unique values for `city` and `product`:

```json
{
  "city": [{ "city": "Oslo" }, { "city": "Rome" }],
  "product": [
    { "product": "Belt" },
    { "product": "Cap" },
    { "product": "Doll" }
  ]
}
```

`/filter?_c=city&_c=product&_sort=-city&_sort=-product` returns unique values for `city` and `product`,
sorting both in descending order alphabetically:

```json
{
  "city": [{ "city": "Rome" }, { "city": "Oslo" }],
  "product": [
    { "product": "Doll" },
    { "product": "Cap" },
    { "product": "Belt" }
  ]
}
```

`/filter?_c=city&_c=product&city=Oslo` returns unique values for `city` and `product` when `city=Oslo` is selected.
Note that `Cap` is missing.

```json
{
  "city": [{ "city": "Oslo" }, { "city": "Rome" }],
  "product": [{ "product": "Belt" }, { "product": "Doll" }]
}
```

::: example href=flags?\_c=Name&\_c=Continent&\_format=html&\_limit=5 source=https://github.com/gramener/gramex-guide/blob/master/filterhandler/gramex.yaml
FilterHandler example

## FilterHandler Features

FilterHandler supports most [FormHandler filters](../formhandler/#formhandler-filters)

- [`?_c=Name`](flags?_c=Name&_format=html) ► unique values of `Name` column
- [`?_c=Continent&_c=Name`](flags?_c=Continent&_c=Name&_format=html) ► unique values of `Continent` and `Name`
- [`?_c=Continent&_c=Name&Name=Andorra`](flags?_c=Continent&_c=Name&Name=Andorra&_format=html) ► unique `Continent` by filtering `Name=Andorra`, and unique `Name` **without** filtering `Name=Andorra`
- [`?_c=Name&_sort=-Name&_limit=10`](flags?_c=Name&_sort=-Name&_limit=10&_format=html) ► 10 `Name`s sorted descending
- [`?_c=c1|min`](flags?_c=c1|min&_format=html) ► minimum of `c1`
- [`?_c=c1|max`](flags?_c=c1|max&_format=html) ► maximum of `c1`
- [`?_c=c1|sum`](flags?_c=c1|sum&_format=html) ► sum of `c1`
- [`?_c=c1|avg`](flags?_c=c1|avg&_format=html) ► average of `c1`

To control the output, you can use these control arguments:

- Limit rows: [?\_c=Name&\_limit=10](flags?_c=Name&_limit=10&_format=html) ► show only 10 rows
- Sort order: [?\_c=Continent&\_sort=-Continent](flags?_c=Continent&_sort=-Continent&_format=html) ► sort Continents (descending)

FilterHandler supports all files, databases and options supported by
[FormHandler](../formhandler/). That includes:

- Connecting to [files](../formhandler/#supported-files) and [databases](../formhandler/supported-databases)
- Rendering different [formats](../formhandler/#formhandler-formats)
- Support for [downloads](../formhandler/#formhandler-downloads)
- [Transforms](../formhandler/#formhandler-transforms) using
  [`prepare`](../formhandler/#formhandler-prepare),
  [`function`](../formhandler/#formhandler-function), or
  [`modify`](../formhandler/#formhandler-modify).
- Rendering [templates](../formhandler/#formhandler-templates)

## FilterHandler hierarchies

**v1.85**. You can create a single filters for multiple columns.
`/filter?_c=city,product` returns unique values for the `city` and `product` combination:

```json
{
  "city,product": [
    { "city": "Oslo", "product": "Belt" },
    { "city": "Oslo", "product": "Doll" },
    { "city": "Rome", "product": "Cap" },
    { "city": "Rome", "product": "Doll" }
  ]
}
```

This is particularly useful to create a filter with hierarchies like:

<details open>
  <summary>Oslo</summary>
  <ul><li>Doll</li><li>Belt</li></ul>
</details>
<details open>
  <summary>Rome</summary>
  <ul><li>Cap</li><li>Doll</li></ul>
</details>

::: example href=flags?\_c=Name,Continent&\_format=html&\_limit=5 source=https://github.com/gramener/gramex-guide/blob/master/filterhandler/gramex.yaml
FilterHandler hierarchies example

## FilterHandler Ranges

**v1.86**. FilterHandler can return ranges of values for a column using the `_c=<col>|range` syntax.

::: example href=flags?\_c=c1|range&\_c=c2|range&\_format=html source=https://github.com/gramener/gramex-guide/blob/master/filterhandler/gramex.yaml
FilterHandler range example

For example, `?_c=c1|range&_c=c2|range` returns the min and max values of columns `c1` and `c2`:

```json
{
  "c1|range": [
    {
      "c1|min": 0,
      "c1|max": 97
    }
  ],
  "c2|range": [
    {
      "c2|min": 0,
      "c2|max": 50
    }
  ]
}
```

This is useful for [range filters](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) like:

```html
<input
  type="range"
  min="${filter['c1|range'][0]['c1|min']}"
  max="${filter['c1|range'][0]['c1|max']}"
/>
```

## FilterHandler in memory

**v1.86**. FilterHandler runs a database query for _each_ column that you request.

For slow database connections, you can speed this up with `in_memory: true`. For example:

```yaml
url:
  flags:
    pattern: /filter
    handler: FilterHandler
    kwargs:
      url: $YAMLPATH/city-products.csv
      in_memory: true
```

When you request `?_c=city&_c=product`, FilterHandler fetches all unique combinations of `city` and
`product` into memory. **Then** it further creates combinations.

This only runs a single query, but uses a bit more memory.
