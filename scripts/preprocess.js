// read in the file from ../src/raw_data/_.csv
// do preprocessing stuff
// write out file to ../src/data/_.csv
//
// fs = require("fs")
// const contents = fs.readSync("path")
// or
// d3.csv("path")
//
const d3 = require("d3");
const d3array = require("d3-array");
const fs = require("fs");

const modeNames = {
  Person: "In Person",
  Hybrid: "Hybrid",
  Online: "Online",
};
const preprocess = (data) => {
  data.map((d) => (d.mode = modeNames[d.mode]));
  fs.writeFile(
    "./src/data/undergrad_sections.csv",
    d3.csvFormat(data),
    () => {}
  );
};

preprocess(
  d3.csvParse(
    fs.readFileSync("./src/raw_data/undergrad_sections.csv", {
      encoding: "utf-8",
    })
  )
);
