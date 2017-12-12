
export default class User {
	
		static getSettings( userId, next ) {
			return  new Promise( function(resolve, reject){
				resolve({
					audioNotification: true,
					webNotification: true
				})
			});
		}
	
		static getAvatar() {
			var colours = [
				"#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", 
				"#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
			],
			name = localStorage["USER_NAME"] || '?',
			initials = name.charAt(0),
			charIndex     = (initials == '?' ? 72 : initials.charCodeAt(0)) - 64,
			colourIndex   = charIndex % 20,
			canvas        = document.createElement('canvas'),
			context, dataURI, size = 46;
			canvas.width  = 46;
			canvas.height = 46;
			context = canvas.getContext("2d");
			context.fillStyle = colours[colourIndex - 1];
			context.fillRect (0, 0, canvas.width, canvas.height);
			context.font = Math.round(canvas.width/2)+"px Arial";
			context.textAlign = "center";
			context.fillStyle = "#FFF";
			context.fillText(initials, size / 2, size / 1.5);
			dataURI = canvas.toDataURL();
			canvas  = null;
	
			return dataURI;
		}

		static getAdminAvatar(cb) {
			var canvas = document.createElement('canvas'),
			context, dataURI, size = 46;
			canvas.width = 46;
			canvas.height = 46;
			context = canvas.getContext("2d");
			var img = new Image();
			img.src = 'img/logo.png';
			/*canvas.width = img.width*2;
			canvas.height = img.height*2;*/
			context.fillStyle = '#ffffe6';
			context.fillRect (0, 0, canvas.width, canvas.height);
			img.onload = function(){
				context.drawImage(img,3,0,39,41);
				cb(canvas.toDataURL());
			};
			//
			
			return dataURI = canvas.toDataURL();
			canvas  = null;
			return dataURI;
		}
	}
	