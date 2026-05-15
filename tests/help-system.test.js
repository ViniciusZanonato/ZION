const HelpSystem = require('../modules/help-system');

describe('HelpSystem', () => {
  let helpSystem;
  let originalLog;

  beforeEach(() => {
    helpSystem = new HelpSystem();
    originalLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
  });

  test('exposes the active command catalog', () => {
    const commands = helpSystem.getAvailableCommands();

    expect(commands).toContain('help');
    expect(commands).toContain('weather');
    expect(commands).toContain('compute');
  });

  test('checks command existence with or without slash', () => {
    expect(helpSystem.hasCommand('help')).toBe(true);
    expect(helpSystem.hasCommand('/help')).toBe(true);
    expect(helpSystem.hasCommand('missing-command')).toBe(false);
  });

  test('returns command metadata', () => {
    const info = helpSystem.getCommandInfo('help');

    expect(info).toBeDefined();
    expect(info.description).toBeTruthy();
    expect(info.usage).toBeTruthy();
  });

  test('renders general help without throwing', () => {
    expect(() => helpSystem.showGeneralHelp()).not.toThrow();
    expect(console.log).toHaveBeenCalled();
  });
});
