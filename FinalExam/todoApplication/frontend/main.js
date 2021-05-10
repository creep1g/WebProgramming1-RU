function getAllTodos() {
    var noteList = document.getElementById("noteList");
    noteList.innerHTML='';

    var url = 'http://localhost:3000/api/vEx0/notes';
    
    axios.get(url)
        .then(function (response) {
            if (response.data !== null) {
                for (var i = 0; i < response.data.length; i++) {
                    var noteItem = document.createElement("div");
                    var noteName = document.createElement("h3");
                    var noteContent = document.createElement("p");
                    var notePrio = document.createElement("p");
                   
                    // Delete Button
                    var deleteButton = document.createElement("button");
                    deleteButton.className = "DelBtn";
                    deleteButton.innerText = "Delete Note";
                    deleteButton.id = "DelBtn" + response.data[i].id;
                    deleteButton.addEventListener("click", function(event) {
                        event.preventDefault()
                        var noteId = "note"+event.target.id.slice(6,);
                        delNote(noteId);
                    }, true);


                    noteName.innerText = "Name: " + response.data[i].name;
                    noteContent.innerText = response.data[i].content;
                    notePrio.innerText = "Priority: " + response.data[i].priority;
                    noteItem.className = "noteBox";
                    noteName.className = "noteName";
                    noteContent.className = "noteContent";
                    notePrio.className = "notePrio";
                    
                    noteItem.id = "note" + response.data[i].id
                    noteItem.appendChild(noteName);
                    noteItem.appendChild(noteContent);
                    noteItem.appendChild(notePrio);
                    noteItem.appendChild(deleteButton);
                    noteList.appendChild(noteItem);
                }
            }
        })
        .catch(function (error) {
            //When unsuccessful, print the error.
            console.log(error);
        });

function delNote(noteId){
    

    axios.delete(url+"/"+noteId.slice(4))
        .then( function(response) {
            console.log("Deleted: ", response)
            document.getElementById(noteId).remove();
        } ) 
        
        .catch(function(error){
            console.log("Error: ", error);
        })
}

}

getAllTodos();
