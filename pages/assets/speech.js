// @ts-check
/// <reference path="index.js"/>

const SYNTHESIS = window.speechSynthesis;
SYNTHESIS.cancel()
const speechQueueLimit = 10
let speechQueueCurrent = 0

/**
 * Read Text
 * @param {number} index
 * @param {number} rate
 * @param {number} volume
 * @param {string} text
 */
function speechText(index, rate, volume, text) {
	// Speech queue current
	if (SYNTHESIS.pending) {
		speechQueueCurrent++
	} else {
		speechQueueCurrent == 0
	}
	// Speech queue check
	if (speechQueueCurrent > speechQueueLimit) {
		SYNTHESIS.cancel()
	}

	// Speech
	const UTTERANCE = new SpeechSynthesisUtterance(text)
	const VOICE_LIST = SYNTHESIS.getVoices()
	UTTERANCE.voice = VOICE_LIST[index]
	UTTERANCE.rate = rate
	UTTERANCE.volume = volume
	SYNTHESIS.speak(UTTERANCE)
	console.log("Speech", text)
}


/**
 * @typedef SpeechConfig
 * @type {object}
 * @property {number} index
 * @property {number} rate
 * @property {number} volume
 */
/**
 * @param {string} config "index,rate,volume" to SpeechConfig object
 * @return {SpeechConfig}
 */
function parseSpeechConfig(config) {
	const CONFIG_LIST = config.split(",")
	let index = parseInt(CONFIG_LIST[0])
	if (isNaN(index)) {
		index = 0
	}
	let rate = parseFloat(CONFIG_LIST[1])
	if (isNaN(rate)) {
		rate = 1
	}
	let volume = parseFloat(CONFIG_LIST[2])
	if (isNaN(volume)) {
		volume = 1
	}
	return {
		index: index,
		rate: rate,
		volume: volume,
	}
}

function voicePreview() {
	if (TIP_READ_CONFIG != null) {
		const CONFIG = parseSpeechConfig(TIP_READ_CONFIG)
		console.log(CONFIG)
		speechText(CONFIG.index, CONFIG.rate, CONFIG.volume, "Tip Message Read Config")
	}
	if (MESSAGE_READ_CONFIG != null) {
		const CONFIG = parseSpeechConfig(MESSAGE_READ_CONFIG)
		speechText(CONFIG.index, CONFIG.rate, CONFIG.volume, "Normal Message Read Config")
	}

	if (TIP_READ_CONFIG == "" || MESSAGE_READ_CONFIG == "") {
		const VOICE_LIST = SYNTHESIS.getVoices()
		console.log(VOICE_LIST)
		VOICE_LIST.forEach((voice, index) => {
			setTimeout(function () {
				addMessage(0, "", `Index:${index}`, `Lang:${voice.lang} Name:${voice.name}`, "Voice-List", "youtube")
				speechText(index, 1, 1, voice.name)
			}, index * 4000)
		})
	}
}
