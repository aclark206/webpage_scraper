/* 
@file scraper.js
    * Combs a webpage for product, price, imageURL, URL, and Time and puts them into a csvfile.  
	
    *Saves the CSV file in the ./data sub directory.  If ./data does not already exist, it creates one.
	
    * The csv file is named with the date stamp of it's creation.  e.g  2016-11-21.csv  IF the file already exists, it will be written over.
	
    * Errors will be logged to ./data/scraper-error.log

*/

/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *
*			Dependencies
*/
const scrapeIt = require("scrape-it");
const fs = require('fs');
const fileManager = require('./file.js');



/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
*			Helper Functions
*/

/* - - - 
* @function createRecord
* grabs Title, Price, and imageURl from the passed URL, and logs them in CSV format into a
* file of today's date in the directory indicated by the global variable, 'homeDirectory'.
* the record will be formatted:  Title, Price, ImageURL, URL, Time 
* 
*    @param {string} pageUrl  the URL of the address to scrape
*/

var createRecord = function (pageUrl){
		
// for each URL call this scrapeIt 
	scrapeIt(pageUrl, {
		product: {
			selector: ".shirt-picture img",
			attr: "alt"
		},
		price: ".price",
		imageURL: {
			selector: ".shirt-picture img",
			attr: "src"
		}
	}).then(({ data, response }) => {
		// change the format of the data from json to csv
		let recordCSV = formatRecord(data, pageUrl);
		
		// log the URL and the product, price, imageURL, and time to the CSV file
		fileManager.logCSVRecord(recordCSV, homeDirectory, fileManager.getTodaysDate() + '.csv');
	}).catch(error => { 
			fileManager.logError(new Date() + " -- " + error.message, homeDirectory);
		});
}


/* - - - 
* @function formatRecord
*    turns json object into a string formatted: Title, Price, ImageURL, URL, and Time
*
*    @param {object} rawData:  object is a json formated string containg
*								{product: string,
*								 price: string,
*								imageURL: string }
*
*    @param {string} url: the parent URL to be logged in the CSV file
*
*    @returns {string} csv formatted string containing 	 Title, Price, ImageURL, URL, and Time
*/
var formatRecord = function (rawData, url){
	let record = rawData.product.replace(/,/g ,'-') + ", ";
	record += rawData.price + ", ";
	record += rawData.imageURL + ", ";
	record += url  + ", ";
	let time = new Date();
	record += time.toLocaleTimeString();
	record += "\n";
	return record;
}



/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
*			Main
*/
let homeDirectory = "./data";
let URL = "http://shirts4mike.com";
let header = "Title, Price, imageURL, URL, Time \n";

//
// Create the directory and the csv file
fileManager.checkDir(homeDirectory) // mk directory
    .then(fileManager.getTodaysDate) 
	.then(date => fileManager.createFile(homeDirectory, '/' + date + '.csv', header)) 
    .catch(error => { 
		 fileManager.logError(new Date() + " -- " + error.message, homeDirectory);
	});

	
// call the first page and create an array of shirt URLS
scrapeIt(URL + "/shirts.php", {
	shirtUrls: {
	   listItem: ".products li"
	 , data: {
		   url: {
			   selector: "a"
			 , attr: "href"
		   } 
		}	
	}
//  iterate over all the result pages, scrape the data, save it to the csv file
}).then(({ data, response }) => {
	if (response.statusCode == 200){
		//iterate over the data
		for (let i = 0; i < data.shirtUrls.length; i++){
			createRecord(URL + '/' + data.shirtUrls[i].url);
		}
		console.log('All records logged to csv file.');
	}
	else{
		console.log("ERROR: " + response.statusCode + " Could not reach " + URL);
		fileManager.logError("Something went wrong: " + response.statusCode + ":" + response.message + "\n", homeDirectory);
	}
	
}).catch(error => { 		
	console.log("Network error ocurred.  Could not reach " + URL);	
	fileManager.logError(new Date() + "- " + error.name + " - " + error.message + "\n", homeDirectory);
}); 
	

