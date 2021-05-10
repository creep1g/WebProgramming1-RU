const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

const prefix = "/api";
const version = "/vEx0";

app.use(express.json());
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var count = 13;
let notes = [{ id: 10, name: "todos for today", content: "Prepare Lab 6", priority: 1 }, { id: 12, name: "memo for l15", content: "Do not forget to mention Heroku", priority: 5 }];

module.exports.resetServerState = function () {
    //Does nothing
};

app.get(prefix + version + '/notes', (req, res) => {
    let gt = req.query.greater_than;
    if (gt !== undefined) {
        var resNotes = [];
        for (let i = 0; i < notes.length; i++){
            if (notes[i].id > gt){
                resNotes.push(notes[i]);
            }
        }
            return res.status(200).json(resNotes);
    }
    else {
        return res.status(200).json(notes); 
        }
});

app.delete(prefix + version + '/notes/:noteId', (req, res) => {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id == req.params.noteId) {
            res.status(200).json(notes.splice(i, 1)[0]);
            return;
        }
    }
    res.status(404).json({ 'message': "Note with id " + req.params.noteId + " does not exist." });
});


// Post new note, chect name, content and prio name and content cant be empty
// strings and prio is numerical, return json representation of the object
//
app.post(prefix + version + '/notes', (req, res) => {
    if (req.body === undefined || req.body.name === undefined || req.body.name === "" || req.body.content === undefined || req.body.content === "" || req.body.priority === undefined || isNaN(req.body.priority) === true) {
        return  res.status(400).json({'Msg' : 'Note requires Name, Content and priority'})
    }
    else {
        let newNote = {id: count, name: req.body.name, content: req.body.content, priority: req.body.priority};
        count++;
        notes.push(newNote);
        let resNote = {id: newNote.id, name: newNote.name, content: newNote.content, priority: newNote.priority};
        return res.status(200).json(resNote);
        
    }
});

//Default: Not supported
app.use('*', (req, res) => {
    res.status(405).send('Operation not supported.');
});

app.listen(port, () => {
    console.log('Todo note app listening on port ' + port);
});

