const path = require('path')
const fs = require('fs')

/**
 * Get contents from a directory that are of specific extension type
 * @param  {String}  filePath   Path of the directory to search
 * @param  {String=} extension  Optional extension to filter contents by
 * @return {Array}              Array of paths
 */
module.exports.dirContents = function dirContents (filePath, extension) {
  let contents = fs.readdirSync(filePath)

  if (extension) {
    contents = contents.filter((i) => path.extname(i) === extension)
  }

  return contents.map((i) => path.resolve(path.join(filePath, i)))
}
