#!/usr/bin/env node

const camelCase = require('camelcase')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const program = require('commander')
const p = require('./package.json')

const xcode = require('xcode')
const services = require('./services')

program
  .version(p.version)
  .description('Dynamically convert json file objects to the model objects in an xcode project')
  .option('--project [project]', 'Set the xcode project root folder path')
  .option('--path [path]', 'Set the path (defaults to ./models/)')
  .option('--output [output]', 'Set the output path (default to "path")')
  .parse(process.argv)

if (!require('command-exists').sync('quicktype')) {
  throw new Error('auto-load-models is not installed, download from https://quicktype.io/')
}

const input = path.resolve(program.path || './models/')
const output = path.resolve(program.output || input)
const jsonContents = services.dir.dirContents(input, '.json')

const kProjectDetails = services.xcode.projectInfo(program.project)
const xcGroupPath = path.relative(kProjectDetails.dir, output)
if (xcGroupPath.includes('../')) {
  throw new Error('Make sure your output path is inside your xcode project')
}

execSync(`mkdir -p ${output}`) // Create the output directory if needed

const project = xcode.project(kProjectDetails.pbxproj)
project.parseSync()

services.xcode.createGroup(project, xcGroupPath)
const kGroupValue = services.xcode.getGroupValue(project, xcGroupPath).value

// Convert all json files to swift files and add them to the project
for (let x = 0; x < jsonContents.length; x++) {
  let inFilePath = jsonContents[x]
  let fileName = path.basename(inFilePath, '.json')
  let outFilePath = path.join(output, fileName + '.swift')
  let name = camelCase(fileName, { pascalCase: true }) // normalize file name ('phone-number' => 'PhoneNumber')

  execSync(`quicktype ${inFilePath} -t ${name} -l swift -o ${outFilePath}`)

  project.addSourceFile(outFilePath, undefined, kGroupValue)
}

fs.writeFileSync(kProjectDetails.pbxproj, project.writeSync()) // save new xcode project
