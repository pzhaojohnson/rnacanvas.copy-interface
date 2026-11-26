/**
 * @jest-environment jsdom
 */

import { CutHandler } from './CutHandler';

describe('`class CutHandler`', () => {
  test('`handle()`', async () => {
    var targetApp = new AppMock();

    var cutHandler = new CutHandler(targetApp);

    [...'AUGCUCGCUAGCUGAUCGC'].forEach(letter => targetApp.drawing.bases.push(new NucleobaseMock(letter)));

    window.getSelection = () => null;

    // nothing is selected
    targetApp.selectedBases = [];
    targetApp.selection.isEmpty = () => true;

    var event = new ClipboardEventMock();

    await cutHandler.handle(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();

    expect(event.clipboardData.setData).not.toHaveBeenCalled();

    expect(targetApp.removeSelected).not.toHaveBeenCalled();

    // multiple bases are selected (that are out of order)
    targetApp.selectedBases = [2, 8, 5, 1, 0, 3, 9].map(i => targetApp.drawing.bases[i]);
    targetApp.selection.isEmpty = () => false;

    var event = new ClipboardEventMock();

    await cutHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    expect(event.clipboardData.setData).toHaveBeenCalledTimes(2);

    expect(event.clipboardData.setData.mock.calls[0][0]).toBe('text/plain');
    expect(event.clipboardData.setData.mock.calls[0][1]).toBe('AUGCCUA');

    expect(event.clipboardData.setData.mock.calls[1][0]).toBe('application/json');

    expect(targetApp.removeSelected).toHaveBeenCalledTimes(1);

    // the selection is removed only after it has been written to the clipboard
    expect(targetApp.calls).toStrictEqual(['serialized', 'removeSelected']);

    // something other than bases is selected
    targetApp.removeSelected.mockClear();
    targetApp.selectedBases = [];

    var event = new ClipboardEventMock();

    await cutHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.clipboardData.setData).toHaveBeenCalledTimes(1);
    expect(event.clipboardData.setData.mock.calls[0][0]).toBe('application/json');

    expect(targetApp.removeSelected).toHaveBeenCalledTimes(1);

    targetApp.selectedBases = [targetApp.drawing.bases[0]];

    // there is a non-collapsed native browser selection with no text content
    targetApp.removeSelected.mockClear();
    window.getSelection = () => ({ isCollapsed: false, toString: () => '' });

    var event = new ClipboardEventMock();

    await cutHandler.handle(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(event.clipboardData.setData).not.toHaveBeenCalled();

    expect(targetApp.removeSelected).not.toHaveBeenCalled();

    // there is a collapsed native browser selection with text content
    window.getSelection = () => ({ isCollapsed: true, toString: () => ' ' });

    var event = new ClipboardEventMock();

    await cutHandler.handle(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.clipboardData.setData).not.toHaveBeenCalled();

    expect(targetApp.removeSelected).not.toHaveBeenCalled();

    // there is a collapsed native browser selection with no text content
    window.getSelection = () => ({ isCollapsed: true, toString: () => '' });

    var event = new ClipboardEventMock();

    await cutHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.clipboardData.setData).toHaveBeenCalledTimes(2);

    expect(targetApp.removeSelected).toHaveBeenCalledTimes(1);

    window.getSelection = () => null;

    // no cut event object is provided
    targetApp.removeSelected.mockClear();
    targetApp.selectedBases = [1, 4, 10, 9, 2].map(i => targetApp.drawing.bases[i]);
    navigator.clipboard = { writeText: jest.fn() };

    await cutHandler.handle();

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText.mock.calls[0][0]).toBe('UGUAG');

    expect(targetApp.removeSelected).toHaveBeenCalledTimes(1);

    // nothing is selected and no cut event object is provided
    targetApp.removeSelected.mockClear();
    targetApp.selectedBases = [];
    targetApp.selection.isEmpty = () => true;
    navigator.clipboard = { writeText: jest.fn() };

    await cutHandler.handle();

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(targetApp.removeSelected).not.toHaveBeenCalled();
  });
});

class AppMock {
  drawing = {
    bases: [],
  };

  selection = {
    isEmpty: () => false,
  };

  selectedBases = [];

  calls = [];

  serialized() {
    this.calls.push('serialized');

    return { drawing: { bases: JSON.stringify(this.drawing.bases) } };
  }

  removeSelected = jest.fn(() => {
    this.calls.push('removeSelected');
  });
}

class NucleobaseMock {
  /**
   * Make each mock base unique.
   */
  id = Math.random();

  constructor(textContent) {
    this.domNode = {
      textContent,
    };
  }
}

class ClipboardEventMock {
  preventDefault = jest.fn();

  stopPropagation = jest.fn();

  clipboardData = {
    setData: jest.fn(),
  };
}
