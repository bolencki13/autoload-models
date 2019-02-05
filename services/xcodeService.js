const xcode = require('xcode')
const path = require('path')
const dirContents = require('./dirService').dirContents

/**
 * Get information from the xcode project path
 * @param       {String} filePath Path for the xcode project root folder
 * @constructor
 */
function projectInfo (filePath) {
  let contents = dirContents(filePath, '.xcodeproj')
  if (contents.length < 1) {
    throw new Error('Invalid project path. *.xcodeproj could not be found')
  }

  let xcodeProj = contents[0]

  return {
    dir: path.resolve(filePath),
    name: path.basename(xcodeProj, '.xcodeproj'),
    pbxproj: path.join(xcodeProj, 'project.pbxproj')
  }
}
module.exports.projectInfo = projectInfo

/**
 * Get the first project from the project object
 * @param  {Object} project project that we want to look in
 * @return {Object}         First project that was found
 */
function getFirstProject (project) {
  return project.getFirstProject().firstProject
}
module.exports.getFirstProject = getFirstProject

/**
 * Check if the pbxGroup already contains a child group
 * @param  {Object}  pbxGroup pbxGroup object
 * @param  {String}  name     name of child group to check
 * @return {Boolean}          true if group exists
 */
function hasGroup (pbxGroup, name) {
  return pbxGroup.children.find((group) => (group.comment === name))
}
module.exports.hasGroup = hasGroup

/**
 * Find a group based on the
 * @param  {Object} pbxGroup  group to search in
 * @param  {String} name      name of group to search for
 * @return {Object}           pbxGroup that was found or null
 */
function findGroup (pbxGroup, name) {
  return pbxGroup.children.find((group) => (group.comment === name))
}
module.exports.findGroup = findGroup

/**
 * Get group if it exists
 * @param  {Object}  project  Xcode project object
 * @param  {String=} path     Optional path. If no path return root group
 * @return {Object}           Group that was found or null
 */
function getGroup (project, path) {
  const firstProject = getFirstProject(project)
  let group = project.getPBXGroupByKey(firstProject.mainGroup)

  if (!path) {
    return group
  }

  for (let name of path.split('/')) {
    let foundGroup = findGroup(group, name)

    if (foundGroup) {
      group = project.getPBXGroupByKey(foundGroup.value)
    } else {
      group = null
      break
    }
  }

  return group
}
module.exports.getGroup = getGroup

/**
 * Get group value based on the parent group that contains it
 * @param  {Object} project Xcode project object
 * @param  {String} path    Path of the group to target
 * @return {Object}         group value and comment
 */
function getGroupValue (project, path) {
  const parentGroup = ((filePath) => {
    let aryComponents = String(path).split('/')
    aryComponents.pop()
    return aryComponents.join('/')
  })(path)

  const group = ((filePath) => {
    let aryComponents = String(path).split('/')
    return aryComponents[aryComponents.length - 1]
  })(path)

  return getGroup(project, parentGroup).children.find((i) => (i.comment === group))
}
module.exports.getGroupValue = getGroupValue

/**
 * Create groups if they do not exist
 * @param  {Object} project     Xcode project object
 * @param  {String} filePath    Path of the groups to create
 * @return {Object}             pbxGroup
 */
function createGroup (project, filePath) {
  return filePath.split('/').reduce((group, name) => {
    if (!hasGroup(group, name)) {
      const uuid = project.pbxCreateGroup(name, `""`)

      group.children.push({
        value: uuid,
        comment: name
      })
    }

    return project.pbxGroupByName(name)
  }, getGroup(project))
}
module.exports.createGroup = createGroup
