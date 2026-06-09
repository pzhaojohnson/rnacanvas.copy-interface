import type { Nucleobase } from './Nucleobase';

export interface App {
  readonly drawing: {
    /**
     * Defines the order of bases in the drawing.
     */
    readonly bases: Iterable<Nucleobase>;
  };

  /**
   * Not necessarily in the same order as in the drawing of the app.
   */
  readonly selectedBases: Iterable<Nucleobase>;
}
