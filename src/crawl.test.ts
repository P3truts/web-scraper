import { expect, test } from 'vitest'
import { extractPageData, getFirstParagraphFromHTML, getHeadingFromHTML, getImagesFromHTML, getURLsFromHTML, normalizeURL } from './crawl.js'


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

// link
test("getURLsFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <a href="/path/one">
        <span>Boot.dev</span>
      </a>
    </body>
  </html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});

test("get multiple URLsFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <a href="/path/one">
        <span>Boot.dev</span>
      </a>
      <a href="/path/two">
        <span>www.boot.dev</span>
      </a>
    </body>
  </html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one",
    "https://crawler-test.com/path/two"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
  <body>
    <a href="https://crawler-test.com/path/one">Go to Boot.dev</a>
  </body>
</html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});

test("get multiple URLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
  <body>
    <a href="https://crawler-test.com/path/one">
      <span>Boot.dev</span>
    </a>
    <a href="https://crawler-test.com/path/two">
      <span>Boot.dev</span>
    </a>
  </body>
</html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one", "https://crawler-test.com/path/two"];

  expect(actual).toEqual(expected);
});

test("get mix URLsFromHTML absolute and relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
  <body>
    <a href="https://crawler-test.com/path/one">Go to Boot.dev</a>
    <a href="/path/two">Go to Boot.dev</a>
  </body>
</html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one", "https://crawler-test.com/path/two"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML base", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
  <body>
    <a href="https://crawler-test.com">Go to Boot.dev</a>
  </body>
</html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/"];

  expect(actual).toEqual(expected);
});

test("get multiple URLsFromHTML base", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
  <body>
    <a href="https://crawler-test.com">Go to Boot.dev</a>
    <a href="https://crawler-test2.com">Go to Boot.dev</a>
  </body>
</html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/", "https://crawler-test2.com/"];

  expect(actual).toEqual(expected);
});

// image
test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <img src="/logo.png" alt="Logo">
    </body>
  </html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];

  expect(actual).toEqual(expected);
});

test("get multiple ImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <img src="/logo.png" alt="Logo">
      <img src="/logo2.png" alt="Logo">
    </body>
  </html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png", "https://crawler-test.com/logo2.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <img src="https://crawler-test.com/logo.png" alt="Logo">
    </body>
  </html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];

  expect(actual).toEqual(expected);
});

test("get multiple ImagesFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <img src="https://crawler-test.com/logo.png" alt="Logo">
      <img src="https://crawler-test.com/logo2.png" alt="Logo">
    </body>
  </html>
  `;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png", "https://crawler-test.com/logo2.png"];

  expect(actual).toEqual(expected);
});

test("get mix ImagesFromHTML absolute and relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <img src="https://crawler-test.com/logo.png" alt="Logo">
      <img src="/logo2.png" alt="Logo">
    </body>
  </html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png", "https://crawler-test.com/logo2.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML base", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <img src="https://crawler-test.com/" alt="Logo">
    </body>
  </html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/"];

  expect(actual).toEqual(expected);
});

test("get multiple ImagesFromHTML base", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html>
    <body>
      <img src="https://crawler-test.com/" alt="Logo">
      <img src="https://crawler-test2.com/" alt="Logo">
    </body>
  </html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/", "https://crawler-test2.com/"];

  expect(actual).toEqual(expected);
});

// page data
test('extractPageData basic', () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    firstParagraph: "This is the first paragraph.",
    outgoingLinks: ["https://crawler-test.com/link1"],
    imageURLs: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData multiple", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <h1>Test Title</h1>
      <main>
        <p>This is the first paragraph.</p>
      </main>
      <p>This is the second paragraph.</p>
      <a href="/link1">Link 1</a>
      <a href="/link2">Link 2</a>
      <img src="/image1.jpg" alt="Image 1">
      <img src="/image2.jpg" alt="Image 2">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title, Test Title",
    firstParagraph: "This is the first paragraph.",
    outgoingLinks: ["https://crawler-test.com/link1", "https://crawler-test.com/link2"],
    imageURLs: ["https://crawler-test.com/image1.jpg", "https://crawler-test.com/image2.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData missing", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html>
      <body>
      </body>
    </html>`;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "",
    firstParagraph: "",
    outgoingLinks: [],
    imageURLs: [],
  };

  expect(actual).toEqual(expected);
});

