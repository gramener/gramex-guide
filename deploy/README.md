---
title: Deployment patterns
prefix: Deploy
...

[TOC]

Development and deployment are usually on different machines with different
configurations, file paths, database locations, etc. All of these can be
configured in `gramex.yaml` using pre-defined variables.

## Deployment checklist

- Set up Gramex.
    - Get permission to install Gramex from the IT team.
    - If you have Internet access, use the [default installation](https://learn.gramener.com/guide/install/)
      Else use the [offline install](https://learn.gramener.com/guide/install/#offline-install).
- Set up the project.
    - Use Continuous Integration via [Gitlab CI](https://docs.gitlab.com/ee/ci/),
      [Travis](https://travis-ci.com/), or [Github Actions](https://github.com/features/actions) to
      deploy commits
    - Else, use rsync, SFTP, Windows Remote Desktop, or whatever the IT team recommends
    - [Use Gramex Secrets to keep passwords and access tokens safe](#secrets)
- Make the app run automatically on startup as a service
    - On Windows, [set up Gramex as a Windows Service](#windows-service)
    - On Linux, [set up Gramex as a Linux service](#linux-service)
- Set up the domain.
    - Decide the URL as a new domain (e.g. `projectname.com`), subdomain (e.g.
      `projectname.clientname.com`), or path (e.g. `clientname.com/projectname/`)
    - For a new domain / subdomain request the client IT team or the Gramener IT team
    - Point its `A` record to your server IP address, or its `CNAME` record to your server's domain name
      (e.g. `gramener.com`)
    - [Set up HTTPS using certbot](https://certbot.eff.org/)
- [Set up a reverse proxy](#proxy-servers) to expose the app on port 80
    - Prefer [nginx](#nginx-reverse-proxy). It's faster than [Apache](#apache-reverse-proxy)
    - [Use relative URLs](#relative-url-mapping) for the app to work locally and on the serer
- [Troubleshoot common errors](#common-errors)

## Secrets

**v1.64**. Passwords, access tokens, and other sensitive information must be protected. There are 3 ways of doing this.

### gramex.yaml secrets

If your repository and server are fully secured (i.e. only authorized people can access them) add secrets to `gramex.yaml`. For example:

```yaml
url:
  login/google:
    pattern: /$YAMLURL/login/
    handler: GoogleAuth
    kwargs:
      key: YOURKEY
      secret: YOURSECRET
```

### .secrets.yaml

If you can edit files on the server (directly, or via CI), add a `.secrets.yaml` file with your secrets, like this:

```yaml
PASSWORD: your-secret-password
GOOGLE_AUTH_SECRET: your-secret-key
TWITTER_SECRET: your-secret-key
# ... etc
```

These variables are available in `gramex.yaml` as `$PASSWORD`, `$GOOGLE_AUTH_SECRET`, `$TWITTER_SECRET`, etc. For example:

```yaml
url:
  login/google:
    pattern: /$YAMLURL/login/
    handler: GoogleAuth
    kwargs:
      key: add-your-key-directly    # This is not a secret
      secret: $GOOGLE_AUTH_SECRET   # This comes from .secrets.yaml
```

**NOTE**: Don't commit the `.secrets.yaml` file. Everyone who can access the repo can see the secret.

### .secrets.yaml URLs

If you can't edit files on the server, you can pick up *encrypted* secrets from a public URL in 3 steps.

1. Encrypt your secrets using this **[secret encryption tool](secrets)**
2. Store the encrypted secret anywhere publicly (e.g. at [PasteBin](https://pastebin.com/) or [Github](https://gist.github.com/))
3. Add the URL and the encryption secret, in `.secrets.yaml`:

```yaml
SECRETS_URL: https://pastebin.com/raw/h75e4mWx
SECRETS_KEY: SECRETKEY     # Replace with your secret key
```

When Gramex loads, it loads `SECRETS_URL` (ignoring comments beginning with `#`) and decrypts it using your `SECRETS_KEY`. The above URL has 2 secrets: `REMOTE_SECRET1` and `REMOTE_SECRET2`, which you can use as variables.

This lets you securely modify the secrets without accessing the server.

### Deploying secrets

**v1.64**.When deploying via Gitlab CI, add your secrets as [environment variables](https://docs.gitlab.com/ee/ci/variables/) under Settings > CI / CD > Variables. Then add this line to your `.gitlab-ci.yml` deployment script:

```yaml
script:
  # List environment variables to export
  - 'secrets KEY1 KEY2 ... > .secrets.yaml'
  # Continue with your deployment script
```

## Windows Service

**v1.23**.
To set up a Gramex application as a service, run PowerShell or the Command Prompt **as administrator**. Then:

```bash
cd D:\path\to\your\app
gramex service install
```

To start / stop the service, go to Control Panel > Administrative Tools > View Local Services. You
can also do this from the command prompt **as administrator**:

```bash
gramex service start
gramex service stop
```

Once started, the application is live at the port specified in your
`gramex.yaml`, which defaults to 9988, so visit <http://localhost:9988/>.

Here are additional install options:

```bash
gramex service install
    --cwd  "C:/path/to/application/"    # Run Gramex in this directory
    --user "DOMAIN\USER"                # Optional user to run as
    --password "user-password"          # Required if user is specified
    --startup manual|auto|disabled      # Default is manual
```

The user domain and name are stored as environment variables `USERDOMAIN` and
`USERNAME`. Run `echo %USERDOMAIN% %USERNAME%` on the Command Prompt to see them.

You can update these parameters any time via:

```bash
gramex service update --...             # Same parameters as install
```

To uninstall the service, run:

```bash
gramex service remove
```

Service logs can be viewed using the Windows Event Viewer. Gramex logs are at
`%LOCALAPPDATA%\Gramex Data\logs\` unless over-ridden by `gramex.yaml`.

To create multiple services running at different directories or ports, you can
create one or more custom service classes in `yourproject_service.py`:

```python
import gramex.winservice

class YourProjectGramexService(gramex.winservice.GramexService):
    _svc_name_ = 'YourServiceID'
    _svc_display_name_ = 'Your Service Display Name'
    _svc_description_ = 'Description of your service'
    _svc_port_ = 8123               # optional custom port

if __name__ == '__main__':
    import sys
    import logging
    logging.basicConfig(level=logging.INFO)
    YourProjectGramexService.setup(sys.argv[1:])
```

You can now run:

```bash
python yourproject_service.py install --cwd=...     # install the service
python yourproject_service.py remove                # uninstall the service
... etc ...
```

[anaconda]: http://continuum.io/downloads

### Windows administration

Here are some common Windows administration actions when deploying on Windows server:

- [Create a separate domain user to run Gramex](https://msdn.microsoft.com/en-in/library/aa545262(v=cs.70).aspx).
  Note: Domain users are different from [local users](https://msdn.microsoft.com/en-us/library/aa545420(v=cs.70).aspx)
- [Allow the domain user to log in via remote desktop](https://serverfault.com/a/483656/293853)
- [Give the user permission to run a service](https://support.microsoft.com/en-in/help/288129/how-to-grant-users-rights-to-manage-services-in-windows-2000)
  using [subinacl](http://go.microsoft.com/fwlink/?LinkId=23418).

### Windows scheduled tasks

To run a scheduled task on Windows, use PowerShell v3 ([ref](https://stackoverflow.com/a/8257779/100904)):

```bash
$dir = "D:\app-dir"
$name = "Scheduled-Task-Name"

Unregister-ScheduledTask -TaskName $name -TaskPath $dir -Confirm:$false -ErrorAction:SilentlyContinue
$action = New-ScheduledTaskAction –Execute "D:\anaconda\bin\python.exe" -Argument "$dir\script.py" -WorkingDirectory $dir
$trigger = New-ScheduledTaskTrigger -Daily -At "5:00am"
Register-ScheduledTask –TaskName $name -TaskPath $dir -Action $action –Trigger $trigger –User 'someuser' -Password 'somepassword'
```

An alternative for older versions of Windows / PowerShell is
[schtasks.exe](https://msdn.microsoft.com/en-us/library/windows/desktop/bb736357%28v=vs.85%29.aspx):

```bash
schtasks /create /tn your-task-name /sc HOURLY /tr "gramex"                # To run as current user
schtasks /create /tn your-task-name /sc HOURLY /tr "gramex" /ru SYSTEM     # To run as system user
```

## Linux service

[Set up a systemd service for Gramex](https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6). For example:

Copy this file into `/etc/systemd/system/your-app.service`

```ini
[Unit]
Description=Describe your Gramex application

[Service]
Type=simple
User=ubuntu                             # Run Gramex as this user, e.g. root
ExecStart=/path/to/gramex               # Path to Gramex script
WorkingDirectory=/path/to/your/app      # Path your your app
Restart=always                          # Restart app if Gramex exits
RestartSec=10                           # ... after 10 seconds

[Install]
WantedBy=multi-user.target              # Start app on reboot, after network is up
```

Now you can run:

```bash
sudo systemctl start your-app           # Start the service
sudo systemctl status your-app          # Check status of service
sudo systemctl stop your-app            # Stop the service
sudo systemctl restart your-app         # Restart the service
sudo systemctl enable your-app          # Ensure service starts on reboot
```

### Linux scheduled tasks

To run a scheduled task on Linux, use
[crontab](https://www.geeksforgeeks.org/crontab-in-linux-with-examples/)


## Proxy servers

Gramex is often deployed behind a reverse proxy. This allows a web server (like
nginx, Apache, IIS, Tomcat) to pass requests to different ports running different
applications.

Here's a checklist

1. **Pass original HTTP headers** to Gramex that capture the actual request the Proxy Server received.
   Gramex can redirect URLs appropriately based on this.
    - `Host`: Actual host the request was sent to (else proxy servers send localhost or an internal IP)
    - `X-Real-IP`: Remote address of the request (else proxy servers send their own IP)
    - `X-Scheme`: Protocol (HTTP/HTTPS) the request was made with (else proxy servers stay with HTTP)
    - `X-Request-URI`: Original request URL (else proxyservers send `http://localhost:port/...`)
2. **Enable websocket proxying** via
   [proxy_pass](http://nginx.org/en/docs/http/websocket.html) on nginx, and
   [mod_proxy_wstunnel](https://httpd.apache.org/docs/2.4/mod/mod_proxy_wstunnel.html) on Apache
3. **Increase proxy timeout** via
  [proxy_read_timeout](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout) on nginx, and
  [ProxyTimeout](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html#proxytimeout) on Apache.
4. **Increase upload file size** via
  [client_max_body_size](http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size) on nginx, and
  [LimitRequestBody](https://httpd.apache.org/docs/2.4/mod/core.html#limitrequestbody) on Apache.
5. **Set up proxy caching** via
   [proxy_cache](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache) on nginx, and
   [mod_cache](https://httpd.apache.org/docs/2.4/mod/mod_cache.html) on Apache.
6. **Enable HTTPS** via
   [certbot on nginx](https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx), and
   [certbot on Apache](https://certbot.eff.org/lets-encrypt/ubuntubionic-apache).

### nginx reverse proxy

Here is a minimal HTTP reverse proxy configuration:

```nginx
server {
    listen 80;                              # 80 is the default HTTP port
    server_name example.com;                # http://example.com/

    # Pass original HTTP headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Scheme $scheme;
    proxy_set_header X-Request-URI $request_uri;

    # Enable websocket proxying
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    # Increase proxy timeout
    proxy_read_timeout 300s;

    # Increase upload file size
    client_max_body_size 100m;

    location /project/ {                    # example.com/project/* maps to
        proxy_pass http://127.0.0.1:9988/;  # 127.0.0.1:9988/
        proxy_redirect ~^/ /project/;       # Redirects are sent back to /project/
    }
}
```

The use of the trailing slash makes a big difference in nginx.

```nginx
    location /project/ { proxy_pass http://127.0.0.1:9988/; }   # Trailing slash
    location /project/ { proxy_pass http://127.0.0.1:9988; }    # No trailing slash
```

The first maps `example.com/project/*` to `http://127.0.0.1:9988/*`.
The second maps it to `http://127.0.0.1:9988/project/*`.

If you have one Gramex running multiple applications under `/app1`, `/app2`,
etc, your config file will be like:

```nginx
    location /app1/ { proxy_pass http://127.0.0.1:8001; }
    location /app2/ { proxy_pass http://127.0.0.1:8001; }
    location /app3/ { proxy_pass http://127.0.0.1:8001; }
```

But if your have multiple Gramex instances at port 8001, 8002, etc, each running
an app under their `/`, your config file will be like:

```nginx
   location /app1/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_redirect ~^/ /app1/;
    }
    location /app2/ {
        proxy_pass http://127.0.0.1:8002/;
        proxy_redirect ~^/ /app2/;
    }
    location /app3/ {
        proxy_pass http://127.0.0.1:8003/;
        proxy_redirect ~^/ /app3/;
    }
```

To let nginx cache responses, use:

```nginx
        # Ensure /var/cache/nginx/ is owned by nginx:nginx with 700 permissions
        proxy_cache_path /var/cache/nginx/your-project-name
                         levels=1:2
                         keys_zone=your-project-name:100m
                         inactive=10d
                         max_size=2g;
        proxy_cache your-project-name;
        proxy_cache_key "$host$request_uri";
        proxy_cache_use_stale error timeout updating http_502 http_503 http_504;
```

To delete specific entries from the nginx cache, use
[nginx-cache-purge](https://github.com/perusio/nginx-cache-purge).


### Apache reverse proxy

First, enable thee relevant proxy modules. On Linux, run:

```bash
# Required modules
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers
```

On Windows, ensure that the Apache `httpd.conf` has the following lines:

```apache
LoadModule proxy_module          modules/mod_proxy.so
LoadModule proxy_http_module     modules/mod_proxy_http.so
LoadModule proxy_wstunnel        modules/mod_proxy_wstunnel.so
LoadModule rewrite_module        modules/mod_rewrite.so
LoadModule headers_module        modules/mod_headers.so
```

Here is a minimal HTTP reverse proxy configuration:

```apache
# Make sure you have a "Listen 80" in your configuration.
<VirtualHost *:80>
    ServerName example.com
    ProxyPass        /project/ http://127.0.0.1:9988/
    ProxyPassReverse /project/ http://127.0.0.1:9988/

    # Pass original HTTP headers
    ProxyPreserveHost On
    RequestHeader set X-Real-IP "%{REMOTE_ADDR}s"
    RequestHeader set X-Scheme "%{REQUEST_SCHEME}s"
    RequestHeader set X-Request-URI %{REQUEST_URI}s

    # Enable websocket proxying
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/project/(.*) "ws://127.0.0.1:9988/$1" [P,L]

    # Increase proxy timeout
    ProxyTimeout 300

    # Increase upload file size
    LimitRequestBody 102400000
</VirtualHost>
```

If you have one Gramex on port 8001 running multiple applications under `/app1`,
`/app2`, etc, your config file will be like:

```apache
ProxyPass        /app1/ http://127.0.0.1:8001/app1/
ProxyPassReverse /app1/ http://127.0.0.1:8001/app1/

ProxyPass        /app2/ http://127.0.0.1:8001/app2/
ProxyPassReverse /app2/ http://127.0.0.1:8001/app2/
```

But if your have multiple Gramex instances at port 8001, 8002, etc, each running
an app under their `/`, your config file will be like:

```apache
ProxyPass        /app1/ http://127.0.0.1:8001/
ProxyPassReverse /app1/ http://127.0.0.1:8001/

ProxyPass        /app2/ http://127.0.0.1:8002/
ProxyPassReverse /app2/ http://127.0.0.1:8002/
```

### Apache load balancing

To distribute load you can run multiple Gramex instances on different ports on a single server or
on multiple servers. You could configure Apache server to serve requests from multiple instances.

Here is a minimal configuration to use the Apache server for proxy load balancing:

```apache
LoadModule proxy_module                modules/mod_proxy.so
LoadModule headers_module              modules/mod_headers.so
LoadModule proxy_http_module           modules/mod_proxy_http.so
LoadModule authz_core_module           modules/mod_authz_core.so
LoadModule slotmem_shm_module          modules/mod_slotmem_shm.so
LoadModule proxy_balancer_module       modules/mod_proxy_balancer.so
LoadModule lbmethod_byrequests_module  modules/mod_lbmethod_byrequests.so

Listen 80

<VirtualHost *:80>
    # If the server name matches one of the following, apply the configuration
    ServerName domain.server.com
    ServerAlias localhost 127.0.0.1 otherdomain.server.com

    # Load balancer set up. Give the balancer a unique name
    <Proxy "balancer://balancer-name">
        # Add multiple instances to balance load across
        BalancerMember "http://127.0.0.1:9988" route=1
        BalancerMember "http://127.0.0.1:9989" route=2
        # The ROUTEID cookie ensures that the same session goes to the same backend
        ProxySet stickysession=ROUTEID
    </Proxy>

    ProxyPass "/" "balancer://balancer-name/"
    ProxyPassReverse "/" "balancer://balancer-name/"

    # ... add other Apache proxy configurations
</VirtualHost>
```

## Relative URL mapping

Your app may be running at `http://localhost:9988/` on your system, but will be
running at `http://server/app/` on the server. Use relative URLs and paths to
allow the application to work in both places.

Suppose `/gramex.yaml` imports all sub-directories:

```yaml
import: */gramex.yaml   # Import all gramex.yaml from 1st-level sub-directories
```

... and `/app/gramex.yaml` has:

```yaml
url:
    page-name:
        pattern: /$YAMLURL/page         # Note the /$YAMLURL prefix
        handler: FileHandler
        kwargs:
            path: $YAMLPATH/page.html   # Note the $YAMLPATH prefix
```

When you run Gramex from `/app/`, the pattern becomes `/page` (`$YAMLURL` is `.`)

When you run Gramex from `/`, the pattern becomes `/app/page` (`$YAMLURL` is `/app`)

The correct file (`/app/page.html`) is rendered in both cases because
`$YAMLPATH` points to the absolute directory of the YAML file.

You can modify the app name using `../new-app-name`. For example, this pattern
directs the URL `/new-app-name/page` to `/app/page.html`.

```yaml
    pattern: /$YAMLURL/../new-app-name/page
```

You also need this in [redirection URLs](https://learn.gramener.com/guide/config/#redirection).
See this example:

```yaml
url:
  auth/simple:
    pattern: /$YAMLURL/simple
    handler: SimpleAuth
    kwargs:
      credentials: {alpha: alpha}
      redirect: {url: /$YAMLURL/}        # Note the $YAMLURL here
```

Using `/$YAMLURL/` redirects users back to *this* app's home page, rather than
the global home page (which may be `uat.gramener.com/`.)

**Tips**:

- `/$YAMLURL/` will always have a `/` before and after it.
- `pattern:` must always start with `/$YAMLURL/`
- `url:` generally starts with `/$YAMLURL/`


### Using relative URLs

In your HTML code, use relative URLs where possible. For example:
`http://localhost:9988/` becomes `.` (not `/` -- which is an absolute URL.)
Similarly, `/css/style.css` becomes `css/style.css`.

Sometimes, this is not desirable. For example, If you are linking to the same
CSS file from different directories, you need specifying `/style.css` is
helpful. This requires server-side templating.

You can use a [Tornado template like this](template.html.source) that using a
pre-defined variable, e.g. `APP_ROOT`.

```html
<link rel="stylesheet" href="/{{ APP_ROOT }}/style.css">
```

In `gramex.yaml`, we pass `APP_ROOT` to the that's set to `$YAMLURL`. For example:

```yaml
variables:
    APP_ROOT: $YAMLURL       # Pre-define APP_ROOT as the absolute URL to gramex.yaml's directory

url:
    deploy-url:
        pattern: /$YAMLURL/url/(.*)               # Any URL under this directory
        handler: FileHandler                      # is rendered as a FileHandler
        kwargs:
            path: $YAMLPATH/template.html         # Using this template
            transform:
                "template.html":
                    # Convert to a Tornado template
                    # Pass the template the APP_ROOT variable
                    function: template(content, APP_ROOT="$APP_ROOT")
```

To test this, open the following URLs:

- [url/main](url/main)
- [url/main/sub](url/main/sub)
- [url/main/sub/third](url/main/sub/third)

In every case, the correct absolute path for `/style.css` is used,
irrespective of which path the app is deployed at.

### Using YAMLPATH

`$YAMLPATH` is very similar to `$YAMLURL`. It is the relative path to the current
`gramex.yaml` location.

When using a `FileHandler` like this:

```yaml
url:
  app-home:
    pattern: /                  # This is hard-coded
    handler: FileHandler
    kwargs:
      path: index.html          # This is hard-coded
```

... the locations are specified relative to where Gramex is running. To make it
relative to where the `gramex.yaml` file is, use:

```yaml
url:
  app-home:
    pattern: /$YAMLURL/
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/index.html        # Path is relative to this directory
```

**Tips**:

- `$YAMLPATH/` will never have a `/` before it, but generally have a `/` after it
- `path:` must always start with a `$YAMLPATH/`
- `url:` for DataHandler or QueryHandler can use it for SQLite or Blaze objects.
  For example, `url: sqlite:///$YAMLPATH/sql.db`.


## Security

To check for application vulnerabilities, run the [OWASP Zed Attack Proxy][zap].
It detects common vulnerabilities in web applications like cross-site scripting,
insecure cookies, etc.

Some common security options are pre-configured in `$GRAMEXPATH/deploy.yaml`. To
enable these options, add this line to your `gramex.yaml`:

```yaml
import: $GRAMEXPATH/deploy.yaml
```

This:

- **Disallows all files**, including code, config and data files like:
    - Code formats: `.py`, `.pyc`, `.php`, `.sh`, `.rb`, `.ipynb`, `.bat`, `.cmd`, `.bat`
    - Config formats: `.yml`, `.yaml`, `.ini`
    - Data formats: `.jsonl`, `.csv`, `.xlsx`, `.db`, `.xls`, `.h5`, `.xml`, `.shp`, `.shx`, `.dbf`, `.prj`, `.idx`, `.zip`, `.7z`
- Only allows content and front-end files, specifically:
    - Document formats: `.md`, `.markdown`, `.html`, `.txt`, `.pdf`,  `.rst`, `.pptx`, `.docx` (no `.doc`, `.ppt`, nor Excel files)
    - Image formats: `png`, `.svg`, `.jp*g`, `.gif`, `.ico`
    - Media formats: `.mp3`, `.mp4`, `.avi`, `.flv`, .`mkv`
    - Font formats: `.ttf`, `.woff*`, `.eot`, `.otf`
    - Front-end formats: `.js`, `.map`, `.vue`, `.less`, `.css` (not back-end formats like `.coffee`, `.scss`)
    - Front-end data format: `.json`
- enables `XSS` protection. Read more at [Mozilla Developer Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection).
- enables protection against browsers performing MIME-type sniffing. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options).
- enables protection against running apps within an iframe. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).
- blocks server information. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server).

See [deploy.yaml][deploy-yaml] to understand the configurations.

[zap]: https://www.owasp.org/index.php/OWASP_Zed_Attack_Proxy_Project
[deploy-yaml]: https://github.com/gramener/gramex/blob/master/gramex/deploy.yaml

### Deployment variables

[Predefined variables](../config/#predefined-variables) are useful in deployment.
For example, say you have the following directory structure:

```yaml
/app              # Gramex is run from here. It is the current directory
  /component      # Inside a sub-directory, we have a component
    /gramex.yaml  # ... along with its configuration
    /index.html   # ... and a home page
```

Inside `/app/component/gramex.yaml`, here's what the variables mean:

```yaml
url:
    relative-url:
        # This pattern: translates to /app/component/index.html
        # Note: leading slash (/) before $YAMLURL is REQUIRED
        pattern: /$YAMLURL/index.html
        handler: FileHandler
        kwargs:
            path: $YAMLPATH/        # This translates to /app/component/
```

If you want to refer to a file in the Gramex source directory, use
`$GRAMEXPATH`. For example, this maps [config](config) to Gramex's root
`gramex.yaml`.

```yaml
url:
    gramex-config-file:
        pattern: /$YAMLURL/config           # Map config under current URL
        handler: FileHandler
        kwargs:
            path: $GRAMEXPATH/gramex.yaml   # to the core Gramex config file
```

Typically, applications store data in `$GRAMEXDATA/data/<appname>/`.
Create and use this directory for your data storage needs.

## HTTPS Server

The best way to set up Gramex as an HTTP server is to run it behind a
[Proxy Server](#proxy-servers) like nginx or Apache.
Use [certbot](https://certbot.eff.org/) to generate a HTTPS certificate.

But to set up Gramex *directly* as a HTTPS server (**not recommended for production**), create
certificate file and a key file, both in PEM format. Use the following settings in `gramex.yaml`:

```yaml
app:
    listen:
        port: 443
        ssl_options:
            certfile: "path/to/certificate.pem"
            keyfile: "path/to/privatekey.pem"
```

You can then connect to `https://your-gramex-server/`.

To generate a free HTTPS certificate for a domain, visit
[certbot](https://certbot.eff.org/) or [letsencrypt.org/](https://letsencrypt.org/).

To generate a self-signed HTTPS certificate for testing, run:

```bash
openssl genrsa -out privatekey.pem 1024
openssl req -new -key privatekey.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

Or you can use these pre-created [privatekey.pem](privatekey.pem) and
[certificate.pem](certificate.pem) for localhost. (This was created with subject
`/C=IN/ST=KA/L=Bangalore/O=Gramener/CN=localhost/emailAddress=s.anand@gramener.com`
and is meant for `localhost`.)

All browsers will report that this connection is not trusted, since it is a
self-signed certificate. Ignore the warning proceed to the website.


## CORS

When one server sends a request to another server via AJAX, we need to enable
[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

To enable this, you need to add the
[Access-Control-Allow-Origin: *](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)
HTTP header. For example:

```yaml
url:
  cors-page:
    pattern: /$YAMLURL/cors-page
    handler: ...
    kwargs:
      ...
      headers:
        Access-Control-Allow-Origin: '*'        # Allow CORS from any domain
```

Now, you can access this URL from any server via AJAX. For example:

```js
$.getJSON('https://gramex-server/cors-page')
    .done(...)
```

Instead of `Access-Control-Allow-Origin: *`, you may specify a **single**
domain, like: `Access-Control-Allow-Origin: https://gramener.com/`.

But if you want to allow multiple domains, define them in Python. For example:

```yaml
url:
  cors-page:
    pattern: ...
    handler: FunctionHandler
    kwargs:
      function: mymodule.mycalc(handler)    # Headers are set by this function
```

```python
# mymodule.py
def mycalc(handler):
    # The request has an 'Origin:' headers.
    origin = handler.request.headers.get('Origin')
    # If it is an allowed domain, send the same as a response.
    allowed_domains = {'https://gramener.com', 'https://learn.gramener.com'}
    if origin in allowed_domains:
        handler.set_header('Access-Control-Allow-Origin', origin)
    # ... rest of your code
```

### CORS POST with auth

CORS does not send cookie information. Nor does it send custom HTTP headers
(e.g. X-XsrfToken). So CORS does not work with POST requests with
[XSRF](#../filehandler/#xsrf), nor with [authenticated users](../auth/).

To enable a Gramex client server to communicate a Gramex host server via CORS,
you need to do 4 things:

1. In the client, send the XSRF token and cookie from the HTML file. Note: this
   uses [templates](../filehandler/#templates):

```html
<script>
$.ajax('https://gramex-server/cors-page', {
  method: 'POST',
  xhrFields: {withCredentials: true}            // Send cookies
  data: { _xsrf: '{{ handler.xsrf_token }}' },  // Send XSRF token
})
</script>
```

2. In the host, add additional headers in `gramex.yaml`:

```yaml
url:
  cors:
    pattern: /$YAMLURL/cors-page
    handler: FunctionHandler
    kwargs:
      function: mymodule.mycalc(handler)
      methods: [GET, POST, OPTIONS]             # Important: Allow OPTIONS
      auth: true                                # Pick any auth conditions
      headers:
          Access-Control-Allow-Methods: GET, POST, OPTIONS      # Important
          Access-Control-Allow-Credentials: true                # Important
          # Access-Control-Allow-Origin: must be set dynamically by mycalc()
```

3. In the client AND the host, enable a distributed
   [session data mechanism](../auth/#session-data) like Redis,
   and also to share cookies:

```yaml
app:
  session:
    type: redis
    path: localhost:6379:0      # Run redis on localhost at port 6379. This uses DB 0
    domain: .your-domain.com    # Allows cookies to be shared between *.your-domain.com
```

4. In the host `mymodule.mycalc()`, set the `Access-Control-Allow-Origin` header:

```python
def mycalc(handler):
    origin = handler.request.headers.get('Origin', '*')
    handler.set_header('Access-Control-Allow-Origin', origin)
```


## Shared deployment

To deploy on Gramener's [UAT server](https://uat.gramener.com/monitor/apps), see
the [UAT deployment](https://learn.gramener.com/wiki/dev.html#deploying) section
and [deployment tips](https://learn.gramener.com/wiki/dev.html#deployment-tips).

This is a shared deployment, where multiple apps deployed on one Gramex
instance. Here are common deployment errors in shared environments:

### Works locally but not on server

If your app is at `D:/app/`, don't run gramex from `D:/app/`. Run it from `D:/`
with this `D:/gramex.yaml`:

```yaml
import: app/gramex.yaml
```

This tests the application in a shared deployment setup. The application may
run from `D:/app/` but fail from `D:/` - giving you a chance to find out why.

### 403 Forbidden

`$GRAMEXPATH/deploy.yaml` disables all non-standard files for
[security](#security). If another app imports `deploy.yaml`, your application
may not be able to access a file - e.g. `data.csv`. Create a FileHandler to
explicitly allow your file.

```yaml
url:
  myapp/allow-files:                        # Create/modify a handler to allow files
    pattern: /$YAMLURL/data/(.*)
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/data/
      allow: ['data.csv', '*.xlsx']         # Explicitly allow required file types
```

**Do not use a custom `deploy.yaml`** in your project. Import from `$GRAMEXPATH`
instead. [Reference](#security). In case of a blanket disallow of files, refer
to 403 forbidden error above and resolve.

### 404 Not Found

Most often, this is due to relative paths. When running locally, the app
requests `/style.css`. But on the server, it is deployed at `/app/`. So the URL
must be `/app/style.css`. To avoid this, always use relative URLs - e.g.
`style.css`, `../style.css`, etc -- avoid the leading slash.

Another reason is incorrect [handler name conflicts](#handler-name-conflict).

### Handler name conflict

If your app and another app both use a URL handler called `data`, only one of
these will be loaded.

```yaml
url:            # THIS IS WRONG!
    data:       # This is defined by app1 -- only this config is loaded
        ...
    data:       # This is defined by app2 -- this is ignored with a warning in the log
        ...
```

Ensure that each project's URL handler is pre-fixed with a unique ID:

```yaml
url:            # THIS IS RIGHT
    app1/data:  # This is defined by app1
        ...
    app2/data:  # This is defined by app2 -- does not conflict with app1/data
        ...
```

### Import conflict

If your app and another app both `import:` the same YAML script, the namespaces
inside those will obviously collide:

```yaml
import:                                     # THIS IS WRONG!
    app1/ui:                                # app1
        path: $GRAMEXAPPS/ui/gramex.yaml    # imports UI components
        YAMLURL: $YAMLURL/app1/ui/          # at /app1/ui/
    app2/ui:                                # app2
        path: $GRAMEXAPPS/ui/gramex.yaml    # imports UI components
        YAMLURL: $YAMLURL/app2/ui/          # at /app2/ui/
```

Add the [namespace](#../config/#imports) key to avoid collision in specified
sections. A safe use is `namespace: [url, cache, schedule, watch]`

```yaml
import:                                     # THIS IS RIGHT
    app1/ui:                                # app1
        namespace: [url]                    # ensures that url: section names are unique
        path: $GRAMEXAPPS/ui/gramex.yaml
        YAMLURL: $YAMLURL/app1/ui/
    app2/ui:                                # app2
        namespace: [url]                    # ensures that url: section names are unique
        path: $GRAMEXAPPS/ui/gramex.yaml
        YAMLURL: $YAMLURL/app2/ui/
```

### Python file conflict

If your app and another app both use a Python file called `common.py`, only one
of these is imported. Prefix the Python files with a unique name, e.g.
`app1_common.py`.

### Missing dependency

Your app may depend on an external library -- e.g. a Python module, node module
or R library. Ensure that this is installed on the server. The preferred method
is to use the [gramex install](../install/) method. Specifically:

- Add Python modules to `requirements.txt`
- Add Node modules to `package.json`
- Add R libraries to `setup.sh` -- and ensure that the correct R is used
- Add any other custom code to `setup.sh`

### Log file order

Different instances of Gramex may flush their logs at different times. Do not
expect log files to be in order. For example, in this [request log](../config/#request-logging),
the 2nd entry has a timestamp greater than the third:

```
1519100063656,220.227.50.9,user1@masked.com,304,1,GET,/images/bookmark.png,
1519100063680,106.209.240.105,user2@masked.com,304,55,GET,/bookmark_settings?mode=display,
1519100063678,220.227.50.9,user3@masked.com,304,1,GET,/images/filters-toggler.png,
```

## nginx log analyzer

[Goaccess](https://goaccess.io/) is useful for server monitoring.
It can be configured for Apache or nginx. Follow below steps to enable monitoring:

1) Install [Goaccess](https://goaccess.io/download)

2) Enable monitoring via terminal, pointing to `access.log` to generate `report.html`

```bash
goaccess /var/log/nginx/access.log -o report.html --log-format=COMBINED
```

This can be run as a cronjob at periodic intervals to monitor server health.

Real-time monitoring can be enabled and exposed via websockets via `--real-time-html`

```bash
goaccess /var/log/nginx/access.log -o report.html --log-format=COMBINED --real-time-html --ws-url=ws://*****IP*****:7890 --ignore-crawlers --daemonize
```

Updated log is pushed via websockets on port 7890.
`--daemonize` runs the task as a daemon and `--ignore-crawlers` ignores web crawlers.

If `report.html` should be accessed on an endpoint, ensure it is configured in nginx or other-related routes.
To serve it in a specific project,

```yaml
url:
  project_report:
    pattern: /$YAMLURL/report
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/report.html   # report.html is generated from goaccess
```

Supporting configuration in `nginx` would be as below:

```bash
# nginx.conf
server {
    # here, the report is hosted on a Gramex app running on 9920 port
    location /report/  { proxy_pass http://127.0.0.1:9920/report; }
}
```

This report can be access at: `yourapp.gramener.com/report/`

### GoAccess Output

Following attributes are reported in graphical and textual formats:

- Total requests, valid requests, failed requests
- Visitors per day, hits, bandwidth utilized
- Distribution of traffic for your application endpoints

![goaccess dashboard](https://goaccess.io/images/goaccess-dark-gray.png)

- Static requests
- Visitor statistics: hostnames and IP addresses
- Operating systems and browsers traffic distribution
- Traffic distribution by time

## Common errors

Here are common errors from the Gramex logs:

### Port 8001 is busy

For example:

```
ERROR 21-May 11:41:45 __init__ Port 8001 is busy. Use --listen.port= for a different port
```

You are running Gramex on a port that is already running Gramex or another application.

On Linux, run `lsof -i :8001` to find processes running on port 8001 and use `kill` to kill the process.
Or start Gramex on a different port using `gramex --listen.port=<new-port>`

### Cannot start Capture

Here is a typical traceback:

```
Traceback (most recent call last):
  File "/home/ubuntu/gramex/gramex/handlers/capturehandler.py", line 111, in _start
    self._validate_server(r)
  File "/home/ubuntu/gramex/gramex/handlers/capturehandler.py", line 169, in _validate_server
    raise RuntimeError('Server: %s at %s is not %s' % (server, self.url, script))
RuntimeError: Server: Capture/1.0.0 at http://localhost:9900/ is not chromecapture.js
```

This indicates that the web application running at port 9900 is not ChromeCapture but something else. You can either:

1. Change the CaptureHandler port to a free one (e.g. from 9900 to 9910), OR
2. Stop what's running at the CaptureHandler port using `lsof -i 9900` and `kill`, and then restart Gramex.

### Cannot load function

Here is an example:

```
ERROR 12-May 10:38:24 transforms url:box_data: Cannot load function views.get_box_data
```

This indicates that `views.py` does not have a `get_box_data()` function. You
can locate this under the `box_data:` under `url:`. This can happen for 3 reasons:

1. Gramex loaded a different `views.py` (e.g. from another project) before your
   `views.py`, and your `views.py` is being ignored. **Solution**: rename your
   file like `<your_project>_views.py` to make it unique.
2. Gramex loaded `views.py` earlier and is not reloading it. This happens on
   rare occasions. **Solution**: restart Gramex.
3. `views.py` does not have a `get_box_data()` function. Check the spelling.

### Duplicate key

Here is an example:

```
WARNING 03-Oct 17:17:44 config Duplicate key: url.login/google
```

This indicates that `login/google:` key under `url:` has been repeated across
different `gramex.yaml` files -- which have been `import:`ed under the main
`gramex.yaml`. The first `login/google:` is used. The rest are ignored.

Ensure that no keys duplicated across `gramex.yaml` files and restart gramex.

### Other common errors

- `Exception when importing`: Gramex failed to import a module. Typically a
  syntax error. Try importing the module from
- `setup exception in handler FunctionHandler`: Gramex failed to import the
  module that has the function in FunctionHandler. Typically a syntax error
- `Failed to initialize alert`: Gramex could not set up the alert. See the exception for details
- `No service named xxx`: Your `gramex.yaml` has an extra top-level key called
  `xxx` which is not valid. It should probably be indented under some other
  section.
- `cannot set up log`:  The `log:` section has an error. It may not be a dict,
  or refer to a file / folder that cannot be accessed, etc.
- `Gramex 1.xx.x is available`: A newer version of Gramex is available. Upgrade

## Good security practices

A curated list of security practices for real-life application deployments is presented here.

### Session timeout

Applications may need to timeout user sessions periodically. We can configure this as below:

```yaml
# gramex.yaml
application/login:
  pattern: /$YAMLURL/login
  handler: DBAuth
  kwargs:
    session_expiry: 0.0207           # value in days. session expires after 30 mins
    session_inactive: 0.0207         # value in days. session expires after 30 mins of inactivity
```

### Disable directory listing

Directory listing isn't a recommended practice as it reveals exact file names. One can disable directory listing at a root level as below:

```yaml
# gramex.yaml
handlers:
  FileHandler:
    ignore:                         # accepts a list of files to be ignored
      - '*.yaml'                    # YAML defines routes, user credentials
      - '*.git*'                    # git files
      - '*.json'
      - '*.git/*'
      - '*ui/*'
    allow: '.file'                  # allows special file
```

### Protect all pages with authentication

Templates are routinely used to render or refresh views on the interface. It's important to disable access without the correct authentication credentials and access controls.

```yaml
# gramex.yaml
url:
  templates-home:
    pattern: /$YAMLURL/templates/(.*)
    handler: FileHandler
    priority: 100                     # takes a higher priority than the rest
    kwargs:
      path: $YAMLPATH/templates/
      auth:
        login_url: /$YAMLURL/login
```

This is also true for any other files (static assets, data files, queries, remote function calls etc.).

### Custom error messages

Error messages can be customized based on their type. To do that, define a route then write a Python function that accepts error status code and handler as arguments.

```yaml
# gramex.yaml
BaseHandler:
  error:
    500: &ERROR
      function: app_script.error_fn(status_code, kwargs, handler)
      header:
        Cache-Control: no-cache
        Content-Type: text/html
    400: *ERROR
    401: *ERROR
    403: *ERROR
    404: *ERROR
```

```py
"""
This is `app_script.py`.
"""
import os
import gramex.cache


def error_fn(status, kwargs, handler):
    """Load the error pages as required.
    Args:
      kwargs (dict): keyword arguments
      status (int): status code
      handler (request object): gramex handler object
    Returns:
      (template): dynamic error page
    """

    error_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), 'errorpage.html')
    tmpl = gramex.cache.open(error_path, 'template')
    handler.set_status(status)
    return tmpl.generate(kwargs=kwargs, status=status, handler=handler)
```

### Captcha implementation

Captchas are used during the sign-in process. One can implement it as below:

Define a route in `YAML` to retrieve the captcha.

```yaml
# In Yaml file:
application-login-captcha:
  pattern: /$YAMLURL/get_captcha
  handler: FunctionHandler
  kwargs:
    function: app_script.get_captcha_img
```

Map `get_captcha_img()` function in `app_script.py` file. This `Python` program uses `captcha` utility via `pip` (`pip install captcha`).

```py
from glob import glob
import base64
import string
from captcha.image import ImageCaptcha


def get_captcha_img(handler):
    """Generate captcha.
    Args:
      handler (request object): gramex handler object
    Returns:
      (dict): digits as image
    """

    glob('captcha_fonts/*.ttf')
    fonts = []

    # fonts to render the digits
    for font in glob('*/*.ttf'):
        fonts.append(os.path.join(currdir,  font))
    image = ImageCaptcha(fonts=fonts)
    characters = string.digits

    cook_sec = ""
    # set up random length
    cook_sec_length = random.randint(6, 6)
    for _ in range(cook_sec_length):
        _char = random.choice(characters)
        cook_sec = cook_sec + _char

    # replace digits 7 with 0 and 1 with 2 as end users find it difficult to distinguish between them
    cook_sec = cook_sec.replace('7', '0').replace('1', '2')
    data = base64.b64encode(image.generate(cook_sec).read()).decode("utf-8")
    data = data + generate_secret_key()
    return {
        'img_data': 'data:image/jpeg;base64,{}'.format(data),
        'str': cook_sec
    }
```

Make the call to the route in a `JavaScript` file.

```js
function get_captcha() {
  ajax_call("get_captcha").done(function (data) {
    $("#captcha_img").attr("src", data.img_data.slice(0, -16))
    let captcha_val = data.str.toLowerCase()
    $('body')
      .on('keyup', '#captcha', function () {
        if ($(this).val().toLowerCase() == captcha_val) {
          $('.captcha_msg').addClass('d-none')
          $("#signin").removeAttr("disabled")
        }
        else {
          if ($(this).val().length >= 6) {
            ajax_call("cap").done(function (data) {
              $("#captcha_img").attr("src", data.img_data.slice(0, -16))
              captcha_val = data.str.toLowerCase()
            })
            $('.captcha_msg').removeClass('d-none')
          }
          $("#signin").attr("disabled", true)
        }
      })
  })
}

// fetch captcha on page load or on captcha reload request
$(window).on('load', function () {
  get_captcha()
})
$('body').on('click', '#captcha-reload', function () {
  get_captcha()
})
```

Ensure relevant `HTML` containers (`.captcha_msg`, `#captcha_img`) are defined.

```html
<div class="form-group h4 lh-2">
  <p class="text-danger sm3 my-2 captcha_msg position-absolute mt-n2 d-none">please retry captcha
  </p>
  <input autocomplete="off" type="text"
  class="form-control border py-3 px-2 rounded-0 border-top-0 border-left-0 border-right-0"
  name="captcha" id="captcha" placeholder="Captcha" autofocus required>
</div>
<div class="row">
  <div class="col-5">
    <img id="captcha_img" height="45" class="w-100" src="#" alt="captcha-img">
  </div>
  <div class="col-2 p-0">
    <img src="img/refresh.png" height="45" class="w-90 btn" id="captcha-reload" src="#"
    alt="reload-icon">
  </div>
</div>
```

### Banner grabbing

Server details can be known while observing requests in browser developer tools or other security tools. This could reveal the vulnerable versions of underlying software.

If you're serving a `Gramex` application via `nginx` you can set `server_tokens off;` in the respective `nginx.conf` file.

To know more read the [reference](https://blog.livebyt.es/turn-off-your-server-tokens/).

### Secure cookie

To disable cookie submissions on an unencrypted HTTP connection one can configure `secure` flag to `true`.

```yaml
settings:
  serve_traceback: False
  xsrf_cookie_kwargs:
    httponly: true
    secure: true
```

Read more on [PortSwigger](https://portswigger.net/kb/issues/00500200_tls-cookie-without-secure-flag-set).

### Controlling XSS attacks

XSS (cross-site scripting) attacks can be tackled by defining `X-XSS-Protection: `; mode=block` header which stops rendering the page upon detection of an attack.

Read [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection) for more details.
