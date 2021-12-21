---
title: Gramex 1.74 release notes
prefix: 1.74
...

[TOC]

Gramex 1.74's admin app lets administrators add new users, welcome them via email, add custom fields and roles for users based on rules, and more.


## Add new users on Admin app

[Admin app's user management component](../../admin/#sign-up-users-with-a-welcome-email) lets administrators add new users via the user interface.

![Example of how to to add new user](add-user.gif)

You can send welcome emails to new users added through this interface with the configuration below:

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

Thanks [@jaidevd](https://github.com/jaidevd)

## Add custom fields and roles for users

[Admin app's user management component](../../admin/#sign-up-users-with-a-welcome-email) also
includes an editor for the [rules that modify user attributes](../../auth/#add-attribute-rules).

![Example of how to to add new rules](add-rules.gif)

The rule we added works as follows:

- `selector`: if the `email` attribute of the user...
- `pattern`: matches `*@example.org`...
- `field`: then set the `role` attribute of the user...
- `value`: to `external`

To enable this, [add a `rules:` section to the auth handler](../../auth/#add-attribute-rules).

```yaml
url:
  auth:
    pattern: /$YAMLURL/login
    handler: SimpleAuth           # Any auth handler works
    kwargs:
      rules:
        url: sqlite:///path/to/rules.db   # Connect to rules DB / file
        table: rules
```

Thanks [@jaidevd](https://github.com/jaidevd)

## UIFactory inline scripts

To add logic to your component, add any JavaScript inside
[`<script $inline>`](https://uifactory.gramener.com/guide/#script-inline-runs-scripts-while-rendering).
This runs when the component is rendered.

```html
<template $name="repeat-script" icon="X" value="30">
  <script $inline>
    let count = +value
    let result = isNaN(count) ? 'error' : icon.repeat(count)
  </script>
  ${result}
</template>
```

When you add the component to your page:

```html
<repeat-script icon="★" value="8"></repeat-html>
<repeat-script icon="★" value="a"></repeat-html>
```

... it renders this output:

★★★★★★★★

Thanks [@jaidevd](https://github.com/jaidevd)

## Bug fixes

- [ComicHandler](../../comichandler/) did not work unless a character was specified. Now it defaults to the first available character.
  Thanks [@radheyakale](https://github.com/radheyakale)
- [MLHandler](../../mlhandler/) now supports HTTP Content-Type settings and auth settings.
  Thanks [@jaidevd](https://github.com/jaidevd)
- gramex.data.insert only passes required parameters to pd.io.sql.to_sql.
  Thanks [@nikhilkabbin](https://github.com/nikhilkabbin)

## Backward compatibility & security

Gramex 1.74 is backward compatible with [previous releases](../) unless the release notes say otherwise.
[Automated builds](https://travis-ci.com/github/gramener/gramex/builds) test this.

[Backward compatibility tests for 1.74](https://travis-ci.com/github/gramener/gramex/builds/TODO){:.btn .btn-lg .btn-primary}

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt){:.btn .btn-xs .btn-success}
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt){:.btn .btn-xs .btn-success}
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt){:.btn .btn-xs .btn-success}
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt){:.btn .btn-xs .btn-success}

## Statistics

The Gramex code base has:

- 19,936 lines of Python (79 more than 1.73)
- 3,359 lines of JavaScript (same as 1.73)
- 12,565 lines of test code (64 more than 1.73)
- 89% test coverage (same as 1.73)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).

Note: Gramex 1.74 does not work with Python 3.8 or 3.9. We recommend Python 3.7.
