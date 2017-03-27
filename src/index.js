import database from "./firebase";
import css from './assets/style.css';

export default class RebelChat {
	constructor(config){
		console.log('Chat component builded', database);
		this.loadStyles();
		// let ele = document.createElement('rebelchat-spinner');
		// document.getElementById('chat').appendChild(ele);
	}


	loadStyles(){
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

}

document.addEventListener("DOMContentLoaded", function(event) {
	const chat = new RebelChat({
		el: '#chat'
	});
});
