---
title: Tutorial: Creating Interactive Charts with Gramex
prefix: fddcharts
...

[TOC]

In the [previous tutorial](../dashboards/), we saw how filtering a table can
redraw charts. The charts themselves were not interactive. In this
tutorial, we close the loop by making the charts trigger changes in the
FormHandler table. 

## Introduction

We will use a different visualization this time - a colored table which shows total sales for different regions
and product categories.

<div id="chart">
</div>
<script src="../ui/jquery/dist/jquery.min.js"></script>
<script src="../ui/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="../ui/lodash/lodash.min.js"></script>
<script src="../ui/g1/dist/g1.min.js"></script>
<script src="../ui/vega/build/vega.min.js"></script>
<script src="../ui/vega-lite/build/vega-lite.min.js"></script>
<script src="../ui/vega-tooltip/build/vega-tooltip.min.js"></script>
<script>
  var spec = {
    "width": 360,
    "height": 270,
    "data": {"url": "../store-sales-ctab"},
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "encoding": {
      "y": {"field": "Category", "type": "nominal"},
      "x": {"field": "Region", "type": "nominal"}
    },
    "layer": [
      {
        "mark": "rect",
        "selection": {"brush": {"type": "interval"}},
        "encoding": {
          "color": {"field": "Sales", "type": "quantitative",
            "legend": {"format": "0.1s"}}
        }
      },
      {
        "mark": "text",
        "encoding": {
          "text": {"field": "Sales", "type": "quantitative"},
          "color": {
            "condition": {"test": "datum['Sales'] < 100000", "value": "black"},
            "value": "white"
          }
        }
      }
    ]
  }
  var view = new vega.View(vega.parse(vl.compile(spec).spec))
  .renderer('svg')
  .initialize('#chart')
  .hover()
  .run()
</script>

Such a table is called a cross-tabulation or a contingency table - it is a
common operation used to aggregate a metric (in this case, sales) across two dimensions
(region and product category).

Do play around with the sample application to get an
better idea of our goal for this tutorial. Specifically, take a look at how:

* Applying filters on the 'Region' and 'Category' changes the chart.
* Clicking on different cells in the chart changes the table.


### Outcome

By the end of this tutorial, you will have learned how to:

1. perform basic transformations with FormHandler,
2. detect interactions on charts
3. triggering events based on these interactions.

After finishing this tutorial, you will have an application like this:

[View Source](../charts/output/4/index.html){: class="source"}



### Requirements

This tutorial assumes that you have gone through the
[previous tutorial](../dashboards/). Specifically, we
will be building on:

1. [FormHandler tables](../dashboards#step-1-working-with-formhandler),
2. how they introduce [changes in the URL](../dashboards#step-2-detecting-changes-in-the-url), and
3. how we use this to [effect changes in the charts](../dashboards#step-3-redrawing-charts-on-url-changes).


## Step 0: Basic Layout and Scaffolding

To begin with, let's just reproduce some of what we did in the last tutorial, beginning
with laying out a FormHandler table.
Add the FormHandler table to your application by adding the following code in the
<kbd>&lt;body&gt;</kbd> of <kbd>index.html</kbd>.

```html
<div class="formhandler" data-src="data"></div>
  <script>
    $('.formhandler').formhandler({pageSize: 5})
</script>
```

Now we need to add some space in the page to hold the chart. Add a
placeholder for the chart in your page as follows:

```html
<div id="chart"></div>
```
     
We will be rendering the chart through a javascript
function, similar to the `draw_charts` function from the previous tutorial.


## Step 1: Performing the Cross-Tabulation with FormHandler

FormHandler can be used to [transform a dataset](../../formhandler#formhandler-transforms)
in a variety of ways. In this example, we will use FormHandler's
[`modify`](../../formhandler/formhandler-modify) function to perform the cross-tabulation.

Add the following to <kbd>gramex.yaml</kbd> to create a HTTP resource which cross-tabulates the data.

```yaml
  store-sales-ctab:
    pattern: /$YAMLURL/store-sales-ctab
    handler: FormHandler
    kwargs:
      url: $YAMLPATH/store-sales.csv
      modify: data.groupby(['Category', 'Region'])['Sales'].sum().reset_index()
```


In the snippet above, we are creating a new endpoint to serve the cross-tabulated data. After
saving `gramex.yaml`, visit
[`http://localhost:9988/store-sales-ctab`](http://localhost:9988/store-sales-ctab) in your
browser. You should see a JSON array containing 12 objects, each of which represents a
combination of a region and a product category, as follows:

```js
[
  {"Category":"Furniture","Region":"Central","Sales":130887.5002000001},
  {"Category":"Office Supplies","Region":"East","Sales":125007.708},
  {"Category":"Technology","Region":"South","Sales":97852.945},
  // etc
]
```

_Note_: The transforms supported by FormHandler work seamlessly with
[pandas](https://pandas.pydata.org). Almost evey transformation can be expressed as a
pandas expression. See [FormHandler documentation](../../formhandler) for details.


## Step 2: Drawing the Chart

Just like we had a specification for the bar charts in the previous examples, we will use
a different specification for the color table chart.

Add the following Vega specification for a heatmap chart to your <kbd>index.html</kbd>.

```js
  var spec = {
    "width": 360,
    "height": 270,
    "data": {"url": "store-sales-ctab"},
    "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
    "encoding": {
      "y": {"field": "Category", "type": "nominal"},
      "x": {"field": "Region", "type": "nominal"}
    },
    "layer": [
      {
        "mark": "rect",
        "selection": {"brush": {"type": "interval"}},
        "encoding": {
          "color": {"field": "Sales", "type": "quantitative",
            "legend": {"format": "0.1s"}}
        }
      },
      {
        "mark": "text",
        "encoding": {
          "text": {"field": "Sales", "type": "quantitative"},
          "color": {
            "condition": {"test": "datum['Sales'] < 100000", "value": "black"},
            "value": "white"
          }
        }
      }
    ]
  }
```

Next, let's write a function to compile this specification into a Vega view and draw the
chart. Add the following function to <kbd>index.html</kbd> to compile the chart specification into a Vega view and draw the chart.

```js
  function draw_chart() {
    var view = new vega.View(vega.parse(vl.compile(spec).spec))
      .renderer('svg')
      .initialize('#chart')
      .hover()
      .run()
  }
  draw_chart()
```
     
At this point, you should be able to see the chart. Again, as in the previous tutorial,
the next step is to redraw the chart on URL changes.

[View Source](../charts/output/2/index.html){: class="source"}


## Step 3: Redrawing Charts on URL Changes

In the previous tutorial, we had managed to obtain the hash changes in the URL and use
these as queries on the original dataset. In this case,
remember that we are using two _different_ endpoints for the table and the chart - i.e.
[`/data`](http://localhost:9988/data) for the table and
[`/store-sales-ctab`](http://localhost:9988/store-sales-ctab) for the chart. Thus, to
render the chart successfully on URL changes, we must be able to grab filters from the
table and apply them to the cross-tab endpoints. This, too, involves setting the
`data.url` attribute of the chart specification on each change in the URL.
Add the following function to <kbd>index.html</kbd> to get URL changes and apply them to the chart spec.

```js
  var baseDataURL = spec.data.url  // keep the original URL handy
  function redrawChartFromURL(e) {
    if (e.hash.search) { // if the URL hash contains filters, add them to the spec's URL
      spec.data.url = baseDataURL + '?' + e.hash.search
    } else { spec.data.url = baseDataURL }  // otherwise restore to the original URL
    draw_chart()  // draw the chart
  }
  $('body').urlfilter({target: 'pushState'})
  $(window).on('#?', redrawChartFromURL)
    .urlchange()
```

[View Source](../charts/output/3/index.html){: class="source"}


At this point, the chart should redraw itself based on the table filters. As an example,
try setting the `Region` column to `South`. The chart should contain only one column now.
Similarly, try filtering by some columns except `Category` or `Region`, and the sales
values in the chart should change.


## Step 4: Filtering the Table on Chart Interactions

Finally, we need to close the loop by making the chart itself interactive, i.e.,
filtering the table automatically as any cell in the chart is clicked. Essentially, this
amounts to:

1. determining the region and the category corresponding to the cell where a click is
   registered,
2. converting this information into a [FormHandler filter](../../formhandler/#formhandler-filters)
   query, and
3. redrawing the table according to this query.

```js
  function filterTableOnClick(event, item) {
    var query = {"Region": item.datum.Region, "Category": item.datum.Category}
    var url = g1.url.parse(location.hash.replace('#', ''))
  }
```

We need to run this function on _every click_ that is registered on the chart. Therefore,
we will add this function as an event listener to the chart. Since we're drawing the chart
inside the `draw_chart` function, we need to add the event listener within the function as
well.

```js
  function draw_chart() {
    var view = new vega.View(vega.parse(vl.compile(spec).spec))
      .renderer('svg')
      .initialize('#chart')
      .hover()
      .run()
    view.addEventListener('click', filterTableOnClick)
  }
```
[View Source](../charts/output/4/index.html){: class="source"}

That's it!

Save the HTML file and refresh the page. You should be able to see a two-way
interaction between the chart and the page. Whenever you click on a cell in the chart, a
pair of filters should show up near the top right corner of the table, and conversely whenever
you apply a filter to the table, it should reflect in the chart.


## Exercises


## Troubleshooting

### Charts not rendering automatically


## Next Steps / FAQ
<script src="../tutorial.js"></script>
