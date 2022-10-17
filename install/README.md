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

There are 4 ways to install the Gramex Community Edition.

1. [**Docker**](#docker-install). Best to try out new versions, or to deploy apps
2. [**Pip**](#pip-install). Best for people contributing to Gramex
3. [**Conda**](#conda-install) (**RECOMMENDED**). Best for beginners and Python developers
4. [**Offline**](#offline-install). Best for machines without an Internet connection


## Docker install

Install [Docker](https://docs.docker.com/engine/install/) first.

Once Docker is running, to run [gramex](https://hub.docker.com/r/gramener/gramex/),
type this in your Anaconda Prompt / Command Prompt / shell:

```bash
docker run -it --name gramexapp -p 9988:9988 gramener/gramex:latest /bin/bash
```

Inside the container, run `gramex --help` to verify that Gramex is installed.

- `-it` runs Docker with an interactive terminal -- so you can type commands in it (e.g. `gramex`)
- `--name gramexapp` names the instance `gramexapp`
- `-p 9988:9988` maps host port 9988 (outside) to container port 9988 (inside)
- `gramener/gramex:latest` runs the latest Gramex instance (pulling it if required)
- `/bin/bash` runs bash (a shell) that you can run commands in

<asciinema-player src="gramex-docker.json" cols="100" rows="20" idle-time-limit="0.5" font-size="medium" loop="1"></asciinema-player>

Now you can [Run your first app](#run-a-gramex-app). You can also:

- stop the instance by typing `exit` from the container
- re-start Gramex via `docker start -ia gramexapp`
- remove the instance `docker rm gramexapp`

If you have a Gramex app on your host at `/app`, you can run it by adding `-v /app:/mnt/app`, like this:

```bash
docker run -it --name gramexapp -p 9988:9988 -v /app:/mnt/app -w /mnt/app gramener/gramex:latest gramex
```

- `-v /app:/mnt/app` maps the directory `/app` on the host to `/mnt/app` inside the container
- `-w /mnt/app` sets the working directory to `/mnt/app`
- `gramex` runs Gramex from the working directory

### Upgrade Gramex via docker

To upgrade Gramex, run:

```bash
docker pull gramener/gramex
```

### Uninstall Gramex via docker

To remove the Gramex docker image, run:

```bash
docker rmi gramener/gramex
```

## Pip install

Install [Python 3.7](https://www.python.org/downloads/). (Gramex does not yet work with Python 3.8. So avoid later versions). Here are downloads for:

- [Windows 64-bit](https://www.python.org/ftp/python/3.7.9/python-3.7.9-amd64.exe)
- [Windows 32-bit](https://www.python.org/ftp/python/3.7.9/python-3.7.9.exe)
- [MacOSX](https://www.python.org/ftp/python/3.7.9/python-3.7.9-macosx10.9.pkg)
- [Linux source](https://www.python.org/ftp/python/3.7.9/Python-3.7.9.tar.xz)

Install [node.js][nodejs] 10 or later from the [node.js download page][nodejs].
This installs `node` and `npm`. Ensure that you can run `npm`.

Now run the following commands on the terminal

```bash
pip install gramex      # Install latest version of Gramex
# Install node.js 10 or later
gramex setup --all      # Set up UI components and built-in apps
```

Run `gramex --help` to verify that Gramex is installed.

Now you can [Run your first app](#run-a-gramex-app).

### Upgrade Gramex via pip

To upgrade Gramex, run:

```bash
pip install --upgrade gramex
gramex setup --all
```

<!--
`pip install --ignore-installed` was removed because of an
[Anaconda bug](https://github.com/pypa/pip/issues/2751#issuecomment-165390180) -
re-installing scandir fails on Windows.
-->

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

### Uninstall Gramex via pip

To remove the Gramex package, run:

```bash
pip uninstall gramex
```


## Conda install

Install [Anaconda3-2019.07][anaconda]. (Gramex does not yet work with Python 3.8. So avoid later versions). Here are downloads for:

- [Windows 64-bit](https://repo.anaconda.com/archive/Anaconda3-2019.07-Windows-x86_64.exe)
- [Windows 32-bit](https://repo.anaconda.com/archive/Anaconda3-2019.07-Windows-x86.exe)
- [MacOSX](https://repo.anaconda.com/archive/Anaconda3-2019.07-MacOSX-x86_64.pkg)
- [Linux 64-bit](https://repo.anaconda.com/archive/Anaconda3-2019.07-Linux-x86_64.sh)

To install [gramex](https://anaconda.org/gramener/gramex),
type this in your Anaconda Prompt / Command Prompt / shell:

```bash
conda create -y --name gramex python=3.7            # Create a new environment
conda activate gramex                               # Activate it
conda install -y -c conda-forge -c gramener gramex  # Install Gramex
```

This is what your screen might look like when installing:

<asciinema-player src="gramex-conda.json" cols="100" rows="20" idle-time-limit="0.5" font-size="" loop="1"></asciinema-player>

Now you can [Run your first app](#run-a-gramex-app).

### Upgrade Gramex via conda

To upgrade Gramex, run:

```bash
conda update -c conda-forge -c gramener gramex
```

### Uninstall Gramex via conda

To remove the entire Gramex environment, run:

```bash
conda env remove -n gramex
```

To remove just the Gramex package, run:

```bash
conda uninstall gramex
```


## Offline install

Get a system **with an Internet connection** and the **same platform** (Windows/Linux) as the target system.

Then follow the instructions either for:

- [Linux](#offline-linux-install)
- [Windows](#offline-windows-install)
- [Docker](#offline-docker-install)

### Offline Linux install

On an Internet-enabled system, install Miniconda:

```bash
# Install Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-py37_4.9.2-Linux-x86_64.sh -O miniconda.sh
bash miniconda.sh -b -p gramex-offline
gramex-offline/bin/conda init bash

# Now RESTART the shell to activate Conda.

# Then install Gramex
conda create -y --name gramex python=3.7            # Create a new environment
conda activate gramex                               # Activate it
conda install -y -c conda-forge -c gramener gramex  # Install Gramex
```

Then:

- Copy the `gramex-offline` folder into the target system (without an Internet connection) into the
  **SAME** location as it was installed in the source system
- Copy your app to the target system.
- To run the app on the target system, open the shell in your **app folder** and run:

```bash
# Add Gramex to the PATH
export PATH=/home/ubuntu/gramex-offline/envs/gramex/bin/:$PATH
# Run Gramex
gramex
```

### Offline Windows install

Start with a _clean_ Windows machine - one that does not contain any Anaconda, Python or Gramex artifacts. This machine, referred to as the **build machine**, should have internet access. The offline machine on which Gramex should ultimately be installed, is referred to as the **target machine**.

On the **build machine**, follow these steps:

- **Step 1**: Pick a location to install Anaconda. This must be the same as the intended
  path for Anaconda on the target machine. E.g. if Anaconda is installed at
  `D:\offline\` on the **build machine**, it can _only_ be
  installed at `D:\offline\` on the **target machine**. The rest of these
  instructions assume that the installation location is `D:\offline\` - please
  replace this with whichever installation path is applicable in your case.

- **Step 2**: When downloading the installer for Anaconda (or Miniconda) on the **build machine**, there aretwo options:
  - Option 1 (**Recommended**): Download a version of Anaconda which has Python 3.7 in the _base_
    environment. (Download [here](https://repo.anaconda.com/miniconda/Miniconda3-py37_4.9.2-Windows-x86_64.exe))
  - Option 2: Download any version of Anaconda, install it at `D:\offline`, and create an environment that
    has Python 3.7, as follows:

```cmd
conda create -n gramex python=3.7 -y
conda activate gramex
```

- **Step 3**: Install Gramex as follows:

```cmd
conda install -c conda-forge -c gramener gramex -y
```

Then, on the **target machine**, follow these steps:

- **Step 1**: Copy the contents `D:\offline` from the build machine to `D:\offline` on the
   target machine.

- **Step 2**: Initialize the Conda shell by running:

```cmd
D:\offline\Scripts\conda.exe init cmd.exe
```

Exit and restart the shell.

- **Step 3**: Activate the base environment:

```cmd
conda activate base
```

If Gramex was installed in the base environment (i.e. if you followed the
recommended option in step 2 on the build machine), then we are done - Gramex
is installed and ready to use. However, if Gramex was not installed in the
base environment, proceed to the next step.

- **Step 4**: Activate the environment which contains Gramex:

```cmd
conda activate gramex
```

Gramex is now ready to use.

### Offline Docker install

[Install Docker](https://docs.docker.com/engine/install/) on a system **with an Internet connection**.
Then run these commands.

```bash
# Replace "app" anywhere in this script with any app name of your choice.
docker run -it --name app -p 9988:9988 gramener/gramex:latest /bin/bash

  # Inside the container, copy your app and make any changes required.
  # For example, this clones the Gramex Guide into /app
  git clone https://github.com/gramener/gramex-guide/ /app
  # Set up the app and add all dependencies.
  # The actual setup depends on your app.
  gramex setup /app
  # Now test your app. to see if it runs
  gramex
  # Then Exit the container
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

<asciinema-player src="gramex-help.json" cols="100" rows="22" idle-time-limit="0.5" font-size=""></asciinema-player>

If you see an error, see the [Troubleshooting](#troubleshooting) section.

To start a Gramex project, create a new folder and run `gramex init` from that folder by typing this in your terminal.

```bash
mkdir project
cd project
gramex init
```

You should see an output like this:

<asciinema-player src="../init/gramex-init.rec" cols="100" rows="20" idle-time-limit="0.5" font-size=""></asciinema-player>

Run `gramex`. This will start Gramex and show an output like this:

<asciinema-player src="../init/gramex-run.rec" cols="100" rows="20" idle-time-limit="0.5" font-size=""></asciinema-player>

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
