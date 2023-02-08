---
title: Debug Gramex
prefix: Debug
...

[TOC]

## Browser on startup

[Video](https://youtu.be/ywS5RAIxfB0){.youtube}

To open the browser when Gramex starts, use `--browser`. To prevent opening the
browser on startup, use `--browser=false`.

If `gramex.yaml` is missing in the directory from where Gramex is run, Gramex will report an error.

You can also press `Ctrl+B` on the Gramex console at any point to start the
browser.

To start the browser at a specific URL, use `--browser=url`. The URL need not be
a local URL.

To save this setting locally, use `gramex run <appname> --target=. --browser`.
The next time you run `gramex run <appname>`, the setting will be saved. To
disable the `--browser` option, use `--browser=` (note the `=` at the end.)

You can add it to [gramex.yaml](../config/) under `app` as `browser: true`,
`browser: url` or `browser: false`.

## Reloading

[Video](https://youtu.be/scnW3MhXP64){.youtube}

**Configurations auto-reload**. By default, Gramex auto-reloads `gramex.yaml`
configurations (including any imported files). If you have a
[FunctionHandler](../functionhandler/) defined as:

```yaml
url:
    pattern: /$YAMLURL/func/
    handler: FunctionHandler
    kwargs:
        function: yourmodule.run
```

When `yourmodule.py` is reloaded, the FunctionHandler automatically recompiles
the new function (Gramex 1.19 onwards.)

**Modules can auto-reload**. If you are manually importing any functions via an
`import` statement in Python or template code, call
[gramex.cache.reload_module](../cache/#module-caching). This ensures that modules
are reloaded if required. For example:

```python
import yourmodule1
import yourmodule2
import gramex.cache
gramex.cache.reload_module(yourmodule1, yourmodule2)
```

**Files can auto-reload**. When using [FileHandler](../filehandler/), files and
modules are always auto-reloaded. So are
[Login templates](../auth/#login-templates),
[DataHandler templates](../datahandler/#datahandler-templates),
[QueryHandler templates](../queryhandler/#queryhandler-templates), etc.

When your code loads files, use [gramex.cache.open](../cache/#data-caching). This
auto-reloads files if they have changed.

**Queries can auto-reload**. For SQL data, use
[gramex.cache.query](../cache/#query-caching). This re-runs the query if state
has changed.

## Debug mode

Press `Ctrl+D` on the console to start the [Python debugger](#python-debugger)
inside Gramex at any time.

Run `gramex --settings.debug` to trigger the [debug mode][debug-mode].
When any template or Python file changes, the application will reload.

On Windows, you need to run `python -m gramex --settings.debug` instead,
due to a [Tornado issue](https://github.com/bokeh/bokeh/issues/8529#issuecomment-451328922).

[debug-mode]: http://www.tornadoweb.org/en/stable/guide/running.html?highlight=debug#debug-mode-and-automatic-reloading


## Python debugger

[Video](https://youtu.be/FcjJMpNrCRw){.youtube}

The Python debugger lets you stop, inspect and step through code line-by-line.
You can learn more from this
[video tutorial on pdb](https://www.youtube.com/watch?v=ChuU3NlYRLQ) and this
[detailed talk](https://www.youtube.com/watch?v=lnlZGhnULn4).

There are many ways to start the debugger:

1. Add this line: `breakpoint()` to your code. Python will
   run until this line and start the debugger.
2. When Gramex is running, you press `Ctrl+D` on the console at any time. Python
   will start the debugger.
3. Run `gramex --settings.debug`. When there's an exception, Python will start
   the debugger at the line before the error. (This was called `debug_exception`
   in Gramex 1.0.7 and `debug.exception` in Gramex 1.0.8. It is not merged into
   `settings.debug`.)
4. Run Gramex via `python -m pdb /path/to/gramex/__main__.py`.

**v1.88**. You can replace the default Python debugger `pdb` by setting the
[`PYTHONBREAKPOINT`](https://peps.python.org/pep-0553/) environment variable:

- [`PYTHONBREAKPOINT=ipdb.set_trace`](https://github.com/gotcha/ipdb) - IPython-enabled pdb
- [`PYTHONBREAKPOINT=pdbpp.set_trace`](https://github.com/pdbpp/pdbpp) - a drop-in replacement for pdb
- [`PYTHONBREAKPOINT=pudb.set_trace`](https://documen.tician.de/pudb/) - a full-screen console-based debugger
- [`PYTHONBREAKPOINT=wdb.set_trace`](https://github.com/Kozea/wdb) - a web debugger
- [`PYTHONBREAKPOINT=webpdb.set_trace`](https://github.com/romanvm/python-web-pdb) - a web UI for pdb

Here are some useful things you can do on the debugger:

- Break at a function: `b <function>`, then run by typing `c`.
- Reload a module. `import(<module>); reload(<module>)`
- Print Gramex URL configuration. `import gramex, yaml; p yaml.dump(gramex.conf.url)`

Useful commands you can use on the debugger:

```bash
c                 # Continue running the program
pp value          # Pretty-print value
!<python-code>    # Run the Python code in the current context
b function        # Set a breakpoint at a function
b file:line       # Set a breakpoint at file, on line
clear function    # Clear breakpoint at a function
s or step         # Step into the current line's function
n or next         # Next line (without entering the current function)
l or list         # List the code
h or help         # Help -- list available commands
```


## Print statements

[Video](https://youtu.be/YfwtllON8gw){.youtube}

`gramex.debug.print()` is an improved `print` function for debugging. For example:

```python
from gramex.debug import print

def run():
    print('we are here')
```

... will print: `d:/path/to/module.py(7).run: we are here`

It's better to use keyword arguments -- this also prints variable names:

```python
>>> val = [10, 20]
>>> print(val=val)

<stdin>(1).<module>:
 .. val = [10, 20]
```

It pretty-prints complex variables. For example:

```python
>>> print(val=['This is a long sentence, repeated thrice. '] * 3)

<stdin>(1).<module>:
 .. val = [   'This is a long sentence, repeated thrice. ',
 ..           'This is a long sentence, repeated thrice. ',
 ..           'This is a long sentence, repeated thrice. ']
```

Remember to remove all print statements before committing your code.


## Tracing

[Video](https://youtu.be/RqIRbn49lC0){.youtube}

Add the `@gramex.debug.trace()` decorator before any function to print every line
it executes. For example:

```python
from gramex.debug import trace

@trace()
def run():
    x = 1
    y = 2
    return x + y
```

... will print:

```text
 --- modulename: module, funcname: run
module.py(5):     x = 1
module.py(6):     y = 2
module.py(7):     return x + y
```

Remember to remove all trace statements before committing your code.


## Profiling

[Video](https://youtu.be/qJdsvQuUJyQ){.youtube}

`gramex.debug` provides support for timing and line profiling via `timer`,
`Timer` and `lineprofile`.

### Timer

`timer()` prints the time since last called. For example:

```python
from gramex.debug import timer

def function(handler):
    timer('start')
    some_code()
    timer('ran some_code()')
```

prints this log message:

```text
I 05-May 08:16:38 debug:54 0.102s start [module.function:56]
I 05-May 08:16:38 debug:54 0.012s ran some_code() [module.function:58]
```

The log message includes the time taken to get to the line (e.g. `0.102s`), the
message logged, and the `module.function:line-number` from where the `timer()`
was called.


`Timer()` is similar to `timer()`, but shows the time for an block of code. For
example:

```python
from gramex.debug import Timer

def function(handler):
    with Timer('run some_code()'):
        some_code()
```

prints this log message:

```text
I 05-May 08:16:38 debug:54 0.012s run some_code() [module.function:56]
```

The log message includes the time taken to get to the line (e.g. `0.102s`), the
message logged, and the `module.function:line-number` from where the `Timer()`
was called.

### Line profile

`lineprofile` is a decorator that prints the time taken for each line of a
function every time it is called. This example prints each line's performance:

```python
import pandas as pd
from gramex.debug import lineprofile

@lineprofile
def calc():
    data = pd.Series([x*x for x in range(1000)])
    diff = data.diff()
    acf = data.autocorr()
    return acf
```

Running `calc()` prints this result:

```text
Timer unit: 3.52616e-07 s

Total time: 0.00198735 s
File: <ipython-input-8-af6a7bd543d9>
Function: calc at line 4

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
     4                                           @lineprofile
     5                                           def calc():
     6      1001         3023      3.0     53.6      data = pd.Series([x*x for x in range(1000)])
     7         1          613    613.0     10.9      diff = data.diff()
     8         1         1998   1998.0     35.5      acf = data.autocorr()
     9         1            2      2.0      0.0      return acf
```

The % time columns is noteworthy. This tells us that more than 50% of the time
is going into constructing the series in line 6.

This requires the [line_profiler](https://github.com/rkern/line_profiler) module.
Run `conda install line_profiler` to install it.
