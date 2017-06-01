#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const request = require("request-promise");
const ora = require("ora");
const imgcat = require("imgcat");

const config = require("./config.js");

program
    .option("-q, --query <query>", "Search query")
    .option(
        "-m, --max-results [max]",
        "Maximum number of results",
        parseInt,
        10
    )
    .parse(process.argv);

const options = {
    uri: config.searchUrl,
    qs: {
        client_id: config.applicationID,
        query: program.query,
        per_page: program.maxResults
    },
    json: true
};

const spinner = ora(`Searching photos of ${program.query}`).start();
request(options)
    .then(data => {
        const lastResultIndex = data.results.length - 1;
        spinner.text = "Fetching photo thumbnails";
        Promise.all(
            data.results.map(result => {
                return new Promise(resolve => {
                    imgcat(result.urls.thumb).then(thumbnail => {
                        resolve({
                            id: result.id,
                            img: thumbnail,
                            url: result.links.html
                        });
                    });
                });
            })
        ).then(images => {
            spinner.succeed("Done!");
            console.log();
            images.forEach(image => {
                console.log(image.img);
                console.log(`ID: ${image.id}`);
                console.log(`Photo URL: ${image.url}`);
                console.log();
            });
        });
    })
    .catch(error => {
        spinner.fail("Error!");
        console.log();
        console.log(chalk.red("There was a problem", error));
    });
