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
                let photo = {
                    id: result.id,
                    url: result.links.html,
                    authorName: result.user.name,
                    authorUrl: result.user.links.html
                };

                return new Promise(resolve => {
                    imgcat(result.urls.thumb)
                        .then(thumbnail => {
                            photo.img = thumbnail;
                            resolve(photo);
                        })
                        .catch(e => {
                            resolve(photo);
                        });
                });
            })
        ).then(images => {
            const resultsLowerRange =
                (parseInt(program.page || "1") - 1) * program.resultsPerPage +
                1;
            const resultsUpperRange = Math.min(
                resultsLowerRange + program.resultsPerPage - 1,
                data.total
            );
            spinner.succeed(
                `Done! Showing results ${resultsLowerRange}-${resultsUpperRange} out of ${data.total}`
            );
            console.log();
            console.log();
            images.forEach(image => {
                image.img && console.log(image.img);
                console.log(`ID: ${image.id}`);
                console.log(`Photo URL: ${image.url}`);
                console.log(`Author: ${image.authorName}`);
                console.log(`Author Profile: ${image.authorUrl}`);
                console.log();
            });
        });
    })
    .catch(error => {
        spinner.fail("Error!");
        console.log();
        console.log(chalk.red("There was a problem", error));
    });
