---
title: Admin page
prefix: Admin
icon: admin.png
desc: Add an admin page to your project
by: TeamGramener
type: app
...

[TOC]

## Admin page

From v1.42, Gramex ships with an admin page. To include it in your page, use:

```yaml
import:
  admin/admin:
    path: $GRAMEXAPPS/admin2/gramex.yaml    # Note the "admin2" instead of "admin"
    YAMLURL: /$YAMLURL/admin/               # URL to show the admin page at
```


::: example href=admin/ source=https://github.com/gramener/gramex-guide/blob/master/admin/gramex.yaml
    Admin page example

You can configure the admin page as follows:

```yaml
import:
  admin/admin-kwargs:
    path: $GRAMEXAPPS/admin2/gramex.yaml
    YAMLURL: /$YAMLURL/admin-kwargs/        # URL to show the admin page at
    ADMIN_KWARGS:
      logo: https://gramener.com/uistatic/gramener.png  # Logo URL
      home: /$YAMLURL/                                  # URL that logo links to
      title: Admin  Page Options                        # Navbar title
      components: [info, users, shell]                  # Components to show
      theme: '?font-family-base=roboto'                 # UI component theme query
    ADMIN_AUTH:
      membership:
        email: [admin1@example.org, admin2@example.org]     # Only allow these users
```

The `ADMIN_KWARGS` section accepts the following parameters:

- `logo`: Logo image URL. Either an absolute URL or relative to the admin page.
- `home`: Logo link URL. Clicking on the logo takes you to this link.
- `title`: Title displayed on the navbar. Defaults to "Admin"
- `theme`: The [UI theme](../uicomponents/) for the page. For example,
  `?font-family-base=Roboto` makes the font Roboto.
- `components`: List of admin components. Choose from:
  - `user`: [User management component](#admin-user-management)
  - `schedule`: [Schedule component](#admin-schedule)
  - `alert`: [Alert component](#admin-alert)
  - `shell`: [Python web shell component](#admin-shell)
  - `info`: [Gramex & server info component](#admin-info)
  - `config`: [Gramex configuration component](#admin-config)
  - `logs`: [Log viewer component](#admin-logs)

The `ADMIN_AUTH` section is the same as specifying the `auth:`
[authorization](../auth/#authorization) on all admin pages. For example:

```yaml
    ADMIN_AUTH:
      login_url: /$YAMLURL/login/
      membership:
        email: [admin1@example.org, admin2@example.org]     # Only allow these users
```

... is the same as specifying this on every admin page:

```yaml
    auth:
      login_url: /$YAMLURL/login/
      membership:
        email: [admin1@example.org, admin2@example.org]     # Only allow these users
```

::: example href=admin-kwargs/ source=https://github.com/gramener/gramex-guide/blob/master/admin/gramex.yaml
    Admin page options example

## Admin: User management

To manage users, add roles and other attributes, use the `user` component.
To enable it:

1. Ensure that `users` is in `components:` (e.g. `components: [users, ...]`) or
   you don't specify any components.
2. Add an `authhandler:` that has the name of a [auth handler](../auth/) that is
   either a [DBAuth](../auth/#dbauth) or has a [lookup section](../auth/#lookup-attributes)

For example:

```yaml
import:
  admin/admin-user:
    path: $GRAMEXAPPS/admin2/gramex.yaml
    YAMLURL: /$YAMLURL/admin-user/
    ADMIN_KWARGS:
      authhandler: login        # Manages users via the url: key named "login"

url:
  login:                        # Here is the url: key named "login"
    pattern: ...
    handler: DBAuth             # This must either be DBAuth...
    kwargs:
      ...
      lookup:                   # ... or have a lookup: section
        ...
```

::: example href=admin-user/ source=https://github.com/gramener/gramex-guide/blob/master/admin/gramex.yaml
    User management example

User management is available as a component. To embed it in your page, add a
FormHandler table component:

```html
<div class="users"></div>
<script>
  $('.users').formhandler({
    src: 'admin/users-data',    // Assuming the admin page is at admin/
    edit: true,                 // Allow editing users
    add: true                   // Allow adding users
  })
</script>
```

::: example href=users.html source=https://github.com/gramener/gramex-guide/blob/master/admin/users.html
    User management component example

You can specify custom actions & formats using FormHandler table. See the [admin page source code](https://github.com/gramener/gramex/blob/master/gramex/apps/admin2/index.html) for examples of custom actions.

### Sign Up Users with a Welcome Email

You can send welcome emails to new users added through the user management
component. To enable it, add a `signup:` key to `ADMIN_KWARGS`. It supports two
values, `email_subject` and `email_body`. Both values are template strings that
can be formatted with any user attribute.

For example, the following spec

```yaml
import:
  admin/admin-user:
    path: $GRAMEXAPPS/admin2/gramex.yaml
    YAMLURL: /$YAMLURL/admin-user/
    ADMIN_KWARGS:
      authhandler: login        # Manages users via the url: key named "login"
      signup:
        email_subject: Welcome {user} to {org}
        email_body: |
          Hello, {user}! Welcome to {org}.
          Your location is {location}.
```

sends emails to new users with the subject and body as specified, where `user`,
`org` and `location` are user attributes contained in the `login` authhandler.
The templates work for any user attributes.


### Edit User Attribute Rules

The user management component also includes an editor for the
[rules that modify user attributes](../auth/#add-attribute-rules). If the
`authhandler` associated with your Admin app contains a `rules` kwarg, then an
editor for those rules appears in the user management component as a FormHandler
table.

This table can also be embedded anywhere else as follows:

```html
<div class="user-rules"></div>
<script>
  $('.user-rules').formhandler({
    src: 'admin/auth-rules',    // Assuming the admin page is at admin/
                                // and the corresponding `authhandler` contains `rules`
    edit: true,                 // Allow editing rules
    add: true                   // Allow adding rules
  })
</script>
```

## Admin: Schedule

The schedule component lets you see all [scheduler tasks](../scheduler/) defined
under the `schedule:` section, and run them.

::: example href=admin/schedule source=https://github.com/gramener/gramex-guide/blob/master/admin/
    Schedule example


The admin schedule component can be embdded in any page:

```html
<div class="schedule"></div>
<script src="schedule.js"></script>
<script>
  $('.schedule').schedule({           // Embed the scheduler
    url: 'admin/schedule-data',       // Assuming the admin page is at admin/
    xsrf: '{{ handler.xsrf_token }}'  // Pass XSRF token. Requires FileHandler template
  })
</script>
```

::: example href=schedule.html source=https://github.com/gramener/gramex-guide/blob/master/admin/schedule.html
    Schedule component example

## Admin: Alert

The alert component lets you see all [alerts](../alert/) defined under the
`alert:` section, and preview or run them.

::: example href=admin/alert source=https://github.com/gramener/gramex-guide/blob/master/admin/
    Alert example

The admin alert component can be embedded in any page:

```html
<div class="schedule"></div>
<script src="schedule.js"></script>
<script>
  $('.schedule').schedule({           // Alerts use the same component as schedulers
    alert: true,                      // ... but with the alert: true option
    url: 'admin/alert-data',          // Assuming the admin page is at admin/
    xsrf: '{{ handler.xsrf_token }}'  // Pass XSRF token. Requires FileHandler template
  })
</script>
```

## Admin: Shell

The shell adds a web-based Python shell that runs commands within the running
Gramex instance. This is useful when debugging a live environment.
To enable it, ensure that you specify:

- Either `components: [..., shell, ...]`, i.e. include `shell` in `components:`
- Or do not specify any `components:`

In the shell, you can run these commands:

```python
1 + 2                   # Evaluate Python expressions
import gramex           # All gramex libraries are available
handler.session         # WebsocketHandler instance is available as 'handler'
```

The web shell is available as a component. To embed it in your page, add:

```html
<div class="webshell"></div>
<script src="admin/webshell.js"></script>
<script>
  $('.webshell').webshell({           // Embed the web shell here
    url: 'admin/webshell-data',       // Assuming the admin page is at admin/
    prompt: '>>> ',                   // Prompt to display at the start of each page
    welcome: [                        // Welcome message as a list of lines.
      'Welcome to the Gramex shell',
      '>>> '
    ]
  })
</script>
```

::: example href=shell.html source=https://github.com/gramener/gramex-guide/blob/master/admin/shell.html
    Web shell component example

## Admin: Info

The info page shows information about versions, paths and other details about
Gramex and its dependencies.

To enable it, ensure that you specify:

- Either `components: [..., info, ...]`, i.e. include `info` in `components:`
- Or do not specify any `components:`

This exposes JSON data at `<admin-page>/info-data` as a list of objects
consistent with [FormHandler](../formhandler/).

```json
[
    {"section":"git","key":"path","value":"D:\\bin\\git.EXE","error":null},
    {"section":"git","key":"version","value":"git version 2.15.1\n","error":""},{"section":"gramex","key":"memory usage","value":153411584,"error":""},
    ...
]
```

The information provided includes (in a `<section>.<key>` notation):

- `git.path`: path where git is installed
- `git.version`: git version
- `node.path`: path where node is installed
- `node.version`: node version
- `npm.version`: npm version
- `yarn.version`: yarn version
- `python.path`: path where Python is installed
- `python.version`: Python version
- `gramex.path`: path where this instance of Gramex is installed
- `gramex.version`: Gramex version (for current instance)
- `gramex.memory-usage`: total memory used by Gramex
- `gramex.open-files`: number of files opened by Gramex
- `system.cpu-count`: number of CPUs in the system
- `system.cpu-usage`: % of CPU used by the system
- `system.disk-usage`: % of root disk used by the system
- `system.memory-usage`: % of memory used by the system

The result is stored in the `value` column. If the value is not available, the `error` is stored in the `error` column.

::: example href=admin-kwargs/?tab=info source=https://github.com/gramener/gramex-guide/blob/master/admin/gramex.yaml
    Info page example

## Admin: Config

WIP: Shows the Gramex configuration, and allows users to edit it.

## Admin: Logs

WIP: Shows the Gramex logs.


## Admin access control

TODO: explain how to restrict admin access


## Admin page (old)

From v1.33, Gramex used a beta version of the admin page. This is **deprecated**.

To use it, add this to your `gramex.yaml`:

```yaml
import:
  admin1:
    path: $GRAMEXAPPS/admin/gramex.yaml   # Source of the app
    YAMLURL: /$YAMLURL/admin1/       # Location to mount at
    ADMIN_LOOKUP:
      url: $YAMLPATH/lookup.xlsx          # DB / file with user information
      id: user                            # Column name that has the user ID
```

::: example href=admin1/ source=https://github.com/gramener/gramex-guide/blob/master/admin/gramex.yaml
    Admin page (old)


Use `ADMIN_*` variables to configure your app.

- `ADMIN_LOOKUP`: See [lookup attributes](../auth/#lookup-attributes)
  - `url`: the DB or file that has user data
  - `id`: column that has the user ID
- `ADMIN_KWARGS`:
  - `hide`: columns in data source to exclude (like password and other sensitive data)
- `ADMIN_USER`: optional `string` or `list` of user IDs that can view this admin page
- `ADMIN_ROLE`: optional `string` or `list` of roles. If the user's `role` column is in this list, the user can view this admin page
- `LOGIN_URL`: Login url for admin page. Incase of DBAuth, this will be same as pattern for DBAuth handler
- `LOGOUT_URL`: The url pattern provided for `LogoutHandler`

Sample use of `role`:

```yaml
import:
  admin:
    path: $GRAMEXAPPS/admin/gramex.yaml
    YAMLURL: /$YAMLURL/admin/
    ADMIN_LOOKUP:
      url: $YAMLPATH/lookup.xlsx
      id: user                   # user column in Excel sheet has the user name
    ADMIN_USER: ['alpha']        # Always allow user `alpha`
    ADMIN_ROLE: ['admin']        # Also allow anyone with role as admin
    LOGIN_URL: /admin/           # URL to show login page for admin page
    LOGOUT_URL: /logout/         # URL to logout
```

By default, admin site can be accessed by any user when using `127.0.0.1`.
