import pLimit from 'p-limit';
import { ExtractedPageData, extractPageData, normalizeURL } from './crawl';


export class ConcurrentCrawler {
    private baseURL: string;
    private pages: Record<string, ExtractedPageData>;
    private limit: any;
    private maxPages: number;
    private shouldStop: boolean;
    private allTasks: Set<Promise<void>>;
    private visited: Set<string>;

    public constructor(baseURL: string, pages: Record<string, ExtractedPageData>,
        maxConcurrency: number, maxPages: number) {
        this.baseURL = baseURL;
        this.pages = pages;
        this.limit = pLimit(maxConcurrency);
        this.maxPages = maxPages;
        this.shouldStop = false;
        this.allTasks = new Set<Promise<void>>;
        this.visited = new Set<string>;
    }

    async crawl(): Promise<Record<string, ExtractedPageData>> {
        await this.crawlPage(this.baseURL);

        return this.pages;
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop || normalizedURL in this.visited) {
            return false;
        } else if (this.visited.size === this.maxPages) {
            console.log('Incrementing concurrently: ', normalizedURL);
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.");
            return false;
        } else {
            this.visited.add(normalizedURL);
            return true;
        }
    }

    private async getHTML(url: string) {
        return await this.limit(async () => {
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
        });
    }

    private async crawlPage(currentURL: string): Promise<void> {
        if (this.shouldStop) {
            console.log("Reached a crawling stop limit.");
            return;
        }

        try {
            const base = new URL(this.baseURL);
            const current = new URL(currentURL);
            if (base.origin !== current.origin) {
                console.log('CurrentURL is on a different domain than BaseURL, returning...');
                return;
            }
        } catch (error) {
            console.log('An error has occurred checking base vs current URLs: ', error);
            return;
        }

        const normalizedCurrentUrl = normalizeURL(currentURL);
        let isNewPage = this.addPageVisit(normalizedCurrentUrl);
        if (!isNewPage) {
            return;
        }

        try {
            console.log('getting html from: ', currentURL);
            const html = await this.getHTML(currentURL);
            console.log(html);
            if (html !== undefined) {
                console.log('getting urls...');
                const data = extractPageData(html, currentURL);
                this.pages[normalizedCurrentUrl] = data;
                // const urls = getURLsFromHTML(html, currentURL);
                // console.log(urls);

                // Promise.all(data.outgoingLinks).then(values => {
                //     for (let value of values) {
                //         // if (this.shouldStop) {
                //         //     console.log("Reached a loop crawling stop limit.");
                //         //     return;
                //         // }
                //         console.log('crawling: ', value);
                //         const crawlTask = this.crawlPage(value);
                //         this.allTasks.add(crawlTask);
                //         crawlTask.finally(() => {
                //             this.allTasks.delete(crawlTask);
                //         });
                //     }
                // }).catch((error) => {
                //     console.log('An error has occured: ', error);
                // });

                const crawlPromises: Promise<void>[] = [];

                for (const nextURL of data.outgoingLinks) {
                    if (this.shouldStop) break;

                    const task = this.crawlPage(nextURL);
                    this.allTasks.add(task);
                    task.finally(() => this.allTasks.delete(task));
                    crawlPromises.push(task);
                }

                await Promise.all(crawlPromises);
            }
        } catch (error) {
            console.log("An error has occurred: ", error);
        }

        return;
    }
}
