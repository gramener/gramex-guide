/* globals lunr */
$(function () {
  // Sidebar menu: Highlight current page
  var url = location.origin + location.pathname
  
  // $('.menu a').each(function () {
  //   if (this.href == url) {
  //     $(this).parent().addClass('active').append('<ul>')
  //     this.scrollIntoView()
  //   }
  // })

  $('.sidebar a').each(function () {    
    if (this.href == url) {
      $(this).addClass('active');
      $(this).parent().append('<ul class="submenu"></ul>')
      this.scrollIntoView()
    }
  })

  // Sidebar menu: Add headings to page
  // $('.content').find('h2, h3').each(function () {
  //   $('.menu .active ul').append(
  //     '<li class="nav-item menu-' + this.tagName.toLowerCase() + '">' +
  //     '<a class="nav-link py-0" href="#' + $(this).attr('id') + '">' +
  //     $(this).text() +
  //     '</a></li>')
  // })

$('.content').find('h2, h3').each(function () {
  $('.sidebar .active').next('ul').append(    
        '<li>'+
          '<a class="nav-link" href="#' + $(this).attr('id') + '">'+ 
          $(this).text() + '</a>' +
          '</li>'
  )
})

  // Scroll-spy offset must be the same as <html> scroll-padding-top. Otherwise it won't work
  $('body').attr('data-offset', parseInt(getComputedStyle(document.querySelector('html'))['scroll-padding-top']))

  // When Feedback "Yes" or "No" is selected
  $('.feedback').on('change', '[type="radio"]', function () {
    // Show feedback-text and buttons
    $('.feedback-details').removeClass('d-none')
    // Make feedback text if "No", not otherwise
    if ($('#helpful-no').is(':checked'))
      $('.feedback-text').attr('required', true)
    else
      $('.feedback-text').removeAttr('required')
  }).on('reset', function () {
    // When reset, hide feedback-text and submit buttons
    $('.feedback-details').addClass('d-none')
  }).on('submit', function (e) {
    e.preventDefault()
    $.ajax({
      url: $('.feedback').data('url'),
      method: 'POST',
      data: $('.feedback').serialize()
    })
    $('.feedback-details').addClass('d-none')
    $('.feedback-thanks').removeClass('d-none')
  })


  // Add a copy button to each .codehilite
  $('.codehilite')
    .css('position', 'relative')
    .attr('title', 'Copy code')
    .each(function () {
      $(this).prepend('<button class="copy-button copy-button btn btn-xs btn-dark text-uppercase pos-tr mt-2 mr-n2"><i class="fas fa-copy"></i></button>')
    })
  new Clipboard('.copy-button', {
    target: function (trigger) {
      return trigger.nextElementSibling
    }
  })

  // If an example has render:html or render:js, render code from the next PRE tag
  var nodeIterator = document.createNodeIterator(
    document.body,
    NodeFilter.SHOW_COMMENT,
    { acceptNode: function () { return NodeFilter.FILTER_ACCEPT } }
  )
  while (nodeIterator.nextNode()) {
    var commentNode = nodeIterator.referenceNode
    var match = commentNode.textContent.match(/render:(html|js)/i)
    if (!match)
      continue
    var $code = $(commentNode).next('.codehilite')
    var lang = match[1].toLowerCase()
    if (lang == 'html')
      $('<div class="mx-n3 px-3 mt-n3 mb-3 py-3 bg-light border">' + $code.text() + '</div>').insertAfter($code)
    else if (lang == 'js')
      $('<script>' + $code.text() + '</script>').insertAfter($code)
  }

  // Add anchors
  anchors.options.placement = 'left'
  anchors.add()

  // Explicitly scroll selected element into view
  if (location.hash) {
    var node = document.querySelector(location.hash)
    if (node)
      node.scrollIntoView()
  }

  // a.slide links to a PPTX file. Convert that into an iframe that displays the PPTX
  $('a.slide').each(function () {
    var $frame = $('<div class="slide"><iframe></iframe></div>').insertAfter(this)
    $frame.find('iframe').attr('src', 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(this.href))
  })

  // a.source links to a YAML file. Load the YAML file and display it in-place
  $('a.source').each(function () {
    var $this = $(this)
    $.get(this.href)
      .done(function (source) {
        $('<div class="codehilite"><pre><code></code></pre></pre>')
          .insertAfter($this)
          .find('code')
          .text(source)
      })
  })

  $('#search').each(function () {
    var $search = $(this)
    var prefix = $search.data('prefix') || ''
    var $results = $('<div></div>').attr({
      'id': 'searchresults',
      'class': 'bg-white p-2 border',
    }).insertAfter(this).hide()
    $.ajax($search.data('url'))
      .done(function (index) {
        var idx = lunr.Index.load(index.index)
        var docs = index.docs
        $search
          .on('input', function () {
            var text = $(this).val().replace(/^\s+/, '').replace(/\s+$/, '')
            var results = []
            if (text)
              results = idx.search(text)
            if (results.length)
              $results.html(results.slice(0, 20).map(function (result) {
                var d = docs[result.ref]
                return '<div class="my-2"><a href="' + prefix + d.link + '">' + d.prefix + ' &raquo; ' + d.title + '</a></div>'
              })).show()
            else
              $results.html('').hide()
          })
          .trigger('input')
        // Clicking outside the search results clears search results
        $('body').on('click', function (e) {
          if (!($results.is(e.target) || $.contains($results, e.target)))
            $results.html('').hide()
        })
      })
  })
})


// MLHandler
$('#mlhandler-single').on('submit', function (e) {
  e.preventDefault();
  var url = g1.url.parse('model')
  $(this).serializeArray().forEach(function (item, index) {
    var obj = {}
    obj[item.name] = item.value
    url.update(obj)
  })
  $.getJSON(url.toString()).done(function (e) {
    $('#single-result').html(e[0].Survived)
  })
})

$('#bulkform').submit(function(e) {
  e.preventDefault()
  var fd = new FormData($(this)[0])
  $.ajax({
    url: 'model?_action=predict',
    data: fd,
    type: 'POST',
    processData: false,
    contentType: false,
    success: function(r) {
      $('#bulkresult').addClass('bg-success')
      $('#bulkresult').html(r)
    }
  })
})

$('#retrain').submit(function(e) {
  e.preventDefault()
  var fd = new FormData($(this)[0])
  var target_col = fd.get('_target_col')
  fd.delete('_target_col')
  $.ajax({
    url: 'model?_action=retrain&target_col=' + encodeURIComponent(target_col),
    data: fd,
    type: 'POST',
    processData: false,
    contentType: false,
    success: function(r) {
      $('#retrainresult').addClass('bg-success')
      $('#retrainresult').html(r)
    }
  })
})

$('#modelparams').click(function() {
  $.get('model?_model').done(function(e) {
    $('#paramresult').addClass('bg-success')
    $('#paramresult').html(e)
  })
})
