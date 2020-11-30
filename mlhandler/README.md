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

<div class="postman-run-button"
data-postman-action="collection/import"
data-postman-var-1="99cd761eaee7b9102ad7"></div>
<script type="text/javascript">
  (function (p,o,s,t,m,a,n) {
    !p[s] && (p[s] = function () { (p[t] || (p[t] = [])).push(arguments); });
    !o.getElementById(s+t) && o.getElementsByTagName("head")[0].appendChild((
      (n = o.createElement("script")),
      (n.id = s+t), (n.async = 1), (n.src = m), n
    ));
  }(window, document, "_pm", "PostmanRunObject", "https://run.pstmn.io/button.js"));
</script>

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

<form id="mlhandler-single">
  <div class="row">
      <div class="col">
    	  <label for="Sex">Sex:</label>
    	  <input id="Sex" name="Sex" value="1" />
      </div>
      <div class="col">
    	  <label for="Age">Age:</label>
    	  <input id="Age" name="Age" value="22" />
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="SibSp">SibSp:</label>
    	  <input id="SibSp" name="SibSp" value="1"/>
      </div>
      <div class="col">
    	  <label for="Parch">Parch:</label>
    	  <input id="Parch" name="Parch" value="0"/>
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="Fare">Fare:</label>
    	  <input id="Fare" name="Fare" value="7.25"/>
      </div>
      <div class="col">
    	  <label for="pclass_1">pclass_1:</label>
    	  <input id="pclass_1" name="pclass_1" value="0"/>
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="pclass_2">pclass_2:</label>
    	  <input id="pclass_2" name="pclass_2" value="0"/>
      </div>
      <div class="col">
    	  <label for="pclass_3">pclass_3:</label>
    	  <input id="pclass_3" name="pclass_3" value="1"/>
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="Embarked_C">Embarked_C:</label>
    	  <input id="Embarked_C" name="Embarked_C" value="0"/>
      </div>
      <div class="col">
    	  <label for="Embarked_Q">Embarked_Q:</label>
    	  <input id="Embarked_Q" name="Embarked_Q" value="0"/>
      </div>
  </div>
  <div class="row">
      <div class="col">
    	  <label for="Embarked_S">Embarked_S:</label>
    	  <input id="Embarked_S" name="Embarked_S" value="1"/>
      </div>
      <div class="col">
    	  <button type="submit" class="btn
    	  btn-primary">Predict</button>
      </div>
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
    >>> requests.get('mlhandler?Sex=1&Age=22&SibSp=1&Parch=0&Fare=7.25&pclass_1=0&pclass_2=0&pclass_3=0&Embarked_C=0&Embarked_Q=0&Embarked_S=1')
    </code></pre>
  </div>
  <div class="tab-pane fade" id="ajaxcode" role="tabpanel" aria-labelledby="ajax-tab">
    <pre><code>
    $.ajax({
    	url: 'mlhandler?Sex=1&Age=22&SibSp=1&Parch=0&Fare=7.25&pclass_1=0&pclass_2=0&pclass_3=0&Embarked_C=0&Embarked_Q=0&Embarked_S=1',
      method: 'GET'
    })
    </code></pre>
  </div>
  <div class="tab-pane fade" id="curlcode" role="tabpanel" aria-labelledby="curl-tab">
    <pre><code>
    curl -X GET mlhandler?Sex=1&Age=22&SibSp=1&Parch=0&Fare=7.25&pclass_1=0&pclass_2=0&pclass_3=0&Embarked_C=0&Embarked_Q=0&Embarked_S=1
    </code></pre>
  </div>
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
    >>> requests.post('mlhandler', files={'file': open('titanic.xlsx', 'rb')})
    </code></pre>
  </div>
  <div class="tab-pane fade" id="ajaxcode-bulk" role="tabpanel" aria-labelledby="ajax-bulk-tab">
    <pre><code>
    $.ajax({
    	url: 'mlhandler',
	method: 'POST',
	data: new FormData(this),
	processData: false,
	contentType: false
    })
    </code></pre>
  </div>
  <div class="tab-pane fade" id="curlcode-bulk" role="tabpanel" aria-labelledby="curl-bulk-tab">
    <pre><code>
    curl -X POST -d @titanic.xlsx 'mlhandler'
    </code></pre>
  </div>
</div>

# Retraining the model
An existing model can be retrained by POSTing data and specifying a target
column. To do so, we need to:

1. post the training data as JSON records
2. set the `_retrain` query parameter to 1
3. specify the target column under the `_target_col` query paramter.

You can use the JSON dataset [here]('titanic?_download=titanic.json&_format=json') to train the model as
follows:

```bash
POST -d @titanic.json /mlhandler?_retrain=1&_target_col=Survived
# Output: {'score': 0.80}  - the model has 80% accuracy on the training data.
```
<!--
<div class="example">
  <a class="example-demo" href="try/retrain">Try it out.</a>
  <a class="example-src" href="https://github.com/gramener/gramex-guide/blob/master/mlhandler/gramex.yaml">Source</a>
</div>
-->
<form id="retrain" method="POST" enctype="multipart/form-data">
  <input type="hidden" name="_xsrf" value="{{ handler.xsrf_token }}">
  <input id="fileupload" type="file" name="file">
  <label for="targetCol">Select Target Column:</label>
  <input id="targetCol" value="Survived" name="_target_col">
  <button type="submit" class="btn btn-primary">Submit</button>
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
    >>> requests.post('mlhandler?_retrain=1&_target_col=Survived',
                      files={'file': open('titanic.csv', 'rb')})
    </code></pre>
  </div>
  <div class="tab-pane fade" id="ajaxcode-retrain" role="tabpanel" aria-labelledby="ajax-retrain-tab">
    <pre><code>
    $.ajax({
    	url: 'mlhandler?_retrain=1&_target_col=Survived',
	method: 'POST',
	data: new FormData(this),
	processData: false,
	contentType: false
    })
    </code></pre>
  </div>
  <div class="tab-pane fade" id="curlcode-retrain" role="tabpanel" aria-labelledby="curl-retrain-tab">
    <pre><code>
    curl -X POST -d @titanic.csv 'mlhandler?_retrain=1&_target_col=Survived'
    </code></pre>
  </div>
</div>

# See model parameters

The parameters of a scikit-learn model can be obtained by specify the [`?_model`](model?_model) parameter,
as follows:

```bash
GET /mlhandler?_model
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

<!--
<div class="example">
  <a class="example-demo" href="model?_model">Try it out.</a>
  <a class="example-src" href="https://github.com/gramener/gramex-guide/blob/master/mlhandler/gramex.yaml">Source</a>
</div>
-->

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
PUT -d @titanic.json /mlhandler?class=GaussianNB&_retrain=1&_target_col=Survived`
# output: {'score': 0.9}
```
This replaced the earlier untrained `RandomForestClassififer` with a Gaussian
naive Bayes classifier, and trains it on the provided dataset.

Similarly, any parameter of the model can be changed. For example, to change the
default number of estimators used in a random forest classifier (100), use:

```bash
PUT /mlhandler?class=RandomForestClassififer&n_estimators=10
```
<form id="changemodel" method="PUT" enctype="multipart/form-data">
  <div class="form-group row">
    <input type="hidden" name="_xsrf" value="{{ handler.xsrf_token }}">
    <input id="fileupload" type="file" name="file">
  </div>
  <label for="modelList">Select Model:</label>
  <select id="modelList" name="modelName">
    <option>LogisticRegression</option>
    <option>SGDClassifier</option>
    <option>DecisionTreeClassifier</option>
    <option>MLPClassifier</option>
    <option>GaussianNB</option>
    <option>RandomForestClassififer</option>
    <option>SVC</option>
  </select>
  <label for="targetCol">Select Target Column:</label>
  <input id="targetCol" value="Survived" name="_target_col">
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
<div id="changeModelResult" class="overflow-auto" style="height: 100px"></div>


# Delete a model
To remove the serialized model from the disk and disable further operations, use
a delete request as follows:

```bash
DELETE /mlhandler
```

ToDo: Add details of incremental data posts, and how to delete it.
