#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const request = require("request");
const requestPromise = require("request-promise");
const path = require("path");
const fs = require("fs");
const wallpaper = require("wallpaper");
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
        chalk.red("https://github.com/bernardop/unspray#configuration")
    );
    process.exit(1);
}

program
    .option("-i, --photo-id [photo-id]", "Photo ID")
    .option(
        "-d, --directory [directory]",
        "Directory where wallpaper will be saved",
        parsePath,
        path.join(config.homeDir, "Desktop")
    )
    .option(
        "-Q, --quality [quality]",
        "Photo quality",
        /^(thumb|small|regular|full)$/i,
        "regular"
    )
    .option(
        "-s, --scale [scale]",
        "Scale when setting wallpaper",
        /^(fill|fit|stretch|center)$/i,
        "fill"
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
            function() {
                spinner.text = "Setting photo as wallpaper";
                wallpaper
                    .set(path.join(program.directory, `${data.id}.jpg`))
                    .then(() => {
                        spinner.succeed("Wallpaper set successfully!");
                    });
            }
        );
    })
    .catch(error => {
        spinner.fail("Error!");
        console.log();
        console.log(chalk.red("There was a problem", error));
    });
