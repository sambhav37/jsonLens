const XmlUtils = {
  formatXML(raw, indent) {
    const parsed = XmlUtils.parseXML(raw);
    const indentStr = indent === '\t' ? '\t' : ' '.repeat(typeof indent === 'number' ? indent : 2);
    return XmlUtils._serialize(parsed.documentElement, indentStr, 0);
  },

  minifyXML(raw) {
    const parsed = XmlUtils.parseXML(raw);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(parsed).replace(/>\s+</g, '><').trim();
  },

  validateXML(raw) {
    const parsed = XmlUtils.parseXML(raw);
    const root = parsed.documentElement;
    const childElements = Array.from(root.children).length;
    const description = 'Root <' + root.tagName + '> with ' + childElements + ' child element' + (childElements !== 1 ? 's' : '');
    return { valid: true, description: description };
  },

  parseXML(raw) {
    const trimmed = raw.trim();
    if (!trimmed) throw new Error('Input is empty');
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      const msg = parseError.textContent.split('\n')[0] || 'Invalid XML';
      throw new Error(msg);
    }
    return doc;
  },

  syntaxHighlightXML(xml) {
    const escaped = xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      // Processing instructions
      .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="xml-processing">$1</span>')
      // Comments
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>')
      // Closing tags
      .replace(/(&lt;\/)([\w:.-]+)(&gt;)/g, '<span class="xml-bracket">$1</span><span class="xml-tag">$2</span><span class="xml-bracket">$3</span>')
      // Opening tags with attributes
      .replace(/(&lt;)([\w:.-]+)([\s\S]*?)(\/?&gt;)/g, function(_m, open, tag, attrs, close) {
        const styledAttrs = attrs.replace(/([\w:.-]+)(=)(".*?")/g,
          '<span class="xml-attr">$1</span><span class="xml-bracket">$2</span><span class="xml-string">$3</span>'
        );
        return '<span class="xml-bracket">' + open + '</span><span class="xml-tag">' + tag + '</span>' + styledAttrs + '<span class="xml-bracket">' + close + '</span>';
      });
  },

  _serialize(node, indentStr, level) {
    const pad = indentStr.repeat(level);

    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      return text ? pad + text : '';
    }

    if (node.nodeType === 8) {
      return pad + '<!--' + node.textContent + '-->';
    }

    if (node.nodeType === 7) {
      return pad + '<?' + node.target + ' ' + node.data + '?>';
    }

    if (node.nodeType !== 1) return '';

    let result = pad + '<' + node.tagName;

    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      result += ' ' + attr.name + '="' + attr.value + '"';
    }

    const children = Array.from(node.childNodes).filter(function(c) {
      return c.nodeType === 1 || (c.nodeType === 3 && c.textContent.trim()) || c.nodeType === 8;
    });

    if (children.length === 0) {
      return result + '/>';
    }

    if (children.length === 1 && children[0].nodeType === 3) {
      return result + '>' + children[0].textContent.trim() + '</' + node.tagName + '>';
    }

    result += '>';
    for (let i = 0; i < children.length; i++) {
      const child = XmlUtils._serialize(children[i], indentStr, level + 1);
      if (child) result += '\n' + child;
    }
    result += '\n' + pad + '</' + node.tagName + '>';

    return result;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = XmlUtils;
}
