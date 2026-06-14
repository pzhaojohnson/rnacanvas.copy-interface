/**
 * @jest-environment jsdom
 */

import { CopyHandler } from './CopyHandler';

describe('`class CopyHandler`', () => {
  test('`handle()`', async () => {
    var targetApp = new AppMock();

    var copyHandler = new CopyHandler(targetApp);

    [...'AUGCUCGCUAGCUGAUCGC'].forEach(letter => targetApp.drawing.bases.push(new NucleobaseMock(letter)));

    // no bases are selected
    targetApp.selectedBases = [];

    var event = new ClipboardEventMock();

    await copyHandler.handle(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();

    expect(event.clipboardData.setData).not.toHaveBeenCalled();

    // one base is selected
    targetApp.selectedBases = [targetApp.drawing.bases[4]];

    var event = new ClipboardEventMock();

    await copyHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    expect(event.clipboardData.setData).toHaveBeenCalledTimes(1);

    expect(event.clipboardData.setData.mock.calls[0][0]).toBe('text/plain');
    expect(event.clipboardData.setData.mock.calls[0][1]).toBe('U');

    // multiple bases are selected (that are out of order)
    targetApp.selectedBases = [2, 8, 5, 1, 0, 3, 9].map(i => targetApp.drawing.bases[i]);

    var event = new ClipboardEventMock();

    await copyHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    expect(event.clipboardData.setData).toHaveBeenCalledTimes(1);

    // copy handler must sort selected bases to write correct sequence
    expect(event.clipboardData.setData.mock.calls[0][0]).toBe('text/plain');
    expect(event.clipboardData.setData.mock.calls[0][1]).toBe('AUGCCUA');

    targetApp.selectedBases = [targetApp.drawing.bases[0]];

    // there is no native browser selection
    window.getSelection = () => null;

    var event = new ClipboardEventMock();

    expect([...targetApp.selectedBases].length).toBeGreaterThan(0);

    await copyHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    expect(event.clipboardData.setData).toHaveBeenCalledTimes(1);

    // there is a collapsed native browser selection with no text content
    window.getSelection = () => ({ isCollapsed: true, toString: () => '' });

    var event = new ClipboardEventMock();

    expect([...targetApp.selectedBases].length).toBeGreaterThan(0);

    await copyHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    expect(event.clipboardData.setData).toHaveBeenCalledTimes(1);

    // there is a non-collapsed native browser selection with no text content
    window.getSelection = () => ({ isCollapsed: false, toString: () => '' });

    var event = new ClipboardEventMock();

    expect([...targetApp.selectedBases].length).toBeGreaterThan(0);

    await copyHandler.handle(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();

    expect(event.clipboardData.setData).not.toHaveBeenCalled();

    // there is a collapsed native browser selection with text content
    // (a single space character, for instance, counts as text content)
    window.getSelection = () => ({ isCollapsed: true, toString: () => ' ' });

    var event = new ClipboardEventMock();

    expect([...targetApp.selectedBases].length).toBeGreaterThan(0);

    await copyHandler.handle(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();

    expect(event.clipboardData.setData).not.toHaveBeenCalled();

    window.getSelection = () => null;

    // copy event is missing clipboard data property
    var event = new ClipboardEventMock();
    event.clipboardData = undefined;

    targetApp.selectedBases = [targetApp.drawing.bases[0]];

    expect(async () => await copyHandler.handle(event)).not.toThrow();

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    window.getSelection = () => null;

    targetApp.selectedBases = [1, 4, 10, 9, 2].map(i => targetApp.drawing.bases[i]);

    navigator.clipboard = { writeText: jest.fn() };

    // no copy event object is provided
    expect(async () => await copyHandler.handle()).not.toThrow();

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

    expect(window.navigator.clipboard.writeText.mock.calls[0][0]).toBe('UGUAG');
  });
});

class AppMock {
  drawing = {
    bases: [],
  };

  selectedBases = [];
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
