import type { AttributifyAttributes } from "@unocss/preset-attributify";

declare namespace astroHTML.JSX {
  interface HTMLAttributes extends AttributifyAttributes {
    [key: string]: any;
  }
}
