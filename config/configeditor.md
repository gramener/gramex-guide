# Config Viewer (removed)

**This feature was removed in Gramex 1.71.**

To use it, add this to your gramex.yaml:

```yaml
import:
  configviewer:
    path: $GRAMEXAPPS/configeditor/gramex.yaml
    YAMLURL: /$YAMLURL/configview/
```

Now `configview/ has a configuration viewer.

To embed the viewer in a page, include this in your HTML:

```html
<link
  rel="stylesheet"
  href="configview/node_modules/jsoneditor/dist/jsoneditor.min.css"
/>
<script src="configview/ui/jquery/dist/jquery.min.js"></script>
<script src="configview/node_modules/jsoneditor/dist/jsoneditor.min.js"></script>

<script
  src="configview/app.js"
  data-id="myeditor"
  data-url="configview/config/"
  data-style="height:600px;"
></script>
```

This script adds JSON editor UI from `configview/config/` URL to `<div id="myeditor"></div>`.
If `data-id` is missing, `editor` ID is created. Use `data-style` to set in-line styles.

<link rel="stylesheet" href="configview/node_modules/jsoneditor/dist/jsoneditor.min.css">
<script src="configview/ui/jquery/dist/jquery.min.js"></script>
<script src="configview/node_modules/jsoneditor/dist/jsoneditor.min.js"></script>
<script src="configview/app.js"
    data-id="myeditor"
    data-url="configview/config/"
    data-style="height:600px;"></script>

To `get` the modified configuration from UI.

```javascript
var editor = document.getElementById("myeditor").editor;
var conf = editor.get();
```
