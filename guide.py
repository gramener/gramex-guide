'''
Utility functions for gramex-guide
'''

import cachetools
import gramex
import hashlib
import markdown
import re
import sqlalchemy as sa
import time
import yaml

md = markdown.Markdown(extensions=[
    'markdown.extensions.extra',
    'markdown.extensions.meta',
    'markdown.extensions.codehilite',
    'markdown.extensions.smarty',
    'markdown.extensions.sane_lists',
    'markdown.extensions.fenced_code',
    'markdown.extensions.toc',
], output_format='html5')
# Create a cache for guide markdown content
md_cache = cachetools.LRUCache(maxsize=5000000, getsizeof=len)


def markdown_template(content, handler):
    # Cache the markdown contents locally, to avoid Markdown re-conversion
    hash = hashlib.md5(content.encode('utf-8')).hexdigest()
    if hash not in md_cache:
        md_cache[hash] = {
            'content': md.convert(content),
            'meta': md.Meta
        }
    content = md_cache[hash]
    # GUIDE_ROOT has the absolute root URL path of the Gramex guide.
    # Default to $YAMLURL when running locally, e.g. https://127.0.0.1/guide/
    root = gramex.config.variables.GUIDE_ROOT
    # When running via a reverse proxy, use everything up to the first /guide/
    # e.g. https://gramener.com/gramex/guide/ or https://learn.gramener.com/guide/
    # This requires an nginx config: proxy_set_header X-Request-URI $request_uri
    uri = handler.request.headers.get('X-Request-URI', handler.request.path)
    match = re.match(r'.*/guide/', uri)
    if match:
        root = match.group(0).strip('/')        # Strip slashes for consistency with $YAMLURL
    # Set up template variable defaults
    kwargs = {
        'GUIDE_ROOT': root,
        'classes': '',
        'body': content['content'],
        'title': '',
        'handler': handler,
    }
    # ... which can be updated by the YAML frontmatter on the Markdown files
    for key, val in content['meta'].items():
        kwargs[key] = val[0]
    # TODO: Document why we need this
    if 'xsrf' in content:
        handler.xsrf_token
    tmpl = gramex.cache.open('markdown.template.html', 'template', rel=True)
    return tmpl.generate(**kwargs).decode('utf-8')


def config(handler):
    '''Dump the final resolved config'''
    return yaml.dump(gramex.conf, default_flow_style=False)


def prepare_feedback(args, handler):
    args['user'] = [handler.current_user.id if handler.current_user else '']
    args['time'] = [time.time()]
