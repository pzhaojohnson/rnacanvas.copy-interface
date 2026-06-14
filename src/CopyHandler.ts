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
   * Handles the input copy event (or writes to the window navigator clipboard when no copy event is provided).
   */
  async handle(event?: ClipboardEvent) {
    let selection = window.getSelection();

    // don't do anything if there is a native browser selection to be copied
    // (need to check both whether there is a text selection or if something like an image is selected)
    if (selection) {
      if (selection.toString() || !selection.isCollapsed) {
        return;
      }
    }

    let selectedBasesSet = new Set(this.#targetApp.selectedBases);

    // don't do anything if no bases are selected
    if (selectedBasesSet.size == 0) {
      return;
    }

    event?.preventDefault();
    event?.stopPropagation();

    // the order of bases in this array will match that of the drawing
    let selectedBasesArray = [...this.#targetApp.drawing.bases].filter(b => selectedBasesSet.has(b));

    // bases need to be sorted correctly
    let selectedSubsequence = selectedBasesArray.map(b => b.domNode.textContent).join('');

    if (event) {
      event.clipboardData?.setData('text/plain', selectedSubsequence);
    } else {
      await navigator.clipboard.writeText(selectedSubsequence);
    }
  }
}
