import FirebaseInstance from './firebase';
import Utils from './util';
import css from './assets/css/style.css';


const CONFIG = {
	el: 'main',
	contactLabel: 'Send Message',
	chatInputPlaceholder: 'Enter your message'
};

const TRUNCATED_LENGTH = 40;
const SEND_MESSAGE_KEY = 13;
const DEFAULT_DATE_ENTRY = 'Today';
const LAST_MESSAGE_FROM_CLIENT = true;

export default class RebelChat {

	constructor( config ){
		this.id = Utils.generateUniqueId();
		this.config = Object.assign(CONFIG, config);
		this.loadStyles();
		FirebaseInstance.init();
		this.init();
	}

	/**
	 * loadStyles - description
	 *
	 * @return {type}  description
	 */
	loadStyles() {
		const head = document.head || document.getElementsByTagName('head')[0];
		const style = document.createElement('style');
		style.type = 'text/css';
		if (style.styleSheet){
			style.styleSheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}
		head.appendChild(style);
	}

	/**
	 * init - Init function
	 *
	 * @return {type}  description
	 */
	init() {
		//ADD EVENT TO LISTEN NEW MESSAGES INCOMING FROM THE SERVER
		this.serverMessagesEvent();
		//GET THE PREVIOUS MESSAGES
		FirebaseInstance.getMessages().then(snap => {
			const data = snap.val();
			if ( data ){
				this.buildPreviousConversation(data);
			} else {
				this.buildContactForm();
			}
		}).catch(error =>{
			//TODO HANDLE ERROR WHEN THERE IS AN ERROR TRYING TO GET THE MESSAGES
			console.log(error);
		});
	}


	/**
	 * buildPreviousConversation -  Build previous conversation
	 *
	 * @param  {Object} messages  List of previous messages
	 */
	buildPreviousConversation( messages ) {
		//BUILD CHAT COMPONENt
		this.buildChatComponent();

		const keys = Object.keys(messages);
		const keyLength = keys.length;
		let lastDate = null;

		for (let i = 0; i < keyLength; i++) {
			let message = messages[keys[i]];
			//FIRST DATE ENTRY
			if ( i == 0 ){
				this.buildDateEntry(message['createdAt']);
			}

			//BUILD DATES ENTRIES BASE ON THE PREVIOUS MESSAGES
			if ( !lastDate ) {
				lastDate = new Date(message['createdAt']);
			} else {
				let tmpDate = new Date(message['createdAt']);
				//CALCULATE DAYS OF DIFFERENCE
				let daysDiff = Utils.diffDates(tmpDate, lastDate);
				if ( daysDiff > 0 ) {
					this.buildDateEntry(message['createdAt']);
				}
				lastDate = tmpDate;
			}
			//BUILD MESSAGES HISTORY
			switch (message['source']) {
				case 'CLIENT':
					this.buildClientMessage(
						message['message'],
						message['createdAt'],
						message['read'],
						false,
						keys[i]
					);
					break;
				case 'SERVER':
					this.buildServerMessage(
						message['message'],
						message['createdAt'],
						message['read'],
						false,
						keys[i]
					);
					break;
				default:
					console.log('Invalid message\'s source ', message);
					break;
			}
		}
	}

	buildChatComponent( message ) {
		const form = document.getElementById(this.config['el']);

		const chatDiv = document.createElement('div');
		chatDiv.setAttribute('class', 'collapse in');
		chatDiv.setAttribute('id', Utils.createUniqueIdSelector('chat-container'));
		// chatDiv.setAttribute('style', 'display:none;');

		const chatHistoryDiv = document.createElement('div');
		chatHistoryDiv.setAttribute('class', 'nano has-scrollbar');
		chatHistoryDiv.setAttribute('id', Utils.createUniqueIdSelector('chat-history'));

		const chatHistoryContent = document.createElement('div');
		chatHistoryContent.setAttribute('class', 'nano-content pad-all');
		chatHistoryContent.setAttribute('tabindex', '0');

		const chatUl = document.createElement('ul');
		chatUl.setAttribute('class', 'list-unstyled media-block');
		chatUl.setAttribute('id', Utils.createUniqueIdSelector('chat-list'));

		const messageZone = this.buildMessageZone();

		chatHistoryContent.appendChild(chatUl);
		chatHistoryDiv.appendChild(chatHistoryContent);
		// chatHistoryDiv.appendChild(nanoPane);
		chatDiv.appendChild(chatHistoryDiv);
		chatDiv.appendChild(messageZone);

		form.innerHTML = "";

		form.appendChild(chatDiv);

		//FOCUS
		// messageZone.focus();

		//SEND CLIENT MESSAGE
		if ( message ){
			this.sendClientMessage(message);
		}

		//HACK FOR SCROLL BAR
		// $(chatHistoryDiv).mCustomScrollbar({
		// 	autoHideScrollbar: true
		// });

		// setTimeout(function(){
		// 	ContactUsForm.focusLastMessageChat();
		// }, 1000);


		//UGG JQUERY
		// $( "#chat-container" ).fadeIn( "slow" );

	}


	/**
	 * sendClientMessage - Send the message to FB database
	 *
	 * @param  {type} message description
	 * @return {type}         description
	 */
	sendClientMessage( message ) {
		this.checkLastDateEntry();
		const lastMessage = this.buildClientMessage(message, null, null, true);
		FirebaseInstance.sendClientMessage(message).then(() => {
			//TODO MESSAGE SENT
		}).catch((error) => {
			//TODO HANDLE ERROR SENDING MESSAGE
		});
	}

	/**
	 * buildServerMessage - Build DOM elements from server's message
	 *
	 * @param	{string} 		message	 Message descrition
	 * @param	{timestamp} 	createdAt Message createdAt date
	 * @param	{boolean} 		read			Meesage read by the rebel team
	 * @param	{boolean} 		sending	 Meesage is sending
	 * @param	{string} 		id				Meesage ID
	 */
	buildServerMessage( message, createdAt, read, sending, id ) {
		const chatList = document.getElementById(Utils.createUniqueIdSelector('chat-list'));
		if ( this.isLastMessageFromServer() ) {
			const messages = chatList.getElementsByClassName('mar-btm');
			const  lastMessage = messages[messages.length - 1];
			if ( id ) {
				lastMessage.setAttribute('id', 'message-container-' + id);
			}

			if ( createdAt ) {
				lastMessage.setAttribute('createdAt', createdAt);
			}

			var speech = lastMessage.getElementsByClassName('speech')[0];

			var time = Utils.buildDateMessageFormat(createdAt);

			var textContainer = document.createElement('p');
			textContainer.setAttribute('class', "msg-right");

			var _message = document.createTextNode(message);

			var span = document.createElement('span');
			span.setAttribute('style', 'float:right');
			span.appendChild(time);

			textContainer.appendChild(_message);
			textContainer.appendChild(span);
			speech.appendChild(textContainer);

			//FOCUS LAST MESSAGE
			this.focusLastMessageChat();

			return lastMessage;
		} else {
			const messageExists = document.getElementById('message-container-' + id);

			if ( !messageExists ) {
				var messageContainer = document.createElement('li');
				messageContainer.setAttribute('style', 'display:none;');
				messageContainer.setAttribute('class', 'mar-btm server-message');
				if ( id ) {
					messageContainer.setAttribute('id', 'message-container-' + id);
				}

				if ( createdAt ) {
					messageContainer.setAttribute('createdAt', createdAt);
				}

				var avatarZone = document.createElement('div');
				avatarZone.setAttribute('class', 'media-right');

				var avatar = document.createElement('img');
				avatar.setAttribute('class', 'img-circle img-sm');
				avatar.setAttribute('alt', 'Client');
				avatar.setAttribute(
					'src',
					'https://firebasestorage.googleapis.com/v0/b/rebelstackchat.appspot.com/o/man.svg?alt=media&token=f476c305-d215-4c2f-8e15-9196b48d55b3'
				);

				var messageTextContainer = document.createElement('div');
				messageTextContainer.setAttribute('class', 'media-body pad-hor speech-right');

				var speech = document.createElement('div');
				speech.setAttribute('class', 'speech');

				var linkHeader = document.createElement('a');
				linkHeader.setAttribute('class', "media-heading");

				var clientName = document.createElement('b');

				var name = document.createTextNode('RebelStack\'s Team');

				var time = Utils.buildDateMessageFormat(createdAt);

				var textContainer = document.createElement('p');
				textContainer.setAttribute('class', "msg-right");

				var _message = document.createTextNode(message);

				var span = document.createElement('span');
				span.setAttribute('style', 'float:right');
				span.appendChild(time);

				textContainer.appendChild(_message);
				textContainer.appendChild(span);

				clientName.appendChild(name);
				linkHeader.appendChild(clientName);

				speech.appendChild(linkHeader);
				speech.appendChild(textContainer);

				messageTextContainer.appendChild(speech);

				avatarZone.appendChild(avatar);

				messageContainer.appendChild(avatarZone);
				messageContainer.appendChild(messageTextContainer);


				// if ( sending ){
				// 	icon.setAttribute('class', 'fa fa-paper-plane you faa-pulse animated');
				// 	icon.setAttribute('aria-hidden', 'true');
				// 	icon.setAttribute('title', 'Sending message');
				// } else {
				// 	icon.setAttribute('class', 'fa fa-circle you');
				// 	icon.setAttribute('title', 'Message sent');
				// }

				if ( chatList ){
					chatList.appendChild(messageContainer);

					//UGG JQUERY
					// $(messageContainer).fadeIn( "slow" );

					//SAVE LAST MESSAGE TYPE
					this.LAST_MESSAGE_TYPE = 'SERVER';

					//FOCUS LAST MESSAGE
					this.focusLastMessageChat();

					return messageContainer;
				}
			}
		}
	}

	/**
		* buildClientMessage - Build DOM elements from client's message
		*
		* @param	{string} 		message	 Message descrition
		* @param	{timestamp} createdAt Message createdAt date
		* @param	{boolean} 	read			Meesage read by the rebel team
		* @param	{boolean} 	sending	 Meesage is sending to the server
		* @param	{string} 		id	 			Meesage ID
		*/
	buildClientMessage( message, createdAt, read, sending, id ) {
		const chatList = document.getElementById(Utils.createUniqueIdSelector('chat-list'));
		//LAST MESSAGE IS FROM THE CLIENT
		if ( this.isLastMessageFromClient() ) {
			var messages = chatList.getElementsByClassName('mar-btm');
			var lastMessage = messages[messages.length - 1];
			var speech = lastMessage.getElementsByClassName('speech')[0];

			var time = Utils.buildDateMessageFormat(createdAt);

			if ( id ) {
				lastMessage.setAttribute('id', 'message-container-' + id);
			}

			if ( createdAt ) {
				lastMessage.setAttribute('createdAt', createdAt);
			}

			var textContainer = document.createElement('p');
			textContainer.setAttribute('class', "msg-left");

			//ADD STYLE WHEN
			if ( sending ) {
				// textContainer.setAttribute('style' , 'background-color: #97c2c6;');
				// setTimeout(function(){
				// 	textContainer.setAttribute('style' , '');
				// }, 2000);
			}

			var _message = document.createTextNode(message);

			var span = document.createElement('span');
			span.setAttribute('style', 'float:right');
			span.appendChild(time);

			textContainer.appendChild(_message);
			textContainer.appendChild(span);
			speech.appendChild(textContainer);

			//FOCUS LAST MESSAGE
			this.focusLastMessageChat();

			return lastMessage;
		} else {
			//LAST MESSAGE IS FROM THE SERVER
			var messageContainer = document.createElement('li');
			// messageContainer.setAttribute('style', 'display:none;');
			messageContainer.setAttribute('class', 'mar-btm client-message');

			if ( id ) {
				messageContainer.setAttribute('id', 'message-container-' + id);
			}

			if ( createdAt ) {
				messageContainer.setAttribute('createdAt', createdAt)
			}

			var avatarZone = document.createElement('div');
			avatarZone.setAttribute('class', 'media-left');

			var avatar = document.createElement('img');
			avatar.setAttribute('class', 'img-circle img-sm');
			avatar.setAttribute('alt', 'Client');
			avatar.setAttribute(
				'src',
				'https://firebasestorage.googleapis.com/v0/b/rebelstackchat.appspot.com/o/man2.svg?alt=media&token=379ec88e-bf47-426a-b2d8-8bad167adb8c'
			);

			var messageTextContainer = document.createElement('div');
			messageTextContainer.setAttribute('class', 'media-body pad-hor');

			var speech = document.createElement('div');
			speech.setAttribute('class', 'speech');

			var linkHeader = document.createElement('a');
			linkHeader.setAttribute('class', "media-heading");

			var clientName = document.createElement('b');

			var name = document.createTextNode('You');

			var time = Utils.buildDateMessageFormat(createdAt);

			var textContainer = document.createElement('p');
			textContainer.setAttribute('class', "msg-left");

			var _message = document.createTextNode(message);

			var span = document.createElement('span');
			span.setAttribute('style', 'float:right');
			span.appendChild(time);

			textContainer.appendChild(_message);
			textContainer.appendChild(span);

			clientName.appendChild(name);
			linkHeader.appendChild(clientName);

			speech.appendChild(linkHeader);
			speech.appendChild(textContainer);

			messageTextContainer.appendChild(speech);

			avatarZone.appendChild(avatar);

			messageContainer.appendChild(avatarZone);
			messageContainer.appendChild(messageTextContainer);

			//TODO HANDLE COMPONENT	SENDING MESSAGE
			// if ( sending ){
			// 	icon.setAttribute('class', 'fa fa-paper-plane you faa-pulse animated');
			// 	icon.setAttribute('aria-hidden', 'true');
			// 	icon.setAttribute('title', 'Sending message');
			// } else {
			// 	icon.setAttribute('class', 'fa fa-circle you');
			// 	icon.setAttribute('title', 'Message sent');
			// }

			chatList.appendChild(messageContainer);

			//UGG JQUERY
			// $(messageContainer).fadeIn( "slow" );

			//SAVE LAST MESSAGE TYPE
			this.LAST_MESSAGE_TYPE = 'CLIENT';

			//FOCUS LAST MESSAGE
			this.focusLastMessageChat();

			return messageContainer;
		}
	}


	/**
	 * buildMessageZone - Build the chat zone
	 *
	 * @return {DOM}  Chat zone DOM 5
	 */
	buildMessageZone() {
		const messageSelector = Utils.createUniqueIdSelector('message-zone');

		const row = document.createElement('div')
		row.setAttribute('class', 'row');

		const col11 = document.createElement('div')
		col11.setAttribute('class', 'col-xs-11');

		const group = document.createElement('div')
		group.setAttribute('class', 'group');

		const message = document.createElement('input');
		message.setAttribute('class', 'material');
		message.setAttribute('type', 'text');
		message.setAttribute('placeholder', this.config['chatInputPlaceholder']);
		message.setAttribute('id', messageSelector);

		const highlight = document.createElement('span');
		highlight.setAttribute('class', 'highlight');

		const bar = document.createElement('span');
		bar.setAttribute('class', 'bar');

		const col1 = document.createElement('div')
		col1.setAttribute('class', 'col-xs-1');
		col1.setAttribute('style', 'padding-left: 0px;');

		const link = document.createElement('a')
		col1.setAttribute('href', '#');

		const image = document.createElement('span');
		image.setAttribute('style',"padding-top: 20px;" );
		image.setAttribute('class',"chat-btn glyphicon glyphicon-send");
		image.setAttribute('aria-hidden',"true");
		image.setAttribute('title',"Send");

		group.appendChild(message);
		group.appendChild(highlight);
		group.appendChild(bar);
		col11.appendChild(group);

		link.appendChild(image);
		col1.appendChild(link);

		row.appendChild(col11);
		row.appendChild(col1);

		message.addEventListener('keypress', (event) => {
			const message = event.target.value;
			const key = event.keyCode;
			if (key === SEND_MESSAGE_KEY){
				event.preventDefault();
				if ( message.length ) {
					event.target.value = "";
					this.sendClientMessage(message);
				}
			} else {
				if ( message.length > TRUNCATED_LENGTH ){
					event.target.value = message.slice(0, -1);
				}
			}
		});

		link.addEventListener('click', (event) => {
			event.preventDefault();
			var messageZone = document.getElementById(messageSelector);
			var message = messageZone.value;
			if ( message && message.length ){
				messageZone.value = "";
				this.sendClientMessage(message);
			}
		});

		return row;
	}

	/**
	 * buildContactForm - Build the initial contact form
	 */
	buildContactForm() {
		let form = document.createElement('form');
		form.setAttribute('id', Utils.createUniqueIdSelector('rebel-contact-form'));
		form.setAttribute('class', 'contact-form rebelchat-form');
		form.setAttribute('role',	'form');
		// form.setAttribute('style','display:none;');

		//NAME INPUT
		let input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('class', 'form-control');
		input.setAttribute('id', Utils.createUniqueIdSelector('rebel-name'));
		input.setAttribute('name', 'name');
		input.setAttribute('placeholder', 'Name');
		input.setAttribute('required', 'required');

		//EMAIL
		let email = document.createElement('input');
		email.setAttribute('type', 'email');
		email.setAttribute('class', 'form-control');
		email.setAttribute('id', Utils.createUniqueIdSelector('rebel-email'));
		email.setAttribute('name', 'email');
		email.setAttribute('placeholder', 'Email');
		email.setAttribute('required', 'required');

		//MESSAGE
		let message = document.createElement('textarea');
		message.setAttribute('class', 'form-control');
		message.setAttribute('id', Utils.createUniqueIdSelector('rebel-message'));
		message.setAttribute('name', 'message');
		message.setAttribute('placeholder', 'Message');
		message.setAttribute('rows', '10');
		message.setAttribute('required', 'required');

		// BUTTON
		let button = document.createElement('button');
		button.setAttribute('class', 'btn btn-main btn-lg');
		button.setAttribute('type', 'submit');
		button.setAttribute('id', Utils.createUniqueIdSelector('rebel-send'));

		button.addEventListener( 'click', this.saveContatForm.bind(this) );

		let ie = document.createElement('i');
		ie.setAttribute('class', 'fa fa-paper-plane ');
		let text = document.createTextNode(this.config['contactLabel']);
		button.appendChild(ie);
		button.appendChild(text);

		form.appendChild(input);
		form.appendChild(email);
		form.appendChild(message);
		form.appendChild(button);
		let formContainer = document.getElementById(this.config['el']);
		formContainer.innerHTML = "";
		formContainer.appendChild(form);

		//UGG JQUERY
		// $( "#contact-form" ).fadeIn( "slow" );
		// HTML ->
		// <form class="contact-form" role="form" action="https://secure.mailjol.net/allforms/u/a5b1c394.php">
		// 	<input type="text" class="form-control" id="Name" name="Name" placeholder="Name" required>
		// 	<input type="email" class="form-control" id="Email" name="Email" placeholder="Email" required>
		// 	<textarea id="Message" name="Message" placeholder="Message" class="form-control" rows="10"></textarea>
		// 	<button class="btn btn-main btn-lg" type="submit" id="send" data-loading-text="<i class='fa fa-spinner fa-spin'></i> Sending..."><i class="fa fa-paper-plane "></i> Send</button>
		// </form>
		// <div id="result-message" role="alert"></div>
	}

	saveContatForm( e ) {
		const form = document.getElementById(
			Utils.createUniqueIdSelector('rebel-contact-form')
		);
		if ( form.checkValidity()){
			e.preventDefault();
			const name = document.getElementById(
				Utils.createUniqueIdSelector('rebel-name')
			).value;
			const email = document.getElementById(
				Utils.createUniqueIdSelector('rebel-email')
			).value;
			const message = document.getElementById(
				Utils.createUniqueIdSelector('rebel-message')
			).value;
			const user = {
				'name': name,
				'email': email
			};

			//SAVE USER INFORMATION
			this.USER = user;
			FirebaseInstance.saveClientInfo(user);

			//BUILD CHAT COMPONENT
			this.buildChatComponent(message);

			// ASK FOR PERMISSION TO WEB NOTIFICATION
			if ( window.Notification ){
				window.Notification.requestPermission();
			}
		}
	}


	/**
	 * focusLastMessageChat - Focus the last message in the chat component
	 *
	 * @return {type}  description
	 */
	focusLastMessageChat( ) {
		const chatHistory = document.getElementById(
			Utils.createUniqueIdSelector('chat-history')
		);
		if ( chatHistory ) {
			chatHistory.scrollTop = chatHistory.scrollHeight;
			// $(chatHistory).mCustomScrollbar(
			// 		"scrollTo","bottom",
			// 		{ scrollInertia:0 }
			// );
		}
	}

	/**
	 * _buildDateEntry - BUild date entry on chat component
	 *
	 * @param	{string} timestamp 		String date on the title
	 * @return {DOM}						Date Entry Component
	 */
	buildDateEntry( timestamp ) {
		let text = '';
		if ( !timestamp ) {
			text = DEFAULT_DATE_ENTRY;
			timestamp = new Date().getTime();
		} else {
			const date = new Date(timestamp);
			if ( Utils.isToday(date) ) {
				text = DEFAULT_DATE_ENTRY;
			} else {
				text = Utils.shortDate(date);
			}
		}

		const li = document.createElement('li');
		li.setAttribute('class', 'mar-btm date-entry');
		li.setAttribute('id', Utils.createUniqueIdSelector('date-entry-' + timestamp));
		li.setAttribute('date', timestamp);

		const div = document.createElement('div');
		div.setAttribute('class', 'hr');

		const span = document.createElement('span');
		span.setAttribute('class', 'hr-title');

		const textNode = document.createTextNode(text);

		span.appendChild(textNode);
		div.appendChild(span);
		li.appendChild(div);

		const chatList = document.getElementById(
			Utils.createUniqueIdSelector('chat-list')
		);
		chatList.appendChild(li);
	}


	/**
	 * checkLastDateEntry - description
	 *
	 * @return {type}  description
	 */
	checkLastDateEntry() {
		const dateEntries = document.getElementsByClassName("rebelchat-date-entry");
		if ( dateEntries && dateEntries.length ) {
			const entry = dateEntries[dateEntries.length - 1];
			const lastTimestamp = parseInt(entry.getAttribute('date'));
			const dateEntry = new Date(lastTimestamp);
			const today = new Date();
			const diff = Utils.diffDates(today, dateEntry);
			if ( diff > 0 ){
				//TODAY DATE ENTRY
				this.buildDateEntry();
				//CHANGE LAST DATE ENTRY
				var text	= shortDate(dateEntry);
				var span = entry.getElementsByClassName('hr-title')[0];
				span.innerHTML = text;
			}
		}
	}

	serverMessagesEvent() {
		FirebaseInstance.newServeMessage(data => {
			const message = data.val();
			//GET ONLY THE SERVER MESSAGES
			if ( message && message['source'] == 'SERVER' ){
				this.checkLastDateEntry();
				this.buildServerMessage(
					message['message'],
					message['createdAt'],
					message['read'],
					false,
					data.key
				);
			}
		});
	}


	/**
	 * isLastMessageFromClient - description
	 *
	 * @return {type}  description
	 */
	isLastMessageFromClient() {
		return this.LAST_MESSAGE_TYPE == 'CLIENT';
	}


	/**
	 * isLastMessageFromServer - description
	 *
	 * @return {type}  description
	 */
	isLastMessageFromServer() {
		return this.LAST_MESSAGE_TYPE == 'SERVER';
	}


	/**
	 * saveUserInformation - Save user information the first time!
	 *
	 * @param  {object} user User Object
	 * @return {promise}
	 */
	saveUserInformation( user ) {
		if ( user ){
			this.USER = user;
			//SAVE CLIENT INFO ON DATABASE
			FirebaseInstance.saveClientInfo(user).then(function(){
				console.log('User information saved');
			}).catch(function(error){
				console.error('Error trying to save User\'s info', error);
			})
		}
	}

}

document.addEventListener("DOMContentLoaded", function(event) {
	const chat = new RebelChat({
		el: 'chat-cmp-container'
	});
});
