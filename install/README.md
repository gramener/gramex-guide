---
title: Install Gramex
prefix: Install
...

[TOC]

## Installation

1. Install [Anaconda][anaconda] (any version from 5.2.0 to 2019.10)
2. Install [node.js][nodejs] 10 or later.
3. On a Mac, install [Xcode][xcode].
4. Run the following commands on the terminal

```bash
pip install gramex      # Install latest version of Gramex
npm install -g yarn     # Required for UI components and built-in apps
gramex setup --all      # Set up UI components and built-in apps
```

5. Create an empty `gramex.yaml` text file in a directory
6. Run `gramex` from that directory

Gramex runs at `http://127.0.0.1:9988/` and lists the files in your folder by
default. Press Ctrl-C to exit Gramex.

Gramex Enterprise is offered under a [commercial license](../license/) and
provides additional features. To install it, run:

```bash
pip install gramexenterprise    # Install Gramex Enterprise
gramex license accept           # Accept the Gramex license
```

## VSCode Extension

Install [`Gramex Snippets` extension](https://marketplace.visualstudio.com/items?itemName=gramener.gramexsnippets) for VSCode IDE for Gramex related code snippets. Visit [VSCode Extension](../extension/) page for more details.

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

## Uninstall Gramex

To remove Gramex, run `pip uninstall gramex`

## Alternate installations

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

## Docker install

Gramex is available as a docker instance. To run it:

```bash
docker pull gramener/gramex     # or docker pull gramener/gramex:1.27.0

# Run Gramex on port 9988
docker run --name gramex-instance -p 9988:9988 gramener/gramex

# Run bash inside the container
docker run --name gramex-instance -i -t -p 9988:9988 gramener/gramex /bin/bash

# To re-connect to the instance:
docker start -i -a gramex-instance

# Other useful commands
docker container ls           # list instances
docker rm gramex-instance     # delete instance
```

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

On a system **with an Internet connection** and the **same platform** (Windows/Linux) as the target system:

1. Install Docker (Docker CE/Docker Toolbox will both work - though CE is easier to use)
2. In a Docker shell (Windows) or any shell(Linux) run the command `docker pull gramener/gramex`
3. Run `docker images` to verify that the image has been downloaded to the machine.
4. Run `docker save gramener/gramex > gramex-latest.tar`
5. (Optional) Split the saved image into smaller files for easier transfer using `split -b 100M gramex-latest.tar "gramex-latest.part*"`
6. Install docker on the target machine using [binaries](https://docs.docker.com/install/linux/docker-ce/binaries/#next-steps)
7. Transfer the tar file/parts of the tar file to the destination machine
8. (Optional, if files were split) recombine split files using the command `cat gramex-latest.part* > gramex-latest.tar`
9. run `docker load < gramex-latest.tar`
10. run `docker images` on the destination machine to verify that the image is loaded.
11. Post this, you can create custom dockerfiles/use docker run to use the gramex.
