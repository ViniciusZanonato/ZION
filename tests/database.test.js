const fs = require('fs');
const path = require('path');
const DatabaseModule = require('../modules/database');

const waitForDatabase = () => new Promise(resolve => setTimeout(resolve, 75));

describe('DatabaseModule', () => {
  let db;
  let tempDbPath;

  beforeEach(async () => {
    tempDbPath = path.join(__dirname, `test_${Date.now()}_${Math.random().toString(36).slice(2)}.db`);
    db = new DatabaseModule(tempDbPath);
    await waitForDatabase();
  });

  afterEach(async () => {
    if (db) {
      await db.close();
    }

    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  });

  test('initializes a SQLite database at the configured path', () => {
    expect(db.dbPath).toBe(tempDbPath);
    expect(db.db).toBeDefined();
    expect(fs.existsSync(tempDbPath)).toBe(true);
  });

  test('saves and reads conversation history', async () => {
    await db.saveConversation('session-1', 'hello', 'world', 7, 'test-model');
    const history = await db.getConversationHistory('session-1', 10);

    expect(history).toHaveLength(1);
    expect(history[0].user_message).toBe('hello');
    expect(history[0].assistant_response).toBe('world');
  });

  test('stores and reads JSON settings', async () => {
    await db.saveSetting('theme', { mode: 'dark' });
    const value = await db.getSetting('theme');

    expect(value).toEqual({ mode: 'dark' });
  });
});
