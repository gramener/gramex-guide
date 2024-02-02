/* globals lunr */
document.addEventListener("DOMContentLoaded", function () {
  // Add anchors to content headings
  anchors.options.placement = "left";
  anchors.add(".content h1, .content h2, .content h3");

  // Highlight the current page in the sidebar. Add sidebar
  const url = location.origin + location.pathname;
  for (let el of document.querySelectorAll(".menu a, .sidebar a")) {
    if (el.href == url) {
      el.classList.add("active");
      el.hash = document.querySelector(".content h1").id;
      const submenu = [];
      for (let h of document.querySelectorAll(".content h2, .content h3")) {
        submenu.push(
          `<li><a href="#${h.getAttribute("id")}">${h.textContent}</a></li>`,
        );
      }
      el.insertAdjacentHTML(
        "afterend",
        `<ul class="submenu">${submenu.join("")}</ul>`,
      );
      el.scrollIntoView();
    }
  }

  // Scroll-spy offset must be the same as <html> scroll-padding-top. Otherwise it won't work
  document.body.setAttribute(
    "data-bs-offset",
    parseInt(
      getComputedStyle(document.querySelector("html"))["scroll-padding-top"],
    ),
  );

  // Add a copy button to each .codehilite
  for (let el of document.querySelectorAll(".codehilite")) {
    el.style.position = "relative";
    el.setAttribute("title", "Copy code");
    el.insertAdjacentHTML(
      "afterbegin",
      '<button class="copy-button copy-button btn btn-xs btn-dark text-uppercase pos-tr mt-2 me-n2"><i class="fas fa-copy"></i></button>',
    );
  }
  new ClipboardJS(".copy-button", {
    target: function (trigger) {
      return trigger.nextElementSibling;
    },
  });

  // If an example has render:html or render:js, render code from the next PRE tag
  const nodeIterator = document.createNodeIterator(
    document.body,
    NodeFilter.SHOW_COMMENT,
    {
      acceptNode: function () {
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );
  while (nodeIterator.nextNode()) {
    let commentNode = nodeIterator.referenceNode;
    let match = commentNode.textContent.match(/render:(html|js)/i);
    if (!match) continue;
    let $code = $(commentNode).next(".codehilite");
    let lang = match[1].toLowerCase();
    if (lang == "html")
      $(
        '<div class="mx-n3 px-3 mt-n3 mb-3 py-3 bg-light border">' +
          $code.text() +
          "</div>",
      ).insertAfter($code);
    else if (lang == "js")
      $("<script>" + $code.text() + "</script>").insertAfter($code);
  }

  // Explicitly scroll selected element into view
  if (location.hash) {
    let node = document.querySelector(location.hash);
    if (node) node.scrollIntoView();
  }

  // a.slide links to a PPTX file. Convert that into an iframe that displays the PPTX
  $("a.slide").each(function () {
    var $frame = $('<div class="slide"><iframe></iframe></div>').insertAfter(
      this,
    );
    $frame
      .find("iframe")
      .attr(
        "src",
        "https://view.officeapps.live.com/op/view.aspx?src=" +
          encodeURIComponent(this.href),
      );
  });

  // a.source links to a YAML file. Load the YAML file and display it in-place
  $("a.source").each(function () {
    var $this = $(this);
    $.get(this.href).done(function (source) {
      $('<div class="codehilite"><pre><code></code></pre></pre>')
        .insertAfter($this)
        .find("code")
        .text(source);
    });
  });

  $("input.search").each(function () {
    var $search = $(this);
    var prefix = $search.data("prefix") || "";
    var $results = $('<div class="searchresults bg-white p-2 border"></div>')
      .insertAfter(this)
      .hide();
    $.ajax($search.data("url")).done(function (index) {
      var idx = lunr.Index.load(index.index);
      var docs = index.docs;
      $search
        .on("input", function () {
          var text = $(this).val().replace(/^\s+/, "").replace(/\s+$/, "");
          var results = [];
          if (text) results = idx.search(text);
          if (results.length)
            $results
              .html(
                results.slice(0, 20).map(function (result) {
                  var d = docs[result.ref];
                  return (
                    '<div class="my-2"><a href="' +
                    prefix +
                    d.link +
                    '">' +
                    d.prefix +
                    " &raquo; " +
                    d.title +
                    "</a></div>"
                  );
                }),
              )
              .show();
          else $results.html("").hide();
        })
        .trigger("input");
      // Clicking outside the search results clears search results
      $("body").on("click", function (e) {
        if (!($results.is(e.target) || $.contains($results, e.target)))
          $results.html("").hide();
      });
    });
  });
});

// MLHandler
$("#mlhandler-single").on("submit", function (e) {
  e.preventDefault();
  var url = g1.url.parse("model");
  $(this)
    .serializeArray()
    .forEach(function (item) {
      var obj = {};
      obj[item.name] = item.value;
      url.update(obj);
    });
  $.getJSON(url.toString()).done(function (e) {
    $("#single-result").html(e[0].Survived);
  });
});

$("#bulkform").submit(function (e) {
  e.preventDefault();
  var fd = new FormData($(this)[0]);
  $.ajax({
    url: "model?_action=predict",
    data: fd,
    type: "POST",
    processData: false,
    contentType: false,
    success: function (r) {
      $("#bulkresult").addClass("bg-success");
      $("#bulkresult").html(r);
    },
  });
});

$("#retrain").submit(function (e) {
  e.preventDefault();
  var fd = new FormData($(this)[0]);
  var target_col = fd.get("_target_col");
  fd.delete("_target_col");
  $.ajax({
    url: "model?_action=retrain&target_col=" + encodeURIComponent(target_col),
    data: fd,
    type: "POST",
    processData: false,
    contentType: false,
    success: function (r) {
      $("#retrainresult").addClass("bg-success");
      $("#retrainresult").html(r);
    },
  });
});

$("#modelparams").click(function () {
  $.get("model?_model").done(function (e) {
    $("#paramresult").addClass("bg-success");
    $("#paramresult").html(e);
  });
});
