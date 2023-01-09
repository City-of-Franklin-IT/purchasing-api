const fs = require('fs')

const writeFile = async (path, contents, options) => {
  const file = fs.writeFileSync(path, contents)

  return file
}

module.exports = writeFile