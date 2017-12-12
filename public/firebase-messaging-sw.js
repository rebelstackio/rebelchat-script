importScripts('https://www.gstatic.com/firebasejs/3.7.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.7.0/firebase-messaging.js');

const config = {
	apiKey: "AIzaSyBMB9rO2BtIaRmt6SH8sakZyE02CibIb-8",
	authDomain: "rebelstackchat.firebaseapp.com",
	databaseURL: "https://rebelstackchat.firebaseio.com",
	messagingSenderId: "209932179940"
};

firebase.initializeApp(config);

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload){
    const title = "You have new messages",
        options = payload.data;
    return self.registration.showNotification(title,options);
});