import { HTMLAttributes, SVGAttributes } from "svelte/elements";
import type {
  CalendarRangeProps,
  CalendarMonthProps,
  CalendarDateProps,
} from "cally";

type MapEvents<T> = {
  [K in keyof T as K extends `on${infer E}` ? `on:${Lowercase<E>}` : K]: T[K];
};

declare module "svelte/elements" {
  interface SvelteHTMLElements {
    "calendar-range": MapEvents<CalendarRangeProps>;
    "calendar-month": MapEvents<CalendarMonthProps>;
    "calendar-date": MapEvents<CalendarDateProps> & {
      class: string | null;
    };
  }

  interface SVGAttributes<T> {
    slot?: string;
  }
  interface HTMLAttributes<T> {
    slot?: string;
  }
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
