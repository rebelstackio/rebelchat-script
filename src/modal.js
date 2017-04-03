//<div class="modal-backdrop fade in"></div>
// <div id="my-modal" class="modal fade in" style="
//		 display: block;
// ">
//		 <div class="modal-dialog">
//				 <div class="modal-content">
//						 <div class="modal-header">
//								 <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
//	 <span aria-hidden="true">×</span>
// </button>
//								 <h4 class="modal-title">Chat Settings</h4>
//						 </div>
//						 <div class="modal-body">
//								 Hello World!
//						 </div>
//				 </div>
//		 </div>
// </div>
import Utils from './util';

export default class RebelModal {

	constructor( id ) {
		this.id = id;
		this.backdrop = null;
		this.modalContainer = null;
		this.title = null;
		this.modalBody = null;
	}

 	/**
 	 * buildModalStructure - Build the basic structure for a modal
 	 */
 	buildModalStructure() {
		const backdrop = document.createElement('div');
		backdrop.setAttribute('class', 'rebelchat-modal-backdrop rebelchat-fade rebelchat-in rebelchat-hide');
		backdrop.setAttribute('id',
			Utils.createUniqueIdSelector(this.id + '-rebelchat-modal-backdrop')
		);
		this.backdrop = backdrop;

		//CONTAINER
		const modalContainer = document.createElement('div');
		modalContainer.setAttribute('class', 'rebelchat-modal rebelchat-fade rebelchat-in rebelchat-hide');
		modalContainer.setAttribute('id',
			Utils.createUniqueIdSelector(this.id + '-rebelchat-modal')
		);

		//DIALOG
		const modalDialog = document.createElement('div');
		modalDialog.setAttribute('class', 'rebelchat-modal-dialog');

		//CONTENT
		const modalContent = document.createElement('div');
		modalContent.setAttribute('class', 'rebelchat-modal-content');

		//HEADER
		const modalHeader = document.createElement('div');
		modalHeader.setAttribute('class', 'rebelchat-modal-header');

		const modalTitle = document.createElement('h4');
		modalTitle.setAttribute('class', 'rebelchat-modal-title');
		modalTitle.setAttribute('id',
			Utils.createUniqueIdSelector(this.id + 'rebelchat-modal-title')
		);
		this.title = modalTitle;

		const modalHeaderButton = document.createElement('button');
		modalHeaderButton.setAttribute('class', 'rebelchat-modal-close');

		modalHeaderButton.addEventListener('click', this.hide.bind(this));

		const span = document.createElement('span');
		const text = document.createTextNode('×');
		span.appendChild(text);

		modalHeaderButton.appendChild(span);

		modalHeader.appendChild(modalHeaderButton);
		modalHeader.appendChild(modalTitle);

		//BODY
		const modalBody = document.createElement('div');
		modalBody.setAttribute('class', 'rebelchat-modal-body');
		modalBody.setAttribute('id',
			Utils.createUniqueIdSelector(this.id + 'rebelchat-modal-body')
		);
		this.modalBody = modalBody;

		//FOOTER
		const modalFooter = document.createElement('div');
		modalFooter.setAttribute('class', 'rebelchat-modal-footer');
		modalFooter.setAttribute('id',
			Utils.createUniqueIdSelector(this.id + 'rebelchat-modal-footer')
		);
		const footerButton = document.createElement('button');
		footerButton.setAttribute('class', 'rebelchat-btn rebelchat-btn-main');
		const buttonText = document.createTextNode('Save');
		footerButton.appendChild(buttonText);
		modalFooter.appendChild(footerButton);

		footerButton.addEventListener('click', this.hide.bind(this));


		modalContent.appendChild(modalHeader);
		modalContent.appendChild(modalBody);
		modalContent.appendChild(modalFooter);
		modalDialog.appendChild(modalContent);
		modalContainer.appendChild(modalDialog);

		this.modalContainer = modalContainer;
	}


	/**
	 * buildBlockTitle - Build a block title
	 *
	 * @param  {string} title Block title
	 * @return {DOM}       		Block title DOM element
	 */
	buildBlockTitle( title ) {
		const notificationTitle = document.createElement('p');
		notificationTitle.setAttribute('class', 'rebelchat-help-block');
		const ntfText = document.createTextNode(title);
		notificationTitle.appendChild(ntfText)
		return notificationTitle;
	}


	/**
	 * buildChatSettingsModal - Build the chat settings modal
	 *
	 * @param  {string} title Modal title
	 * @param  {DOM} el    DOM element where the modal will be
	 */
	buildChatSettingsModal( title, el ) {
		this.buildModalStructure();
		const element = document.getElementById(el);
		this.title.innerText = title;
		element.appendChild(this.backdrop);
		element.appendChild(this.modalContainer);

		//NOTIFICATIONS
		const notificationTitle = this.buildBlockTitle('Notifications');
		this.modalBody.appendChild(notificationTitle);

		const soundsDiv = document.createElement('div');
		soundsDiv.setAttribute('class', 'rebelchat-checkbox');
		const soundsLabel = document.createElement('label');
		soundsDiv.setAttribute('class', 'rebelchat-checkbox');
		const soundsCheckbox = document.createElement('input');
		soundsCheckbox.setAttribute('type', 'checkbox')
		const textSound = document.createTextNode('Enable sounds notifications');

		soundsLabel.appendChild(soundsCheckbox);
		soundsLabel.appendChild(textSound);
		soundsDiv.appendChild(soundsLabel);
		this.modalBody.appendChild(soundsDiv);

		//ENABLE SOUNDS CHECKBOX
		const webNotificationDiv = document.createElement('div');
		webNotificationDiv.setAttribute('class', 'rebelchat-checkbox');
		const webLabel = document.createElement('label');
		webNotificationDiv.setAttribute('class', 'rebelchat-checkbox');
		const webCheckbox = document.createElement('input');
		webCheckbox.setAttribute('type', 'checkbox')
		const textWeb = document.createTextNode('Enable web notifications');

		webLabel.appendChild(webCheckbox);
		webLabel.appendChild(textWeb);
		webNotificationDiv.appendChild(webLabel);
		this.modalBody.appendChild(webNotificationDiv);

		//SEND HISTORY TO EMAIL
		const historyDiv = document.createElement('div');
		const historyTitle = this.buildBlockTitle('History');
		this.modalBody.appendChild(historyTitle);

		const inputEmail = document.createElement('input');
		inputEmail.setAttribute(
			'id',
			Utils.createUniqueIdSelector(this.id + 'rebelchat-history-email')
		)
		inputEmail.setAttribute('class', 'rebelchat-modal-form-control');
		inputEmail.setAttribute('type', 'email');
		inputEmail.setAttribute('placeholder', 'Email');


		const emailButton = document.createElement('button');
		emailButton.setAttribute('class', 'rebelchat-btn rebelchat-btn-main');
		const buttonText = document.createTextNode('Send History');
		emailButton.appendChild(buttonText);

		historyDiv.appendChild(inputEmail);
		historyDiv.appendChild(emailButton);
		this.modalBody.appendChild(historyDiv);

		//AVATAR SELECTION
		const avatarTitle = this.buildBlockTitle('Avatar');
		this.modalBody.appendChild(avatarTitle);
	}

	/**
	 * hide - Hides the modal
	 */
	hide() {
		this.modalContainer.classList.remove('rebelchat-show');
		this.modalContainer.classList.add('rebelchat-hide');
		this.backdrop.classList.remove('rebelchat-show');
		this.backdrop.classList.add('rebelchat-hide');
		Utils.animate(this.modalContainer, 'animated', 'fadeOut');
	}

	/**
	 * show - Shows the modal
	 */
	show() {
		this.modalContainer.classList.remove('rebelchat-hide');
		this.modalContainer.classList.add('rebelchat-show');
		this.backdrop.classList.remove('rebelchat-hide');
		this.backdrop.classList.add('rebelchat-show');
		Utils.animate(this.modalContainer, 'animated', 'fadeIn');
	}
}
