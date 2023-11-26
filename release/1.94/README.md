---
title: Gramex 1.94 release notes
prefix: 1.94
...

[TOC]

Gramex 1.94 features @gramex charts, ChatGPTHandler upgrade, DriveHandler S3 support, and more.

## @gramex charts

[@gramex charts](../../charts/) are configurable charts built on D3 under the `@gramex/` namespace.
These may be used as standalone libraries in any application.

This release includes:

- [@gramex/cartogram](https://gramener.com/gramex-cartogram/)
- [@gramex/documap](https://gramener.com/gramex-documap/)
- [@gramex/insighttree](https://gramener.com/insighttree/)
- [@gramex/network](https://gramener.com/gramex-network/)
- [@gramex/treemap](https://gramener.com/gramex-treemap/)

## ChatGPTHandler upgrade

In November, OpenAI modified the API with a breaking change to the streaming API.

Earlier, each each data chunk used to contain a complete JSON. Now, the JSON can be split across multiple chunks. ChatGPTHandler now factors this in.

[#777](https://github.com/gramener/gramex/issues/777)

## DriveHandler S3 support

[DriveHandler supports S3 as a back-end](../../drivehandler/#s3-storage).

To store files in S3, use the `storage:` configuration. For example:

```yaml
url:
  s3drive:
    pattern: /$YAMLURL/s3drive
    handler: DriveHandler
    kwargs:
      path: $YAMLPATH/files/
      storage:
        type: s3
        bucket: path/to/my-bucket
```

Set up the [AWS Credentials in environment variables](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html#environment-variables)

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...  # Optional
```

This stores all files in your S3 `path/to/my-bucket` bucket. Metadata is still stored under the `path` as `.meta.db`.

[#768](https://github.com/gramener/gramex/issues/768)

## Header validation

[All handlers support a `validate:` key to validate requests based on headers](../../auth/#header-validation). For example:

```yaml
url:
  auth/validate:
    pattern: /$YAMLURL/validate
    handler: FileHandler
    kwargs:
      path: $YAMLPATH/secret.html
      validate: handler.request.headers['Host'] == 'example.org'
```

This allows access only if the `Host` header is `example.org`.

You can use any Python expression. If the expression returns a falsy value or raises an Exception, Gramex raises a HTTP 400 error.

**Specify multiple conditions** with a list. Gramex allows the request only if ALL conditions match. For example:

```yaml
      validate:
        - handler.request.headers['Host'] == 'example.org'
        - handler.request.headers['User-Agent'].startswith('Mozilla')
        - handler.current_user['id'] == 'alpha'
```

**Customize the HTTP code and reason** by specifing a dictionary with `function`, `code`, and `reason`. For example:

```yaml
      validate:
        - function: handler.request.headers['Host'] == 'example.org'
          code: 403
          reason: This app should only be hosted on example.org
        - function: handler.request.headers['User-Agent'].startswith('Mozilla')
          code: 400
          reason: Only Chrome, Edge, Firefox, and Safari are supported
```

[#766](https://github.com/gramener/gramex/issues/766)

## OTP reset

[DBAuth](../../auth/#database-auth), [EmailAuth](../../auth/#email-auth), and [SMSAuth](../../auth/#sms-auth) now support resetting OTPs.

Add the `otp_reset: true` key to the `kwargs:` section (or `forgot:` sub-section for [DBAuth](../../auth/#database-auth)).
This invalidates any previous OTPs sent to the user.

[#766](https://github.com/gramener/gramex/issues/766)

## Improved Gramex setup

[`gramex setup`](../../apps/#setting-up-apps) ran `setup.sh` only if `bash` was available. Now it runs `setup.sh` if `bash`, `sh` or `ash` is available.

[#775](https://github.com/gramener/gramex/issues/775)

## CaptureHandler supports patterns

[CaptureHandler](../../capturehandler/) supports a `pattern:` kwarg that restricts the URLs CaptureHandler can access.

For example:, `pattern: ^http` only allows URLs that start with `http`, disallowing `file://` and other such URLs. (Relative URLs like `../` are converted to absolute HTTP URLs before checking the pattern, so they will work fine.)

To only allow specific domains, e.g. `gramener.com` and `gramener.co`, use:

```yaml
    pattern: ^https?://(www\.)?(gramener\.com|gramener\.co)/
```

[#762](https://github.com/gramener/gramex/issues/762)

## Bug fixes

- [CaptureHandler](../../capturehandler/) had a maximum timeout of 2 min. This limitation is removed. [#767](https://github.com/gramener/gramex/issues/767)
- [Admin](../../admin/) module had a data leak that exposes user auth data. This is [fixed](https://github.com/gramener/gramex/commit/15c2284e)
- [CORS](../../deploy/#cors) parameter `cors.auth` is now [optional](https://github.com/gramener/gramex/commit/c55e789d)
- [FormHandler](../../formhandler/) insertion now [works](https://github.com/gramener/gramex/commit/d71d525e) with Pandas 2.0
- [Translation](../../translate/) now [works](https://github.com/gramener/gramex/commit/adedc271) with Pandas 2.0
- [FormHandler](../../formhandler/) `query:` can now end with a [semicolon](https://github.com/gramener/gramex/commit/74b5315e)

## Backward compatibility & security

Gramex 1.94 is backward compatible with [previous releases](../) unless the release notes say otherwise.
We ensure this with automated tests.

Every Gramex release is tested for security vulnerabilities using the following tools.

1. [Bandit](https://bandit.readthedocs.io/) tests for back-end Python vulnerabilities.
   [See Bandit results](https://github.com/gramener/gramex/blob/master/reports/bandit.txt)
2. [npm-audit](https://docs.npmjs.com/cli/v6/commands/npm-audit) tests for front-end JavaScript vulnerabilities.
   [See npm-audit results](https://github.com/gramener/gramex/blob/master/reports/npm-audit.txt)
3. [Snyk](https://snyk.io/) for front-end and back-end vulnerabilities.
   [See Synk results](https://github.com/gramener/gramex/blob/master/reports/snyk.txt)
4. [ClamAV](https://www.clamav.net/) for anti-virus scans.
   [See ClamAV results](https://github.com/gramener/gramex/blob/master/reports/clamav.txt)
5. [Trivy](https://trivy.dev/) for container scans.
   [See Trivy results](https://github.com/gramener/gramex/blob/master/reports/trivy.txt)

## Statistics

The Gramex code base has:

- 23,129 23,018 lines of Python (111 more than 1.93)
- 3,557 lines of JavaScript (5 more than 1.93)
- 15,797 lines of test code (38 more than 1.93)

## How to install

See the [Gramex installation and upgrade instructions](../../install/).
