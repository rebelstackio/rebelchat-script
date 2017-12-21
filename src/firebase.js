import firebase from 'firebase';
import config from '../config';
import Modal from './modal';
import { setTimeout } from 'timers';

firebase.initializeApp(config.MESSAGE_DB);

const database = firebase.database();

const messaging = firebase.messaging();

const REBELCHAT_CLIENT_KEY_NAME = 'REBELCHAT_KEY';

const CLIENT_SOURCE = 'CLIENT';

const HISTORY_MESSAGE_QTY = 10;

let REBELCHAT_KEY = null;

let mainObject = null;

export default class FirebaseInstance {


	/**
	 * static - set up all the firebase config for the chat
	 */
	static init() {

		if ( localStorage && localStorage[REBELCHAT_CLIENT_KEY_NAME]) {
			REBELCHAT_KEY = localStorage.getItem(REBELCHAT_CLIENT_KEY_NAME);
			console.log('GET REBEL KEY FROM LOCALSTORAGE', REBELCHAT_KEY);
		}

		/*if ( !REBELCHAT_KEY ) {
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
		}*/
		/*Get authorization for sending web notifications.*/
		messaging.requestPermission().then(function(){
			return  messaging.getToken();
		}).then(function(token){
			localStorage.setItem("TOKEN",token);
		}).catch(function(err){
			console.log('You do not have permission for web notifications.');
		});
	}

	/**
	 * static - pushes a new client KEY in firebase
	 */
	static pushClientKey(){
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
	static saveClientInfo( user, success, fail ) {
		let updates = {};
		var that = this,
		msg = user.message;

		let newClient = {
			messages: {},
			visitDate : firebase.database.ServerValue.TIMESTAMP,
			lastActivity : firebase.database.ServerValue.TIMESTAMP,
			name: user.name,
			email: user.email
		};

		var updClient = function(){
			updates['/clients/' + REBELCHAT_KEY] = newClient;
			console.log(updates);
			return database.ref().update(updates);
		};
		const modal = new Modal('recovery', {});
		//Check if the user already exists or not
		return database.ref('/clients').once('value',function(data){
			var isUsed = false,
				userKey = false,
				userName = false;
			data.forEach(function(childSnapshot) {
				var key = childSnapshot.key,
					childData = childSnapshot.val(),
					email = childData.email,
					usrNAme = childData.name;
				if(user.email == email){
					isUsed = true;
					userKey = key;
					userName = usrNAme;
				}
			});
			//This means the user already exists
			if(isUsed){
				modal.buildChatRecoveryModal('SESSION RECOVERY', "chat-cmp-container", function(block_div,recovery_modal){
					//The user accepted to send a recovery code to the stored client's email
					var newRef = database.ref('/code_requests').push({
						timestamp: firebase.database.ServerValue.TIMESTAMP,
						email: user.email,
						key_used: userKey//REBELCHAT_KEY
					});
					newRef.then(function(data){
						var uid = data.key;console.log(uid);
						const code_modal = new Modal("code-modal",{});
						code_modal.buildInsertTokenModal('INSERT EMAIL CODE',"chat-cmp-container",function(block_div,token_modal){
							//do something
							database.ref('/code_requests/'+uid).once('value',function(data){
								var token = data.val().token;
								block_div.parentNode.removeChild(block_div);
								if(token == document.getElementById("rebelchat-modal-token").value){
									REBELCHAT_KEY = userKey;
									localStorage.setItem('USER_NAME',userName);
									localStorage.setItem('REBELCHAT_KEY',userKey);
									//push message
									token_modal.hide();
									that.sendClientMessage(msg);
									//load chat
									that.newServeMessage(data => {
										const message = data.val();
										//GET ONLY THE SERVER MESSAGES
										if ( message && message['source'] == 'SERVER' ){
											that.mainObject.checkLastDateEntry();
							
											//FIRE NEW MESSAGES ACTIONS
											var now = new Date(),
											then  = new Date(message['createdAt']),
											diff = now - then;
											if(diff < 10*1000){
												that.mainObject.fireNewMessagesActions();
											}

											//BUILD MESSAGE
											that.mainObject.buildServerMessage(
												message['message'],
												message['createdAt'],
												message['read'],
												false,
												data.key
											);
										}
									});
									that.getMessages().then(snap => {
										const data = snap.val();
										if ( data ){
											that.mainObject.buildPreviousConversation(data);
										}
									}).catch(error =>{
										console.log(error);
									});
								}else{
									//Show token is wrong warning
									var warning_id = token_modal.modalContainer.id.split("-")[0]+"-rebelchat-token-modal-warning";
									if(!document.getElementById(warning_id)){
										var warning = document.createElement("div");
										warning.innerHTML = "The token you inserted is incorrect";
										warning.setAttribute("class","rebelchat-token-modal-warning");
										warning.setAttribute("id",warning_id);
										token_modal.modalBody.appendChild(warning);
									}
								}
							}).catch(error =>{
								console.log(error);
							});
						});
						code_modal.show();
						block_div.parentNode.removeChild(block_div);
					});
				});
				modal.show();
			}else{//The user is new
				/* If the user is not set then: create a new entry on firebase */
				//create new entry on firebase, the next line saves the new client key in localstorage.
				that.pushClientKey();
				//We also need to save the user name.
				localStorage.setItem('USER_NAME',user.name);
				updClient();
				success();
				//Listen for message events
				that.mainObject.serverMessagesEvent();
			}
		});
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

	static setChatSettings( settings ) {
		var path = '/notifications/' + REBELCHAT_KEY + '/',
			newSettings = {
				audioNotifications: settings.audio,
				webNotifications: settings.web
			};
		return database.ref(path).set(newSettings);
	}

	static getChatSettings( cb ) {
		var path = '/notifications/' + REBELCHAT_KEY + '/';
		return database.ref(path).on('value',function(data){
			cb(data.val());
		});
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
