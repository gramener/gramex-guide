---
title: MLPredictor runs models
prefix: MLPredictor
icon: mlpredictor.png
desc: MLPredictor lets you run existing models on dynamic data
by: TeamGramener
type: microservice
...


**v1.84**. [MLPredictor](.) lets you run ML models on dynamic datasets and render the output in a [FormHandler](../formhandler/)-like interface.

You should use MLPredictor if

- **You've already built a model**. You can use any library that supports a `scikit-learn` compatible `.predict()` function. You must save it as `model.pkl`
- **You want to apply it to a dynamic data source**, e.g. a database or file that's refreshed daily

Let's create a sample classifier model with this [`iris.csv`](../modelhandler/iris.csv) and save it in `model.pkl`:

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

- `config_dir`: The directory containing a `model.pkl` file. The file **MUST** be called `model.pkl`. This is consistent with [MLHandler](../mlhandler/)
- `data`: The location of the data to predict from. This can contain any dynamic [database](../formhandler/#supported-databases)
  dynamic [file](../formhandler/#supported-files). E.g.:
  - `data: {url: /path/to/file.xlsx}`
  - `data: {url: 'postgresql://$USER:$PASS@server/db'; table: public.sales}`
- `columns`: List of input columns from `data` to pass to the model. If the model was created with [MLHandler](../mlhandler/), this is optional.
- `target_col`: Optional name of the predicted column. If the model was created with [MLHandler](../mlhandler/), it picks it from the training dataset. Else defaults to `prediction`.


All [FormHandler filters](../formhandler/#formhandler-filters) are applicable, making MLPredictor an good way to predict for different  subsets. For example:

- `/mlpredictor?date=2022-22-02` -- predict all results for a specific date
- `/mlpredictor?sort=-date&_limit=30` -- predict the 30 most recent results
- `/mlpredictor?city=Rome` -- predict only for the city of Rome
