---
title: CaptureHandler takes screenshots
prefix: CaptureHandler
icon: capturehandler.png
desc: CaptureHandler takes screenshots of pages using Chrome
by: TeamGramener
type: microservice
...

[CaptureHandler][capturehandler] takes screenshots of pages using either
[Chrome][puppeteer] or
[PhantomJS](http://phantomjs.org/).

[puppeteer]: https://github.com/GoogleChrome/puppeteer/

[TOC]

## Chrome

[Video](https://youtu.be/v081GH3Z_LU){.youtube}

**Chrome is the recommended engine from v1.23**. Add this to `gramex.yaml`:

```yaml
url:
  capture:
    pattern: /$YAMLURL/capture
    handler: CaptureHandler
    kwargs:
      engine: chrome
      pattern: ^http
```

When Gramex runs, it starts `node chromecapture.js --port 9900` running a
node.js based web application (chromecapture.js) at port 9900.

The `pattern: ^http` only allows URLs that start with `http`, disallowing `file://` and other such URLs. (Relative URLs like `../` are converted to absolute HTTP URLs before checking the pattern, so they will work fine.)

To only allow specific domains, e.g. `gramener.com` and `gramener.co`, use:

```yaml
    pattern: ^https?://(www\.)?(gramener\.com|gramener\.co)/
```

To change the port, use:

```yaml
    pattern: /$YAMLURL/capture
    handler: CaptureHandler
    kwargs:
      engine: chrome
      pattern: ^http
      port: 9901              # Use a different port
```

To use an existing instance of chromecapture.js running on a different port, use:

```yaml
    pattern: /$YAMLURL/capture
    handler: CaptureHandler
    kwargs:
      engine: chrome
      pattern: ^http
      url: http://server:port/capture/    # Use chromecapture.js from this URL
```

The default viewport size is 1200x768. To set a custom viewport for images or
PPTX, use `?width=` and `?height=`. For example, `?width=1920&height=1080`
changes the viewport to 1920x1080.

By default, requests timeout within 10 seconds. To change this, use `timeout:`.

```yaml
    pattern: /$YAMLURL/capture
    handler: CaptureHandler
    kwargs:
      pattern: ^http
      timeout: 20     # Wait for max 20 seconds for server to respond
```

The default chromecapture.js is at `$GRAMEXPATH/apps/capture/chromecapture.js`.
To use your own chromecapture.js, run it using `cmd:` on any port and point
`url:` to that port:

```yaml
    pattern: /$YAMLURL/capture
    handler: CaptureHandler
    kwargs:
      engine: chrome
      cmd: node /path/to/chromecapture.js --port=9902
      url: http://localhost:9902/
```

To use a HTTP proxy, set the `ALL_PROXY` environment variable. If your proxy IP
is `10.20.30.40` on port `8000`, then set `ALL_PROXY` to `10.20.30.40:8000`. See
[how to set environment variables](https://superuser.com/a/284351). (You can
also use the `HTTPS_PROXY` or `HTTP_PROXY` environment variables. These
supercede `ALL_PROXY`.)


**NOTE**: If you're running CaptureHandler with Chrome on a Docker instance (or any other headless
Linux), you may get an `error while loading shared libraries`. This is because Chrome needs
[additional dependencies](https://github.com/puppeteer/puppeteer/issues/3443).

On Ubuntu 20.04, you can run this command to fix it:

```bash
sudo apt-get -y install xvfb libnss3 libatk1.0-0 libatk-bridge2.0-0 libxcomposite1 libcups2 libxrandr2 libpangocairo-1.0-0 libgtk-3-0
```

For other systems, check this [issue](https://github.com/puppeteer/puppeteer/issues/3443).


## PhantomJS

[PhantomJS](http://phantomjs.org/) is **deprecated** but is the default for
backward compatibility. To use it, install [PhantomJS](http://phantomjs.org/) and
it to your PATH. Then add this to `gramex.yaml`:

```yaml
url:
  capture:
    engine: phantomjs             # Optional.
    pattern: /$YAMLURL/capture
    handler: CaptureHandler
```

## Screenshot service

[Video](https://youtu.be/VsmmH6oPy_k){.youtube}

You can add a link from any page to the `capture` page to take a screenshot.

```html
<a href="capture?ext=pdf">PDF screenshot</a>
<a href="capture?ext=png">PNG screenshot</a>
<a href="capture?ext=jpg">JPG screenshot</a>
<a href="capture?ext=pptx">PPTX screenshot</a>
```

Try it here:

- [PDF screenshot](capture?ext=pdf&url=.)
- [PNG screenshot](capture?ext=png&url=.)
- [JPEG screenshot](capture?ext=jpg&url=.)
- [PPTX screenshot](capture?ext=pptx&url=.)

It accepts the following arguments:

- `?url=`: URL to take a screenshot of. This defaults to `Referer` header. So if
  you link to a `capture` page, the source page is generally used.
  <br>**Example**: [?url=https://example.org/](capture?url=https://example.org/)
- `?file=`: screenshot file name. Default: `screenshot`.
  <br>**Example**: [?file=newfile](capture?file=newfile&url=.)
- `?ext=`: format of output. Can be pdf, png, jpg or pptx. Default: `pdf`.
  <br>**Example**: [?ext=png](capture?ext=png&url=.). (`ext=pptx` available only in `engine: chrome` from **v1.23.1**)
- `?domain=`: set cookies on specified domain. Use this if sending CORS (cross-origin requests) and CaptureHandler must [set cookie domains](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#domaindomain-value).
  <br>**Example**: [?domain=.example.org](capture?domain=.example.org&url=.) passes cookies to *.example.org, over and above the `url`
- `?delay=`: wait for before taking a screenshot.
  - If this is a number, waits for this many milliseconds.
    <br>**Example**: [?delay=1000](capture?url=timer.html&delay=1000)
    captures this [timer page](timer.html) with a ~1000 ms delay
  - If `?delay=renderComplete`, waits until the JavaScript variable
    `window.renderComplete` is set to true - or
    [30 seconds](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagewaitforfunctionpagefunction-options-args).
  - If the delay is more than the `timeout:` in the `kwargs:` section, the page
    will time out.
- For PDF:
  - `?format=`: A3, A4, A5, Legal, Letter or Tabloid. Default: A4.
    <br>**Example**: [?format=Tabloid](capture?format=Tabloid&url=.)
  - `?orientation=`: portrait or landscape. Default: portrait.
    <br>**Example**: [?orientation=landscape](capture?orientation=landscape&url=.)
  - `media=`: `print` or `screen`. Default: `screen`. (Only in `engine: chrome`)
    <br>**Example**: [?media=print](capture?media=print&url=.)
  - `header=`: a pipe-separated string that sets the page header.
    You can use `$pageNumber`, `$totalPages`, `$date`, `$title`, `$url` as variables.
    <br>**Example**: [?header=Gramener](capture?header=Gramener&url=.): Left header "Gramener"
    <br>**Example**: [?header=|$title|](capture?header=|$title|&url=.): Center header with page title
    <br>**Example**: [?header=|$pageNumber](capture?header=|$pageNumber&url=.): Right header with page number
    <br>**Example**: [?header=©|Gramener|$pageNumber/$totalPages](capture?header=©|Gramener|$pageNumber/$totalPages&url=.): Left, middle right headers.
  - `footer=`: similar to `header`
  - `headerTemplate=`: HTML template to add a custom header.
    Template cannot load external sources or run javascript, but can use inline css styles.
    [See docs](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions).
    Ensure that enough margin is provided for the header.
    <br>**Example**: [`?headerTemplate=<div style="border-bottom:1px solid black;display:flex;justify-content:space-between;width:100%"><span class="url"></span><span class="date"></span></div>`](capture?url=.&headerTemplate=<div style="border-bottom:1px solid black%3Bdisplay:flex%3Bjustify-content:space-between%3Bwidth:100%25"><span class="url"></span><span class="date"></span></div>)
  - `footerTemplate=`: similar to `headerTemplate`
  - `margins=`: comma-separated list of margins specifying top, right, bottom, left margins respectively.
    default margin is `1cm,1cm,1cm,1cm`.
    <br>**Example** [?margins=2cm,,2cm,](capture?margins=2cm,,2cm,&url=.) sets top and bottom margin to 2cm
- For images (PNG/JPG):
  - `?width=`: optional viewport width in pixels. Default: 1200
    <br>**Example**: [?width=600](capture?width=600&ext=png&url=.)
  - `?height=`: optional viewport height in pixels. Default: auto (full page)
    <br>**Example**: [?height=600](capture?height=600&ext=png&url=.)
  - `?scale=`: zooms the screen by a factor. scale=2 returns an image twice as large and sharp as scale=1. Default: 1.
    <br>**Example**: [?scale=0.2](capture?scale=0.2&ext=png&url=.) compared with
    [?scale=1](capture?scale=1&ext=png&url=.)
  - `?selector=`: Restrict screenshot to (optional) CSS selector in URL. Captures the entire element, even if it exceeds the viewport
    <br>**Example**: [?selector=.content](capture?selector=.content&ext=png&url=.) excludes the sidebar.
  - `?emulate=`: emulate full page on a device. Ignores `?width=`, `?height=` and `?scale=`. (Only in `engine: chrome` from **v1.56.0**)
    <br>**Example**: [?emulate=iPhone 6](capture?emulate=iPhone 6&ext=png&url=.).
    Device names can be [iPhone 8, Nexus 10, Galaxy S5, etc][mobiledevices].
- For PPTX (Only in `engine: chrome` from **v1.23.1**):
  - `?layout=`: A3, A4, Letter, 16x9, 16x10, 4x3. Default: `4x3`
    <br>**Example**: [?layout=16x9](capture?layout=16x9&ext=pptx&width=1200&height=600&url=.)
  - `?dpi=`: optional image resolution (dots per inch). Default: 96
    <br>**Example**: [?dpi=192](capture?dpi=192&ext=pptx&width=1200&height=900&url=.)
  - `?width=`: optional viewport width in pixels. (Default: 1200px)
    <br>**Example**: [?width=600&height=400](capture?width=600&height=400&ext=pptx&url=.)
  - `?height=`: optional height to clip output to. Leave it blank for full page height
    <br>**Example**: [?width=1200&height=900](capture?width=1200&height=900&ext=pptx&url=.)
  - `?selector=`: CSS selector to take a screenshot of
    <br>**Example**: [?selector=.codehilite](capture?selector=.codehilite&ext=pptx&url=.)
  - `?title=`: optional slide title
    <br>**Example**: [?title=First+example&selector=.codehilite](capture?title=First+example&selector=.codehilite&ext=pptx&url=.)
  - `?title_size=`: optional title font size in points. Defaults to 18pt
    <br>**Example**: [?title=First+example&title_size=24&selector=.codehilite](capture?title=First+example&title_size=24&selector=.codehilite&ext=pptx&url=.)
  - `?x=`: optional x-position (left margin) in px. Centers by default
    <br>**Example**: [?x=10&selector=.codehilite](capture?x=10&selector=.codehilite&ext=pptx&url=.)
  - `?y=`: optional y-position (leftop margin) in px. Centers by default
    <br>**Example**: [?y=200&selector=.codehilite](capture?y=200&selector=.codehilite&ext=pptx&url=.)
  - For multiple slides, repeat `?selector=`, optionally with `?title=`, `?title_size=`, `?x=`, `?y=`, `?dpi=`.
    <br>**Example**: [?selector=.toc&title=TOC&selector=.codehilite&title=Example](capture?selector=.toc&title=TOC&selector=.codehilite&title=Example&ext=pptx&url=.)
- `?debug=`: displays request / response log requests on the console.
  - `?debug=1` logs all responses and HTTP codes. It also logs browser
    console.log messages on the Gramex console
  - `?debug=2` additionally logs all requests

If the response HTTP status code is 200, the response is the screenshot.
If the status code is 4xx or 5xx, the response text has the error message.

**Authentication is implicit**. The cookies passed to `capture` are passed to the
`?url=` parameter. This is exactly as-if the user clicking the capture link were
visiting the target page.

To try this, [log in](../auth/simple?next=../capturehandler/) and then
[take a screenshot](capture?ext=pdf&url=.). The screenshot will show the same
authentication information as you see below.

<iframe class="w-100" frameborder="0" src="../auth/session"></iframe>

You can override the user by explicitly passing a cookie string using `?cookie=`.

**All HTTP headers are passed through** by default. CaptureHandler sends them to
Chrome (not PhantomJS), which passes it on to the target URL.

If `capture.js` was not started, or it terminated, you can restart it by adding
`?start` to the URL. It is safe to add `?start` even if the server is running. It
restarts `capture.js` only if required.

## Encode URLs

When constructing the `?url=`, `?selector=`, `?title=` or any other parameter,
ensure that the URL is encoded. So a selector `#item` does not become
`?id=#item` -- which makes it a URL hash -- and instead becomes `?id=%23item`.

Use [`urlencode`](https://docs.python.org/3/library/urllib.parse.html#urllib.parse.urlencode) to
encode URLs in [templates](../filehandler/#templates) or in Python:

```python
from urllib.parse import urlencode

query = urlencode({'url': ..., 'selector': [..., ...]}, doseq=True)
```

Use [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams)
to encode URLs in JavaScript:

```js
const query = (new URLSearchParams({url: '...', selector: '...'})).toString()
const query = (new URLSearchParams(['url', '...'], ['selector', '...'], ['selector', '...']])).toString()

// Set a link HREF based on the query
document.querySelector('a.capture').setAttribute('href', `capture?${query}`)
// Or add an event listener based on the query
document.querySelector('button.capture').on('click', function() {
    location.href = `capture?${query}`
})

```

## Screenshot library

[Video](https://youtu.be/Q7yowSGOsdA){.youtube}

You can take screenshots from any Python program, using Gramex as a library.

```python
from gramex.handlers import Capture         # Import the capture library
capture = Capture(engine='chrome')          # Run chromecapture.js at port 9900

url = 'https://gramener.com/'               # Page to take a screenshot of
with open('screenshot.pdf', 'wb') as f:     # Save screenshot as PDF
    f.write(capture.pdf(url, orientation='landscape'))
with open('screenshot.png', 'wb') as f:     # Save screenshot as PNG
    f.write(capture.png(url, width=1200, height=600, scale=0.8))
```

The [Capture](capture?url=.) class has convenience methods called `.pdf()`, `.png()`,
`.jpg()` that accept the same parameters as the [handler](#screenshot-service).


## Client-side capture

CaptureHandler reloads a page to take a screenshot. This can be slow. To avoid this, you can:

- Cache page results for longer
- OR: use client-side capturing using [html2canvas](https://github.com/niklasvh/html2canvas) and downloading via [FileSaver.js](https://www.npmjs.com/package/file-saver)

Add the libraries from the [UI component library](../uicomponents/):

```html
<script src="ui/html2canvas/dist/html2canvas.min.js"></script>
<script src="ui/file-saver/dist/FileSaver.min.js"></script>
```

Trigger the download as follows:

```js
html2canvas(document.querySelector('.chart'))     // Pick the element to download
  .then(canvas => {
    canvas.toBlob(blob => {
      saveAs(blob, 'chart.png')                   // Pick your filename
    })
  })
```

**WARNING**: This requires inline styles. Styles from classes (e.g. Bootstrap's `border`) are not
applied. Add styles inline, via `style="..."`.

::: example href=html2canvas.html source=https://github.com/gramener/gramex-guide/blob/tree/capturehandler/html2canvas.html
    Client-side capture example

[capturehandler]: https://gramener.com/gramex/guide/api/handlers/#gramex.handlers.CaptureHandler
[capture]: https://gramener.com/gramex/guide/api/handlers/#gramex.handlers.Capture
[mobiledevices]: https://github.com/GoogleChrome/puppeteer/blob/v1.17.0/lib/DeviceDescriptors.js
