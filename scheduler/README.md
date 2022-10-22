---
title: Schedule tasks
prefix: Scheduler
icon: scheduler.png
desc: Run tasks at startup or at scheduled times
by: TeamGramener
type: library
...

[TOC]

The `schedule:` section in [gramex.yaml](gramex.yaml.source) lets you run tasks on
startup, at specific times or specific intervals. Here are some sample uses:

- email insights every Wednesday
- data refresh every 4 hours
- post a tweet at 7:15 am every day

Here is a sample configuration:

```yaml
schedule:
    run-on-startup:
        function: logging.info(msg="Scheduled msg (on startup)")
        startup: true
    run-every-hour:
        function: schedule_utils.log_time() # Log the current time
        minutes: 0            # when the minute strikes zero
        hours: '*'            # every hour
        utc: true             # in the UTC (not local) time zone
    run-at-specific-interval:
        function: schedule_utils.log_time() # Log the current time
        every: 4h 10m 30s     # Every 4 hours, 10 min, 30 seconds
```

Each named schedule section may the following keys:

- `function`: the [expression or pipeline](../function/) to run (**required**)
- `startup`:
  - `True` to run once at startup.
  - `"*"` to run once at startup, and every time the config changes.
  - `False` to only run on schedule (Default: `False`).
- `thread`: `True` to run in a separate thread, without blocking Gramex (Default: `False`)
- In addition, you can use the [Schedule timing](#schedule-timing) keys to schedule the run.


## Schedule timing

- `every`: to run at an interval. Values can be like `1.5 min`, `2 hrs 15 min`, etc.
- `years`: which year(s) to run on (e.g. `2020-2025`)
- `months`: which month(s) to run on (e.g. `3-5` or `Mar, Apr, May`). Use numbers or 3-letter abbreviations (Jan, Feb, Mar, etc.)
- `dates`: which date(s) to run on (e.g. `7, 14, 21, 28`)
- `weekdays`: which weekdays(s) to run on (e.g. `3, 4` or `Wed, Thu`). Use numbers or 3-letter abbreviations (Mon, Tue, Wed, etc.). Monday is 1.
- `hours`: which hour(s) to run at (e.g. `9-17`)
- `minutes`: which minute(s) to run at (e.g. `0, 30`)
- There is no `seconds:`. Use `every:` to specify runs in seconds
- `utc`: `True` to run the schedule in UTC time zone. (Default: `False` for local time zone)

The `minutes`, `hours`, `dates`, `weekdays`, `months` and `years` keys can take these values:

- `*`: use all possible values, i.e. every minute, every hour, etc.
- `3,4,5`: use multiple values separated by commas
- `1-5`: use range of values
- `*/4`: repeat every 4th time, i.e. every 4th minute, 4th hour, etc.
- `8-16/2`: repeat every 2nd time between 8 to 16. Same as `8,10,12,14,16`

Here are some examples:

```yaml
# Run only on startup, and never run again
    startup: true
# Run on startup, and re-runs every time the YAML file changes:
    startup: '*'
# Run every hour, on the hour (i.e. minutes=seconds=0), in a separate thread:
    hours: '*'
    thread: true
# Run every 2 hours, on the hour, from 9 am to 5 pm, and on startup
    hours: 9-17/2
# Run at 8 am, 10 am, 12 noon, 2 pm, 6 pm daily (local time), and on startup
    hours: 8, 10, 12, 14, 18
    startup: true
    utc: false    # use local time
# Run at 5:30 am UTC (not local time zone) daily
    hours: 5
    minutes: 30
    utc: true
# Run on the first and 15th of every month at 10:30 am UTC
    dates: 1, 15
    hours: 10
    minutes: 30
    utc: true
# Run every Saturday at 2 am UTC
    weekday: sat
    hours: 2
    utc: true
# Run at the 15th and 45th minute every 4 hours on the first and last day of the month
# (if it's a weekday) in 2016-2025.
    minutes: '15, 45'           # Every 15th & 45th minute
    hours: '*/4'                # Every 4 hours
    dates: '1, L'               # On the first and last days of the month
    weekdays: 'mon-fri'         # On weekdays
    months: '*'                 # In every month
    years: '2016-2025'         # Of the specified years
# Run every 90 seconds
    every: 90s
# Run every minute and a half (same as 90 seconds)
    every: 1 min 30 sec
# Run every 2.5 hours
    every: 2.5 hours
```

If the function takes long and runs beyond the next scheduled time, it skips the next schedule
and continues on schedule after that.

For example, a function scheduled every 10 seconds but takes 15 seconds to run will actually run
every 20 seconds.

## Dynamic scheduling

If you want different actions at different frequencies, use a single scheduler at the highest common frequency.

For example, to send alerts to users daily or weekly based on their preference, use:

```yaml
schedule:
  email-alerts:
    # Check if email alerts need to be sent at 5 am UTC every day
    function: mymodule.check_email_alerts()
    hour: 5
    utc: true
```

In your function, figure out whether to send the email. For example:

```py
def check_email_alerts():
    # Load a database that has user preferences and last run details
    users = gramex.data.filter(url=db_url, table=table)
    now = datetime.datetime.now()
    long_ago = datetime.datetime(2000, 1, 1)
    # For each user, get the last run time and frequency
    for index, user in users.iterrows():
        next_run_time = (user['last_run'] or long_ago) + user['frequency_in_days'] * 24 * 60 * 60
        # If it hasn't run yet, email the user and update the last run time
        if now >= next_run_time:
            mailer.mail(to=user['email'], ...),
            gramex.data.update(url=db_url, table=table, id=['email'], args={
                'email': [user['email']], 'last_run': [now]})
```

## Scheduler preview

You can run schedules manually using the
[Admin Schedule](../admin/#admin-schedule) component at
[/admin/schedule](../admin/admin/schedule).


## Scheduler API

You can run an existing scheduler programmatically. This code runs the schedule
named `run-when-i-say`.

```python
from gramex import service      # Available only if Gramex is running
gramex.service.schedule['run-when-i-say'].run()
```

If it has a schedule, `.run()` will clear past schedules and set up a new
schedule.

You can create or update a scheduler dynamically. For example, this
FunctionHandler changes a schedule based on the URL's `?minutes=` parameter:

```python
from gramex.services.scheduler import Task

def update_schedule(handler):
    from gramex import service      # Available only if Gramex is running
    # If our scheduler is already set up, stop it first
    if 'custom-schedule' in service.schedule:
        service.schedule['custom-schedule'].stop()
    # Create a new scheduler with this configuration
    schedule = AttrDict(
        function=scheduler_method,            # Run this function
        minutes=handler.get_arg('minutes'),   # ... based on the URL's ?minutes=
    )
    # Set up a new scheduled task. This will at the minute specified by ?minutes=
    service.schedule['custom-schedule'] = Task(
        'custom-schedule', schedule, service.threadpool)
```
