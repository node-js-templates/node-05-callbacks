const fs = require("fs");
const path = require("path");
const filesDir = "./files";

// Read ./files with fs.readdir. Read each .txt, .csv, .json, and .xml file with
// fs.readFile(path.join(filesDir, fileName), "utf8", callback).
