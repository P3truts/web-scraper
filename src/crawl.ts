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
