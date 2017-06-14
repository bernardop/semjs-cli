#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const request = require("request-promise");
const ora = require("ora");
const imgcat = require("imgcat");

const config = require("./config.js");

if (config.errorCode) {
    console.log(chalk.red("No .unsprayrc file found in your home directory"));
    console.log(
        chalk.red(
            "Please refer to https://github.com/bernardop/unspray#configuration"
        )
    );
    process.exit(1);
}

program
    .option("-q, --query <query>", "Search query")
    .option("-p, --page [page]", "Page number")
    .option(
        "-r, --results-per-page [resultsPerPage]",
        "Number of results per page",
        parseInt,
        10
    )
    .parse(process.argv);

const options = {
    uri: config.searchUrl,
    qs: {
        client_id: config.applicationID,
        query: program.query,
        page: program.page ? program.page : "1",
        per_page: program.resultsPerPage
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
            const resultsLowRange =
                (parseInt(program.page || "1") - 1) * program.resultsPerPage +
                1;
            spinner.succeed(
                `Done! Showing results ${resultsLowRange}-${resultsLowRange +
                    program.resultsPerPage -
                    1} out of ${data.total}`
            );
            console.log();
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
