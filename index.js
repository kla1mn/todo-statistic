const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function extractTodos() {
    const todos = [];
    files.forEach(file => {
        const lines = file.split('\n');
        lines.forEach(line => {
            const match = line.match(/\/\/ TODO (.*)/);
            if (match) {
                todos.push(match[1]);
            }
        });
    });
    return todos;
}

function processCommand(command) {
    const todos = extractTodos();
    const args = command.split(' ');

    switch (args[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            console.log(todos);
            break;
        case 'important':
            console.log(todos.filter(todo => todo.includes('!')));
            break;
        case 'user':
            if (args.length < 2) {
                console.log('Please provide a username');
                break;
            }
            const username = args[1].toLowerCase();
            console.log(todos.filter(todo => {
                const match = todo.match(/^([^;]+);/);
                return match && match[1].toLowerCase() === username;
            }));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!