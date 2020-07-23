const MongoClient = require('mongodb').MongoClient;
const db = require('./database.js');
const express = require('express');
const app = express();
let _db; 




databaseInit().then(()=>{
    try{
	app.use(express.urlencoded());
	
	app.post('/addUser',function(req,res){
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
		console.log(account);
		res.send('ERROR IN POST REQEUEST');
		return;
	    }
	    
	    if(typeof req.body.overwrite !== 'undefined'){
		overwrite = req.body.overwrite;
	    }
	    const collection = _db.db(db.databaseName).collection("accounts");
	    if(overwrite === 'true'){
		collection.insertOne(
		    account, (err,result)=> {
			if(err) throw (err);
			console.log('document inserted');
			res.write('true');
			res.end();
		    });
	    }
	    else{
		collection.find(account).toArray(function(err,result){
		    if(err) throw err;
		    console.log(result);
		    if(result.length == 0){
			collection.insertOne(account, (err,result)=> {
			    if(err) throw (err);
			    console.log('document inserted');
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
	    }
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
		resolve(); 
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
