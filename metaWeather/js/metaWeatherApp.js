/*********************************************************************************************
	 metaWeatherApp.js is defining services and modules of the angular structure
**********************************************************************************************/


/*************************************** Globals ********************************************/
var md = new MobileDetect(window.navigator.userAgent); // checking if we are on mobile device
var isMobile = true;
if(md.phone() == null)
	isMobile = false;
if(isMobile)
{
	$(document).ready(function(){
		$(".well").css("margin","0px");
		$(".well").css("margin-top","10px");
		$(".page").css("padding","3px");
		$(".page").css("padding-top","10px");
		$(".page").css("margin","0px");
//		$(".well").css("color","white");
		console.log("document Ready !")
	});

}

/*************************************** The App ********************************************/
var mtw = angular.module('mtw', []); // Creating the main ng-app metaweather (mtw) controller for rootscope

/*************************************** The Modules *****************************************/
mtw.controller('DataController', ['$scope','$http','$sce', function($scope, $http,$sce){ // Controlling the data we will send to the app and how
	$scope.listLang = ['en', 'fr', 'sp','de', 'ru', 'it', 'pl','fi', 'nl', 'bg', 'sd', 'zh', 'tr', 'hr', 'ca'];
	$scope.listLocateType = ['Name', 'GPS'];
	$scope.listMetric =['imperial', 'metric'];
	$scope.listDays = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
	$scope.listForecastType = ["every 3 hours", "daily"];
	$scope.forecastType = "daily";
	$scope.lang = 'en';
	$scope.locateType = 'Name';
	$scope.metric ='metric';
	$scope.days = 7;
	if(readCookie("req")==null)// We check if we have user previous research
		$scope.req='Austin';
	else
		$scope.req =readCookie("req");
	if(readCookie("lon")==null)// We check if we have user previous research
		$scope.lon='0';
	else
		$scope.lon =readCookie("lon");
	if(readCookie("lat")==null)// We check if we have user previous research
		$scope.lat='0';
	else
		$scope.lat =readCookie("lat");
	$scope.rootApi ="http://api.openweathermap.org/data/2.5/";
	$scope.apiKey="&appid=44db6a862fba0b067b1930da0d769e98";
	$scope.apiMode="&mode=json";
	$scope.contentResponse=$sce.trustAsHtml("<strong>No Result for display </strong>");
	$scope.GPSList=[true, false];
	$scope.GPS = $scope.locateType =="GPS";
	$scope.forecastClicked == false; // turns to true if we already clicked on search. To enable direct correction of display while changing parameters
	$scope.actualizeSearch = function(){ // When we change the parameters search.
		if($scope.forecastClicked == true)
			$scope.sendReq();
	}
	$scope.setSearchField = function(){// to display or not the GPS coordinate input fields
				if($scope.locateType =="GPS")
				{
					$scope.GPS = true;
				}
				else if ($scope.locateType =="Name")
				{
					$scope.GPS = false;
				}
	}
	$scope.sendReq=  function(){ // function to send a request to the API
		$scope.forecastClicked =true;
		var forecastType= "";
		var endApi ="";
		var locateType ="";
		var cnt = $scope.days;
		var tempSymbol;
		var speedSymbol;
		if($scope.forecastType== "every 3 hours"){//We set up the forecast type in the URL
			forecastType="forecast?";
			cnt = cnt*8; // We put up the number of forecasts up to the right number of days the user entered (there are 8 forecasts a day in this mode)
		}
		else{
			forecastType ="forecast/daily?";
		}
		if($scope.locateType== "Name"){// we set up the forecast location mode in the URL
			locateType="q="+$scope.req;
		}
		else{
			locateType="lat="+$scope.lat+"&lon="+$scope.lon;
		}
		if($scope.metric== "metric"){// we set up the forecast location mode in the URL
			tempSymbol = "C";
			speedSymbol = "m/s"
		}
		else{
			tempSymbol = "F";
			speedSymbol = "Mph";
		}
		//now we can build the request
		var toSend = $scope.rootApi+forecastType+locateType+"&units="+$scope.metric+"&lang="+$scope.lang+"&cnt="+cnt+$scope.apiMode+$scope.apiKey;
		console.log(toSend);
		$http.get(toSend).then(function _getSuccess(response) // sending the request
								{

									console.log(response);
									var data = response.data;
									if(data.cod =="200"){
										var city = data.city;
										var forecast = data.list;
										$scope.contentResponse = "<h4>Results found for <strong>" + city.name +" ("+ city.country + ") </strong> :</h4></br>";
										$scope.contentResponse += "Coordinates : "+ city.coord.lat + "/"+ city.coord.lon+"<br>";
										//we set up the global variables to the results we got from the request
										$scope.lat = city.coord.lat ;
										$scope.lon = city.coord.lon ;
										$scope.req = city.name; 
										// this will be the latest research so we record it via cookies 
										createCookie("req", city.name, 362);
										createCookie("lat", $scope.lat, 362);
										createCookie("lon", $scope.lon, 362);
										var tableBase = "<table class = 'table-striped'><thead><tr>";
										prevLength = data.list.length; 
										if($scope.forecastType == "every 3 hours"){	 // design of the presentation table changes with then mode selected by the user
											if(isMobile)
												tableBase = "<table class='table-striped'><thead><tr><td>time</td><td></td><td>description</td><td>temperature</td><td>humidity(%)</td><td>Wind speed</td></tr></thead><tbody>";
											else
												tableBase = "<table class='col-md-12 table-striped'><thead><tr><td>time</td><td></td><td>description</td><td>temperature</td><td>humidity(%)</td><td>Wind speed</td></tr></thead><tbody>";
										}	

										else{
											if(isMobile)
												tableBase = "<table class='table-striped'><thead><tr><td>time</td><td></td><td>description</td><td>Day</td><td>Night</td><td>humidity(%)</td><td>Wind speed</td></tr></thead><tbody>";
											else
												tableBase = "<table class='col-md-12 table-striped'><thead><tr><td>time</td><td></td><td>description</td><td>Day</td><td>Night</td><td>humidity(%)</td><td>Wind speed</td></tr></thead><tbody>";	
										}

										
										$scope.contentResponse += tableBase;
										for(var i = 0; i<prevLength; i++)// we are going to write all forecast table here
										{
											if($scope.forecastType == "every 3 hours"){		
												console.log("3hours a day forecast");
												$scope.contentResponse += "<tr><td>"+ forecast[i].dt_txt +"</td>";
												$scope.contentResponse += "<td><img src='media/"+forecast[i].weather[0].icon+".png'></img></td>";
												$scope.contentResponse += "<td>"+ forecast[i].weather[0].description+"</td>";
												$scope.contentResponse += "<td>" + forecast[i].main.temp+" °"+tempSymbol+"</td>";
												$scope.contentResponse += "<td>" + forecast[i].main.humidity+"% </td>";
												$scope.contentResponse += "<td>" + forecast[i].wind.speed +" "+speedSymbol+" </td>";
												$scope.contentResponse += "</tr>";
											}
											else
											{
												if(i == 0)
													$scope.contentResponse += "<tr><td> today </td>";
												else if (i == 1)
													$scope.contentResponse += "<tr><td> tomorrow </td>";
												else
													$scope.contentResponse += "<tr><td>+ "+i+" days </td>";
												console.log("daily forecast");
												$scope.contentResponse += "<td><img src='media/"+forecast[i].weather[0].icon+".png'></img></td>";
												$scope.contentResponse += "<td>"+ forecast[i].weather[0].description +"</td>";
												$scope.contentResponse += "<td>" + forecast[i].temp.day+" °"+tempSymbol+"</td>";
												$scope.contentResponse += "<td>" + forecast[i].temp.night+" °"+tempSymbol+"</td>";
												$scope.contentResponse += "<td>" + forecast[i].humidity +"%</td>";
												$scope.contentResponse += "<td>" + forecast[i].speed +" "+speedSymbol+" </td>";	
												$scope.contentResponse += "</tr>";
												
											}
										}
										$scope.contentResponse += "</tbody></table>";
										$scope.contentResponse = $sce.trustAsHtml($scope.contentResponse);

									}
									else if(data.cod=="404")
									{
										$scope.contentResponse = $sce.trustAsHtml("<em style='color:red;font-size:200%;opacity:o.8;'>Town not found</em>");
									}
									else
									{
										$scope.contentResponse = $sce.trustAsHtml("<em style='color:red;font-size:200%;opacity:o.8;'>Unexpected error</em>");
									}
								}
							, function _getFailure(response)
								{
									$scope.contentResponse ="Unexpected error from http :" + response ;
								}
							);
	};
}]);

/*************************************** Utils **********************************/
function createCookie(name,value,days) { //cookie creator
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
	return document.cookie;
}

function readCookie(name) { //cookie reader
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
