---
title: DriveHandler uploads files
prefix: DriveHandler
icon: drivehandler.png
desc: DriveHandler lets you upload files and manage them
by: TeamGramener
type: microservice
...

[TOC]

**v1.59**. [DriveHandler](.) lets you upload files and manage them with a [FormHandler](../formhandler/)-like interface. It's better than [UploadHandler](../uploadhandler/). Here's how to create a DriveHandler:

```yaml
url:
  drivedemo:
    pattern: /$YAMLURL/drivedemo
    handler: DriveHandler
    kwargs:
      path: $GRAMEXDATA/apps/guide/drive-data/  # ... save files here
      xsrf_cookies: false     # TODO: Remove this in production.
```

Now, to upload a file into `/drive`, create this `form.html`.

```html
  <!-- POST files into /drive -->
  <form action="drivedemo" method="POST" enctype="multipart/form-data">
    <!-- There must be a file input named "file". Multiple inputs are allowed -->
    <input name="file" type="file" multiple>
    <button type="submit">Submit</button>
  </form>
```

Visit `/form.html` and upload a file. This saves the uploaded files in the `path:` you specified.

::: example href=form.html source=https://github.com/gramener/gramex-guide/blob/master/drivehandler/form.html
    Try the uploader example

## DriveHandler XSRF

Note: In the example above, we used `xsrf_cookies: false` to disable [XSRF](../filehandler/#xsrf).
That's fine for a demo. But in production, you'll want to enable it.

If you're using AJAX or `fetch()` to upload files, DriveHandler works with (and without) XSRF disabled.

If you're using forms, here's an example `gramex.yaml`:

```yaml
url:
  drivehandler:
    pattern: /$YAMLURL/drive
    handler: DriveHandler
    kwargs:
      path: $GRAMEXDATA/apps/guide/drive-data/  # ... save files here
      # NOTE: Do not disable xsrf_cookies

  drivehandler-upload:
    pattern: /$YAMLURL/upload
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/upload.html
      template: true                # Required to create the XSRF token.
```

In `upload.html`, add this HTML:

```html
  <!-- POST files into /drive -->
  <form action="drive2" method="POST" enctype="multipart/form-data">
    <!-- There must be a file input named "file". Multiple inputs are allowed -->
    <input name="file" type="file" multiple>
    <button type="submit">Submit</button>
    <!-- To avoid XSRF, add an _xsrf key. This REQUIRES FileHandler templates -->
    <input type="hidden" name="_xsrf" value="{{ handler.xsrf_token }}">
  </form>
```

Visit `/upload` (**not** `upload.html`) and upload a file. This saves the uploaded files in the `path:` you specified.

::: example href=upload source=https://github.com/gramener/gramex-guide/blob/master/drivehandler/upload.html
    Try the uploader with XSRF


## File Manager

**v1.60**. File Manager is an app designed to work with DriveHandler and simplifies its usage.

::: example href=filemanager/ source=https://github.com/gramener/gramex-guide/blob/master/drivehandler/gramex.yaml
    Try the File Manager

FileManager can be imported in a Gramex app as follows:

```yaml
import:
  filemanager:
    path: $GRAMEXAPPS/filemanager/gramex.yaml
    YAMLURL: $YAMLURL/filemanager/
```

This mounts the File Manager page at `/filemanager/`. For each `DriveHandler` endpoint configured in your Gramex app, the page shows a table of files in that drive. This table can be used to:

- **Upload new files** - Click the "Upload" button, or drop files anywhere on the table.
- **Download files** - Click any file under the "File" column to download it.
- **Delete existing files** - Click the cross for a file under the "Delete" column.
- **Rename files** - Click the "Edit" button, make changes to filenames, and click "Save".

File Manager can be configured by using `FILEMANAGER_KWARGS`:

```yaml
import:
  filemanager:
    path: $GRAMEXAPPS/filemanager/gramex.yaml
    YAMLURL: $YAMLURL/filemanager/
    FILEMANAGER_KWARGS:
      # Show these drives as tabs. These are YAML keys under the url: section
      drives: ['drive1', 'drive2']
      title: "MyAwesomeFileManager"             # Title of the File Manager page
      logo: $YAMLPATH/data/assets/gramener.png  # Logo for the File Manager page
      theme: '?font-family-base=roboto'         # UI component theme query?
```

Once you import the File Manager, the File Manager component can be embedded in any `<div>` in any page:

```html
<link rel="stylesheet" href="ui/dropzone/dist/min/dropzone.min.css">
<script src="ui/dropzone/dist/min/dropzone.min.js"></script>
<script src="ui/moment/min/moment-with-locales.min.js"></script>
<script src="filemanager/filemanager.js"></script>

<div class="filemanager" data-src="drive"></div>
<script>
  Dropzone.autodiscover = false
  var options = {}
  $('.filemanager').filemanager(options)
</script>
```

`$().filemanager()` accepts the same parameters as [FormHandler](../g1/formhandler). For example:

```js
var options = {
  pageSize: 10,           // Show 10 files at most
  columns: [              // Choose the columns, order of display and title
    { name: "file", title: 'File name' },
    { name: "size" },
    { name: 'date' },
    { name: 'mime', title: 'Type' },
    { name: 'delete' },
  ]
}
```

## AJAX uploads

[DropZone](https://www.dropzonejs.com/) provides drag-and-drop AJAX uploads with
progress bars. For example:

```html
<link rel="stylesheet" href="ui/dropzone/dist/min/dropzone.min.css">
<form action="upload" class="dropzone"></form>
<script src="ui/dropzone/dist/min/dropzone.min.js"></script>
```

creates this box:

<link rel="stylesheet" href="../ui/dropzone/dist/min/dropzone.min.css">
<form action="drive" class="dropzone"></form>
<script src="../ui/dropzone/dist/min/dropzone.min.js"></script>

## List files

You can visit the [drive URL](drive?_format=html) to list the uploaded files. It's a [FormHandler](../formhandler/) endpoint. It shows these fields:

- `id`: a unique ID for the file
- `file`: name of the uploaded file (e.g. `data file.xlsx`)
- `path`: actual filename on disk (e.g. `data-file.xlsx`). This may be different from `file`
- `ext`: extension of the uploaded file (e.g. `.xlsx`)
- `size`: file size in bytes (e.g. 1000)
- `mime`: guessed MIME type of the uploaded file (e.g. `text/plain`)
- `date`: timestamp (in seconds since epoch) when uploaded (e.g. 1589155200000). This is compatible with JavaScript's `new Date()`

You can use [FormHandler filters](../formhandler/#formhandler-filters) to list specific files. For example:

- [drive?ext=.xlsx](drive?ext=.xlsx&_format=html) lists all XLSX files
- [drive?size<~=1000](drive?size<~=1000&_format=html) lists all files under 1000 bytes
- [drive?date>~1589155200000](drive?date>~1589155200000&_format=html) lists all files after 11 May 2020

This data is stored in a SQLite DB called `.meta.db` in your drive path. You can retrieve it in Python via:

```python
import gramex.data
meta = gramex.data.filter('sqlite:///path/to/.meta.db', table='drive')
```

## Tags

You can add any custom fields to a file upload -- e.g. if users want to add a category, rating, or description to a file.

```yaml
url:
  drivehandler:
    pattern: /$YAMLURL/drive
    handler: DriveHandler
    kwargs:
      path: $GRAMEXDATA/apps/guide/drive-data/  # ... save files here
      tags: [category, rating, description]     # Add 3 tags
```

You can add an `<input name="description">` in your form to allow users to upload a description. [See an example](https://github.com/gramener/gramex-guide/blob/master/drivehandler/form.html).

You can use [FormHandler filters](../formhandler/#formhandler-filters) to filter by tags. For example:

- [drive?desc~=a](drive?desc~=a&_format=html) lists all files whose `desc` tag contains "a"

## User fields

You can capture the user ID and other user attributes in the form.

```yaml
url:
  drivehandler:
    pattern: /$YAMLURL/drive
    handler: DriveHandler
    kwargs:
      path: $GRAMEXDATA/apps/guide/drive-data/  # ... save files here
      user_fields: [id, role, hd]               # Capture user.id, user.role, user.hd
```

When a user uploads a file, their `id`, `role`, and `hd` attributes will be captured as `user_id`, `user_role` and `user_hd` fields. This allows you to track who uploaded files.

Only the `id` attribute is guaranteed to exist. Different auth handlers have their own attributes. For example, GoogleAuth uses `hd` for the domain. See [User Attributes](../auth/#user-attributes).

You can use [FormHandler filters](../formhandler/#formhandler-filters) to filter by user attributes. For example:

- [drive?user_id~=a](drive?user_id~=a&_format=html) lists all files whose `user_id` contains "a"


## Delete files

To delete a file, submit a DELETE HTTP request with an `id:` key. For example:

```js
$.ajax('delete', {
  type: 'DELETE',
  data: {id: existing_file_id}
})
```

This is exactly how [FormHandler DELETE](../formhandler/#formhandler-delete) works.

## Update files

To rename a file or update any other attributes, submit a PUT HTTP request with an `id:` key. For example:

```js
$.ajax('drive', {
  type: 'DELETE',
  data: {
    id: existing_file_id,
    file: 'new-file-name.ext',
    ext: '.ext',
    desc: 'new desc'
  }
})
```

Note: You cannot change a file's `id`, `path`, `size` and `date`, nor the `user_*` attributes. This is mainly to rename the file and update tags.

You can **overwrite a file** with a PUT request. For example:

```js
var formData = new FormData()
formData.append('id', existing_file_id)
formData.append('file', document.querySelector('input#file').files[0], 'filename.ext')
$.ajax('drive', {
    type: 'PUT',
    data: formData,
    contentType: false,
    processData: false,
})
```

## Process files

`DriveHandler` accepts all the [FormHandler transform functions](../formhandler/#formhandler-transforms). To modify a file when uploading, use the `prepare:` function:

```yaml
url:
  drivehandler:
    pattern: /$YAMLURL/drive
    handler: DriveHandler
    kwargs:
      path: $GRAMEXDATA/apps/guide/drive-data/  # ... save files here
      user_fields: [id, role, hd]               # Capture user.id, user.role, user.hd
      prepare: mymodule.prepare(args, handler)
```

This calls `mymodule.prepare(args, handler)` for every request. `args` is the same as [handler.args](../handlers/#basehandler-attributes). For example, this function
will add a line at the end of each .txt file:

```python
def func(meta, handler):
    if handler.request.method == 'POST':
        # Loop through every <input name="file"> file input
        for upload in args.files.get('file', []):
            if upload['filename'].endswith('.txt'):
                upload['body'] += b'\n\nThis is a new line after each text file'
```


## Expose datasets

To expose uploaded datasets as a FormHandler API, you can add a FormHandler that points to your drive path. For example:

```yaml
url:
  datasets:
    pattern: /$YAMLURL/data/(.*)
    handler: FormHandler
    kwargs:
      url: $GRAMEXDATA/apps/guide/drive-data/{_0}
```

If you uploaded any CSV/XLSX into the DriveHandler above, see them at `data/your-file.csv`.


[drivehandler]: https://gramener.com/gramex/guide/api/handlers/#gramex.handlers.DriveHandler
