#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const request = require("request-promise");
const ora = require("ora");

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
        spinner.succeed("Search successful");
        console.log();
        data.results.forEach(result => {
            console.log("id: ", result.id);
            console.log("photo:", result.links.html);
            console.log();
        });
    })
    .catch(error => {
        console.log(chalk.red("There was a problem", error));
    });
