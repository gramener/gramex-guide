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

### Deploy on gramener.com servers

Gramener employees who commit to [code.gramener.com](https://code.gramener.com/) can deploy to
[gramener.com](https://gramener.com/) or [uat.gramener.com](https://uat.gramener.com/).

Add the following to `.gitlab-ci.yml` in your repository.

```yaml
# Reference: http://doc.gitlab.com/ce/ci/yaml/README.html
deploy:
  stage: deploy
  script: deploy                          # Run the Gramener deployment script
  only: [master, /dev-.*/]                # List branches to deploy as a list or RegExs
  variables:
    SERVER: ubuntu@uat.gramener.com       # Deploy to uat.gramener.com/app-name/
    URL: app-name                         # Change this to your app-name
    SETUP: gramex setup .                 # You can use any setup script here
    VERSION: py3v1                        # py3v1 or static
    WEBSOCKET: enabled                    # Optional: websocket support
    CORS: enabled                         # Optional: open CORS access
```

You may change the following keys:

- `only`: A list of branches to deploy. Only these branches will be deployed.
  - `[master]` only deploys the master branch
  - `[master, dev]` deploys only the master and dev branches
  - `[/dev-.*/]` deploys all branches starting with `dev-`
- `variables.SERVER`: user and server to deploy at. Options:
  - `SERVER: ubuntu@gramener.com` to deploy on gramener.com
  - `SERVER: ubuntu@uat.gramener.com` to deploay on uat.gramener.com
- `variables.URL`: path to deploy on the server. Example:
  - `URL: myapp` will deploy at `https://gramener.com/myapp` (if `SERVER: ubuntu@gramener.com`)
- `variables.SETUP`: setup script to run. Examples:
  - `SETUP: gramex setup .` runs `npm install`, `bash setup.sh` and `pip install -r requirements.txt`
  - `SETUP: npm install` runs `npm install`
- `variables.VERSION` specifies the Gramex version to deploy. Options:
  - `VERSION: py3v1` Python 3, Gramex v1.x. Use this for all Gramex apps
  - `VERSION: static` just hosts the files. Use for plain HTML hosting (static sites)
- `variables.PORT` is the deployment port. This is **automatically** chosen. But see
  [gramener.com/monitor/apps](https://gramener.com/monitor/apps) or
  [uat.gramener.com/monitor/apps](https://uat.gramener.com/monitor/apps)
  for a list of available ports and who has access.
- `variables.WEBSOCKET` can be set to any truth-y value to enable websocket support
- `variables.CORS` can be set to any truth-y value to enable CORS access

## Secrets

**v1.64**. Passwords, access tokens, and other sensitive information must be
protected. There are 3 ways of doing this.

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

You can also access it in code (e.g. in [FunctionHandler](../functionhandler/)) as `gramex.config.variables['PASSWORD']`, etc. For example:

```python
from gramex.config import variables

def my_function_handler():
    password = variables.get('PASSWORD', '')
    google_auth_secret = variables['GOOGLE_AUTH_SECRET']
    twitter_secret = variables['TWITTER_SECRET']
    ...
```

**NOTE**: Don't commit the `.secrets.yaml` file. Everyone who can access the repo can see the secret.

### .secrets.yaml imports

**v1.68**. `.secrets.yaml` can import from other files. For example:

```yaml
# Imports all variables from another-secret-file.yaml
SECRETS_IMPORT: another-secret-file.yaml

# You can import from a file pattern. This imports .secrets.yaml from all
# immediate subdirectories
SECRETS_IMPORT: '*/.secrets.yaml'

# You can specify a list of imports
SECRETS_IMPORT:
  - app1/.secrets.yaml
  - app2/.secrets.yaml

# ... or a dict of imports. Keys are ignored. Values are used.
SECRETS_IMPORT:
  app1: app1/.secrets.yaml
  app2: app2/.secrets.yaml
```

This is useful when a Gramex instance runs multiple apps, each having its own `.secrets.yaml` file.
The main app can use `SECRETS_IMPORT: */.secrets.yaml` to import secrets from all subdirectories.

Any secrets in the main file override the secrets in an imported file.

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

## Docker image

To create a Docker image from an app, add this `Dockerfile` to your app:

```dockerfile
FROM gramener/gramex:latest
COPY . .
RUN "$CONDA_DIR/bin/gramex" setup .
```

Build the image using:

```bash
docker build --pull -t my-app:latest .
```

Run the image using:

```bash
docker run -p 9988:9988 my-app:latest
```


## Windows Service

[Video](https://youtu.be/xKlcTo7IX6Q){.youtube}

**v1.23**.
To set up a Gramex application as a service, run PowerShell or the Command Prompt **as administrator**. Then:

```powershell
cd D:\path\to\your\app
gramex service install
```

To start / stop the service, go to Control Panel > Administrative Tools > View Local Services. You
can also do this from the command prompt **as administrator**:

```powershell
gramex service start
gramex service stop
```

Once started, the application is live at the port specified in your
`gramex.yaml`, which defaults to 9988, so visit <http://localhost:9988/>.

Here are additional install options:

```powershell
gramex service install
    --cwd  "C:/path/to/application/"    # Run Gramex in this directory
    --user "DOMAIN\USER"                # Optional user to run as
    --password "user-password"          # Required if user is specified
    --startup manual|auto|disabled      # Default is manual
```

The user domain and name are stored as environment variables `USERDOMAIN` and
`USERNAME`. Run `echo %USERDOMAIN% %USERNAME%` on the Command Prompt to see them.

You can update these parameters any time via:

```powershell
gramex service update --...             # Same parameters as install
```

To uninstall the service, run:

```powershell
gramex service remove
```

### Troubleshooting Windows Services

**If the service doesn't run, check the log files**. Log files can be accessed as follows:

- For Service installation logs, use the Windows "Event Viewer" app under Windows Logs > System.
- For Service execution logs, use the Windows "Event Viewer" app under Windows Logs > Application.
- For Gramex console logs, see `service.log` in the application's source folder (where `gramex.yaml` is).
- For Gramex logs, see `%LOCALAPPDATA%\Gramex Data\logs\` unless over-ridden by `gramex.yaml`.

**Check PyWin32 paths**.

[PyWin32](https://pypi.org/project/pywin32/) has a common problem. When you run `gramex service install`, you may get this warning:

```text
The executable at "...\Lib\site-packages\win32\PythonService.exe" is being used as a service.

This executable doesn't have pythonXX.dll and/or pywintypesXX.dll in the same
directory. This is likely to fail when used in the context of a service.

The exact environment needed will depend on which user runs the service and
where Python is installed. If the service fails to run, this will be why.

NOTE: You should consider copying this executable to the directory where these
DLLs live - "...\Lib\site-packages\win32" might be a good place.
```

Or, when starting the service, you may get "Error starting service: The service did not respond to
the start or control request in a timely fashion".

In that case:

1. Copy the following files under `...\Lib\site-packages\win32\` (same location as the error above).
   - `pythonXX.dll` from `...\` -- the root of your Conda environment. Replace XX with 37 for Python 3.7, etc.
   - `pywintypesXX.dll` from `...\Library\bin\`. Replace XX with 37 for Python 3.7, etc.
   - Avoid `python Scripts/pywin32_postinstall.py -install` copies into `C:\Windows\system32`. It doesn't work well across Python versions
2. If [psutil imports fails](https://github.com/giampaolo/psutil/issues/693),
   download the relevant [psutil wheel](https://www.lfd.uci.edu/~gohlke/pythonlibs/#psutil) and `pip install` it
   from your conda environment.
3. Run `gramex service remove`
4. Run `gramex service install` to re-install. Check that the're no warning now
5. Run `gramex service start`. You should see a `service.log` file in the source folder with the Gramex console.logs

**Check Permissions**. If you get an `Access is denied` error like this:

```text
pywintypes.error: (5, 'OpenSCManager', 'Access is denied.')
```

... then re-run from an Administrator Command Prompt.

### Multiple Windows Services

To create multiple services running at different directories or ports, you can
create one or more custom service classes in `yourproject_service.py`:

```python
import gramex.winservice

class YourProjectGramexService(gramex.winservice.GramexService):
    _svc_name_ = 'YourServiceID'
    _svc_display_name_ = 'Your Service Display Name'
    _svc_description_ = 'Description of your service'
    _svc_port_ = 8123  # optional custom port

if __name__ == '__main__':
    import sys
    import logging
    logging.basicConfig(level=logging.INFO)
    YourProjectGramexService.setup(sys.argv[1:])
```

Install the service via:

```powershell
python yourproject_service.py install --cwd=D:\path\to\app\
```

Remove the service via:

```powershell
python yourproject_service.py remove
```

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

Then run `sudo systemctl daemon-reload` to reload the services.

Now you can run:

```bash
sudo systemctl start your-app           # Start the service
sudo systemctl status your-app          # Check status of service
sudo systemctl stop your-app            # Stop the service
sudo systemctl restart your-app         # Restart the service
sudo systemctl enable your-app          # Ensure service starts on reboot

sudo journalctl -u your-app             # See the logs on your app
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
   - `X-Gramex-Root`: Base URL of Gramex application
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
    server_tokens off;                      # Hide server name

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
        proxy_set_header X-Gramex-Root /project/;   # Tells Gramex where the app is hosted
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

### nginx load balancing

To distribute load, run multiple Gramex instances on different ports on one or more servers.
Add this to your nginx configuration:

```nginx
upstream balancer-name {
  ip_hash;  // Same IP address goes to same port
  server 127.0.0.1:9988;
  server 127.0.0.1:9989;
}

server {
  // Instead of http://127.0.0.1:9988/ use the upstream balancer
  location / {
    proxy_pass http://balancer-name/;
  }
}
```

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
    RequestHeader set X-Gramex-Root "/project/"

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

To distribute load, run multiple Gramex instances on different ports on one or more servers.
Here is a minimal Apache configuration:

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

Sometimes, this is not possible. For example, `/main/` and `/main/sub/` use the same template, you
can't specify `../style.css` and `../../style.css` in the same file.

Instead, in `gramex.yaml`, pass an `APP_ROOT` variable to the template that has the absolute path
to the application root. For example, this can be:

```yaml
url:
    deploy-url:
        pattern: /$YAMLURL/url/(.*)               # Any URL under this directory
        handler: FileHandler                      # is rendered as a FileHandler
        kwargs:
            path: $YAMLPATH/template.html         # Using this template
            transform:
                "template.html":
                    # APP_ROOT is the path to the root of the application
                    function: template(content, APP_ROOT='/'))
```

Now you can use the `APP_ROOT` to locate static files in the template:

```html
<link rel="stylesheet" href="{{ APP_ROOT }}/style.css">
```

If your app is behind a proxy server, the URL may not be `/`. In that case, pass the
[`X-Gramex-Root` HTTP header](#proxy-servers), and combine with `$YAMLURL` to locate your app root.

```yaml
            transform:
                "template.html":
                    # APP_ROOT is the path to the root of the application
                    function: template(content, APP_ROOT=handler.gramex_root + r'$YAMLURL')
```

To test this, open the following URLs:

- [url/main](url/main)
- [url/main/sub](url/main/sub)
- [url/main/sub/third](url/main/sub/third)

In every case, the correct absolute path for `style.css` is used, irrespective of which path the
app is deployed at.

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

When deploying your application, go through this checklist and apply all that is relevant.

- Use [deploy.yaml](#deployyaml) to add common security settings
- Use [relative URL Mapping](#relative-url-mapping). Ensure that:
  - all URLs in `gramex.yaml` begin with `http(s)://` or `/$YAMLURL/`
  - all paths in `gramex.yaml` begin with `$YAMLPATH/`
- [Ignore file types](../filehandler/#ignore-files) that should not served to users, e.g. Excel files
- [Disable directory listing](../filehandler/#directory-listing) to avoid listing all files in a directory
- Use [authentication](../auth/#authentication) to ensure that only logged-in and authorized users can access any page
- Set up [session expiry](../auth/#session-expiry) or [inactive expiry](../auth/#inactive-expiry) to log out users after some time
- Use [Recaptcha](../auth/#recaptcha) to protect login pages from automated login attacks
- Set up [Custom HTTP Headers](../config/#custom-http-headers) for [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- Set up custom [error Handlers](../config/#error-handlers) to render errors in your own template, for e.g. if a page is missing or the user is not logged in

Gramex already has these security practices enabled. Don't disable these unless required:

- [Session cookies](../auth/#session-security) are `secure` and `httponly`.
  [See docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Restrict_access_to_cookies)

### deploy.yaml

The most common security options are pre-configured in `$GRAMEXPATH/deploy.yaml`. Specifically, it:

- **Disallows all files**, including code, config and data files like:
  - Code formats: `.py`, `.pyc`, `.php`, `.sh`, `.rb`, `.ipynb`, `.bat`, `.cmd`, `.bat`
  - Config formats: `.yml`, `.yaml`, `.ini`
  - Data formats: `.jsonl`, `.csv`, `.xlsx`, `.db`, `.xls`, `.h5`, `.xml`, `.shp`, `.shx`, `.dbf`, `.prj`, `.idx`, `.zip`, `.7z`
- Only allows content and front-end files, specifically:
  - Document formats: `.md`, `.markdown`, `.html`, `.txt`, `.pdf`,  `.rst`, `.pptx`, `.docx` (no `.doc`, `.ppt`, nor Excel files)
  - Image formats: `png`, `.svg`, `.jp*g`, `.gif`, `.ico`
  - Media formats: `.mp3`, `.mp4`, `.avi`, `.flv`, .`mkv`
  - Font formats: `.ttf`, `.woff*`, `.eot`, `.otf`
  - Front-end formats: `.js`, `.map`, `.vue`, `.ts`, `.css`, `.scss`, `.sass`, `.less`
  - Front-end data format: `.json`
- enables `XSS` protection. Read more at [Mozilla Developer Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection).
- enables protection against browsers performing MIME-type sniffing. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options).
- enables protection against running apps within an iframe. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).
- blocks server information. [Read more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server).

To enable these options, add this line to your `gramex.yaml`:

```yaml
import: $GRAMEXPATH/deploy.yaml
```

See [deploy.yaml](https://github.com/gramener/gramex/blob/master/gramex/deploy.yaml) to understand the configurations.

### nginx security

To hide the `Server: nginx/*` header (even if security audit teams change the method type from GET
to TRACE/OPTIONS), install `nginx-extras` which includes
[headers-more-nginx](https://github.com/openresty/headers-more-nginx-module). On Ubuntu, run:

```bash
sudo apt-get install nginx-extras
```

Then add:

```nginx
location /project/ {
  more_set_headers 'Server: custom_name';
}
```

Restart nginx.

### Content Security Policy

To generate a [Content Security Policy nonce value](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_inline_script)
in your template, use this code in your [template](../filehandler/#templates):

```html
{% from gramex.config import random_string %}
{% set nonce = random_string(size=10) %}
{% set handler.set_header('Content-Security-Policy', f"object-src 'self'; script-src 'self' 'nonce-{nonce}'") %}
<script nonce="{{ nonce }}">
  // ...
</script>
```

### Testing

To check for application vulnerabilities, run tools such as:

- [OWASP Zed Attack Proxy](https://www.owasp.org/index.php/OWASP_Zed_Attack_Proxy_Project).
- [Burp Suite](https://portswigger.net/burp/communitydownload)

## HTTPS Server

The best way to set up Gramex as an HTTP server is to run it behind a
[Proxy Server](#proxy-servers) like nginx or Apache.


```nginx
server {
  listen 443 ssl http2;         # Use HTTP and HTTP/2 on port 443 with SSL
  server_name example.com;      # https://example.com/
  server_tokens off;            # Hide server version

  # Use https://certbot.eff.org/ to generate these certificates
  ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  # Disable SSLv3 -- only IE6 needs it, and the POODLE security hole makes it vulnerable
  # Disable TLSv1 and TLSv1.1. See https://www.packetlabs.net/tls-1-1-no-longer-secure/
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers EECDH+CHACHA20:EECDH+AES;
  ssl_prefer_server_ciphers on;

  # Prevent man-in-the-middle attack by telling browsers to only use HTTPS, not HTTP, for 1 year
  # https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security (HSTS)
  add_header Strict-Transport-Security "max-age=31536000";
}

# Redirect HTTP to HTTPS

server {
  listen      80;             # Redirect port 80 on
  server_name example.com;    # http://example.com/
  location / {                # Permanently redirect to the HTTPS page
    return 301 https://$host$request_uri;
  }
  # Serve custom error HTML for 301 and 302 HTTP status codes -- to avoid reporting server name
  error_page 301 302 /error.html;
  location = /error.html {
    root /var/www/html;
    internal;
  }
```


### Direct HTTPS server

To set up Gramex *directly* as a HTTPS server (**not recommended for production**), create a
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

**New in 1.78**. When one server sends a request to another server via browser JavaScript, we need to enable
[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

If a Gramex app is deployed on multiple servers, or if you want a client-side app to fetch data from a URL, add `cors: true` to the URL's `kwargs`. For example, this page returns session information to pages from any server:

```yaml
url:
  deploy-cors:
    pattern: /$YAMLURL/cors
    handler: FunctionHandler
    kwargs:
      function: handler.session
      cors: true  # Enable CORS
```

`cors: true` is a shortcut for:

```yaml
      cors:
        origins: '*'      # Allow from all servers
        methods: '*'      # Allow all HTTP methods
        headers: '*'      # Allow all default HTTP headers
        auth: true        # Allow cookies
```

`cors:` can have the following keys:

- `origins` is a [list of origin domain names allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).
  Wildcards are supported. For example,
  - `*` matches all domains
  - `[*.gramener.com, *.ibm.com]` matches all gramener.com or ibm.com domains
- `methods` is a [list of HTTP methods allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods),
  e.g. `[GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH, CONNECT, TRACE]`
- `headers` is a [list of HTTP headers allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers).
  Gramex's default list (`*`) includes `Accept`, `Cache-Control`, `Content-Type`, `If-None-Match`, `Origin`, `Pragma`, `Upgrade-Insecure-Requests`, `X-Requested-With`.
  You can add more with `headers: [*, X-Custom-Header-1, X-Custom-Header-2, ...]`
- `auth` is a boolean value. If `true`, CORS requests will include cookies and pass on the [user credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials).

For example, this CORS page can be accessed from any server via AJAX / fetch.

::: example href=cors source=https://github.com/gramener/gramex-guide/tree/master/deploy/gramex.yaml
    CORS page

On any page, you can run this JS code:

```js
fetch('https://gramener.com/gramex/guide/deploy/cors', { method: 'POST' })
  .then(r => r.text())
  .then(console.log)
```

This will send a POST request to the CORS page, and print the response.

### CORS POST with auth

CORS does not send cookie information by default, and workarounds were required.
Since **Gramex 1.78**, this is handled automatically by Gramex with `cors: true`.

So, if you have:

- a Gramex app running on `x.example.com` and `y.example.com`
- the [cookie domain](../auth/#session-security) is `example.com`

... then you can send a POST request from `x.example.com` to `y.example.com` like this:

```js
fetch('https//y.example.com', { method: 'POST', credentials: 'include' })
  .then(r => r.text())
  .then(console.log)
```

Note: For CORS to work on [CaptureHandler](../capturehandler/) with authentication, pass a
`?domain=` argument that has the domain for which cookies are to be set.

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
      allow: ['data.csv', '*.xlsx']         # Explicitly allow required types
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
    data:       # This is defined by app2 -- ignored with a warning
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

Add the [namespace](../config/#imports) key to avoid collision in specified
sections. A safe use is `namespace: [url, cache, schedule, watch]`

```yaml
import:                                     # THIS IS RIGHT
    app1/ui:                                # app1
        namespace: [url]                    # ensures names in url: are unique
        path: $GRAMEXAPPS/ui/gramex.yaml
        YAMLURL: $YAMLURL/app1/ui/
    app2/ui:                                # app2
        namespace: [url]                    # ensures names in url: are unique
        path: $GRAMEXAPPS/ui/gramex.yaml
        YAMLURL: $YAMLURL/app2/ui/
```

### Python file conflict

If your app and another app both use a Python file called `common.py`, only one
of these is imported. Prefix the Python files with a unique name, e.g.
`app1_common.py`.

### Missing dependency

Your app may depend on an external library -- e.g. a Python module, node module
or R library.

The quickest way is to set these up is to run [`gramex setup <folder>`](../apps/#setting-up-apps) method. This automatically installs:

- Python modules in `requirements.txt` via `pip install`
- Node modules in `package.json` via `npm install`
- Any custom code in `setup.sh`, `setup.py`, and `setup.ps1`

### Log file order

Different instances of Gramex may flush their logs at different times. Do not
expect log files to be in order. For example, in this [request log](../config/#request-logging),
the 2nd entry has a timestamp greater than the third:

```text
1519100063656,220.227.50.9,user1@masked.com,304,1,GET,/images/bookmark.png,
1519100063680,106.209.240.105,user2@masked.com,304,55,GET,/bookmark_settings?mode=display,
1519100063678,220.227.50.9,user3@masked.com,304,1,GET,/images/filters-toggler.png,
```

## Common errors

Here are common errors from the Gramex logs:

### Port 8001 is busy

For example:

```text
ERROR 21-May 11:41:45 __init__ Port 8001 is busy. Use --listen.port= for a different port
```

You are running Gramex on a port that is already running Gramex or another application.

On Linux, run `lsof -i :8001` to find processes running on port 8001 and use `kill` to kill the process.
Or start Gramex on a different port using `gramex --listen.port=<new-port>`

### Cannot start Capture

Here is a typical error message:

```text
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

```text
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

```text
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
