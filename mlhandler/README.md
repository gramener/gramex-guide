---
title: MLHandler provides ML APIs
prefix: MLHandler
icon: mlhandler.png
desc: MLHandler exposed machine learning models as APIs
by: TeamGramener
type: microservice
...

MLHandler exposes machine learning models as APIs that applications can use
over a REST API. (From **v1.66**.)

[TOC]

# Exposing Scikit-Learn Models

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
      path: $YAMLPATH/model.pkl
```

# Getting predictions

MLHandler allows getting predictions for a single data point through a simple
GET request, as follows:

```bash
# See whether a 22 year old male, traveling with a sibling in the third class,
# having embarked in Southampton is likely to have survived.

GET /model?Sex=1&Age=22&SibSp=1&Parch=0&Fare=7.25&pclass_1=0&pclass_2=0&pclass_3=0&Embarked_C=0&Embarked_Q=0&Embarked_S=1
# output: [0] - passenger did not survive
```

<div class="example">
  <a class="example-demo" href="try/single">Try it out.</a>
  <a class="example-src" href="https://github.com/gramener/gramex-guide/blob/master/mlhandler/gramex.yaml">Source</a>
</div>

Note that the URL parameters in the GET query are expected to be fields in the
training dataset.


# Getting bulk predictions
Predictions for a dataset (as against a single data point) can be retrieved by
POSTing a JSON dataset in the request body. The Titanic dataset is available
[here](titanic?_c=-Survived&_download=titanic_predict.json&_format=json) _without the target column_, which you can use to
run the following example:

```bash
POST -d @titanic_predict.json /mlhandler
# Output: [0, 1, 0, 0, 1, ...] # whether each passenger is likely to have survived
```
<div class="example">
  <a class="example-demo" href="try/bulkpredict">Try it out.</a>
  <a class="example-src" href="https://github.com/gramener/gramex-guide/blob/master/mlhandler/gramex.yaml">Source</a>
</div>

# Retraining the model
An existing model can be retrained by POSTing data and specifying a target
column. To do so, we need to:

1. post the training data as JSON records
2. set the `_retrain` query parameter to 1
3. specify the target column under the `target_col` query paramter.

You can use the JSON dataset [here]('titanic?_download=titanic.json&_format=json') to train the model as
follows:

```bash
POST -d @titanic.json /mlhandler?_retrain=1&target_col=Survived
# Output: {'score': 0.80}  - the model has 80% accuracy on the training data.
```
<div class="example">
  <a class="example-demo" href="try/retrain">Try it out.</a>
  <a class="example-src" href="https://github.com/gramener/gramex-guide/blob/master/mlhandler/gramex.yaml">Source</a>
</div>

# See model parameters

The parameters of a scikit-learn model can be obtained by specify the [`?_model`](mlhandler?_model) parameter,
as follows:

```bash
GET /mlhandler?_model
```
```python
# Output
{'C': 1.0,
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
 'warm_start': False}
```
<div class="example">
  <a class="example-demo" href="model?_model">Try it out.</a>
  <a class="example-src" href="https://github.com/gramener/gramex-guide/blob/master/mlhandler/gramex.yaml">Source</a>
</div>

# Change the model and modify its parameters

An existing model can be replaced with a new one, and all its parameters can be
modified with a PUT request. The following request replaces the logistic
regression earlier with a random forest classifier:

```bash
PUT /mlhandler?class=RandomForestClassififer
```

Note that at this stage, the model has simply been replaced, but _not_
retrained. To train it, we can POST data to it with the `_retrain` parameter as
mentoined above. The `_retrain` flag can also be used while re-assigning the
model class itself, like:

```bash
PUT -d @titanic.json /mlhandler?class=GaussianNB&_retrain=1&target_col=Survived`
# output: {'score': 0.9}
```
This replaced the earlier untrained `RandomForestClassififer` with a Gaussian
naive Bayes classifier, and trains it on the provided dataset.

Similarly, any parameter of the model can be changed. For example, to change the
default number of estimators used in a random forest classifier (100), use:

```bash
PUT /mlhandler?class=RandomForestClassififer&n_estimators=10
```

# Delete a model
To remove the serialized model from the disk and disable further operations, use
a delete request as follows:

```bash
DELETE /mlhandler
```

ToDo: Add details of incremental data posts, and how to delete it.
