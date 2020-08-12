$(function () {
  // Sidebar menu: Highlight current page
  var url = location.origin + location.pathname
  $('.menu a').each(function () {
    if (this.href == url) {
      $(this).parent().addClass('active').append('<ul>')
      this.scrollIntoView()
    }
  })

  // Sidebar menu: Add headings to page
  $('.content').find('h2, h3').each(function () {
    $('.menu .active ul').append(
      '<li class="nav-item menu-' + this.tagName.toLowerCase() + '">' +
      '<a class="nav-link py-0" href="#' + $(this).attr('id') + '">' +
      $(this).text() +
      '</a></li>')
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
      url: feedback_url,
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
})
