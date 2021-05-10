//Importing the application to test
let server = require('../todosAllNPModified');

//These are the actual modules we use
let chai = require('chai');
let should = chai.should();
let expect = require('chai').expect;
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

let apiUrl = "http://localhost:3000";

describe('Note endpoint tests', () => {
    beforeEach((done) => {
        server.resetServerState();
        done();
    });
    
    it("Get /api/vEx0/notes success", function (done) {
        chai.request(apiUrl)
            .get('/api/vEx0/notes')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                done();
            });
    });

    it("Delete Should return 200 /api/vEx0/notes/:noteid", function(done) {
        chai.request(apiUrl)
            .delete('/api/vEx0/notes/12')
            .end((err, res) => {
                res.should.not.be.undefined;
                res.should.have.header("Content-Type", "application/json; charset=utf-8");
                res.should.be.json;
                res.body.should.have.keys(["id", "name", "content", "priority"]);
                res.body.id.should.equal(12);
                res.body.name.should.equal('memo for l15');
                res.body.content.should.equal('Do not forget to mention Heroku');
                res.body.priority.should.equal(5);
                 
                done();
            })
    });
});
