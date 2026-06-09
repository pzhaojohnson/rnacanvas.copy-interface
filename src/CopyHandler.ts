import type { App } from './App';

/**
 * Handles copy events for a target app.
 */
export class CopyHandler {
  readonly #targetApp;

  constructor(targetApp: App) {
    this.#targetApp = targetApp;
  }

  /**
   * Handles the input copy event.
   */
  handle(event: ClipboardEvent) {
    let selectedBasesSet = new Set(this.#targetApp.selectedBases);

    // don't do anything if no bases are selected
    if (selectedBasesSet.size == 0) {
      return;
    }

    event.preventDefault();

    // the order of bases in this array will match that of the drawing
    let selectedBasesArray = [...this.#targetApp.drawing.bases].filter(b => selectedBasesSet.has(b));

    // bases need to be sorted correctly
    let selectedSubsequence = selectedBasesArray.map(b => b.domNode.textContent).join('');

    event.clipboardData?.setData('text/plain', selectedSubsequence);
  }
}
