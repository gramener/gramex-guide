---
title: Gramex Features
prefix: Features
template: true
...

{% import os %}
{% import gramex %}
{% import gramex.cache %}
{% set folder = os.path.dirname(os.path.abspath(gramex.__file__)) %}
{% set features = gramex.cache.open(os.path.join(folder, 'gramexfeatures.csv')) %}

Gramex features are broken into:

1. Microservices
   1. [Services](#services) that set up microservices, alerts, etc.
   2. [Handlers](#handlers) that define microservices as a REST API
   3. [Configurations](#configurations) that provide common settings for microservices
2. Components
3. Apps

## Feature usage

Run `gramex features` on any Gramex app to list the features used.
Here's an example:

```text
$ gramex features
      type                       feature  count
0       MS                CaptureHandler      2
1       MS                  ComicHandler      1
2       MS                   FileHandler     67
...
18   KWARG                Access Control     53
19   KWARG                      Security     12
...
27     SVC                  Microservice      2
28     SVC                        Import      0
...
41  ERR-MS     handlerutil.CustomHandler      1
42  ERR-MS      handlerutil.SetupHandler      1
```

The columns are:

- `type`: The type of feature. One of `MS` (microservice), `KWARG` (configuration), `SVC` (service).
   `ERR-MS` indicates a custom or missing microservice
- `feature`: The name of the feature
- `count`: The number of times the feature is used

You can render the output in different formats:

- `--format=table` prints a table (default)
- `--format=csv` prints a CSV file
- `--format=json` prints a JSON file

Pass multiple folders, e.g. `gramex features /project1/ /project2/`, to sum features used across folders.

## Services

{% for index, feature in features[features['type'] == 'SVC'].sort_values('name').iterrows() %}
1. `{{ feature['name'] }}`: [{{ feature['feature'] }}]({{ feature['link'] }}){% end %}

## Handlers

{% for index, feature in features[features['type'] == 'MS'].sort_values('name').iterrows() %}
1. `{{ feature['name'] }}`: [{{ feature['feature'] }}]({{ feature['link'] }}){% end %}

## Configurations

{% for index, feature in features[features['type'] == 'KWARG'].sort_values('name').iterrows() %}
1. `{{ feature['name'] }}`: [{{ feature['feature'] }}]({{ feature['link'] }}){% end %}
