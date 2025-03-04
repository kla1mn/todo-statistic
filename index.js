const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function countOccurrences(str, ch) {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === ch) count++;
    }
    return count;
}

function isAllDigits(str) {
    for (let i = 0; i < str.length; i++) {
        if (str[i] < '0' || str[i] > '9') return false;
    }
    return true;
}

function isValidDate(str) {
    if (str.length !== 10) return false;
    if (str[4] !== '-' || str[7] !== '-') return false;
    const year = str.slice(0, 4);
    const month = str.slice(5, 7);
    const day = str.slice(8, 10);
    return isAllDigits(year) && isAllDigits(month) && isAllDigits(day);
}

function extractTodos() {
    const todos = [];
    files.forEach(file => {
        const lines = file.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            const prefix = '/\/\ TODO ';
            if (trimmed.indexOf(prefix) === 0) {
                todos.push(trimmed.substring(prefix.length));
            }
        });
    });
    return todos;
}

function showTodos(todos) {
    todos.forEach(todo => console.log(todo));
}

function sortTodos(todos, criterion) {
    if (criterion === 'importance') {
        return todos.slice().sort((a, b) => countOccurrences(b, '!') - countOccurrences(a, '!'));
    } else if (criterion === 'user') {
        const tasksWithUser = [];
        const tasksWithoutUser = [];
        todos.forEach(todo => {
            const parts = todo.split(';');
            if (parts.length > 1 && parts[0].trim() !== '') {
                tasksWithUser.push({user: parts[0].trim(), todo});
            } else {
                tasksWithoutUser.push(todo);
            }
        });
        tasksWithUser.sort((a, b) => a.user.toLowerCase().localeCompare(b.user.toLowerCase()));
        const grouped = [];
        let currentUser = null;
        tasksWithUser.forEach(item => {
            if (item.user !== currentUser) {
                grouped.push(item.user + ':');
                currentUser = item.user;
            }
            grouped.push('  ' + item.todo);
        });
        if (tasksWithoutUser.length > 0) {
            grouped.push('No user:');
            tasksWithoutUser.forEach(todo => grouped.push('  ' + todo));
        }
        return grouped;
    } else if (criterion === 'date') {
        const tasksWithDate = [];
        const tasksWithoutDate = [];
        todos.forEach(todo => {
            const parts = todo.split(';');
            if (parts.length >= 2) {
                const dateStr = parts[1].trim();
                if (isValidDate(dateStr)) {
                    tasksWithDate.push({todo, date: new Date(dateStr)});
                    return;
                }
            }
            tasksWithoutDate.push(todo);
        });
        tasksWithDate.sort((a, b) => b.date - a.date);
        return tasksWithDate.map(item => item.todo).concat(tasksWithoutDate);
    }
    return todos;
}

function processCommand(command) {
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
        case 'sort': {
            if (args.length < 2) {
                console.log('Please provide a sort argument: importance, user, or date');
                break;
            }
            const todosForSort = extractTodos();
            const sortedTodos = sortTodos(todosForSort, args[1]);
            showTodos(sortedTodos);
            break;
        }
        default:
            console.log('wrong command');
            break;
    }
}
