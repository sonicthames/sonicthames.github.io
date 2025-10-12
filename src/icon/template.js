const t = require('@babel/types');

const pascalToLabel = (name) =>
  name
    .replace(/^Svg/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim();

module.exports = (variables, { tpl }) => {
  let { imports, interfaces, componentName, props, jsx, exports } = variables;

  // componentName is a Babel AST node, extract the actual name
  const actualComponentName = componentName.name || componentName;
  const defaultLabel = `${pascalToLabel(actualComponentName)} icon`;

  // When expand-props is "none", we need to manually create the props parameter
  // Create props parameter with TypeScript type annotation
  const propsParam = t.identifier('props');
  propsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('SVGProps'),
      t.tsTypeParameterInstantiation([
        t.tsTypeReference(t.identifier('SVGSVGElement'))
      ])
    )
  );

  // Modify the JSX directly to add role, aria-label, and title
  // Add role="img" attribute
  const roleAttr = t.jsxAttribute(
    t.jsxIdentifier('role'),
    t.stringLiteral('img')
  );

  // Add aria-label={ariaLabel} attribute
  const ariaLabelAttr = t.jsxAttribute(
    t.jsxIdentifier('aria-label'),
    t.jsxExpressionContainer(t.identifier('ariaLabel'))
  );

  // Build new attributes array with role, aria-label, existing attrs, and restProps spread
  const attrs = jsx.openingElement.attributes;

  // Build new attributes array: role, aria-label, existing attrs, then {...restProps}
  const newAttrs = [
    roleAttr,
    ariaLabelAttr,
    ...attrs,
    t.jsxSpreadAttribute(t.identifier('restProps'))
  ];

  // Replace the attributes array
  jsx.openingElement.attributes = newAttrs;

  // Add <title>{ariaLabel}</title> as the first child
  const titleElement = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('title'), []),
    t.jsxClosingElement(t.jsxIdentifier('title')),
    [t.jsxExpressionContainer(t.identifier('ariaLabel'))],
    false
  );
  jsx.children.unshift(titleElement);

  // Add SVGProps import if not already present
  const svgPropsImport = t.importDeclaration(
    [t.importSpecifier(t.identifier('SVGProps'), t.identifier('SVGProps'))],
    t.stringLiteral('react')
  );
  svgPropsImport.importKind = 'type';

  return tpl`
    ${imports}
    import type { SVGProps } from "react";
    ${interfaces}

    export function ${componentName}(${propsParam}): JSX.Element {
      const { "aria-label": ariaLabel = "${defaultLabel}", ...restProps } = props;
      return ${jsx};
    }

    ${exports}
  `;
};
