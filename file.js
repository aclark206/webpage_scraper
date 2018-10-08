/*
*  @file file.js
*    holds all the file management functions for scraper.js

*  @function checkDir 
*  @function createFile
*  @function getTodaysDate
*  @function logError
* 
*/

/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
*			Dependencies
*/
fs = require('fs');



/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
*			Functions
*/


/* - - - 
* 
* @function checkDir
*    Check to see if the directory already exists.  If it doesn't, it creates it
*
* @param {string} path:  path of the directory to be checked
*/
// Check to see if the directory already exists.  If it doesn't, it creates it
var checkDir = function(path) {

	return new Promise (function (resolve, reject) {
		fs.mkdir(path, function (error) {
			if (!error) {// directory did not previously exist and was successfully created
				console.log("path" + path + " created");
				resolve(true);
			}
			else if (error.code == 'EEXIST'){  // directory existed 
				resolve(true);
			}
			else {// something went wrong.  Handle error
				console.log("An error occurred creating " + path);
				fileManager.logError(new Date() + " -- " + error.message, path);
				reject(error);
			}
		});
	});
}



/* - - - 
* 
* @function createFile
*    creates a file of the name fileName.  Adds the content to the file.  If a file of the same *	name exists, it writes over the file.    
*
*  @returns {Promise} Returns a Promise with a boolean true if successful or an Error if not
*
* @param {string} path:  path of the directory to be checked
* @param {string} fileName: name of the file to be created
* @param {string} content: what is saved into the file
*/

var createFile = function(path, fileName, content){

	return new Promise (function (resolve, reject) {
		fs.writeFile(path + '/' + fileName, content, function (error) {
			if (!error) {// directory did not previously exist and was successfully created
				console.log(path + '/' + fileName + ' created');
				resolve(true);
			}
			else if (error.code == 'EEXIST'){  // directory existed 
				console.log(path + '/' + fileName + ' created');
				resolve(true);
			}
			else {// something went wrong.  Handle error
				//logError(error.message);
				getTodaysDate()
					.then(date => fileManager.logError(date + " -- " + error.message, path));
				reject(error);
			}
		});
	});
	
};


/*
*	@function getTodaysDate
*		today's date formatted day-month-4digityear e.g 1-10-2018
*
*  	@returns a Promise with string holding
*	
*/
var getTodaysDate = function () {

	return new Promise (function (resolve, reject) {
		const today = new Date();
		let todayFormatted = today.getDate() + "-" 
							+ (today.getMonth() + 1) + "-"
							+ today.getFullYear();
		resolve(todayFormatted);
	});	
};


/* - - - 
*
*	@function logError
*   	Passed Errors will be logged to ./${path}/scraper-error.log
*   	if either the data directory or the log are not previously existing, they will be created.
*		errors ocurring during this function are logged to the console.
*
*	@params {string} errorMsg: is a string with the message that will be logged to the error log.
* 	@params {string} path: the path to the directory holding the error log 
*	
*/
var logError = function (errorMsg, path) {
	checkDir(path) // make sure data directory exists
		.then(fs.appendFile(path + '/scraper-error.log', errorMsg, error => {
			if (error) {
				console.log('ERROR creating scraper-error.log: ' + error.name + error.message);
			}
			}))
		.catch(error => { console.log("Error occurred: " + error.name + error.message)});
}


/* - - - 
* 
* @function logCSVRecord
*    writes the passed record to the csv file 
*
*  @returns {Promise} Returns a Promise with a boolean true if successful or an Error if not
*
* @param {string} record: a csv formated string to be written to the file
* @param {string} path:  path of the directory to the csv file
* @param {string} fileName: name of the csv file

*/
var logCSVRecord = function (record, path, fileName) {
	return new Promise (function (resolve, reject){
		getTodaysDate()
			.then(date => fs.appendFile(path + '/' + date + '.csv', record, error => {
				if(error) {
					getTodaysDate()
					.then(date => fileManager.logError(date + " -- " + error.message, path));
					reject(error); 
				}
				else
					resolve(true)
			}));
	}) // end Promise	
} // end function


/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
*			Exports
*/
module.exports.checkDir = checkDir;
module.exports.getTodaysDate = getTodaysDate;
module.exports.createFile = createFile;
module.exports.logError = logError;
module.exports.logCSVRecord = logCSVRecord;

