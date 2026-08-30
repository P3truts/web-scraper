import { expect, test } from 'vitest'
import { getFirstParagraphFromHTML, getHeadingFromHTML, normalizeURL } from './crawl.js'


// normalize
test('normalizes https URL string with / at the end of path', () => {
  const URLstring = "https://www.boot.dev/blog/path/";
  const res = "www.boot.dev/blog/path";
  expect(normalizeURL(URLstring)).toBe(res);
})

test('normalizes https URL string without / at end of path', () => {
  const URLstring = "https://www.boot.dev/blog/path";
  const res = "www.boot.dev/blog/path";
  expect(normalizeURL(URLstring)).toBe(res);
})

test('normalizes http URL string with / at end of path', () => {
  const URLstring = "http://www.boot.dev/blog/path/";
  const res = "www.boot.dev/blog/path";
  expect(normalizeURL(URLstring)).toBe(res);
})

test('normalizes http URL string without / at end of path', () => {
  const URLstring = "http://www.boot.dev/blog/path";
  const res = "www.boot.dev/blog/path";
  expect(normalizeURL(URLstring)).toBe(res);
})

test('fail to normalize invalid URL string', () => {
  const URLstring = "5";
  const res = "Invalid URL";
  expect(() => normalizeURL(URLstring)).toThrow(res);
})

test('fail to normalize missing protocol in URL string', () => {
  const URLstring = "www.abc.com";
  const res = "Invalid URL";
  expect(() => normalizeURL(URLstring)).toThrow(res);
})

test('fail to normalize bad http protocol URL string', () => {
  const URLstring = "hutop://www.abc.com";
  const res = "Invalid protocol! Only accepts 'http' or 'https'!";
  expect(() => normalizeURL(URLstring)).toThrow(res);
})

test('fail to normalize bad http connector URL string', () => {
  const URLstring = "http:/|www.abc.com";
  const res = "Invalid URL";
  expect(() => normalizeURL(URLstring)).toThrow(res);
})

// heading
test('gets h1 heading from HTML', () => {
  let HTML = `<html>
    <body>
      <h1>Welcome to Boot.dev</h1>
      <main>
        <p>Learn to code by building real projects.</p>
        <p>This is the second paragraph.</p>
      </main>
    </body>
  </html>`;
  let res = "Welcome to Boot.dev";
  expect(getHeadingFromHTML(HTML)).toBe(res);
})

test('gets h2 heading when h1 is missing from HTML', () => {
  let HTML = `<html>
    <body>
      <h2>Welcome to Boot.dev</h2>
      <main>
        <p>Learn to code by building real projects.</p>
        <p>This is the second paragraph.</p>
      </main>
    </body>
  </html>`;
  let res = "Welcome to Boot.dev";
  expect(getHeadingFromHTML(HTML)).toBe(res);
})

test('gets multiple h1 headings from HTML', () => {
  let HTML = `<html>
    <body>
      <h1>Welcome to Boot.dev</h1>
      <h1>Welcome again</h1>
      <main>
        <p>Learn to code by building real projects.</p>
        <p>This is the second paragraph.</p>
      </main>
    </body>
  </html>`;
  let res = "Welcome to Boot.dev, Welcome again";
  expect(getHeadingFromHTML(HTML)).toBe(res);
})

test('gets multiple h2 headings from HTML', () => {
  let HTML = `<html>
    <body>
      <h2>Welcome to Boot.dev</h2>
      <h2>Welcome again</h2>
      <main>
        <p>Learn to code by building real projects.</p>
        <p>This is the second paragraph.</p>
      </main>
    </body>
  </html>`;
  let res = "Welcome to Boot.dev, Welcome again";
  expect(getHeadingFromHTML(HTML)).toBe(res);
})

test('returns empty when headings are missing from HTML', () => {
  let HTML = `<html>
    <body>
      <main>
        <p>Learn to code by building real projects.</p>
        <p>This is the second paragraph.</p>
      </main>
    </body>
  </html>`;
  let res = "";
  expect(getHeadingFromHTML(HTML)).toBe(res);
})

// paragraph
test('gets paragraph from main HTML', () => {
  let HTML = `<html>
    <body>
      <h1>Welcome to Boot.dev</h1>
      <main>
        <p>Learn to code by building real projects.</p>
        <p>This is the second paragraph.</p>
      </main>
    </body>
  </html>`;
  let res = "Learn to code by building real projects.";
  expect(getFirstParagraphFromHTML(HTML)).toBe(res);
})

test('gets paragraph when main is missing from HTML', () => {
  let HTML = `<html>
    <body>
      <h2>Welcome to Boot.dev</h2>
        <p>Learn to code by building real projects.</p>
    </body>
  </html>`;
  let res = "Learn to code by building real projects.";
  expect(getFirstParagraphFromHTML(HTML)).toBe(res);
})

test('gets paragraph when main is empty from HTML', () => {
  let HTML = `<html>
    <body>
      <h2>Welcome to Boot.dev</h2>
      <main>
      </main>
        <p>Learn to code by building real projects.</p>
    </body>
  </html>`;
  let res = "Learn to code by building real projects.";
  expect(getFirstParagraphFromHTML(HTML)).toBe(res);
})

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  const actual = getFirstParagraphFromHTML(inputBody);
  const expected = "Main paragraph.";
  expect(actual).toEqual(expected);
});

test('returns empty when paragraphs are missing from HTML', () => {
  let HTML = `<html>
    <body>
      <main>
      </main>
    </body>
  </html>`;
  let res = "";
  expect(getFirstParagraphFromHTML(HTML)).toBe(res);
})

