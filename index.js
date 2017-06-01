#!/usr/bin/env node
const figlet = require("figlet");
const chalk = require("chalk");
const program = require("commander");
const pkg = require("./package.json");

figlet("UNSPRAY", (err, data) => {
    console.log(chalk.yellow(data));

    program
        .version(pkg.version)
        .command("search", "Search Unsplash photos")
        .command("save", "Save the Unsplash photo with provided ID")
        .command(
            "set-wallpaper",
            "Set Unsplash photo with provided ID as wallpaper"
        )
        .parse(process.argv);

    if (program.args.length === 0) {
        program.help();
    }
});
