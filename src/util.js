let UNIQUE_ID;

export default class Utils {

	static generateUniqueId() {
		UNIQUE_ID = (+ new Date());
		return UNIQUE_ID;
	}

	static createUniqueIdSelector( selector ) {
		if ( UNIQUE_ID ) {
			return UNIQUE_ID + '-' + selector;
		} else {
			throw new Error('UNIQUE_ID is not defined');
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


	static isToday( date ) {
		const pDate = new Date();
		return (
			date.getFullYear() === pDate.getFullYear() &&
			date.getMonth() === pDate.getMonth() &&
			date.getDate() === pDate.getDate()
		);
	}

}
