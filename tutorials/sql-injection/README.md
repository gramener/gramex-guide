---
title: Fixing SQL injection errors
prefix: sql-injection
...

[TOC]

This tutorial shows how to fix common SQL injection errors in Gramex.

## How to check for SQL injection

If you are *constructing* an SQL query by concatenating or formatting strings,
you are probably vulnerable to SQL injection.

Use [Bandit](https://bandit.readthedocs.io/en/latest/). It catches most SQL injection attacks.

In particular, [FormHandler queryfunction](../../formhandler/#formhandler-queryfunction) lets you create custom database queries based on user input, and is a common source of SQL injection attacks.

Here are some ways of preventing SQL injection attacks.

## Eliminate queryfunction

Say you have a `gramex.yaml`:

```yaml
url:
  data_roles:
    pattern: /roles
    handler: FormHandler
    kwargs:
      url: sqlite:///data.db
      queryfunction: queries.roles(args)
```

... and this `queries.py`:

```python
def roles(args):
    user = args.get('user')[0]
    return f'SELECT role FROM users WHERE user_id = "{user}"'
```

This is vulnerable to SQL injection. For example, if the user is `'; DROP TABLE user; --"`, the query will drop the user table.

You can rewrite this to completely eliminate the `queryfunction:`. For example:

```yaml
url:
  data_roles:
    pattern: /roles
    handler: FormHandler
    kwargs:
      url: sqlite:///data.db
      # Query the user table
      table: users
      # Set ?user_id= to ?user=
      prepare: args.update('user_id', args['user']))
      # Return only the role column
      default:
        _c: role
```


## Use SQL parameters

Use SQL **parameter substitution** for values. For example, instead of:

```python
def bad_query_function(args):
    return f'SELECT * FROM table WHERE updated >= {args["date"]}')
```

... use:

```python
def good_query_function(args):
    return 'SELECT * FROM table WHERE updated >= :date'
    # FormHandler will replace the :date with args['date'][0]
```

Whenever Gramex encounters a value `:something`, it passes the first `args['something']` instead as a SQL-injection-safe parameter.

## Use SQL parameters outside FormHandler

If you're using [gramex.cache.query](../../api/cache/#gramex.cache.query) to run queries, use:

```python
gramex.cache.query('SELECT * FROM table WHERE updated >= :date', params={'date': ...}, state=...)
```

If you're using [pandas.read_sql](https://pandas.pydata.org/docs/reference/api/pandas.read_sql.html), use:

```python
pd.read_sql('SELECT * FROM table WHERE updated >= :date', connection, params={'date': ...})
```

If you're using SQLAlchemy, use:

```python
connection.execute(sa.text('SELECT * FROM table WHERE updated >= :date'), date=...)
```


## Use computed SQL parameters

If the query depends on calculations, **add them to `args`**. For example, instead of:

```python
def bad_query_function(args):
    date = datetime.strptime(args['date'], '%b %Y').strftime('%Y-%m-%d')
    return f'SELECT * FROM table WHERE updated >= "{date}"'
```

... use:

```python
def good_query_function(args):
    args['date'] = [datetime.strptime(args['date'], '%b %Y').strftime('%Y-%m-%d')]
    return 'SELECT * FROM table WHERE updated >= :date'
    # FormHandler will replace the :date with args['date'][0]
```

Note: Keep calculated args names different from column names.
Else it will [filter](../../formhandler/#formhandler-filters) results by those values, which you may not want.

## Use argstype to convert values

Use [`argstype`](../../formhandler/#formhandler-argument-type) to ensure that the
arguments are of the correct type. Use `type`: for conversion and `expanding: true`
for lists in the `IN` clause. For example:

```yaml
url:
  flags:
    pattern: /sales-city
    handler: FormHandler
    kwargs:
      url: sales.csv
      query: SELECT * FROM sales WHERE city IN :cities AND sales > :min_sales
      argstype:
        # Use exanding: true when using a URL query parameter with an IN clause
        cities: { type: str, expanding: true }
        # Use type: to convert the argument to the right type
        min_sales: { type: float }
```

## Use lookups or `CASE` to pick column names

Never pick the column name directly from user input. For example:

```python
def bad_query_function(args):
    return f'SELECT {args["col"][0]} FROM table'
```

Since parameters can only be used for values and **not for column names**,
[use `CASE` instead](https://stackoverflow.com/a/25949885/100904). For example:

```python
def bad_query_function(args):
    return f'SELECT * FROM table ORDER BY {args["col"]}'

def good_query_function(args):
    return '''
      SELECT * table
      ORDER BY
          (CASE WHEN :col = 'city' THEN city END) ASC,
          (CASE WHEN :col = 'country' THEN country END) DESC
    '''
```

If you cannot use CASE, at least ensure that the column name is from a valid list.

```python
def good_query_function(args):
    # Ensure that only these 2 columns we specify can be included.
    if args["col"][0] in {'sales', 'growth'}:
        return f'SELECT {args["col"][0]} FROM table'
```


## Manually sanitize values

If you *must* use args as values, sanitize them, e.g. with `pymysql.escape_string(var)`:

```python
def safe_query_function(args):
    calc_val = pymysql.escape_string(str(calculate(args)))
    # nosec: This is SQL-injection safe because we've sanitized the value
    return f'SELECT * FROM table WHERE col > {calc_val}'  # nosec B608
```

## Other approaches

If possible, use a database account with **read-only access**, and only to only the
data that it needs. But this only protects against information destruction, not leakage.
