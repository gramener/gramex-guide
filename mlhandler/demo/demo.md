# Existing Models
## Exposing existing models

```yaml
url:
  demo/iris:
    pattern: /$YAMLURL/iris
    handler: MLHandler
    kwargs:
      model:
        path: $YAMLPATH/iris.pkl
      xsrf_cookies: false
```

### Getting predictions

```bash
curl -X GET 'http://localhost:9988/iris?sepal_length=5.1&sepal_width=3.5&petal_length=1.4&petal_width=0.2'
curl -X GET 'http://localhost:9988/iris?sepal_length=6.9&sepal_width=3.1&petal_length=5.4&petal_width=2.1'
curl -X GET 'http://localhost:9988/iris?sepal_length=6.7&sepal_width=3.3&petal_length=5.7&petal_width=2.5'
curl -X GET 'http://localhost:9988/iris?sepal_length=6.4&sepal_width=3.2&petal_length=4.5&petal_width=1.5'
```
### Getting bulk predictions

```bash
curl -X POST -F 'file=@iris-pred.csv' 'http://localhost:9988/iris?_action=predict' | less
```

### Scoring new data
```bash
curl -X POST -F 'file=@iris.csv' 'http://localhost:9988/iris?_action=score&target_col=species'
```

### Retraining and scoring
```bash
curl -X POST -F 'file=@iris-90.csv' 'http://localhost:9988/iris?_action=append&_action=train'
curl -X POST -F 'file=@iris.csv' 'http://localhost:9988/iris?_action=score'
```

# Creating new models
### Adding a model and its parameters

```bash
curl -X PUT 'http://localhost:9988/titanic?_model&class=DecisionTreeClassifier'
curl -X PUT 'http://localhost:9988/titanic?_model&target_col=Survived'
	```
### Adding data

```bash
curl -X POST -F 'file=@titanic.csv' 'http://localhost:9988/titanic?_action=append'
```
### Excluding & including columns

```bash
curl -X PUT 'http://localhost:9988/titanic?_model&exclude=Name&exclude=Ticket&exclude=Cabin&exclude=PassengerId'
```
### Specifying numerical and categorical columns

```bash
curl -X PUT 'http://localhost:9988/titanic?_model&cats=Pclass&cats=Sex&cats=Embarked'
```

# Other
### Downloading data
```bash
curl -X GET 'http://localhost:9988/titanic?_cache'
```
### Seeing model parameters
```bash
curl -X GET 'http://localhost:9988/titanic?_model'
```
### Downloading models
```bash
curl -X GET 'http://localhost:9988/titanic?_model&_download'
```
### MLHandler templates
  - `handler.model`
  - `data`
  - `handler.config_store`
