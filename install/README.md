---
title: Install Gramex
prefix: Install
...

<link rel="stylesheet" type="text/css" href="../node_modules/asciinema-player/resources/public/css/asciinema-player.css">

<!-- Don't include a [TOC] here -- it's confusing -->

You can try Gramex without installing using the [Gramex IDE](https://gramex.gramener.com/).

<a class="btn btn-large btn-primary" href="https://gramex.gramener.com/">
  Try the Gramex IDE
  <br><small>(Log in with any Google account)</small>
</a>

There are 3 ways to install the Gramex Community Edition.

1. [**Docker**](#docker-install). Best to try out new versions, or to deploy apps.
2. [**Conda**](#conda-install) (**RECOMMENDED**). Best for beginners and Python developers
3. [**Pip**](#pip-install). Best for people contributing to Gramex

## Docker install

Install [Docker](https://docs.docker.com/engine/install/). Then run:

```bash
docker run -it -p 9988:9988 gramener/gramex /bin/sh -l
```

In the container, run `gramex --help` to verify the Gramex version. Now you can [Run your first app](#run-a-gramex-app).

- `-it` runs Docker with an interactive terminal -- so you can type commands in it (e.g. `gramex`)
- `-p 9988:9988` maps host port 9988 (outside) to container port 9988 (inside)
- `gramener/gramex:latest` runs the latest Gramex instance (pulling it if required)
- `/bin/sh -l` logs into `ash` (a shell) that you can run commands in

<asciinema-player src="gramex-docker.json" cols="100" rows="20" idle-time-limit="0.5" font-size="small" loop="1"></asciinema-player>

If you have a Gramex app on your host at `/proj`, you can run it by adding `-v /proj:/app`, like this:

```bash
docker run -it -p 9988:9988 -v /proj:/app gramener/gramex
```

- `-v /proj:/app` maps the directory `/proj` on the host to the container's `/app` (the working directory)
- `gramex` runs Gramex from the working directory

Note:

- Gramex is built on [Alpine Linux](https://github.com/gramener/gramex/blob/master/pkg/docker-gramex-base/Dockerfile)
- The default working directory is `/app`
- The default user is `gramex`, without a password
- Use `doas` instead of `sudo` to run as `root`
- Use `sh -l` to run an interactive shell. If you don't use `-l`, run `source ~/.profile` to add Python and gramex to your path

To upgrade Gramex, run:

```bash
docker pull gramener/gramex
```

To remove the Gramex docker image, run:

```bash
docker rmi gramener/gramex
```

## Conda install

1. Install [Anaconda3][anaconda]. (See [archives](https://repo.anaconda.com/archive/) for older versions).
2. Install [node.js][nodejs] 12 or later from the [node.js download page][nodejs].

On the Anaconda prompt, run:

```bash
conda create -y --name gramex python=3.7            # Create a new environment
conda activate gramex                               # Activate it
pip install --upgrade gramex
gramex setup --all
```

This is what your screen might look like when installing:

<asciinema-player src="gramex-conda.json" cols="100" rows="20" idle-time-limit="0.5" font-size="small" small="1"></asciinema-player>

Now you can [Run your first app](#run-a-gramex-app).

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
gramex setup --all
```

To remove the Gramex environment, run:

```bash
conda env remove -n gramex
```

## Pip install

1. Install [Python 3.7+](https://www.python.org/downloads/).
2. Install [node.js][nodejs] 12 or later from the [node.js download page][nodejs].

To install or upgrade Gramex, run this on a terminal:

```bash
pip install --upgrade gramex
gramex setup --all
```

<!--
`pip install --ignore-installed` was removed because of an
[Anaconda bug](https://github.com/pypa/pip/issues/2751#issuecomment-165390180) -
re-installing scandir fails on Windows.
-->

To install a [specific Gramex release](../release/), run:

```bash
# Install a specific version of Gramex
pip install gramex==1.47.0

# Install a specific branch or tag from the Gramex source code
pip install https://github.com/gramener/gramex/archive/dev.zip
pip install https://github.com/gramener/gramex/archive/v1.47.0.zip
```

If you're developing on Gramex, clone it and install a local version:

```bash
git clone https://github.com/gramener/gramex.git
pip install -e gramex
```

To remove the Gramex package, run:

```bash
pip uninstall gramex
```

## Install Gramex Enterprise

Gramex Enterprise is offered under a [commercial license](../license/) and
provides enterprise security features.

To install it, [install Gramex first](#conda-install).

Then run:

```bash
pip install gramexenterprise    # Install Gramex Enterprise
gramex license accept           # Accept the Gramex license
```

### Upgrade Gramex Enterprise

To upgrade Gramex Enterprise, run:

```bash
pip install --upgrade gramexenterprise
```

### Uninstall Gramex Enterprise

To remove Gramex Enterprise, run:

```bash
pip uninstall gramexenterprise
```

## Run a Gramex app

Open a terminal where you can run Gramex.

If you installed via [Conda](#conda-install) or [Pip](#pip-install):

1. Open your Anaconda Prompt / Command Prompt / shell.
2. Run `conda activate gramex` to activate the Gramex environment

If you inslled via [Docker](#docker-install):

1. Run `docker run -it -p 9988:9988 gramener/gramex:latest /bin/bash`

In this terminal, run `gramex --help` to verify that Gramex is installed properly. You should see this.

<asciinema-player src="gramex-help.json" cols="100" rows="22" idle-time-limit="0.5"small small-size=""></asciinema-player>

If you see an error, see the [Troubleshooting](#troubleshooting) section.

To start a Gramex project, create a new folder and run `gramex init` from that folder by typing this in your terminal.

```bash
mkdir project
cd project
gramex init
```

You should see an output like this:

<asciinema-player src="../init/gramex-init.rec" cols="100" rows="20" idle-time-limit="0.5"small small-size=""></asciinema-player>

Run `gramex`. This will start Gramex and show an output like this:

<asciinema-player src="../init/gramex-run.rec" cols="100" rows="20" idle-time-limit="0.5"small small-size=""></asciinema-player>

Open <http://localhost:9988/> in your browser, and you should see the sample app.

Now you're ready to move to the [quickstart tutorial](../tutorials/quickstart/)

## Troubleshooting

If Gramex does not install:

- If you are behind a HTTP proxy, use `pip install --proxy=http://{proxy-host}:{port} ...`.
  You can use [conda with a proxy][conda-proxy] too.

If Gramex does not run:

- Gramex works only on Python 3.7 currently. Type `python --version`. If you don't see "Python
  3.7", re-install Python 3.7 and Gramex.
- Try uninstalling and re-installing Gramex. Stop Gramex and all other Python applications when
  re-installing.
- Make sure that typing `gramex` runs the Gramex executable, and is not aliased to a different
  command.
- If UI components are not working, install [node.js][nodejs], ensure that it's on your PATH, and
  run `gramex setup --all` to set up all apps again.

## VSCode Extension

Install [`Gramex Snippets` extension](https://marketplace.visualstudio.com/items?itemName=gramener.gramexsnippets) for VSCode IDE for Gramex related code snippets.

<script src="../node_modules/asciinema-player/resources/public/js/asciinema-player.js"></script>

[anaconda]: https://repo.anaconda.com/archive/
[conda-proxy]: https://conda.io/docs/user-guide/configuration/use-winxp-with-proxy.html
[nodejs]: https://nodejs.org/en/download/
