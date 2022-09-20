---
title: Third party libraries
prefix: Third Party
...

Gramex uses open source third party libraries that use one of these licenses:

- [PSF license][PSF] (Python Software Foundation)
- [MIT license][MIT]
- [BSD license][BSD]
- [LGPL license][LGPL]
- [Apache license][Apache]
- [ISC license][ISC]

## Languages

- [Python](https://www.python.org/): [PSF license][PSF]
  - [Anaconda](https://docs.anaconda.com/anaconda/) distribution: [BSD license][BSD]
- [node.js](https://github.com/nodejs/node/blob/master/LICENSE): [MIT license][MIT]

## Python libraries
<!-- Keep this in sync with gramex/release.json -->

- [argh](https://pypi.python.org/pypi/argh/): [LGPL license][LGPL]
- [astor](https://pypi.python.org/pypi/argh/): [LGPL license][LGPL]
- [cachetools](https://pypi.python.org/pypi/cachetools/): [MIT license][MIT]
- [colorama](https://pypi.python.org/pypi/colorama/): [BSD license][BSD]
- [colorlog](https://pypi.python.org/pypi/colorlog/): [MIT license][MIT]
- [cron-descriptor](https://pypi.python.org/pypi/cron-descriptor/): [MIT license][MIT]
- [crontab](https://pypi.python.org/pypi/crontab/): [LGPL license][LGPL]
- [diskcache](https://pypi.python.org/pypi/diskcache/): [Apache license][Apache]
- [h5py](https://pypi.python.org/pypi/h5py/): [MIT license][MIT]
- [joblib](https://pypi.org/project/joblib/): [BSD license][BSD]
- [lxml](https://pypi.org/project/lxml/): [BSD license][BSD]
- [markdown](https://pypi.python.org/pypi/markdown/): [BSD license][BSD]
- [matplotlib](https://pypi.python.org/pypi/matplotlib/): [PSF license][PSF]
- [numpy](https://pypi.python.org/pypi/numpy/): [BSD license][BSD]
- [oauthlib](https://pypi.python.org/pypi/oauthlib/): [BSD license][BSD]
- [openpyxl](https://pypi.python.org/pypi/openpyxl/): [MIT license][MIT]
- [orderedattrdict](https://pypi.python.org/pypi/orderedattrdict/): [MIT license][MIT]
- [pandas](https://pypi.python.org/pypi/pandas/): [BSD license][BSD]
- [passlib](https://pypi.python.org/pypi/passlib/): [BSD license][BSD]
- [pathtools](https://pypi.python.org/pypi/pathtools/): [MIT license][MIT]
- [psutil](https://pypi.python.org/pypi/psutil/): [BSD license][BSD]
- [pymysql](https://pypi.python.org/pypi/pymysql/): [MIT license][MIT]
- [python-pptx](https://pypi.python.org/pypi/python-pptx/): [MIT license][MIT]
- [python-slugify](https://pypi.python.org/pypi/python-slugify/): [MIT license][MIT]
- [pyyaml](https://pypi.python.org/pypi/pyyaml/): [MIT license][MIT]
- [redis](https://pypi.org/project/redis/): [MIT license][MIT]
- [requests](https://pypi.org/project/requests/): [Apache license][Apache]
- [scikit-learn](https://pypi.org/project/scikit-learn/): [BSD license][BSD]
- [seaborn](https://pypi.org/project/seaborn/): [BSD license][BSD]
- [setuptools](https://pypi.python.org/pypi/setuptools/): [MIT license][MIT]
- [shutilwhich](https://pypi.python.org/pypi/shutilwhich/): [PSF license][PSF]
- [six](https://pypi.python.org/pypi/six/): [MIT license][MIT]
- [sqlalchemy](https://pypi.org/project/SQLAlchemy/): [MIT license][MIT]
- [sqlitedict](https://pypi.org/project/sqlitedict/): [Apache license][Apache]
- [tables](https://pypi.org/project/tables): [BSD license][BSD]
- [tornado](https://pypi.python.org/pypi/tornado/): [Apache license][Apache]
- [tzlocal](https://pypi.python.org/pypi/tzlocal/): [MIT license][MIT]
- [watchdog](https://pypi.python.org/pypi/watchdog/): [Apache license][Apache]
- [xlrd](https://pypi.python.org/pypi/xlrd/): [BSD license][BSD]

Optional libraries:
<!-- Keep this in sync with libraries that we check ImportError for -->

- [conda](https://pypi.python.org/pypi/conda)
- [elasticsearch](https://pypi.python.org/pypi/elasticsearch)
- [ipdb](https://pypi.python.org/pypi/ipdb)
- [ldap3](https://pypi.python.org/pypi/ldap3/): [LGPL license][LGPL]
- [line_profiler](https://pypi.python.org/pypi/line_profiler)
- [psycopg2](https://pypi.python.org/pypi/psycopg2/): [LGPL license][LGPL]
- [pytest](https://pypi.org/project/pytest/): [MIT license][MIT]
- [rpy2](https://pypi.python.org/pypi/rpy2)
- [statsmodels](https://pypi.python.org/pypi/statsmodels)
- [transformers](https://pypi.python.org/pypi/transformers)

## JavaScript libraries
<!-- find gramex -name package.json | grep -v node_modules | xargs jq '.dependencies, .devDependencies' -->

- [NodeJS](https://nodejs.org/): [Node][Node]
- [@fortawesome/fontawesome-free](https://npmjs.com/package/@fortawesome/fontawesome-free): [MIT license][MIT]
- [@vue/cli-service](https://npmjs.com/package/@vue/cli-service): [MIT license][MIT]
- [body-parser](https://www.npmjs.com/package/body-parser): [MIT license][MIT]
- [bootstrap-icons](https://npmjs.com/package/bootstrap-icons): [MIT license][MIT]
- [bootstrap-select-dropdown](https://www.npmjs.com/package/bootstrap-select-dropdown): [ISC license][ISC]
- [bootstrap-select](https://www.npmjs.com/package/bootstrap-select): [MIT license][MIT]
- [bootstrap](https://www.npmjs.com/package/bootstrap): [MIT license][MIT]
- [bootswatch](https://github.com/thomaspark/bootswatch/): [MIT license][MIT]
- [clipboard](https://www.npmjs.com/package/clipboard): [MIT license][MIT]
- [comicgen](https://npmjs.com/package/comicgen): [MIT license][MIT]
- [cookie](https://www.npmjs.com/package/cookie): [MIT license][MIT]
- [d3-scale-chromatic](https://www.npmjs.com/package/d3-scale-chromatic): [BSD license][BSD]
- [d3](https://www.npmjs.com/package/d3): [BSD license][BSD]
- [datarangepicker](https://www.npmjs.com/package/daterangepicker): [MIT license][MIT]
- [dayjs](https://npmjs.com/package/dayjs): [MIT license][MIT]
- [dropzone](https://www.npmjs.com/package/dropzone): [MIT license][MIT]
- [express](https://www.npmjs.com/package/express): [MIT license][MIT]
- [file-saver](https://npmjs.com/package/file-saver): [MIT license][MIT]
- [font-awesome](https://www.npmjs.com/package/font-awesome): [MIT license][MIT]
- [g1](https://www.npmjs.com/package/g1): [MIT license][MIT]
- [jquery](https://www.npmjs.com/package/jquery): [MIT license][MIT]
- [jqueryui](https://npmjs.com/package/jqueryui): [MIT license][MIT]
- [jsoneditor](https://www.npmjs.com/package/jsoneditor): [Apache license][Apache]
- [leaflet](https://npmjs.com/package/leaflet): [BSD license][BSD]
- [leaflet](https://www.npmjs.com/package/leaflet): [BSD license][BSD]
- [lodash](https://www.npmjs.com/package/lodash): [MIT license][MIT]
- [minimist](https://www.npmjs.com/package/minimist): [MIT license][MIT]
- [moment](https://www.npmjs.com/package/moment): [MIT license][MIT]
- [morphdom](https://www.npmjs.com/package/morphdom): [MIT license][MIT]
- [noty](https://www.npmjs.com/package/noty): [MIT license][MIT]
- [numeral](https://www.npmjs.com/package/numeral): [MIT license][MIT]
- [officegen](https://www.npmjs.com/package/officegen): [MIT license][MIT]
- [popper](https://www.npmjs.com/package/popper.js): [MIT license][MIT]
- [prismjs](https://www.npmjs.com/package/prismjs): [MIT license][MIT]
- [puppeteer](https://www.npmjs.com/package/puppeteer): [Apache license][Apache]
- [rollup-plugin-htmlparts](https://npmjs.com/package/rollup-plugin-htmlparts): [MIT license][MIT]
- [rollup](https://npmjs.com/package/rollup): [MIT license][MIT]
- [sass](https://npmjs.com/package/sass): [MIT license][MIT]
- [select2](https://npmjs.com/package/select2): [MIT license][MIT]
- [select2](https://www.npmjs.com/package/select2): [MIT license][MIT]
- [tether-sheperd](https://www.npmjs.com/package/tether-shepherd): [MIT license][MIT]
- [tmp](https://www.npmjs.com/package/tmp): [MIT license][MIT]
- [topojson](https://www.npmjs.com/package/topojson): [BSD license][BSD]
- [ts](https://www.npmjs.com/package/ts): [MIT license][MIT]
- [uglify-js](https://www.npmjs.com/package/uglify-js): [BSD license][BSD]
- [uifactory](https://npmjs.com/package/uifactory): [MIT license][MIT]
- [url-search-params](https://www.npmjs.com/package/url-search-params): [MIT license][MIT]
- [vega-embed](https://www.npmjs.com/package/vega-embed): [BSD license][BSD]
- [vega-lite](https://www.npmjs.com/package/vega-lite): [BSD license][BSD]
- [vega](https://www.npmjs.com/package/vega): [BSD license][BSD]
- [vegam](https://www.npmjs.com/package/vegam): [MIT license][MIT]
- [vue-template-compiler](https://npmjs.com/package/vue-template-compiler): [MIT license][MIT]
- [vue](https://www.npmjs.com/package/vue): [MIT license][MIT]
- [which](https://www.npmjs.com/package/which): [ISC license][ISC]
- [ws](https://www.npmjs.com/package/ws): [MIT license][MIT]

## UI libraries

- [Bootstrap themes guide](https://github.com/ThemesGuide/bootstrap-themes): [MIT license][MIT]


[MIT]: https://opensource.org/licenses/MIT
[BSD]: https://opensource.org/licenses/BSD-3-Clause
[LGPL]: https://opensource.org/licenses/LGPL-3.0
[Apache]: https://opensource.org/licenses/Apache-2.0
[PSF]: https://opensource.org/licenses/Python-2.0
[ISC]: https://opensource.org/licenses/ISC
[Node]: https://github.com/nodejs/node/blob/master/LICENSE
