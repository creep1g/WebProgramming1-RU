// Sample for Assignment 3

const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  


//Board counter
var boardIds = 0;
var taskIds = 0;
//The following is an example of an array of three boards. 
var boards = [];

var tasks = [];

function checkIfAllTasksArchived(boardId) {
    let allArchived = true;
    for (let i=0; i < tasks.length; i++) {
        if (tasks[i].boardId == boardId && tasks[i].archived === false) {
            allArchived = false;
            break;
        }
    }
    return allArchived;
};

function getBoardObject(boardId) {
    //returns a board corresponding to boardId if not found returns undefined
    for (let i = 0; i < boards.length; i++) {
        if (boards[i].id === boardId) {
            return boards[i];
        }
    }    
    return undefined;
};

function getTaskObject(taskId) {
    //Returns an task object
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            return tasks[i];
        };
    };
    return undefined
};

function JSONmsggen(message) {
    //Generate a JSON message
    let msg = {};
    msg.message = message;
    return msg;
}

//Your endpoints go here

//Return an array containing all boards
app.get('/api/v1/boards', (req, res) => {
    let retArr = [];
    for (let i = 0; i < boards.length; i++) {
        let newObj = {
            id: boards[i].id,
            name: boards[i].name,
            description: boards[i].description
        };
        retArr.push(newObj);
    };
    return res.status(200).json(retArr);
});

//Returns all attributes of a specific board
app.get('/api/v1/boards/:boardId', (req, res) => {
    if (isNaN(req.params.boardId) === false) {
        let board = getBoardObject(req.params.boardId);
        
        if (board !== undefined) {
            return res.status(200).json(board);
            }
        else {
            return res.status(404).send(JSONmsggen('Board'+ req.params.boardId + ' Not Found'));
            }
        }
    else {
        return res.status(400).send(JSONmsggen('BoardId must be a number'));
    }
});

// Returns all tasks on corresponding board
app.get('/api/v1/boards/:boardId/tasks', (req, res) => {
    if (isNaN(req.params.boardId) === false) {
        if (getBoardObject(req.params.boardId) !== undefined){
            let boardTasks = [];
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].boardId == req.params.boardId) {
                    boardTasks.push(tasks[i]);
                };
            };
            if (req.body.sort !== undefined) {
                if (req.body.sort === "taskName") {
                    boardTasks.sort(function(a,b) {return (a.taskName > b.taskName) ? 1 : ((b.taskName > a.taskName) ? -1 : 0);});
                }
                else if (req.body.sort === "dateCreated") {
                    boardTasks.sort(function(a,b) {return (a.dateCreated > b.dateCreated) ? 1 : ((b.dateCreated > a.dateCreated) ? -1 : 0);});
                }
                else if (req.body.sort === "id") {
                    boardTasks.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);});
                }
                else {
                    return res.status(400).send(JSONmsggen('Sort not possible, try "taskName", "id", "dateCreated"'));
                }
                
            }
            return res.status(200).json(boardTasks);
        }
        else {
            return res.status(404).send(JSONmsggen('Board ' + req.params.boardId + ' not found.'));
        }
    }
    else {
        return res.status(400).send(JSONmsggen('BoardId must be a number.'));
    }
});

//Returns a specific task
app.get('/api/v1/boards/:boardId/tasks/:taskId', (req, res) => {
    if (isNaN(req.params.boardId) === false && isNaN(req.params.taskId) === false) {
        let board = getBoardObject(req.params.boardId);
        if (board !== undefined) {
            let task = getTaskObject(req.params.taskId);
            if (task !== undefined && task.boardId === board.id){
                return res.status(200).json(task);
            }
            else{
                return res.status(404).send(JSONmsggen('No task with id '+req.params.taskId+' found '+ ' on board ' + req.params.boardId));
            }
        }
        else {
            return res.status(404).send(JSONmsggen('No board with id '+req.params.boardId+' found.'));
        }
    }
    return res.status(400).send(JSONmsggen('Both taskId and BoardId need to be integers.'));
});
//Creates a new task if successfull returns all attributes of the new task
app.post('/api/v1/boards/:boardId/tasks', (req, res) => {
    if (req.body.taskName !== undefined) {
        board = getBoardObject(req.params.boardId);
        if (board !== undefined) {
            var taskId = taskIds + 1 + '';
            board.tasks.push(taskId);
            let date = new Date(); 
            var new_task = {
                id: taskId,
                boardId: req.params.boardId,
                taskName: req.body.taskName,
                dateCreated: date.getTime(),
                archived: false
            };
        
            taskIds++;
        }
        else {
            return res.status(404).send(JSONmsggen('No board with id ' + req.params.boardId + ' was found'));
        }
    }
    else {
        return res.status(400).send(JSONmsggen('Body must contain a task name'));
    }
    

    res.status(200).json(new_task);
    tasks.push(new_task);   
});

//Creates a new board, if successfull returns all attributes of the new board
app.post('/api/v1/boards', (req, res) => {
    
    if (req.body === undefined || req.body.name === undefined || req.body.description === undefined || req.body.name === ''){
        return res.status(400).send(JSONmsggen("Boards require atleast a name, and a description. Name can't be an empty string"));
    }
    var new_obj = {
        id: boardIds+1+'', 
        name: req.body.name,
        description: req.body.description,
        tasks: []
        }
        
    boardIds++;
    boards.push(new_obj);
    return res.status(201).json(new_obj);
});

//Deletes all boards
app.delete('/api/v1/boards', (req, res) => {
    var ret_arr = [];
    for (let i = 0; i < boards.length; i++) {
        let taskObjArr = [];

        for (let j = 0; j < boards[i].tasks.length; j++){
            taskObjArr.push(getTaskObject(boards[i].tasks[j]));
        };

        let retObj = {
            id: boards[i].id,
            name: boards[i].name,
            description: boards[i].description,
            tasks: taskObjArr
        };
        ret_arr.push(retObj);
    } 
    boards = [];
    tasks = [];
    res.status(200).json(ret_arr);
});
//Deletes a board, if board has unarchived tasks the request fails
app.delete('/api/v1/boards/:boardId', (req, res) => {
   
    let found = false;
    if (isNaN(req.params.boardId) === false) {
        for (let i = 0; i < boards.length; i++) {
            if (boards[i].id === req.params.boardId) {
                // if all tasks in boards.task array are archived, nullify the array so board can be deleted
                if (checkIfAllTasksArchived(req.params.boardId) === true) {boards[i].tasks.length = 0;};
                
                if (boards[i].tasks.length === 0) {
                    boards.splice(i, 1);
                    found = true;
                    return res.status(200).json(boards[i]);
                }
                else {
                    found = true;
                    return res.status(400).send(JSONmsggen('Board contains tasks that are not archived, please archive/delete or move these tasks'));
                    
                }
            }
        }; 
    if (found === false) {
        return res.status(404).send(JSONmsggen('Board ' + req.params.boardId +  ' Does Not Exist'));
    }
    }
    res.status(400).send(JSONmsggen('Board ID must be a number'));
});

//deletes a specific task
app.delete('/api/v1/boards/:boardId/tasks/:taskId', (req, res) => {
    
    if (isNaN(req.params.boardId) !== false || isNaN(req.params.taskId) !== false) {
        return res.status(400).send(JSONmsggen('TaskId and BoardId must be numbers'));
    }

    let board = getBoardObject(req.params.boardId);
    if (board !== undefined) {
        let task = getTaskObject(req.params.taskId);
        if (task !== undefined && task.boardId === board.id) {
            let i = board.tasks.indexOf(req.params.taskId);
            board.tasks.splice(i, 1);
            tasks.splice(tasks.indexOf(task), 1);
            return res.status(200).json(task);
        }
        else {
            return res.status(404).send(JSONmsggen('No task with id '+req.params.taskId+' found on board '+ req.params.boardId));
        }
    }
    else {
        return res.status(404).send(JSONmsggen('No board with id '+req.params.taskId+' found'));
    }
});
//Updates board
//All attributes must be delivered from client
app.put('/api/v1/boards/:boardId', (req, res) => {
    if (isNaN(req.params.boardId) === false) {
        
        if (req.body === undefined || req.body.name === undefined || req.body.description === undefined) 
            { return res.status(400).send(JSONmsggen('To update a board, all attributes are needed')) }
        
        if (checkIfAllTasksArchived(req.params.boardId) === false) {
            return res.status(400).send(JSONmsggen('Cannot modify boards with non-archived tasks Delete/archive/move first'));
        }
        
        let board = getBoardObject(req.params.boardId);
        if (board === undefined) {
            return res.status(404).send(JSONmsggen('Board with id '+req.params.boardId+' not found.'));   
        }
        else {
            board.id = req.params.boardId;
            board.name = req.body.name;
            board.description = req.body.description;
            board.tasks = board.tasks;
            return res.status(200).json(board)
                
            }
        }
    return res.status(400).send(JSONmsggen('BoardId must be a number.'))
});

app.patch('/api/v1/boards/:boardId/tasks/:taskId', (req, res) => {
// Updates task, if task is moved to another board boardId is changed and task arrays for each board are updated. 
    if (isNaN(req.params.boardId) === false && isNaN(req.params.taskId) === false) {
        task = getTaskObject(req.params.taskId);
        if (task !== undefined) {
            if (req.body.taskName !== undefined) {
                task.taskName = req.body.taskName;
            }
            if (req.body.archived !== undefined) {
                if (req.body.archived !== true && req.body.archived !== false) {
                    return res.status(400).send(JSONmsggen('Archived can only be set to true or false'));
                }
                task.archived = req.body.archived;
            }
            if (req.body.boardId !== undefined) {
                let origBoard = getBoardObject(task.boardId);
                let newBoard = getBoardObject(req.body.boardId);
                if (req.params.boardId !== task.boardId){
                    return res.status(400).send(JSONmsggen('Task ' + req.params.taskId + ' not found on board '+ origBoard.id));
                }
                if (newBoard !== undefined) {
                    task.boardId = req.body.boardId;
                    let i = origBoard.tasks.indexOf(req.params.taskId);
                    origBoard.tasks.splice(i, 1);
                    newBoard.tasks.push(req.params.taskId);

                }
                else {
                    return res.status(404).send(JSONmsggen('Target board with id ' + req.body.boardId + ' not found'));
                };
            }
            if (req.body === undefined) {
                return res.status(400).send(JSONmsggen('Modifying a task requires at least a taskName, boardId, or archived parameter in the request body.'));
            }
            return res.status(200).json(task);
        }
        else {
            return res.status(404).send(JSONmsggen('No task found.')); 
        }  
    }
    else {
        return res.status(400).send(JSONmsggen('BoardId and TaskId need to be numbers.'))
    }
});

app.use('*', (req, res) => {
    res.status(405).send('Operation not supported');
});
//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});
