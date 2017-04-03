
export default class User {

	static getSettings( userId, next ) {
		return  new Promise( function(resolve, reject){
			resolve({
				audioNotification: true,
				webNotification: true
			})
		});
	}
}
