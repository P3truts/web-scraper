import { argv } from "node:process";
import { getHTML } from "./crawl";


async function main() {
    console.log(argv.length);
    if (argv.length < 3) {
        throw Error("Invalid argument - base URL is required!");
    } else if (argv.length > 3) {
        throw Error("Invalid argument - only the base URL is required!");
    }
    const url = argv[2];
    console.log("Crawler runs on domain: ", url);

    const html = await getHTML(url);
    console.log(html);
}

main();
