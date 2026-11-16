const filesDir = "./files";
const path = require("path");

jest.mock("fs");
jest.mock("node:fs", () => require("fs"));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function invoke(options, callback, err, data) {
  const done = typeof callback === "function" ? callback : options;
  if (typeof done === "function") done(err, data);
}

function answerWith(contentsByName) {
  return async (filePath, options, callback) => {
    await wait(100);
    const name = path.basename(String(filePath));
    const data = Object.prototype.hasOwnProperty.call(contentsByName, name)
      ? contentsByName[name]
      : "";
    invoke(options, callback, null, data);
  };
}

let fs;
describe("app.js", () => {
  beforeEach(() => {
    fs = require("fs");
    fs.readdir.mockReset();
    fs.readFile.mockReset();
    fs.readdirSync.mockReset();
    fs.readFileSync.mockReset();
    fs.existsSync.mockReset();
    fs.existsSync.mockReturnValue(true);
  });
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should call fs.readdir with correct arguments", () => {
    const readdirSpy = jest.spyOn(fs, "readdir");
    require("../app");
    expect(readdirSpy).toHaveBeenCalledWith(filesDir, expect.any(Function));
  });

  it("should call fs.readFile with correct arguments", async () => {
    const file = "file1.txt";
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, [file]);
    });
    const readFileMock = jest.spyOn(fs, "readFile");
    require("../app");
    const filePath = path.join(filesDir, file);
    await wait(500);
    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(readFileMock).toHaveBeenCalledWith(
      filePath,
      "utf8",
      expect.any(Function)
    );
  });

  it("should call fs.readFile 2 times", async () => {
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["file1.txt", "file2.json"]);
    });
    fs.readFile.mockImplementation(async (filePath, options, callback) => {
      await wait(100);
      invoke(options, callback, null, "");
    });
    const readFileMock = jest.spyOn(fs, "readFile");
    require("../app");
    await wait(500);
    expect(readFileMock).toHaveBeenCalledTimes(2);
  });

  it("should call fs.readFile 3 times", async () => {
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["file1.txt", "file2.txt", "file3.txt"]);
    });
    fs.readFile.mockImplementation(async (filePath, options, callback) => {
      await wait(100);
      invoke(options, callback, null, "");
    });
    const readFileMock = jest.spyOn(fs, "readFile");
    require("../app");
    await wait(500);
    expect(readFileMock).toHaveBeenCalledTimes(3);
  });

  it("should read only .txt, .csv, .json, and .xml files", async () => {
    const files = ["notes.md", "FILE.TXT", "file1.txt", "picture.png"];
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, files);
    });
    fs.readFile.mockImplementation(
      answerWith({
        "notes.md": "999",
        "FILE.TXT": "50",
        "file1.txt": "10",
        "picture.png": "888",
      })
    );
    const readFileMock = jest.spyOn(fs, "readFile");
    const consoleLogMock = jest.spyOn(console, "log");
    require("../app");
    await wait(500);
    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(path.basename(readFileMock.mock.calls[0][0])).toBe("file1.txt");
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith(
      "The sum of the numbers in the files: 10"
    );
  });

  it("should call fs.readFileSync 0 times", async () => {
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["file1.txt", "file2.txt", "file3.txt"]);
    });
    const readFileSyncMock = jest.spyOn(fs, "readFileSync");
    require("../app");
    await wait(500);
    expect(readFileSyncMock).toHaveBeenCalledTimes(0);
  });

  it("should call fs.readdirSync 0 times", () => {
    const readdirSyncMock = jest.spyOn(fs, "readdirSync");
    require("../app");
    expect(readdirSyncMock).toHaveBeenCalledTimes(0);
  });

  it("should call fs.existsSync 0 times", async () => {
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["file1.txt"]);
    });
    fs.readFile.mockImplementation(answerWith({ "file1.txt": "1" }));
    const existsSyncMock = jest.spyOn(fs, "existsSync");
    require("../app");
    await wait(500);
    expect(existsSyncMock).toHaveBeenCalledTimes(0);
  });

  it("should call console.log with sum of numbers when numbers exist in one file", async () => {
    const files = ["file1.txt", "file2.json"];
    const randomNum1 = Math.floor(Math.random() * 100) + 1;
    const randomNum2 = Math.floor(Math.random() * 100) + 1;
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, files);
    });
    fs.readFile.mockImplementation(
      answerWith({
        [files[0]]: `a,hkhl ${randomNum1}, ${randomNum2}, c`,
        [files[1]]: `{"age": "sixteen", "name": "Tom"}`,
      })
    );
    require("../app");
    await wait(500);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith(
      `The sum of the numbers in the files: ${randomNum1 + randomNum2}`
    );
  });

  it("should call console.log with sum of numbers when numbers exist in all files", async () => {
    const files = ["file1.txt", "file2.csv", "file3.json", "file4.xml"];
    const randomNum1 = Math.floor(Math.random() * 100) + 1;
    const randomNum2 = Math.floor(Math.random() * 100) + 1;
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, files);
    });
    fs.readFile.mockImplementation(
      answerWith({
        [files[0]]: `a,hkhl 24, ${randomNum1}, c`,
        [files[1]]: `h, w,76,${randomNum2}`,
        [files[2]]: `{"age": 45, "name": "Tom"}`,
        [files[3]]: `<root><string>hello</string><number>125</number></root>`,
      })
    );
    require("../app");
    await wait(700);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith(
      `The sum of the numbers in the files: ${270 + randomNum1 + randomNum2}`
    );
  });

  it("should treat a number as a maximal sequence of digits", async () => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["report.txt"]);
    });
    fs.readFile.mockImplementation(
      answerWith({
        "report.txt": `id${randomNum} -12 and 1.5 plus 1,234`,
      })
    );
    require("../app");
    await wait(500);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith(
      `The sum of the numbers in the files: ${randomNum + 253}`
    );
  });

  it("should call console.log 'No numbers for calculating' when directory ./files not exist", async () => {
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      const error = new Error("ENOENT");
      error.code = "ENOENT";
      callback(error);
    });
    require("../app");
    await wait(500);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith("No numbers for calculating");
  });

  it("should call console.log 'No numbers for calculating' when no files in ./files exist", async () => {
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, []);
    });
    require("../app");
    await wait(500);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith("No numbers for calculating");
  });

  it("should print the sum when the only number is 0", async () => {
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["file1.txt"]);
    });
    fs.readFile.mockImplementation(answerWith({ "file1.txt": "value 0" }));
    require("../app");
    await wait(500);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith(
      "The sum of the numbers in the files: 0"
    );
  });

  it("should call console.log 'No numbers for calculating' when files contain no numbers", async () => {
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["file1.txt", "file2.json"]);
    });
    fs.readFile.mockImplementation(
      answerWith({
        "file1.txt": "hello world",
        "file2.json": '{"name": "Tom", "age": "sixteen"}',
      })
    );
    require("../app");
    await wait(500);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith("No numbers for calculating");
  });

  it("should call console.log 'No numbers for calculating' when only unsupported files exist", async () => {
    const consoleLogMock = jest.spyOn(console, "log");
    fs.readdir.mockImplementationOnce(async (dir, callback) => {
      await wait(100);
      callback(null, ["notes.md", "FILE.TXT"]);
    });
    fs.readFile.mockImplementation(
      answerWith({
        "notes.md": "999",
        "FILE.TXT": "50",
      })
    );
    const readFileMock = jest.spyOn(fs, "readFile");
    require("../app");
    await wait(500);
    expect(readFileMock).not.toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith("No numbers for calculating");
  });
});
