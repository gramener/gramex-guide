$(function () {
  var parts = location.href.split('/')
  $('iframe#newsletter')
    .on('load', function () {
      $(this).height($(this).contents().find('html').height())
    })
    .attr('src', '../' + parts[parts.length - 2] + '.html')
})
