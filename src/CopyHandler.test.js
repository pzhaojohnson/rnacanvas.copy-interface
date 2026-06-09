import { CopyHandler } from './CopyHandler';

describe('`class CopyHandler`', () => {
  test('`handle()`', () => {
    var targetApp = new AppMock();

    var copyHandler = new CopyHandler(targetApp);

    [...'AUGCUCGCUAGCUGAUCGC'].forEach(letter => targetApp.drawing.bases.push(new NucleobaseMock(letter)));

    // no bases are selected
    targetApp.selectedBases = [];

    var event = new ClipboardEventMock();

    copyHandler.handle(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.clipboardData.setData).not.toHaveBeenCalled();

    // one base is selected
    targetApp.selectedBases = [targetApp.drawing.bases[4]];

    var event = new ClipboardEventMock();

    copyHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.clipboardData.setData).toHaveBeenCalledTimes(1);

    expect(event.clipboardData.setData.mock.calls[0][0]).toBe('text/plain');
    expect(event.clipboardData.setData.mock.calls[0][1]).toBe('U');

    // multiple bases are selected (that are out of order)
    targetApp.selectedBases = [2, 8, 5, 1, 0, 3, 9].map(i => targetApp.drawing.bases[i]);

    var event = new ClipboardEventMock();

    copyHandler.handle(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.clipboardData.setData).toHaveBeenCalledTimes(1);

    // copy handler must sort selected bases to write correct sequence
    expect(event.clipboardData.setData.mock.calls[0][0]).toBe('text/plain');
    expect(event.clipboardData.setData.mock.calls[0][1]).toBe('AUGCCUA');

    // copy event is missing clipboard data property
    var event = new ClipboardEventMock();
    event.clipboardData = undefined;

    targetApp.selectedBases = [targetApp.drawing.bases[0]];

    expect(() => copyHandler.handle(event)).not.toThrow();

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
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
    this.textContent = textContent;
  }
}

class ClipboardEventMock {
  preventDefault = jest.fn();

  clipboardData = {
    setData: jest.fn(),
  };
}
