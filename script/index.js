const camelCase = require('camelcase')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const program = require('commander')
const p = require('./package.json')

program
  .version(p.version)
  .description('Dynamically convert json file objects to the model objects in an xcode project')
  .option('--path [path]', 'Set the path (defaults to ./models/)')
  .option('-o', '--output [output]', 'Set the output path (default to "path")')
  .parse(process.argv)

const dir = path.resolve(program.path || './models/')
const output = program.output || dir

let contents = fs.readdirSync(dir)
  .filter((item) => {
    return item.includes('.json')
  })

for (let x = 0; x < contents.length; x++) {
  let file = contents[x]
  let inFilePath = path.join(dir, file)
  let outFilePath = path.join(output, path.basename(file, '.json') + '.swift')
  let name = camelCase(path.basename(file, '.json'), { pascalCase: true })

  let command = `quicktype ${inFilePath} -t ${name} -l swift -o ${outFilePath}`
  execSync(command)
}
