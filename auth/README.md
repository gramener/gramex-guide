---
title: Auth handlers log in users
prefix: Auth
icon: auth.png
desc: Auth Handlers enable your application to support different authentication methods
by: TeamGramener
type: microservice
---

Your session data is:
<iframe class="w-100" frameborder="0" src="session"></iframe>

[TOC]

# Sessions

Gramex identifies sessions through a cookie named `sid` by default, and stores information against
each session as a persistent key-value store. This is available as `handler.session` in every
handler. For example, here is the contents of your [`handler.session`](session) variable now:

<iframe class="w-100" frameborder="0" src="session"></iframe>

This has a `randkey` variable that was generated using the following code:

```python
def store_value(handler):
    handler.session.setdefault('randkey', random.randint(0, 1000))
    return json.dumps(handler.session)
```

The first time a user visits the [session](session) page, it generates the
`randkey`. The next time this is preserved.

**v1.64**: If you deploy multiple Gramex applications, the `sid` cookie used in one can conflict
with the others. To avoid this, change the cookie name to something unique for each app, using
`app.session.cookie`:

```yaml
app:
  session:
    cookie: my-app-sid        # Instead of 'sid', use 'my-app-sid' as the cookie name for this app
```

## Session security

The session cookie can have the following configurations:

- [`httponly`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#httponly):
  `true` prevents JavaScript from using `document.cookie`. Default: `true`
- [`secure`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#secure): `true`
  prevents HTTP requests from accessing the cookie. Only HTTPS is allowed. Default: `false`
- [`domain`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie): `example.org`
  restricts the cookie to `example.org` and its subdomains. (Default: not specified, which
  restricts the cookie to the host of the current document URL, not including subdomains.)

You can change these defaults to a more secure setting as follows:

```yaml
app:
  session:
    httponly: true        # Allow JavaScript access via document.cookie
    secure: true          # Cookies can be accessed only via HTTPS (not HTTP)
    samesite: Strict      # Browser sends the cookie only for same-site requests.
                          # Values can be Strict, Lax or None. (Case-sensitive)
    domain: example.org   # All subdomains in *.example.org can access session
```

The cookie is stored for `app.session.expiry` days. Here is the default configuration:

```yaml
app:
  session:
    expiry: 31              # Sessions expire after 31 days by default
```

You can override session expiry duration with a `session_expiry: <days>` kwarg
under any auth handler. See [session expiry](#session-expiry).

The cookies are encrypted using the `app.settings.cookie_secret` key. Change
this to a random secret value, either via `gramex --settings.cookie_secret=...`
or in you `gramex.yaml`:

```yaml
app:
  settings:
    cookie_secret: your-cookie-secret
```

## Session data

Session data is stored in a session store that is configured as follows:

```yaml
app:
  session:
    type: json                      # Type of store to use: json, sqlite, memory
    path: $GRAMEXDATA/session.json  # Path to the store (ignored for type: memory)
    expiry: 31                      # Session cookies expiry in days
    flush: 5                        # Write store to disk periodically (in seconds)
    purge: 3600                     # Delete old sessions periodically (in seconds)
```

Sessions can be stored in one of these `type:`

| `type`    | Speed     | Persistent | Distributed | Version     |
|:---------:|:---------:|:----------:|:-----------:|:-----------:|
| `memory`  | faster    | no         | no          | all         |
| `json`    | fast      | yes        | no          | all         |
| `sqlite`  | slow      | yes        | yes         | 1.27        |
| `redis`   | fast      | yes        | yes         | 1.36        |

Note: `type: hdf5` is deprecated from **v1.34**. It is very slow and not distributed.

- Persistent means that it will be saved if Gramex restarts
- Distributed means multiple Gramex instances can use it at the same time.

The default is `type: json`. Use this for single instances. For multiple Gramex
instances, use `type: redis`. Here is a sample configuration:

```yaml
app:
  session:
    type: redis         # Persistent multi-instance data store
    path: localhost:6379:0  # Redis server:port:db (default: localhost:6379:0)
    # You can pass more parameters to https://redis-py.readthedocs.io/en/latest/
    # by adding :key=value:key=value:... to path. For example:
    # path: localhost:6379:0:password=your-password
    expiry: 31          # Session cookies expiry in days
    flush: 5            # Not relevant for redis stores these are live
    purge: 86400        # Delete old sessions periodically (in seconds)
```

Before running this, you need to run the [Redis](https://redis.io/) database.

- On Windows, [download Redis](https://redis.io/download), unzip it and run `redis-server`
- On Ubuntu, run `sudo apt-get install redis-server` and run `redis-server`

You can access the session data directly from the session store, or via
Gramex as follows:

```python
from gramex.handlers.basehandler import session_store_cache
# Loop through each session store -- there may be multiple stores
for store in session_store_cache.values():
    for session_id in store.store:
        print('Found session ID', session_id)
```

You can also access session data from inside a handler via:

```python
for session_id in handler._session_store.store:
    print('Found session ID', session_id)
```

# Authentication

Gramex allows users to log in using various single sign-on methods. The flow
is as follows:

1. Define a Gramex auth handler. This URL renders / redirects to a login page
2. When the user logs in, send the credentials to the auth handler
3. If credentials are valid, store the user details and redirect the user. Else
   show an error message.

After logging in, users are re-directed to the `?next=` URL, else the Referer
(i.e. the page from which the user visited the login page.) You can change this
using the [redirection configuration](../config/#redirection). For example, to
use `?later=` instead of `?next=`, you need to do this:

```yaml
url:
  login/auth:
    pattern: /$YAMLURL/login/
    handler: SimpleAuth
    kwargs:
      credentials: {alpha: alpha}
      redirect:
        query: later                  # ?later= is used for redirection
        header: Referer               # else, the Referer header
        url: ../                      # else redirect to parent page
  app/home:
    pattern: /$YAMLURL/
    handler: ...
    kwargs:
      auth:
        login_url: /$YAMLURL/login/   # Use this as the login URL
        query: later                  # Send ?later= to the login URL
```

To force the user to a fixed URL after logging in, use:

```yaml
url:
  login/auth:
    pattern: /$YAMLURL/login/
    handler: SimpleAuth
    kwargs:
      credentials: {alpha: alpha}
      redirect:
        url: ../              # Always redirect to this page after login
```

Every time the user logs in, the session ID is changed to prevent
[session fixation](https://www.owasp.org/index.php/Session_fixation).


## Simple auth

This configuration creates a [simple auth page](simple?next=.):

```yaml
url:
  login/simple:
    pattern: /$YAMLURL/simple   # Map this URL
    handler: SimpleAuth         # to the SimpleAuth handler
    kwargs:
      credentials:              # Specify the user IDs and passwords
        alpha: alpha            # User: alpha has password: alpha
        beta: beta              # Similarly for beta
        gamma:                  # The user gamma is defined as a mapping
          password: pwd         # One of the keys MUST be "password"
          role: user            # Additional keys can be defined
      template: $YAMLPATH/simple.html   # Optional login template
```

This setup is useful only for testing. It stores passwords in plain text.
**DO NOT USE IT IN PRODUCTION.**

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "alpha",        // same as the user name used to log in
    "user": "alpha"       // same as id
}
```

For user `gamma`, it would have the additional attribute `role` specified above
in the `gramex.yaml`:

```js
{
    "id": "gamma",        // same as user name used to log in
    "user": "gamma",      // same as id
    "role": "user"        // any additional attributes are also added, except password
}
```

The `template:` key is optional, but you should generally associate it with a
[HTML login form file](simple?next=.) that requests a username and password (with an
[xsrf][xsrf] field). See [login templates](#login-templates) to learn how to
create one.

::: example href=simple source=https://github.com/gramener/gramex-guide/blob/master/auth/simple.html
    Simple Auth example


## Google auth

This configuration creates a [Google login page](google?next=.):

```yaml
url:
  login/google:
    pattern: /$YAMLURL/google   # Map this URL
    handler: GoogleAuth         # to the GoogleAuth handler
    kwargs:
      key: YOURKEY              # Set your app key
      secret: YOURSECRET        # Set your app secret
      # Any Google OAuth2 parmeters are passed under extra_params. See:
      # https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
      extra_params:
        prompt: select_account  # Prompt to pick account every time
```

To get the application key and secret:

- Go to the [Google Dev Console](http://console.developers.google.com)
- Select a project, or create a new one.
- Enable the Google+ API service
- Under Credentials, create credentials for an OAuth client ID for a Web application
- Set the Authorized redirect URIs to point to your auth handler. (You can ignore Authorized Javascript origins)
- Copy the "Client secret" and "Client ID" to the application settings

::: example href=gmail/ source=https://github.com/gramener/gramex-guide/blob/master/auth/gmail/
    Google Auth example

You can get access to Google APIs by specifying a scope. For example, this [accesses your contacts and mails](googleapi.html):

```yaml
url:
  login/google:
    pattern: /$YAMLURL/google   # Map this URL
    handler: GoogleAuth         # to the GoogleAuth handler
    kwargs:
      key: YOURKEY              # Set your app key
      secret: YOURSECRET        # Set your app secret
      # Any Google OAuth2 parmeters are passed under extra_params. See:
      # https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
      extra_params:
        prompt: select_account  # Prompt to pick account every time
      # Scope list: https://developers.google.com/identity/protocols/googlescopes
      scope:
        - https://www.googleapis.com/auth/contacts.readonly
        - https://www.googleapis.com/auth/gmail.readonly
```

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "s.anand@gramener.com",     // email ID of the user
    "hd": "gramener.com",             // hosted domain name for G Suite accounts
    "family_name": "S",
    "name": "Anand S",
    "picture": "https://lh6.googleusercontent.com/-g6rN5UZlBjI/AAAAAAAAAAI/AAAAAAAAAfk/H5t_W1k90GQ/photo.jpg",
    "locale": "en",
    "gender": "male",
    "email": "s.anand@gramener.com",
    "link": "https://plus.google.com/105156369599800182273",
    "given_name": "Anand",
    "verified_email": true,
    "access_token": "...",
    "expires_in": 3599,
    "scope": "https://www.googleapis.com/auth/userinfo.email openid ...",
    "token_type": "Bearer",
    "id_token": "..."
}
```

The bearer token is available in the session key `access_token`. You can
use this with [ProxyHandler to access Google APIs](../proxyhandler/#google-proxyhandler) .

Programmatically, you can pass this to any Google API with a
`Authorization: Bearer <access_token>` HTTP header, or with a
`?access_token=<access_token>` query parameter. For example, this code
[fetches Google contacts](googleapi.html):

```python
@tornado.gen.coroutine
def contacts(handler):
    result = yield async_http_client.fetch(
        'https://www.google.com/m8/feeds/contacts/default/full',
        headers={'Authorization': 'Bearer ' + handler.session.get('access_token', '')},
    )
    raise tornado.gen.Return(result)
```

### Offline access to Google data

To perform offline actions on behalf of the user (e.g. send email, poll Google Drive, etc), you
need to request offline access by adding `access_type: offline` under `extra_params`.

```yaml
url:
  login/google:
    pattern: /$YAMLURL/google   # Map this URL
    handler: GoogleAuth         # to the GoogleAuth handler
    kwargs:
      key: YOURKEY              # Set your app key
      secret: YOURSECRET        # Set your app secret
      # Any Google OAuth2 parmeters are passed under extra_params. See:
      # https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
      extra_params:
        prompt: select_account  # Prompt to pick account every time
        access_type: offline    # Get a token that works offline
      # Scope list: https://developers.google.com/identity/protocols/googlescopes
      scope:
        - https://www.googleapis.com/auth/contacts.readonly
        - https://www.googleapis.com/auth/gmail.readonly
```

When the user logs in for the first time, Google sends a refresh token that you can access via
`handler.current_user.refresh_token`.

If the `access_token` has expired, you will get a HTTP 401 Unauthorized error, with a JSON response like this:

```json
{
  "error": {
    "code": 401,
    "message": "Request had invalid authentication credentials...",
    "status": "UNAUTHENTICATED"
  }
}
```

In this case, you can get a new access token using `GoogleAuth.exchange_refresh_token()`:

```python
@tornado.gen.coroutine
def get_contacts(handler):
    # Make an authenticated request
    url = 'https://www.google.com/m8/feeds/contacts/default/full'
    headers = {'Authorization': 'Bearer ' + handler.current_user.get('access_token', '')}
    r = requests.get(url, headers=headers)
    # If the access token has expired
    if r.status_code == 401:
        # Exchange refresh token
        yield gramex.service.url['login/google'].handler_class.exchange_refresh_token(
            handler.current_user)
        # Make the request again
        headers = {'Authorization': 'Bearer ' + handler.current_user.get('access_token', '')}
        r = requests.get(url, headers=headers)
    return r.text
```


### SSL certificate error

Google auth and connections to HTTPS sites may fail with a
`CERTIFICATE_VERIFY_FAILED` error. Here are possible solutions:

1. Run `conda update python` to upgrade to the latest version of Python, which will use the latest `ssl` module.
2. Run `conda install certifi==2015.04.28` to downgrade to an older version of `certifi`. See this [Tornado issue](https://github.com/tornadoweb/tornado/issues/1534#issuecomment-183962419)


## Facebook auth

**Available in Gramex Enterprise**.
This configuration creates a [Facebook login page](facebook?next=.):

```yaml
url:
  login/facebook:
    pattern: /$YAMLURL/facebook # Map this URL
    handler: FacebookAuth       # to the FacebookAuth handler
    kwargs:
      key: YOURKEY            # Set your app key
      secret: YOURSECRET      # Set your app secret
```

- Go to the [Facebook apps page](https://developers.facebook.com/apps/)
- Select an existing app, or add a new app. Select website. You can skip the quick start.
- In the Settings > Basic tab on the left
  - Select Add Platform (+) > Website. Add the URL of your page. When testing, using `http://localhost:9988/` not `http://127.0.0.1:9988/`.
  - Set the app domain of your server. (When testing locally, this will be `localhost`)
- Copy the Application ID and App secret to the application settings
- If you need an `access_token` for [FacebookGraphHandler](../facebookgraphhandler/), go to Settings > Advanced and copy the Client Token

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "10154519601793455",        // Facebook ID
    "last_name": "Subramanian",
    "link": "https://www.facebook.com/app_scoped_user_id/.../",
    "name": "Anand Subramanian",
    "locale": "en_GB",
    "picture": {
        "data": {
            "height": 50,
            "is_silhouette": false,
            "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=...",
            "width": 50
        }
    },
    "first_name": "Anand",
    "access_token": "...",
    "session_expires": "5183999"
}
```

## Twitter auth

**Available in Gramex Enterprise**.
This configuration creates a [Twitter login page](twitter?next=.):

```yaml
url:
  login/twitter:
    pattern: /$YAMLURL/twitter  # Map this URL
    handler: TwitterAuth        # to the TwitterAuth handler
    kwargs:
      key: YOURKEY            # Set your app key
      secret: YOURSECRET      # Set your app secret
```

- Go to the [Twitter app page](https://apps.twitter.com/)
- Select Create New App
- Enter a Name, Description and Website
- In the Callback URL, enter the URL of the auth handler
- Go to the Keys section of the app
- Copy the Consumer Key (API Key) and Consumer Secret (API Secret) to the application settings

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "sanand0",          // Twitter ID
    "username": "sanand0",
    "follow_request_sent": false,
    "has_extended_profile": false,
    "profile_use_background_image": true,
    "default_profile_image": false,
    "suspended": false,
    "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme14/bg.gif",
    "verified": false,
    "translator_type": "none",
    "profile_text_color": "333333",
    "profile_image_url_https": "https://pbs.twimg.com/profile_images/64530696/Anand2_normal.png",
    "profile_sidebar_fill_color": "EFEFEF",
    "entities": {...},
    "followers_count": 2395,
    "profile_sidebar_border_color": "EEEEEE",
    "id_str": "15265603",
    "profile_background_color": "131516",
    "needs_phone_verification": false,
    "listed_count": 100,
    "status": {...},
    "is_translation_enabled": false,
    "utc_offset": null,
    "statuses_count": 1149,
    "description": "Chief Data Scientist at Gramener",
    "friends_count": 89,
    "location": "Bangalore",
    "profile_link_color": "009999",
    "profile_image_url": "http://pbs.twimg.com/profile_images/64530696/Anand2_normal.png",
    "following": false,
    "geo_enabled": true,
    "profile_background_image_url": "http://abs.twimg.com/images/themes/theme14/bg.gif",
    "screen_name": "sanand0",
    "lang": "en",
    "profile_background_tile": true,
    "favourites_count": 10,
    "name": "S Anand",
    "notifications": false,
    "url": "http://t.co/da5ntSjMc4",
    "created_at": "Sat Jun 28 20:11:06 +0000 2008",
    "contributors_enabled": false,
    "time_zone": null,
    "access_token": {...},
    "protected": false,
    "default_profile": false,
    "is_translator": false
}
```

## LDAP auth

**Available in Gramex Enterprise**.
There are 2 ways of logging into an LDAP server.

1. **Direct** login with a user ID and password directly.
2. **Bind** login as a "bind" user, search for an ID, and then validate the password

The first method is simpler. The second is flexible -- it lets you log in with
attributes other than the username. For example, you can log in with an employee
ID or an email ID, etc instead of the "uid".

### Direct LDAP login

This configuration creates a [direct LDAP login page](ldap?next=.):

```yaml
auth/ldap:
  pattern: /$YAMLURL/ldap             # Map this URL
  handler: LDAPAuth                   # to the LDAP auth handler
  kwargs:
    template: $YAMLPATH/ldap.html   # Optional login template
    host: 10.20.30.40               # Server to connect to
    use_ssl: true                   # Whether to use SSL (LDAPS) or not
    user: 'DOMAIN\{user}'           # Check LDAP domain name with client IT team
    password: '{password}'          # This is the field name, NOT the actual password
```

The `user:` and `password:` configuration in `gramex.yaml` maps form fields to
the user ID and password. Strings inside `{braces}` are replaced by form fields
-- so if the user enters `admin` in the `user` field, `GRAMENER\{user}` becomes
`GRAMENER\admin`.

The optional `template:` should be a [HTML login form](ldap?next=.) that requests a
username and password. (The form should have an [xsrf][xsrf] field).

LDAP runs on port 389 and and LDAPS runs on port 636. If you have a non-standard
port, specify it like `port: 100`.

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "uid=employee,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org",
    "user": "uid=employee,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org"
},
```

### LDAP attributes

**v1.23**. You can fetch additional
[additional LDAP attributes](http://www.computerperformance.co.uk/Logon/active_directory_attributes.htm)
like:

- `sAMAccountName`: user's login ID
- `CN` (common name) is the same as `name`, which is first name + last name
- `company`, `department`, etc.

To fetch these, add a `search:` section. Below is a real-life example:

```yaml
  kwargs:
    template: $YAMLPATH/ldap.html
    host: 10.20.30.40                       # Provided by client IT team
    use_ssl: true
    user: 'ICICIBANKLTD\{user}'             # Provided by client IT team
    password: '{password}'                  # This is the field name, not the actual passsword
    search:                                 # Look up user attributes by searching
        base: 'dc=ICICIBANKLTD,dc=com'      # Provided by client IT team
        filter: '(sAMAccountName={user})'   # Provided by client IT team
        user: 'ICICIBANKLTD\{sAMAccountName}'   # How the username is displayed
```

- `base:` where to search. Typically `dc=DOMAIN,dc=com` for ActiveDirectory
- `filter:` what to search for. Typically `(sAMAccountName={user})` for ActiveDirectory
- `user:` what to replace the user ID with. This is a string template. If you
  want `handler.current_user['id']` to be like `DOMAIN\username`, use
  `DOMAIN\{sAMAccountName}`.

### Bind LDAP login

This configuration creates a [bind LDAP login page](ldap-bind?next=.):

```yaml
auth/ldap-bind:
  pattern: /$YAMLURL/ldap-bind            # Map this URL
  handler: LDAPAuth                       # to the LDAP auth handler
  kwargs:
    template: $YAMLPATH/ldap.html       # This has the login form
    host: ipa.demo1.freeipa.org         # Server to connect to
    use_ssl: true                       # Whether to use SSL or not
    bind:                               # Bind to the server with this ID/password
      user: 'uid=admin,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org'
      password: $LDAP_PASSWORD        # Stored in a Gramex / environment variable
    search:
      base: 'dc=demo1,dc=freeipa,dc=org'  # Search within this domain
      filter: '(mail={user})'             # by email ID, rather than uid
      password: '{password}'              # Use the password field as password
```

This is similar to [direct LDAP login](#direct-ldap-login), but the sequence followed is:

1. Gramex logs in as (`bind.user`, `bind.password`).
2. When the user submits the form, Gramex searches the LDAP server under
   `search.base` for `search.filter` -- which becomes
   `(mail={whatever-username-was-entered})`.
3. Finally, Gramex checks if the first returned user matches the password.

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "uid=employee,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org",
    "user": "uid=employee,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org",
    "dn": "uid=employee,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org",
    "attributes": {
        "cn": ["Test Employee"],
        "objectClass": [
            "top",
            "person",
            "organizationalperson",
            "inetorgperson",
        ],
        "uidNumber": [1198600004],
        "manager": ["uid=manager,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org"],
        "krbLoginFailedCount": [0],
        "krbLastPwdChange": ["2017-06-18 11:13:37+00:00"],
        "uid": ["employee"],
        "mail": ["employee@demo1.freeipa.org"],
        "dn": "uid=employee,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org",
        "loginShell": ["/bin/sh"],
        "homeDirectory": ["/home/employee"],
        "displayName": ["Test Employee"],
        "memberOf": [
            "cn=ipausers,cn=groups,cn=accounts,dc=demo1,dc=freeipa,dc=org",
            "cn=employees,cn=groups,cn=accounts,dc=demo1,dc=freeipa,dc=org"
        ],
        "givenName": ["Test"],
        "initials": ["TE"],
        ...
    }
},
```

[xsrf]: ../filehandler/#xsrf


## Database auth

**Available in Gramex Enterprise**.
This is the minimal configuration that lets you log in from an Excel file:

```yaml
url:
  auth/db:
    pattern: /db                      # Map this URL
    handler: DBAuth                   # to the DBAuth handler
    kwargs:
      url: $YAMLPATH/auth.xlsx        # Pick up list of users from this XLSX (or CSV) file
      user:
        column: user                  # The user column in users table has the user ID
      password:
        column: password              # The users.password column has the password
      redirect:                       # After logging in, redirect the user to:
        query: next                   #      the ?next= URL
        header: Referer               # else the Referer: header (i.e. page before login)
        url: .                        # else the home page of current directory
```

Now create an `auth.xlsx` with the first sheet like this:

```text
user      password
-----     --------
alpha     alpha
beta      beta
...       ...
```

With this, you can log into `/db` as `alpha` and `alpha`, etc. It displays a
[minimal HTML template][auth-template] that asks for an ID and password, and
matches it with the `auth.xlsx` database.

**Note** - Do not name user column as `_user_id` as it's an internal variable.

::: example href=dbsimple source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    DBAuth example

[auth-template]: http://github.com/gramener/gramex/blob/master/gramex/handlers/auth.template.html

You can configure several aspects of this flow. You can (and *should*) use:

- `template:` to customize the appearance of the login page
- `url:` to a SQLAlchemy database (with `table:`) instead of using CSV / Excel files
- `password.function:` to encrypt the password
- `delay:` to specify the login failure delay
- `password.hash:` to enable client side encryption of password.
Set this to `true` when required. This will block any MITM attacks.

Here is a more complete example:

```yaml
url:
  auth/db:
  pattern: /$YAMLURL/db                 # Map this URL
  handler: DBAuth                       # to the DBAuth handler
  kwargs:
    url: sqlite:///$YAMLPATH/auth.db  # Pick up list of users from this sqlalchemy URL
    table: users                      # ... and this table (may be prefixed as schema.users)
    template: $YAMLPATH/dbauth.html   # Optional login template
    user:
      column: user                  # The users.user column is matched with
      arg: user                     # ... the ?user= argument from the form
    delay: [1, 2, 5, 10]              # Delay for failed logins
    password:
      column: password              # The users.password column is matched with
      arg: password                 # ... the ?password= argument from the form
      # You should encrypt passwords when storing them.
      # The function below specifies the encryption method.
      # Remember to change secret-key to something unique
      function: passlib.hash.sha256_crypt.encrypt(content, salt="secret-key")
      # hash: true                  # Client side encryption
```

::: example href=db source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    DBAuth example

You should create a [HTML login form](db?next=.) that requests a username and password
(with an [xsrf][xsrf] field). See [login templates](#login-templates) to learn
how to create one.

In the `gramex.yaml` configuration above, the usernames and passwords are stored
in the `users` table of the SQLite `auth.db` file. The `user` and `password`
columns of the table map to the `user` and `password` query arguments.
Here is sample code to populate it:

```python
engine = sqlalchemy.create_engine('sqlite:///auth.db', encoding='utf-8')
engine.execute('CREATE TABLE users (user text, password text)')
engine.execute('INSERT INTO users VALUES (?, ?)', [
    ['alpha', 'alpha'],
    ['beta', 'beta'],
    # ...
])
```

The password supports optional encryption. Before the password is compared with
the database, it is transformed via the `function:` provided. This function has
access to 2 pre-defined variables:

1. `handler`: the Handler object
2. `content`: the user-provided password

For an example of how to create users in a database, see `create_user_database`
from [authutil.py](authutil.py).

If user login fails, the response is delayed to slow down password guessing
attacks. `delay:` is a list of the delay durations. `delay: [1, 1, 5]` is the
default. This means:

- Delay for 1 second on the first failure
- Delay for 1 second on the second failure
- Delay for 5 seconds on any failure thereafter.

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "alpha",
    "role": "admin manager",
    "user": "alpha",
    "email": "gramex.guide+alpha@gmail.com"
}
```

### Forgot password

`DBAuth` has a forgot password feature. The minimal configuration required is
below:

```yaml
url:
  auth/db:
    pattern: /db
    handler: DBAuth
    kwargs:
        url: sqlite:///$YAMLPATH/auth.db
        table: users
        user:
            column: user
        password:
            column: password
        forgot:
            email_from: gramex-guide-gmail    # Name of the email service to use for sending emails
```

Just add a `forgot:` section with an `email_from:` parameter that points to the
same of an [email service](../email/).

The `forgot:` section takes the following parameters (default values are shown):

- `key: forgot`. By default, the forgot password URL uses a `?forgot=`. You can
  change that to any other key.
- `email_from: ...`. This is mandatory. Create an [email service](../email/) and
  mention the name of the service here. Forgot password emails will be sent via
  that service. (The sender name will be the same as that service.)
- `email_as: null`. If the From: email ID is different from the user in the
  `email_as:` service, use `email_as: user@example.org`. When using GMail, you
  should [allow sending email from a different address][send-as]
- `minutes_to_expiry: 15`. The number of minutes after which the token expires.
- `template: forgot.template.html`. The name of the template file used to render
  the forgot password page. Copy [forgot.template.html][forgot-template] and
  modify it as required. Specify the path to your template in `template:`
- `arg: email`. The forgot password template allows the user to enter an email
  or a user ID. The name of the email argument is configured by `arg:`. (The
  name of the user ID argument is already specified in `user.arg`)
- `email_column: email`. The name of the email column in the database table.
- `email_subject: ...`. The subject of the email that is sent to the user. This
  is a template similar to `email_text`.
- `email_body: ...`. The text of the email that is sent to the user.
  - This is a template string where `{reset_url}` is replaced with the password reset URL.
  - You can use any database table columns as keys. For example, if the user ID is
    in the `user` column, `email_text: {user} password reset link is {reset_url}`
    will replace `{user}` with the value in the user column, and `{reset_url}`
    with the actual password reset URL.
  - Note: `email_text` is an alias for `email_body`.
- `email_bodyfile: contents.txt`. Load `email_body` from a file instead of writing it in
  `gramex.yaml`
- `email_html: ...`. HTML content of the email. If both `email_html` and `email_body` are
  specified, the email contains both parts, with HTML taking preference.
- `email_htmlbody: contents.html`: Load `email_html` from a file instead of writing it in
  `gramex.yaml`

Here is a more complete example:

```yaml
kwargs:
  forgot:
    email_from: gramex-guide-auth     # Name of the email service to use for sending emails
    key: forgot                       # ?forgot= is used as the forgot password parameter
    arg: email                        # ?email= is used to submit the email ID of the user
    minutes_to_expiry: 15             # Minutes after which the link will expire
    email_column: email               # The database column that contains the email ID
    email_subject: Gramex forgot password       # Subject of the email
    email_as: "S Anand <root.node@gmail.com>"   # Emails will be sent as if from this ID
    email_body: |
        This is an email from Gramex guide.
        You clicked on the forgot password like for user {user}.
        Visit this link to reset the password: {reset_url}
    email_html: |
        <p>Hi from <a href="https://gramener.com/gramex/guide/">Gramex Guide</a>.</p>
        <p>You clicked on the forgot password like for user {user}.</p>
        <p><a href="{reset_url}">Click here</a> to reset the password.</p>
```

::: example href=db source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Forgot password example

[forgot-template]: http://github.com/gramener/gramex/blob/master/gramex/handlers/forgot.template.html
[send-as]: https://support.google.com/mail/answer/22370?hl=en

### Sign up

`DBAuth` has a new user self-service sign-up feature. It lets users enter their
user ID, email and other attributes. It generates a random password and mails
their user ID (using the [forgot password](#forgot-password) feature).

Here is a minimal configuration. Just add a `signup: true` section to enable signup.

```yaml
url:
  auth/db:
    pattern: /db
    handler: DBAuth
    kwargs:
      url: sqlite:///$YAMLPATH/auth.db
      table: users
      user:
        column: user
      password:
        column: password
      forgot:
        email_from: gramex-guide-gmail
      signup: true            # Enable signup
```

::: example href=db?signup source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Sign-up example

You can pass additional configurations to sign-up. For example:

```yaml
signup:
  key: signup                     # ?signup= is used as the signup parameter
  template: $YAMLPATH/signup.html # Use this signup template
  columns:                        # Mapping of URL query parameters to database columns
    name: user_name               # ?name= is saved in the user_name column
    gender: user_gender           # ?gender= is saved in the user_gender column
                                  # Other than email, all other columns are ignored
  validate: app.validate(args)    # Optional validation method is passed handler.args
                                  # This may raise an Exception or return False to stop.
```

- `key: signup` shows the signup form when the URL has a `?signup`. `key: signup`
  is the default.
- `template: signup.template.html`. The name of the template file used to render
  the signup page. Copy [signup.template.html][signup-template] and
  modify it as required. Specify the path to your template in `template:`
- `columns: {}`. The URL query parameters that should be added as columns the
  auth DB. E.g., `columns: {age: user_age}` will save the `<input name="age">`
  value in the column `user_age`.
- `validate: expression(handler, args)`. Runs any expression using `handler`
  and/or `args` as pre-defined variables. If the result is false-y, raises a HTTP
  400: Bad Request. The result is passed to the template as an `error` variable.

[signup-template]: http://github.com/gramener/gramex/blob/master/gramex/handlers/signup.template.html


## Integrated auth

**Available in Gramex Enterprise**.
IntegratedAuth allows Windows domain users to log into Gramex automatically if
they've logged into Windows.

To set this up, run Gramex on a Windows domain server.
[Create one if required](https://www.youtube.com/watch?v=o6I77cz4EE4).
Then use this configuration:

```yaml
auth/integrated:
    pattern: /$YAMLURL/integrated
    handler: IntegratedAuth
```

The user must first trust this server by enabling
[SSO on IE/Chrome](http://docs.aws.amazon.com/directoryservice/latest/admin-guide/ie_sso.html)
or [on Firefox](https://wiki.shibboleth.net/confluence/display/SHIB2/Single+sign-on+Browser+configuration).
Then visiting `/integrated` will automatically log the user in.

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    "id": "EC2-175-41-170-\\Administrator", // same as domain\username
    "domain": "EC2-175-41-170-",            // Windows domain name
    "username": "Administrator",            // Windows user name
    "realm": "WIN-8S90I248M00"              // Windows hostname
}
```

## SAML Auth

**Available in Gramex Enterprise**.
SAML auth uses a [SAML](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language)
auth provided to log in. For example ADFS (Active Directory Federation Services)
is a SAML auth provider.

First, install the [onelogin SAML module](https://github.com/onelogin/python3-saml):

```bash
# Replace the below line with the relevant version for your system
pip install https://ci.appveyor.com/api/buildjobs/gt2betq01a5xogo7/artifacts/xmlsec-1.3.48.dev0-cp36-cp36m-win_amd64.whl
pip install python3-saml
```

This configuration enables SAML authentication.

```yaml
auth/saml:
  pattern: /$YAMLURL/login
  handler: SAMLAuth
    kwargs:
      xsrf_cookies: false                   # Disable XSRF. SAML is XSRF-proof
      sp_domain: 'app.client.com'           # Public domain name of the gramex app
      https: true                           # true if app.client.com is on https
      custom_base_path: $YAMLPATH/saml/     # Path to settings.json and certs/
      lowercase_encoding: True              # True for ADFS driven SAML auth
```

`custom_base_path` points to a directory with these files:

- `settings.json`: Provides details of the Identity Provider (IDP, i.e. the
  server that logs in users) and Service Provider (your app). For ADFS, this can
  be extracted using the ADFS's `metadata.xml`. Here is a minimal
  [settings.json](saml/settings.json)
- `advanced_settings.json`: Contains security params and oraganisation details.
  Here is a sample [advanced_settings.json](saml/advanced_settings.json).
  `contactPerson` and `organization` are optional.
- `certs/` directory that has the certificates required for encryption.
  - `metadata.crt`: Certificate to sign the metadata of the SP
  - `metadata.key`: Key for the above certificate

Once configured, visit the auth handler with `?metadata` added to view the
service provider metadata. In the above example, this would be
`https://app.client.com/login?metadata`.

**Note:** Provide the SP metadata URL to the client for relay configuration
along with required claims (i.e. fields to be returned, such as `email_id`,
`username`, etc.)


## OAuth2

**Available in Gramex Enterprise**.
Gramex lets you log in via any OAuth2 providers. This includes:

- [Facebook](https://developers.facebook.com/docs/facebook-login)
- [Github](https://developer.github.com/apps/building-oauth-apps/)
- [Gitlab](https://docs.gitlab.com/ce/api/oauth2.html)
- [Google](https://developers.google.com/identity/protocols/OAuth2)
- [Instagram](https://www.instagram.com/developer/authentication/)
- [LinkedIn](https://developer.linkedin.com/docs/oauth2)
- [SalesForce](https://goo.gl/hVzQYL)
- [StackOverflow](https://api.stackexchange.com/docs/authentication)

Here is a sample configuration for Gitlab:

```yaml
url:
  auth/gitlab:
    pattern: /$YAMLURL/gitlab
    handler: OAuth2
    kwargs:
      # Create app at https://code.gramener.com/admin/applications/
      client_id: 'YOUR_APP_CLIENT_ID'
      client_secret: 'YOUR_APP_SECRET_ID'
      authorize:
        url: 'https://code.gramener.com/oauth/authorize'
      access_token:
        url: 'https://code.gramener.com/oauth/token'
        body:
          grant_type: 'authorization_code'
      user_info:
        url: 'https://code.gramener.com/api/v4/user'
        headers:
          Authorization: 'Bearer {access_token}'
```

::: example href=gitlab source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Gitlab OAuth2 example

It accepts the following configuration:

- `client_id`: Create an app with the OAuth2 provider to get this ID
- `client_secret`: Create an app with the OAuth2 provider to get this ID
- `authorize`: Authorization endpoint configuration:
  - `url`: Authorization endpoint URL
  - `scope`: an optional a list of scopes that determine what you can access
  - `extra_params`: an optional dict of OAuth2 parameters
- `access_token`: Access token endpoint configuration
  - `url`: Access token endpoint URL
  - `session_key`: optional key in session to store access token information. default: `access_token`
  - `headers`: optional dict containing HTTP headers to pass to access token URL. By default, sets `User-Agent` to `Gramex/<version>`.
  - `body`: optional dict containing arguments to pass to access token URL (e.g. `{grant_type: authorization_code}`)
- `user_info`: Optional user information API endpoint
  - `url`: API endpoint to fetch URL
  - `headers`: optional dict containing HTTP headers to pass to user info URL. e.g. `Authorization: 'Bearer {access_token}'`. Default: `{User-Agent: Gramex/<version>}`
  - `method`: HTTP method to use. default: `GET`
  - `body`: optional dict containing POST arguments to pass to user info URL
  - `user_id`: Attribute in the returned user object that holds the user ID. This is used to identify the user uniquely. default: `id`
- `user_key`: optional key in session to store user information. default: `user`

::: example href=github source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Gitlab OAuth2 example

::: example href=googleoauth2 source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Google OAuth2 example

### Azure Active Directory

Here is a sample configuration for Azure Active Directory:

```yaml
url:
  auth/aad:
    pattern: /$YAMLURL/login
    handler: OAuth2
    kwargs:
      client_id: '1239bdca-----------------------------'
      client_secret: 'Pyum-----------------------------'
      authorize:
        url: 'https://login.microsoftonline.com/{TENANT_ID}/oauth2/authorize'
      access_token:
        url: 'https://login.microsoftonline.com/{TENANT_ID}/oauth2/token'
        body:
          grant_type: 'authorization_code'
          resource: https://graph.microsoft.com/
      user_info:
        url: 'https://graph.microsoft.com/v1.0/me/'
        headers:
          Authorization: 'Bearer {access_token}'
          Accept: 'application/json'
          Content-Type: 'application/json'
```

## Email Auth

[Video](https://youtu.be/3og1HiU6Iik){.youtube}

**Available in Gramex Enterprise**.
[EmailAuth](#emailauth) allows any user with a valid email ID to log
in. This is a convenient alternative to [DBAuth](#dbauth). Users do not need to
sign-up. Administrators don't need to provision accounts. Gramex can [restrict
access](#authorization) just based on just their email ID or domain.

EmailAuth sends a one-time password (OTP) via email for users to log in. It does
not store any password permanently.

This requires an [email service](../email/). Here is a sample configuration:

```yaml
email:
  gramex-guide-gmail:
    type: gmail                     # Type of email used is GMail
    email: gramex.guide@gmail.com   # Generic email ID used to test e-mails
    password: tlpmupxnhucitpte      # App-specific password created for Gramex guide

url:
  login:
    pattern: /$YAMLURL/login
    handler: EmailAuth                # Use email based authentication
    kwargs:
      # Required configuration
      service: gramex-guide-gmail     # Send messages using this provider
      # Send the strings below as subject and body. You can use variables
      # user=email ID, password=OTP, link=one-time login link
      subject: 'OTP for Gramex'
      body: |
        The OTP for {user} is {password}

        Visit {link}
      html: |
          <p>The OTP for {user} is {password}.</p>
          <p><a href="{link}">Click here to log in</a></p>

      # Optional configuration. The values shown below are the defaults
      minutes_to_expiry: 15     # Minutes after which the OTP will expire
      size: 6                   # Number of characters in the OTP
      instantlogin: false       # Fetching login link instantly logs user in
                                # False is best for clients like Outlook that pre-fetch links
      user:
          arg: user             # ?user= contains the user email
      password:
          arg: password         # ?password= contains the OTP
      redirect:                 # After logging in, redirect the user to:
          query: next           #      the ?next= URL
          header: Referer       # else the Referer header (i.e. page before login)
          url: .                # else the home page of current directory
```

::: example href=email source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Email auth example

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    'id': 's.anand@gramener.com',         // email ID of the user
    'email': 's.anand@gramener.com',
    'hd': 'gramener.com'
}
```

Specific users can also be authorized. For example, this allows
all users from `@ibm.com` and `@pwc.com`, as well as `admin@example.org`.

**Note** membership roles are added to  **other** consuming endpoints in `gramex.yaml`,
and **not** the `EmailAuth` endpoint. For more information see [roles](#roles)

```yaml
url:
  login:
    pattern: /$YAMLURL/login
    handler: EmailAuth                # Use email based authentication
    kwargs:
      service: gramex-guide-gmail     # Send messages using this provider
      subject: 'OTP for Gramex'
      body: |
        The OTP for {user} is {password}

        Visit {link}
      redirect:               # After logging in, redirect the user to:
        query: next           # the ?next= URL
        header: Referer       # else the Referer: header (i.e. page before login)
        url: .                # else the home page of current directory

  dashboard:
    pattern: ...
    handler: FileHandler     # Any valid Handler
    kwargs:
      ...
      auth:  # This defines membership roles for a particular endpoint
        membership:
          - {hd: [ibm.com, pwc.com]}
          - {email: [admin@example.org]}
```

To customize the email message that's sent, you can change:

- `body`: The plain text email message sent to the user
- `html`: The HTML email message sent to the user. This overrides `body` if the email client supports HTML
- `bodyfile`: Load the `body` from a file instead of typing in YAML. This overrides `body`
- `htmlfile`: Load the `html` from a file instead of typing in YAML. This overrides `html`

The email message is formatted as a Python string (i.e. `{variable}` is replaced with the value of
`variable`). You can use these variables in the message:

- `user`: The email ID of the user
- `password`: The one-time password
- `link`: The one-time login link

To customize the login page, you can add a `template:` pointing to a Tornado template.
[Here is a sample](https://github.com/gramener/gramex-guide/blob/master/auth/emailauth.template.html).
You can use these variables in the template:

- `handler`: the handler. `handler.kwargs` has the EmailAuth configuration
- `email`: the user's email ID (if entered)
- `otp`: the one-time password (if entered)
- `error`: `None` if there is no error. Else, it has one of these values:
  - `'not-sent'` if the OTP could not be sent. `msg` has the Exception
  - `'wrong-pw'` if the OTP is wrong. `msg` has a string error
- `msg`: sent only if `error` is not `None`. It contains a textual descripton of the error.
- `redirect`: has the original URL to redirect the user back to after login
  - Use `<input type="hidden" name="{{ redirect['name'] }}" value="{{ redirect['value'] }}">`
    in a form to redirect the user back to their original URL
  - `redirect['name']` is typically `next`, creating a `?next=` query string
  - `redirect['value']` is the URL to redirect the user to

::: example href=emailtemplate source=https://github.com/gramener/gramex-guide/blob/master/auth/emailauth.template.html
    Email auth template example

## SMS Auth

**Available in Gramex Enterprise**.
SMSAuth sends a one-time password (OTP) via SMS for users to log in.
There is no permanent password mechanism.

This requires a working [SMS service](../sms/). Here is a sample configuration:

```yaml
sms:
  exotel-sms:               # Create an SMS service
    type: exotel            # using Exotel
    sid: ...                # Enter your Exotel SID
    token: ...              # and your Exotel Token

url:
  login:
    pattern: /$YAMLURL/login
    handler: SMSAuth            # Use SMS based authentication
    kwargs:
      # Required configuration
      service: exotel-sms       # Send messages using this provider
      # Send this string with the %s replaced with the OTP.
      # The string should only contain one %s
      message: 'Your OTP is %s. Visit https://bit.ly/sms2auth'
      redirect:                 # After logging in, redirect the user to:
          query: next           #      the ?next= URL
          header: Referer       # else the Referer: header (i.e. page before login)
          url: .                # else the home page of current directory

      # Optional configuration. The values shown below are the defaults
      minutes_to_expiry: 15     # Minutes after which the OTP will expire
      size: 6                   # Number of characters in the OTP
      sender: gramex            # Sender ID. Works in some countries
      template: $YAMLPATH/auth.sms.template.html    # Login template
      user:
          arg: user             # ?user= contains the mobile number
      password:
          arg: password         # ?password= contains the OTP
```

::: example href=sms source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    SMS auth example

**Note**: the example above relies on free credits available from Exotel. These
may have run out.

The [user attributes](#user-attributes) in `handler.current_user` look like this:

```js
{
    'id': '+919741552552',        // Mobile number
    'user': '+919741552552'
}
```

The login flow is:

1. User visits `/login`. App shows a template asking for phone (`user` field)
2. User submits phone number. Browser posts `?user=<phone>` to `/login`
3. App generates a new OTP (valid for `minutes_to_expiry` minutes)
4. App SMSs the OTP to the user phone number. On fail, ask for phone again
5. App shows form template with blank OTP (``password``) field
6. User submits OTP. Browser posts `?user=<phone>&password=<otp>` to `/login`
7. App checks if OTP is valid. If yes, logs user in and redirects
8. If OTP is invalid, shows form template with error

The `template:` is a Tornado template. [Here is an example][sms-auth-template].
When you write your own login template form, you can use these Python variables:

- `handler`: the handler. `handler.kwargs` has the configuration above
- `phone`: the phone number provided by the user
- `error`: `None` if there is no error. Else:
  - `'not-sent'` if the OTP could not be sent. `msg` has the Exception
  - `'wrong-pw'` if the OTP is wrong. `msg` has a string error
- `msg`: sent only if `error` is not `None`. See `error`


[sms-auth-template]: https://github.com/gramener/gramex/blob/master/gramex/handlers/auth.sms.template.html


## Log out

This configuration creates a [logout page](logout?next=.):

```yaml
auth/logout:
  pattern: /$YAMLURL/logout   # Map this URL
  handler: LogoutHandler      # to the logout handler
```

After logging in, users are re-directed to the `?next=` URL. You can change this
using the [redirection configuration](../config/#redirection).


# Authentication features

## Login templates

Several auth mechanisms (such as [SimpleAuth](#simple-auth),
[LDAPAuth](#ldap-auth), [DBAuth](#database-auth)) use a template to request the
user ID and password. This is a minimal template:

```html
<form method="POST">
    {% if error %}<p>error code: {{ error['code'] }}, message: {{ error['error'] }}</p>{% end %}
    <input name="user">
    <input name="password" type="password">
    <input type="hidden" name="_xsrf" value="{{ handler.xsrf_token }}">
    <button type="submit">Submit</button>
</form>
```

If `error` is set, we display the `error['code']` and `error['error']`.
Otherwise, we have 3 input fields:

- `user`: the user name. By default, the name of the field should be `user`, but this can be configured
- `password`: the password. The name of this field can also be configured
- `_xsrf`: the [XSRF][xsrf] token for this request.

## AJAX login

To using an AJAX request to log in, use this approach:

```js
$('form').on('submit', function(e) {
  e.preventDefault()
  $('#message').append('<div>Submitting form</div>')
  $.ajax('simple', {
    method: 'POST',
    data: $('form').serialize()
  }).done(function () {
    $('#message').append('<div>Successful login</div>')
  }).fail(function (xhr, status, message) {
    $('#message').append('<div>Failed login: ' + message + '</div>')
  })
})
```

**Note**: when using AJAX, `redirect:` does not change the main page. The
`.done()` method will get the contents of the redirected page as a HTML string.
To redirect on success, change `window.location` in `.done()`.

::: example href=ajax.html source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    AJAX auth example

## Login actions

You can add custom functions to any AuthHandler. These will run when a user succesfully logs in.

For example:

```yaml
url:
  login/google:
    pattern: /$YAMLURL/google
    handler: GoogleAuth
    kwargs:
      # ...
      action:                                       # After login,
        - function: admin.send_alert_mail(handler)  # Run custom functions
        - function: print(handler.current_user, 'logged in via Google')
```

You can also add your custom logout actions when the user successfully logs out to
[`LogoutHandler`](#log-out).

You can write your own custom functions. By default, the function will be passed the `handler`
object. `handler.current_user` will have the current user (even in `LogoutHandler`). You can define
any other `args` or `kwargs` to pass instead. The actions will be executed in order.


## Ensure single login session

When a user logs in, you can log them out from all other sessions on any other device using the
`ensure_single_session` [login action](#login-actions):

```yaml
url:
  login/google:
    pattern: /$YAMLURL/google
    handler: GoogleAuth
    kwargs:
      # ...
      action:
        - function: ensure_single_session   # Logs user out of all other sessions
```

You can add the `action:` section under the `kwargs:` of any Auth handler.


## User attributes

All handlers store the information retrieved about the user in `handler.current_user` as a
dictionary. This is also available, by default, as `handler.session['user']`.

The contents of `handler.current_user` varies across auth handlers. But you are guaranteed that
`handler.current_user['id']` is a unique user ID for that handler.

## Multiple logins

Typically, users log into only one AuthHandler, like DBAuth or GoogleAuth.

Sometimes you want to log into multiple login providers -- for example, to access the Google APIs.
For this, you can specify a `user_key: something`. This stores the user object in
`handler.session['something']` instead of `handler.session['user']`. For example:

```yaml
url:
  multi-google:
    pattern: /multi-google
    handler: GoogleAuth
    kwargs:
      user_key: google_user     # Store in handler.session['google_user']
      # ...

  multi-simple:
    pattern: /multi-simple
    handler: SimpleAuth
    kwargs:
      user_key: simple_user     # Store in handler.session['simple_user']
      # ...
```

You can access the [Google](#google-auth) user info using `handler.session['google_user']` and the
[SimpleAuth](#simple-auth) user info using `handler.session['simple_user']`.

**YOU CANNOT USE THIS FOR [AUTHORIZATION](#authorization)**. You're just linking the account -- not
logging in with the account. Permissions are based on `handler.session['user']` only. This is only
to link and capture *additional information* about the user.

To remove this link, write Python code anywhere (e.g. [FunctionHandler](../functionhandler/)) to
`del handler.session['google_user']` or `del handler.session['simple_user']`. For example:

```yaml
url:
  multi-unlink:
    pattern: /multi-unlink
    handler: FunctionHandler
    kwargs:
      function: '{key: handler.session.pop(key, None) for key in ["google_user", "simple_user"]}'
      redirect:
        url: /multi
```

::: example href=multi source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Multiple login example


## Logging logins

See [user logging](../config/#user-logging).

## Session expiry

Gramex sessions expire in 31 days by default. To modify this, add `session_expiry: <days>` to the
auth handler. For example:

```yaml
url:
  auth/expiry:
    pattern: /$YAMLURL/expiry
    handler: SimpleAuth               # session_expiry works on DBAuth, GoogleAuth, etc too
    kwargs:
      session_expiry: 0.0003          # Session expires in 26 seconds
      # ...
```

::: example href=expiry source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Session expiry example

This can be used to configure sessions that have a long expiry (e.g. for mobile
applications) or short expiry (e.g. for secure data applications.)

You can allow users to choose how long they want to stay logged in. For example:

```yaml
url:
  auth/customexpiry:
    pattern: /$YAMLURL/customexpiry
    handler: SimpleAuth
    kwargs:
      session_expiry:
        default: 4      # The default session expiry is set to 4 days
        key: remember   # When user logs in, check the value of ?remember=
        values:         # Set session expiry based on the value of ?remember=
          day: 1          # If ?remember=day, session expires in 1 day
          week: 7         # If ?remember=week, session expires in 7 days
          month: 31       # If ?remember=month, session expires in 31 days
```

::: example href=customexpiry source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Remember me example

## Inactive expiry

Gramex sessions expire if the user is inactive, i.e. has not accessed Gramex, for
a number of days.

By default, this is not enabled. Enable it via `session_inactive: <days>` on any auth handler.
When the user logs in, their session will expire unless they visit again within `<days>` days.
For example:

```yaml
url:
  auth/expiry:
    pattern: /$YAMLURL/expiry
    handler: SimpleAuth
    kwargs:
      session_inactive: 0.01        # Must visit every 0.01 days, i.e. 864 seconds, or 14.4 min
      # ...
  other/pages:
    # NOTE: You must ensure that other authenticated pages are not cached beyond that duration
    kwargs:
      headers:
        Cache-Control: private, max-age=864   # 864 seconds = 0.01 days
```

::: example href=inactive source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Inactive expiry example


## Change inputs

All auth handlers support a `prepare:` function. You can use this to modify the
inputs passed by the user. For example:

- If the username is encrypted and you want to decrypt it
- To add the domain name before the user, e.g. user types USERNAME, you change it to DOMAIN\USERNAME
- To restrict the login to specific IP addresses

The YAML configuration is:

```yaml
url:
  auth/login:
    pattern: /$YAMLURL/login/
    handler: ...                # Any auth handler can be used
    kwargs:
      ...                       # Add parameters for the auth handler
      prepare: module.function(args, handler)
```

You can create a `module.py` with a `function(args, handler)` that modifies the
arguments as required. For example:

```python
def function(args, handler):
    if handler.request.method == 'POST':
        args['user'][0] = 'DOMAIN\\' + args['user'][0]
        args['password'][0] = decrypt(args['password'][0])
        # ... etc
```

The changes to the arguments will be saved in `handler.args`, which all auth
handlers use. (NOTE: These changes need not affect `handler.get_argument()`.)


## Recaptcha

Auth handlers support a `recaptcha:` configuration that checks CAPTCHA
validation via [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3).

reCAPTCHA v3 checks if a login is legitimate **without user interaction**, i.e.
without prompting the user to take any action. This is a frictionless mechanism.
To set this up, [register reCAPTCHA v3 keys here](https://g.co/recaptcha/v3),
then add this configuration:

```yaml
url:
  auth/login:
    pattern: /$YAMLURL/login/
    handler: ...                # Any auth handler that supports templates
    kwargs:
      ...
      recaptcha:                # Add this section for recaptcha
        key: YOUR-RECAPTCHA-KEY
        secret: YOUR-RECAPTCHA-SECRET
```

If you use your own login `template:`, add this code at the bottom of the page:

```html
{% if 'recaptcha' in handler.kwargs %}
  {% set recaptcha = handler.kwargs.recaptcha %}
  <script src="https://www.google.com/recaptcha/api.js?render={{ recaptcha.key }}"></script>
  <script>
    grecaptcha.ready(function () {
      grecaptcha.execute('{{ recaptcha.key }}', { action: '{{ recaptcha.action }}' }).then(function (token) {
        document.querySelector('input[name="recaptcha"]').value = token
      })
    })
  </script>
{% end %}
```

Try this example, and observe the reCAPTCHA logo at the bottom-right of the screen:

::: example href=recaptcha source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Recaptcha example

## Lookup attributes

Each auth handler creates a `handler.session['user']` object. The keys in this
object can be extended from any data source. For example, create a `lookup.xlsx`
file with this data:

| user  | gender | role     |
|-------|--------|----------|
| alpha | male   | manager  |
| beta  | female | employee |

Add a `lookup` section to any auth handler and specify a `url: lookup.xlsx`. For
example:

```yaml
url:
  auth/lookup-attributes:
    pattern: /$YAMLURL/lookup-attributes
    handler: SimpleAuth
    kwargs:
      credentials:
        alpha: alpha
        beta: beta
      lookup:
        url: $YAMLPATH/lookup.xlsx      # Look for the attribute in this file
        sheet_name: Sheet1              # under this sheet
        id: user                        # under this column
```

Now, when the user logs in as `alpha`, the `handler.current_user` object has the `gender` and `role` attributes:

```js
{
    "id": "alpha",
    "gender": "male",
    "role": "employee",
    // any other attributes that are already defined
}
```

The keys under `lookup:` are:

- `url`: Specifies the table that has the custom attributes for each user. This
  can be a file path or database URL, just like [FormHandler](../formhandler/).
  You can specify parameters like `delimiter:` for CSV files, `sheet_name:` for
  Excel files, `table:` for database URLs, etc.
- `id`: Gramex will search for the user ID `handler.current_user['id']` in this
  column (within the table specified by `url`)

All columns in the Excel sheet are added as attributes. But if a value is NULL
(not an empty string), it is ignored. In Excel, deleting a cell makes it NULL.

By default, this looks up the first sheet. You can specify an alternate sheet
using `sheet_name: ...`. For example:

```yaml
        lookup:
            url: $YAMLPATH/lookup.xlsx
            sheet_name: userinfo            # Specify an alternate sheet name
            id: user
```

Instead of Excel files, you can use databases by specifying a SQLAlchemy URL
just like for [FormHandler](../formhandler/).

```yaml
    lookup:
        url: sqlite:///$YAMLPATH/database.sqlite3
        table: lookup
```

::: example href=lookup-attributes source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    Lookup attributes example


## Add Attribute Rules

Auth handlers support a `rules` kwarg which allows users to specify rules which
can modify user attributes on the fly. For example, the following spec

```yaml
url:
  auth/simple:
    pattern: /$YAMLURL/login
    handler: SimpleAuth
    kwargs:
      credentials:
        alpha:
          password: alpha
          email: jane.doe@gramener.com
          role: admin
          location: BLR
        beta:
          password: beta
          email: john.doe@gmail.com
          role: intern
          location: MUM
      rules:
        url: $YAMLPATH/rules.csv
```

declares two users, with three attributes each - email, role and location. The
rules for modifying these attributes can be composed in a file named `rules.csv`
as follows:

| selector  |   pattern   | field    | value |
|-----------|-------------|----------|-------|
| email     | *@gmail.com | role     | guest |
| role      | admin       | location | NYC   |

These rules can be read as follows:

1. If the "email" attribute of a user matches the pattern `*@gmail.com`, then
   set their "role" attribute to guest, AND
2. if the "role" attribute of a user matches the pattern "admin", then set their
   "location" attribute to NYC.

In the case of the users specified above, after logging in, `beta` would see
their role changed to "guest" from "intern", and the user `alpha` would see
their location changed to "NYC" from "BLR".

Generally, for any auth handler, any existing user attribute can be used in the
"selector" field, and if the value of that attribute matches the specified "pattern",
then the attribute mentioned in the "field" is modified to the "value".

::: example href=attr-rules source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    User attributes rules Example

# Automated logins

Gramex has two mechanisms to automate logins: [one-time passwords](#otp) and [encrypted users](#encrypted-user).

## OTP

Handlers support a `handler.otp(expire=seconds)` function. This returns a
one-time password string linked to the *current user*. When you send a request
with a `X-Gramex-OTP: <otp>` header or a `?gramex-otp=<otp>` query parameter,
that session is automatically linked to the same user.

::: example href=otp source=https://github.com/gramener/gramex-guide/blob/master/auth/gramex.yaml
    OTP example


## Encrypted user

You can mimic a user by passing a `X-Gramex-User` HTTP header. This fetches a
`url` as if `user@example.org` with `manager` role was logged in:

```python
user = {'id': 'user@example.org', 'role': 'manager')
r = requests.get(url, headers={
    'X-Gramex-User': tornado.web.create_signed_value(cookie_secret, 'user', json.dumps(user))
})
```

`cookie` must be the value of `app.settings.cookie_secret` in `gramex.yaml`.
You can fetch this in gramex as `gramex.service.app.settings['cookie_secret']`.


# Authorization

By default, all handlers are publicly accessible to all.

To restrict pages to specific users, use the `kwargs.auth` configuration. This
works on all Gramex handlers (that derive from `BaseHandler`).

```yaml
url:
  auth/must-login:
    pattern: /$YAMLURL/must-login
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/secret.html
      auth: true
```

`auth: true` just requires that you must log in. In this example, you can access
this sample page "[must-login](must-login)" only if you are logged in.

**v1.64**: To protect an entire app, i.e. **add auth on all pages**, use:

```yaml
app:
  auth: true    # All pages require login -- including CSS/images on login page!
```

**Use with caution**. This will be used as the default auth on *every* handler.
The CSS/JS/images on your login page won't appear unless you set `auth: false` on those URLs.

Note: Any `auth:` on an `AuthHandler` is ignored. (That's asking users to log into a login page!)

You can restrict who can log in using [roles](#roles) or any other condition.

## Login URLs

By default, this will redirect users to `/login/`. This is configured in the `app.settings.login_url` like this:

```yaml
app:
  settings:
    login_url: /$YAMLURL/login/   # This is the default login URL
```

You need to either map `/login/` to an auth handler, or change the `login_url`
to your auth handler URL.

Each URL can choose its own login URL. For example, if you
[logout](logout?next=.) and visit [use-simple](use-simple), you will always be
taken to `auth/simple` even though `app.settings.login_url` is `/login/`:

```yaml
url:
  auth/protected-page:
    pattern: /$YAMLURL/protected-page
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/protected-page.html
      auth:
        login_url: /$YAMLURL/login  # Redirect users to this login page
```

For AJAX requests (that send an [X-Requested-With header](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Common_non-standard_request_fields))
redirection is disabled - since AJAX cannot redirect the parent page. So:

```js
$.ajax('protected-page')
  .done(function() { ... })     // called if protected page returns valid data
  .fail(function() { ... })     // called if auth failed.
```

To manually disable redirection, set `login_url: false`.

## Roles

`auth:` can check for membership. For example, you can access [en-male](en-male)
only if your gender is `male` and your locale is `en` or `es`. (To test it,
[logout](logout?next=.) and [log in via Google](google?next=.).)

```yaml
    # Add this under the kwargs: of ALL pages you want to restrict access to
    auth:
      membership:           # The following user object keys must match
        gender: male      # user.gender must be male
        locale: [en, es]  # user.locale must be en or es
        email: [..., ...] # user.email must be in in this list
```

If the `user` object has nested attributes, you can access them via `.`. For
example, `attributes.cn` refers to `handlers.current_user.attributes.cn`.

You can specify multiple memberships that can be combined with AND or OR. This example allows (Females from @gramener.com) OR (Males with locale=en) OR (beta@example.org):

```yaml
    # Add this under the kwargs: of ALL pages you want to restrict access to
    auth:
      membership:
        -                           # First rule
          gender: female                # Allow all women
          hd: [ibm.com, pwc.com]        # AND from ibm.com or pwc.com
        -                           # OR Second rule
          gender: male                  # Allow all men
          locale: [en, es]              # with user.locale as "en" or "es"
        -                           # OR Third rule
          email: beta@example.org       # Allow this user
```

`auth:` lets you define conditions. For example, you can access [dotcom](dotcom)
only if your email ends with `.com`, and access [dotorg](dotorg) only if your
email ends with `.org`.

```yaml
url:
  auth/dotcom:
    pattern: /$YAMLURL/dotcom
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/secret.html
      auth:
        condition:                          # Allow only if condition is true
          function: handler.current_user.email.endswith('.com')
  auth/dotorg:
    pattern: /$YAMLURL/dotorg
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/secret.html
      auth:
        condition:                          # Allow only if condition is true
          function: handler.current_user.email.endswith('.org')
```

You can specify any function of your choice. The function must return (or yield)
`True` to allow the user access, and `False` to raise a HTTP 403 error.

To repeat auth conditions across multiple handlers, see [Reusing Configurations](#reusing-configurations).

## Protect all pages

To add access control to the entire application, use:

```yaml
handlers:
  BaseHandler:
    # Protect all pages in the application. All auth: configurations allowed
    auth:
      login_url: /$YAMLPATH/login/
```

This is the same as adding the `auth: ...` to every handler in the application.

You can over-ride this `auth:` in a handler.

You can also apply this to specific handlers. For example, this protects all
[FormHandlers](../formhandler/) and [FileHandlers](../filehandler/):

```yaml
handlers:
  FormHandler: {auth: true}
  FileHandler: {auth: true}
```

## Templates for unauthorized

When a user is logged in but does not have access to the page (because of the
`auth` condition or membership), you can display a friendly message using
`auth.template`. Visit [unauthorized-template](unauthorized-template) for an
example. You will see the contents of `403-template.html` rendered.

```yaml
url:
  auth/unauthorized-template:
    pattern: /$YAMLURL/unauthorized-template
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/secret.html
      auth:
        membership:                             # Pick an unlikely condition to test template
          donkey: king                          # This condition will usually be false
        template: $YAMLPATH/403-template.html   # Render template for forbidden users
```
