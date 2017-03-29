import firebase from 'firebase';
import config from '../config';

firebase.initializeApp(config.fbConfig);

const database = firebase.database();

const REBELCHAT_CLIENT_KEY_NAME = 'REBELCHAT_KEY';

const CLIENT_SOURCE = 'CLIENT';

const HISTORY_MESSAGE_QTY = 10;

let REBELCHAT_KEY = null;

export default class FirebaseInstance {


	/**
	 * static - set up all the firebase config for the chat
	 */
	static init() {

		if ( localStorage && localStorage[REBELCHAT_CLIENT_KEY_NAME]) {
			REBELCHAT_KEY = localStorage.getItem(REBELCHAT_CLIENT_KEY_NAME);
			console.log('GET REBEL KEY FROM LOCALSTORAGE', REBELCHAT_KEY);
		}

		if ( !REBELCHAT_KEY ) {
			REBELCHAT_KEY = database.ref().child('clients').push().key;
			if ( localStorage ) {
				localStorage.setItem(
					REBELCHAT_CLIENT_KEY_NAME,
					REBELCHAT_KEY
				);
				console.log('SAVE REBEL KEY IN LOCALSTORAGE',	REBELCHAT_KEY);
			} else {
				throw new Error('Your browser doesn\'t support local storage');
			}
		}
	}


	/**
	 * static - description
	 *
	 * @param  {type} user description
	 * @return {type}      description
	 */
	static saveClientInfo( user ) {
		let updates = {};

		let newClient = {
			messages: {},
			visitDate : firebase.database.ServerValue.TIMESTAMP,
			lastActivity : firebase.database.ServerValue.TIMESTAMP,
			name: user.name,
			email: user.email
		};

		updates['/clients/' + REBELCHAT_KEY] = newClient;

		return database.ref().update(updates);
	}

	/**
	 * sendClientMessage - Send the message to the server
	 *
	 * @param  {string}  message Message descriptions
	 * @return {Promise}         FirebasePromise
	 */
	static sendClientMessage( message ) {
		var path = '/messages/' + REBELCHAT_KEY + '/';
		var updates = {};

		//TODO MAYBE I NEED TO MOVE THE USERS LASTACTIVITY UPDATE INSIDE THE PROMISE
		var lastActivityPath = '/clients/' + REBELCHAT_KEY;
		var updateUser = {
			'lastActivity': firebase.database.ServerValue.TIMESTAMP,
		};
		database.ref().child(lastActivityPath).update(updateUser);

		var newMessage = {
			createdAt: firebase.database.ServerValue.TIMESTAMP,
			message: message,
			read: false,
			source: CLIENT_SOURCE
		};

		var newMessageKey = firebase.database().ref().child(path).push().key;
		path += newMessageKey;
		updates[path] = newMessage;
		return firebase.database().ref().update(updates);
	}


	/**
	 * newServeMessage - new message from server
	 *
	 * @param  {function} next Callback
	 */
	static newServeMessage( next ) {
		var path = '/messages/' + REBELCHAT_KEY  +'/';
		var messagesRef = database.ref(path).orderByChild('createdAt');
		messagesRef.on('child_added', function(data) {
			next(data);
		});
	}


	/**
	 * getMessages - Get the last messages on the current conversation
	 *
	 * @param  {function} next description
	 */
	static getMessages( next ) {
		var path = '/messages/' + REBELCHAT_KEY  +'/';
		return database.ref(path).orderByChild('createdAt').limitToLast(
			HISTORY_MESSAGE_QTY
		).once('value');
	}

}
