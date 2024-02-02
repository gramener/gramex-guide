---
title: ModelHandler provides ML APIs
prefix: ModelHandler
icon: modelhandler.png
desc: ModelHandler exposed machine learning models as APIs
by: TeamGramener
type: microservice
...

ModelHandler exposes machine learning models as APIs that applications can use
over a REST API. (From **v1.46**.)

[TOC]

# Classifier

Classifiers categories input data into different classes. This is used for success/failure
prediction in many scenarios. Here's an example that classifies [iris.csv](iris.csv):

```python
import pandas as pd
from gramex.ml import Classifier

# Read the data into a Pandas DataFrame
data = pd.read_csv('iris.csv', encoding='utf-8')

# Construct the model. The model only accepts a path where it should be saved
model = Classifier(
    model_class='sklearn.svm.SVC',        # Any sklearn model works
    model_kwargs={'kernel': 'sigmoid'},   # Optional model parameters
    url=filepath,
    # Input column names in data
    input=['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
    output='species'
)
# Train the model
model.train(data)                         # DataFrame with input & output columns
model.save('iris.pkl')
```

This saves the model as `model.pkl`. You can use this in Python to make predictions:

```python
import gramex.ml

model = gramex.ml.load('iris.pkl')
result = model.predict([{
  'sepal_length': 5.7,
  'sepal_width': 4.4,
  'petal_length': 1.5,
  'petal_width': 0.4,
}])
# result should be ['setosa']
```

# Expose Endpoints

Such ML models can be exposed as a REST API.

```yaml
url:
  modelhandler:
    pattern: /$YAMLURL/model/(.*?)/(.*?)
    handler: ModelHandler
    kwargs:
      path: $YAMLPATH # Folder with model files
```

This folder may contain multiple models. In our example, it would have `iris.pkl`. The endpoint for
this model is [`model/iris/`](model/iris/), which shows basic model information.

::: example href=model/iris/ source=https://github.com/gramener/gramex-guide/blob/master/modelhandler/gramex.yaml
See the Iris model info

To classify using the model, visit
[`model/iris/?sepal_width=1&sepal_length=2&petal_width=3&petal_length=4`](model/iris/?sepal_width=1&sepal_length=2&petal_width=3&petal_length=4).
This returns a JSON list with the inputs and the result:

```json
[
  {
    "sepal_length": "2",
    "sepal_width": "1",
    "petal_length": "4",
    "petal_width": "3",
    "result": "versicolor"
  }
]
```

<form action="model/iris/" class="w-auto">
  <div class="form-group row">
    <label class="col-sm-6 col-form-label">Sepal Width</label>
    <div class="col-sm-6">
      <input name="sepal_width" type="number" step="0.1" value="4.4" class="form-control">
    </div>
  </div>
  <div class="form-group row">
    <label class="col-sm-6 col-form-label">Sepal Length</label>
    <div class="col-sm-6">
      <input name="sepal_length" type="number" step="0.1" value="5.7" class="form-control">
    </div>
  </div>
  <div class="form-group row">
    <label class="col-sm-6 col-form-label">Petal Width</label>
    <div class="col-sm-6">
      <input name="petal_width" type="number" step="0.1" value="0.4" class="form-control">
    </div>
  </div>
  <div class="form-group row">
    <label class="col-sm-6 col-form-label">Petal Length</label>
    <div class="col-sm-6">
      <input name="petal_length" type="number" step="0.1" value="1.5" class="form-control">
    </div>
  </div>
  <button type="submit" class="btn btn-primary">Try it out</button>
</form>

You can classify as many inputs as required by repeating the parameters. For example:

```text
model/iris/?sepal_width=1.2&sepal_length=2.4&petal_width=3.2&petal_length=4.2
           &sepal_width=4.4&sepal_length=5.7&petal_width=0.4&petal_length=1.5
           &sepal_width=7.2&sepal_length=3.6&petal_width=6.1&petal_length=2.5
```

returns:

```json
[
  {
    "sepal_length": "2.4",
    "sepal_width": "1.2",
    "petal_length": "4.2",
    "petal_width": "3.2",
    "result": "versicolor"
  },
  {
    "sepal_length": "5.7",
    "sepal_width": "4.4",
    "petal_length": "1.5",
    "petal_width": "0.4",
    "result": "setosa"
  },
  {
    "sepal_length": "3.6",
    "sepal_width": "7.2",
    "petal_length": "2.5",
    "petal_width": "6.1",
    "result": "virginica"
  }
]
```

::: example href="model/iris/?sepal_width=1.2&amp;sepal_length=2.4&amp;petal_width=3.2&amp;petal_length=4.2&amp;sepal_width=4.4&amp;sepal_length=5.7&amp;petal_width=0.4&amp;petal_length=1.5&amp;sepal_width=7.2&amp;sepal_length=3.6&amp;petal_width=6.1&amp;petal_length=2.5" source="https://github.com/gramener/gramex-guide/blob/master/modelhandler/gramex.yaml"
Try classifying multiple values

Notes:

- To create a model send a PUT/POST request to `/model/<name>/` with the following
  URL Query Parameters or JSON Body Arguments
  - `model_class`: the scikit-learn class of the model you want to train
  - `url`: any valid formhandler URL, Currently, you can't send a file to the endpoint.
    If using a database, add a query/queryfunction/table as you would for formhandler.
  - `input`: the columns in the dataset to use as inputs for the model.
  - `output`: the output column.
  - `model_kwargs (optional)`: a dictionary with any model parameters
  - `labels (optional)`: list of possible output values
- creating a model, will not train by default - just create the model object and save it to disk.
- Send a PUT/POST Request with `Model-Retrain: true` in the request headers to train
  the model on the training data.
- To get predictions, send a GET/POST Request to `/model/name/` with the input columns
  as URL Query Parameters/JSON Body Arguments.
- Multiple predictions are available by sending lists through URL Query Parameters/JSON Body Arguments.
  JSON Body Arguments can be formatted as follows

```JSON
{
    "col1":["val1","val2"],
    "col2":["val3","val4"],
    "model_class":"sklearn.ensemble.RandomForestClassifier"
}
```

URL Query Parameters can be sent as they usually are in formhandler -
`/model/<name>/?col1=val1&col2=val2&col1=val3..`

- You can view training data by sending a GET request to `/model/<name>/data`
  and passing formhandler filters/extensions as URL query parameters
- You can edit/add to/Delete training data by sending the respective
  PUT/POST/DELETE Request to `/model/<name>/data`
- Sending a DELETE Request to `/model/<name>/` will delete the model.

## Example Usage

for example, the following requests via [httpie](https://httpie.org/) will let you
create a model around the [iris dataset](https://en.wikipedia.org/wiki/Iris_flower_data_set)
assuming that the server has a iris.csv inside the app folder

```console
http PUT https://learn.gramener.com/guide/modelhandler/model/iris/ \
model_class=sklearn.linear_model.SGDClassifier \
output=species Model-Retrain:true url=iris.csv
```

If no input is sent, it will assume all columns except the output column are the input columns.

If no output is sent, it will assume the right-most or last column of the table is the output column.

Post which, visiting [this link](./model/iris/) wil return the model parameters and visiting
[this link](./model/iris/?sepal_width=4.4&sepal_length=5.7&petal_width=0.4&petal_length=1.5)
will return a prediction as a json object. (Answer should be setosa)

This form applies the URL query parameters directly. Try it.

## API Reference

- `GET /model/<name>/` shows the model info ([example](model/iris/))
  - Input: None
  - Output: model info, e.g. `{"model_class": "sklearn.svm.SVC", ...}`
- `GET /model/<name>/data` returns model data ([example](model/iris/data))
  - Input: None
  - Output: model training data, e.g. `[{"sepal_length":5.1,...},...]`
- `POST /model/<name>` trains a model or gets a prediction
  - Header: `Model-Retrain: true` retrains the model
  - Input:
    - URL query parameters: `?model_class=...&input=...&input=...`
    - JSON body `{"col1":["val1",...],"col2":["val1",...]`}
  - Output: model_class, input, output, url, labels, model_kwargs <column, value pairs>
- `POST /model/<name>/data` inserts rows into training data
  - Input:
    - URL query parameters: `?id=...&col1=...&col2=...`
    - JSON body `{"col1":["val1",...],"col2":["val1",...]`}
  - Output: column, value pairs
- `PUT /model/<name>` train a model
  - Header: `Model-Retrain: true` retrains the model
  - Input:
    - URL query parameters: `?model_class=...&input=...&input=...`
    - JSON body `{"col1":["val1",...],"col2":["val1",...]`}
  - Output: model_class, input, output, url, labels, model_kwargs <column, value pairs>
- `PUT /model/<name>/data` filters rows by columns in id and updates with rest of args
  - Input:
    - URL query parameters: `?id=...&col1=...&col2=...`
    - JSON body `{"col1":["val1",...],"col2":["val1",...]`}
  - Output: id, (column, value) pairs
- `DELETE /model/<name>` deletes a model
- `DELETE /model/<name>/data` deletes rows based on id, id needs to be a primary or composite key and in the case of files, a string/object type column
  - Input:
    - URL query parameters: `?id=...&col1=...&col2=...`
    - JSON Body `{"id": ...}`

# GroupMeans

`gramex.ml` provides access to the `groupmeans()` function that allows you to see
the most significant influencers of various metrics in your data. (**1.42**)

groupmeans accepts the following parameters-

- `data` : pandas.DataFrame
- `groups` : non-empty iterable containing category column names in data
- `numbers` : non-empty iterable containing numeric column names in data
- `cutoff` : ignore anything with prob > cutoff. `cutoff=None` ignores significance checks,
  speeding it up a LOT.
- `quantile` : number that represents target improvement. Defaults to `.95`.
  - The `diff` returned is the % impact of everyone moving to the 95th percentile
- `minsize` : each group should contain at least `minsize` values.
  - If `minsize=None`, automatically set the minimum size to 1% of the dataset,
    or 10, whichever is larger.

For more information, see [autolysis.groupmeans](https://learn.gramener.com/docs/groupmeans.html.html)

For example, Groupmeans used in an FormHandler

```yaml
url:
  groupmeans-insights:
    pattern: /$YAMLURL/
    handler: FormHandler
    kwargs:
      url: $YAMPATH/yourdatafile.csv
      modify: groupmeans_app.groupmeans_insights(data, handler)

  groupmeans-data:
    pattern: /$YAMLURL/data
    handler: FormHandler
    kwargs:
      url: $YAMPATH/yourdatafile.csv
      default:
        _format: html
```

And in `groupmeans_app.py`

```python
import gramex.ml

def groupmeans_insights(data, handler):
    args = handler.argparse(
        groups={'nargs': '*', 'default': []},
        numbers={'nargs': '*', 'default': []},
        cutoff={'type': float, 'default': .01},
        quantile={'type': float, 'default': .95},
        minsize={'type': int, 'default': None},
        weight={'type': float, 'default': None})
    return gramex.ml.groupmeans(data, args.groups, args.numbers,
                                args.cutoff, args.quantile, args.weight)

```

# Links to Machine Learning and Analytics Usecases

[Groupmeans Applied to the National Acheivement Survey Dataset](../groupmeans/)
