---
title: Gramex 1.67 release notes
prefix: 1.67
...

[TOC]

Gramex 1.67 introduces MLHandler (to train, deploy and re-train models) and simpler names for
micro-services.

## Train ML models

[MLHandler](../../mlhandler/) helps you embed ML models that can be trained on user-provided data.

You can embed a [scikit-learn](https://scikit-learn.org/),
[statsmodels](https://www.statsmodels.org/) or [tensorflow/keras](https://keras.io/) model. For
example:

```yaml
url:
  classifier:
    pattern: /rugby
    handler: MLHandler
    kwargs:
      model:
        class: SVC          # Embed sklearn.svm.SVC
        target_col: ans     # Predict the "ans" column

```

You can send HTTP requests to `/rugby` to teach it that tall heavy boys make the male rugby team.
Suppose this data is in `data.csv`:

```text
| sex | height | weight | ans |
|-----|--------|--------|-----|
|   m |    190 |     90 |   Y |
|   m |    185 |     85 |   Y |
|   m |    180 |     80 |   Y |
|   m |    150 |     80 |   N |
|   m |    180 |     60 |   N |
|   f |    180 |     80 |   N |
```

You can append the data and train the model. (Typically using AJAX requests.)

```bash
# Append the data
$ curl -X POST -F "file=@data.csv" '/rugby?_action=append'

# Re-train the model
$ curl -X POST '/rugby?_action=retrain'
{"score": 1.0}
```

Now, you can check if a 190cm 80kg boy and a 150cm 80kg boy will get in.

```bash
$ curl '/rugby?sex=m&height=190&weight=80'    # 190cm 80kg boy
["Y"]                                         #   will get in
$ curl '/rugby?sex=m&height=150&weight=80'    # 150cm 80kg boy
["N"]                                         #   won't get in
```

As the users keep adding data and re-training the model, it keeps improving.


## Simpler handler names

[Handlers](../../handlers/) are now called micro-services, and identified in `gramex.yaml` via
`service:` instead of `handler:`.

The names of these handlers is also simplified. So you can now use:

| New version           | instead of old version          |
|-----------------------|---------------------------------|
| `service: Command`    | `handler: ProcessHandler`       |
| `service: Data`       | `handler: FormHandler`          |
| `service: Facebook`   | `handler: FacebookGraphHandler` |
| `service: File`       | `handler: FileHandler`          |
| `service: Filter`     | `handler: FilterHandler`        |
| `service: Function`   | `handler: FunctionHandler`      |
| `service: ML`         | `handler: MLHandler`            |
| `service: Proxy`      | `handler: ProxyHandler`         |
| `service: Screenshot` | `handler: CaptureHandler`       |
| `service: Slide`      | `handler: PPTXHandler`          |
| `service: Storage`    | `handler: DriveHandler`         |
| `service: Twitter`    | `handler: TwitterRESTHandler`   |
| `service: Websocket`  | `handler: WebSocketHandler`     |

Going forward, the new version will be preferred, and documentation accordingly. But the old
version will continue to work until deprecated.

## Other improvements

- Gramex uses `openpyxl` to read XLSX files, since `xlrd` has deprecated support for XLSX files.
  (By [Naveen Manukonda](https://github.com/naveenreddymanukonda))
- `gramex <cmd> --help` prints help about that command.

## Bug fixes

- [Redis cache stores](../../cache/#cache-stores) have an unlimited default cache size (instead of
  500MB). Further, setting `size: 0` ignores the cache limit. This is useful in stores like Azure
  where setting a cache size limit causes an error. (By [Mohammed Niyas](https://github.com/mniyas))
- [ProxyHandler](../../proxyhandler/) no longer fails when `gramex.yaml` is updated while Gramex
  is running.

## What next

Gramex 1.68 will be released on 1 Feb 2021 and will feature a new "Forms" app. It's like an
embeddable Google Forms that you can use in any app.


## Statistics

The Gramex code base has:

- 18,905 lines of Python (645 more than 1.66)
- 1,779 lines of JavaScript (3 more than 1.66)
- 12,045 lines of test code (431 more than 1.66)
- 89% test coverage (same as 1.66)

## Credits

- [Mohammed Niyas](https://github.com/mniyas) for enabling unlimited-size
  [Redis cache stores](../../cache/#cache-stores)
- [Naveen Manukonda](https://github.com/naveenreddymanukonda) for always loading XLSX files with
  `openpyxl` instead of `xlrd`

## How to install

See the [Gramex installation and upgrade instructions](../../install/)

Note: Gramex 1.67 does not work with Python 3.8. We recommend Python 3.7.
