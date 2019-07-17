const fs = require('fs');
const path = require('path');

const crawlDirectory = (rootDir, currentDir, isRecursive) => {
  return fs.promises.readdir(currentDir, {withFileTypes: true}).then(
    dirItems => {
      let files = [];
      let promises = [];

      dirItems.forEach(item => {
        if (item.isFile() || item.isSymbolicLink()) {
          const fullPath = path.join(currentDir, item.name);
          files.push({
            isSymbolicLink: item.isSymbolicLink(),
            fullPath: fullPath,
            relativePath: path.relative(rootDir, fullPath),
            realPath: fs.realpathSync(fullPath),
          });
        } else if (item.isDirectory() && isRecursive) {
          const dirFiles = crawlDirectory(
            rootDir,
            path.join(currentDir, item.name),
            true,
          );
          promises.push(dirFiles);
        }
      });

      return Promise.all(promises).then(values => {
        values.forEach(value => {
          files = files.concat(value);
        });
        return files;
      });
    },
    err => {
      console.error(err);
    },
  );
};

module.exports = crawlDirectory;
