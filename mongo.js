var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mqtt = require('mqtt'); //includes mqtt server 
var mongodb = require('mongodb'); // includes mongoDB 
var mongodbClient = mongodb.MongoClient; //initialises the mongoDB client
var mongodbURI = 'mongodb://localhost:27017/esp_sonoff_final_1'; //activating the MongoDB port 27017, here TempMontor is the name of the database
var deviceRoot = "cmnd/sonoff-ext/POWER"; //deviceroot is topic name given in arduino code 
var collection,client; //initialise collection and client
var mongoose = require("mongoose");

mongoose.connect(mongodbURI , {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended:true}));

var espTestSchema = new mongoose.Schema({
  topic : String ,
  message : String ,
  bufferMessage : Buffer,
  clientId : String,
  created : { type : Date,
              default : Date.now}
});

var espTest = mongoose.model("espTest" , espTestSchema);

mongodbClient.connect(mongodbURI ,{useNewUrlParser:true}, function(err , db){    //connect the database with collection
    if(err) throw err;
    collection=db.collection("espTest"); //name of the collection in the database
    client=mqtt.connect({ host: '206.189.142.198', port: 1883 }); //connecting the mqtt server with the MongoDB database
    client.subscribe(deviceRoot); //subscribing to the topic name 
    client.on('message', insertEvent); //inserting the event 
});   


//function that displays the data in the MongoDataBase
function insertEvent(topic,message) {
   var key=topic.replace(deviceRoot,'');
   var messageString = String(message);
   console.log(topic, String(message));
   var m = messageString.charAt(0) + messageString.charAt(1);
   if(m === "OF"){
     m = m + "F";
   }
   var cid;
   if(m==="ON"){
     cid = messageString.slice(2);
   }
   else{
     cid = messageString.slice(3);
   }
   var obj = {
     topic : topic ,
     message : String(m),
     clientId :cid,
     bufferMessage : message
   };
   espTest.create(obj , function(err , newData ){
     if(err){
       console.log(err);
     }
     else
          console.log(newData);
   });
   
}

app.get("/messages" , function(req, res){
    espTest.find({} , function(err , foundData){
            if(err)
              console.log(err);
             else
              res.render("messages.ejs"  , {foundData: foundData}); 
    });
});

app.get("/graph" , function(req, res){
    espTest.find({} , function(err , foundData){
          if(err)
            console.log(err);
           else
            res.render("graph.ejs" , {foundData : foundData}); 
    });

});
app.get("/graph/:clientid" , function(req,res){
    espTest.find({clientId:req.params.clientid} , function(err , foundData){
          if(err)
            console.log(err);
          else
            res.render("graph.ejs" , {foundData:foundData});  
    });
});  

app.get("/devices" , function(req , res){
    espTest.distinct('clientId' , function(err , foundData){
      if(err){
        console.log(err);
      }
      else
        res.render("devices.ejs" , {foundData : foundData});
    });
});

app.get("/devices/:clientid" , function(req , res){            
            espTest.find({clientId : req.params.clientid} , function(err , foundData){
                        if(err)
                          console.log(err);
                        else
                          res.render("device.ejs" , {foundData:foundData});
            });
           });

app.listen(1111 , function(){
  console.log("Listening On 1111");
});