---
title: ComicHandler serves comics
prefix: ComicHandler
icon: comichandler.png
desc: ComicHandler combines images to create varied comic characters
by: TeamGramener
type: microservice
...

[TOC]

**v1.71**. [ComicHandler](.) serves comics as SVG files. It's based on the [Comicgen](https://gramener.com/comicgen/) library. Here's how to create a ComicHandler:

```yaml
url:
  comics:
    pattern: /$YAMLURL/comics
    handler: ComicHandler
```

Now, [`name=dee&angle=straight&emotion=smile&pose=super`](name=dee&angle=straight&emotion=smile&pose=super) serves this SVG image:

![Sample comic](../../comichandler/sample.svg){.img-fluid}

::: example href=comics?name=dee&angle=straight&emotion=smile&pose=super source=https://github.com/gramener/gramex-guide/blob/master/comichandler/gramex.yaml
    Try ComicHandler

This lets you create a variety of comic data stories. For examples, see [gramener.com/datacomics/](https://gramener.com/datacomics/).

For the full list of character names and options, see the
[Comicgen website](https://gramener.com/comicgen/v1/)
