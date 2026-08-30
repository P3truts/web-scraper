import { URL } from "node:url";

export function normalizeURL(UrlString: string) {
    const url = new URL(UrlString);
    //console.log(url);
    if (url.pathname.endsWith("/")) {
        url.pathname = url.pathname.slice(0, url.pathname.length - 1);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw Error("Invalid protocol! Only accepts 'http' or 'https'!");
    }
    //console.log(url.pathname);
    return url.host + url.pathname;
}
