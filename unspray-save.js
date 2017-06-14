#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const request = require("request");
const requestPromise = require("request-promise");
const path = require("path");
const fs = require("fs");
const ora = require("ora");

const config = require("./config.js");

function parsePath(val) {
    return path.join(config.homeDir, val);
}

function download(uri, filename, callback) {
    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
}

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
    .option("-i, --photo-id [photo-id]", "Photo ID")
    .option(
        "-d, --directory [directory]",
        "Directory where photo will be saved",
        parsePath,
        path.join(config.homeDir, "Desktop")
    )
    .option(
        "-Q, --quality [quality]",
        "Photo quality",
        /^(thumb|small|regular|full)$/i,
        "regular"
    )
    .parse(process.argv);

const options = {
    uri: program.photoId
        ? `${config.photoUrl}/${program.photoId}`
        : config.randomUrl,
    qs: {
        client_id: config.applicationID
    },
    json: true
};

const spinner = ora("Getting photo url").start();
requestPromise(options)
    .then(data => {
        spinner.text = "Downloading photo";
        download(
            data.urls[program.quality],
            path.join(program.directory, `${data.id}.jpg`),
            () => {
                spinner.succeed(
                    `Photo successfully saved in ${path.join(
                        program.directory,
                        `${data.id}.jpg`
                    )}`
                );
                console.log();
                console.log(`ID: ${data.id}`);
                console.log(`Photo URL: ${data.links.html}`);
                console.log(`Author: ${data.user.name}`);
                console.log(`Author Profile: ${data.user.links.html}`);
            }
        );
    })
    .catch(error => {
        spinner.fail("Error!");
        console.log();
        console.log(chalk.red("There was a problem", error));
    });
