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
  "city":[
    { "city":"Oslo" },
    { "city":"Rome" }
  ]
}
```

`/filter?_c=city&_c=product` returns unique values for `city` and `product`:

```json
{
  "city": [
    { "city": "Oslo" },
    { "city": "Rome" }
  ],
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
  "city": [
    { "city": "Rome" },
    { "city": "Oslo" }
  ],
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
  "city": [
    { "city": "Oslo" },
    { "city": "Rome" }
  ],
  "product": [
    { "product": "Belt" },
    { "product": "Doll" }
  ]
}
```

**v1.85**. `/filter?_c=city,product` returns unique values for the `city` and `product` combination:

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

::: example href=flags?_c=Name&_c=Continent&_format=html&_limit=5 source=https://github.com/gramener/gramex-guide/blob/master/filterhandler/gramex.yaml
    FilterHandler example

- Simple: [`flags?_c=Name`](flags?_c=Name&_format=html)
  returns all unique values of `Name` column
- Muliple Columns: [`flags?_c=Continent&_c=Name`](flags?_c=Continent&_c=Name&_format=html)
  returns all unique values of `Name` and `continent` columns
- Multiple Columns with filter: [`flags?_c=Continent&_c=Name&Name=Andorra`](flags?_c=Continent&_c=Name&Name=Andorra&_format=html)
  returns all unique values of `Name` without filtering `Name=Andorra` and `Continent` by filtering `Name=Andorra`
- Sort descending with limit: [`flags?_c=Name&_sort=-Name&_limit=10`](flags?_c=Name&_sort=-Name&_limit=10&_format=html) returns 10 `Name`s sorted descending

## FilterHandler Features

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
