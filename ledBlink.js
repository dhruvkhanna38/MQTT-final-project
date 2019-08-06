var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({extended:true}));


app.get("/" , function(req,res){
    res.render("blink.ejs");
});

app.listen(3000 , function(){
    console.log("listenbing on 3000");
});