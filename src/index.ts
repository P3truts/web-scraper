import { argv } from "node:process";


function main() {
    console.log(argv.length);
    if (argv.length < 3) {
        throw Error("Invalid argument - base URL is required!");
    } else if (argv.length > 3) {
        throw Error("Invalid argument - only the base URL is required!");
    }
    console.log("Crawler runs on domain: ", argv[2]);
}

main();
