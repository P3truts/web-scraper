import { argv } from "node:process";
import { crawlPage, crawlSiteAsync, ExtractedPageData, getHTML } from "./crawl";
import { writeJSONReport } from "./report";


async function main() {
    //console.log(argv.length);
    if (argv.length < 3) {
        throw Error("Invalid argument - base URL is required!");
    } else if (argv.length > 5) {
        throw Error("Invalid argument - only the base URL, max concurrency and max pages are required!");
    }
    const url = argv[2];
    const maxConc = argv[3];
    const maxPages = argv[4];
    if (!isNaN(Number(maxConc)) || !isNaN(Number(maxPages))) {
        console.log("Max Concurrency and Max Pages must be numbers!");
    }
    console.log("Crawler runs on domain: ", url);
    console.log("Max Concurrency is: ", maxConc);
    console.log("Max Pages are: ", maxPages);



    // const html = await getHTML(url);
    //console.log(html);

    //await crawlPage(url);
    const pages = await crawlSiteAsync(url, Number(maxConc), Number(maxPages));

    console.log("Finished crawling.");
    const firstPage = Object.values(pages)[0];
    if (firstPage) {
        console.log(`First page record: ${firstPage["url"]} - ${firstPage["heading"]}`,);
    }
    writeJSONReport(pages, "report.json");
}

main();
