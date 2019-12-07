/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app, db) 
{
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection('books').find({}).project({comments: 0}).toArray(function(err, result)
      {
        if (err){
          console.log("error finding books: " + err)
        } else {
          for (var obj in result){
            delete obj.comments
          }
          res.send(result)
        }
      })
    })
    
  //book is composed of title (string), _id, and commentcount (int), comments (array of strings). Creating a new book should have an empty array for the comments
    .post(function (req, res){
      var title = req.body.title;
      if (title.length == 0){
        return res.json("missing title")
      }
      //response will contain new book object including atleast _id and title
      db.collection('books').insertOne
      (
        //first arg: the doc to insert
        {
          title: title,
          commentcount: 0,
          comments: []
        },
        //second arg: the callback
        (err, doc) => 
        {
          if (err) {
            console.log("error creating book")
          } else {
            //confused on the doc object? See here: https://github.com/mongodb/node-mongodb-native#insert-a-document
            var doc = doc.ops[0]
            delete doc.comments
            delete doc.commentcount
            // console.log(doc)
            res.json(doc)
          }
        }
      )
    })
    
  //this should delete all books
    .delete(function(req, res){
      db.collection("books").deleteMany({},(err, result)=>{
        if (err){
          console.log("error deleting all books: " + err)
        }else {
          if (result.result.ok == 1){
            return res.send("complete delete successful")
          } else {
            return res.send("didn't completely delete right")
          }
        }
      })
      //if successful response will be 'complete delete successful'
    });


//json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
  app.route('/api/books/:id')
    .get(function (req, res)
    {
      var bookid = req.params.id;
      if(!(ObjectID.isValid(bookid) && (new ObjectID(bookid).toString() === bookid))){
        return res.json("no book exists")
      }
      db.collection("books").findOne({_id:ObjectID(bookid)}, function(err, result) 
      {
        if (err) console.log("error finding book by id " + bookid + ": " + err);
        else {
          if (!result){
            return res.json("no book exists")
          }else{
            delete result.commentcount
            // console.log("result from api for getting book: " + Object.entries(result))
            return res.json(result)
          }
        }
      })
    })
    
    .post(function(req, res)
    {
      var bookid = req.params.id;
      var comment = req.body.comment;
      if(!(ObjectID.isValid(bookid) && (new ObjectID(bookid).toString() === bookid))){
        return res.json("Could not find object with the given ID")
      }
      db.collection("books").findOneAndUpdate
      (
        {_id:ObjectID(bookid)},
        {$push: {comments: comment}, $inc: {commentcount: 1}},
        {returnOriginal:false},
        function(err, result) 
        {
          if (err) console.log("error finding book by id " + bookid + ": " + err);
          else {
            if (!result){
              return res.json("Could not find book with id: " + bookid)
            }else{
              delete result.commentcount
              // console.log("result from api for updating comment: " + Object.entries(result))
              return res.json(result.value)
            }
          }
        }
      )
    })
    
  //this should delete book with specific id
    .delete(function(req, res){
      var bookid = req.params.id;
      if(!(ObjectID.isValid(bookid) && (new ObjectID(bookid).toString() === bookid)))
      {//improper id given, so can't find it to delete
        console.log("improper id")
        return res.send("could not delete " + bookid)
      } else
      {
        db.collection('books').deleteOne(
          {_id:ObjectID(bookid)},
          (error, result)=>{
            if (error) console.log("Error deleting: " + error)
            else{
              if (result.result.n == 1){
                return res.send("delete successful")
              }else{//result.n == 0 so it couldn't find it
                console.log("couldn't find proper id")
                return res.send("could not delete " + bookid)
              }
            }
          }
        )
      }
    });
};
