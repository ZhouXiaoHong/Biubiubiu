import sketch from 'sketch'
import exportImage from "./exportImage";
import {getConfig} from "./utils/store";

export default function () {
  return exportImage(getConfig())
}