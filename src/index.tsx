type HTML = string;

declare global {
  namespace JSX {
    type Element = HTML;
    interface ElementClass {
      render: () => HTML;
    }

    interface ElementClassConstructor {
      new (props?: Record<string, any>): JSX.ElementClass;
    }

    interface ElementAttributesProperty {
      props: {};
    }

    interface ElementChildrenAttribute {
      children: {};
    }

    export type IntrinsicElements = {
      [T in keyof HTMLElementTagNameMap]: Attribute<T>;
    }

    type VOID_ELEMENT =
      'area' |
      'base' |
      'br' |
      'col' |
      'embed' |
      'hr' |
      'img' |
      'input' |
      'link' |
      'meta' |
      'param' |
      'source' |
      'track' |
      'wbr';

    type AttributeExclusionUnion = "children";

    export type Attribute<TagName extends keyof HTMLElementTagNameMap> = {
      readonly [Attr in keyof Omit<HTMLElementTagNameMap[TagName], AttributeExclusionUnion>]?:
        HTMLElementTagNameMap[TagName][Attr] extends (string | boolean | number) ? HTMLElementTagNameMap[TagName][Attr] : never;
    }
  }
}

type JSXConverter<K extends keyof JSX.IntrinsicElements> = (element: string | JSX.ElementClassConstructor | ((props: Record<string, any>) => string), props: Record<string, any>, ...children: string[]) => void;

// https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const VOID_ELEMENT_SET = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

function isClass(func: unknown): func is JSX.ElementClassConstructor {
  return typeof func === 'function'
    && /^class\s/.test(Function.prototype.toString.call(func));
}
export const jsxToHtml: JSXConverter<keyof JSX.IntrinsicElements> = (element, props, ...children) => {
  console.log("**********************************************************************")
  console.log('tagName:', element)
  console.log('props:', props);
  console.log('children:', children);

  let html = '';

  if (typeof element === "string") {
    html =  (VOID_ELEMENT_SET.has(element))
      ? `<${element} ${props ? ` ${renderProps(props)}` : ''}/>`:
      `<${element}${props ? ` ${renderProps(props)}` : ''}>${children.join('')}</${element}>`;
  } else {
    if (props && children) {
      props.children = children.join('');
    }
    try {
      const component = new (element as JSX.ElementClassConstructor)()
      html = component.render();
    } catch (e) {

    }

    if (isClass(element)) {
      html = new element(props).render();
    } else {
      console.log('function type')
      html = element(props);
    }
  }

  return html;
}

function renderProps(props: Record<string, any> | undefined): string {
  if (!props) {
    return "";
  }
  const attributes = [];
  for (let [key, value] of Object.entries(props)) {
    if (key === "children") {
      continue;
    }
    if (typeof value === "string" || typeof value === "number") {
      let attr = `${key}="${String((value as number | string))?.replace(/&/g, '&amp;').replace(/"/g, '&quot;') ?? ''}"`
      attributes.push(attr);
    } else if (typeof value === "boolean" && value) {
      attributes.push(key);
    }
  }
  return attributes.join(' ');
}
