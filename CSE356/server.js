var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var dateTime = require('node-datetime');
var fs = require('fs');
var notLongEnoughResponses = ['Tell me more', 'Can you please elaborate?', 'Can you explain in further detail?'];
var elizabot = require('elizabot');
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


app.use('/',express.static(__dirname + '/elizaPub',{

}));
/*
app.use('*', function(req, res){
  res.sendFile(__dirname + '/elizaPub/index.html');
});*/


app.get('/',function(req,res){
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
	//chatArray.push(req.body);
	//sleep.sleep(3);

	//var answer = computerRegex.test(req.body.message);

	/*
	var answer = possibleChoices[1][0].test(req.body.message);
	var responseMessage = getRandomResponse(possibleChoices[1][1]);
	var response = {
		user: 'Eliza',
		message: responseMessage,
		eliza: responseMessage
	}
	res.send(response);
	*/

	
	/*if (userInputLongEnough(req.body.message) == true){
		console.log("USER INPUT LONG ENOUGH!")
		console.log(req.body.message);
		if(containsSubstring(req.body.message,userInputCurrentGoodFeelings) != false){
			var arrayOfWords = containsSubstring(req.body.message,userInputCurrentGoodFeelings).split(" ");
			var lastWord = arrayOfWords[arrayOfWords.length-1];
			console.log(lastWord);
			var elizaMessage =  getRandomResponse(elizaGladResponses) + ' ' + lastWord + '. ' + getRandomResponse(elizaTalkAboutQuestions);
			var response = {
				user:'Eliza',
				message: elizaMessage,
				eliza: 'Eliza
			}
			res.send(response);
		}
		else if{

		}
		else{
			res.send(sendBackDefaultMessage())
		}
	}
	else{
		var response = {
			user: 'Eliza',
			message: notLongEnoughResponses[Math.floor(Math.random()*notLongEnoughResponses.length)],
			eliza: 'Eliza
		}
		res.send(response);
	}*/

	
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


app.listen(80, "0.0.0.0",function() {
	//var host = server.address();
	console.log('server listening on port ' + 80);
});
