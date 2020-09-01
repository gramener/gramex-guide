---
title: Install Gramex
prefix: Install
...

<link rel="stylesheet" type="text/css" href="../node_modules/asciinema-player/resources/public/css/asciinema-player.css">

[TOC]

There are 4 ways of installing or upgrading the Gramex Community Edition.

1. [**Conda**](#conda-install) (**RECOMMENDED**). Best for beginners and Python developers
2. [**Docker**](#docker-install). Best to try out new versions, or to deploy apps
3. [**Pip**](#pip-install). Best for people contributing to Gramex
4. [**Offline**](#offline-install). Best for machines without an Internet connection

## Conda install

Install [Anaconda3-2020.02][anaconda]. (Gramex does not yet work with Python 3.8. So avoid later versions). Here are downloads for:

- [Windows-x86_64](https://repo.anaconda.com/archive/Anaconda3-2020.02-Windows-x86_64.exe)
- [Windows-x86](https://repo.anaconda.com/archive/Anaconda2-2019.10-Windows-x86.exe)
- [MacOSX-x86_64](https://repo.anaconda.com/archive/Anaconda2-2019.10-MacOSX-x86_64.pkg)
- [Linux-x86_64](https://repo.anaconda.com/archive/Anaconda2-2019.10-Linux-x86_64.sh)
- [Linux-ppc64le](https://repo.anaconda.com/archive/Anaconda2-2019.10-Linux-ppc64le.sh)

To install [gramex](https://anaconda.org/gramener/gramex),
type this in your Anaconda Prompt / shell:

```bash
conda create -y --name gramex python=3.7            # Create a new environment
conda activate gramex                               # Activate it
conda install -y -c conda-forge -c gramener gramex  # Install Gramex
```

Run `gramex --help` to verify that Gramex is installed.

<asciinema-player src="gramex-conda.json" cols="100" rows="20" idle-time-limit="0.5" autoplay="1" font-size="medium" loop="1"></asciinema-player>

**Upgrade Gramex via conda**

To upgrade Gramex, run:

```bash
conda update gramex
```

## Docker install

Install [Docker](https://docs.docker.com/engine/install/) first.

Once Docker is running, to run [gramex](https://hub.docker.com/r/gramener/gramex/),
type this in your Command Prompt / Terminal / shell:

```bash
docker run -it --name gramex -p 9988:9988 gramener/gramex /bin/bash
```

Run `gramex --help` to verify that Gramex is installed.

<asciinema-player src="gramex-docker.json" cols="100" rows="20" idle-time-limit="0.5" autoplay="1" font-size="medium" loop="1"></asciinema-player>


**Upgrade Gramex via docker**

To upgrade Gramex, run:

```bash
docker pull gramener/gramex
```


## Pip install

1. Install [Anaconda3-2020.02][anaconda]. (Gramex does not yet work with Python 3.8. So avoid later versions). Here are downloads for:
   - [Windows-x86_64](https://repo.anaconda.com/archive/Anaconda3-2020.02-Windows-x86_64.exe)
   - [Windows-x86](https://repo.anaconda.com/archive/Anaconda2-2019.10-Windows-x86.exe)
   - [MacOSX-x86_64](https://repo.anaconda.com/archive/Anaconda2-2019.10-MacOSX-x86_64.pkg)
   - [Linux-x86_64](https://repo.anaconda.com/archive/Anaconda2-2019.10-Linux-x86_64.sh)
   - [Linux-ppc64le](https://repo.anaconda.com/archive/Anaconda2-2019.10-Linux-ppc64le.sh)
2. Install [node.js][nodejs] 10 or later
3. Run the following commands on the terminal

```bash
pip install gramex      # Install latest version of Gramex
npm install -g yarn     # Required for UI components and built-in apps
gramex setup --all      # Set up UI components and built-in apps
```

Run `gramex --help` to verify that Gramex is installed.

### Alternate installations

```bash
# Install a specific version of Gramex
pip install --verbose gramex==1.47.0

# Install a specific branch or tag from the Gramex source code
pip install --verbose https://github.com/gramener/gramex/archive/dev.zip
pip install --verbose https://github.com/gramener/gramex/archive/v1.47.0.zip

# Install a local version for Gramex development
git clone https://github.com/gramener/gramex.git
pip install --verbose -e gramex
```

[anaconda]: https://repo.anaconda.com/archive/
[xcode]: https://developer.apple.com/xcode/download/
[gramex]: https://github.com/gramener/gramex/archive/master.zip
[conda-proxy]: https://conda.io/docs/user-guide/configuration/use-winxp-with-proxy.html
[nodejs]: https://nodejs.org/en/

<!--
`pip install --ignore-installed` was removed because of an
[Anaconda bug](https://github.com/pypa/pip/issues/2751#issuecomment-165390180) -
re-installing scandir fails on Windows.
-->

**Upgrade Gramex via pip**

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
gramex setup --all
```

## Troubleshooting

If Gramex does not install:

- If you are behind a HTTP proxy, use `pip install --proxy=http://{proxy-host}:{port} ...`.
  You can use [conda with a proxy][conda-proxy] too.

If Gramex does not run:

- If you're using `Python 3.8`, install Python 3.7 instead and re-install Gramex. Gramex currently
  does not work with Python 3.8.
- Try uninstalling and re-installing Gramex. Stop Gramex and all other Python applications when
  re-installing.
- Make sure that typing `gramex` runs the Gramex executable, and is not aliased to a different
  command.
- If UI components are not working, install [node.js][nodejs], ensure that it's on your PATH, and
  run `gramex setup --all` to set up all apps again.


## Offline install

On a system **with an Internet connection** and the **same platform** (Windows/Linux) as the target system:

1. Create a folder called `offline`
2. Download [Anaconda][anaconda] into `offline`
3. In the `offline` folder, run `pip download gramex` or `pip download gramexenterprise` if you need enterprise features.

If you are behind a HTTP proxy, use `pip download --proxy=http://{proxy-host}:{port} ...`.

Copy the `offline` folder to the target machine (which need not have an Internet connection). Then:

1. Install the [Anaconda][anaconda] executable. When prompted, say "Install for all users", not "Just me"
2. Open the Command Prompt or terminal **as administrator**. From the `offline` folder, run
- For open-source gramex version `pip install --verbose --no-index --find-links . gramex-XYZ.tar.gz`
- Or, for gramex enterprise `pip install --verbose --no-index --find-links . gramexenterprise-XYZ.tar.gz`

**Note**:

- This does not set up dependencies for [CaptureHandler](../capturehandler/) such as node.js, Chrome / PhantomJS.
That requires an Internet-enabled machine or Docker.
- If certain python packages don't compile well. Download specific stable versions in offline folder.
`pip download psycopg2==2.7.7`

### Offline Docker Install

[Install Docker](https://docs.docker.com/engine/install/) on a system **with an Internet connection** and the **same platform** (Windows/Linux) as the target system. Then run:

```bash
docker pull gramener/gramex
docker save gramener/gramex > gramex-latest.tar
```

Then:

1. Copy files to the target machine.
2. [Install Docker](https://docs.docker.com/engine/install/) on the target machine.
3. Copy `gramex-latest.tar` to the target machine. Zip and split it if required.

On the target machine, run:

```bash
docker load < gramex-latest.tar
docker run -it --name gramex -p 9988:9988 gramener/gramex /bin/bash
```


# Install Gramex Enterprise

Gramex Enterprise is offered under a [commercial license](../license/) and
provides enterprise security features.

To install it, [install Gramex first](#conda-install).

Then run:

```bash
pip install gramexenterprise    # Install Gramex Enterprise
gramex license accept           # Accept the Gramex license
```

**Upgrade Gramex Enterprise**

To upgrade Gramex Enterprise, run:

```bash
pip install --upgrade gramexenterprise
```

## VSCode Extension

Install [`Gramex Snippets` extension](https://marketplace.visualstudio.com/items?itemName=gramener.gramexsnippets) for VSCode IDE for Gramex related code snippets. Visit [VSCode Extension](../extension/) page for more details.


<script src="../node_modules/asciinema-player/resources/public/js/asciinema-player.js"></script>
