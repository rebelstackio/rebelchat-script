import FirebaseInstance from './firebase';
import Utils from './util';
import css from './assets/css/__STYLE__';
import animate from './assets/css/animate.min.css';
import icons from './assets/css/icons.css';
import Modal from './modal';
import CONFIG from './defaultProps';
import User from './models/user';

const AVATAR_CLIENT_URL = 'https://firebasestorage.googleapis.com/v0/b/rebelchat-53a46.appspot.com/o/avatars%2Fman1.svg?alt=media&token=0b218bc7-e7fb-4b88-87b9-56a41dfaa0fa';

const AVATAR_SERVER_URL = 'https://firebasestorage.googleapis.com/v0/b/rebelchat-53a46.appspot.com/o/avatars%2Foperator.svg?alt=media&token=41929fee-6acb-4198-a36b-ee4a6836cc66';

const SEND_BUTTON_URL = 'https://firebasestorage.googleapis.com/v0/b/rebelchat-53a46.appspot.com/o/assets%2Fimg%2Fic_send_white_24px.svg?alt=media&token=737564ef-ca2d-408e-993c-052bb37bb435';

const CONFIG_BUTTON_URL = 'https://firebasestorage.googleapis.com/v0/b/rebelchat-53a46.appspot.com/o/assets%2Fimg%2Fgear.png?alt=media&token=b1457888-c5a9-42d4-a4e0-d0c514e50950';

const NEW_MESSAGE_SOUND = 'https://firebasestorage.googleapis.com/v0/b/rebelchat-53a46.appspot.com/o/assets%2Faudio%2Fyour-turn.mp3?alt=media&token=d511dbd6-98da-4d47-a6c0-f7c75b2b3327';

const TRUNCATED_LENGTH = 40;

const SEND_MESSAGE_KEY = 13;

class RebelChat {

	constructor( config ){
		User.getSettings().then( userSettings => {
			const _config = this.validateConfig(config);
			this.id = Utils.generateUniqueId();
			this.config = Object.assign(CONFIG, _config, userSettings);
			this.loadStyles();
			FirebaseInstance.init();
			this.newDateEntryFlag = false;
			this.newMessagesFlag = false;
			this.pageTitle = document.title;
			this.newMessagesCount = 0;
			this.init();
		}).catch ( error =>{
			// TODO: ADD EN ERROR RO NOTIFY THE USER( DEVELOPER )
			console.log('--->', error);
		});
	}


	/**
	 * validateConfig - Validate config object
	 *
	 * @param  {object} config Config object
	 * @return {object}        Validated config object
	 */
	validateConfig( config ) {
		if ( config['el'] ) {
			if ( config['el'][0] === '#') {
				config['el'] = config['el'].slice(1);
			} else {
				throw new Error('The \'el\' property should be a ID selector')
			}
		}
		return config;
	}

	/**
	 * loadStyles - description
	 *
	 * @return {type}  description
	 */
	loadStyles() {
		//REPLACE BG COLOR
		let _css = css.replace(/___BGCOLOR___/g, this.config['bgColor']);
		_css = _css.replace(/__HRCOLOR__/g, this.config['hrColor']);
		_css = _css.replace(/__RESPONSEMSGBOXCOLOR__/g, this.config['responseMsgBoxColor']);
		_css = _css.replace(/__RESPONSEMSGCOLOR__/g, this.config['responseMsgColor']);
		_css = _css.replace(/__MSGCOLOR__/g, this.config['msgColor']);
		_css = _css.replace(/__MSGBOXCOLOR__/g, this.config['msgBoxColor']);
		_css = _css.replace(/__INPUTCHATCOLOR__/g, this.config['inputChatColor']);
		_css = _css.replace(/__INPUTCHATBORDERCOLOR__/g, this.config['inputChatBorderColor']);

		const head = document.head || document.getElementsByTagName('head')[0];
		const style = document.createElement('style');
		style.type = 'text/css';
		if (style.styleSheet){
			style.styleSheet.cssText = _css;
		} else {
			style.appendChild(document.createTextNode(_css));
		}

		const animateStyle = document.createElement('style');
		animateStyle.type = 'text/css';
		if (animateStyle.styleSheet){
			animateStyle.styleSheet.cssText = animate;
		} else {
			animateStyle.appendChild(document.createTextNode(animate));
		}

		const iconsStyle = document.createElement('style');
		let _icons = icons.replace(/___BGCOLOR___/g, this.config['bgColor']);
		iconsStyle.type = 'text/css';
		if (iconsStyle.styleSheet){
			iconsStyle.styleSheet.cssText = _icons;
		} else {
			iconsStyle.appendChild(document.createTextNode(_icons));
		}

		head.appendChild(style);
		head.appendChild(animateStyle);
		head.appendChild(iconsStyle);
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
			this.newMessagesFlag = true;
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

	buildChatError() {

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
				//CALCULATE DAYS AGO
				let daysDiff = Utils.diffDates(tmpDate, lastDate);
				if ( daysDiff > 0 ) {
					//NEW MESSAGE DATE
					this.buildDateEntry(message['createdAt']);
					//THE NEW MESSAGE REQUIRES A NEW BOX CONTAINER
					this.newDateEntryFlag = true;
				} else {
					//THE NEW MESSAGE CAN USE THE LAST BOX CONTAINER
					this.newDateEntryFlag = false;
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
		chatDiv.setAttribute('class', 'rebelchat-container');
		chatDiv.setAttribute('id', Utils.createUniqueIdSelector('chat-container'));

		//MODAL


		//CONFIG BUTTOM
		const config = document.createElement('a');
		config.setAttribute('class', 'rebelchat-config');
		config.setAttribute('id', 'config');
		config.setAttribute('href', '#');
		config.setAttribute('title', 'Chat Settings');
		const modal = new Modal('settings', this.config);
		config.addEventListener('click', (event) => {
			modal.buildChatSettingsModal('Chat Settings', this.config['el']);
			modal.show();
		});

		const configImg = document.createElement('div');
		configImg.setAttribute('class', 'gear-rotate');
		configImg.setAttribute('alt', 'Chat Settings');
		configImg.setAttribute(
			'src',
			CONFIG_BUTTON_URL
		);

		config.appendChild(configImg);

		const chatHistoryDiv = document.createElement('div');
		chatHistoryDiv.setAttribute('class', 'rebelchat-nano has-scrollbar');
		chatHistoryDiv.setAttribute('id', Utils.createUniqueIdSelector('chat-history'));

		const chatHistoryContent = document.createElement('div');
		chatHistoryContent.setAttribute('class', 'rebelchat-nano-content rebelchat-pad-all');
		chatHistoryContent.setAttribute('id', Utils.createUniqueIdSelector('chat-history-content'));
		chatHistoryContent.setAttribute('tabindex', '0');

		const chatUl = document.createElement('ul');
		chatUl.setAttribute('class', 'rebelchat-list-unstyled rebelchat-media-block');
		chatUl.setAttribute('id', Utils.createUniqueIdSelector('chat-list'));

		const messageZone = this.buildMessageZone();

		chatHistoryContent.appendChild(chatUl);
		chatHistoryDiv.appendChild(chatHistoryContent);
		chatDiv.appendChild(config);
		chatDiv.appendChild(chatHistoryDiv);
		chatDiv.appendChild(messageZone);

		form.innerHTML = "";

		form.appendChild(chatDiv);

		//SEND CLIENT MESSAGE
		if ( message ){
			this.sendClientMessage(message);
		}

		//ADD ANIMATION
		Utils.animate(chatDiv, 'animated', 'fadeIn');
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
			const messages = chatList.getElementsByClassName('rebelchat-mar-btm');
			const  lastMessage = messages[messages.length - 1];
			if ( id ) {
				lastMessage.setAttribute('id', 'message-container-' + id);
			}

			if ( createdAt ) {
				lastMessage.setAttribute('createdAt', createdAt);
			}

			const speech = lastMessage.getElementsByClassName('rebelchat-speech')[0];

			const time = Utils.buildDateMessageFormat(createdAt);

			const textContainer = document.createElement('p');
			textContainer.setAttribute('class', "rebelchat-msg-right");
			textContainer.setAttribute('title', time);

			const _message = document.createTextNode(message);
			textContainer.appendChild(_message);
			speech.appendChild(textContainer);

			Utils.animate(textContainer,  'animated', 'fadeIn');

			//FOCUS LAST MESSAGE
			this.focusLastMessageChat();

			return lastMessage;
		} else {
			const messageExists = document.getElementById('message-container-' + id);

			if ( !messageExists ) {
				const messageContainer = document.createElement('li');
				messageContainer.setAttribute('class', 'rebelchat-mar-btm rebelchat-server-message');
				if ( id ) {
					messageContainer.setAttribute('id', 'message-container-' + id);
				}

				if ( createdAt ) {
					messageContainer.setAttribute('createdAt', createdAt);
				}

				const avatarZone = document.createElement('div');
				avatarZone.setAttribute('class', 'rebelchat-media-right');

				const avatar = document.createElement('img');
				avatar.setAttribute('class', 'rebelchat-img rebelchat-img-sm');
				avatar.setAttribute('alt', 'Client');
				avatar.setAttribute(
					'src',
					AVATAR_SERVER_URL
				);

				const messageTextContainer = document.createElement('div');
				messageTextContainer.setAttribute('class', 'rebelchat-media-body rebelchat-pad-hor rebelchat-speech-right');

				const speech = document.createElement('div');
				speech.setAttribute('class', 'rebelchat-speech');

				const linkHeader = document.createElement('a');
				linkHeader.setAttribute('class', "rebelchat-media-heading");

				const clientName = document.createElement('b');
				clientName.setAttribute('class', 'rebelchat-chat-name');

				const name = document.createTextNode(
					this.config['serverContactLabel']
				);

				const time = Utils.buildDateMessageFormat(createdAt);
				const domTime = document.createTextNode(time);

				const textContainer = document.createElement('p');
				textContainer.setAttribute('class', "rebelchat-msg-right");
				textContainer.setAttribute('title', time);

				const _message = document.createTextNode(message);

				const span = document.createElement('span');
				// span.setAttribute('style', 'float:right');
				span.setAttribute('class', 'rebelchat-timelabel');
				span.appendChild(domTime);

				textContainer.appendChild(_message);

				clientName.appendChild(name);
				linkHeader.appendChild(clientName);
				linkHeader.appendChild(span);

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

					Utils.animate(messageContainer,  'animated', 'fadeIn');

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
			const messages = chatList.getElementsByClassName('client-message');
			const lastMessage = messages[messages.length - 1];
			const speech = lastMessage.getElementsByClassName('rebelchat-speech')[0];

			const time = Utils.buildDateMessageFormat(createdAt);

			if ( id ) {
				lastMessage.setAttribute('id', 'message-container-' + id);
			}

			if ( createdAt ) {
				lastMessage.setAttribute('createdAt', createdAt);
			}

			const textContainer = document.createElement('p');
			textContainer.setAttribute('class', "rebelchat-msg-left");
			textContainer.setAttribute('title', time);

			//ADD STYLE WHEN
			if ( sending ) {
				// textContainer.setAttribute('style' , 'background-color: #97c2c6;');
				// setTimeout(function(){
				// 	textContainer.setAttribute('style' , '');
				// }, 2000);
			}

			const _message = document.createTextNode(message);
			textContainer.appendChild(_message);
			speech.appendChild(textContainer);

			Utils.animate(textContainer,  'animated', 'fadeIn');

			//FOCUS LAST MESSAGE
			this.focusLastMessageChat();

			return lastMessage;
		} else {
			//LAST MESSAGE IS FROM THE SERVER SO THE MESSAGE REQUIRES A NEW BOX
			const messageContainer = document.createElement('li');

			messageContainer.setAttribute('class', 'rebelchat-mar-btm client-message');

			if ( id ) {
				messageContainer.setAttribute('id', 'message-container-' + id);
			}

			if ( createdAt ) {
				messageContainer.setAttribute('createdAt', createdAt)
			}

			const avatarZone = document.createElement('div');
			avatarZone.setAttribute('class', 'rebelchat-media-left');

			const avatar = document.createElement('img');
			avatar.setAttribute('class', 'rebelchat-img rebelchat-img-sm');
			avatar.setAttribute('alt', 'Client');
			avatar.setAttribute(
				'src',
				AVATAR_CLIENT_URL
			);

			const messageTextContainer = document.createElement('div');
			messageTextContainer.setAttribute('class', 'rebelchat-media-body rebelchat-pad-hor');

			const speech = document.createElement('div');
			speech.setAttribute('class', 'rebelchat-speech');

			const linkHeader = document.createElement('a');
			linkHeader.setAttribute('class', "rebelchat-media-heading");

			const clientName = document.createElement('b');
			clientName.setAttribute('class', 'rebelchat-chat-name');

			const name = document.createTextNode(
				this.config['clientContactLabel']
			);

			const time = Utils.buildDateMessageFormat(createdAt);
			const domTime = document.createTextNode(time);

			const textContainer = document.createElement('p');
			textContainer.setAttribute('class', "rebelchat-msg-left");

			const _message = document.createTextNode(message);

			const span = document.createElement('span');
			// span.setAttribute('style', 'float:right');
			span.setAttribute('class', 'rebelchat-timelabel');
			span.appendChild(domTime);

			textContainer.appendChild(_message);
			textContainer.setAttribute('title', time);

			clientName.appendChild(name);
			linkHeader.appendChild(clientName);
			linkHeader.appendChild(span);

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

			Utils.animate(messageContainer, 'animated', 'fadeIn');

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

		// const row = document.createElement('div')
		// row.setAttribute('class', 'row');

		const row = document.createElement('div')
		row.setAttribute('class', 'rebelchat-row');

		const group = document.createElement('div')
		group.setAttribute('class', 'rebelchat-group');

		const message = document.createElement('input');
		message.setAttribute('class', 'rebelchat rebelchat-material');
		message.setAttribute('type', 'text');
		message.setAttribute('placeholder', this.config['chatInputPlaceholder']);
		message.setAttribute('id', messageSelector);

		const highlight = document.createElement('span');
		highlight.setAttribute('class', 'rebelchat-highlight');

		const bar = document.createElement('span');
		bar.setAttribute('class', 'rebelchat-bar');

		const link = document.createElement('a')
		link.setAttribute('class', 'rebelchat-send-button')

		var sendIcon = document.createElement('div');
		sendIcon.setAttribute('class',"circle active" );
		//image.setAttribute('src', SEND_BUTTON_URL);
		sendIcon.setAttribute('alt',"Send");
		sendIcon.setAttribute('title',"Send");
		sendIcon.innerHTML = '<span class="burger triangle"></span>';

		link.appendChild(sendIcon);

		group.appendChild(message);
		group.appendChild(highlight);
		group.appendChild(bar);
		row.appendChild(group);
		row.appendChild(link);

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

		//FOCUS TEXT INPUT
		message.addEventListener('focus', (event) => {
			this.newMessagesCount = 0;
			this.changeHeadTitleByMessages();
		});

		link.addEventListener('click', (event) => {
			event.preventDefault();
			const messageZone = document.getElementById(messageSelector);
			const message = messageZone.value;
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

		//NAME INPUT
		let input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('class', 'rebelchat rebelchat-form-control');
		input.setAttribute('id', Utils.createUniqueIdSelector('rebel-name'));
		input.setAttribute('name', 'name');
		input.setAttribute('placeholder', 'NAME');
		input.setAttribute('required', 'required');

		//EMAIL
		let email = document.createElement('input');
		email.setAttribute('type', 'email');
		email.setAttribute('class', 'rebelchat rebelchat-form-control');
		email.setAttribute('id', Utils.createUniqueIdSelector('rebel-email'));
		email.setAttribute('name', 'email');
		email.setAttribute('placeholder', 'E-MAIL');
		email.setAttribute('required', 'required');

		//MESSAGE
		let message = document.createElement('textarea');
		message.setAttribute('class', 'rebelchat rebelchat-form-control');
		message.setAttribute('id', Utils.createUniqueIdSelector('rebel-message'));
		message.setAttribute('name', 'message');
		message.setAttribute('placeholder', 'MESSAGE');
		message.setAttribute('rows', '10');
		message.setAttribute('required', 'required');

		// BUTTON
		let button = document.createElement('button');
		button.setAttribute('class', 'rebelchat rebelchat-btn rebelchat-btn-main rebelchat-btn-lg');
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

		// HTML ->
		// <form class="contact-form" role="form" action="https://secure.mailjol.net/allforms/u/a5b1c394.php">
		// 	<input type="text" class="rebelchat-form-control" id="Name" name="Name" placeholder="Name" required>
		// 	<input type="email" class="rebelchat-form-control" id="Email" name="Email" placeholder="Email" required>
		// 	<textarea id="Message" name="Message" placeholder="Message" class="rebelchat-form-control" rows="10"></textarea>
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
			// if ( window.Notification ){
			// 	window.Notification.requestPermission();
			// }
		}
	}


	/**
	 * focusLastMessageChat - Focus the last message in the chat component
	 */
	focusLastMessageChat( ) {
		const chatHistoryContent = document.getElementById(
			Utils.createUniqueIdSelector('chat-history-content')
		);
		if ( chatHistoryContent ) {
			chatHistoryContent.scrollTop = chatHistoryContent.scrollHeight;
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
			text = this.config['dateEntryLabel'];
			timestamp = new Date().getTime();
		} else {
			const date = new Date(timestamp);
			if ( Utils.isToday(date) ) {
				text = this.config['dateEntryLabel'];
			} else {
				text = Utils.shortDate(date);
			}
		}

		const li = document.createElement('li');
		li.setAttribute('class', 'rebelchat-mar-btm date-entry');
		li.setAttribute('id', Utils.createUniqueIdSelector('date-entry-' + timestamp));
		li.setAttribute('date', timestamp);

		const div = document.createElement('div');
		div.setAttribute('class', 'rebelchat-hr');

		const span = document.createElement('span');
		span.setAttribute('class', 'rebelchat-hr-title');

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
	 * checkLastDateEntry - Check current date with the last date entry
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
				const text	= shortDate(dateEntry);
				const span = entry.getElementsByClassName('rebelchat-hr-title')[0];
				span.innerHTML = text;
			}
		}
	}

	/**
	 * serverMessagesEvent - New server messages event
	 */
	serverMessagesEvent() {
		FirebaseInstance.newServeMessage(data => {
			const message = data.val();
			//GET ONLY THE SERVER MESSAGES
			if ( message && message['source'] == 'SERVER' ){
				this.checkLastDateEntry();

				//FIRE NEW MESSAGES ACTIONS
				this.fireNewMessagesActions()

				//BUILD MESSAGE
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
	 * fireNewMessagesActions - Fire actions when a new server's message arrive
	 */
	fireNewMessagesActions() {

		//AUDIO NOTIFICACION
		if ( this.newMessagesFlag && this.config['audioNotification']) {
			if ( Audio ) {
				const audio = new Audio([NEW_MESSAGE_SOUND]);
				if ( audio ) {
					audio.play();
				}
			}
		}

		//CHANGE HEAD TITLE
		if ( this.newMessagesFlag ) {
			this.newMessagesCount ++;
			this.changeHeadTitleByMessages();
		}
	}


	/**
	 * changeHeadTitleByMessages - Change page's title base on the new messages
	 */
	changeHeadTitleByMessages() {
		if ( this.config['changePageTitle'] ) {
			if ( this.newMessagesCount > 0 ) {
				document.title = '(' + this.newMessagesCount + ') ' + this.pageTitle;
			} else {
				document.title = this.pageTitle;
			}
		}
	}


	/**
	 * isLastMessageFromClient - Check the last message is from the client and is the same date
	 *
	 * @return {bool}
	 */
	isLastMessageFromClient() {
		return this.LAST_MESSAGE_TYPE == 'CLIENT' && !this.newDateEntryFlag;
	}


	/**
	 * isLastMessageFromServer - Check the last message is from the server and is the same date
	 *
	 * @return {bool}
	 */
	isLastMessageFromServer() {
		return this.LAST_MESSAGE_TYPE == 'SERVER' && !this.newDateEntryFlag;
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
//MAKE REBELCHAT AVAILABLE
window.RebelChat = RebelChat;
