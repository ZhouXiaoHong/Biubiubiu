import sketch from 'sketch'
import copy from "./utils/copy";
import {getConfig} from "./utils/store";

export default function () {
  if (context.selection.count() < 1) {
    return sketch.UI.message('请先选择要获取样式的元素');
  }

  let Rate = 1;
  let keyCode = 'px';
  const BorderPositions = ["center", "inside", "outside"],
      FillTypes = ["color", "gradient"],
      GradientTypes = ["linear", "radial", "angular"],
      ShadowTypes = ["outer", "inner"],
      TextAligns = ["left", "right", "center", "justify", "left"],
      ResizingType = ["stretch", "corner", "resize", "float"];

  function shadowToJSON(shadow) {
    return {
      type: shadow instanceof MSStyleShadow ? "outer" : "inner",
      offsetX: shadow.offsetX(),
      offsetY: shadow.offsetY(),
      blurRadius: shadow.blurRadius(),
      spread: shadow.spread(),
      color: colorToJSON(shadow.color())
    };
  }

  function pointToJSON(point) {
    return {
      x: parseFloat(point.x),
      y: parseFloat(point.y)
    };
  }

  function colorStopToJSON(colorStop) {
    return {
      color: colorToJSON(colorStop.color()),
      position: colorStop.position()
    };
  }

  function gradientToJSON(gradient) {
    let stopsData = [],
        stop, stopIter = gradient.stops().objectEnumerator();
    while (stop = stopIter.nextObject()) {
      stopsData.push(colorStopToJSON(stop));
    }

    return {
      type: GradientTypes[gradient.gradientType()],
      from: pointToJSON(gradient.from()),
      to: pointToJSON(gradient.to()),
      colorStops: stopsData
    };
  }

  function getRadius(layer) {
    let returnFlag = 0;
    try {
      return layer.layers().firstObject().fixedRadius();
    } catch (e) {
      return 0;
    }
  }

  function getBorders(style) {
    let bordersData = [],
        border, borderIter = style.borders().objectEnumerator();
    while (border = borderIter.nextObject()) {
      if (border.isEnabled()) {
        let fillType = FillTypes[border.fillType()],
            borderData = {
              fillType: fillType,
              position: BorderPositions[border.position()],
              thickness: border.thickness()
            };

        switch (fillType) {
          case "color":
            borderData.color = colorToJSON(border.color());
            break;

          case "gradient":
            borderData.gradient = gradientToJSON(border.gradient());
            break;

          default:
            continue;
        }

        bordersData.push(borderData);
      }
    }

    return bordersData;
  }

  function getFills(style) {
    let fillsData = [],
        fill, fillIter = style.fills().objectEnumerator();
    while (fill = fillIter.nextObject()) {
      if (fill.isEnabled()) {
        let fillType = FillTypes[fill.fillType()],
            fillData = {
              fillType: fillType
            };

        switch (fillType) {
          case "color":
            fillData.color = colorToJSON(fill.color());
            break;

          case "gradient":
            fillData.gradient = gradientToJSON(fill.gradient());
            break;

          default:
            continue;
        }

        fillsData.push(fillData);
      }
    }

    return fillsData;
  }

  function getShadows(style) {
    let shadowsData = [],
        shadow, shadowIter = style.shadows().objectEnumerator();
    while (shadow = shadowIter.nextObject()) {
      if (shadow.isEnabled()) {
        shadowsData.push(shadowToJSON(shadow));
      }
    }

    shadowIter = style.innerShadows().objectEnumerator();
    while (shadow = shadowIter.nextObject()) {
      if (shadow.isEnabled()) {
        shadowsData.push(shadowToJSON(shadow));
      }
    }
    return shadowsData;
  }

  function getCode(selection) {
    let text = '';
    if (selection.class() == 'MSTextLayer') {
      text = exportText(selection);
    } else {
      text = exportSize(selection);
    }
    copy(text);
  }

  function colorToJSON(color) {
    let obj = {
      r: Math.round(color.red() * 255),
      g: Math.round(color.green() * 255),
      b: Math.round(color.blue() * 255),
      a: color.alpha()
    }

    function bzone(d) {
      if (d.length == 1) {
        d = '0' + d;
      }
      return d;
    }
    if (obj.a == 1) {
      return '#' + bzone(obj.r.toString(16)) + bzone(obj.g.toString(16)) + bzone(obj.b.toString(16));
    } else {
      return 'rgba(' + obj.r + ',' + obj.g + ',' + obj.b + ',' + obj.a.toFixed(2) + ')';
    }
  }

  function exportText(selection) {
    let layerStyle = selection.style();
    let returnText = [];
    let getShadow = getShadows(layerStyle);
    if(getShadow.length > 0){
      let shadowText = '';
      for(let i = 0;i < getShadow.length; i++) {
        if(shadowText != ''){
          shadowText += ',\n';
        }
        if(getShadow[i].type != 'inner'){
          shadowText += Math.round(getShadow[i].offsetX / Rate) + keyCode + ' ' + Math.round(getShadow[i].offsetY / Rate) + keyCode + ' ' + Math.round(getShadow[i].blurRadius / Rate) + keyCode + ' ' + getShadow[i].color;
        }
      }
      returnText.push('text-shadow: ' + shadowText + ';');
    }

    if (layerStyle.contextSettings().opacity() != 1) {
      returnText.push('opacity: ' + layerStyle.contextSettings().opacity().toFixed(2) + ';');
    }
    // TODO: 是否要提醒小于12的情况
    returnText.push('font-size: ' + 　Math.round((selection.fontSize() / Rate)) + keyCode + ';');
    let lineHeight = (selection.lineHeight() || selection.font().defaultLineHeightForFont()) / Rate;
    returnText.push('line-height: ' + Math.round(lineHeight) + keyCode + ';');
    returnText.push('color: ' + 　colorToJSON(selection.textColor()) + ';');
    let fontName = selection.font().fontName().toLocaleUpperCase();
    if (fontName.includes('MEDIUM')) {
      returnText.push('font-weight: 500;')
    } else if (fontName.includes('SEMIBOLD')) {
      returnText.push('font-weight: 600;')
    } else if (fontName.includes('BOLD')) {
      returnText.push('font-weight: 700;')
    } else if (fontName.includes('ULTRALIGHT')) {
      returnText.push('font-weight: 100;')
    } else if (fontName.includes('THIN')) {
      returnText.push('font-weight: 200;')
    } else if (fontName.includes('LIGHT')) {
      returnText.push('font-weight: 300;')
    }
    if (fontName.indexOf('ITALIC') > 0) {
      returnText.push('font-style: italic;');
    }
    return returnText.join('\n');
  }

  function exportSize(selection) {
    let layerStyle = selection.style();
    let returnText = [];

    if (layerStyle.contextSettings().opacity() != 1) {
      returnText.push('opacity: ' + layerStyle.contextSettings().opacity().toFixed(2) + ';');
    }

    if (getRadius(selection) != 0) {
      returnText.push('border-radius: ' + Math.round(getRadius(selection) / Rate) + keyCode + ';');
    }
    let backgroundColor = getFills(layerStyle);
    let getBorder = getBorders(layerStyle);
    let getShadow = getShadows(layerStyle);
    let borderless = 0;
    let rateX = 1;
    if (Rate > 1) {
      rateX = 2;
    }

    if (getBorder.length > 0) {
      if (getBorder[0].position == 'inside') {
        borderless = getBorder[0].thickness * 2 / rateX;
      }
      if (getBorder[0].fillType == 'color') {
        returnText.push('border: ' + Math.round(getBorder[0].thickness / rateX) + keyCode + ' solid ' + (getBorder[0].color) + ';');
      }
    }

    if(getShadow.length > 0){
      let shadowText = 'box-shadow: ';
      for(let i = 0;i < getShadow.length; i++) {
        if(i != 0){
          shadowText += ',\n';
        }
        shadowText += Math.round(getShadow[i].offsetX / Rate) + keyCode + ' ' + Math.round(getShadow[i].offsetY / Rate) + keyCode + ' ' + Math.round(getShadow[i].blurRadius / Rate) + keyCode + ' ' + Math.round(getShadow[i].spread / Rate) + keyCode + ' ' + getShadow[i].color + (getShadow[i].type == 'inner' ? ' inset': '');
      }
      returnText.push(shadowText + ';');
    }

    let width = selection.rect().size.width / Rate;
    let height = selection.rect().size.height / Rate;
    returnText.push('width: ' + Math.round(width - borderless) + keyCode + ';');
    returnText.push('height: ' + Math.round(height - borderless) + keyCode + ';');

    if (backgroundColor.length > 0) {
      if (backgroundColor[0].fillType == 'color') {
        returnText.push('background-color: ' + backgroundColor[0].color + ';');
      } else if (backgroundColor[0].fillType == 'gradient') {
        function bzone6(z) {
          if (z.length != 6) {
            z = '0' + z;
          }
          if (z.length != 6) {
            bzone6(z);
          } else {
            return z;
          }
        }
        let param = [];
        let to = backgroundColor[0].gradient.to;
        let from = backgroundColor[0].gradient.from;
        param.push(Math.round(90 - 180 * Math.atan(Math.abs((to.y - from.y)) / Math.abs((to.x - from.x))) / Math.PI) + 'deg');
        let colorStops = backgroundColor[0].gradient.colorStops;
        for (let i = 0; i < colorStops.length; i++) {
          param.push(colorStops[i].color + ' ' + Math.round(colorStops[i].position * 100) + '%');
        }
        returnText.push('background: linear-gradient(' + param.join(',') + ');');
      }
    }
    return returnText.join('\n');
  }

  const config = getConfig()
  keyCode = config.unit || 'px';

  let showMessage = '代码已复制到剪贴板';
  const selection = context.selection[0];

  if (config.rate === 'auto') {
    let artboard = selection.parentArtboard();
    if (artboard == null) {
      Rate = 1;
      showMessage += ('，' + '此元素没有父 artboard，按默认1倍图处理');
    } else {
      artboard = artboard.absoluteRect();
      let size = artboard.size().width;
      if (size == 750 || size == 1334 || size == 720) {
        Rate = 2;
      } else if (size == 320 || size == 414 || size == 375) {
        Rate = 1;
      } else if (size == 1242 || size == 2208 || size == 1080) {
        Rate = 3;
      } else if (size > 1334 && size != 2208) {
        Rate = 1;
      } else {
        showMessage += ('，' + '此元素所在 artboard 为非标准尺寸，按默认1倍图处理');
      }
      // TODO: 兼容小程序
      // if (keyCode == 'rpx') {
      //   if (size == 750 || size == 1334 || size == 720 || size == 320 || size == 414 || size == 375 || size == 1242 || size == 2208 || size == 1080) {
      //     Rate = parseFloat((size / 750).toFixed(2));
      //   } else {
      //     Rate = 1;
      //   }
      // }
    }
  } else {
    Rate = parseInt(config.rate)
  }

  getCode(selection);

  sketch.UI.message(showMessage);
}