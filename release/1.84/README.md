---
title: Gramex 1.84 release notes
prefix: 1.84
...

[TOC]

Gramex 1.84 adds an ML Predictor, FormHandler date comparisons, and deprecates old UI libraries.

## MLPredictor

[MLPredictor](../../mlpredictor/) lets you run ML models on dynamic datasets and render the output in a [FormHandler](../../formhandler/)-like interface.

You should use MLPredictor if

- **You've already built a model**. You can use any library that supports a `scikit-learn` compatible `.predict()` function. You must save it as `model.pkl`
- **You want to apply it to a dynamic data source**, e.g. a database or file that's refreshed daily

Let's create a sample classifier model with this [`iris.csv`](../../modelhandler/iris.csv) and save it in `model.pkl`:

```python
import joblib
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier

data = pd.read_csv('iris.csv')
model = KNeighborsClassifier()
model.fit(data.drop(columns=['species']), data['species'])
joblib.dump(model, 'model.pkl')
```

This `model.pkl` can be used to predict data from any file (including the original `iris.csv`) with this `gramex.yaml` config:

```yaml
url:
  mlpredictor-iris:
    pattern: /iris
    handler: MLPredictor
    kwargs:
      config_dir: $YAMLPATH
      data:
        url: iris.csv
      columns: [sepal_length, sepal_width, petal_length, petal_width]
      target_col: species
```

Now, visit `/iris?petal_length>=6&_format=html`. This will run the predictions for all petal lengths > 6, and show:

| sepal_length | sepal_width | petal_length | petal_width | species    |
| ------------ | ----------- | ------------ | ----------- | ---------- |
| 7.6          | 3.0         | 6.6          | 2.1         | versicolor |
| 7.3          | 2.9         | 6.3          | 1.8         | virginica  |
| 7.2          | 3.6         | 6.1          | 2.5         | virginica  |
| 7.7          | 3.8         | 6.7          | 2.2         | versicolor |
| 7.7          | 2.6         | 6.9          | 2.3         | virginica  |
| 7.4          | 2.8         | 6.1          | 1.9         | virginica  |
| 7.9          | 3.8         | 6.4          | 2.0         | versicolor |
| 7.7          | 3.0         | 6.1          | 2.3         | versicolor |

The `kwargs:` MLPredictor accepts are:

- `config_dir`: The directory containing a `model.pkl` file. The file **MUST** be called `model.pkl`. This is consistent with [MLHandler](../../mlhandler/)
- `data`: The location of the data to predict from. This can contain any dynamic [database](../../formhandler/#supported-databases)
  dynamic [file](../../formhandler/#supported-files). E.g.:
  - `data: {url: /path/to/file.xlsx}`
  - `data: {url: 'postgresql://$USER:$PASS@server/db'; table: public.sales}`
- `columns`: List of input columns from `data` to pass to the model. If the model was created with [MLHandler](../../mlhandler/), this is optional.
- `target_col`: Optional name of the predicted column. If the model was created with [MLHandler](../../mlhandler/), it picks it from the training dataset. Else defaults to `prediction`.


All [FormHandler filters](../../formhandler/#formhandler-filters) are applicable, making MLPredictor an good way to predict for different  subsets. For example:

- `/mlpredictor?date=2022-22-02` -- predict all results for a specific date
- `/mlpredictor?sort=-date&_limit=30` -- predict the 30 most recent results
- `/mlpredictor?city=Rome` -- predict only for the city of Rome

## FormHandler date comparison

[FormHandler](../../formhandler/) used to treat dates as strings for comparison. For example,
`?date>=20201231` becomes `SELECT * FROM table WHERE date > "20201231"`.

This works fine for specific date formats on specific databases, e.g. `YYYYMMDD`. But it does not
work well for `?date=2020-12-31` on all databases. Nor does `?date=12/31/2020` or `?date=31-Dec-2020`.

Now FormHandler [parses all date columns](https://pandas.pydata.org/docs/reference/api/pandas.to_datetime.html)
sensibly (defaulting to MM/DD/YY -- for example, `10/11/12` is Oct 11, 2012).


## Deprecate old UI libraries

Gramex serves several UI libraries as part of its [UI components](../../uicomponents/). But different applications need different versions.

Rather than maintain all versions in Gramex, we're deprecating these libraries. App developers should `npm install` their own libraries.

The following libraries will be removed in v1.86.

```text
"@fortawesome/fontawesome-free": "5",
"bootstrap-select": "1.13",
"comicgen": "^1.9.1",
"d3": "4",
"d3-scale-chromatic": "*",
"d3v5": "npm:d3@5",
"daterangepicker": "2",
"daterangepickerv3": "npm:daterangepicker@3",
"dayjs": "^1.11.1",
"dropzone": "5",
"file-saver": "2",
"font-awesome": "*",
"g1": "^0.18.0",
"html2canvas": "^1.4.1",
"jquery": "~3",
"leaflet": "1.6",
"lodash": "4",
"moment": "^2.29.3",
"morphdom": "2",
"noty": "3",
"numeral": "2",
"popper.js": "1",
"select2": "4",
"tether-shepherd": "1",
"topojson": "3",
"uifactory": "^1.24.0",
"url-search-params": "npm:@ungap/url-search-params@0.1",
"vega": "^5.22.1",
"vega-embed": "^6.20.8",
"vega-lite": "4",
```

## Backward compatibility & security

Gramex 1.84 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt)
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt)
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt)
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt)

## Statistics

The Gramex code base has:

- 20,767 lines of Python (42 more than 1.83)
- 3,324 lines of JavaScript (same as 1.83)
- 13,293 lines of test code (91 more than 1.83)
- 89% test coverage (same as 1.83)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
