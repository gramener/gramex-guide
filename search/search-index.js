// Creates search-index.json as a lunr index
// Usage: node search-index.js
var fs = require('fs')
var path = require('path')
var lunr = require('lunr')
var glob = require('glob')
var marked = require('marked')
var fm = require('front-matter')
var root = path.join(__dirname, '..')

var index = []
var docs = []
var metadataList = []
glob("*/*.md", { cwd: root, ignore: ['**/api/**'] }, function (err, files) {
  files.forEach(function (file) {
    var text = fs.readFileSync(path.join(root, file), "utf8");
    var content = fm(text);
    var tokens = marked.lexer(content.body);
    var title = content.attributes.title;
    var prefix = content.attributes.prefix || title;
    var metadata = {
      type: content.attributes.type || "other",
      prefix: prefix,
      title: title,
      desc: content.attributes.desc || "desc",
      icon: content.attributes.icon || "iconpath",
      views: content.attributes.views || 0,
      by: content.attributes.by || "TeamGramener",
      deprecated: content.attributes.deprecated || false,
    };
    var body = [];
    if (title) {
      tokens.forEach(function (token) {
        if (token.type == "heading") {
          add_doc(title, prefix, body, file);
          add_meta(title, metadata, file);
          title = token.text;
          body = [];
        } else if (token.text) {
          body.push(token.text);
        }
      });
      add_doc(title, prefix, body, file);
      add_meta(title, metadata, file);
    }
  });
  var idx = lunr(function () {
    this.field("title");
    this.field("body");
    this.field("id");
    var lunr_index = this;
    index.forEach(function (entry) {
      lunr_index.add(entry);
    });
  });
  fs.writeFileSync(
    path.join(__dirname, "search-index.json"),
    JSON.stringify({
      docs: docs,
      index: idx.toJSON(),
    }) + "\n"
  );

  fs.writeFileSync(
    path.join(__dirname, "meta.json"),
    JSON.stringify(metadataList) + "\n"
  );
});

function url(file, title) {
  var slug = title.toLowerCase().replace(/[^\w]+/g, '-')
  return file.replace(/README.md/, '') + '#' + slug
}

function add_doc(title, prefix, body, file) {
  index.push({ title: title, body: body.join(' '), id: docs.length })
  docs.push({ title: title, prefix: prefix, link: url(file, title) })
}

function add_meta(title, metadata, file) {
  var link = 'https://learn.gramener.com/guide/'
  var entry = { title: title, link: link + url(file, title) }
  var match = metadataList.find(row => row.prefix == metadata.prefix)
  if (match)
    match.info.push(entry)
  else {
    metadata.info = [entry]
    metadata.link = link + url(file, '')
    metadataList.push(metadata)
  }
}
