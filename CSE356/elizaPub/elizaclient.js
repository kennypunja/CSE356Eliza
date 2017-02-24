var app = angular.module('eliza', ["ui.router",'ui.bootstrap']);
app.config(["$stateProvider","$urlRouterProvider", function($stateProvider,$urlRouterProvider){
	$stateProvider
	.state("/",{
		url: '/',
		templateUrl: "/CSE356/elizaPub/index.html",
	})
	.state("eliza",{
		url: "/eliza",
		templateUrl: "/CSE356/elizaPub/eliza.html",
		controller: "ElizaController"
	})
	.state("eliza.DOCTOR",{
		url: '/DOCTOR',
		templateUrl: "/CSE356/elizaPub/DOCTOR.html",
		styleUrl: "/CSE356/elizaPub/elizaDoctorCSS.css",
		controller: "elizaDoctorControl"
	});
}]);



app.controller('ElizaController',function($scope,$location,$http){


	getRandomResponse = function(array){
	return array[Math.floor(Math.random()*array.length)]
	}

	var greetings = ['Hey ', "Hi ", "What's up "];
	var greetingsInquiry = [" How's it going?", " How are you feeling?", " How are you?"]
	$scope.chatArray = [];

	var realInitGreeting = {
		user : 'Eliza',
		message : "Hi I'm Eliza. What is your name? ",
		eliza : "Hi I'm Eliza. What is your name? "
	}

	$scope.chatArray.push(realInitGreeting);

	var initGreetRandom = greetings[Math.floor(Math.random()*greetings.length)]
	var initialGreeting = {
	user : 'Eliza', 
	message : initGreetRandom,
	eliza : initGreetRandom
	}

	$scope.noName = true;
	$scope.haveName = false;

	$scope.nameSubmit=function(){
		var nameInputted = {
			name: $scope.nameInput
		}
		$http.post('/eliza', nameInputted).
		success(function(res){
			$scope.noName = false;
			$scope.haveName = true;
			$
			console.log("This is res" + res.name);
			$scope.userName = res.name;
			$scope.date = res.date;
			var randomResponse = getRandomResponse(greetings) + res.name + "." + " Today's date is " + res.date + "." + getRandomResponse(greetingsInquiry);
			var initialResponseByEliza = {
				user : 'Eliza',
				message : randomResponse,
				eliza: randomResponse
			}
			$scope.chatArray.push(initialResponseByEliza)
		});
	};

	
	postToServer = function(userInp){
		$http.post('/eliza/DOCTOR', userInp).
		success(function(res){
			console.log("Eliza response")
			console.log(res);
			$scope.chatArray.push(res);
			
		})
	}

	$scope.userChatSubmit = function(){
		console.log("USER ENTERED TEXT");

		var userInp = {
			user: 'User',
			message: $scope.userInput,
			human: $scope.userInput
		}
		$scope.chatArray.push(userInp);
		$scope.userInput = '';
		setInterval(postToServer(userInp),3000);
	}


})
