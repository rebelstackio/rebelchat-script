import firebase from 'firebase';
import config from '../config';
import Modal from './modal';
import { setTimeout } from 'timers';

firebase.initializeApp(config.MESSAGE_DB);

const database = firebase.database();

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
			localStorage.setItem('USER_NAME',user.name);//save client name for later
			console.log(updates);
			return database.ref().update(updates);
		};
		const modal = new Modal('recovery', {});
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
			if(isUsed){
				modal.buildChatRecoveryModal('SESSION RECOVERY', "chat-cmp-container", function(block_div,recovery_modal){
					//on accept
					var newRef = database.ref('/code_requests').push({
						timestamp: firebase.database.ServerValue.TIMESTAMP,
						email: user.email,
						key_used: REBELCHAT_KEY
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
									localStorage.setItem("REBELCHAT_KEY",userKey);
									localStorage.setItem("USER_NAME",userName);
									REBELCHAT_KEY = userKey;
									//push message
									token_modal.hide();
									that.sendClientMessage(msg);
									//load chat
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
			}else{
				updClient();
				success();
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
