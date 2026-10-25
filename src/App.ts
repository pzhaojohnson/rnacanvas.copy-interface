import type { Nucleobase } from './Nucleobase';

export interface App {
  readonly drawing: {
    /**
     * Defines the order of bases in the drawing.
     */
    readonly bases: Iterable<Nucleobase>;
  };

  readonly selection: {
    /**
     * Returns `true` if nothing is currently selected within the drawing of the app
     * and `false` otherwise.
     */
    isEmpty(): boolean;
  }

  /**
   * Not necessarily in the same order as in the drawing of the app.
   */
  readonly selectedBases: Iterable<Nucleobase>;

  /**
   * Returns the state of the app at the time the method is called.
   */
  save(): AppState;

  /**
   * Restores the app to the previous state.
   */
  restore(previousState: AppState): void;
}

/**
 * A JSON-serializable non-null object that stores the state of the app
 * (including things such as the state of the drawing and which elements are currently selected).
 *
 * Can be included in a saved drawing file, for instance,
 * or the undo stack of the app.
 */
type AppState = {};
