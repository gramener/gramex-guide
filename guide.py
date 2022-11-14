'''
Utility functions for gramex-guide
'''

import cachetools
import gramex
import hashlib
import markdown
import tornado.template
import yaml
from customblocks import CustomBlocksExtension


def markdown_block(tag, **defaults):
    '''
    Return a custom markdown block processor. For example:

    ```python
    markdown.Mardown(CustomBlocksExtension(generators={
        'example': markdown_block('example', href='', source='', target='_blank')
    }))
    ```

    handles any `example` custom block:

    ::: example href="..." source="..." target="..."

    It loads `_template/example.html` and renders with all custom block attributes. Specified
    attrs (`href`, `source` and target in this example) are always passed, at least as `None`.
    '''

    def method(ctx, **kwargs):
        for key, val in defaults.items():
            kwargs.setdefault(key, val)
        return gramex.cache.open(f'_template/{tag}.html', 'template', rel=True).generate(
            ctx=ctx, **kwargs
        )

    return method


md = markdown.Markdown(
    extensions=[
        'extra',
        'meta',
        'codehilite',
        'smarty',
        'mdx_truly_sane_lists',
        'fenced_code',
        'toc',
        CustomBlocksExtension(
            generators={
                'example': markdown_block('example', href='', source='', target=''),
                'card': markdown_block('card', title='Getting Started Guide'),
            }
        ),
    ],
    soutput_format='html5',
)
# Create a cache for guide markdown content
md_cache = cachetools.LRUCache(maxsize=5000000, getsizeof=len)


def markdown_template(content, handler):
    # Cache the markdown contents locally, to avoid Markdown re-conversion
    hash = hashlib.md5(content.encode('utf-8')).hexdigest()
    if hash not in md_cache:
        md_cache[hash] = {'content': md.convert(content), 'meta': md.Meta}
        if md.Meta.get('template', False):
            t = tornado.template.Template(content)
            md_cache[hash]['content'] = md.convert(t.generate(**md.Meta).decode('utf-8'))
    content = md_cache[hash]
    # GUIDE_ROOT has the absolute root URL path of the Gramex guide.
    # Default to $YAMLURL when running locally, e.g. https://127.0.0.1/guide/
    root = gramex.config.variables.GUIDE_ROOT
    # When running via a reverse proxy, root is everything up to the first /guide/
    # e.g. https://gramener.com/gramex/guide/ or https://learn.gramener.com/guide/
    # This requires an nginx config: proxy_set_header X-Request-URI $request_uri
    path = handler.request.headers.get('X-Request-URI', handler.request.uri).split('?')[0]
    if '/guide/' in path:
        prefix, path = path.split('/guide/')
        root = prefix.strip('/') + '/guide'
    # Set up template variable defaults
    kwargs = {
        'GUIDE_ROOT': root,
        'classes': '',
        'body': content['content'],
        'title': '',
        'handler': handler,
        'is_homepage': path == '',
    }
    # ... which can be updated by the YAML frontmatter on the Markdown files
    for key, val in content['meta'].items():
        kwargs[key] = val[0]
    tmpl = gramex.cache.open('_template/markdown.html', 'template', rel=True)
    return tmpl.generate(**kwargs).decode('utf-8')


def config(handler):
    '''Dump the final resolved config'''
    return yaml.dump(gramex.conf, default_flow_style=False)
