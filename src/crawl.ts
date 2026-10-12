import { URL } from "node:url";
import { JSDOM } from "jsdom";
import { ConcurrentCrawler } from "./concrawl";


export async function crawlSiteAsync(baseURL: string, maxConcurrency: number): Promise<Record<string, number>> {
    let pages: Record<string, number> = {};
    const concurrentCrawler = new ConcurrentCrawler(baseURL, pages, maxConcurrency);

    return await concurrentCrawler.crawl();
}

export async function crawlPage(baseURL: string, currentURL: string = baseURL,
    pages: Record<string, number> = {}) {
    try {
        const base = new URL(baseURL);
        const current = new URL(currentURL);
        if (base.origin !== current.origin) {
            console.log('CurrentURL is on a different domain than BaseURL, returning...');
            return pages;
        }
    } catch (error) {
        console.log('An error has occurred checking base vs current URLs: ', error);
        return pages;
    }

    const normalizedCurrentUrl = normalizeURL(currentURL);
    if (normalizedCurrentUrl in pages) {
        console.log('Incrementing: ', normalizedCurrentUrl);
        pages[normalizedCurrentUrl] += 1;
        console.log('value: ', pages[normalizedCurrentUrl]);
        return pages;
    } else {
        pages[normalizedCurrentUrl] = 1;
    }

    try {
        console.log('getting html from: ', currentURL);
        const html = await getHTML(currentURL);
        console.log(html);
        if (html !== undefined) {
            console.log('getting urls...');
            const urls = getURLsFromHTML(html, currentURL);
            console.log(urls);
            for (let url of urls) {
                console.log('crawling: ', url);
                await crawlPage(baseURL, url, pages);
            }
        }
    } catch (error) {
        console.log("An error has occurred: ", error);
    }

    return pages;
}

export async function getHTML(url: string) {
    try {
        const headers = { "User-Agent": "WebCrawler/1.0" };
        const resp = await fetch(url, { headers: headers });
        if (!resp.ok) {
            throw new Error(`Response status: ${resp.status}`);
        } else if (!resp.headers.get("Content-Type")?.includes("text/html")) {
            throw new Error("Domain content type not 'text/html'!");
        }

        return resp.text();
    } catch (error) {
        console.log(error);
    }
}

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
