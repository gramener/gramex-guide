---
title: Contributing to Gramex
prefix: Contributing
...

[TOC]

## Set up Gramex

- The [release branch](http://github.com/gramener/gramex/tree/release/)
  holds the latest stable version.
- The [master branch](http://github.com/gramener/gramex/tree/master/) has the
  latest working version
- All other branches are temporary feature branches

Gramex can be developed on Python >= 3.7 on Windows or Linux.
To set up the development environment:

1. Download and install [Anaconda 5.0](http://continuum.io/downloads) or later
2. Install databases. Install PostgreSQL and MySQL. On Linux, this works:

```bash
sudo apt-get install -y git make sqlite3 postgresql postgresql-contrib libpq-dev python-dev
DEBIAN_FRONTEND=noninteractive apt-get -y -q install mysql-server
```

Clone and install the [master branch](http://github.com/gramener/gramex/tree/master/).

```bash
git clone git@github.com:gramener/gramex.git
cd gramex
git checkout master     # Optional
pip install -e .
gramex setup --all
```

## Test Gramex

Gramex uses [nosetests](https://nose.readthedocs.io/en/latest/) for unit tests.
The tests are in 2 folders:

- [testlib/](https://github.com/gramener/gramex/tree/release/testlib/)
  has library tests that can run without starting Gramex.
- [tests/](https://github.com/gramener/gramex/tree/release/tests/)
  has URL-based tests that run after starting the Gramex server.

Run `make test-setup` for the first time. Then you can run `nosetests`.

You must [install Gramex Enterprise](../install/#install-gramex-enterprise) to run tests.

```bash
pip install gramexenterprise    # Install Gramex Enterprise
gramex license accept           # Accept the Gramex license
```

The tests take long. To test a subset, use `nosetests tests.<module>:<ClassName>.<method>`. For example:

```bash
make test-setup                             # Run once to install dependencies
nosetests testlib                           # Only test the libraries
nosetests testlib.test_data                 # Only run testlib/test_data.py
nosetests testlib.test_data:TestFilter      # Only run the TestFilter class
nosetests testlib.test_data:TestFilter.test_get_engine      # Run a single method
```

You can also see the code coverage and how long each test takes

```bash
NOSE_WITH_COVERAGE=1 nosetests      # Show code coverage. Store line-by-line results in htmlcov/
NOSE_WITH_TIMER=1 nosetests         # Show time taken for each test
```

## Update Gramex Community Edition

In the gramex folder, create a branch for local development.

```bash
git checkout -b <branch-name>
```

Make your changes and check for build errors.

```bash
flake8                      # if you changed any .py files
eslint gramex/apps          # if you changed any .js files
python setup.py nosetests   # if you changed any functionality
```

On Windows, you may need to [enable Powershell scripts](http://stackoverflow.com/a/18533754/100904).

The tests take a long time. To test a subset, use `nosetests tests.<module>:<ClassName>.<method>`.

Commit your changes and push your branch:

```bash
git add .
git commit -m"Your detailed description of your changes."
git push --set-upstream origin <branch-name>
```

Submit a pull request to the [master branch](http://github.com/gramener/gramex/tree/master/).
If possible:

- Write unit tests
- Document Python docstrings
- Document the feature in the guide at [gramex-guide][gramex-guide]


## Release Gramex Community Edition

Check [build errors](https://travis-ci.com/gramener/gramex).
Test the `master` branch locally on Python >= 3.7:

```bash
make test
```

Set up apps and & upgrade npm packages.

```bash
# yarn upgrade --cwd gramex/apps/admin/
yarn upgrade --cwd gramex/apps/admin2/
yarn upgrade --cwd gramex/apps/capture/
yarn upgrade --cwd gramex/apps/configeditor/
yarn upgrade --cwd gramex/apps/filemanager/
yarn upgrade --cwd gramex/apps/logviewer/
yarn upgrade --cwd gramex/apps/pynode/
yarn upgrade --cwd gramex/apps/ui/
```

Update the following and commit to `master` branch:

- In gramex:
    - `gramex/release.json` -- update the version number
    - `gramex/apps.yaml` -- update the version number on the guide
- In [gramex-guide][gramex-guide]
    - `release/README.md` -- add release entry
    - `release/1.xx/README.md` -- add guide release notes. Run `make stats` for code size stats. Take coverage stats from Travis
    - `python search/search.py` to update search index
    - `node search/searchindex.js` to update search index

Commit and push the `master` branch of both repos to the server.
**Ensure pipeline passes.**:

```bash
git commit -m"DOC: Add v1.x.x release changes"
git push                    # Push the master branch
```

Merge `master` branch with `release` on both repos:

```bash
git checkout release
git merge master
git tag -a v1.x.x -m"One-line summary of features"
git push --follow-tags
git push gitlab release      # To deploy into Gramener servers. See one-time setup below
git checkout master          # Switch back to master
```

Note: `git push gitlab release` requires this one-time setup:

```bash
git remote add gitlab git@code.gramener.com:cto/gramex.git        # For Gramex
git remote add gitlab git@code.gramener.com:cto/gramex-guide.git  # For Guide
```

Gramener.com administrators: re-start Gramex after deployment.

Deploy on [gramener.com](https://gramener.com/gramex-update/),
then [pypi](https://pypi.python.org/pypi/gramex),
then [docker](https://hub.docker.com/r/gramener/gramex/).

```bash
make push-pypi                # Log in as gramener
make push-docker              # Log in as sanand0 / pratapvardhan
make push-docs push-coverage  # Push docs and coverage tests
```

## Release Gramex Enterprise Edition

Update the following and commit to `master` branch:

- `setup.py` -- update the version number to the Gramex version number
- TODO: document CHANGELOG, etc.

Commit and push the `master` branch to the server. **Ensure pipeline passes.**:

```bash
git commit -m"DOC: Add v1.x.x release notes"
git push                    # Push the master branch
```

Merge with release, create an annotated tag and push the release branch:

```bash
git checkout release
git merge master
git tag -a v1.x.x -m"One-line summary of features"
git push --follow-tags
git checkout master         # Switch back to master
git merge release
```

Deploy on [pypi](https://pypi.python.org/pypi/gramexenterprise):

```bash
rm -rf dist/
python setup.py sdist
# If this fails, add '-p PASSWORD'
twine upload -u gramener dist/*
```
Re-start gramex on deployed servers.

[gramex-guide]: https://github.com/gramener/gramex-guide/
