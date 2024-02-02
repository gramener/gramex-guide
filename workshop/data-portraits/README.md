---
title: Build a Data Portrait
prefix: workshop
...

Take a look at this [data portrait](portrait.html). It's based on [How to draw your own selfie — using your personal data](https://ideas.ted.com/how-to-draw-your-own-selfie-using-your-personal-data/).

[![Sample data portrait](sample.svg){.img-fluid}](portrait.html)

We made this using:

- [PowerPoint](https://cdn.glitch.com/00ca098e-1db3-4b35-aa48-6155f65df538%2Fdata-portrait.pptx?v=1623932982031) to generate the
  [SVG](https://cdn.glitch.com/00ca098e-1db3-4b35-aa48-6155f65df538%2Fportrait.svg?v=1623928230671)
- [UIFactory](https://www.npmjs.com/package/uifactory) to map data to SVG attributes using rules.

In this workshop, we'll explain how this was created.

<div class="ratio ratio-16x9">
  <iframe src="https://www.youtube.com/embed/Np50SvvX8UY" allowfullscreen></iframe>
</div>

## Tutorial

Here's a step-by-step guide on how you can create a simple data portrait using an SVG file.

1. OPTIONAL: Draw this image in PowerPoint and save it as an SVG file.
   ![Phone](https://raw.githubusercontent.com/gramener/gramex-guide/master/workshop/data-portraits/phone.svg){.img-fluid}
2. [Log into CodePen](https://codepen.io/login) with any account
3. [Create a new Pen](https://codepen.io/pen/)
4. Copy this code to the HTML pane:

```html
<script
  src="https://cdn.jsdelivr.net/npm/uifactory@1.22.0/src/uifactory.js"
  import="@svg-chart"
></script>
<svg-chart
  src:urltext="https://raw.githubusercontent.com/gramener/gramex-guide/master/workshop/data-portraits/phone.svg"
  data:js="{phone: 'iPhone', hours: 2.3}"
  rules:js="{
     }"
></svg-chart>
```

Inside `rules:js`, set the phone color based on the phone. (The phone should turn yellow.)

```js
       '.phone': { fill: data.phone == 'Android' ? 'pink' : 'yellow' },
```

Set the phone name. (The phone name should change to "iPhone")

```js
       '.phone-name': { text: data.phone },
```

Set the bar's width based on hours of usage. (The bar should widen.)

```js
       '.hours': { width: data.hours * 60, fill: 'aqua' },
```

Set the hours of usage text. (The text should change from 1 to 2.3)

```js
       '.hours-text': { text: data.hours }
```

Inside `data:js`, change the phone from `iPhone` to `Android`, and hours from `2.3` to `5.5`. See the change.

[See a working example](https://codepen.io/sanand0/pen/zYdvqbw?editors=1000)

# Examples of use

- [Geographic Maps](https://gramener.com/cartogram/)
- [Plant process monitoring](https://gramener.com/processmonitor/monitor)
- [Service process flow](https://gramener.com/servicerequests/)
- [Store layout monitoring](https://gramener.com/store/retail_store_layout)
- [Supply chain flows](https://gramener.com/store/retail_supply_chain)
  {"mode":"full","isActive":false}
