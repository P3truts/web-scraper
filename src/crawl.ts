import { URL } from "node:url";
import { JSDOM } from "jsdom";

export function normalizeURL(UrlString: string): string {
    const url = new URL(UrlString);
    if (url.pathname.endsWith("/")) {
        url.pathname = url.pathname.slice(0, -1);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw Error("Invalid protocol! Only accepts 'http' or 'https'!");
    }
    return url.host + url.pathname;
}

export function getHeadingFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const firstHeadings = dom.window.document.querySelectorAll('h1');
    let text = "";
    if (firstHeadings.length > 0) {
        firstHeadings.forEach(h => text += h.textContent + ", ");
        return text.slice(0, -2);
    } else {
        const secondHeadings = dom.window.document.querySelectorAll('h2');
        secondHeadings.forEach(h => text += h.textContent + ", ");
        return text.slice(0, -2);
    }
}

export function getFirstParagraphFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const mainDoc = dom.window.document.querySelector('main');
    const firstParOutsideMain = dom.window.document.querySelector('p');
    const fallbackRes = firstParOutsideMain?.textContent !== undefined ?
        firstParOutsideMain.textContent : "";
    if (mainDoc !== null) {
        const firstParagraph = mainDoc.querySelector('p');
        return firstParagraph?.textContent !== undefined ? firstParagraph?.textContent :
            fallbackRes;
    }

    return fallbackRes;
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const allAnchors = dom.window.document.querySelectorAll('a');
    let result: string[] = [];
    if (allAnchors.length > 0) {
        let anchorLinks: any[] = [];
        allAnchors.forEach(a => anchorLinks.push(a.getAttribute('href')?.valueOf()));
        anchorLinks.forEach(al => result.push(new URL(al, baseURL).href));
    }

    return result;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const allImages = dom.window.document.querySelectorAll('img');
    let result: string[] = [];
    if (allImages.length > 0) {
        let imageLinks: any[] = [];
        allImages.forEach(a => imageLinks.push(a.getAttribute('src')?.valueOf()));
        imageLinks.forEach(al => result.push(new URL(al, baseURL).href));
    }

    return result;
}

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
    const pageData = {} as ExtractedPageData;
    pageData.url = pageURL;
    pageData.heading = getHeadingFromHTML(html);
    pageData.firstParagraph = getFirstParagraphFromHTML(html);
    pageData.outgoingLinks = getURLsFromHTML(html, pageURL);
    pageData.imageURLs = getImagesFromHTML(html, pageURL);

    return pageData;
}

// interfaces
interface ExtractedPageData {
    url: string,
    heading: string,
    firstParagraph: string,
    outgoingLinks: string[],
    imageURLs: string[]
}
