function template({ imports, componentName, props, jsx, exports }, { tpl }) {
  return tpl`
    ${imports}

    export function ${componentName}(${props}): JSX.Element {
      return ${jsx};
    }
    
    ${exports}
  `;
}

module.exports = template;
