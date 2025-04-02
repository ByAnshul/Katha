document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const speakerButton = document.querySelector('.speaker-button');
    const kathaText = document.getElementById('text');

    if (!speakerButton || !kathaText) {
        console.error("Missing elements!");
        return;
    }

    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        speakerButton.style.display = 'none';
        return;
    }

    let isSpeaking = false;
    let isPaused = false;
    let utterances = [];
    let currentIndex = 0;

    function splitText(text) {
        // Split into smaller parts (~120 chars per piece)
        return text.match(/.{1,180}(\s|$)/g);
    }

    function speakNext() {
        if (currentIndex < utterances.length) {
            let utterance = new SpeechSynthesisUtterance(utterances[currentIndex]);
            utterance.lang = 'hi-IN';
            utterance.rate = 1.1;

            utterance.onend = () => {
                console.log(`Finished part ${currentIndex + 1}/${utterances.length}`);
                if (!isPaused) {
                    currentIndex++;
                    speakNext(); // Continue speaking
                }
            };

            utterance.onerror = (event) => {
                console.error("Speech error:", event.error);
            };

            console.log("Speaking part:", utterances[currentIndex]);
            speechSynthesis.speak(utterance);
        } else {
            console.log("Finished all speech.");
            isSpeaking = false;
            isPaused = false;
            speakerButton.textContent = '🔊';
        }
    }

    speakerButton.addEventListener('click', () => {
        console.log("Speaker button clicked");

        if (isSpeaking && !isPaused) {
            console.log("Pausing speech...");
            speechSynthesis.pause();
            isPaused = true;
            speakerButton.textContent = '▶️';
        } else if (isPaused) {
            console.log("Resuming speech...");
            speechSynthesis.resume();
            isPaused = false;
            speakerButton.textContent = '⏸️';
        } else {
            console.log("Starting new speech...");
            speechSynthesis.cancel(); // Stop any previous speech
            let text = kathaText.textContent.trim();
            if (!text) {
                console.error("Text to speak is empty!");
                return;
            }

            utterances = splitText(text);
            console.log("Text split into parts:", utterances);

            if (utterances.length > 0) {
                isSpeaking = true;
                isPaused = false;
                currentIndex = 0;
                speakerButton.textContent = '⏸️';
                speakNext(); // Start speaking
            }
        }
    });
});
