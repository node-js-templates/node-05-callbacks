# Node.js Practical

## Asynchronous programming in Node.js: code with callbacks

### Task

Write a program that reads the [`./files`](./files/) directory with `fs.readdir`. File names can vary. Read every file whose extension is exactly `.txt`, `.csv`, `.json`, or `.xml`, and skip every other file. Read file contents with the callback form `fs.readFile(filePath, "utf8", callback)`.

Build `filePath` with `path.join(filesDir, fileName)`, where `filesDir` is `"./files"`. The second argument has to be the string `"utf8"`. Call `fs.readdir(filesDir, callback)` and `fs.readFile(filePath, "utf8", callback)`. `require("fs")` and `require("node:fs")` both use the same module. Do not use `fs/promises`.

Treat every accepted file as plain text. Do not parse CSV, JSON, or XML. A number is a maximal sequence of digits. The characters around it are not part of the number:

- `id99` contributes `99`
- `-12` contributes `12`
- `1.5` contributes `1` and `5`
- `1,234` contributes `1` and `234`

Sum every such number from every accepted file and print exactly one line:

`The sum of the numbers in the files: <sum>`

If the only number is `0`, print `The sum of the numbers in the files: 0`. Print exactly `No numbers for calculating` when the directory is missing, the directory has no accepted files, or the accepted files contain no numbers.

### Example

The sample `./files` directory contains:

```
file1.txt:
foo
bar
123
456
id99
baz

file2.csv:
hello,world,789,321

file3.json:
{
  "name": "John",
  "age": 30,
  "city": "New York"
}

file4.xml:
<root>
  <string>hello</string>
  <number>123</number>
  <string>world</string>
  <number>456</number>
  <string>foo</string>
</root>
```

`123 + 456 + 99 + 789 + 321 + 30 + 123 + 456 = 2397`, so the program prints:

`The sum of the numbers in the files: 2397`

### Note

Print results and the empty-result message with `console.log()` only, once. Remove any other `console.log()` calls.

Do not use synchronous `fs` methods. That includes `readFileSync`, `readdirSync`, and `existsSync`.

`npm test` replaces `fs` and does not read the sample directory. The files in `./files` are only for `npm start`. The tests supply their own file lists and contents, including numbers in the middle of a line, and they reject a hardcoded sample sum.

### How to run and test

`npm start` runs `app.js`. `node app.js` does the same.

Install dependencies with `npm install`, then run `npm test` locally before the GitHub autograding. Do not modify anything in the [tests](./tests/) directory.
