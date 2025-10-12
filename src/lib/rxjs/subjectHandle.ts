import type { Subject } from "rxjs";

export const subjectHandle =
  <A>($: Subject<A>) =>
  (x: A) => {
    $.next(x);
  };
