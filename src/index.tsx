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
    };

    type VOID_ELEMENT =
      | "area"
      | "base"
      | "br"
      | "col"
      | "embed"
      | "hr"
      | "img"
      | "input"
      | "link"
      | "meta"
      | "param"
      | "source"
      | "track"
      | "wbr";

    type AttributeExclusionUnion = "children";

    export type Attribute<TagName extends keyof HTMLElementTagNameMap> = {
      readonly [Attr in keyof Omit<
        HTMLElementTagNameMap[TagName],
        AttributeExclusionUnion
      >]?: HTMLElementTagNameMap[TagName][Attr] extends
        | string
        | boolean
        | number
        ? HTMLElementTagNameMap[TagName][Attr]
        : never;
    };
  }
}
export type HmtlTagName = string;
export type FunctionComponent<
  P extends Record<string, any> = Record<string, any>
> = (props: P) => JSX.Element;

type JSXConverter<K extends keyof JSX.IntrinsicElements> = (
  element: HmtlTagName | JSX.ElementClassConstructor | FunctionComponent,
  props: Record<string, any>,
  ...children: string[]
) => void;

// https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const VOID_ELEMENT_SET = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

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
      let attr = `${key}="${
        String(value as number | string)
          ?.replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;") ?? ""
      }"`;
      attributes.push(attr);
    } else if (typeof value === "boolean" && value) {
      attributes.push(key);
    }
  }
  return attributes.join(" ");
}

export const jsxToHtml: JSXConverter<keyof JSX.IntrinsicElements> = (
  element,
  props,
  ...children
) => {
  let html = "";
  if (typeof element === "string") {
    html = VOID_ELEMENT_SET.has(element)
      ? `<${element} ${props ? ` ${renderProps(props)}` : ""}/>`
      : `<${element}${props ? ` ${renderProps(props)}` : ""}>${children.join(
          ""
        )}</${element}>`;
  } else {
    if (props && children) {
      props.children = children.join("");
    }
    let isClass = false;
    let component;
    try {
      component = new (element as JSX.ElementClassConstructor)();
      isClass = true;
      html = component.render();
    } catch {}

    if (!isClass) {
      html = (element as FunctionComponent)(props);
    }
  }

  return html;
};
