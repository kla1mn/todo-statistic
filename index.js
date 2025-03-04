const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

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

function processCommand(command, isPrint = true) {
    const todos = extractTodos();
    const args = command.split(' ');

    switch (args[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            if (isPrint) console.log(todos);
            return todos;
        case 'important':
            let important = todos.filter(todo => todo.includes('!'));
            if (isPrint) console.log(important);
            return important;
        case 'user':
            const groups = {};
            const withoutUser = [];
            todos.forEach(todo => {
                const parts = todo.split(';');
                if (parts.length > 1) {
                    const user = parts[0].trim();
                    if (user) {
                        if (!groups[user]) groups[user] = [];
                        groups[user].push(todo);
                    } else {
                        withoutUser.push(todo);
                    }
                } else {
                    withoutUser.push(todo);
                }
            });
            const users = Object.keys(groups);
            users.forEach(user => {
                console.log(user + ':');
                groups[user].forEach(item => console.log('  ' + item));
            });
            if (withoutUser.length) {
                console.log('No user:');
                withoutUser.forEach(item => console.log('  ' + item));
            }
            return users || [];
        case 'sort':
            if (args.length < 2) {
                console.log('Please provide a sort argument: importance, user, or date');
                break;
            }

            const criterion = args.slice(1).join('');
            let arr = processCommand(criterion, false).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase()));
            if (isPrint) console.log(arr);
            return arr;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!