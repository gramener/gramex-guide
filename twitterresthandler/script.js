function condense(result) {
  var field = [].concat[result](0)
  field = field.statuses ? field.statuses[0] : field
  if (!field || !field.user)
    return result
  result = {
    'id_str'      : field.id_str,
    'created_at'  : field.created_at,
    'text'        : field.text,
    'user'        : {
        'name'      : field.user ? field.user.name : '',
        'time_zone' : field.user ? field.user.time_zone : '',
        '...'       : '...'
    },
    '...'         : '...'
  }
  if ('sentiment' in field)
    result.sentiment = field.sentiment
  return result
}


function replace(e, regex, text) {
    e.innerHTML = e.innerHTML.replace(regex,
      '<p style="color: #ccc">// OUTPUT</p><p>' + text + '</p>')
}

var pre = [].slice.call(document.querySelectorAll('pre'))

function next() {
  var output_regex = /\/\/ OUTPUT/,
      element = pre.shift(),
      text = element.textContent

  if (text.match(output_regex))
    if (text.match(/\$.when/)) {
      // Use GET to evaluate, since it can be cached
      eval(text).then(function(res1, res2) {
        var result = []
        for (var r of [res1, res2])
          result.push(condense(r))
        replace(element, output_regex, JSON.stringify(result, null, 2))
      })
    }
    else if (text.match(/\$.(ajax|get)/)) {
      eval(text).always(function(result) {
        replace(element, output_regex, JSON.stringify(condense(result), null, 2))
      })
    }
  if (pre.length > 0) { next() }
}
next()
