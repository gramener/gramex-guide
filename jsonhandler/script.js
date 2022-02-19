(async function() {
  for (let row of document.querySelectorAll('.content table tbody tr')) {
    let cells = row.querySelectorAll('td')
    let [method, url] = cells[0].textContent.split(/ /)
    let options = method == 'GET' ? { method } : { method, body: cells[1].textContent }
    let r = await fetch(url, options)
    cells[cells.length - 2].innerHTML = `<code>${r.ok ? await r.text() : r.statusText}</code>`
  }
})()
