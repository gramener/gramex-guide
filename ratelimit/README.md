---
title: Rate Limit APIs
prefix: FileHandler
icon: ratelimit.png
desc: ratelimit limits access to API endpoints
by: TeamGramener
type: component
...

[TOC]

## Rate limit

**v1.86**. Every handler supports rate-limiting via the `ratelimit` config.
For example, this allows **50** hits per **user** per **day**:

```yaml
url:
  api:
    pattern: /api
    handler: FormHandler # or any handler
    kwargs:
      # ...
      ratelimit:
        keys: [daily, user]
        limit: 50
```

::: example href=example source=https://github.com/gramener/gramex-guide/blob/master/ratelimit/gramex.yaml
    Rate limit example


## Rate limit keys

`keys` define how to rate-limit. It's an array of strings, or a comma-separated list of strings:

```yaml
# Set a weekly limit by user
        keys: [weekly, user]
        keys: weekly, user  # same as above
# Set a daily limit globally
        keys: [daily]
```

`keys` can be:

- Time-based keys
  - `hourly`: Reset limit every hour (UTC)
  - `daily`: Reset limit every day (UTC)
  - `weekly`: Reset limit every week, starting Sunday (UTC)
  - `monthly`: Reset limit every month, starting 1st of the month (UTC)
  - `yearly`: Reset limit every month, starting 1-Jan (UTC)
- Any key from the [logging config](../config/#request-logging), e.g.
  - `user`: The unique ID of the user requesting the page (same as `user.id`)
  - `uri`: The full URL requested (after the host name)
  - `method`: The HTTP method requested. E.g. `GET` or `POST`
  - `ip`: The IP address of the client requesting the page
  - `user.<key>`: A user attribute. E.g. `user.id` returns the user ID, `user.role` might point to a role
  - `args.<key>`: A specific argument. E.g. `args.x` returns the value of ?x=...
  - `headers.<key>`: A request HTTP header. E.g. `headers.User-Agent` is the browser’s user agent
  - `session.<key>`: A HTTP session key. E.g. `session.user` is the user object
  - `cookies.<key>`: A specific cookie. E.g. `cookie.sid` is the session ID cookie
  - `env.<key>`: An environment variable. E.g. `env.HOME` logs the user’s home directory

`keys` can also be defined with functions. For example:

```yaml
# Restrict by user's email domain name, daily
        keys:
          - daily
          - function: handler.current_user.email.split('@')[-1]
# Refresh every 10 days per user. Divide seconds since epoch by 10 days. Round down
        keys:
          - user
          - function: int(pd.Timestamp.utcnow().timestamp() / 24 / 60 / 60 / 10)
```

## Rate limit limit

`limit` is the maximum number of successful requests to the page. This can be a number, or a function that returns a number. For example:

```yaml
# Set a constant limit of 50
        limit: 50
# Limit to 50 for logged-in users, 10 for others
        limit: {function: 50 if handler.current_user else 10}
```

## Rate limit headers

On each request, Gramex computes the `keys` and `limit`, looks up usage for that key, and sets these HTTP headers:

- `X-RateLimit-Limit`: limit
- `X-RateLimit-Remaining`: limit minus usage
- `X-RateLimit-Reset`: seconds before window resets. Only available for `hourly`, `daily`, `weekly` and `monthly` keys
- `Retry-After`: same as `X-Ratelimit-Reset`, sent only if usage exceeds limit

If the usage exceeds the limit, Gramex raises a [HTTP 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) response. This can be formatted via a custom error page.

If the response is successful, the usage increments by 1. If the response is a HTTP 5xx or HTTP 4xx, usage stays the same.

## Rate limit pools

If a single API has multiple URLs (e.g. `/api1`, `/api2`, etc), add the same `ratelimit.pool:` to all. This combines their usage. For example:

```yaml
url:
  page1:
    pattern: /api1
    handler: FormHandler # or any handler
    kwargs:
      # ...
      ratelimit: &API_POOL
        pool: my-api-pool
        keys: [daily, user]
        limit: 50
  page2:
    pattern: /api2
    handler: FormHandler # or any handler
    kwargs:
      # ...
      ratelimit:
        <<: *API_POOL # Copy config from earlier
```

Calling `/api1` and `api2` increase the SAME usage counter by 1.

## Rate limit reset

To reset the API usage for any key, call `handler.ratelimit_reset(pool, keys)` from any
[FunctionHandler](../functionhandler/).
For example, this sets the usage of `x@example.com` on `2022-01-01` to zero.

```python
handler.ratelimit_reset('my-api-pool', ['2022-01-01', 'x@example.com'])
```

## Rate limit store

Rate limit usage data is stored in a cache.
It's location is defined in `app.ratelimit` in Gramex's own `gramex.yaml`:

```yaml
app:
  ratelimit:
    # Save in a JSON store
    type: json
    path: $GRAMEXDATA/ratelimit.json
    # Flush every 30 seconds. Clear expired sessions every hour
    flush: 30
    purge: 3600
```

This configuration works exactly like [sessions](http://127.0.0.1:9988/auth/#session-data).
To use a Redis store, use:

```yaml
app:
  ratelimit:
    type: redis
    path: localhost:6379:1  # Redis server:port:db (default: localhost:6379:0)
    # flush: 30   # Redis stores are live. No flush required
    purge: 3600
```

## Multiple rate limits

**v1.91**. `ratelimit` can be an array of rate limit configurations. For example, to set 2 limit:

- 10 requests / user / day
- 100 requests / day globally

```yaml
      ratelimit:
        - pool: daily-user-pool
          keys: [daily, user]
          limit: 30
        - pool: daily-pool
          keys: [daily]
          limit: 100
```

1. When Alice visits, her `daily-user-pool` becomes 9, and the `daily-pool` becomes 99
2. When Bob visits, his `daily-user-pool` becomes 9, and the `daily-pool` becomes 98
3. When Alice visits again, her `daily-user-pool` becomes 8, and the `daily-pool` becomes 97
4. ...

The [Rate limit headers](#rate-limit-headers) are computed from the smallest remaining pool.

- In Step 3 above, `daily-user-pool` has 8 remaining (less than `daily-pool` with 97). So `daily-user-pool` is used and `X-RateLimit-Remaining` header is 8, not 97.
- But if `daily-user-pool` has 8 remaining but `daily-pool` as only 5, the `X-RateLimit-Remaining` header would be 7.
  `X-Ratelimit-Limit` and `X-Ratelimit-Reset` are computed from the `daily-pool`.

You can [reset rate limits](#rate-limit-reset) for each pool independently.
