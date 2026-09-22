import { describe, it, expect } from 'vitest';

// json-utils.js uses `const JsonUtils = { ... }` with a CJS guard at the bottom.
// We can't import it as ESM directly, so we load it via a dynamic require workaround.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const JsonUtils = require('../public/js/json-utils.js');

describe('escapeHtml', () => {
  it('escapes &, <, >', () => {
    expect(JsonUtils.escapeHtml('<div class="a">&</div>')).toBe(
      '&lt;div class="a"&gt;&amp;&lt;/div&gt;'
    );
  });

  it('returns plain text unchanged', () => {
    expect(JsonUtils.escapeHtml('hello world')).toBe('hello world');
  });
});

describe('formatJSON', () => {
  it('formats with 2-space indent', () => {
    const result = JsonUtils.formatJSON('{"a":1}', 2);
    expect(result).toBe('{\n  "a": 1\n}');
  });

  it('formats with 4-space indent', () => {
    const result = JsonUtils.formatJSON('{"a":1}', 4);
    expect(result).toBe('{\n    "a": 1\n}');
  });

  it('formats with tab indent', () => {
    const result = JsonUtils.formatJSON('{"a":1}', '\t');
    expect(result).toBe('{\n\t"a": 1\n}');
  });

  it('throws on invalid JSON', () => {
    expect(() => JsonUtils.formatJSON('{bad}')).toThrow();
  });
});

describe('minifyJSON', () => {
  it('removes whitespace', () => {
    const result = JsonUtils.minifyJSON('{\n  "a": 1,\n  "b": 2\n}');
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('throws on invalid JSON', () => {
    expect(() => JsonUtils.minifyJSON('not json')).toThrow();
  });
});

describe('validateJSON', () => {
  it('returns valid result for valid JSON', () => {
    const result = JsonUtils.validateJSON('{"a":1}');
    expect(result.valid).toBe(true);
    expect(result.description).toBe('Object with 1 key');
  });

  it('throws on invalid JSON', () => {
    expect(() => JsonUtils.validateJSON('{invalid}')).toThrow();
  });
});

describe('describeJSON', () => {
  it('describes an array', () => {
    expect(JsonUtils.describeJSON([1, 2, 3])).toBe('Array with 3 items');
  });

  it('handles singular item', () => {
    expect(JsonUtils.describeJSON([1])).toBe('Array with 1 item');
  });

  it('describes an object', () => {
    expect(JsonUtils.describeJSON({ a: 1, b: 2 })).toBe('Object with 2 keys');
  });

  it('describes a primitive', () => {
    expect(JsonUtils.describeJSON('hello')).toBe('string');
    expect(JsonUtils.describeJSON(42)).toBe('number');
    expect(JsonUtils.describeJSON(true)).toBe('boolean');
  });
});

describe('syntaxHighlight', () => {
  it('wraps keys with json-key class', () => {
    const result = JsonUtils.syntaxHighlight('"name": "test"');
    expect(result).toContain('json-key');
  });

  it('wraps strings with json-string class', () => {
    const result = JsonUtils.syntaxHighlight('"hello"');
    expect(result).toContain('json-string');
  });

  it('wraps numbers with json-number class', () => {
    const result = JsonUtils.syntaxHighlight('42');
    expect(result).toContain('json-number');
  });

  it('wraps booleans with json-boolean class', () => {
    const result = JsonUtils.syntaxHighlight('true');
    expect(result).toContain('json-boolean');
  });

  it('wraps null with json-null class', () => {
    const result = JsonUtils.syntaxHighlight('null');
    expect(result).toContain('json-null');
  });
});

describe('getErrorLocation', () => {
  it('extracts line number from error with position', () => {
    const input = '{\n  "a": bad\n}';
    const result = JsonUtils.getErrorLocation('Unexpected token b in JSON at position 8', input);
    expect(result).toEqual({ line: 2, position: 8 });
  });

  it('returns null when no position in error', () => {
    const result = JsonUtils.getErrorLocation('Some error', 'input');
    expect(result).toBeNull();
  });
});
