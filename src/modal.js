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
import FirebaseInstance from './firebase';

export default class RebelModal {

	constructor( id , userSettings) {
		this.id = id;
		this.backdrop = null;
		this.modalContainer = null;
		this.title = null;
		this.modalBody = null;
		this.userSettings = userSettings;
	}

 	/**
 	 * buildModalStructure - Build the basic structure for a modal
 	 */
 	buildModalStructure(cb) {
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

		const modalTitle = document.createElement('div');
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

		cb(modalFooter);

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
	 * buildChatRecoveryModal
	 * @param {string} title Modal title
	 * @param {DOM} el DOM element
	*/
	buildChatRecoveryModal( title, el ){
		if(!this.modalContainer){
			var that = this;
			this.buildModalStructure(function(modalFooter){
				const yesButton = document.createElement('button');
				yesButton.setAttribute('class', 'rebelchat-btn rebelchat-btn-main');
				const buttonText = document.createTextNode('Yes, send recovery code');
				yesButton.appendChild(buttonText);
				const noButton = document.createElement('button');
				noButton.setAttribute('class', 'rebelchat-btn rebelchat-btn-main rebelchat-btn-no');
				const buttonText2 = document.createTextNode('No');
				noButton.appendChild(buttonText2);
				noButton.addEventListener('click',function(){
					that.hide();
				});
				yesButton.addEventListener('click',function(){
					const block_div = document.createElement("div");
					block_div.setAttribute("id",
					Utils.createUniqueIdSelector('-rebelchat-block-div'));
					block_div.setAttribute("class","rebelchat-block-div");
					block_div.addEventListener("click",function(e){
						e.stopPropagation();
					});
					document.getElementsByTagName('body')[0].appendChild(block_div);
					that.hide();
				});
				modalFooter.appendChild(yesButton);
				modalFooter.appendChild(noButton);
			});
		}
		const element = document.getElementById(el);
		this.title.innerText = title;
		while(this.modalBody.hasChildNodes()){
			this.modalBody.removeChild(this.modalBody.lastChild);
		}
		element.appendChild(this.backdrop);
		element.appendChild(this.modalContainer);

		const question = document.createElement("div");
		question.setAttribute("class","rebelchat-label-recovery");
		question.innerHTML = "This email has already been used, would you like to recover this session?";
		this.modalBody.appendChild(question);
	}

	/**
	 * buildChatSettingsModal - Build the chat settings modal
	 *
	 * @param  {string} title Modal title
	 * @param  {DOM} el    DOM element where the modal will be
	 */
	buildChatSettingsModal( title, el ) {
		if(!this.modalContainer){
			var that = this;
			var cb = function(modalFooter){
				const footerButton = document.createElement('button');
				footerButton.setAttribute('class', 'rebelchat-btn rebelchat-btn-main');
				const buttonText = document.createTextNode('Save');
				footerButton.appendChild(buttonText);
				modalFooter.appendChild(footerButton);
	
				footerButton.addEventListener('click', function(){
					var settings = {
						audio: document.getElementById("rebelchat-audio").checked? 1:0,
						web: document.getElementById("rebelchat-webNoti").checked? 1:0
					};
					FirebaseInstance.setChatSettings( settings ).then(snap => {
						that.hide();
					}).catch(error =>{
						//TODO HANDLE ERROR WHEN THERE IS AN ERROR TRYING TO GET THE MESSAGES
						console.log(error);
					});
				});
			};
			this.buildModalStructure(cb);
		}
		const element = document.getElementById(el);
		this.title.innerText = title;
		while(this.modalBody.hasChildNodes()){
			this.modalBody.removeChild(this.modalBody.lastChild);
		}
		element.appendChild(this.backdrop);
		element.appendChild(this.modalContainer);

		const soundsDiv = document.createElement('div');
		soundsDiv.setAttribute('class','exp');
		soundsDiv.innerHTML = `<div class="checkbox"><form><div>
			 <input type="checkbox" id="rebelchat-audio" name="check" value="" ${this.userSettings['audioNotification'] ? 'checked':''}/>
			 <label for="rebelchat-audio">
			   <span></span>Enable sounds notifications
			 </label></div></form></div>`;
		this.modalBody.appendChild(soundsDiv);

		//ENABLE WEB CHECKBOX
		const webNotificationDiv = document.createElement('div');
		webNotificationDiv.setAttribute('class', 'exp');
		webNotificationDiv.innerHTML = `<div class="checkbox"><form><div>
		<input type="checkbox" id="rebelchat-webNoti" name="check1" value="" ${this.userSettings['webNotification'] ? 'checked':''}/>
		<label for="rebelchat-webNoti">
		  <span></span>Enable web notifications
		</label></div></form></div>`;
		this.modalBody.appendChild(webNotificationDiv);

		const inputEmail = document.createElement('input');
		inputEmail.setAttribute(
			'id',
			Utils.createUniqueIdSelector(this.id + 'rebelchat-history-email')
		)
		inputEmail.setAttribute('class', 'rebelchat-modal-form-control');
		inputEmail.setAttribute('type', 'email');
		inputEmail.setAttribute('placeholder', 'Email');
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
