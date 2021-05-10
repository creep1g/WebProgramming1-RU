
function loadTasks(boardId) {
    var url = 'https://veff-boards-h1.herokuapp.com/api/v1/boards/' +boardId +'/tasks';
    axios.get(url)
        .then(function (response){
            console.log('Success: ' + response.data);
            for (var i=0; i<response.data.length; i++) {
                
                // It shouldn't draw archived tasks
                if (response.data[i].archived === false) {
                drawTask(boardId, response.data[i].id, response.data[i].taskName);
                }
            }
        } )
        
        .catch (function (error) { 
            console.log("Error; ", error);
        });
}

function drawTask(boardId, taskId, taskName) {
    var board = document.getElementById("taskList"+boardId);
    
    var taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.id = "board"+boardId+"task"+taskId;
    taskDiv.setAttribute("draggable", "true");
    taskDiv.setAttribute("ondragstart", "drag(event)");
    taskDiv.setAttribute("data-curBoard", boardId);
    taskDiv.setAttribute("data-backendId", taskId);
    taskDiv.setAttribute("onmouseover", "style='border: 0.5px solid #FFF9CD;'")
    taskDiv.setAttribute("onmouseleave", "style='border: 0px;'")
    var taskDelete = document.createElement('button');
    taskDelete.className = 'taskx';
    taskDelete.setAttribute("onClick", "deleteTask(" + taskId + "," + boardId + ")");
    taskDelete.innerText = 'x';
    var taskPara = document.createElement('p');
    taskPara.innerText = taskName;
    
    taskDiv.appendChild(taskPara);
    taskDiv.appendChild(taskDelete);
    board.appendChild(taskDiv);

}
function load(){

    var url = 'https://veff-boards-h1.herokuapp.com/api/v1/boards/'

    axios.get(url)
        .then(function (response){
            console.log("Success: ", response.data);
            var board = document.getElementById('container');
            board.innerHTML = "";
            console.log(response.data);
        
            for (var i=0; i<response.data.length;i++) {
                drawBoard(response.data[i].id, response.data[i].name);
                loadTasks(response.data[i].id);
            }
        })
        
        .catch(function (error) {
            console.log("ERROR: ", error);
        });
}


function drawBoard(boardId, boardHead) {
    var board = document.getElementById('container');
    var boardDiv = document.createElement("div");
    boardDiv.id = "boardDiv"+boardId;
    boardDiv.className = "board"; 
    var boardName = document.createElement("h1");
    boardName.className = "board-name"; 
    boardName.innerText = boardHead;

    // Create delete button  
    var deleteButton = document.createElement("button");
    deleteButton.className = "x";
    deleteButton.innerText = "x";
    deleteButton.setAttribute("onClick", "deleteBoard("  +boardId+ ")");

    var createForm = document.createElement("form");
    createForm.setAttribute('onsubmit', 'createTask(' +boardId+ ');return false');

    var taskCreate = document.createElement("input");
    taskCreate.setAttribute("placeholder", 'Create new task');
    taskCreate.className = "createTask";
    taskCreate.id = "taskCreate" + boardId;
    
    var taskList = document.createElement("div");
    taskList.setAttribute("ondrop", "drop(event)");
    taskList.setAttribute("ondragover", "allowDrop(event)");
    taskList.className = "taskList";
    taskList.id = "taskList"+boardId;
    createForm.appendChild(taskCreate);
    boardDiv.appendChild(deleteButton);
    boardDiv.appendChild(boardName);

    boardDiv.appendChild(createForm);
    boardDiv.appendChild(taskList);
    board.appendChild(boardDiv);
    
}

function createNewBoard(){
    console.log(document.getElementById('boardName').value) 
    var newBoardName = document.getElementById('boardName').value;
    var url = 'https://veff-boards-h1.herokuapp.com/api/v1/boards/'

    axios.post(url, { name: newBoardName ,description: ""})
        .then(function (response) {
            console.log("Success: ", response); 
            console.log("Successfully created a board with name " + response.data.name + " at time " + response.data.dateCreated);
            drawBoard(response.data.id, response.data.name);
        })
        
        .catch(function (error){
            console.log("Error: ", error);

        });
}

function deleteBoard(boardId){
    var url = "https://veff-boards-h1.herokuapp.com/api/v1/boards/"+boardId;

    axios.delete(url)
        .then( function(response) {
            console.log("Deleted: ", response)
            document.getElementById('boardDiv'+boardId).remove();
        } ) 
        
        .catch(function(error){
            alert("You can only delete empty boards.");
            console.log("Error: ", error);
        })
}





function deleteTask(taskId, boardId) {
    var curBoard = document.getElementById('board'+boardId+'task'+taskId).getAttribute('data-curBoard');
    // When task is moved data-curBoard is updated, this ensures that we can delete it after movement
    
    var url = 'https://veff-boards-h1.herokuapp.com/api/v1/boards/'+curBoard+'/tasks/'+taskId;

    axios.patch(url, { archived: true })
        .then( function(response){
            document.getElementById("board"+boardId+"task"+taskId).remove();
            console.log(response);
        } )
        
        .catch(function(error) {
            console.log("ERROR: ", error);
        })
}


function createTask(boardId) {
    var newtaskName = document.getElementById('taskCreate'+boardId).value;
    var url = 'https://veff-boards-h1.herokuapp.com/api/v1/boards/' +boardId+ '/tasks';

    axios.post(url, {taskName: newtaskName})
        .then(function (response) {
            console.log("Success: ", response.data);
            console.log("Successfully created a task with name" + response.data.taskName + ' at time ' + response.data.dateCreated);
            
            drawTask(boardId, response.data.id, response.data.taskName);
        })
        
        .catch (function(error) {
            console.log("Error: ", error);
        })
}


function drag(event) {
    event.dataTransfer.setData("task" , event.target.id);
}

function allowDrop(event) {
    event.dataTransfer.getData("task");
    event.preventDefault();
    console.log(event.target.id)
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("task");
    var taskDivId = event.dataTransfer.getData("task");
    var listId = event.target.closest(".taskList").id;
    var destBoard = listId.substr(8);
    
    var boardId = document.getElementById(taskDivId).getAttribute('data-curBoard');
    var taskId = document.getElementById(taskDivId).getAttribute('data-backendId');
    if (boardId !== destBoard){
        var url = 'https://veff-boards-h1.herokuapp.com/api/v1/boards/' + boardId + '/tasks/' + taskId;
    
        console.log("data " + data);
        console.log("taskDivId" + taskDivId);
        console.log("listId " + listId);
        console.log("destBoard: " + boardId);
        axios.patch(url, {boardId: destBoard})
        
            .then(function (response) {
                document.getElementById(taskDivId).setAttribute('data-curBoard', destBoard);
                console.log("Success: ", response);
                event.target.closest(".taskList").appendChild(document.getElementById(data));
            })
            
            .catch(function(error){
                console.log("Error: ", error);
            });

    }
}



load();
