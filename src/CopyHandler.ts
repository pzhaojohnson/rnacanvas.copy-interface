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
    let windowSelection = window.getSelection();

    // don't do anything if there is a native browser selection to be copied
    // (check both whether there is a text selection or if something like an image is selected)
    if (windowSelection) {
      if (windowSelection.toString() || !windowSelection.isCollapsed) {
        return;
      }
    }

    // don't do anything if nothing is selected within the drawing
    if (this.#targetApp.selection.isEmpty()) {
      return;
    }

    event?.preventDefault();
    event?.stopPropagation();

    let selectedBasesSet = new Set(this.#targetApp.selectedBases);

    if (selectedBasesSet.size > 0) {
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

    // store as "application/json" (so as to not overwrite any copied sequence)
    // (note that MIME types such as this aren't supported by `navigator.clipboard`)
    event?.clipboardData?.setData('application/json', JSON.stringify(this.#targetApp.save()));
  }
}
