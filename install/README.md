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
docker pull gramener/gramex
docker run -it --name gramex -p 9988:9988 gramener/gramex /bin/bash
```

Inside the container, run `gramex --help` to verify that Gramex is installed.

- `--name gramex` names the instance `gramex`. Re-start via `docker start -ia gramex`. Remove via `docker rm gramex`
- `-p 9988:9988` maps host port 9988 (outside) to container port 9988 (inside)
- Add `-v /app:/mnt/app` to the host directory `/app` to the container directory `/mnt/app`

<asciinema-player src="gramex-docker.json" cols="100" rows="20" idle-time-limit="0.5" autoplay="1" font-size="medium" loop="1"></asciinema-player>


**Upgrade Gramex via docker**

To upgrade Gramex, run:

```bash
docker pull gramener/gramex
```


## Pip install

Install [Anaconda3-2020.02][anaconda]. (Gramex does not yet work with Python 3.8. So avoid later versions). Here are downloads for:

 - [Windows-x86_64](https://repo.anaconda.com/archive/Anaconda3-2020.02-Windows-x86_64.exe)
 - [Windows-x86](https://repo.anaconda.com/archive/Anaconda2-2019.10-Windows-x86.exe)
 - [MacOSX-x86_64](https://repo.anaconda.com/archive/Anaconda2-2019.10-MacOSX-x86_64.pkg)
 - [Linux-x86_64](https://repo.anaconda.com/archive/Anaconda2-2019.10-Linux-x86_64.sh)
 - [Linux-ppc64le](https://repo.anaconda.com/archive/Anaconda2-2019.10-Linux-ppc64le.sh)

Then install [node.js][nodejs] 10 or later

Now run the following commands on the terminal

```bash
pip install gramex      # Install latest version of Gramex
npm install -g yarn     # Required for UI components and built-in apps
gramex setup --all      # Set up UI components and built-in apps
```

Run `gramex --help` to verify that Gramex is installed.

You can also install specific versions or tags of Gramex:

```bash
# Install a specific version of Gramex
pip install --verbose gramex==1.47.0

# Install a specific branch or tag from the Gramex source code
pip install --verbose https://github.com/gramener/gramex/archive/dev.zip
pip install --verbose https://github.com/gramener/gramex/archive/v1.47.0.zip
```

If you're developing on Gramex, clone it and install a local version:

```bash
git clone https://github.com/gramener/gramex.git
pip install --verbose -e gramex
```

[anaconda]: https://repo.anaconda.com/archive/
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

[Install Gramex using conda](#conda-install) on a system **with an Internet connection** and the
**same platform** (Windows/Linux) as the target system. Then run these commands (for Linux):

```bash
# Install Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-py37_4.8.3-Linux-x86_64.sh -O miniconda.sh
bash miniconda.sh -b -p gramex-offline
gramex-offline/bin/conda init bash

# Now RESTART the shell to activate Conda.

# Then install Gramex
conda create -y --name gramex python=3.7            # Create a new environment
conda activate gramex                               # Activate it
conda install -y -c conda-forge -c gramener gramex  # Install Gramex
```

Then copy the `gramex-offline` folder into the target system (which need not have an Internet
connection). Also copy your app. Then run `gramex-offline/bin/gramex` from your app folder.


## Offline Docker Install

[Install Docker](https://docs.docker.com/engine/install/) on a system **with an Internet connection**.
Then run these commands.

```bash
# Replace "app" anywhere in this script with any app name of your choice.
docker pull gramener/gramex
docker run -it --name app gramener/gramex /bin/bash

  # Inside the container, copy your app and make any changes required.
  # For example, this clones the Gramex Guide into /app
  git clone https://github.com/gramener/gramex-guide/ /app
  exit

# Save the container as a new image
docker commit app gramener/app
docker save gramener/app > app.tar
```

Then:

1. [Install Docker](https://docs.docker.com/engine/install/) on the target machine.
2. Copy `app.tar` to the target machine. Zip and split it if required.

On the target machine, run:

```bash
docker load < app.tar
docker run -it --name app -p 9988:9988 -w /app gramener/app gramex
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
