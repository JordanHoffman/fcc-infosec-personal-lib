/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var makeRandomWord = function(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

var bookId = 0;

suite('Functional Tests', function() {

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        var bookTitle = makeRandomWord(5)
        chai.request(server)
        .post('/api/books/')
        .send({title:bookTitle})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title', 'Books in array should contain title');
          assert.property(res.body, '_id', 'Books in array should contain _id');
          assert.equal(res.body.title, bookTitle, "The response doc has the title that we gave it")
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books/')
        .send({title:""})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isString(res.body, 'response should be a string')
          assert.equal(res.body, "missing title", "The response text should say: missing title")
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      //the original example given in the boiler plate was moved here
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          
          bookId = res.body[0]._id
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/111111111111111111111111')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isString(res.body, 'response should be a string');
          assert.equal(res.body, 'no book exists', 'Response text should say: no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/' + bookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'comments', 'book should contain comments');
          assert.property(res.body, 'title', 'book should contain title');
          assert.property(res.body, '_id', 'book should contain _id');
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/' + bookId)
        .send({comment:"test comment"})
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, 'comments', 'book should contain comments');
            assert.property(res.body, 'title', 'book should contain title');
            assert.property(res.body, '_id', 'book should contain _id');
            done();
          });
        });
      });

  });

});
