const $ = require('./jquery-3.5.1.slim.min')

window.setInitValue = (data, type) => {
  if (type === 'export') {
    document.querySelector('.code').className = 'code hidden';
  }

  ;(data.formats || '').split(',').filter(item => !!item).forEach(formats => {
    const el = document.querySelector(`[name=formats][value='${formats}']`)
    el && (el.checked = true)
  })

  ;(data.scales || '').split(',').filter(item => !!item).forEach(scales => {
    const el = document.querySelector(`[name=scales][value='${scales}']`)
    el && (el.checked = true)
  })

  ;(data.type || '').split(',').filter(item => !!item).forEach(type => {
    const el = document.querySelector(`[name=type][value='${type}']`)
    el && (el.checked = true)
  })

  ;(data.rate || '').split(',').filter(item => !!item).forEach(rate => {
    const el = document.querySelector(`[name=rate][value='${rate}']`)
    el && (el.checked = true)
  })

  const urlEl = document.querySelector('input[name=url]')
  urlEl && (urlEl.value = data.url)

  const unitEl = document.querySelector('input[name=unit]')
  unitEl && (unitEl.value = data.unit)

  update()
}

function getFormData() {
  return $('#form')
      .serializeArray()
      .reduce((result, {name, value}) => {
        if (result[name]) {
          if (Array.isArray(result[name])) {
            result[name].push(value)
          } else {
            result[name] = [result[name], value]
          }
        } else {
          result[name] = value
        }
        return result
      }, {})
}

function update() {
  const data = getFormData()
  const isURL = data.type === 'url'
  document.getElementById('urlContainer').className = isURL ? '' : 'hidden';
  document.querySelectorAll('input[name=formats]').forEach(el => el.type = isURL ? 'radio' : 'checkbox');
}

document.getElementById('url').onchange = update
document.getElementById('file').onchange = update

document.getElementById('save').onclick = e => {
  e.preventDefault()

  let config = getFormData()
  Object.keys(config).forEach(key => config[key] = Array.isArray(config[key]) ? config[key].join(',') : config[key])

  if (!config.formats) {
    return window.postMessage('toast', '请至少选择一个格式')
  } else if (!config.scales) {
    return window.postMessage('toast', '请至少选择一个尺寸')
  } else if (config.type === 'url' && !config.url) {
    return window.postMessage('toast', '导出类型为 url 时, 请填写上传地址')
  }

  window.postMessage('setConfig', config)
}

document.getElementById('cancel').onclick = e => {
  e.preventDefault()
  window.postMessage('cancel')
}