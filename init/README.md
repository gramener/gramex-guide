---
title: Gramex init
prefix: Init
...

To start a Gramex project, run `gramex init` on your terminal. You should see an output like this:

<link rel="stylesheet" type="text/css" href="../node_modules/asciinema-player/resources/public/css/asciinema-player.css">
<asciinema-player src="gramex-init.rec" cols="100" rows="20" idle-time-limit="0.5" font-size=""></asciinema-player>

It initializes a `git` repository and creates these files:

- `README.md`: project documentation
- `gramex.yaml`: Gramex [configuration](../config/)
- `index.html`: default home page
- `login.html`: default login page
- `style.scss`: custom SCSS styles page
- `template-navbar.html`: default navigation bar
- `package.json`: [npm](https://www.npmjs.com/) package file with recommended dependencies

... and a set of configurations that help development.

- `.eslintrc.yml` [info](https://eslint.org/docs/user-guide/configuring)
- `.flake8` [info](http://flake8.pycqa.org/en/latest/user/configuration.html)
- `.gitignore` [info](https://git-scm.com/docs/gitignore)
- `.gitlab-ci.yml` [info](https://docs.gitlab.com/ce/ci/yaml/)
- `.secrets.yml` [info](../deploy/#secretsyaml)

Note: `gramex init` is **optional**. You can create a Gramex project from scratch by just creating
an empty `gramex.yaml`.

Run `gramex`. This will start Gramex and show an output like this:

<asciinema-player src="gramex-run.rec" cols="100" rows="20" idle-time-limit="0.5" font-size=""></asciinema-player>

Open <http://localhost:9988/> in your browser, and you should see the sample app.

## Minimal init

To install the minimal files required to run Gramex, run `gramex init minimal` on your terminal.

<asciinema-player src="gramex-init-minimal.rec" cols="100" rows="20" idle-time-limit="0.5" font-size=""></asciinema-player>

It initializes a `git` repository and creates these files:

- `gramex.yaml`: Gramex [configuration](../config/)
- `index.html`: default home page

Run `gramex` to see the output.

<script src="../node_modules/asciinema-player/resources/public/js/asciinema-player.js"></script>
