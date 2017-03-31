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

	constructor(id){
		this.id = id;
		this.backdrop = null;
		this.modalContainer = null;
		this.title = null;
		this.modalBody = null;
	}

 	buildModalStructure() {
		const backdrop = document.createElement('div');
		backdrop.setAttribute('class', 'rebelchat-modal-backdrop rebelchat-fade rebelchat-in rebelchat-hidde');
		backdrop.setAttribute('id',
			Utils.createUniqueIdSelector(this.id + '-rebelchat-modal-backdrop')
		);
		this.backdrop = backdrop;

		//CONTAINER
		const modalContainer = document.createElement('div');
		modalContainer.setAttribute('class', 'rebelchat-modal rebelchat-fade rebelchat-in rebelchat-hidde');
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


		modalContent.appendChild(modalHeader);
		modalContent.appendChild(modalBody);
		modalDialog.appendChild(modalContent);
		modalContainer.appendChild(modalDialog);

		this.modalContainer = modalContainer;
	}

	buildChatSettingsModal( title, el ) {
		this.buildModalStructure();
		const element = document.getElementById(el);
		this.title.innerText = title;
		element.appendChild(this.backdrop);
		element.appendChild(this.modalContainer);
		this.modalBody.innerHTML="<div>this is the content</div>"
	}

	hide() {
		this.modalContainer.classList.remove('rebelchat-show');
		this.modalContainer.classList.add('rebelchat-hidde');
		this.backdrop.classList.remove('rebelchat-show');
		this.backdrop.classList.add('rebelchat-hidde');
	}

	show() {
		this.modalContainer.classList.remove('rebelchat-hidde');
		this.modalContainer.classList.add('rebelchat-show');
		this.backdrop.classList.remove('rebelchat-hidde');
		this.backdrop.classList.add('rebelchat-show');
		Utils.animate(this.modalContainer, 'animated', 'fadeIn');
	}
}
