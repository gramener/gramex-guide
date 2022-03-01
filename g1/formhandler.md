# $.formhandler

An interactive table component for [FormHandler][formhandler] data.

```html
<div class="formhandler" data-src="formhandler-url" data-page-size="10"></div>
<script>
$('.formhandler').formhandler({
  pageSize: 20
})
</script>
```

Options can passed via an options dict, and over-ridden using `data-` attributes.
In the above example, `data-page-size="10"` over-rides `pageSize: 20`.

[formhandler]: https://learn.gramener.com/guide/formhandler/

## $.formhandler options

The full list of options is below. Simple options can be specified as `data-` attributes as well.

- `src`: [FormHandler][formhandler] URL endpoint
- `data`: Array of objects. Dataset for formhandler table. If both `src` and `data` are provided, `data` takes priority.
- `namespace`: (Optional) If the URL has `?name:key=value`, the filter
  `key=value` only applies to formhandlers with namespace as `name`.
  Filters without a namespace like `?key=value` will apply to all formhandlers.
- `columns`: comma-separated column names to display, or a list of objects with these keys:
  - `name`: column name. `"*"` is a special column placeholder for "all columns" (options given for `"*"` are applied for all columns)
  - `title`: for header display. Defaults to the same value as `name`
  - `type`: `text` (default) / `number` / `date`. Data type. Determines filters to be used
  - `format`: string / function that returns formatted cell display value.
    - function accepts an object with these keys:
      - `name`: column name
      - `value`: cell data value
      - `row`: row data
      - `index`: row index
      - `data`: the dataset from `src`
    - strings specify a numeral.js format if the value is a number (you must include numeral.js)
    - strings specify a moment.js format if the value is a date (you must include moment.js)
  - `editable`: `true` (default) / `false`. When `true`, edit and save buttons appears at end of each row. To bind UI input element such as dropdown, datepicker, radio etc., `editable` accepts an object with these keys.
    - `input`: **Mandatory**. The type of input element to use. The valid values are checkbox, radio, range, select, and any other legal [HTML form input type](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
    - `options`: An array of options to select from. **Mandatory** if `input` is either of `select` or `radio`
    - `attrs`: To place common attributes such as max, min, placeholder, name etc., on the input.
      Example: `{placeholder: "Age", max:100}` renders `<input placeholder="Age" max="100">`
    - `validationMessage`: The message to be shown when invalid input is entered.
      Example: `"Age must be less than 100"`
  - `template`: string template / function that renders the cell.
    - function accepts an object with these keys:
      - `name`: column name
      - `value`: cell data value
      - `format`: formatted cell display value
      - `link`: cell link value (if applicable)
      - `index`: row index
      - `row`: row data
      - `data`: the dataset from `src`
    - string template can use the above variables
  - `sort`: `true` / `false` / operators dict with:
    - `{'': 'Sort ascending', '-': 'Sort descending'}` (default)
  - `filters`: `true` (default) / `false` / operators dict with:
    - `{'', 'Equals...', '!', 'Does not equal...', ...}`. The default list of operators is based on the auto-detected type of the column.
  - `link`: string / function that generates a link for this each cell.
    - If no `link:` is specified, clicking on the cell filters by that cell.
    - If `link: false`, the cell has no link
    - If `link:` is a function, opens a new window with the URL as `fn(args)`.
      - function accepts an object with these keys:
        - `name`: column name
        - `value`: cell data value
        - `format`: formatted cell display value
        - `index`: row index
        - `row`: row data
        - `data`: the dataset from `src`
      - Example: `function(args) { return 'https://example.org/city/' + args.value }`
      - Example: `function(args) { return false }` clears the link
    - If `link:` is a URL with a path, opens a new window with the string
      URL interpolated as a lodash template with an object (mentioned above)
      as data. Example: `"https://example.org/city/<%- value >"`
    - If `link:` is a URL with only query parameters, apply the filters. Example: `"?name=<%- row.name %>"`
  - `hideable`: `true` (default) / `false`. Show or hide `Hide` option in header dropdown
  - `hide`: `true` / `false` (default). Hides the column
  - `unique`: TODO: {dict of query parameter and display value} or [list of values] or function?
- `edit`: Shows the Edit control. Can be `true` / `false` (default). Can also pass an object.
  - `done`: function that gets called after saving the edited row.
- `add`: Show the Add control. Can be `true` / `false` (default). Can also pass an object.
  - `done`: function that gets called after saving the new row.
- `actions`: A list of objects. you need not add it to actions
  - `{{action}}`: a function() that gets triggered on clicking the element with `data-action='{{action}}` attribute. The value of `data-action` attribute must match with key `{{action}}` in `actions`.
    - function accepts an object with these keys:
      - `row`: row data
      - `index`: index of the row in the dataset from `src`
      - `notify(message)`: a function that shows a notification
    - If the return value can be a jQuery deferred (e.g. `$.ajax`), it shows a loading indicator and a success / failure message when the deferred is resolved. Example:
      - `highlight_row`: `function(obj) { $(obj.row).addClass('.yellow_color')}`. Either a new column can be defined in `columns:` (example: {`name`: `Additional Col`}) with cell_template having an element with data attribute as `data-action='highlight_row'` or can use an existing column but with custom template that has an element with data attribute as `data-action='highlight_row'`.
  - Note: DELETE operation is executed on a row if an element has data attribute `data-action='delete'`. If `delete` action is given in `actions`, the function given for `delete` is executed on click of an element with `data-action='delete'` instead od executing DELETE operation.
- `onhashchange`: `true` re-renders table on hashchange based on filters in URL
  hash. Set `false` to disable listening to hashchange (default `true`)
- `table`: Shows the table control. Can be:
  - `true`: displays a table (default)
  - `'grid'`: renders a grid instead of a table
  - `false`: disables the table (and shows nothing for the main content)
- `count`: Shows the number of rows. Can be `true` (default) / `false`
- `page`: Shows the page control. Can be `true` (default) / `false`.
- `pageSize`: page size (or via `data-page-size`). Defaults to 100
- `size`: Shows the page size control. Can be `true` (default) / `false`
- `sizeValues`: Allowed page size values (or via `data-size-values`). Defaults to `[10, 20, 50, 100, 500, 1000]`
- `export`: Shows the export control. Can be `true` (default) / `false`
- `exportFormats`: Defines export formats to use (or via `data-export-formats`). E.g. `{xlsx: 'Excel', 'csv': 'CSV'}`
- `filters`: Shows the applied filters control. Can be `true` (default) / `false`
- `transform`: an optional function() that modifies data. It accepts a dict that has keys:
  - `data`: the FormHandler data
  - `meta`: the FormHandler metadata from the `FH-*` HTTP headers
  - `args`: the URL query parameters passed to the FormHandler
  - `options`: the options applicable to the FormHandler
  - returns a dict with modified values of `data` and `meta`
- `icon`: if `table: 'grid'` is used, display an icon. string / function that renders the cell.
  - function accepts an object with these keys:
    - `row`: row data
    - `data`: the dataset from `src`
    - `index`: index of the row in the dataset from `src`
  - Example:
    - `icon: 'fa fa-home fa-3x'` renders a FontAwesome home icon
    - `icon: './path/to/image.png'` renders the image specified
    - `icon: function(args) { return args.row['image_link'] }` renders an image with `src` attribute as the value from column name `image_link`

**Advanced**. Each component can have a target which specifies a selector. For
e.g., to render the export button somewhere else, use
`data-export-target=".navbar-export"`. This replaces the `.navbar-export`
contents with the export button. (It searches within the table container for
`.navbar-export` first, and if not found, searches everywhere.) Available
targets are:

- `tableTarget`
- `countTarget`
- `pageTarget`
- `sizeTarget`
- `exportTarget`
- `filtersTarget`
- `searchTarget`

**Advanced**: Each component's template string can be over-ridden. For example,
`data-search-template="<input type='search'>"` will replace the search template
with a simple input. Available template strings are:

- `tableTemplate`
- `table_gridTemplate`
- `countTemplate`
- `pageTemplate`
- `sizeTemplate`
- `exportTemplate`
- `filtersTemplate`
- `searchTemplate`
- `rowTemplate`, which can be a string template or function
  - function accepts an object with these keys:
    - `row`: row data
    - `index`: row index
    - `data`: the dataset from `src`
  - string template can use the above variables

Features to be implemented:

- Loading indicator
- Full text search
- URL targets other than '#', e.g. pushState

## $.formhandler events

- `load` is fired on the source when the template is rendered. Attributes:
  - `formdata`: the FormHandler data
  - `meta`: the FormHandler metadata
  - `args`: the URL query parameters passed to the request
  - `options`: applied options to the FormHandler

  Note: Make sure `load` event listener is attached before calling `$.formhandler()`

- `editmode` is fired on the source when the Edit button is clicked and table changes to edit mode.

## $.formhandler data

When you run `$(...).formhandler()` on an element, you can access
FormHandler-related data and methods via `$(...).data('formhandler')`. This
returns an object with these keys:

- `data`: data currently displayed by the component (as an array of objects)
- `meta`: metadata returned by the FormHandler (e.g. `meta['fh-data-count']` has the total # of rows)
- `args`: args passed to the FormHandler
- `options`: options passed to this component
- `isEdit`: `true` if the component is editable
- `isAdd`: `true` if new rows can be added to the component
- `notify`: `notify('message')` displays a notification on this component

For example:

```js
$('.formhandler').formhandler()
var data = $('.formhandler').data('formhandler')
data.data   // data displayed by component
data.meta   // metadata returned by the FormHandler
data.args   // args passed to the FormHandler
```

## $.formhandler examples

### Render from a FormHandler

```html
<div class="formhandler" data-src="./data"></div>
<script>
  $('.formhandler').formhandler()
</script>
```

### Access data inside formhandler

```html
<div class="formhandler" data-src="./data"></div>
<script>
  $('.formhandler')
    .on('load', function(data, meta, args, options) {
      console.log('data inside formhandler table: ', data)
    })
    .formhandler()
</script>
```

## Draw chart in cell

```html
<div class="formhandler" data-src="./data"></div>
<script>
  $('.formhandler').formhandler({
    columns: [
      {name: '*'},
      {
        name: 'c1',
        format: function (o) {
          return '<svg height="10" width="10"><circle cx="5" cy="5" r="' + o.c1 / 10 + '" fill="red"></circle></svg>'
        }
      }
    }
  })
</script>
```

### Customize inputs in edit mode

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.8.0/css/bootstrap-datepicker.css"/>

<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/js/select2.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.8.0/js/bootstrap-datepicker.js"></script>

<div class="edit-fh" data-src="./data"></div>
<script>
      $('.edit-fh').formhandler({
        columns: [
          {
            name: 'ID',
            editable: false     // Disable edit for column "ID" because it is a primary key and cannot be edited.
          },
          {
            name: 'Continent'  // Defaults to editable: false
          },
          {
            name: 'c1',
            editable: {
              input: 'number',
              // keys and values in `attrs` will be added as
              // <input type="number" min=10 max=100 placeholder="Age"/>
              attrs: {
                min: 10,
                max: 100,
                placeholder: 'Age'
              },
              validationMessage: 'Age must be between 0-100'
            }
          },
          {
            name: 'Stripes',
            editable: {
              input: 'select',  // renders a default select dropdown as <select class="form-control form-control-sm">...</select>
              options: [        // `options` is mandatory because `input` is "select"
                'Vertical',
                'Horizontal',
                'Diagonal'
              ]
            }
          },
          {
            name: 'Shapes',
            editable: {
              input: 'select',
              options: [
                'Circle',
                'Crescent',
                'Triangle',
                'Stars'
              ],
              attrs: {
                class: 'select-example-basic',  // To render the dropdown as select2 library dropdown, add class attribute as identifier
                name: 'shapes'
              }
            }
          },
          {
            name: 'date_col',
            editable: {
              input: 'text',
              attrs: { // To edit column "date_col" using a date picker widget using "bootstrap-datepicker" library, add class attribute as identifier
                class: 'datepicker-example form-control form-control-sm'
              }
            }
          }
        ]
      }).on('editmode', function () {
        // turns <select class="select-example-basic">...</select> to select2 dropdown widget
        $('.select-example-basic').select2()
        // turns <input type="text" class="datepicker-example"/> to bootstrap-datepicker calendar widget
        $('.datepicker-example').datepicker({
          format: 'dd-mm-yyyy',
          todayHighlight: true,
          autoclose: true
        })
      })
</script>
```
