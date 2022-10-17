---
title: UI Components
prefix: UI Components
...

The UI component library has components to build web front-ends.

[TOC]

## Install

Add this to your `gramex.yaml`. Now, the UI component library is available at `/ui/`.

```yaml
import:
  ui:
    path: $GRAMEXAPPS/ui/gramex.yaml
    YAMLURL: $YAMLURL/ui/
```

Change the `$YAMLURL/ui/` to any path you want to expose the UI components at.

## Themes

The UI component library ships with pre-defined
[Bootstrap themes](https://getbootstrap.com/docs/4.5/getting-started/theming/) from
[Bootswatch](https://bootswatch.com/) and [Bootstrap Themes Guide](http://bootstrap.themes.guide/).

::: example href=../ui/theme/ source="https://github.com/gramener/gramex/tree/master/gramex/apps/ui/theme/"
    Explore theme gallery

You can import them in your `style.scss`. For example:

```scss
// Include any one of these lines in your .scss file
@import "theme/bootstrap5";         // Bootstrap 5 default theme
@import "theme/default";            // Bootstrap 4 default theme
@import "theme/bootswatch/slate";   // Bootstrap 4 theme
@import "theme/themes-guide/fesca"; // Bootstrap 4 theme
```

Or you can link to these directly. For example:

```html
<!-- Include any one of these links in your .scss file -->
<link rel="stylesheet" href="ui/theme/bootstrap5.scss">
<link rel="stylesheet" href="ui/theme/default.scss">
<link rel="stylesheet" href="ui/theme/bootswatch/slate.scss">
<link rel="stylesheet" href="ui/theme/themes-guide/fresca.scss">
```

### Custom themes

You can customize themes by adding
[Bootstrap variables](https://getbootstrap.com/docs/4.5/getting-started/theming/#variable-defaults)
to the URL. For example:

```html
<link rel="stylesheet" href="ui/theme/default.scss?primary=maroon&body-bg=lavender">
```

::: example href="../ui/theme/default?primary=maroon&amp;body-bg=lavender" source="../ui/theme/default.scss?primary=maroon&amp;body-bg=lavender"
    Try the custom theme

You can also customize themes by adding these to your `style.scss` file. For example:

```scss
$primary: maroon;
$body-bg: lavender;
@import "theme/default.scss";
```

[See the full list of Bootstrap variables](https://github.com/twbs/bootstrap/blob/main/scss/_variables.scss).

::: example href="https://bootstrap.build/app" target="_blank"
    Customize with a theme builder



### Theme colors

<style>
.btn-accent1 { background-color: coral; }
.btn-accent2 { background-color: #3CB371; }
</style>

You can add custom colors to the `$theme-colors` map in your `style.scss` file. For example:

```scss
$theme-colors: (
    "accent1": coral,
    "accent2": #3CB371
)
@import "theme/default.scss"
```

You can now use `.bg-accent1`, `.text-accent1`, `.btn-accent1`, `.border-accent1`, etc., and
similarly for `accent2`.

<button class="btn btn-accent1"><code class="text-white">.btn-accent1</code></button>
<button class="btn btn-accent2"><code class="text-white">.btn-accent2</code></button>



## Libraries

**UI Libraries are deprecated** since [Gramex 1.84](../release/1.84/) and will be removed in [Gramex 1.86](../release/1.86/).

The UI component library ships with commonly used [UI libraries](https://www.npmjs.com/).

::: example href="libraries" source="../ui/"
    Explore the UI libraries

## Typography

### Text sizes

Bootstrap provides the following *absolute* font-size classes:

- `.display-1`: 6rem
- `.display-2`: 5.5rem
- `.display-3`: 4.5rem
- `.display-4`: 3.5rem
- `.h1`: 2.5rem
- `.h2`: 2rem
- `.h3`: 1.75rem
- `.h4`: 1.5rem
- `.h5`: 1.25rem
- `.h6`: 1rem

Gramex UI components adds the following *relative* font-size classes that make a font smaller:

- `.sm1`: 80% smaller (same as `.small`)
- `.sm2`: 66.67% smaller
- `.sm3`: 50% smaller
- `.sm4`: 33.33% smaller
- `.sm5`: 25% smaller
- `.sm6`: 16.67% smaller

### Text alignment

::: div class="row" style="height:120px"
    ::: div class="col-md-6 bg-light text-middle"
        `.text-middle` aligns text vertically to middle
    ::: div class="col-md-6 bg-primary text-light"
        Normal text is aligned to the top

### Letter spacing

<!-- See https://tailwindcss.com/docs/letter-spacing -->

- <span class="ls-1">`.ls-1` sets `letter-spacing: 0.05em`</span>
- <span class="ls-2">`.ls-2` sets `letter-spacing: 0.10em`</span>
- <span class="ls-3">`.ls-3` sets `letter-spacing: 0.20em`</span>
- <span class="ls-4">`.ls-4` sets `letter-spacing: 0.30em`</span>
- <span class="ls-n1">`.ls-n1` sets `letter-spacing: -0.025em`.</span>
- <span class="ls-n2">`.ls-n2` sets `letter-spacing: -0.05em`.</span>
- <span class="ls-n3">`.ls-n3` sets `letter-spacing: -0.10em`.</span>
- <span class="ls-n4">`.ls-n4` sets `letter-spacing: -0.20em`.</span>

### Line height

<!-- See https://tailwindcss.com/docs/line-height -->

- <span class="lh-1">`.lh-1` sets `line-height: 1`</span>
- <span class="lh-2">`.lh-2` sets `line-height: 1.1`</span>
- <span class="lh-3">`.lh-3` sets `line-height: 1.25`</span>
- <span class="lh-4">`.lh-4` sets `line-height: 2`</span>

### Text opacity

- <span class="opacity-90">`.opacity-90` sets `opacity: 90%`</span>
- <span class="opacity-80">`.opacity-80` sets `opacity: 80%`</span>
- <span class="opacity-70">`.opacity-70` sets `opacity: 70%`</span>
- <span class="opacity-60">`.opacity-60` sets `opacity: 60%`</span>
- <span class="opacity-50">`.opacity-50` sets `opacity: 50%`</span>
- <span class="opacity-40">`.opacity-40` sets `opacity: 40%`</span>
- <span class="opacity-30">`.opacity-30` sets `opacity: 30%`</span>
- <span class="opacity-20">`.opacity-20` sets `opacity: 20%`</span>
- <span class="opacity-10">`.opacity-10` sets `opacity: 10%`</span>


## Effects

### Borders

`.border-2` sets `border-width: 2px`.

::: div class="mb-3"
    <div class="compact border border-dark">Normal border</div>
    <div class="compact border border-dark border-2"><code>.border .border-2</code></div>

`.border-top`, `.border-right`, `.border-bottom` and `.border-left` set the respective `border-width` to `1px`.

::: div class="mb-3"
    <div class="compact border-dark border-top"><code>.border-top</code></div>
    <div class="compact border-dark border-right"><code>.border-right</code></div>
    <div class="compact border-dark border-bottom"><code>.border-bottom</code></div>
    <div class="compact border-dark border-left"><code>.border-left</code></div>

`.border-top-0`, `.border-right-0`, `.border-bottom-0` and `.border-left-0` set the respective `border-width` to `0px`.

::: div class="mb-3"
    <div class="compact border border-dark border-top-0"><code>.border-top-0</code></div>
    <div class="compact border border-dark border-right-0"><code>.border-right-0</code></div>
    <div class="compact border border-dark border-bottom-0"><code>.border-bottom-0</code></div>
    <div class="compact border border-dark border-left-0"><code>.border-left-0</code></div>


### Shadow

`.shadow` adds a shadow to a block element. For example:

<button type="button" class="btn btn-primary">Button without shadow</button>
<button type="button" class="btn btn-primary shadow">Button with shadow</button>


`.text-shadow` adds a text shadow to inline text. For example:

<div class="text-shadow h5">Line without shadow</div>
<div class="text-shadow h5">Line with text shadow</div>


### Backgrounds

<style>
  .compact { width: 150px; height: 30px; }
  .wide { width: 450px; height: 30px; }
  .huge { width: 600px; height: 120px; }
  .medium { width: 150px; height: 100px; }
  .compact, .wide, .huge, .medium { text-align: center; position: relative; display: inline-block; }
  .bg { background-image: url("bg-small.png"); border: 1px solid #ccc; }
  .bottom { position: absolute; bottom: 0; display: block; width: 100%; }
</style>

Take this sample background image:
<div class="bg wide"></div>

`.bg-no-repeat` sets `background-repeat: no-repeat`, which creates only one copy of the background image.
<div class="bg-no-repeat bg wide"></div>

`.bg-center` centers the background image.
<div class="bg-center bg wide"></div>

Background positioning utilities determine the overall positioning. `.bg-tl` stands for
`b`ack`g`round-`t`op-`l`eft. You can use `bg-`(`t`op/`c`enter/`b`ottom)`-`(`l`eft/`c`enter/`r`ight).
USe with `bg-no-repeat` as follows:

<div>
  <div class="bg-tl bg medium bg-no-repeat"><code class="bottom">.bg-tl</code></div>
  <div class="bg-tc bg medium bg-no-repeat"><code class="bottom">.bg-tc</code></div>
  <div class="bg-tr bg medium bg-no-repeat"><code class="bottom">.bg-tr</code></div>
</div>
<div>
  <div class="bg-cl bg medium bg-no-repeat"><code class="bottom">.bg-cl</code></div>
  <div class="bg-cc bg medium bg-no-repeat"><code class="bottom">.bg-cc</code></div>
  <div class="bg-cr bg medium bg-no-repeat"><code class="bottom">.bg-cr</code></div>
</div>
<div class="mb-3">
  <div class="bg-bl bg medium bg-no-repeat"><code>.bg-bl</code></div>
  <div class="bg-bc bg medium bg-no-repeat"><code>.bg-bc</code></div>
  <div class="bg-br bg medium bg-no-repeat"><code>.bg-br</code></div>
</div>

`.bg-space` sets `background-repeat: space`, which distributes space evenly between background image copies.
<div class="bg-space bg wide"></div>

`.bg-round` sets `background-repeat: round`, which ensures that the background image is not cut off (but may shrink).
<div class="bg-round bg wide"></div>

`.bg-cover` sets `background-size: cover`. The background image will completely fill the element.
<div class="bg-cover bg wide"></div>

`.bg-contain` sets `background-size: contain`. The background image will completely fit in the element.
<div class="bg-contain bg wide"></div>

`.bg-fixed` sets `background-size: fixed`. The background will scroll with the page.
<div class="bg-fixed bg wide"></div>

`.bg-parellax` sets `background-size: parellax`. The background will scroll with the page. This is
the same as `.bg-center` `.bg-no-repeat` `.bg-fixed` and `.bg-cover`.
<div class="bg-parellax bg huge" style="background-image: url(https://picsum.photos/id/10/1200)"></div>


### Gradient

`.gradient-*` classes darken colors in a specified direction.

`.gradient-tl` stands for `gradient`-`t`op-`l`eft.
You can use `gradient-`(`t`op/`c`enter/`b`ottom)`-`(`l`eft/`c`enter/`r`ight).
Here's an example combining the gradients with different `.bg-` classes:

<div>
  <div class="gradient-tl medium"><code class="text-white">.gradient-tl</code></div>
  <div class="gradient-tc bg-light medium"><code class="text-white">.gradient-tc</code></div>
  <div class="gradient-tr bg-danger medium"><code class="text-white">.gradient-tr</code></div>
</div>
<div>
  <div class="gradient-cl bg-success medium"><code class="text-white">.gradient-cl</code></div>
  <div class="gradient-cc bg-info medium"><code class="text-white">.gradient-cc</code></div>
  <div class="gradient-cr bg-warning medium"><code class="text-white">.gradient-cr</code></div>
</div>
<div class="mb-3">
  <div class="gradient-bl bg-dark medium"><code class="text-white">.gradient-bl</code></div>
  <div class="gradient-bc bg-secondary medium"><code class="text-white">.gradient-bc</code></div>
  <div class="gradient-br bg-primary medium"><code class="text-white">.gradient-br</code></div>
</div>

`.gradient-light` makes it a lightening gradient.
Here's an example combining the gradients with different `.bg-` classes:

<div>
  <div class="gradient-light gradient-tl medium"><code class="text-dark">.gradient-light .gradient-tl</code></div>
  <div class="gradient-light gradient-tc bg-light medium"><code class="text-dark">.gradient-light .gradient-tc</code></div>
  <div class="gradient-light gradient-tr bg-danger medium"><code class="text-dark">.gradient-light .gradient-tr</code></div>
</div>
<div>
  <div class="gradient-light gradient-cl bg-success medium"><code class="text-dark">.gradient-light .gradient-cl</code></div>
  <div class="gradient-light gradient-cc bg-info medium"><code class="text-dark">.gradient-light .gradient-cc</code></div>
  <div class="gradient-light gradient-cr bg-warning medium"><code class="text-dark">.gradient-light .gradient-cr</code></div>
</div>
<div class="mb-3">
  <div class="gradient-light gradient-bl bg-dark medium"><code class="text-dark">.gradient-light .gradient-bl</code></div>
  <div class="gradient-light gradient-bc bg-secondary medium"><code class="text-dark">.gradient-light .gradient-bc</code></div>
  <div class="gradient-light gradient-br bg-primary medium"><code class="text-dark">.gradient-light .gradient-br</code></div>
</div>

### Round corners

Add `class="round"` to add full rounded corners to any shape. For example:

[`.btn.btn-primary`](#na){: class="btn btn-primary"}
[`.round.btn.btn-primary`](#na){: class="btn btn-primary round"}

Add `class="border-radius-{size}` to control the size of the rounded corners.

[`.border-radius-xl`](#na){: class="btn btn-primary border-radius-xl my-3"}
[`.border-radius-lg`](#na){: class="btn btn-primary border-radius-lg my-3"}
[`.border-radius`](#na){: class="btn btn-primary border-radius my-3"}
[`.border-radius-sm`](#na){: class="btn btn-primary border-radius-sm my-3"}
[`.no-border-radius`](#na){: class="btn btn-primary no-border-radius my-3"}

### Ripple

`.ripple` adds a ripple effect to elements when clicked. **Click to test**:

<button type="button" class="btn btn-primary">Click button without ripple</button>
<button type="button" class="btn btn-primary ripple">Click button with ripple</button>

### Color states

These utility classes override the color of any element on `:hover`, `:focus` and `:active` --
typically buttons and links. The classes are defined for each theme color.

- `.hover-bg-{color}`, `.focus-bg-{color}` and `.active-bg-{color}` for background color.
- `.hover-fg-{color}`, `.focus-fg-{color}` and `.active-fg-{color}` for foreground color.

Hover color classes set the color when you hover over an element. **Hover to test**:

- [Hover on `class="hover-bg-primary hover-fg-light"`](#na){: class="hover-bg-primary hover-fg-light"}
- [Hover on `class="hover-bg-dark hover-fg-light"`](#na){: class="hover-bg-dark hover-fg-light"}
- [Hover on `class="hover-bg-light hover-fg-danger"`](#na){: class="hover-bg-light hover-fg-danger"}

Focus color classes set the color when you focus on an element. **Click to test**:

- [Click `class="focus-bg-primary focus-fg-light"`](#na){: class="focus-bg-primary focus-fg-light"}
- [Click `class="focus-bg-dark focus-fg-light"`](#na){: class="focus-bg-dark focus-fg-light"}
- [Click `class="focus-bg-light focus-fg-danger"`](#na){: class="focus-bg-light focus-fg-danger"}

Active color classes set the color when you're clicking on an element. **Click to test**:

- [Click `class="active-bg-primary active-fg-light"`](#na){: class="active-bg-primary active-fg-light"}
- [Click `class="active-bg-dark active-fg-light"`](#na){: class="active-bg-dark active-fg-light"}
- [Click `class="active-bg-light active-fg-danger"`](#na){: class="active-bg-light active-fg-danger"}

### Cursor styles

- `class="cursor-pointer"`{: class="cursor-pointer"} adds a `cursor: pointer` to any element. Use
   non-clickable element made clickable using JavaScript.
- [`class="cursor-default"`](#na){: class="cursor-default"} adds `cursor: default`.
- [`class="pointer-events-none"`](#na){: class="pointer-events-none"} sets `pointer-events: none`.
  This disables click and hover events. It's useful on SVG `text` labels to pass clicks to the
  shape behind it.


## Layouts

### Overlay

`.overlay-black` and `.overlay-white` overlays a dark or light layer on top of a relatively
positioned element.

<div class="bg-primary d-inline-block position-relative text-white huge">
  <div class="overlay-black pos-t py-1 text-light text-center">.overlay-black</div>
  <div class="overlay-white pos-b py-1 text-dark text-center">.overlay-white</div>
</div>


### Position

`.pos-*` classes set the absolute position of elements.

`.pos-tl` stands for `pos`ition: `t`op-`l`eft. It sets `top: 0` and `left: 0`.
You can use `pos-`(`t`op/`c`enter/`b`ottom)`-`(`l`eft/`c`enter/`r`ight).
Here's an example of all `.pos-` classes inside a `.position-relative` block:

<div class="bg-primary d-inline-block position-relative text-white">
  <svg width="320" height="160"></svg>
  <div class="pos-tl overlay-black p-2 text-monospace">.pos-tl</div>
  <div class="pos-tc overlay-black p-2 text-monospace">.pos-tc</div>
  <div class="pos-tr overlay-black p-2 text-monospace">.pos-tr</div>
  <div class="pos-cl overlay-black p-2 text-monospace">.pos-cl</div>
  <div class="pos-cc overlay-black p-2 text-monospace">.pos-cc</div>
  <div class="pos-cr overlay-black p-2 text-monospace">.pos-cr</div>
  <div class="pos-bl overlay-black p-2 text-monospace">.pos-bl</div>
  <div class="pos-bc overlay-black p-2 text-monospace">.pos-bc</div>
  <div class="pos-br overlay-black p-2 text-monospace">.pos-br</div>
</div>


<div class="bg-primary d-inline-block position-relative text-white">
  <svg width="320" height="160"></svg>
  <div class="pos-c overlay-black p-2 text-monospace text-center text-middle">.pos-c</div>
  <div class="pos-t overlay-black p-2 text-monospace text-center text-middle">.pos-t</div>
  <div class="pos-r overlay-black p-2 text-monospace text-center text-middle">.pos-r</div>
  <div class="pos-b overlay-black p-2 text-monospace text-center text-middle">.pos-b</div>
  <div class="pos-l overlay-black p-2 text-monospace text-center text-middle">.pos-l</div>
</div>

### Height

`.h-full` sets  `min-height: 100vh`. To ensure that a page background occupies full height of the screen, use:

```html
<body class="h-full">
```

### Z-Index

`.z-9` sets `z-index: 9000`. Use it to place an element on top of others


## Components

### Arrow

`.arrow-<theme-color>` creates an arrow shape. Add `.h1`, ... `.h6` or `.display-1` .. `.display-4`
to control the height.

<div class="arrow-primary h5 text-monospace">.arrow-primary.h5</div>
<div class="arrow-danger h6 text-monospace">.arrow-danger.h6</div>

Add `.arrow-tail` to add a tail.

<div class="arrow-tail arrow-primary h5 text-monospace">.arrow-primary.h5</div>
<div class="arrow-tail arrow-danger h6 text-monospace">.arrow-danger.h6</div>

### Divider

`.divider` adds a divider. For example, `<div class="divider"></div>` creates this divider:

<div class="divider"></div>

Add `.border-primary`, etc to change the divider color. For example:

```html
<div class="divider border-primary"></div>
```

creates this divider:

<div class="divider border-primary"></div>


You can add any text inside the divider. For example:

```html
<div class="divider">Text</div>
<div class="divider border-dark"><i class="fab fa-2x fa-twitter mr-2"></i> Icons</div>
<div class="divider border-primary"><div class="btn btn-primary round">Buttons</div></div>
```

<div class="divider">Text</div>
<div class="divider border-dark"><i class="fab fa-2x fa-twitter mr-2"></i> Icons</div>
<div class="divider border-primary"><div class="btn btn-primary round">Buttons</div></div>


### Tail

`.tail-*` adds a tail to a container. `.tail-tl` adds a tail on the  `t`op side `l`eft position.
You can use `tail-{side}-{position}`. For example:

<div class="mb-4">
  <div class="d-inline-block bg-primary tail-lb p-3">.tail-lb.bg-primary</div>
  <div class="d-inline-block bg-success tail-br p-3">.tail-br.bg-success</div>
  <div class="d-inline-block bg-warning tail-tr p-3">.tail-tr.bg-warning</div>
</div>

You can combine tails with `.border`, `.round`, `.shadow` and other styles. For example:

<div class="d-inline-block border border-primary round shadow tail-tc p-3">.tail-tc.border.border-primary.round.shadow</div>



## Deprecated

The following classes are deprecated:

- `.underline`: use `.border-bottom`
- `.slider`: use `.custom-range`
- `.switch`: use `.custom-switch`
- `.border-top-1`, `.border-right-1`, `.border-bottom-1` and `.border-left-1`. These are rarely used.
