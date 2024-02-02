# g1.sanddance

Transitions elements with flexible timing controls.

## g1.sanddance options

It accepts 2 parameters

1. `attrs`: changes any HTML / SVG attributes of the selection (e.g. `fill`, etc)
   - `fill`, `stroke` for color
   - `x`, `y`, `cx`, `cy`, `transform`, etc for position (but these are better controlled via the options)
   - etc.
2. `options`: defines layout options (e.g. `x`, `y`, `duration`, `speed`, etc)
   - `x`: transition the elements to the x position
   - `y`: transition the elements to the y position
   - `speed`: transition at constant speed in pixels per second
   - `duration`: transition time in milliseconds (overrides `speed`)
   - `delay`: transition delay in milliseconds (default is 0)
   - `easing`: transition easing in d3-ease method (default is d3.easeLinear)
   - `filter`: filter the selection based on a column value (ex: age > 30)

Examples:

```js
// smoothly changes the fill color to blue in 100 ms
var turn_to_blue = g1.sanddance({ fill: "blue" }, { duration: 100 });
selection.call(turn_to_blue);

// g1.sanddance moves elements to the x, y specified in 100ms
var move = g1.sanddance({}, { x: 200, y: 200, duration: 100 });
selection.call(move);

// transitions at 1000 pixels/sec.
var move_at_constant_speed = g1.sanddance({}, { x: 300, y: 300, speed: 1000 });
selection.call(move_at_constant_speed);

// transitions in 100ms duration.
var move_in_duration = g1.sanddance({}, { x: 400, y: 400, duration: 100 });
selection.call(move_in_duration);

// transitions after 100ms delay.
var move_after_delay = g1.sanddance({}, { x: 300, y: 300, delay: 100 });
selection.call(move_after_delay);

// transitions at ease of d3.easeBounce
var move_easing = g1.sanddance(
  {},
  { x: 300, y: 300, duration: 100, easing: d3.easeBounce },
);
selection.call(move_easing);

// filters the selection
var selection_filtered = g1.sanddance(
  { fill: "red" },
  {
    duration: 100,
    filter: function (d) {
      return d.age > 30;
    },
  },
);
selection.call(selection_filtered);
```

## g1.sanddance.chain

To apply a sequence of sanddances one after another, use `g1.sanddance.chain`. For example:

```js
// chain sanddances. First, fill everything red, then move x to 200 and y to 100
selection.call(
  g1.sanddance.chain(
    g1.sanddance({ fill: "red" }, { duration: 100 }),
    g1.sanddance({}, { x: 200, y: 100, duration: 100 }),
  ),
);
```

## g1.sanddance layouts

### grid

Returns a sanddance that moves elements into a grid. Usage:

```js
// Lay out the elements in a grid
selection.call(
  g1.sanddance(
    {},
    {
      // Create a layout based on the data array
      layout: "grid", // lay out as a grid
      width: 400, // with width 400
      height: 300, // and height 300
      data: data, // using the specified data
      sort: "age", // sorted by the 'age' column
      ascending: false, // in descending order
      duration: 100, // in 100ms
    },
  ),
);
```

Options:

- `data`: an array that has the data that is used to lay out the elements
- `width`: width of the grid in SVG units
- `height`: height of the grid in SVG units
- `sort`: column name or `function(d, i)` to sort by
- `ascending`: `false` reverses the sort order (default: `true`)

Values can be specified as a scale. Example: `fill:` can be specified as below.

```js
fill: {
  metric: 'age',
  scheme: 'RdYlGn'
}
// or
fill: {
  metric: 'age',      // same as function(d) { return d.age }
  scale: 'linear',
  domain: [0, 50, 100],
  range: ['red', 'yellow', 'green'],
}
```

Scales are dictionaries with the following keys:

- `metric:` can be a string column name or a `function(d, i)` that returns a value for each item in the data
- `scheme:` d3 chromatic color scheme to interpolate to (e.g. `'RdYlGn'`)
- `scale:` d3 scale to use. Defaults to `'linear'`
- `range`: a list that contains the scale's range
- `domain`: a list that contains the scale's domain (defaults to the extent of the metric)

```js
// fill as scale config with linear scale
selection.call(
  g1.sanddance(
    {
      fill: {
        metric: function (d) {
          return d.age;
        },
        scale: "linear",
        domain: [0, 100],
        range: ["red", "blue"],
      },
    },
    {
      layout: "grid",
      data: data,
      width: 400,
      height: 300,
      duration: 100,
    },
  ),
);

// fill as scale config with scheme
selection.call(
  g1.sanddance(
    {
      fill: {
        metric: function (d) {
          return d.age;
        },
        scheme: "RdYlGn",
      },
    },
    {
      layout: "grid",
      data: data,
      width: 400,
      height: 300,
      duration: 100,
    },
  ),
);
```

### hexpack

Returns a sanddance that moves elements into a hexpack. Usage:

```js
// Lay out the elements in a hexpack
selection.call(
  g1.sanddance(
    {},
    {
      // Create a layout based on the data array
      layout: "hexpack", // lay out as hexpack
      width: 400, // with width 400
      height: 300, // and height 300
      data: data, // using the specified data
      sort: "age", // sorted by the 'age' column
      ascending: false, // in descending order
      duration: 100, // in 100ms
    },
  ),
);
```

The values can also be specified as a scale config and the options definitions are same as grid.

## g1.sanddance methods

`sanddance.update(new_attrs, new_options)` returns a new sanddance that updates
the old `attrs` with `new_attrs` and the old `options` with `new_options`.

```js
// The two lines below are the same:
g1.sanddance({ stroke: "blue" }).update({ fill: "red" });
g1.sanddance({ stroke: "blue", fill: "red" });

// Update the options
g1.sanddance({}, { delay: 100 }).update({}, { duration: 100 }),
  g1.sanddance({}, { duration: 100, delay: 100 });
```

## g1.sanddance events

These events are triggered by the sanddance object.

- `init` when the sanddance is initialized
- `start` when the first transition begins (after delay)
- `end` when all transitions are complete

All events set the d3 selection as `this`. For example:

```js
// sanddance events
selection.call(
  g1
    .sanddance({ fill: "red" })
    .on("init.log", function () {
      console.log("init", this);
    })
    .on("start.log", function () {
      console.log("start", this);
    })
    .on("end.log", function () {
      console.log("end", this);
    }),
);
```
