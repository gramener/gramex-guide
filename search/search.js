const index = document.querySelector("#index");
const prefix = index.dataset["prefix"] || "";
fetch(index.dataset["url"])
  .then((r) => r.json())
  .then((data) => {
    const result = [];
    for (let [page, frags] of Object.entries(data)) {
      if (page == ".")
        page = "Home"
      result.push(`<a class="fw-bold text-uppercase" href="${prefix}${page}">${page}</a><ul>`);
      for (let [frag, terms] of Object.entries(frags)) {
        for (let term of Object.keys(terms))
          result.push(
            `<li><a class="small" href="${prefix}${page}#${frag}">${term}</a></li>`
          );
      }
      result.push(`</ul>`);
    }
    index.insertAdjacentHTML("beforeend", result.join(""));
  });
