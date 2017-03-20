var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var dateTime = require('node-datetime');
var fs = require('fs');
var notLongEnoughResponses = ['Tell me more', 'Can you please elaborate?', 'Can you explain in further detail?'];
var elizabot = require('elizabot');
var amqp = require('amqplib/callback_api');
var cassandra = require('cassandra-driver');
var fileUpload = require('express-fileupload');

var cassClient = new cassandra.Client({ contactPoints: ['127.0.0.1'],
	keyspace: 'hw4'
});
var	eliza = new elizabot();

var userInputCurrentGoodFeelings = ["i'm doing fine", "i'm doing okay", "i'm feeling good", "i'm feeling fine", "i am doing okay", "i am feeling fine", "i'm okay",
"i am good", 'Doing fine', "it's going good", "it's going fine", "it's going great", "it's going fantastic", "i'm good", "i'm fine", "i'm okay", "i'm great", "im okay", "im great", "im good", "im fantastic"];

var elizaGladResponses = ["I'm glad that you are feeling" ,"I'm glad that you are feeling ", "I'm glad that you are doing " , "It's good to hear that everything is ", 'Nice to hear that you are doing'];

var elizaTalkAboutQuestions = ['Do you want to talk about anything? ', 'What do you want to talk about?', 'Anything you want to get off your chest?', "Anything on your mind?"];

var iNeed = new RegExp('I need (.*)');

var possibleChoices = [
[new RegExp('(.*)computer(.*)'),["How do computers make you feel?", "Does it seem weird to talk to me?", "Are you talking about me?"]]
//[new RegExp('(What (.*)'), ["Have you tried Google?", "Not sure but have you tried going to the library?"]]
]
/*
containsSubstring = function(userInp, possibleMatches){
	for (i = 0; i<possibleMatches.length; i++){
		if (possibleMatches[i].indexOf(userInp.toLowerCase()) != -1){
			return possibleMatches[i];
		}
	}
	return false;
}*/

//getMatchRegex = function(regExp, )



function RemoveEmptyFields(inputJSON){
	var obj = JSON.parse(inputJSON);
	var newJson = {};
	for (var field in obj){
		if(obj[field] != null && obj[field] != [] && obj[field] != {} && String(obj[field]).replace(/ /g,'').length > 0){
			if(typeof(obj[field]) == 'object'){
				if (Object.keys(RemoveEmptyFields(JSON.stringify(obj[field]))).length > 0){
				newJson[field] = RemoveEmptyFields(JSON.stringify(obj[field]))
				}
			}
			else{
				newJson[field] = obj[field];
			}
		}
	}
	return newJson;
}


getRandomResponse = function(array){
	return array[Math.floor(Math.random()*array.length)]
}

userInputLongEnough = function(userInp){
	var amountOfWords = userInp.split(" ");
	if (amountOfWords.length > 1){
		return true;
	}
	else{
		return false;
	}
}

sendBackDefaultMessage = function(){
	var response = {
		user: 'Eliza',
		message: 'What do you mean?',
		eliza: 'Eliza'
	}
	return response;
}




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(fileUpload())

app.use('/',express.static(__dirname + '/elizaPub',{

}));
/*
app.use('*', function(req, res){
  res.sendFile(__dirname + '/elizaPub/index.html');
});*/


app.get('/',function(req,res){
	console.log("HEHEHE");
	MongoClient.connect(url, function(err,db){
		if (err){
			return console.dir(err);
		}
		console.log("MONGO CLIENT CREATED!!!");
		db.createCollection('factbook');

	});
	res.sendFile('index.html',{
		root:__dirname + '/elizaPub'
	});

})

app.get('/hw0',function(req,res){
	res.sendFile('cse356hw0.html',{
		root:__dirname + '/elizaPub'
	});
})

app.get('/hw1.yml',function(req,res){
	res.sendFile('hw1.yml', {
		root:__dirname + '/elizaPub'
	});
})

app.get('/eliza',function(req,res){
	res.sendFile('/eliza.html',{
		root: __dirname + '/elizaPub'
	});
})

app.get('/getChatLog',function(req,res){
	res.send(chatArray);
})

app.post('/getChatLogs',function(req,res){
	res.send(chatArray);
})


app.post('/eliza',function(req,res){
	console.log("POST WAS MADE");
	console.log(req.body.nameToBe);
	var time = dateTime.create();
	var formatTime = time.format('m-d-Y')
	console.log(formatTime);

	var result = {
		date: formatTime,
		name: req.body.name
	};
	res.send(result);
})

app.post('/eliza/DOCTOR', function(req,res){
	console.log("USER TEXT WAS INPUTTED");

	
	if (eliza.quit){
		console.log("HIT ELIZA QUIT")
		res.send("Goodbye, talk to you next time");
	}
	else{
		console.log("ELIZA NOT QUIT");
		var reply = eliza.transform(req.body.human);
		console.log(reply);
		var elizaMsg = {
			user: 'Eliza',
			message: reply,
			eliza: reply
		}
		res.send(elizaMsg);
	}


})

app.post('/speak',function(req,res){
	console.log("OK SPEAK")
	
	amqp.connect('amqp://localhost',function(err,conn){
		conn.createChannel(function(err,ch){
			var q = 'queue';

			ch.assertExchange('hw3','direct',{
				durable:false
			});

			ch.publish('hw3',req.body.key,new Buffer(req.body.msg))
			res.send('');
			//ch.sendToQueue(q,new Buffer(msg));
			console.log(" [x] Sent %s", req.body.msg);
		})
		setTimeout(function(){
			conn.close();
		},500);
	})
})
/*
function doSomething(msg,callback){
	console.log("[x] Received ", msg.content.toString());
	if (callback(boolean) == 0){
		console.log("SENT " + msg.content.toString());
		boolean == 1;
		return res.status('200').json({
			msg: msg.content.toString()
		});
	}
	else{

	}

}

function checkBoolean(boolean){
	if (boolean == 0)
}*/

app.post('/listen',function(req,res){
	amqp.connect('amqp://localhost',function(err,conn){
		var boolean = 0;
		if (err){
		console.log(err);
		}
		conn.createChannel(function(err,ch){
			ch.assertExchange('hw3', 'direct',{
				durable: false
			});

			ch.assertQueue('',{
				exclusive: true
			},function(err,q){
				req.body.keys.forEach(function(key){
				ch.bindQueue(q.queue,'hw3',key)
			})

			console.log("[*] Waiting for message in %s To exit press CTRL+C");
			ch.consume(q.queue,function(msg){

				console.log(" [x] Received ", msg.content.toString());
				var jsonObj = {
				     msg: msg.content.toString()
				}
				if (boolean == 0){
					console.log("SENT " + msg.content.toString());
					boolean = 1;	
					res.send(jsonObj);
				}
				else{
					console.log("NOT SENT B/C BOOL CHANGED");
				}
					/*return res.status('200').json({
						msg: msg.content.toString()
					});*/
				}, {
				noAck: true});

			});
		})
	})
})

app.post('/list',function(req,res){
	var connection = amqp.createConnection({
		host: 'amqp://localhost'
	})

	connection.on('error',function(e){
		console.log("Error from amqp: ", e);
	})

	connection.on
})

app.post('/deposit',function(req,res){
	if (!req.files){
    	return res.status(400).send('No files were uploaded.');
	}


	var query = "INSERT INTO imgs (filename, contents, lastInserted) VALUES (?, ?, now());";
	//var query = "INSERT INTO imgs (filename, contents) VALUES ('cfd66ccc-d857-4e90-b1e5-df98a3d40cd6', 'johndoe');";
	//var query = "INSERT INTO imgs (filename) VALUES ('jackie');";

	cassClient.execute(query,[req.body.filename, req.files.contents.data],function(err,result){
		if(err){
			console.log(err);
			res.send(err);
		}
		else{
		console.log("DATA WAS DEPOSITED");
		console.log(req.body.filename);
		console.log(req.files.contents.data);
		res.send('');
		}	
	})
})

app.get('/retrieve',function(req,res){
	var query = "SELECT * FROM imgs LIMIT 1;";
	cassClient.execute(query,function(err,result){
		if (err){
			console.log(err);
		}
		else{
			console.log("GOT SOMETHING BACK");

			console.log(result.rows[0].filename)
			console.log(result.rows[0].contents);
			var imageType = String(result.rows[0].filename).split(".");
			console.log("THIS IMAGE TYPe" + imageType);
			//res.writeHead(200,{'Content-Type' : 'image'});
			res.setHeader("Content-Type","image/" + imageType);
			res.send(result.rows[0].contents)
		}
	})

})

app.post('/test',function(req,res){
	var query = '{"first_name": "Jane","last_name": "Smith","email": "jane.smith@wyng.com","gender": null,"invitations": [{"from": "","code": null}],"company": {"name": "","industries": []},"address": {"city": "New York","state": "NY","zip": "10011","street": "   "}}'
	//var query = '{"invitations": [{"from": "","code": null}]}';
	//var query = '{"address": {"city": "New York","state": "NY","zip": "10011","street": "    "}}'
	//var query = '{"first_name": "Jane","last_name": "Smith","email": "jane.smith@wyng.com","gender": null, "company": {"name": "","industries": []},"address": {"city": "New York","state": "NY","zip": "10011","street": "   "}}'

	console.log(RemoveEmptyFields(query));
})

//app.get('/retrieve')




app.listen(80, "0.0.0.0",function() {
	//var host = server.address();
	console.log('server listening on port ' + 80);
});
