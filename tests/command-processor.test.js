const CommandProcessor = require('../modules/command-processor');

describe('CommandProcessor', () => {
  test('loads the current command map', () => {
    const processor = new CommandProcessor();

    expect(processor.commandMap).toHaveProperty('/help');
    expect(processor.commandMap).toHaveProperty('/diagnostics');
    expect(processor.commandMap).toHaveProperty('/compute');
  });

  test('returns false for non-command input', async () => {
    const processor = new CommandProcessor();
    const result = await processor.processCommand('hello world', {});

    expect(result).toBe(false);
  });

  test('runs /help through the active help system', async () => {
    const processor = new CommandProcessor();
    const showGeneralHelp = jest.fn();

    const result = await processor.processCommand('/help', {
      helpSystem: { showGeneralHelp }
    });

    expect(result).toBe(true);
    expect(showGeneralHelp).toHaveBeenCalledTimes(1);
  });
});
