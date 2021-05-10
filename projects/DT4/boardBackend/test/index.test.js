//Importing the application to test
let server = require('../index');

//These are the actual modules we use
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
let expect = require('chai').expect;
chai.use(chaiHttp);

let apiUrl = "http://localhost:3000";

let userName = "admin";
let password = "secret";

describe('Endpoint tests', () => {
    //###########################
    //The beforeEach function makes sure that before each test, 
    //there are exactly two boards and one task (for the first board).
    //###########################
    beforeEach((done) => {
        server.resetState();
        
        done();
    });

    //###########################
    //Write your tests below here
    //###########################

    //Authorization
    it("Should have status 200 POST/Auth", function (done){
        chai.request(apiUrl)
            .post('/api/v1/auth')
            .auth(userName, password)
                .end((err, res) => {
                    res.should.not.be.undefined;
                    expect(res).have.status(200);
                    expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                    res.should.be.json;
                    expect(res.body).to.have.key("token");
                    done();
            });
    });

    // Boards
    it("Should have status 200 GET/Boards", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/boards')
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).to.have.status(200);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(2);
                done();
            });
    });

    it("Should have status 200 GET/Boards/:id=0", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/0')
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).have.status(200);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.keys(["id", "name", "description", "tasks"]);
                expect(res.body.id).to.equal("0");
                expect(res.body.name).to.equal("Planned");
                expect(res.body.description).to.equal("My todo list.");
                expect(res.body.tasks).to.be.an('array');
                expect(res.body.tasks).to.have.lengthOf(1);
                expect(res.body.tasks).to.have.members(["0"]);
                done();
            });
    });


    it("Should have status 404 GET/Boards/:id=3", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/3')
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).have.status(404);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.key('message');
                done();
            })
    });

    it("Should have status 201 POST/Boards", function (done) {
        chai.request(apiUrl)
            .post('/api/v1/boards')
            .send({"name": "board", "description": ""})
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).have.status(201);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.keys(['id', 'name', 'description', 'tasks']);
                expect(res.body.name).to.equal("board");
                expect(res.body.description).to.equal("");
                expect(res.body.tasks).to.be.an('array');
                expect(res.body.tasks).to.be.empty;
                done();
            });
    });

    it("Should have status 400 POST/Boards missing description", function (done) {
        chai.request(apiUrl)
            .post('/api/v1/boards')
            .send({"name": "board"})
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).to.have.status(400);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).have.keys("message")
                done();
            });
    });
   
    it("Should have status 200 PUT/boards/:id=1", function (done) {
        chai.request(apiUrl)
            .put('/api/v1/boards/1')
            .send({"name": "NewName", "description": "NewDesc"})
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).to.have.status(200);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.keys(['id', 'name', 'description', 'tasks']);
                expect(res.body.id).to.equal("1");
                expect(res.body.name).to.equal("NewName");
                expect(res.body.description).to.equal("NewDesc");
                expect(res.body.tasks).to.be.an('array');
                expect(res.body.tasks).to.be.empty;
                done();
            });
    });

    it("Should have status 400 PUT/boards/ missing Description", function (done) {
        chai.request(apiUrl)
            .put('/api/v1/boards/1')
            .send({"name": "NewName"})
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).to.have.status(400);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.key('message');
                done();
            });
    });

    it("Should have status 401 DELETE/Boards/:id=0 W/O Authorization", function (done) {
        chai.request(apiUrl)
            .delete('/api/v1/boards/0')
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).have.status(401);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.key('message');
                done();
            });
    });

    it("Should have status 200 DELET/Boards/:id=1 W Authorization", function (done){
        let token;
        chai.request(apiUrl)
            .post('/api/v1/auth')
            .auth(userName, password)
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.key("token");
                token = res.body.token[0];
                
                chai.request(apiUrl)
                    .delete('/api/v1/boards/1/')
                    .set('Authorization', 'Bearer ' + token)
                        .end((err, res) => {
                            res.should.not.be.undefined;
                            expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                            res.should.be.json;
                            expect(res).to.have.status(200);
                            done();
                        });
                
            });
    });

    //Tasks!
    it("Should return 200 GET/Boards/:id=0/tasks", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/0/tasks')
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).have.status(200);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.be.an('array');
                expect(res.body).to.be.lengthOf(1);
                done();
            });
    });

    it("Should return 200 GET/Boards/:id=0/tasks/0", function (done) {
        chai.request(apiUrl)
            .get('/api/v1/boards/0/tasks/0')
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).have.status(200);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.keys(["id", "boardId", "taskName", "dateCreated", "archived"]);
                expect(res.body.id).to.equal("0");
                expect(res.body.boardId).to.equal("0");
                expect(res.body.taskName).to.equal("A task");
                expect(res.body.dateCreated).to.equal(1611244080000);
                expect(res.body.archived).to.equal(false);
                done();
            });
    });

    it("Should return 201 POST/Boards/:id=0/tasks", function (done){
        chai.request(apiUrl)
            .post('/api/v1/boards/0/tasks')
            .send({"taskName": "NewTask"})
            .end((err, res) => {
                res.should.not.be.undefined;
                expect(res).have.status(201);
                expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                expect(res.body).to.have.keys(['id', 'boardId', 'taskName', 'dateCreated', 'archived']);
                expect(res.body.boardId).to.equal("0");
                expect(res.body.taskName).to.equal("NewTask");
                expect(res.body.archived).to.equal(false);
                done();
            });
    });

});

    
