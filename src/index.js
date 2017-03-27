import database from "./firebase";

export default class Chat {
	constructor(){
		console.log('Chat component builded', database);
	}
}

document.addEventListener("DOMContentLoaded", function(event) {
	const chat = new Chat();
});
