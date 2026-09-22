(() => {
  'use strict';

  // DOM refs
  const input = document.getElementById('jsonInput');
  const outputCode = document.getElementById('jsonOutputCode');
  const treeOutput = document.getElementById('treeOutput');
  const jsonOutput = document.getElementById('jsonOutput');
  const statusBar = document.getElementById('statusBar');
  const statusMessage = document.getElementById('statusMessage');
  const inputCount = document.getElementById('inputCount');
  const outputCount = document.getElementById('outputCount');
  const inputLineNumbers = document.getElementById('inputLineNumbers');
  const indentSelect = document.getElementById('indentSelect');

  // Buttons
  const btnFormat = document.getElementById('btnFormat');
  const btnMinify = document.getElementById('btnMinify');
  const btnValidate = document.getElementById('btnValidate');
  const btnTreeView = document.getElementById('btnTreeView');
  const btnSample = document.getElementById('btnSample');
  const btnClear = document.getElementById('btnClear');
  const btnCopy = document.getElementById('btnCopy');
  const btnDownload = document.getElementById('btnDownload');
  const themeToggle = document.getElementById('themeToggle');

  let isTreeView = false;

  // --- Utilities ---

  function getIndent() {
    const val = indentSelect.value;
    return val === 'tab' ? '\t' : Number(val);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setStatus(msg, type) {
    statusMessage.textContent = msg;
    statusBar.className = 'status-bar' + (type ? ' ' + type : '');
  }

  function updateCharCount(el, text) {
    el.textContent = text.length.toLocaleString() + ' chars';
  }

  function updateLineNumbers() {
    const lines = input.value.split('\n').length;
    const nums = [];
    for (let i = 1; i <= lines; i++) nums.push(i);
    inputLineNumbers.textContent = nums.join('\n');
  }

  // --- Syntax Highlighting ---

  function syntaxHighlight(json) {
    const escaped = escapeHtml(json);
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
  }

  // --- Core Operations ---

  function formatJSON() {
    const raw = input.value.trim();
    if (!raw) {
      setStatus('Input is empty', 'warning');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, getIndent());
      showCodeOutput(formatted);
      setStatus('Valid JSON - Formatted successfully', 'valid');
    } catch (e) {
      showError(e);
    }
  }

  function minifyJSON() {
    const raw = input.value.trim();
    if (!raw) {
      setStatus('Input is empty', 'warning');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const minified = JSON.stringify(parsed);
      showCodeOutput(minified);
      setStatus('Valid JSON - Minified (' + minified.length.toLocaleString() + ' chars)', 'valid');
    } catch (e) {
      showError(e);
    }
  }

  function validateJSON() {
    const raw = input.value.trim();
    if (!raw) {
      setStatus('Input is empty', 'warning');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, getIndent());
      showCodeOutput(formatted);
      const info = describeJSON(parsed);
      setStatus('Valid JSON - ' + info, 'valid');
    } catch (e) {
      showError(e);
    }
  }

  function describeJSON(obj) {
    if (Array.isArray(obj)) {
      return 'Array with ' + obj.length + ' item' + (obj.length !== 1 ? 's' : '');
    }
    if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj).length;
      return 'Object with ' + keys + ' key' + (keys !== 1 ? 's' : '');
    }
    return typeof obj;
  }

  function showCodeOutput(text) {
    if (isTreeView) toggleTreeView();
    outputCode.innerHTML = syntaxHighlight(text);
    jsonOutput.classList.remove('hidden');
    treeOutput.classList.add('hidden');
    updateCharCount(outputCount, text);
  }

  function showError(e) {
    const msg = e.message;
    outputCode.innerHTML = '<span class="json-boolean">Error: ' + escapeHtml(msg) + '</span>';
    jsonOutput.classList.remove('hidden');
    treeOutput.classList.add('hidden');

    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = input.value.substring(0, pos);
      const line = before.split('\n').length;
      setStatus('Invalid JSON - Error at line ' + line + ': ' + msg, 'invalid');
    } else {
      setStatus('Invalid JSON - ' + msg, 'invalid');
    }
  }

  // --- Tree View ---

  function toggleTreeView() {
    isTreeView = !isTreeView;
    btnTreeView.classList.toggle('primary', isTreeView);

    if (isTreeView) {
      const raw = input.value.trim();
      if (!raw) {
        setStatus('Input is empty', 'warning');
        isTreeView = false;
        btnTreeView.classList.remove('primary');
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        treeOutput.innerHTML = '';
        treeOutput.appendChild(buildTree(parsed, null, true));
        jsonOutput.classList.add('hidden');
        treeOutput.classList.remove('hidden');
        setStatus('Valid JSON - Tree view', 'valid');
      } catch (e) {
        isTreeView = false;
        btnTreeView.classList.remove('primary');
        showError(e);
      }
    } else {
      jsonOutput.classList.remove('hidden');
      treeOutput.classList.add('hidden');
    }
  }

  function buildTree(data, key, isRoot) {
    const container = document.createElement('div');
    if (!isRoot) container.classList.add('tree-node');

    if (data !== null && typeof data === 'object') {
      const isArray = Array.isArray(data);
      const entries = isArray ? data : Object.entries(data);
      const count = isArray ? data.length : Object.keys(data).length;

      const header = document.createElement('div');

      const toggle = document.createElement('span');
      toggle.className = 'tree-toggle';
      toggle.textContent = '\u25BC';
      header.appendChild(toggle);

      if (key !== null) {
        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key';
        keySpan.textContent = '"' + key + '"';
        header.appendChild(keySpan);
        header.appendChild(document.createTextNode(': '));
      }

      const bracket = document.createElement('span');
      bracket.className = 'tree-bracket';
      bracket.textContent = isArray ? '[' : '{';
      header.appendChild(bracket);

      const itemCount = document.createElement('span');
      itemCount.className = 'tree-item-count';
      itemCount.textContent = ' ' + count + ' item' + (count !== 1 ? 's' : '');
      header.appendChild(itemCount);

      container.appendChild(header);

      const children = document.createElement('div');
      children.className = 'tree-children';

      if (isArray) {
        data.forEach((item, i) => {
          children.appendChild(buildTree(item, i, false));
        });
      } else {
        Object.entries(data).forEach(([k, v]) => {
          children.appendChild(buildTree(v, k, false));
        });
      }

      container.appendChild(children);

      const closingBracket = document.createElement('div');
      closingBracket.className = 'tree-bracket';
      closingBracket.textContent = isArray ? ']' : '}';
      closingBracket.style.paddingLeft = '16px';
      container.appendChild(closingBracket);

      toggle.addEventListener('click', () => {
        const collapsed = children.classList.toggle('collapsed');
        toggle.textContent = collapsed ? '\u25B6' : '\u25BC';
        itemCount.style.display = collapsed ? 'inline' : 'inline';
        closingBracket.style.display = collapsed ? 'none' : '';
      });
    } else {
      const line = document.createElement('div');

      if (key !== null) {
        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key';
        keySpan.textContent = typeof key === 'number' ? key : '"' + key + '"';
        line.appendChild(keySpan);
        line.appendChild(document.createTextNode(': '));
      }

      const valSpan = document.createElement('span');
      if (data === null) {
        valSpan.className = 'tree-value-null';
        valSpan.textContent = 'null';
      } else if (typeof data === 'string') {
        valSpan.className = 'tree-value-string';
        valSpan.textContent = '"' + data + '"';
      } else if (typeof data === 'number') {
        valSpan.className = 'tree-value-number';
        valSpan.textContent = data;
      } else if (typeof data === 'boolean') {
        valSpan.className = 'tree-value-boolean';
        valSpan.textContent = data;
      }
      line.appendChild(valSpan);
      container.appendChild(line);
    }

    return container;
  }

  // --- Resizable Divider ---

  const divider = document.getElementById('divider');
  let isDragging = false;

  divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    divider.classList.add('active');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const container = document.querySelector('.split-pane');
    const rect = container.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(Math.max(pct, 20), 80);
    const inputPane = container.querySelector('.input-pane');
    const outputPane = container.querySelector('.output-pane');
    inputPane.style.flex = 'none';
    inputPane.style.width = clamped + '%';
    outputPane.style.flex = '1';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    divider.classList.remove('active');
  });

  // --- Theme ---

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jsonlens-theme', theme);
    themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '\u263E' : '\u2600';
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  const savedTheme = localStorage.getItem('jsonlens-theme');
  if (savedTheme) setTheme(savedTheme);

  // --- Sample Data ---

  const sampleJSON = {
    "name": "JSONLens",
    "version": "1.0.0",
    "description": "A powerful JSON formatting and validation tool",
    "features": ["Format", "Validate", "Minify", "Tree View", "Syntax Highlighting"],
    "settings": {
      "theme": "dark",
      "indent": 2,
      "autoValidate": true
    },
    "stats": {
      "users": 15000,
      "rating": 4.8,
      "isPremium": false,
      "lastUpdate": null
    },
    "tags": [
      {"id": 1, "name": "json"},
      {"id": 2, "name": "formatter"},
      {"id": 3, "name": "developer-tools"}
    ]
  };

  // --- Copy & Download ---

  function getOutputText() {
    if (isTreeView) return input.value;
    return outputCode.textContent || '';
  }

  function copyOutput() {
    const text = getOutputText();
    if (!text) {
      setStatus('Nothing to copy', 'warning');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setStatus('Copied to clipboard!', 'valid');
      setTimeout(() => setStatus(''), 2000);
    });
  }

  function downloadOutput() {
    const text = getOutputText();
    if (!text) {
      setStatus('Nothing to download', 'warning');
      return;
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jsonlens-output.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Downloaded!', 'valid');
  }

  // --- Event Listeners ---

  btnFormat.addEventListener('click', formatJSON);
  btnMinify.addEventListener('click', minifyJSON);
  btnValidate.addEventListener('click', validateJSON);
  btnTreeView.addEventListener('click', toggleTreeView);

  btnSample.addEventListener('click', () => {
    input.value = JSON.stringify(sampleJSON, null, 2);
    updateLineNumbers();
    updateCharCount(inputCount, input.value);
    formatJSON();
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    outputCode.innerHTML = '';
    treeOutput.innerHTML = '';
    if (isTreeView) {
      isTreeView = false;
      btnTreeView.classList.remove('primary');
      jsonOutput.classList.remove('hidden');
      treeOutput.classList.add('hidden');
    }
    updateLineNumbers();
    updateCharCount(inputCount, '');
    updateCharCount(outputCount, '');
    setStatus('Paste or type JSON in the input panel');
  });

  btnCopy.addEventListener('click', copyOutput);
  btnDownload.addEventListener('click', downloadOutput);

  input.addEventListener('input', () => {
    updateLineNumbers();
    updateCharCount(inputCount, input.value);
  });

  input.addEventListener('scroll', () => {
    inputLineNumbers.scrollTop = input.scrollTop;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const indent = indentSelect.value === 'tab' ? '\t' : ' '.repeat(Number(indentSelect.value));
      input.value = input.value.substring(0, start) + indent + input.value.substring(end);
      input.selectionStart = input.selectionEnd = start + indent.length;
      updateLineNumbers();
    }
  });

  // Auto-format on Ctrl/Cmd+Enter
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      formatJSON();
    }
  });

  // Init
  updateLineNumbers();
})();
