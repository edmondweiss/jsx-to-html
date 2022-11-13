type HTML = string;
type HtmlTagName = string;

type JSXConverter<K extends keyof JSX.IntrinsicElements> = (
  element: HtmlTagName | JSX.ElementClassConstructor | FunctionComponent,
  props: Record<string, any>,
  ...children: string[]
) => void;

export type FunctionComponent<
  P extends Record<string, any> = Record<string, any>
> = (props: P) => JSX.Element;

function isClass(func: unknown): func is JSX.ElementClassConstructor {
  return (
    typeof func === "function" &&
    /^class\s/.test(Function.prototype.toString.call(func))
  );
}

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

const ELEMENT_ATTRIBUTE_EXCLUSION_SET = new Set(["children"]);

function renderProps(props: Record<string, any> | undefined): string {
  if (!props) {
    return "";
  }
  const attributes = [];
  for (let [key, value] of Object.entries(props)) {
    if (ELEMENT_ATTRIBUTE_EXCLUSION_SET.has(key)) {
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

export namespace Aui {
  export const createElement: JSXConverter<keyof JSX.IntrinsicElements> = (
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
      if (!props) {
        props = {};
      }
      if (children && children.length) {
        props.children = children.join("");
      }
      if (isClass(element)) {
        html = new element(props).render();
      } else {
        html = element(props);
      }
    }

    return html;
  };

  export const fragment = (props: any) => {
    if (props == null) {
      return "";
    }
    return props.children; //  props && (props as any).children ? (props as any).children : "";
  };
}

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
        | (() => void)
        ? HTMLElementTagNameMap[TagName][Attr]
        : never;
    } & {
      children?: TagName extends VOID_ELEMENT ? never : any;
    };
  }
}
