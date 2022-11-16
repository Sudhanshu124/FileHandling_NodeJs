import fs from "fs";
import path from "path";
/**
 * gets emails in a file along with line number
 * */
async function getFileExtData(filePath: string, fileName: string) {
  let lines = 0;
  let emails = [];
  return new Promise((resolve, reject) => {
    try {
      //Open file
      const file = fs.createReadStream(filePath);
      //Initialise line reader
      var lineReader = require("readline").createInterface({
        input: file,
      });
      lineReader.on("line", function (line: string) {
        const words = line.split(" ");
        words.forEach((word: string) => {
          const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
            word
          );
          if (isEmail)
            emails.push({
              line: lines,
              email: word,
              fileName: fileName,
            });
        });

        lines++;
      });

      lineReader.on("close", () => {
        file.close();
        resolve(emails);
      });

      lineReader.on("error", (err: Error) => {
        file.close();
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function getFilesInDirectory(directory: string): Promise<string[]> {
  let files = [];

  return new Promise((resolve, reject) => {
    fs.readdir(directory, async function (err: Error, allFiles: string[]) {
      if (err) reject(err);
      allFiles.forEach(async function (file) {
        files.push(file);
      });
      resolve(files);
    });
  });
}

(async () => {
  try {
    let result: Record<string, any[]> = {};
    //Get directory path
    const directoryPath = path.join(__dirname, "locations/");
    //Get files list in directory
    const files = await getFilesInDirectory(directoryPath);
    while (files.length) {
      //for batch processing
      const batchArr = files.splice(0, 10);
      const res = await Promise.all(
        batchArr.map((file) => getFileExtData(directoryPath + file, file))
      );
      batchArr.forEach(
        (filename, index) => (result[filename] = res[index] as any)
      );
    }
    console.log(result);
  } catch (err) {
    console.error(err);
  }
})();
