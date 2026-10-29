import path from "path/posix";
import { ExtractedPageData } from "./crawl";
import fs from "node:fs";


export function writeJSONReport(pageData: Record<string, ExtractedPageData>,
    filename = "report.json"): void {
    const sorted = Object.values(pageData).sort((a, b) => a.url.localeCompare(b.url));
    const serializedData = JSON.stringify(sorted, null, 2);
    const filepath = path.resolve(process.cwd(), filename);
    console.log("Filepath: ", filepath);

    fs.writeFileSync(filepath, serializedData);
}
