---
title: Contributing to Gramex
prefix: Contributing
...

[TOC]

[Gramex Community Edition](https://github.com/gramener/gramex/) is open source. You're welcome to contribute by raising [issues](https://github.com/gramener/gramex/issues) and [pull requests](https://github.com/gramener/gramex/pulls).

## Set up Gramex for development

**Step 1**: Install
[Anaconda](http://continuum.io/downloads),
[NodeJS](https://nodejs.org/en/download/current/), and
[Git](https://git-scm.com/download). Add `node` and `git` to your `PATH`.

You also need `bash` to test. On Windows, this comes with [Git](https://git-scm.com/download).

**Step 2**: Clone and install the [master branch](http://github.com/gramener/gramex/tree/master/).

```bash
# Create a new Conda environment with Python 3.11+
conda create -y --name gramex python=3.11
conda activate gramex

# Clone and install Gramex
git clone git@github.com:gramener/gramex.git
cd gramex
# master branch is the latest working version.
# release branch is the latest released version.
git checkout master
pip install -e . --config-settings editable_mode=strict
gramex setup --all
```

**Step 3 (OPTIONAL)**: Install databases.

- [Redis](https://redis.io/download/) (on [Windows](https://github.com/microsoftarchive/redis))
- [MySQL](https://dev.mysql.com/downloads/) or [MariaDB](https://mariadb.org/download/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Elasticsearch](https://www.elastic.co/downloads/elasticsearch)

<!--
sudo apt-get install -y git sqlite3 postgresql postgresql-contrib libpq-dev python-dev
DEBIAN_FRONTEND=noninteractive apt-get -y -q install mysql-server
-->

## Test Gramex

You must [install Gramex Enterprise](../install/#install-gramex-enterprise) to run tests.

```bash
# Install gramex & gramexenterprise
pip install gramex gramexenterprise
gramex license accept

# Install dependencies
pip install -r tests/requirements.txt

# Run tests
bash task lint
nosetests
```

Gramex uses [nosetests](https://nose.readthedocs.io/en/latest/) for unit tests.
The tests are in 2 folders:

- [testlib/](https://github.com/gramener/gramex/tree/release/testlib/)
  has library tests that can run without starting Gramex.
- [tests/](https://github.com/gramener/gramex/tree/release/tests/)
  has URL-based tests that run after starting the Gramex server.

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

## Release Gramex Community Edition

Run tests:

1. Update Gramex version number in `pyproject.toml` and `gramex/__init__.py`.
2. Test the `master` branch locally on Python >= 3.7

```bash
bash task test
```

Upgrade npm packages and audit security. Ensure `reports/*` don't report errors:

```bash
bash task clean reformat update security stats
```

In [gramex-guide][gramex-guide]:

- Run `npm upgrade`
- In `release/README.md` -- add release entry
- Add [video tutorial](#video-tutorials) for all new features
- In `release/1.xx/README.md` -- add guide release notes.
- In `release/latest.json` -- add latest release notes.
- Run `python search/search.py` to update search index
- Run `node search/search-index.js` to update search index

[Commit](#committing) and push the `master` branch of both repos to the server.
**Ensure pipeline passes.**:

```bash
export VERSION=1.x.x
git commit . -m"DOC: Add v$VERSION release changes"
git push
```

Merge `master` branch with `release` on both repos:

```bash
git checkout release
git merge master
git tag -a v$VERSION -m"Release v$VERSION"
git push --follow-tags
git push gitlab release master  # Deploy into Gramener servers. See one-time setup below
git checkout master
```

Note: `git push gitlab release` requires this one-time setup:

```bash
git remote add gitlab https://code.gramener.com/cto/gramex.git        # For Gramex
git remote add gitlab https://code.gramener.com/cto/gramex-guide.git  # For Guide
```

Then run these deployment steps on the Gramex repo:

```bash
# Deploy docs on https://gramener.com/gramex/guide/api/
bash task docs pushdocs

# Deploy on pypi: https://pypi.python.org/pypi/gramex
bash task pushpypi    # Log in as gramener

# Deploy on docker: https://hub.docker.com/r/gramener/gramex/
VERSION=1.x.x bash task builddocker pushdocker    # Log in as sanand0 / pratapvardhan
```

Gramener.com administrators: re-start Gramex after deployment.

## Release Gramex Enterprise Edition

Update the following and [commit to `master` branch](#committing):

- `setup.py` -- update the version number to the Gramex version number
- `README.md` -- update the CHANGELOG

[Commit](#committing) and push the `master` branch to the server. **Ensure pipeline passes.**:

```bash
git commit . -m"DOC: Add v1.x.x release notes"
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

Deploy on [PyPi](https://pypi.python.org/pypi/gramexenterprise):

```bash
rm -rf dist/
python setup.py sdist
# Set up ~/.pypirc with the API token for "gramener" account
# https://pypi.org/help/#apitoken
twine upload dist/*
```

Re-start gramex on deployed servers.

[gramex-guide]: https://github.com/gramener/gramex-guide/

## Committing

Begin the commit with a prefix:

- `ENH:` Enhancement
- `FIX:` Bug fix. (Avoid `BUG:`)
- `DOC:` Documentation
- `TST:` Addition or modification of tests
- `STY:` Style fix (whitespace, PEP8)
- `BLD:` Change related to building
- `API:` An (incompatible) API change, deprecation

Add a short subject line in imperative mood, e.g. `FIX: FileHandler transforms require encoding`.

Add a long body. Explain WHAT and WHY.

## Video tutorials

For each section of each page on the [guide](../), we add YouTube videos that explain that section.

For example, the [Function arguments from URL](../functionhandler/#function-arguments-from-url) page links to [this video](https://youtu.be/hSwQQ2wOmIk).

### Decide the storyline

- Decide who the audience is. Pick the 1-3 points they should take away. Mention these multiple times.
- Plan videos for 5 min or less. Long videos are hard to record and hard to watch.
- Open the Guide section to record.
- Explain the text.
- Explain the code. (Rewrite the Guide if required.)
- Execute the code and show the output.
- Show errors if they occur. It helps users debug
- Don't refer to outside that section (e.g., "You've already learned this", or "In a future video, we'll do ...").

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
  - Be in a quiet place.
  - Use your headset, not the laptop mic.
  - Test your mic volume. Make sure it's loud enough. (Windows: Settings > Sound Settings > Input > Device properties > Additional device properties and increase the Volume Boost).
  - Make sure your breathing is not audible. Make sure your sibilance ("sss") is not too loud. (Maybe keep the mic _above_ your mouth, not below. Use microphone sponge).
  - Enable noise reduction plugins if any (e.g. RRNoise on OBS).
- Planning tips
  - Turn off mobile and laptop alerts.
  - Keep your laptop on power, not battery. Recording encoding takes power.
  - Record in one session. Pause recording in the middle as required. Learn keyboard shortcuts for pausing.
  - Set aside time for 5-10 times the length of the video.
  - Listen to your recording. Re-record if required.

### Insert the video

Select "Share" on the YouTube video and copy the link, e.g. `https://youtu.be/hSwQQ2wOmIk` Then add this snippet to the beginning of the section:

```markdown
[Video](https://youtu.be/hSwQQ2wOmIk){.youtube}
```


## Docstrings

Docstrings are written in Markdown and compiled using [MkDocs](https://www.mkdocs.org/).

- Compile by running `bash task docs`
- Write docstrings in the [Google Style](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_google.html)
- Write cross-references as [Python paths](https://mkdocstrings.github.io/usage/#cross-references)
