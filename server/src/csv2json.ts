import csvtojson from 'csvtojson';
import { writeFile } from 'fs';

const csvFilePath = process.argv[2];
console.log(`Attempt to convert file: ${csvFilePath}`);

csvtojson()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    writeFile('../data.json', JSON.stringify(jsonObj, null, 2), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
