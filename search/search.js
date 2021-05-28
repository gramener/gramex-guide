$('#index').each(function () {
  var $index = $(this)
  var prefix = $index.data('prefix') || ''
  $.ajax($index.data('url'))
    .done(function (data) {
      var terms = []
      for (var page in data)
        for (var frag in data[page])
          if (frag)
            for (var term in data[page][frag])
              terms.push([term, page, page + (frag ? '#' + frag : '')])
      terms.sort(function (a, b) {
        var x = a[0].toLowerCase(),
          y = b[0].toLowerCase()
        return x < y ? -1 : x > y ? +1 : 0
      })
      terms.forEach(function (row) {
        $index.append(`<a href="${prefix}${row[2]}">${row[0]}<br><small>${row[1]}</small></a>`)
      })
    })
})
