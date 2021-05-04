const collections = {}
async function render() {
  const collectionPaths = [
    './components/bs4-components.html',
    './components/bs5-components.html'
  ]
  for(const collectionPath of collectionPaths) {
    const name = collectionPath.split('/').pop().split('.').shift()
    const text = await fetch(collectionPath).then(res => res.text())
    const collection = document.createElement('template')
    collection.innerHTML = text
    collection.setAttribute('name', name)
    document.body.appendChild(collection)
    collections[name] = Array.from(collection.content.querySelectorAll('template[component]')).map(tmpl => tmpl.getAttribute('component'))
  }
  document.querySelector('bs5-tree').setAttribute('tree', JSON.stringify(collections))
}
render()
const camelize = s => s.replace(/-./g, x => x.toUpperCase()[1])
const kebabize = str => {
  return str.split('').map((letter, idx) => {
    return letter.toUpperCase() === letter
      ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
      : letter;
  }).join('');
}

function updateCodePreview(prop, value) {
  const iframe = document.querySelector('iframe')
  const componentName = iframe.dataset.component
  const component = iframe.contentWindow.document.querySelector(componentName)
  const properties = Object.assign({}, component.data)
  const defaultProperties = iframe.contentWindow.uifactory.components[componentName].properties
  delete properties.$target
  const originalNode = component.__originalNode.cloneNode(true)
  if(prop !== undefined) {
    component.setAttribute(prop, value)
    properties[camelize(prop)] = value
  }
  Object.keys(properties).forEach(key => {
    // originalNode.setAttribute(kebabize(key), properties[key])
    const kebabKey = kebabize(key)
    const p = defaultProperties.find(p => p.name === kebabKey)
    if('value' in p && properties[key] != p.value) {
      originalNode.setAttribute(kebabKey, properties[key])
    }
  })
  document.querySelector('code-preview').code = originalNode.outerHTML
}
document.body.addEventListener('section-resized', function(e) {
  if(!e.target.matches('resizable-pane > div')) return
  document.querySelector('monaco-editor').editor.layout()
})
document.body.addEventListener('click', async function(e) {
  if(!e.target.matches('body > div > bs5-tree li')) return
  e.preventDefault()
  const active = document.querySelector('body > div > bs5-tree .active')
  if(active) {
    active.classList.remove('active')
  }
  e.target.classList.add('active')

  const collectionName = e.target.closest('details').querySelector('summary').textContent.trim()
  const collection = document.querySelector(`template[name=${collectionName}]`).content
  const dependencies = collection.querySelector('template[dependencies]')
  const componentSource = collection.querySelector(`template[component="${e.target.textContent.trim()}"]`)
  const container = document.body.querySelector('.container')
  container.innerHTML = ''
  const iframe = document.createElement('iframe')
  iframe.dataset.component = e.target.textContent
  container.appendChild(iframe)
  const doc = iframe.contentWindow.document
  const usage = document.createElement(e.target.textContent)
  let script = '<script src="https://unpkg.com/lodash@4.17.21/lodash.js"><\/script><script src="./uifactory.js"><\/script>'
  if(dependencies) {
    script += dependencies.innerHTML
  }
  doc.open()
  doc.write(componentSource.outerHTML + script + usage.outerHTML)
  doc.close()
  document.querySelector('monaco-editor').editor.getModel().setValue(componentSource.outerHTML)
  iframe.onload = function(e) {
    document.querySelector('component-properties').properties = e.target.contentWindow.uifactory.components[doc.body.firstElementChild.tagName.toLowerCase()].properties;
    updateCodePreview()
  }
})
document.body.addEventListener('click', function(e) {
  if(!e.target.matches('button.toggle-source')) return
  const sections = document.body.querySelectorAll('resizable-pane > section')
  if(sections[1].style.getPropertyValue('--size').startsWith('-')) {
    sections[0].style.setProperty('--size', '50%')
    sections[1].style.setProperty('--size', '50%')
  } else {
    sections[0].style.setProperty('--size', '101%')
    sections[1].style.setProperty('--size', '-1%')
  }
  document.querySelector('monaco-editor').editor.layout()
})
document.body.addEventListener('change', function(e) {
  if(!(e.target.matches('component-properties input') || e.target.matches('component-properties toggle-switch'))) return
  updateCodePreview(e.target.getAttribute('name'), e.target.value)
})

document.body.addEventListener('editor-loaded', function(e) {
  const tree = document.body.querySelector('bs5-tree')
  if(tree.querySelector('details[open]') !== null) return
  const details = tree.querySelector('details')
  details.setAttribute('open', true)
  const li = details.querySelector('li')
  if(li) {
    li.click()
  }
})

