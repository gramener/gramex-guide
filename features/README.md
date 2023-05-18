---
title: Gramex Feature
prefix: Feature
...

## Feature

To see what features of Gramex are being used in the project, run `gramex features` on your terminal inside the project directory. You should see an output like this:

```log
{'features':     type       feature  count
0     MS   FileHandler      2
1  KWARG       Headers      2
2     MS   FormHandler      4
3    SVC  Microservice      2
4    SVC       Logging      1
5    SVC          Apps      1
6    SVC      Schedule      1}
```

## Complexity

To see the cyclomatic complexity of the project, run `gramex complexity` on your terminal inside the project directory. You should see an output like this:

```log
{'project_complexity': 9941, 'gramex_complexity': 637, 'total_complexity': 10578, 'gramex_complexity_percent': 6.02}
```
