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

## Services

{% for index, feature in features[features['type'] == 'SVC'].sort_values('name').iterrows() %}
1. `{{ feature['name'] }}`: {{ feature['feature'] }}{% end %}

## Handlers

{% for index, feature in features[features['type'] == 'MS'].sort_values('name').iterrows() %}
1. `{{ feature['name'] }}`: {{ feature['feature'] }}{% end %}
