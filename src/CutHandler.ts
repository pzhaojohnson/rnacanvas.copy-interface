import type { App } from './App';

import { CopyHandler } from './CopyHandler';

export class CutHandler {
  readonly #targetApp;

  readonly #copyHandler;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;

    this.#copyHandler = new CopyHandler(targetApp);
  }

  /**
   * Handles the input cut event.
   *
   * (Or writes to the window navigator clipboard if no cut event object is provided.)
   */
  async handle(event?: ClipboardEvent) {
    let windowSelection = window.getSelection();

    // don't do anything if there is a native browser selection to be cut
    // (check both whether there is a text selection or if something such as an image is selected)
    if (windowSelection) {
      if (windowSelection.toString() || !windowSelection.isCollapsed) {
        return;
      }
    }

    // don't do anything if nothing is selected within the drawing
    if (this.#targetApp.selection.isEmpty()) {
      return;
    }

    await this.#copyHandler.handle(event);

    this.#targetApp.removeSelected();
  }
}
