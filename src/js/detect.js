let esprima = require('esprima')
let estraverse = require('estraverse')
let allFeatures = require('./features/all.js')

const esprimaOptions = {
  loc: true,
  range: true,
  tolerant: true
}

/**
 * Detects features in the provided program text,
 * only scanning for the provided list of features.
 * @param program {string} program text
 * @param features array of features to look for
 * @return Object with type success on success, or
 * type error if an error occuring when parsing the program
 */
function withFeatures (program, features) {
  try {
    const ast = esprima.parse(program, esprimaOptions)
    const foundFeatures = traverseAST(ast, features)
    return {
      type: 'success',
      features: foundFeatures
    }
  } catch (e) {
    return {
      type: 'error',
      errorMsg: e
    }
  }
}

/**
 * Detects features in the provided program text,
 * scanning for all defined features.
 * @param program {string} program text
 */
function withAllFeatures (program) {
  return withFeatures(program, allFeatures)
}

/**
 * Traverses the given AST, applying every function
 * in the list of functions to every node.
 * @param ast AST in ESTree format
 * @param features list of features to check for
 * @return hash map of found features
 */
function traverseAST (ast, features) {
  let foundFeatures = {}

  estraverse.traverse(ast, {
    enter: function (node, parent) {
      features.forEach((feature) => {
        let foundFeature = feature.func(node, parent)
        if (foundFeature !== undefined) {
          if (foundFeatures[foundFeature.type] === undefined) {
            foundFeatures[foundFeature.type] = []
          }
          foundFeatures[foundFeature.type].push(foundFeature)
        }
      })
    },
    leave: function (node, parent) {

    }
  })

  return foundFeatures
}

module.exports = {
  withFeatures: withFeatures,
  withAllFeatures: withAllFeatures
}
