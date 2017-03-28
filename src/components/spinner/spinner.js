
const NAME = "rebelchat-spinner";


/**
 * Spinner component
 *
 * html ->
		 <div class="wrap">
			 <div class="loading">
				 <div class="bounceball"></div>
				 <div class="text">Loading Chat App</div>
			 </div>
		 </div>
 */
export default class Spinner extends HTMLElement {

	constructor() {
		super();
	}

	createdCallback() {

		const wrap = document.createElement('div');
		wrap.setAttribute('class', 'rebelchat-wrap');

		const loading = document.createElement('div');
		loading.setAttribute('class', 'rebelchat-loading');

		const bounceball = document.createElement('div');
		bounceball.setAttribute('class', 'rebelchat-bounceball');

		const text = document.createElement('div');
		text.setAttribute('class', 'rebelchat-text');

		const nodeText = document.createTextNode('Loading Chat App');

		text.appendChild(nodeText);

		loading.appendChild(text);
		loading.appendChild(bounceball);
		wrap.appendChild(loading);

		this.appendChild(wrap);
	}

}

document.registerElement(NAME, Spinner);
