import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

// Set up browser globals that xml-utils.js needs
const dom = new JSDOM('', { contentType: 'text/html' });
globalThis.DOMParser = dom.window.DOMParser;
globalThis.XMLSerializer = dom.window.XMLSerializer;

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XmlUtils = require('../public/js/xml-utils.js');

const sampleXML = '<root><name>test</name><items><item id="1">a</item><item id="2">b</item></items></root>';

describe('formatXML', () => {
  it('formats with 2-space indent', () => {
    const result = XmlUtils.formatXML(sampleXML, 2);
    expect(result).toContain('  <name>test</name>');
    expect(result).toContain('    <item');
  });

  it('formats with tab indent', () => {
    const result = XmlUtils.formatXML(sampleXML, '\t');
    expect(result).toContain('\t<name>test</name>');
  });

  it('throws on invalid XML', () => {
    expect(() => XmlUtils.formatXML('<unclosed>')).toThrow();
  });

  it('throws on empty input', () => {
    expect(() => XmlUtils.formatXML('')).toThrow('Input is empty');
  });
});

describe('minifyXML', () => {
  it('removes whitespace between tags', () => {
    const spaced = '<root>\n  <name>test</name>\n  <value>123</value>\n</root>';
    const result = XmlUtils.minifyXML(spaced);
    expect(result).not.toContain('\n');
    expect(result).toContain('<root><name>test</name>');
  });

  it('throws on invalid XML', () => {
    expect(() => XmlUtils.minifyXML('not xml')).toThrow();
  });
});

describe('validateXML', () => {
  it('returns valid result for valid XML', () => {
    const result = XmlUtils.validateXML(sampleXML);
    expect(result.valid).toBe(true);
    expect(result.description).toContain('Root <root>');
    expect(result.description).toContain('child element');
  });

  it('throws on invalid XML', () => {
    expect(() => XmlUtils.validateXML('<bad><unclosed>')).toThrow();
  });
});

describe('parseXML', () => {
  it('parses valid XML', () => {
    const doc = XmlUtils.parseXML('<root><child/></root>');
    expect(doc.documentElement.tagName).toBe('root');
  });

  it('throws on empty input', () => {
    expect(() => XmlUtils.parseXML('')).toThrow('Input is empty');
  });

  it('throws on whitespace-only input', () => {
    expect(() => XmlUtils.parseXML('   ')).toThrow('Input is empty');
  });
});

describe('syntaxHighlightXML', () => {
  it('wraps tags with xml-tag class', () => {
    const result = XmlUtils.syntaxHighlightXML('<root>text</root>');
    expect(result).toContain('xml-tag');
  });

  it('wraps attributes with xml-attr class', () => {
    const result = XmlUtils.syntaxHighlightXML('<item id="1"/>');
    expect(result).toContain('xml-attr');
  });

  it('wraps attribute values with xml-string class', () => {
    const result = XmlUtils.syntaxHighlightXML('<item id="1"/>');
    expect(result).toContain('xml-string');
  });
});
