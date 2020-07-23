const MongoClient = require('mongodb').MongoClient;
const db = require('./database.js');
const express = require('express');
const app = express();
let _db; 




databaseInit().then(()=>{
    try{
	app.use(express.urlencoded());
	
	app.get('/accounts',function(req,res){
	    const collection = _db.db(db.databaseName).collection("accounts");
	    collection.find().toArray(function(err,docs){
		if(err) {
		    throw err;
		}
		res.json(docs);
	    });
	});

	app.get('/tempAccounts',function(req,res){
	    const collection = _db.db(db.databaseName).collection("tempAccounts");
	    collection.find().toArray(function(err,docs){
		if(err) {
		    throw err;
		}
		res.json(docs);
	    });
	});
		
	app.post('/addAccount',function(req,res){
	    var site = req.body.site;
	    var firstName= req.body.firstName;
	    var lastName =req.body.lastName;
	    var email= req.body.email;
	    var pass = req.body.pass;
	    var phone =req.body.phone;
	    var overwrite;
	    var account = {site: site,
			   firstName: firstName,
			   lastName:lastName,
			   email:email,
			   pass:pass,
			   phone:phone};
	    if(!addUserValidation(account)){
		res.send('ERROR IN POST REQEUEST');
		return;
	    }
	    const collection = _db.db(db.databaseName).collection("accounts");
	    collection.find(account).toArray(function(err,result){
		    if(err) throw err;
		    if(result.length == 0){
			collection.insertOne(account, (err,result)=> {
			    if(err) throw (err);
			    console.log('Document inserted!');
			    res.write('true');
			    res.end();
			    return;
			});
		    }
		    else{
			res.send('Exact account already found in database');
			return;
		    }
		    
	    });
	});

	app.post('/addTempAccount',function(req,res){
	    var site = req.body.site;
	    var firstName= req.body.firstName;
	    var lastName =req.body.lastName;
	    var email= req.body.email;
	    var pass = req.body.pass;
	    var phone =req.body.phone;
	    var overwrite;
	    var account = {site: site,
			   firstName: firstName,
			   lastName:lastName,
			   email:email,
			   pass:pass,
			   phone:phone};
	    const collection = _db.db(db.databaseName).collection("tempAccounts");
	    collection.find(account).toArray(function(err,result){
		    if(err) throw err;
		    if(result.length == 0){
			collection.insertOne(account, (err,result)=> {
			    if(err) throw (err);
			    console.log('Document inserted!');
			    res.write('true');
			    res.end();
			    return;
			});
		    }
		    else{
			res.send('Exact account already found in database');
			return;
		    }
		    
	    });
	});


	
	
	app.listen('3000',()=>{
	    console.log('MongoDB webserver listening!');
	});

    }
    catch (e){
	closeDB();
    }
});

function databaseInit(){
    return new Promise((resolve,reject)=>{
	MongoClient.connect(db.url, (error,database)=>{
	    if(error){
		return;
	    }
	    const data = database.db(db.databaseName);
	    _db = database;
	    if(error) throw error;
	    console.log('Database initialized');
	    checkAccountCollection(data).then(()=>{
		checkTempAccountCollection(data).then(()=>{
		    resolve();
		});
	    });
	})
    });
    
};

function closeDB(){
    return new Promise((resolve,reject)=>{
	_db.close();
	console.log("successfully closed database");
	resolve();
    });
}

function addUserValidation(account){
    var properties = ['site','firstName', 'lastName','email','pass','phone'];
    for(var i = 0; i < properties.length;i++){
	if(account[properties[i]] === undefined){
	    return false;
	}
    }
    return true;
};




function checkAccountCollection(data){
    return new Promise((resolve,reject)=>{
	var collections = data.listCollections({name:"accounts"}).toArray((err,cols)=>{
	    if(cols.length === undefined){
		data.createCollection("accounts", {validator: {$jsonSchema: {
		    bsonType: "object",
		    required: [ "site","firstName", "lastName", "email", "pass", "phone"],
		    properties: {
			site:{
			    bsonType:"string"
			},
			firstName:{
			    bsonType: "string"
			},
			lastName:{
			    bsonType: "string"
			},
			email:{
			    bsonType: "string"
			},
			pass:{
			    bsonType: "string"
			},
			phone:{
			    bsonType: "string",
			    minLength: 10	
			}
		    }
		}
							      }
						  }, (err,result)=>{
						      if(err) throw err;
						      console.log('collection created');
						  })
	    }
	    resolve();
	})
    });
};



function checkTempAccountCollection(data){
    return new Promise((resolve,reject)=>{
	var collections = data.listCollections({name:"tempAccounts"}).toArray((err,cols)=>{
	    if(cols.length === undefined){
		data.createCollection("tempAccounts", {validator: {$jsonSchema: {
		    bsonType: "object",
		    required: [ "site"],
		    properties: {
			site:{
			    bsonType:"string"
			}
		    }
							      }
								  }
						      }, (err,result)=>{
						      if(err) throw err;
						      console.log('collection created');
						      });
	    }
	    resolve();
	});
    });
};
		       
