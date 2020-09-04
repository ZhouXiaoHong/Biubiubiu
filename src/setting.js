import sketch from 'sketch'
import BrowserWindow from "sketch-module-web-view";
import {getConfig, setConfig} from "./utils/store";

export default function (type, callback) {
  type = type === 'export' ? 'export' : 'all'

  const options = {
    identifier: 'biubiubiu.webview',
    width: 450,
    height: type === 'export ' ? 250 : 350,
    title: '导出设置',
    alwaysOnTop: true,
  }

  const browserWindow = new BrowserWindow(options)

  browserWindow.loadURL(require('../resources/export.html'))

  browserWindow.webContents.on('toast', function(message) {
    sketch.UI.message(message)
  })

  browserWindow.webContents.on('setConfig', function(config) {
    if (type === 'export') {
      browserWindow.close()
      return callback(config)
    }

    setConfig(config)
    browserWindow.close()
    return sketch.UI.message('保存成功')
  })

  browserWindow.webContents.on('cancel', function() {
    browserWindow.close()
  })

  const initValue = JSON.stringify(getConfig())
  console.log(`setInitValue(${initValue}, ${type})`)
  browserWindow.webContents
      .executeJavaScript(`setInitValue(${initValue}, '${type}')`)
      .then(res => {
        // do something with the result
      })
}