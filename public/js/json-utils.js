// Pure JSON utility functions (shared by app.js and tests)
const JsonUtils = {
  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  syntaxHighlight(json) {
    const escaped = JsonUtils.escapeHtml(json);
    return escaped.replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string';
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  },

  formatJSON(raw, indent) {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, indent);
  },

  minifyJSON(raw) {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed);
  },

  validateJSON(raw) {
    const parsed = JSON.parse(raw);
    return { valid: true, data: parsed, description: JsonUtils.describeJSON(parsed) };
  },

  describeJSON(obj) {
    if (Array.isArray(obj)) {
      return 'Array with ' + obj.length + ' item' + (obj.length !== 1 ? 's' : '');
    }
    if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj).length;
      return 'Object with ' + keys + ' key' + (keys !== 1 ? 's' : '');
    }
    return typeof obj;
  },

  getErrorLocation(errorMessage, inputText) {
    const posMatch = errorMessage.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = inputText.substring(0, pos);
      const line = before.split('\n').length;
      return { line, position: pos };
    }
    return null;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JsonUtils;
}
