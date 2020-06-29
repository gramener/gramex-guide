---
title: PPTXHandler v2 generates PPTX
prefix: PPTXHandler
...

There are two versions of PPTXHandler.

- [Version 1](v1/) was introduced in **v1.23**. This is deprecated and no longer maintained.
- Version 2 was introduced in **v1.61** is documented on this page.

PPTXHandler v2 lets you:

- Update charts, images and text from data
- Create a series of slides using a template from spreadsheets or database

This example sets first slide's title to "Total sales is ...", and calculates the total sales from [sales.csv](sales.csv).

```yaml
url:
  pptxhandler2/example:
    pattern: /$YAMLURL/example.pptx
    handler: PPTXHandler
    kwargs:
      version: 2                                  # Use PPTXHandler v2 instead of v1
      source: $YAMLPATH/example-input.pptx        # Input file to load
      data:
        products: {url: $YAMLPATH/products.csv}   # Load products data from products.csv
      rules:                                      # Apply these rules
        - slide-number: 1                           # Take only the first slide
          Visitors:                                 # Find all shapes named "Visitors"
            text: products['visitors']              # Replace text with data template
          Leads:
            text: products["leads"]
          Cart:
            text: products['cart']
      headers:
        Content-Disposition: attachment; filename=example.pptx
```

<div class="example">
  <a class="example-demo" href="sales-funnel/">PPTXHandler example</a>
  <a class="example-src" href="https://github.com/gramexrecipes/gramex-guide/blob/tree/pptxhandler/sales-funnel/">Source</a>
</div>

## Configuration

Both PPTXHandler and `pptgen()` accepts the following top-level keys:

- `source`: path to input PPTX.
- `target`: (optional) path to save target PPTX. This is optional because:
  - PPTXHandler lets users downloads the file anyway
  - `pptgen()` returns the Presentation object, which you can save using `.save(filename)`
- `rules`: list of rules to modify the source using data. See [how to specify rules](#rules)
- `data`: (optional) dataset dictionary to change the PPTX using data. See [how to specify the dataset](#data)
- `unit`: (optional) set the [unit of length][length] used by width, height, etc. See [length unit](#length-unit)
- `mode`: (optional) toggle whether value are [expressions](#expressions) (default for PPTXHandler)
  or [literals](#literals) (default for [`pptgen()`](#pptgen-library))
- `register`: (optional) register custom commands. See [how to register a new command](#register)
- `only`: (optional) slide number or list of slide numbers, starting from 1. All slides except these will be deleted
  - If `only=3`, only the 3rd slide will be used
  - If `only=[3, 5, 6]`, only the 3rd, 5th and 6th slide will be used

## Rules

A rule defines how to modify the source presentation. For example:

```yaml
rules:                              # Apply these rules
  - Title 1:                        # Take the shape named "Title 1"
      text: f'Total sales is {sales["sales"].sum()}'  # Replace text with data template
      fill-opacity: 0.5             # Make shape 50% transparent
  - Rectangle 1:                    # Take the shape named "Rectangle 1"
      fill: f'#ffff00'              # Make its background yellow
```

[EXAMPLE]

A rule can pick one or more shape names, and apply one or more [commands](#commands) to each shape.

### Shapes

The keys in each rule are shape name. All shapes in PowerPoint have names. To see them in
PowerPoint, select Home tab > Drawing group > Arrange drop-down > Selection pane. Or press ALT +
F10.

![Selection pane](selection-pane.png)

To change shape names, double-click on the name in the selection pane.

You can specify changes to one or more shapes in a [rule](#rules). For example:

```yaml
rules:
  - Title 1:                # Shape name "Title 1" will be updated by text "New title"
      text: f'New title'
      style:                # Text color will be `red`(accepts only hex color code in 6 digit)
        color: f'#ff0000'
    Text 1:                 # Shape name "Text 1" will be updated by text "New text"
      text: New text
      style:                # Text color will be `green`(accepts only hex color code in 6 digit)
        color: '#00ff00'
        bold: True          # Text will appear in bold
```

... changes 2 shapes named `Title 1` and `Text 1`.

Shapes shouldn't have the same name as a [command](#commands), e.g. don't name a shape "text".
Instead, **start shape names with a capital letter**, e.g. "Text" instead of "text".

You can use wildcards in a shape name. Use `?` to match a single char, and `*` to match anything.

<div class="example">
  <a class="example-demo" href="shapes/">Shapes examples</a>
  <a class="example-src" href="https://github.com/gramexrecipes/gramex-guide/blob/tree/pptxhandler/shapes/">Source</a>
</div>

### Groups

Groups are shapes too. You can change the [position](#position) of a group, and also change shapes
inside a group, like this:

```yaml
rules:
  - Group 1:                            # Take the shape named "Group 1"
      left: 5                           # Set the group's left position to 5 (inches)
      Caption:                          # Find the shape named "Caption" inside it
        text: f'New caption'            #   Change its text to "New caption"
      Picture:                          # Find the shape named "Picture" inside it
        image: f'$YAMLPATH/sample.png'  #   Replace the image with sample.png
```

<div class="example">
  <a class="example-demo" href="groups/">Groups examples</a>
  <a class="example-src" href="https://github.com/gramexrecipes/gramex-guide/blob/tree/pptxhandler/shapes/">Source</a>
</div>

### Slide filters

By default, changes are applied to all slides, but you can restrict changes to a specific
slide using:

- `slide-number`: filter slides with given number (starting with 1) or list of numbers
    - e.g. `slide-number: 1` picks the first slide
    - e.g. `slide-number: [4, 5]` picks the 4th and 5th slide
- `slide-title`: apply rule only to slides whose title that match this title. Use `?` to match a single char, and `*` to match anything
    - e.g. `slide-title: Business Update` matches all slides with the exact title "Business Update" (case-insensitive)
    - e.g. `slide-title: *Update*` matches all slides with "Update" anywhere in the title (case-insensitive)

(Note: To create multiple slides from data, use [`copy-slide:`](#copy-slides).)

For example:

```yaml
source: input.pptx        # optional path to source. Default to blank PPT with 1 slide
target: output.pptx       # required path to save output as
rules:
  -                       # This rule applies to all slides
    Title 1:                # Take the shape named "Title 1"
      text: f'Alpha'        # Replace its text with "Alpha"
  - slide-number: 1       # This rule applies only to the first slide
    Title 1:                # Take the shape named "Title 1"
      text: f'Beta'         # Replace its text with "Beta"
  - slide-title: Hello    # This applies to all slides with "Hello" (regex) in the title
    Title 1:                # Take the shape named "Title 1"
      text: f'Gamma'        # Replace its text with "New Title"
```

<div class="example">
  <a class="example-demo" href="slide-filters/">Slide filter examples</a>
  <a class="example-src" href="https://github.com/gramexrecipes/gramex-guide/blob/tree/pptxhandler/slide-filter/">Source</a>
</div>

### Transition

Add `transition:` to a rule to set the transition for all [applicable slides](#slide-filters).

For example:

```yaml
rules:
  - transition: f'fade'   # All slides have fade transition for a default duration of 0.3 seconds
  - slide-number: 1       # Slide 1 has morph transition of 1.5 seconds
    transition:
      type: f'morph'
      duration: 1.5
  - slide-number: 2       # Slide 2 has Comb - Horizontal transition. Auto-advances after 5 seconds
    transition:
      type: f'comb horizontal'
      advance: 5
  - slide-number: 3       # Slide 3 has Glitter - Diamonds from Left transition for 3 seconds
    transition:
      type: f'glitter diamond left'
      duration: 3
  - slide-number: 4       # Remove all transitions from slide 4. Auto-advance after 2 seconds
    transition:
      type: f'none'
      advance: 2
```

`duration:` is the length of the transition in seconds. If `advance:` is specified, the presentation auto-advances to the next slide after the specified seconds.

`type:` is a transition name, followed by options (which are optional). Here are all transition
names and their options. These names are similar to those from PowerPoint's UI.

- `none`: (removes all transitions)
- `airplane`: left|right
- `blinds`: horizontal|vertical
- `box`: left|right|top|bottom
- `checker`: horizontal|vertical
- `checkerboard`: horizontal|vertical
- `circle`
- `clock`
- `clock-counterclockwise`
- `comb`: horizontal|vertical
- `conveyor`: left|right
- `cover`: left|right|top|bottom|top-left|top-right|bottom-left|bottom-right
- `crush`
- `cube`: left|right|top|bottom
- `curtains`
- `cut`: through-black
- `diamond`
- `dissolve`
- `doors`: horizontal|vertical
- `drape`: left|right
- `fade`: through-black
- `fall-over`: left|right
- `ferris`: left|right
- `flash`
- `flip`: left|right
- `fly-through`: in|out, bounce
- `flythrough`: in|out, bounce
- `fracture`
- `gallery`: left|right
- `glitter`: diamond|hexagon, left|right|top|bottom
- `honeycomb`
- `morph`: by-object|by-word|by-char
- `newsflash`
- `orbit`: left|right|top|bottom
- `origami`: left|right
- `page-curl-double`: left|right
- `page-curl-single`: left|right
- `pan`: left|right|top|bottom
- `peel-off`: left|right
- `plus`
- `preset`: left|right|top|bottom
- `prestige`
- `prism`: left|right|top|bottom
- `pull`: left|right|top|bottom|top-left|top-right|bottom-left|bottom-right
- `push`: left|right|top|bottom
- `random-bars`: horizontal|vertical
- `random`
- `randomBar`: horizontal|vertical
- `reveal`: left|right, through-black
- `ripple`: top-left|top-right|bottom-left|bottom-right|center
- `rotate`: left|right|top|bottom
- `shape-circle`
- `shape-diamond`
- `shape-in`
- `shape-out`
- `shape-plus`
- `shred`: strips|particles, in|out
- `split`: in|out horizontal|vertical
- `strips`: top-left|top-right|bottom-left|bottom-right
- `switch`: left|right
- `uncover`: left|right|top|bottom|top-left|top-right|bottom-left|bottom-right
- `vortex`: left|right|top|bottom
- `warp`: in|out
- `wedge`
- `wheel`
- `wheelReverse`
- `wind`: left|right
- `window`: horizontal|vertical
- `windows`: horizontal|vertical
- `wipe`: left|right|top|bottom
- `zoom-and-rotate`
- `zoom`: in|out

[EXAMPLE] (morph with sand dance, one other)

### Copy slides

You can copy one or more slides, and apply different layouts or content to each slide.
`copy-slide:` repeats the selected slides for as many times specified.

For example:

```yaml
rules:
  slide-number: 1
  copy-slide: [A, B, C]
  Title 1:
    text: f'Copy {copy.key} {copy.val}'
```

This repeats slide 1 three times, with titles "Copy 0: A", "Copy 1: B" and "Copy 2: C".

`copy-slide:` must be an [expression](#expressions) that returns one of these types. When copying,
the values of (`copy.key`, `copy.val`) are set as follows (just like [`clone-shape:`](#clone-shapes)):

- tuple, list or pandas Index, e.g. `[x, y]` -> `(0, 'x'), (1, 'y')`
- dict, e.g. `{x: 1, y: 2}` -> `(1, 'x'), (2, 'y')`
- pandas Series, e.g. `pd.Series(['x', 'y'], index=[3, 4])` -> `(3, 'x'), (4, 'y')`
- pandas DataFrame, e.g. `pd.DataFrame({'x': row1, 'y': row2})` -> `('x', row1)), ('y', row2)`
- pandas GroupBy, e.g. `data.groupby('key')` -> [GroupBy iterator](https://pandas.pydata.org/pandas-docs/stable/reference/groupby.html) with group name and subsetted data

The `copy` variable has these attributes:

- `copy.pos`: 0, 1, 2, ... for each copied slide
- `copy.key`: For lists or tuples, this is the same as `copy.pos`. For dicts, Series, DataFrames, etc, it's the key or index
- `copy.val`: Value corresponding to `copy.key`
- `copy.parent`: If a group was copied, and a slide inside the group was copied too, `copy.parent` returns the `copy` object of the parent group
- `copy.slides`: Currently copied list of slides

<div class="example">
  <a class="example-demo" href="copy-slide/">Copy slides examples</a>
  <a class="example-src" href="https://github.com/gramexrecipes/gramex-guide/blob/tree/pptxhandler/copy-slide/">Source</a>
</div>


## Commands

Shapes can be changed using 1 or more commands. These commands can change the shape's style and
content, or add new content (like charts). Here are some common commands:

### Position

- `top`: sets top (Y) position in [length units](#length-units), e.g. `f'3 inches'`
- `left`: sets left (X) position in [length units](#length-units), e.g. `f'3 inches'`
- `width`: sets width in [length units](#length-units), e.g. `f'3 inches'`
- `height`: sets height in [length units](#length-units), e.g. `f'3 inches'`

<div class="example">
  <a class="example-demo" href="position/">Position examples</a>
  <a class="example-src" href="https://github.com/gramexrecipes/gramex-guide/blob/tree/pptxhandler/position/">Source</a>
</div>

- `add-top`: moves top (Y) position +/- in `[length units](#length-units)`, e.g. `f'-3 inches'`
- `add-left`: moves left (X) position +/- in `[length units](#length-units)`, e.g. `f'+3 inches'`
- `add-width`: adds width +/- in `[length units](#length-units)`, e.g. `f'-3 inch'`
- `add-height`: adds width +/- in `[length units](#length-units)`, e.g. `f'+3 inches'`

<div class="example">
  <a class="example-demo" href="add-position/">Add position examples</a>
  <a class="example-src" href="https://github.com/gramexrecipes/gramex-guide/blob/tree/pptxhandler/add-position/">Source</a>
</div>

- `rotation`: sets the rotation in angles, e.g. `30`
- `add-rotation`: adds the rotation in angles, e.g. `-30`
- `zoom`: increases/decreases width & height around the center, e.g. `1.2` increases the size to 120%, `0.6` shrinks it to 60% around the center
- `adjustment1`: sets 1st shape adjustment
- `adjustment2`: sets 2nd shape adjustment
- `adjustment3`: sets 3rd shape adjustment
- `adjustment4`: sets 4th shape adjustment

[EXAMPLE]

### Style

- `fill`: sets fill (background) [color](#color-units), e.g. `f'red'`
- `stroke`: sets line [color](#color-units), e.g. `f'red'`
- `fill-opacity`: sets fill transparency on solid color fills. 0 is transparent, 1 is opaque, e.g. `0.5` is half transparent
- `stroke-opacity`: sets line transparency on solid color strokes.  0 is transparent, 1 is opaque, e.g. `0.5` is half transparent
- `stroke-width`: sets width of the line in [length units](#length-units), e.g. `f'0.5 pt'`

[EXAMPLE]

### Image

- `image`: set image of a picture to a file or URL, e.g. `new-pic.png` or `https://picsum.photos/200`. Retains aspect ratio, width and position. May change the height
- `image-width`: sets width in [length units](#length-units), e.g. `3 inches`. Retains aspect ratio and position (top and left). May change the height
- `image-height`: sets height in [length units](#length-units), e.g. `3 inches`. Retains aspect ratio and position (top and left). May change the width

[EXAMPLE]

### Link

- `link`: on click, shape opens another slide, file or URL, e.g. `link: 4`, `link: f'https://gramener.com/'`
- `hover`: on hover, shape opens another slide, file or URL, e.g. `link: 4`, `link: f'https://gramener.com/'`
- `tooltip`: adds a text tooltip, e.g. `f'Title text'`. Does not work with `hover:` nor `link: back`

`link` and `hover` can be specified as a:

- slide number, e.g. `link: 4`. Values can be any slide number starting from 1
- slide reference, e.g. `link: f'first'`. Values can be `first`, `last`, `next`, `prev` (alias:
  `previous`), `back` (for last viewed slide), or `end` (for end show).
- file, e.g. `link: f'new.pptx'`
- URL, e.g. `link: f'https://gramener.com/'`
- `noaction`. This removes any prior link or hover on the shape

[EXAMPLE]

### Text

- `text`: sets the shape's [text and format](#text-format), e.g. `text: <p><a italic="y">New</a> <a bold="y">text</a></p>`
- `replace`: updates the shape's [text and format](#text-format), e.g. `replace: {old: new, (rabbit|fox): <a color="red">animal</a>}`.
    - Replace only works within a run, i.e. for words that have the same formatting. For example, in
      "some<u>where</u>", "where" is underlined. You cannot replace "somewhere". But you can replace
      "some" and "where" independently.
- `bold`: makes the text bold or normal. It can be true/yes/y/1 or false/no/n/0/"", e.g. `bold: true`
- `color`: sets the text color in [color units](#color-units), e.g. `color: f'red'`
- `font-name`: sets the font name. It can be Arial, Calibri, or any valid font name, e.g. `font-name: f'Arial'`
- `font-size`: sets the font size in [length units](#length-units), e.g. `font-size: f'18 pt'`
- `italic`: makes the text italicized or normal. It can be true/yes/y/1 or false/no/n/0/"", e.g. `italic: true`
- `underline`: underlines the text or makes it normal. It can be true/yes/y/1 or false/no/n/0/"", e.g. `underline: true`

[EXAMPLE]
- How to color text in red
- How to add bold, italics, underline, strike
- How to change the font size and family
- How to create an indented bullet list
- How to create a indented number list
- How to create superscript, subscript

### Text format

The text for [`text:`](#text) may include `<p>` tags for for paragraphs, which may contain `<a>`
tags for runs. Similarly, the new text for [`replace:`](#text) may include a single `<a>` tags for
the run. (These look like HTML, but they're not.)

Paragraphs (`<p>`) can have attributes like `<p align="right" level="2">`. Valid attributes are:

- `align=` is the paragraph alignment. It can be left, center, right, justify, justify_low, (justify with low word spacing), distribute (for Japanese characters), thai_distribute, e.g. `align="right"`
- `level=` is the indentation level number from 0 (default) to 8, e.g. `level="2"`
- `line-spacing=` is the line spacing in [length units](#length-units), e.g. `line-spacing="3 pt"`
- `space-after=` is the space after the paragraph in [length units](#length-units), e.g. `space-after="18 pt"`
- `space-before=` is the space before the paragraph in [length units](#length-units), e.g. `space-before="18 pt"`

Runs (`<a>`) can have attributes like `<a href="https://gramener.com/" bold="y" italic="y">`. Valid attributes are:

- `baseline=` moves text up or down. It can be `superscript`, `subscript`, or any percentage, e.g. `baseline="-25%"`, `baseline="subscript"`
- `bold=` makes the text bold or normal. It can be true/yes/y/1 or false/no/n/0/"", e.g. `bold="y"`
- `color=` sets the text color in [color units](#color-units), e.g. `color="red"`
- `font-name=` sets the font name. It can be Arial, Calibri, or any valid font name, e.g. `font-name="Arial"`
- `font-size=` sets the font size in [length units](#length-units), e.g. `font-size="18 pt"`
- `hover=` sets the [hover link](#link), e.g. `hover="back"` or `hover="3"`
- `italic=` makes the text italicized or normal. It can be true/yes/y/1 or false/no/n/0/"", e.g. `italic="y"`
- `link=` sets the [hyperlink](#link), e.g. `link="back"` or `link="3"`
- `strike=` adds a strikethrough. It can be `single`, `double` or `none`, .e.g `strike="single"`
- `tooltip=` sets the [tooltip](#link), e.g. `tooltip="Tooltip text"`
- `underline=` underlines the text or makes it normal. It can be true/yes/y/1 or false/no/n/0/"", e.g. `underline="y"`

You can't use `<p>` inside another `<p>`, nor an `<a>` inside another `<a>`. If you do, the previous
tag is closed.

Example:

```yaml
rules:
  - Rectangle 1:
      color: f'#ff0000'
      fill: f'#ffff00'
      stroke: f'#ffff00'
      width: f'3 in'
      height: f'2 in'
      left: f'5 in'
      top: f'1 in'
      text: f'New text'
      font-size: f'12 pt'
```

[Run example](css-example)
[Run example](rules-example)
[Run example](text-xml-style)

### Clone shapes

Use `clone-shape:` to clone a shape for as many times specified. For example:

```yaml
rules:
  Rectangle 1:
    clone-shape: [A, B, C]
    text: f'Clone {clone.key} {clone.val}'
```

This repeats the shape three times, with text "Clone 0: A", "Clone 1: B" and "Clone 2: C".

`clone-shape:` must be an [expression](#expressions) that returns one of these types. When cloning,
the variables (`clone.key`, `clone.val`) are set as follows (just like [`copy-slide:`](#copy-slides)):

- tuple or list, e.g. `[x, y]` -> `(0, 'x'), (1, 'y')`
- dict, e.g. `{x: 1, y: 2}` -> `(1, 'x'), (2, 'y')`
- pandas Series, e.g. `pd.Series(['x', 'y'], index=[3, 4])` -> `(3, 'x'), (4, 'y')`
- pandas DataFrame, e.g. `pd.DataFrame({'x': row1, 'y': row2})` -> `('x', row1)), ('y', row2)`
- pandas GroupBy, e.g. `data.groupby('key')` -> [GroupBy iterator](https://pandas.pydata.org/pandas-docs/stable/reference/groupby.html) with group name and subsetted data

The `clone` variable has these attributes:

- `clone.pos`: 0, 1, 2, ... for each cloned shape
- `clone.key`: For lists or tuples, this is the same as `clone.pos`. For dicts, Series, DataFrames, etc, it's the key or index
- `clone.val`: Value corresponding to `clone.key`
- `clone.parent`: If a group was cloned, and a shape inside the group was cloned too, `clone.parent` returns the `clone` object of the parent group
- `clone.shape`: Currently cloned shape

[EXAMPLE]



### Debug

- `name:` changes the name of the shape, e.g. `name: !!Bar` lets "morph" [transitions](#transition)
  match shape names beginning with `!!`.
  [Source](https://support.microsoft.com/en-us/office/morph-transition-tips-and-tricks-bc7f48ff-f152-4ee8-9081-d3121788024f)
- `print:` prints the result of an expression using [data](#data), e.g. `print: shape.name` prints
  the current shape name. Print multiple values as a list, e.g. `print: [shape.name, clone.key]`


### Register

Register let you create your own custom commands. It can run any Python code using 3 variables:

1. `shape`: the [PPTX shape](https://python-pptx.readthedocs.io/en/latest/api/shapes.html))
2. `spec`: whatever configuration value you pass to the command
3. `data`: dictionary that has whatever data is available to the command

For example, here are some custom commands:

```yaml
register:
  rename: setattr(shape, "name", spec)      # Add a "rename" command that changes the shape's name
  turn: setattr(shape, "rotation", spec)    # Add a "turn:" command that changes the shape's angle
  custom: my_method(shape, spec, data)      # my_method can do anything with the shape and val
rules:
  - Shape 1:                                # Take the shape named Shape 1
      rotate: 45                            # Rotate clockwise 45
      rename: New Shape 1                   # Change the shape name to New Shape 1
      my_method: ...                        # Any object can be passed to my_method
```


## Expressions

PPTXHandler is mostly used to change presentations using [data](#data). So values are evaluated as
Python expressions. For example:

```yaml
data:
  widths: [1, 2, 3]
  colors: [red, blue, green]
rules:
  - Rectangle 1:
      # Type in YAML strings almost like you would type it in Python
      width: sum(widths)      # Python expression using "widths" as a variable. Returns 1+2+3=6
      fill: colors[0]         # Python expression using "colors" as a variable. Returns "red"
      left: 10                # Numbers in YAML are numbers in Python too. This sets left: 10 inches
      stroke: [255, 0, 0]     # Lists in YAML are lists in Python too. This sets the stroke to red
```

What won't work are literal strings. Instead, use `f'...'` -- a Python format-string. For example:

```yaml
      # Incorrect
      color: red              # This is NOT 'red'. This is the VARIABLE red (which is not
      color: 'red'            # This is NOT 'red'. This is the VARIABLE red (which is not defined)
      # Correct
      color: f'red'           # Use formatted strings inside.
      text: f'Color {colors[0]}'  # These can be templates. This sets text to 'Color red'
```

To use literal values, you can also use `{value: ...}`. For example:

```yaml
      # Incorrect
      color: 'red'            # This is NOT 'red'. This is the VARIABLE red (which is not defined)
      # Correct
      color: {value: red}     # Strings inside value: are treated literally
      text: {value: 'Color {colors[0]}'}  # These can be templates. This sets text to 'Color red'
```

[EXAMPLE]

To fully switch to [literal values](#literals) instead of expressions, use `mode: literal`. For example:

```yaml
mode: literal
rules:
  - color: red              # This sets the color to the string "red"
```


## Literals

By default, values passed to [`pptgen()`](#pptgen-library) are used as-is. For example:

```python
widths = [1, 2, 3]
colors = ['red', 'blue', 'green']
pptgen('source.pptx', rules=[
  'Rectangle 1': {
    'width': sum(widths),   # Values are passed as-is. Returns 1+2+3=6
    'fill': colors[0],      # Values are passed as-is. Returns "red"
    'left': 10,             # Numbers are passed as-is. This sets left: 10 inches
    'stroke': [255, 0, 0],  # Lists are passed as-is. This sets the stroke to red
    'color': 'red',         # Strings can be passed as-is
    'text': 'Shape {shape.name}'  # Strings are formatted with data. This sets text to 'Shape Rectangle 1'
  }
])
```

To use [expressions](#expressions) instead of literals, use `{expr: ...}`. For example:

```python
pptgen('source.pptx', rules=[
  'Rectangle 1': {
    'clone-shape': widths,                # Clone the shape for each entry in "widths"
    'width': {'expr': '1 + clone.val'},   # The value is an expression. Sets width to 1 + width
  }
])
```

[EXAMPLE]

To fully switch to [expressions](#expressions) instead of literals, use `mode='expr'`. For example:

```python
pptgen('source.pptx', mode='expr', rules=yaml_config['rules'])
```

## Data

PPTGen can change presentations with data from various sources. It uses the same syntax as
[FormHandler](../formhandler/). It supports these keys:

- `url:` A SQLAlchemy URL or file name
- `ext:` file extension (if url is a file). Defaults to url extension
- `table:` table name (if url is an SQLAlchemy URL)
- `query:` optional SQL query to execute (if url is a database)
- `transform:` optional in-memory transform. The loaded data (typically a DataFrame) is in the
  variable `data`. It should return a revised dataset (typically a DataFrame)
- `args:` optional filters to apply to dataset, passed as a dict of lists. For example,
  `{'city':['Oslo', 'Kiev']}` filters where city is Oslo or Kiev. `{'population>~', '100000'}`
  filters where population is 100,000+.
- Any additional keys are passed to `gramex.data.filter()`, and in turn to `gramex.cache.open()` or
  `sqlalchemy.create_engine()`.

You can also specify the data as a function using `function:`. This can be any Python expression.

Example:

```yaml
data:
  cities: {url: cities.csv}                         # Load cities.csv into "cities" key
  sales: {url: sales.xlsx, sheet: Sheet1}           # Load Sheet1 from sales.xlsx into "sales" key
  tweets: {url: tweets.json}                        # Load JSON data into "tweets" key
  sample: {url: mysql://server/db, table: sample}   # Load sample data from MySQL
  filter:
    url: cities.csv                                 # Load cities.csv
    args:                                           # Filter results
      city: [Oslo, Kiev]                            # WHERE column "city" is Oslo or Kiev
      population>~: 100000                          # AND column population is 100,000+
  custom1:
    function: gramex.cache.open('data.xlsx')        # Run a custom function
  custom2:
    function: gramex.cache.open(handler.get_arg('file'))  # Functions can accept handler as argument
  big_cities:
    function: cities[cities.population > 100000]    # You can also access loaded datasets
```

These datasets are available in [expressions](#expressions) as variables. For example, you can use:

```yaml
rules:
  - Rectangle 1:
      text: cities.columns[0]
  - Rectangle 2:
      text: tweets[0]['text']
```

Expressions can also use these pre-defined variables. (DON'T create a variable with these names.
They will be over-ridden.)

- `prs`: the source PPTX as a pptx.Presentation object, e.g. `len(prs.slides)`
- `slide`: the current slide being processed, e.g. `slide.shapes.title`
- `shape`: the current shape being processed, e.g. `shape.width` or `slide.name`
- `handler`: the PPTXHandler instance (if available), e.g. `handler.get_arg('title')`

[EXAMPLE]

## PPTGen Library

You can access the [pptgen][pptgen] library to make the same changes programmatically.
PPTXHandler is just a wrapper around pptgen. Here's an example:

```python
from gramex.pptgen2 import pptgen
target = pptgen(
  source='input.pptx',                # Input file to load
  data={
    'sales': {'url': 'sales.csv'}     # Load sales data from sales.csv
  },
  rules=[                             # Apply these rules
    {
      'slide-number': 1,              # Take only the first slide
      'Title 1': {                    # Find all shapes named "Title 1"
        'text': 'Total sales is {sales["sales"].sum()}'   # Replace text with data template
      }
    }
  ]
)
target.save('slide1.pptx')  # Save the target
```

The Python library does not treat strings as [expressions](#expressions). So `'red'` means the
string "red", not the variable `red`. You can specify string values as-is. (If you want to use the
variable `red` in Python, use `data['red']`).

But if you need to use expressions (e.g. to specify `copy.val` in a [`copy-slide:`](#copy-slides)),
you can use `{'expr': '...'}`. For example:

```python
from gramex.pptgen2 import pptgen
target = pptgen(
  source='input.pptx',                # Input file to load
  rules=[                             # Apply these rules
    {
      'slide-number': 1,              # Take only the first slide
      'copy-slide': ['A', 'B'],       # Copy it twice
      'Title 1': {                    # Find all shapes named "Title 1"
        'add-top': {'expr': 'copy.key * 10'}, # Add 0 * 10 to slide A's top, 1 * 10 to slide B's top
      }
    }
  ]
)
target.save('slide1.pptx')  # Save the target
```

[EXAMPLE]

## Units

### Length units

Any command that sets a length, e.g. `width: 5`, uses "inches" by default. You can change the unit
to "cm" using `width: 5 cm`. Or, you can change the default unit from "inches" to "cm" by passing
`unit: inches` to the [PPTXHandler or `pptgen()` configuration](#configuration).

[Valid length units][length-units] are:

- `inches`: inches. Use `in`, `inch`, or `"` as an alias -- e.g. `3.2"` is `3.2 inches`)
- `cm`: centimeters
- `mm`: millimeters
- `pt`: points are 1/72 inches
- `centipoints`: hundredths of a point, i.e. 1/7200 inch. Use `cp` or `centipoint` as an alias
- `emu`: English metric units (1/914400 inches)

[length-units]: https://python-pptx.readthedocs.io/en/latest/api/util.html#pptx.util.Length

### Color units

Any command that sets a color, e.g. `fill: f'red'`, accepts colors in one of these formats:

- a named color, like `red`
- a hex value, like `#f80` or `#ff8800`
- an RGB value, like `rgb(255, 255, 0)`
- a tuple or list of RGB values, like `(255, 255, 0)` or `[255, 255, 0]`
- a [theme color][theme-colors], like `ACCENT_1`, `ACCENT_2`, `BACKGROUND_1`, `DARK_1`, `LIGHT_2`
- a [theme color][theme-colors] with a brightness modifier, like `ACCENT_1+40`, which is 40%
  brighter than Accent 1, or `ACCENT_2-20` which is 20% darker than Accent 2
- `none` clears the color, i.e. makes it transparent

[theme-colors]: https://python-pptx.readthedocs.io/en/latest/api/enum/MsoThemeColorIndex.html


## Support

PPTGen currently cannot handle:

- Equations
- Zoom

[pptxhandler]: https://learn.gramener.com/gramex/gramex.handlers.html#gramex.handlers.PPTXHandler
[pptgen]: https://learn.gramener.com/gramex/gramex.pptgen.html
