---
title: MLHandler provides ML APIs
prefix: MLHandler
icon: mlhandler.png
desc: MLHandler exposed machine learning models as APIs
by: TeamGramener
type: microservice
...

MLHandler exposes machine learning models that applications can use
over a REST API. (From **v1.67**.) It allows users to:

1. create models from scratch, and iterate upon them,
2. start with existing scikit-learn models, and evolve them.

[TOC]


# Creating New Models

To train a new model on, say, the [Titanic dataset](titanic?_download=titanic.csv&_format=csv), from scratch, use the following configuration:

```yaml
mlhandler/tutorial:
  pattern: /$YAMLURL/ml
  handler: MLHandler
  kwargs:
    data: $YAMLPATH/titanic.csv  # Path to the training dataset
    model:
      # The classification or regression algorithm to use
      class: LogisticRegression

      # Location where the trained model will be saved
      path: $YAMLPATH/titanic.pkl

      # The column to predict
      target_col: Survived

      # Columns to ignore during training
      exclude: [PassengerId, Ticket, Cabin, Name]

      # Columns to be treated as categorical variables
      cats: [Embarked, SibSp, Parch, Pclass, Sex]
```

MLHandler will then,

1. instantiate a LogisticRegression model
2. load the training data as a pandas dataframe
3. drop the excluded columns
4. [one-hot encode](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html) the categorical columns and normalize any remaining columns -
   which are implicitly assumed to be numerical.
5. train the model and save it.

Other kwargs that are supported are:

* `include`: List of columns to include for training. If `include` and `exclude`
  are both specified, `include` overrides `exclude`.
* `nums`: List of numerical features. All numerical features are normalized to
  have zero mean and unit variance, with [StandardScaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html).
* `dropna`: Whether to drop NAs from the training data - true by default. If set
  to false, sklearn may misbehave.
* `deduplicate`: Whether to drop duplicates from the training data - true by default. If set
  to false, training may be slower.

Note that **all kwargs in MLHandler are optional**. Any option can be specified
at a later time with a PUT or a POST request. For example:

  * If the model class and `data` kwargs are not specified, MLHandler will do no training - which
    can be explicitly triggered at a later time, after supplying data and the
    algorithm (more on this below).
  * If the model path is not defined, the trained model will be saved under
    `$GRAMEXDATA/apps/mlhandler/`.
  * Any of the remaining kwargs can be specified before training begins.


# Exposing Existing Models

Existing [scikit-learn models](https://scikit-learn.org/stable/modules/model_persistence.html) can be exposed with the MLHandler.

You can download a sample logistic regression [model here](model.pkl), trained
on the [Titanic dataset](titanic?_download=titanic.csv&_format=csv). The model is trained to predict if a
passenger would have survived the Titanic disaster, given attributes of the
passenger like age, gender, travel class, etc. The model can then be exposed in
a Gramex application as follows:

```yaml
url:
  mymodel:
    pattern: /$YAMLURL/model
    handler: MLHandler
    kwargs:
      model:
        path: $YAMLPATH/model.pkl
```

# Model operations

## Getting predictions

MLHandler allows getting predictions for a single data point through a simple
curl -X GET request, as follows:

```bash
# See whether a 22 year old male, traveling with a sibling in the third class,
# having embarked in Southampton is likely to have survived.

curl -X GET /model?Sex=male&Age=22&SibSp=1&Parch=0&Fare=7.25&Pclass=3&Embarked=S
# output: [0] - passenger did not survive
```

<form id="mlhandler-single">
  <div class="row">
      <div class="col">
    	  <label for="Sex">Sex:</label>
    	  <input id="Sex" name="Sex" value="male" class="form-control"/>
      </div>
      <div class="col">
    	  <label for="Age">Age:</label>
    	  <input id="Age" name="Age" value="22" class="form-control"
	  type="number"/>
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="SibSp">SibSp:</label>
    	  <input id="SibSp" name="SibSp" value="1" class="form-control" type="number"/>
      </div>
      <div class="col">
    	  <label for="Parch">Parch:</label>
    	  <input id="Parch" name="Parch" value="0" class="form-control" type="number"/>
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="Fare">Fare:</label>
    	  <input id="Fare" name="Fare" value="7.25" class="form-control" type="number"/>
      </div>
      <div class="col">
    	  <label for="Pclass">Pclass:</label>
    	  <input id="Pclass" name="Pclass" value="3" class="form-control" type="number"/>
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="Embarked">Embarked:</label>
    	  <input id="Embarked" name="Embarked" value="S" class="form-control"/>
      </div>
  </div>
  <div class="row">
    	  <button type="submit" class="btn
    	  btn-primary form-control">Predict</button>
  </div>
</form>
<div id="single-result" class="bg-success"></div>
<div class="divider">Embed in your app.</div>
<ul class="nav nav-tabs" id="myTab" role="tablist">
  <li class="nav-item">
    <a class="nav-link active" id="python-tab" data-toggle="tab" role="tab" aria-controls="pycode" href="#pycode" aria-selected="true">Python</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="ajax-tab" data-toggle="tab" role="tab" aria-controls="ajaxcode" href="#ajaxcode" aria-selected="false">Ajax</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="curl-tab" data-toggle="tab" role="tab" aria-controls="curlcode" href="#curlcode" aria-selected="false">Curl</a>
  </li>
</ul>
<div class="tab-content" id="myTabContent">
  <div class="tab-pane fade show active" id="pycode" role="tabpanel" aria-labelledby="python-tab">
    <pre><code>
    >>> import requests
    >>> requests.get('mlhandler?Sex=male&Age=22&SibSp=1&Parch=0&Fare=7.25&Pclass=3&Embarked=S')
    </code></pre>
  </div>
  <div class="tab-pane fade" id="ajaxcode" role="tabpanel" aria-labelledby="ajax-tab">
    <pre><code>
    $.ajax({
    	url: 'mlhandler?Sex=male&Age=22&SibSp=1&Parch=0&Fare=7.25&Pclass=3&Embarked=S',
      	method: 'GET'
    })
    </code></pre>
  </div>
  <div class="tab-pane fade" id="curlcode" role="tabpanel" aria-labelledby="curl-tab">
    <pre><code>
    curl -X GET mlhandler?Sex=male&Age=22&SibSp=1&Parch=0&Fare=7.25&Pclass=3&Embarked=S'
    </code></pre>
  </div>
</div>


Note that the URL parameters in the GET query are expected to be fields in the
training dataset, and can be passed as Python dictionaries or JS objects.


## Getting bulk predictions
Predictions for a dataset (as against a single data point) can be retrieved by
`POST`ing a JSON dataset in the request body. The Titanic dataset is available
[here](titanic?_c=-Survived&_download=titanic_predict.json&_format=json) _without the target column_, which you can use to
run the following example:

```bash
curl -X POST -d @titanic_predict.json http://localhost:9988/mlhandler?_action=predict
# Output: [0, 1, 0, 0, 1, ...] # whether each passenger is likely to have survived
```
<form id='bulkform' method="POST" enctype="multipart/form-data">
  <input type="hidden" name="_xsrf" value="{{ handler.xsrf_token }}">
  <input id="fileupload" type="file" name="file">
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
<div id="bulkresult" class="overflow-auto" style="height: 100px"></div>
<div class="divider">Embed in your app.</div>
<ul class="nav nav-tabs" id="bulkPredictTab" role="tablist">
  <li class="nav-item">
    <a class="nav-link active" id="python-bulk-tab" data-toggle="tab" role="tab" aria-controls="pycode-bulk" href="#pycode-bulk" aria-selected="true">Python</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="ajax-bulk-tab" data-toggle="tab" role="tab" aria-controls="ajaxcode-bulk" href="#ajaxcode-bulk" aria-selected="false">Ajax</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="curl-bulk-tab" data-toggle="tab" role="tab" aria-controls="curlcode-bulk" href="#curlcode-bulk" aria-selected="false">Curl</a>
  </li>
</ul>
<div class="tab-content" id="myBulkTabContent">
  <div class="tab-pane fade show active" id="pycode-bulk" role="tabpanel" aria-labelledby="python-bulk-tab">
    <pre><code>
    >>> import requests
    >>> requests.post('mlhandler?_action=predict', files={'file': open('titanic.xlsx', 'rb')})
    </code></pre>
  </div>
  <div class="tab-pane fade" id="ajaxcode-bulk" role="tabpanel" aria-labelledby="ajax-bulk-tab">
    <pre><code>
    $.ajax({
    	url: 'mlhandler?_action=predict',
        method: 'POST',
        data: new FormData(this),
        processData: false,
        contentType: false
    })
    </code></pre>
  </div>
  <div class="tab-pane fade" id="curlcode-bulk" role="tabpanel" aria-labelledby="curl-bulk-tab">
    <pre><code>
    curl -X POST -d @titanic.xlsx 'mlhandler?_action=predict'
    </code></pre>
  </div>
</div>

## Retraining the model
An existing model can be retrained by POSTing data and specifying a target
column. To do so, we need to:

1. post the training data as JSON records,
2. set `?_action=retrain` and perform a PUT,
3. set `?target_col=NEW_TARGET_COL`, if required.

You can use the JSON dataset [here](titanic?_download=titanic.json&_format=json) to train the model as
follows:

```bash
curl -X POST -d @titanic.json /mlhandler?_action=retrain&target_col=Survived
# Output: {'score': 0.80}  - the model has 80% accuracy on the training data.
```
<form id="retrain" method="POST" enctype="multipart/form-data">
  <input type="hidden" name="_xsrf" value="{{ handler.xsrf_token }}">
  <input id="fileupload" type="file" name="file" class="form-control">
  <label for="targetCol">Select Target Column:</label>
  <input id="targetCol" value="Survived" name="_target_col" class="form-control">
  <button type="submit" class="btn btn-primary form-control">Submit</button>
</form>
<div id="retrainresult" class="overflow-auto" style="height: 20px"></div>
<div class="divider">Embed in your app.</div>
<ul class="nav nav-tabs" id="retrainTab" role="tablist">
  <li class="nav-item">
    <a class="nav-link active" id="python-retrain-tab" data-toggle="tab" role="tab" aria-controls="pycode-retrain" href="#pycode-retrain" aria-selected="true">Python</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="ajax-retrain-tab" data-toggle="tab" role="tab" aria-controls="ajaxcode-retrain" href="#ajaxcode-retrain" aria-selected="false">Ajax</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="curl-retrain-tab" data-toggle="tab" role="tab" aria-controls="curlcode-retrain" href="#curlcode-retrain" aria-selected="false">Curl</a>
  </li>
</ul>
<div class="tab-content" id="myRetrainTabContent">
  <div class="tab-pane fade show active" id="pycode-retrain" role="tabpanel" aria-labelledby="python-retrain-tab">
    <pre><code>
    >>> import requests
    >>> requests.post('mlhandler?_action=retrain&target_col=Survived',
                      files={'file': open('titanic.csv', 'rb')})
    </code></pre>
  </div>
  <div class="tab-pane fade" id="ajaxcode-retrain" role="tabpanel" aria-labelledby="ajax-retrain-tab">
    <pre><code>
    $.ajax({
    	url: 'mlhandler?_action=retrain&target_col=Survived',
	method: 'POST',
	data: new FormData(this),
	processData: false,
	contentType: false
    })
    </code></pre>
  </div>
  <div class="tab-pane fade" id="curlcode-retrain" role="tabpanel" aria-labelledby="curl-retrain-tab">
    <pre><code>
    curl -X POST -d @titanic.csv 'mlhandler?_action=retrain&target_col=Survived'
    </code></pre>
  </div>
</div>

## See model parameters

The parameters of a scikit-learn model can be obtained by specify the [`?_model`](model?_model) parameter,
as follows:

```bash
curl -X GET /mlhandler?_model
```
```python
# Output
{
  "params":
    {
      'C': 1.0,
      'class_weight': None,
      'dual': False,
      'fit_intercept': True,
      'intercept_scaling': 1,
      'l1_ratio': None,
      'max_iter': 100,
      'multi_class': 'auto',
      'n_jobs': None,
      'penalty': 'l2',
      'random_state': None,
      'solver': 'lbfgs',
      'tol': 0.0001,
      'verbose': 0,
      'warm_start': False
    },
    "model": "LogisticRegression"
}
```
<button class="btn btn-primary" id="modelparams">See Model Parameters</button>
<div id="paramresult" class="overflow-auto" style="height: 100px"></div>
<ul class="nav nav-tabs" id="paramsTab" role="tablist">
  <li class="nav-item">
    <a class="nav-link active" id="python-params-tab" data-toggle="tab" role="tab" aria-controls="pycode-params" href="#pycode-params" aria-selected="true">Python</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="ajax-params-tab" data-toggle="tab" role="tab" aria-controls="ajaxcode-params" href="#ajaxcode-params" aria-selected="false">Ajax</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" id="curl-params-tab" data-toggle="tab" role="tab" aria-controls="curlcode-params" href="#curlcode-params" aria-selected="false">Curl</a>
  </li>
</ul>
<div class="divider">Embed in your app.</div>
<div class="tab-content" id="myParamsTabContent">
  <div class="tab-pane fade show active" id="pycode-params" role="tabpanel" aria-labelledby="python-params-tab">
    <pre><code>
    >>> import requests
    >>> requests.get('mlhandler?_model).json()
    {
        "params":
         {
             'C': 1.0,
             'class_weight': None,
             'dual': False,
             'fit_intercept': True,
             'intercept_scaling': 1,
             'l1_ratio': None,
             'max_iter': 100,
             'multi_class': 'auto',
             'n_jobs': None,
             'penalty': 'l2',
             'random_state': None,
             'solver': 'lbfgs',
             'tol': 0.0001,
             'verbose': 0,
             'warm_start': False
         },
         "model": "LogisticRegression"
    }
    </code></pre>
  </div>
  <div class="tab-pane fade" id="ajaxcode-params" role="tabpanel" aria-labelledby="ajax-params-tab">
    <pre><code>
    $.getJSON('mlhandler?_model')
    </code></pre>
  </div>
  <div class="tab-pane fade" id="curlcode-params" role="tabpanel" aria-labelledby="curl-params-tab">
    <pre><code>
    curl -X GET -d @titanic.csv 'mlhandler?_model'
    </code></pre>
  </div>
</div>


## Change the model and modify its parameters

An existing model can be replaced with a new one, and all its parameters can be
modified with a PUT request. The following request replaces the logistic
regression earlier with a random forest classifier:

```bash
curl -X PUT '/mlhandler?_model&class=RandomForestClassififer'
```

Note that at this stage, the model has simply been replaced, but _not_
retrained. To train it, we can POST to it with `?_action=retrain` parameter as
follows:

```bash
curl -X POST '/mlhandler?_action=retrain'
```

Similarly, any parameter of the model can be changed. For example, to change the
number of estimators used in a [random forest classifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html) (which is 100, by default), use:

```bash
curl -X PUT /mlhandler?_model&n_estimators=10
```

In general, the model's class and any of its parameters can be chained together
in the PUT request. For example, to change the model to an SGDClassifier with a
log loss, use:

```bash
curl -X PUT /mlhandler?_model&class=SGDClassifier&loss=log
```

Any query parameter except `class` which is also a parameter of the
[SGDClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html) will be used to create the model.

Similarly, any of the data transformation options (`include`, `exclude`,
`cats`, `nums`, etc) can be added or changed at any time with a PUT, as follows:

```bash
# Ignore PassengerId and Name, consider Embarked as a categorical feature.
curl -X PUT /mlhandler?_model&exclude=PassengerId&exclude=Name&cats=Embarked
```


## Delete a model
To remove the serialized model from the disk and disable further operations, use
a delete request as follows:

```bash
curl -X DELETE /mlhandler?_model
```

# MLHandler Templates

MLHandler supports Tornado templates which can be used to create front-end applications which use MLHandler. You can specify a `template` kwarg as follows:

```yaml
mlhandler/tutorial:
  pattern: /$YAMLURL/ml
  handler: MLHandler
  template: $YAMLPATH/template.html
```

The template so specified will be rendered at the `pattern` URL, and it will
have access to the following variables:

* `{{ handler }}`: The MLHandler instance
* `{{ handler.model }}`: The sklearn object / estimator / model
* `{{ data }}`: The training dataset, available as a pandas DataFrame.

`{{ handler.model }}` gives you access to the underlying sklearn object. This can
be used in many ways to replicate sklearn code. For example,

* Use `{{ handler.model.get_params() }}` to see the parameters of the model.
* Use `{{ handler.model.__class__.__name__ }}` to see the name of the algorithm
  being used.
* Any other attribute or method of an sklearn estimator can be accessed as
  `{{ handler.model.<attribute> }}`

If left unspecified, MLHandler will render a default template that shows some
details of your MLHandler application. The default template for the Titanic
problem can be seen [here](model).

# FAQs
## How to get the accuracy score of my model?
When trying to see the accuracy of a new dataset against an existing model, use `?_action=score`. Specifically, POST the new data to the MLHandler endpoint, with `?_action=score`.
```bash
# Check the score of a dataset - test.csv - against an existing model
curl -X POST -F "file=@test.csv" 'http://localhost:9988/mlhandler?_action=score'
```
## How to download a model?
Add the `?_download` query parameter to the MLHandler endpoint, and perform a
GET. E.g to download the Titanic model included in this tutorial, click
[here](model?_download).
```bash
curl -X GET '/mlhandler?_download'
```
## How to download training data?
Add the `?_cache` query parameter to the MLHandler endpoint, and perform a GET.
E.g to download the Titanic dataset included in this tutorial, click
[here](model?_cache).
```bash
curl -X GET '/mlhandler?_cache'
```
## How to append to the training data?
MLHandler supports incremental accumulation of training data. If data is
specified in the YAML confing, it can be appended to, using `?_action=append`.
Data can be `POST`ed in two ways:

1. By including it as JSON in the request body and setting the `Content-Type`
   header to `application/json` as follows:
```bash
curl -X POST -d @data.json --header "Content-Type: application/json"
'http://localhost:9988/mlhandler?_action=append'
```
2. By POSTing any dataset through a form as a file. (Any `gramex.cache.open`
   format is supported.)
```bash
curl -X POST -F "file=@data.json" 'http://localhost:9988/mlhandler?_action=append'
```
Note that when data is being appended, the schema of the appendix has to match
the schema of the existing dataset.
## How to delete training data?
Send a DELETE request to the MLHandler endpoint with the `?_cache` parameter.
E.g:
```bash
curl -X DELETE 'http://localhost:9988/mlhandler?_cache'
```
## How to delete the model?
Send a DELETE request to the MLHandler endpoint with the `?_model` parameter.
E.g:
```bash
curl -X DELETE 'http://localhost:9988/mlhandler?_model'
```
This will cause MLHandler to return an HTTP 404 on subsequent requests to the same
endpoint, until an `?_action=train` or `?_action=retrain` is requested.
