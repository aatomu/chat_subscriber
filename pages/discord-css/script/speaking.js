"use strict";
let memnum;

function speak(avatar) {
	const time1 = 2000 + 1000 * memnum * Math.random();
	const time2 = 1000 + 3000 * Math.random();
	const speaking = 'speaking';
	(function(a) {
	  setTimeout(function(){
	    a.classList.add(speaking);
		(function(b) {
		  setTimeout(function(){
            b.classList.remove(speaking);
            speak(b);
		  }, time2);
		})(a);
	  }, time1);
	})(avatar);
};

function setSpeak() {
  const avatars = document.getElementById('root').getElementsByClassName('user');
	memnum = avatars.length;
  for(let i = 0; i < avatars.length; ++i){
    speak(avatars[i]);
  }
};

window.onload = function() {
  setSpeak();
};
