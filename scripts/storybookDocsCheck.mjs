import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

let cachedTypescript;

function getTypescript() {
  if (cachedTypescript) {
    return cachedTypescript;
  }

  const resolvedPath = require.resolve('typescript', {
    paths: [path.resolve(__dirname, '../apps/storybook')]
  });

  cachedTypescript = require(resolvedPath);
  return cachedTypescript;
}

function unwrapExpression(expression, ts) {
  let current = expression;

  while (
    ts.isSatisfiesExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function getPropertyName(node, ts) {
  if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
    return node.name.text;
  }

  if (ts.isNumericLiteral(node.name)) {
    return node.name.text;
  }

  return null;
}

function getStoryComponentName(filePath) {
  return path.basename(path.dirname(filePath));
}

function getObjectLiteralProperty(node, propertyName, ts) {
  for (const property of node.properties) {
    if (
      !ts.isPropertyAssignment(property) &&
      !ts.isShorthandPropertyAssignment(property)
    ) {
      continue;
    }

    if (getPropertyName(property, ts) === propertyName) {
      return property;
    }
  }

  return null;
}

function getObjectLiteralValue(node, propertyName, ts) {
  const property = getObjectLiteralProperty(node, propertyName, ts);

  if (!property || ts.isShorthandPropertyAssignment(property)) {
    return null;
  }

  const value = unwrapExpression(property.initializer, ts);
  return ts.isObjectLiteralExpression(value) ? value : null;
}

function hasNestedSummary(node, nestedKey, ts) {
  const tableObject = getObjectLiteralValue(node, 'table', ts);

  if (!tableObject) {
    return false;
  }

  const nestedObject = getObjectLiteralValue(tableObject, nestedKey, ts);

  if (!nestedObject) {
    return false;
  }

  return getObjectLiteralProperty(nestedObject, 'summary', ts) !== null;
}

function isDisabledEntry(node, ts) {
  const tableObject = getObjectLiteralValue(node, 'table', ts);

  if (!tableObject) {
    return false;
  }

  const disableProperty = getObjectLiteralProperty(tableObject, 'disable', ts);

  if (!disableProperty || ts.isShorthandPropertyAssignment(disableProperty)) {
    return false;
  }

  return (
    unwrapExpression(disableProperty.initializer, ts).kind ===
    ts.SyntaxKind.TrueKeyword
  );
}

function getImportedNamesFromFreyUi(sourceFile, ts) {
  const imports = [];

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== 'frey-ui'
    ) {
      continue;
    }

    const importClause = statement.importClause;

    if (
      !importClause?.namedBindings ||
      !ts.isNamedImports(importClause.namedBindings)
    ) {
      continue;
    }

    for (const element of importClause.namedBindings.elements) {
      imports.push(element.name.text);
    }
  }

  return imports;
}

function findTypeDeclaration(sourceFile, typeName, ts) {
  for (const statement of sourceFile.statements) {
    if (
      (ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)) &&
      statement.name.text === typeName
    ) {
      return statement;
    }
  }

  return null;
}

function collectExplicitPropsFromDeclaration(
  declaration,
  sourceFile,
  ts,
  visited = new Set()
) {
  if (ts.isInterfaceDeclaration(declaration)) {
    return collectExplicitPropsFromMembers(
      declaration.members,
      sourceFile,
      ts,
      visited
    );
  }

  return collectExplicitPropsFromTypeNode(
    declaration.type,
    sourceFile,
    ts,
    visited
  );
}

function collectExplicitPropsFromMembers(
  members,
  sourceFile,
  ts,
  visited = new Set()
) {
  const props = new Set();

  for (const member of members) {
    if (!ts.isPropertySignature(member)) {
      continue;
    }

    const name = getPropertyName(member, ts);

    if (name) {
      props.add(name);
    }
  }

  return props;
}

function collectExplicitPropsFromTypeNode(
  typeNode,
  sourceFile,
  ts,
  visited = new Set()
) {
  const props = new Set();

  if (!typeNode) {
    return props;
  }

  const current = unwrapExpression(typeNode, ts);

  if (ts.isTypeLiteralNode(current)) {
    return collectExplicitPropsFromMembers(
      current.members,
      sourceFile,
      ts,
      visited
    );
  }

  if (ts.isIntersectionTypeNode(current)) {
    for (const typePart of current.types) {
      for (const prop of collectExplicitPropsFromTypeNode(
        typePart,
        sourceFile,
        ts,
        visited
      )) {
        props.add(prop);
      }
    }

    return props;
  }

  if (ts.isTypeReferenceNode(current) && ts.isIdentifier(current.typeName)) {
    const referenceName = current.typeName.text;

    if (visited.has(referenceName)) {
      return props;
    }

    visited.add(referenceName);

    const declaration = findTypeDeclaration(sourceFile, referenceName, ts);

    if (declaration) {
      for (const prop of collectExplicitPropsFromDeclaration(
        declaration,
        sourceFile,
        ts,
        visited
      )) {
        props.add(prop);
      }
    }
  }

  return props;
}

function getComponentSourceFiles(filePath, ts) {
  const componentName = getStoryComponentName(filePath);
  const componentDir = path.join(
    rootDir,
    'packages',
    'frey-ui',
    'src',
    componentName
  );

  if (!fs.existsSync(componentDir)) {
    return [];
  }

  return fs
    .readdirSync(componentDir)
    .filter(
      (entryName) =>
        (entryName.endsWith('.ts') || entryName.endsWith('.tsx')) &&
        !entryName.includes('.test.') &&
        !entryName.includes('.stories.')
    )
    .map((entryName) => path.join(componentDir, entryName))
    .map((componentPath) =>
      ts.createSourceFile(
        componentPath,
        fs.readFileSync(componentPath, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        componentPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      )
    );
}

function resolveDeclarationInComponentFiles(
  componentSourceFiles,
  typeName,
  ts
) {
  for (const sourceFile of componentSourceFiles) {
    const declaration = findTypeDeclaration(sourceFile, typeName, ts);

    if (declaration) {
      return { declaration, sourceFile };
    }
  }

  return null;
}

function resolveExplicitPropNames(filePath, storySourceFile, ts) {
  const importedNames = getImportedNamesFromFreyUi(storySourceFile, ts);

  if (importedNames.length === 0) {
    return [];
  }

  const componentSourceFiles = getComponentSourceFiles(filePath, ts);

  if (componentSourceFiles.length === 0) {
    return [];
  }

  const candidateTypeNames = [
    `${getStoryComponentName(filePath)}Props`,
    ...importedNames.filter((name) => name.endsWith('Props'))
  ];
  const uniqueCandidateTypeNames = [...new Set(candidateTypeNames)];

  for (const typeName of uniqueCandidateTypeNames) {
    const match = resolveDeclarationInComponentFiles(
      componentSourceFiles,
      typeName,
      ts
    );

    if (!match) {
      continue;
    }

    return [
      ...collectExplicitPropsFromDeclaration(
        match.declaration,
        match.sourceFile,
        ts
      )
    ];
  }

  return [];
}

function findMetaObject(sourceFile, ts) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== 'meta'
      ) {
        continue;
      }

      if (!declaration.initializer) {
        continue;
      }

      const initializer = unwrapExpression(declaration.initializer, ts);

      if (ts.isObjectLiteralExpression(initializer)) {
        return initializer;
      }
    }
  }

  return null;
}

export function collectStoryDocsIssues({ filePath, sourceText }) {
  const ts = getTypescript();
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const metaObject = findMetaObject(sourceFile, ts);

  if (!metaObject) {
    return ['Missing meta object literal.'];
  }

  const argTypesObject = getObjectLiteralValue(metaObject, 'argTypes', ts);

  if (!argTypesObject) {
    return ['Missing meta.argTypes block.'];
  }

  const issues = [];
  const entryMap = new Map();

  for (const property of argTypesObject.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    const entryName = getPropertyName(property, ts);

    if (!entryName) {
      continue;
    }

    const entryValue = unwrapExpression(property.initializer, ts);

    if (!ts.isObjectLiteralExpression(entryValue)) {
      issues.push(`ArgTypes entry '${entryName}' must be an object literal.`);
      continue;
    }

    entryMap.set(entryName, entryValue);

    if (isDisabledEntry(entryValue, ts)) {
      continue;
    }

    if (getObjectLiteralProperty(entryValue, 'description', ts) === null) {
      issues.push(
        `Incomplete argTypes entry '${entryName}': missing description.`
      );
    }

    if (!hasNestedSummary(entryValue, 'type', ts)) {
      issues.push(
        `Incomplete argTypes entry '${entryName}': missing table.type.summary.`
      );
    }

    if (!hasNestedSummary(entryValue, 'defaultValue', ts)) {
      issues.push(
        `Incomplete argTypes entry '${entryName}': missing table.defaultValue.summary.`
      );
    }

    if (
      getObjectLiteralProperty(entryValue, 'control', ts) === null &&
      getObjectLiteralProperty(entryValue, 'action', ts) === null
    ) {
      issues.push(
        `Incomplete argTypes entry '${entryName}': missing control or action.`
      );
    }
  }

  const explicitPropNames = resolveExplicitPropNames(filePath, sourceFile, ts);

  for (const propName of explicitPropNames) {
    const entryValue = entryMap.get(propName);

    if (!entryValue || isDisabledEntry(entryValue, ts)) {
      issues.push(
        `Missing visible argTypes entry for exported prop '${propName}'.`
      );
    }
  }

  return issues;
}

export function collectStoryDocsIssuesFromFile(filePath) {
  return collectStoryDocsIssues({
    filePath,
    sourceText: fs.readFileSync(filePath, 'utf8')
  });
}
