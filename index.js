const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            const todos = [];
            files.forEach(file => {
                const lines = file.split('\n');
                lines.forEach(line => {
                    let splited = line.split('// TODO ');
                    if (splited.length > 1) {
                        todos.push(splited.slice(1).join(''));
                    }
                });
            });
            console.log(todos);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
