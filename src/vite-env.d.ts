/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="vite/client" />

declare namespace JSX {
  // type Element = string
  interface IntrinsicElements {
    [eleName: string]: any
  }
}

declare const __jsx: {
  h: (tag: string, props: any, ...children: any[]) => any
  Fragment: (props: { children?: any }) => any
}
