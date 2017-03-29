let REBELCHAT_UNIQUE_ID;

export default class Utils {

	/**
	 * static - generate a unique ID for all the dom elements ID
	 *
	 * @return {string}  unique ID
	 */
	static generateUniqueId() {
		REBELCHAT_UNIQUE_ID = (+ new Date());
		return REBELCHAT_UNIQUE_ID;
	}

	/**
	 * static - Create a selector base on the unique ID
	 *
	 * @param  {string} selector DOM selector
	 * @return {string}          selector
	 */
	static createUniqueIdSelector( selector ) {
		if ( REBELCHAT_UNIQUE_ID ) {
			return REBELCHAT_UNIQUE_ID + '-' + selector;
		} else {
			throw new Error('REBELCHAT_UNIQUE_ID is not defined');
		}
	}

	/**
	 * diffDates - Get days of difference between dates
	 *
	 * @param  {Date} a 		Date1
	 * @param  {Date} b 		Date2
	 * @return {integer}   	Days of difference
	 */
	static diffDates(a, b){
		return Math.abs(Math.round((a-b)/(1000*60*60*24)));
	}


	/**
 * shortDate - Get short date description for date entries
 *
 * @param  {Date} 	date Date
 * @return {String}      Short format
 */

	static shortDate(date) {
		let text;
		const options = {
			month: "short",
			day: "numeric"
		};
		const strDate = date.toLocaleTimeString("en-us", options);
		const timeTokens = strDate.split(',');
		if ( timeTokens.length ){
			text = timeTokens[0];
		} else {
			text = 'Previous';
		}
		return text
	}



	/**
	 * static - Create date format string
	 *
	 * @param  {timestap} createdAt timestamp
	 * @return {string}           	string Date format
	 */
	static buildDateMessageFormat(createdAt) {
		let date;
		if ( createdAt ) {
			date = new Date(createdAt);
		} else {
			date = new Date();
		}

		var strDate = date.toLocaleTimeString("en-us");
		var time = document.createTextNode(strDate);
		return time;
	}


	/**
	 * static - Check if the date variable is today
	 *
	 * @param  {Date} date Check date
	 * @return {boolean}
	 */
	static isToday( date ) {
		const pDate = new Date();
		return (
			date.getFullYear() === pDate.getFullYear() &&
			date.getMonth() === pDate.getMonth() &&
			date.getDate() === pDate.getDate()
		);
	}

}
