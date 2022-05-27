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

Run tests:

1. Check [Travis build errors](https://travis-ci.com/gramener/gramex).
2. Test the `master` branch locally on Python >= 3.7:

```bash
make test
```

Upgrade npm packages and audit security:

```bash
make update-npm
make security
```

If there are any security errors reported in `reports/*`, fix them and run `make security` again
until there are no security errors.

Update the following and commit to `master` branch:

- In `gramex/release.json` -- update the version number
- In `gramex/apps.yaml` -- update the version number on the guide
- In `gramex/apps/ui/package.json` -- update the version number

In [gramex-guide][gramex-guide]:

- Run `npm upgrade`
- In `release/README.md` -- add release entry
- Add [video tutorial](#video-tutorial) for all new features
- In `release/1.xx/README.md` -- add guide release notes.
  - Run `make stats` for code size stats. Take coverage stats from Travis
- In `release/latest.json` -- add latest release notes.
- Run `npm run lint` and fix any Markdown issues
- Run `python search/search.py` to update search index
- Run `node search/searchindex.js` to update search index

Commit and push the `master` branch of both repos to the server.
**Ensure pipeline passes.**:

```bash
git commit . -m"DOC: Add v1.x.x release changes"    # Replace x.x
git push
```

Merge `master` branch with `release` on both repos:

```bash
git checkout release
git merge master
git tag -a v1.x.x -m"One-line summary of features"  # Replace x.x
git push --follow-tags
git push gitlab release      # To deploy into Gramener servers. See one-time setup below
git checkout master          # Switch back to master
```

Note: `git push gitlab release` requires this one-time setup:

```bash
git remote add gitlab git@code.gramener.com:cto/gramex.git        # For Gramex
git remote add gitlab git@code.gramener.com:cto/gramex-guide.git  # For Guide
```

Then run these deployment steps on the Gramex repo:

```bash
# Deploy docs on https://learn.gramener.com/gramex/
make push-docs                # Deploy pydoc

# Deploy on pypi: https://pypi.python.org/pypi/gramex
make push-pypi                # Log in as gramener

# Deploy on conda (Windows): https://anaconda.org/gramener/gramex
# Run this from any temporary directory on a Windows system.
# Ensure that you have Git LFS on your system.
git clone https://github.com/gramener/gramex.git -b release
cd gramex
pip install -e .

# Follow instructions to upload. Log in as gramener
# Replace the path to the Gramex tarball below. It will by under anaconda/conda-bld
make conda
anaconda upload D:/path/to/conda-bld/win-64/gramex-1.<version>.tar.bz2

# Now you can delete this Gramex folder and restore your Gramex via pip install gramex

# Deploy on docker: https://hub.docker.com/r/gramener/gramex/
make push-docker              # Log in as sanand0 / pratapvardhan
```

Note: to run `make conda` on Linux, create a new Docker instance via
`docker run -it continuumio/miniconda3 /bin/bash` and run:

```bash
apt-get update                                    # Update packages
apt-get install -y make gcc                       # make and gcc are the sole dependencies
conda install -y conda-build anaconda             # Required for build
git clone https://github.com/gramener/gramex/ -b release    # Clone Gramex release branch
cd gramex                                         # Change into gramex dir
pip install -e .                                  # Test gramex, and get orderedattrdict
make conda                                        # Create conda
anaconda upload /opt/conda/conda-bld/linux-64/gramex-*.tar.bz2    # Log in as gramener
```


Gramener.com administrators: re-start Gramex after deployment.

## Release Gramex Enterprise Edition

Update the following and commit to `master` branch:

- `setup.py` -- update the version number to the Gramex version number
- `README.md` -- update the CHANGELOG

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

## Video tutorials

For each section of each page on the [guide](../), we add YouTube videos that explain that section.

For example, the [Function arguments from URL](../functionhandler/#function-arguments-from-url) page links to [this video](https://youtu.be/hSwQQ2wOmIk).

### Decide the storyline

- Decide who the audience is. Pick the 1-3 points they should take away. Mention these multiple times.
- Open the section of the guide to record.
- Talk through the section, explaining the code. If required, revise the documentation.
- Show how to execute the code samples and the output.
- Show any relevant errors they might encounter.
- Don't refer to anything outside the section (e.g., "You've already learned this", or "In a future video, we'll do ...").

### Record the video

- Use any full-screen recording tool you're comfortable with.
  - [PowerPoint screen recording](https://support.microsoft.com/en-us/office/record-your-screen-in-powerpoint-0b4c3f65-534c-4cf1-9c59-402b6e9d79d0)
  - [Microsoft Stream](https://web.microsoftstream.com/) > Create > Record screen or video
  - [Open Broadcaster Studio](https://obsproject.com/)
- Upload to [Gramener's channel on YouTube](https://www.youtube.com/channel/UC6Av2xW5pfCmFtseY4uWzzg/)
- Video recording tips
  - Screen resolution: At least 1280x720. 1920x1080 if possible.
  - Font size: Make sure you can read the screen at clearly at 2 arms' length.
- Audio recording tips
  - Use your headset, not the laptop mic.
  - Test your mic volume. Make sure it's loud enough. (Windows: Settings > Sound Settings > Input > Device properties > Additional device properties and increase the Volume Boost).
  - Make sure your breathing is not audible. Make sure your sibilance ("sss") is not too loud. (Maybe keep the mic *above* your mouth, not below. Use microphone sponge).
  - Enable noise reduction plugins if any (e.g. RRNoise on OBS).
- Planning tips
  - Keep your laptop on power, not battery. Recording encoding takes power.
  - Keep the recording to 5 min or less.
  - Record in one session. Pause recording in the middle as required. Learn keyboard shortcuts for pausing.
  - Set aside time for 5-10 times the length of the video.
  - Listen to your recording. Re-record if required.

### Insert the video

Select "Share" on the YouTube video and copy the link, e.g. `https://youtu.be/hSwQQ2wOmIk` Then add this snippet to the beginning of the section:

```markdown
[Video](https://youtu.be/hSwQQ2wOmIk){.youtube}
```
