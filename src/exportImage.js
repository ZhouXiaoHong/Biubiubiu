import sketch from 'sketch'
import fs from '@skpm/fs'
import copy from "./utils/copy";
import {tempPath, checkIfDirExists} from "./utils/checkTempDir";
import dialog from '@skpm/dialog'
import setting from "./setting";

const FormData = require('sketch-polyfill-fetch/lib/form-data');

function exportImage (config) {
  const doc = sketch.getSelectedDocument()
  const selectedLayers = doc.selectedLayers
  const exportLayer = selectedLayers.layers[0]

  const formats = config.formats

  if (config.type === 'file') {
    const pathList = dialog.showOpenDialogSync({
      properties: [
        'openDirectory',
        'createDirectory',
      ]
    })

    if (pathList[0]) {
      const path = pathList[0]
      sketch.export(exportLayer, {
        formats,
        output: path,
        scales: config.scales,
      })
      return sketch.UI.message('导出成功! 🎉🎉🎉')
    } else {
      return
    }
  }

  sketch.export(exportLayer, {
    formats,
    output: tempPath,
  })

  const mimeType = {
    png: 'image/png',
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    pdf: 'application/pdf',
  }[formats]

  const formData = new FormData();
  const filePath = `${tempPath}/${exportLayer.name}.${formats}`
  formData.append('file', {
    fileName: `${exportLayer.name}.${formats}`,
    mimeType,
    data: fs.readFileSync(filePath)
  });

  fetch(config.url,{
    headers: {
      Accept: 'multipart/form-data; charset=utf-8',
    },
    body: formData,
    method: 'POST'
  }).then(res => {
    if (res.status === 200 && res.json()) {
      const json = res.json()._value;
      if (json.code === 200 && json.data.url) {
        copy(json.data.url);
        return sketch.UI.message('图片地址已保存在剪贴板中! 🎉🎉🎉')
      }
      return sketch.UI.message('网络请求错误')
    }
  })
      .catch(e => sketch.UI.message('网络请求错误'))
      .finally(() => fs.unlinkSync(filePath))
}

export default function (config) {
  checkIfDirExists();

  const doc = sketch.getSelectedDocument()
  const selectedLayers = doc.selectedLayers
  const selectedCount = selectedLayers.length

  if (selectedCount === 0) {
    return sketch.UI.message('请先选择要导出的图片')
  } else if (selectedCount > 1) {
    return sketch.UI.message('只支持单选, 请不要多选')
  }

  if (!config.type) {
    setting('export', exportImage)
  } else {
    exportImage(config)
  }
}