import sketch from 'sketch'
import copy from "./utils/copy";
// https://sketchplugins.com/d/1403-how-to-get-every-line-string-value-in-a-textlayer/3

export default function () {
  const selection = context.selection;

  if (selection.length === 0) {
    return sketch.UI.message('请先选择要文本元素')
  } else if (selection.length > 1) {
    return sketch.UI.message('只支持单选, 请不要多选')
  }

  const exportLayer = selection[0]
  copy(exportLayer.stringValue())
}