import fs from "@skpm/fs";

export const tempPath = `${process.env.HOME}/.sketch`

export function checkIfDirExists () {
  const exist = fs.existsSync(tempPath)
  if (!exist) {
    fs.mkdirSync(tempPath)
  }
}