//import modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const eventEmitter = require('events');

//create event listener for activity logging
const emitter = new eventEmitter();
emitter.on('log', (action, timestamp) => {
    fs.appendFile('log.txt', `${timestamp} - ${action}\n`, (err) => {
        if (err) {
            console.error("Error writing to log:", err);
        }
    });
});

// Helper function to read todos from file
function getTodos(callback) {
    fs.readFile('todos.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading todos:", err);
            callback(err, null);
            return;
        }
        try {
            const todos = JSON.parse(data);
            callback(null, todos);
        } catch (e) {
            console.error("Error parsing todos JSON:", e);
            callback(e, null);
            return;
        }
    });
}

// Helper function to save todos to file
function setTodos(todos, callback) {
    fs.writeFile('todos.json', JSON.stringify(todos), (err) => {
        if (err) {
            console.error("Error writing todos:", err);
            callback(err);
            return;
        }
        callback(null);
    });
}

// Helper function to check if a path contains a valid todo ID
function idCheck(pathname) {
    const stringId = pathname.split("/todos/")[1]; 
    if (!/^[1-9]\d*$/.test(stringId)) {
        return -1;
    }
    return Number(stringId);
}

//create server
const server = http.createServer((req, res) => {
    const requestMethod = req.method;
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    res.setHeader('Content-Type', 'application/json');

    //check if valid route
    if (!pathname.startsWith('/todos')) {
        if (pathname === "/") {
            res.writeHead(200);
            res.end(JSON.stringify({ 'message': "Welcome to todos API" }));
            return;
        }
        res.writeHead(404);
        res.end(JSON.stringify({ 'error': "Unrecognized API endpoint" }));
        return;
    }

    //routing per method
    switch (requestMethod) {
        case "GET":
            if (pathname === '/todos') {
                getTodos((err, todos) => {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Could not retrieve todos' }));
                        return;
                    }
                    if (parsedUrl.query.completed === 'true') {
                        const completedTodos = todos.filter(todo => todo.completed);
                        res.writeHead(200);
                        res.end(JSON.stringify(completedTodos));
                    } else {
                        res.writeHead(200);
                        res.end(JSON.stringify(todos));
                    }
                    emitter.emit('log', `${requestMethod} ${pathname}`, new Date().toISOString());
                });
            } else {
                const todoId = idCheck(pathname);
                if (todoId === -1) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid todo ID' }));
                    return;
                }
                getTodos((err, todos) => {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Could not retrieve todos' }));
                        return;
                    }
                    const todo = todos.find(t => t.id === todoId);
                    if (todo) {
                        res.writeHead(200);
                        res.end(JSON.stringify(todo));
                    } else {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: `Todo with ID ${todoId} not found` }));
                    }
                    emitter.emit('log', `${requestMethod} ${pathname} - Fetched todo ID ${todoId}`, new Date().toISOString());
                });
            }
            break;
        case "POST":
            if (pathname === '/todos') {
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', () => {
                    try {
                        const { title, completed } = JSON.parse(body);
                        if (title === undefined) {
                            res.writeHead(400);
                            res.end(JSON.stringify({ error: 'Missing "title" in request body' }));
                            return;
                        }

                        getTodos((err, todos) => {
                            if (err) {
                                res.writeHead(500);
                                res.end(JSON.stringify({ error: 'Could not read todos' }));
                                return;
                            }

                            const newId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;
                            const newTodo = { id: newId, title: title, completed: completed ?? false };
                            todos.push(newTodo);

                            setTodos(todos, (writeErr) => {
                                if (writeErr) {
                                    res.writeHead(500);
                                    res.end(JSON.stringify({ error: 'Could not save new todo' }));
                                    return;
                                }
                                res.writeHead(201);
                                res.end(JSON.stringify(newTodo));
                                emitter.emit('log', `${requestMethod} ${pathname} - Created todo ID ${newId}`, new Date().toISOString());
                            });
                        });
                    } catch (e) {
                        console.error("Error parsing request body:", e);
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
                    }
                });
            }
            break;
        case "PUT":
            const todoIdForPut = idCheck(pathname);
            if (todoIdForPut === -1) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid todo ID for update' }));
                return;
            }
            let putBody = '';
            req.on('data', chunk => putBody += chunk.toString());
            req.on('end', () => {
                try {
                    const updatedTodoData = JSON.parse(putBody);
                    getTodos((err, todos) => {
                        if (err) {
                            res.writeHead(500);
                            res.end(JSON.stringify({ error: 'Could not read todos for update' }));
                            return;
                        }
                        const todoIndex = todos.findIndex(t => t.id === todoIdForPut);
                        if (todoIndex !== -1) {
                            const updatedTodo = { ...todos[todoIndex], ...updatedTodoData, id: todoIdForPut }; // Ensure ID is not overwritten
                            todos[todoIndex] = updatedTodo;
                            setTodos(todos, (writeErr) => {
                                if (writeErr) {
                                    res.writeHead(500);
                                    res.end(JSON.stringify({ error: 'Could not update todo' }));
                                    return;
                                }
                                res.writeHead(200);
                                res.end(JSON.stringify(updatedTodo));
                                emitter.emit('log', `${requestMethod} ${pathname} - Updated todo ID ${todoIdForPut}`, new Date().toISOString());
                            });
                        } else {
                            res.writeHead(404);
                            res.end(JSON.stringify({ error: `Todo with ID ${todoIdForPut} not found for update` }));
                        }
                    });
                } catch (e) {
                    console.error("Error parsing update request body:", e);
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON in update request body' }));
                }
            });
            break;
        case "DELETE":
            const todoIdForDelete = idCheck(pathname);
            if (todoIdForDelete === -1) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid todo ID for deletion' }));
                return;
            }
            getTodos((err, todos) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Could not read todos for deletion' }));
                    return;
                }
                const initialLength = todos.length;
                const updatedTodos = todos.filter(todo => todo.id !== todoIdForDelete);
                if (updatedTodos.length < initialLength) {
                    setTodos(updatedTodos, (writeErr) => {
                        if (writeErr) {
                            res.writeHead(500);
                            res.end(JSON.stringify({ error: 'Could not delete todo' }));
                            return;
                        }
                        res.writeHead(204); // No content for successful deletion
                        res.end();
                        emitter.emit('log', `${requestMethod} ${pathname} - Deleted todo ID ${todoIdForDelete}`, new Date().toISOString());
                    });
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: `Todo with ID ${todoIdForDelete} not found for deletion` }));
                }
            });
            break;
        default:
            res.writeHead(405); // Method Not Allowed
            res.end(JSON.stringify({ error: `Method ${requestMethod} not allowed on this endpoint` }));
            break;
    }
});

//run server
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; //suggested for servers running inside Github Codespace

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});