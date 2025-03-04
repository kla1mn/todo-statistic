const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

const files = getFiles();
let todos = extractTodos();

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
            const match = line.match(/\/\/\s*todo:?\s*(.*)/i);
            if (match) {
                todos.push(match[1]);
            }
        });
    });
    return todos;
}

function countOccurrences(str, ch) {
    return str.split(ch).length - 1;
}

function isValidDate(str) {
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

function sortTodos(todos, criterion) {
    if (criterion === 'importance') {
        return todos.slice().sort((a, b) => countOccurrences(b, '!') - countOccurrences(a, '!'));
    } else if (criterion.startsWith('user ')) {
        const username = criterion.split(' ')[1].toLowerCase();
        return todos.filter(todo => {
            const match = todo.match(/^([^;]+);/);
            return match && match[1].trim().toLowerCase() === username;
        });
    } else if (criterion === 'user') {
        const tasksWithUser = [];
        const tasksWithoutUser = [];
        todos.forEach(todo => {
            const parts = todo.split(';');
            if (parts.length > 1 && parts[0].trim() !== '') {
                tasksWithUser.push({ user: parts[0].trim(), todo });
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
                    tasksWithDate.push({ todo, date: new Date(dateStr) });
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

function formatTable(todos) {
    const maxWidths = { importance: 1, user: 15, date: 10, comment: 50 };

    const entries = todos.map(todo => {
        const parts = todo.split(';');
        const user = (parts.length > 1 ? parts[0].trim() : '');
        const date = (parts.length > 2 ? parts[1].trim() : '');
        const comment = (parts.length > 2 ? parts.slice(2).join(';').trim() : parts.slice(1).join(';').trim());
        const importance = todo.includes('!') ? '!' : ' ';

        return {
            importance,
            user: user.length > maxWidths.user ? user.slice(0, maxWidths.user - 3) + '...' : user,
            date: date.length > maxWidths.date ? date.slice(0, maxWidths.date - 3) + '...' : date,
            comment: comment.length > maxWidths.comment ? comment.slice(0, maxWidths.comment - 3) + '...' : comment
        };
    });

    console.log(`${'!'.padEnd(1)}  |  ${'User'.padEnd(maxWidths.user)}  |  ${'Date'.padEnd(maxWidths.date)}  |  ${'Comment'.padEnd(maxWidths.comment)}`);
    console.log('-'.repeat(5 + maxWidths.user + maxWidths.date + maxWidths.comment + 8));

    entries.forEach(entry => {
        console.log(`${entry.importance.padEnd(1)}  |  ${entry.user.padEnd(maxWidths.user)}  |  ${entry.date.padEnd(maxWidths.date)}  |  ${entry.comment.padEnd(maxWidths.comment)}`);
    });
}

function processCommand(command) {
    const args = command.split(' ');
    let result;
    switch (args[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            formatTable(todos);
            break;
        case 'important':
            result = todos.filter(todo => todo.includes('!'));
            formatTable(result);
            break;
        case 'user':
            if (args.length < 2) {
                console.log('Please provide a username');
                break;
            }
            result = sortTodos(todos, `user ${args[1]}`);
            formatTable(result);
            break;
        case 'sort':
            if (args.length < 2) {
                console.log('Please provide a sort argument: importance, user, or date');
                break;
            }
            result = sortTodos(todos, args.slice(1).join(' '));
            formatTable(result);
            break;
        default:
            console.log('wrong command');
            break;
    }
}