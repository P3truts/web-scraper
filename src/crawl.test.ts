import { expect, test } from 'vitest'
import { normalizeURL } from './crawl.js'

test('normalizes URL strings', () => {
  expect(normalizeURL("https://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
  expect(normalizeURL("https://www.boot.dev/blog/path")).toBe("www.boot.dev/blog/path");
  expect(normalizeURL("http://www.boot.dev/blog/path/")).toBe("www.boot.dev/blog/path");
  expect(normalizeURL("http://www.boot.dev/blog/path")).toBe("www.boot.dev/blog/path");
})

test('fail to normalize invalid URL string', () => {
  expect(() => normalizeURL("5")).toThrow("Invalid URL");
})

test('fail to normalize missing protocol in URL string', () => {
  expect(() => normalizeURL("www.abc.com")).toThrow("Invalid URL");
})

test('fail to normalize bad http protocol URL string', () => {
  expect(() => normalizeURL("hutop://www.abc.com")).toThrow("Invalid protocol! Only accepts 'http' or 'https'!");
})

test('fail to normalize bad http connector URL string', () => {
  expect(() => normalizeURL("http:/|www.abc.com")).toThrow("Invalid URL");
})

