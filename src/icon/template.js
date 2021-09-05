function template({ template }, opts, { imports, componentName, props, jsx, exports }) {
  return template.smart({ plugins: ['typescript'] }).ast`
    ${imports}
    export function ${componentName}(${props}): JSX.Element {
      return ${jsx};
    }
    ${exports}
  `;
}

module.exports = template;
