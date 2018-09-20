'use strict';

var _util = require('./util');

var _convertToPropTypes = require('./convertToPropTypes');

var _convertToPropTypes2 = _interopRequireDefault(_convertToPropTypes);

var _makePropTypesAst = require('./makePropTypesAst');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// maps between type alias name to prop types
var internalTypes = {};

// maps between type alias to import alias
var importedTypes = {};

var exportedTypes = {};
var suppress = false;
var omitRuntimeTypeExport = false;

var SUPPRESS_STRING = 'no babel-plugin-flow-react-proptypes';

// General control flow:
// Parse flow type annotations in index.js
// Convert to intermediate representation via convertToPropTypes.js
// Convert to prop-types AST in makePropTypesAst.js

var convertNodeToPropTypes = function convertNodeToPropTypes(node) {
  return (0, _convertToPropTypes2.default)(node, importedTypes, internalTypes);
};

var getPropsForTypeAnnotation = function getPropsForTypeAnnotation(typeAnnotation) {
  var props = null;

  if (typeAnnotation.properties || typeAnnotation.type === 'GenericTypeAnnotation' || typeAnnotation.type === 'IntersectionTypeAnnotation' || typeAnnotation.type === 'AnyTypeAnnotation') {
    props = convertNodeToPropTypes(typeAnnotation);
  } else if (typeAnnotation.properties != null || typeAnnotation.type != null) {
    (0, _util.$debug)('typeAnnotation not of expected type, not generating propTypes: ', typeAnnotation);
  } else {
    throw new Error('Expected prop types, but found none. This is a bug in ' + _util.PLUGIN_NAME);
  }

  return props;
};

module.exports = function flowReactPropTypes(babel) {
  var t = babel.types;

  var isFunctionalReactComponent = function isFunctionalReactComponent(path) {
    if ((path.type === 'ArrowFunctionExpression' || path.type === 'FunctionExpression') && !path.parent.id) {
      // Could be functions inside a React component
      return false;
    }
    if ((0, _util.hasReactElementTypeAnnotationReturn)(path.node)) {
      return true;
    }
    if ((0, _util.containsReactElement)(path.node)) {
      return true;
    }
    return false;
  };

  /**
   * Called when visiting a node.
   *
   * Converts the props param to AST and attaches it at the proper location,
   * depending on the path param.
   *
   *
   * @param path
   * @param propsOrVar - props or exported props variable reference
   */
  var annotate = function annotate(path, propsOrVar) {
    var name = void 0;
    var targetPath = void 0;

    if (path.type === 'ArrowFunctionExpression' || path.type === 'FunctionExpression') {
      name = path.parent.id.name;
      var basePath = path.parentPath.parentPath;
      targetPath = t.isExportDeclaration(basePath.parent) ? basePath.parentPath : basePath;
    } else if (path.node.id) {
      name = path.node.id.name;
      targetPath = ['Program', 'BlockStatement'].indexOf(path.parent.type) >= 0 ? path : path.parentPath;
    } else {
      throw new Error('babel-plugin-flow-react-proptypes attempted to add propTypes to a function/class with no name');
    }

    if (!propsOrVar) {
      throw new Error('Did not find type annotation for ' + name);
    }

    var attachPropTypesAST = void 0;
    // if type was exported, use the declared variable
    if (typeof propsOrVar === 'string') {
      attachPropTypesAST = t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier(name), t.identifier('propTypes')), t.identifier(propsOrVar)));
    }
    // type was not exported, generate
    else {
        var propTypesAST = (0, _makePropTypesAst.makePropTypesAstForPropTypesAssignment)(propsOrVar);
        if (propTypesAST == null) {
          return;
        }
        attachPropTypesAST = t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier(name), t.identifier('propTypes')), propTypesAST));
      }
    targetPath.insertAfter(attachPropTypesAST);
  };

  /**
   * Visitor for functions.
   *
   * Determines if a function is a functional react component and
   * inserts the proptypes AST via `annotate`.
   *
   * @param path
   */
  var functionVisitor = function functionVisitor(path) {
    if (!isFunctionalReactComponent(path)) {
      return;
    }

    // Check if this looks like a stateless react component with PropType reference:
    var firstParam = path.node.params[0];
    var typeAnnotation = firstParam && firstParam.typeAnnotation && firstParam.typeAnnotation.typeAnnotation;

    var propsOrVar = null;
    if (!typeAnnotation) {
      (0, _util.$debug)('Found stateless component without type definition');
    } else {
      propsOrVar = typeAnnotation.id && exportedTypes[typeAnnotation.id.name] ? exportedTypes[typeAnnotation.id.name] : getPropsForTypeAnnotation(typeAnnotation);
    }

    if (propsOrVar) {
      annotate(path, propsOrVar);
    }
  };

  return {
    visitor: {
      Program: function Program(path, _ref) {
        var opts = _ref.opts;

        internalTypes = {};
        importedTypes = {};
        exportedTypes = {};
        suppress = false;
        omitRuntimeTypeExport = opts.omitRuntimeTypeExport || false;
        var directives = path.node.directives;
        if (directives && directives.length) {
          var directive = directives[0];
          if (directive.value && directive.value.value == SUPPRESS_STRING) {
            suppress = true;
          }
        }
        if (this.file && this.file.opts && this.file.opts.filename) {
          if (this.file.opts.filename.indexOf('node_modules') >= 0) {
            // Suppress any file that lives in node_modules IF the
            // ignoreNodeModules setting is true
            suppress = opts.ignoreNodeModules;
          }
        }
      },
      TypeAlias: function TypeAlias(path) {
        if (suppress) return;
        (0, _util.$debug)('TypeAlias found');
        var right = path.node.right;


        var typeAliasName = path.node.id.name;
        if (!typeAliasName) {
          throw new Error('Did not find name for type alias');
        }

        var propTypes = convertNodeToPropTypes(right);
        internalTypes[typeAliasName] = propTypes;
      },
      ClassDeclaration: function ClassDeclaration(path) {
        if (suppress) return;
        var superClass = path.node.superClass;

        // check if we're extending React.Compoennt

        var extendsReactComponent = superClass && superClass.type === 'MemberExpression' && superClass.object.name === 'React' && (superClass.property.name === 'Component' || superClass.property.name === 'PureComponent');
        var extendsComponent = superClass && superClass.type === 'Identifier' && (superClass.name === 'Component' || superClass.name === 'PureComponent');
        if (!extendsReactComponent && !extendsComponent) {
          (0, _util.$debug)('Found a class that isn\'t a react component', superClass);
          return;
        }

        // And have type as property annotations or Component<void, Props, void>
        path.node.body.body.forEach(function (bodyNode) {
          if (bodyNode && bodyNode.key.name === 'props' && bodyNode.typeAnnotation) {
            var annotation = bodyNode.typeAnnotation.typeAnnotation;
            var props = getPropsForTypeAnnotation(annotation);
            if (!props) {
              throw new TypeError('Couldn\'t process \`class { props: This }`');
            }
            return annotate(path, props);
          }
        });

        // super type parameter
        var secondSuperParam = getPropsTypeParam(path.node);
        if (secondSuperParam && secondSuperParam.type === 'GenericTypeAnnotation') {
          var typeAliasName = secondSuperParam.id.name;
          if (typeAliasName === 'Object') return;
          var props = internalTypes[typeAliasName] || importedTypes[typeAliasName];
          if (!props) {
            throw new TypeError('Couldn\'t find type "' + typeAliasName + '"');
          }
          return annotate(path, props);
        }
      },
      FunctionExpression: function FunctionExpression(path) {
        if (suppress) return;
        return functionVisitor(path);
      },
      FunctionDeclaration: function FunctionDeclaration(path) {
        if (suppress) return;
        return functionVisitor(path);
      },
      ArrowFunctionExpression: function ArrowFunctionExpression(path) {
        if (suppress) return;
        return functionVisitor(path);
      },


      // See issue:
      /**
         * Processes exported type aliases.
         *
         * This function also adds something to the AST directly, instead
         * of invoking annotate.
         *
         * @param path
         * @constructor
         */
      ExportNamedDeclaration: function ExportNamedDeclaration(path) {
        if (suppress) return;
        var node = path.node;


        if (!node.declaration || node.declaration.type !== 'TypeAlias') {
          return;
        }

        var declarationObject = node.declaration.right;

        var name = node.declaration.id.name;
        var propTypes = convertNodeToPropTypes(declarationObject);
        internalTypes[name] = propTypes;

        var propTypesAst = (0, _makePropTypesAst.makePropTypesAstForExport)(propTypes);

        // create a variable for reuse
        var exportedName = (0, _util.getExportNameForType)(name);
        exportedTypes[name] = exportedName;
        var variableDeclarationAst = t.variableDeclaration('var', [t.variableDeclarator(t.identifier(exportedName), propTypesAst)]);
        path.insertBefore(variableDeclarationAst);

        if (!omitRuntimeTypeExport) {
          // add the variable to the exports
          var exportAst = t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('defineProperty')), [t.identifier('exports'), t.stringLiteral((0, _util.getExportNameForType)(name)), t.objectExpression([t.objectProperty(t.identifier('value'), t.identifier(exportedName)), t.objectProperty(t.identifier('configurable'), t.booleanLiteral(true)), t.objectProperty(t.identifier('enumerable'), t.booleanLiteral(true))])]));
          var conditionalExportsAst = t.ifStatement(t.binaryExpression('!==', t.unaryExpression('typeof', t.identifier('exports')), t.stringLiteral('undefined')), exportAst);
          path.insertAfter(conditionalExportsAst);
        }
      },
      ImportDeclaration: function ImportDeclaration(path) {
        if (suppress) return;
        var node = path.node;

        // https://github.com/brigand/babel-plugin-flow-react-proptypes/issues/62
        // if (node.source.value[0] !== '.') {
        //   return;
        // }

        if (node.importKind === 'type') {
          node.specifiers.forEach(function (specifier) {
            var typeName = specifier.type === 'ImportDefaultSpecifier' ? specifier.local.name : specifier.imported.name;
            // Store the name the type so we can use it later. We do
            // mark it as importedTypes because we do handle these
            // differently than internalTypes.
            // imported types are basically realized as imports;
            // because we can be somewhat sure that we generated
            // the proper exported propTypes in the imported file
            // Later, we will check importedTypes to determine if
            // we want to put this as a 'raw' type in our internal
            // representation
            importedTypes[typeName] = (0, _util.getExportNameForType)(typeName);

            // https://github.com/brigand/babel-plugin-flow-react-proptypes/issues/129
            if (node.source.value === 'react' && typeName === 'ComponentType') {
              var ast = t.variableDeclaration('var', [t.variableDeclarator(t.identifier((0, _util.getExportNameForType)(typeName)), t.memberExpression(t.callExpression(t.identifier('require'), [t.stringLiteral('prop-types')]), t.identifier('func')))]);
              path.insertAfter(ast);
              return;
            }

            var variableDeclarationAst = t.variableDeclaration('var', [t.variableDeclarator(
            // TODO: use local import name?
            t.identifier((0, _util.getExportNameForType)(typeName)), t.logicalExpression('||', t.memberExpression(t.callExpression(t.identifier('require'), [t.stringLiteral(node.source.value)]), t.identifier((0, _util.getExportNameForType)(typeName))), t.memberExpression(t.callExpression(t.identifier('require'), [t.stringLiteral('prop-types')]), t.identifier('any'))))]);
            path.insertAfter(variableDeclarationAst);
          });
        }
      }
    }
  };
};

function getPropsTypeParam(node) {
  if (!node) return null;
  if (!node.superTypeParameters) return null;
  var superTypes = node.superTypeParameters;
  if (superTypes.params.length === 2) {
    return superTypes.params[0];
  } else if (superTypes.params.length === 3) {
    return superTypes.params[1];
  } else if (superTypes.params.length === 1) {
    return superTypes.params[0];
  }
  return null;
}