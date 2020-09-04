const Settings = require('sketch/settings')

export function getConfig(key) {
  let config = Settings.settingForKey('config')
  if (!config) {
    config = {
        formats: 'png',
        scales: '1',
        type: 'file',
        url: '',
        unit: 'px',
        rate: '1',
    }
    Settings.setSettingForKey('config', config)
  }

  return key ? config[key] : config;
}

export function setConfig(value, key) {
  let config = value
  if (key) {
    config = getConfig()
    config[key] = value
  }

  Settings.setSettingForKey('config', config)
}

