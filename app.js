// --- DOM Elements ---
const timerDisplay = document.getElementById('timer-display');
const focusBtn = document.getElementById('focus-btn');
const shortBtn = document.getElementById('short-btn');
const longBtn = document.getElementById('long-btn');
const startPauseBtn = document.getElementById('start-pause-btn');
const startPauseIcon = startPauseBtn.querySelector('i');
const skipBtn = document.getElementById('skip-btn');
const sessionCountDisplay = document.getElementById('session-count');
const alarmSound = document.getElementById('alarm-sound');
const bodyElement = document.body;

// --- Settings Modal Elements ---
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const focusTimeInput = document.getElementById('focus-time');
const shortTimeInput = document.getElementById('short-time');
const longTimeInput = document.getElementById('long-time');
const sessionsInput = document.getElementById('sessions');

// --- Sounds Popover Elements ---
const soundsBtn = document.getElementById('sounds-btn');
const soundsPopover = document.getElementById('sounds-popover');
const soundsList = document.getElementById('sounds-list');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');

// --- Timer State (Defaults to standard Pomodoro) ---
let POMODORO_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
let SESSIONS_UNTIL_LONG_BREAK = 4;
let timerInterval;
let isTimerRunning = false;
let currentMode = 'focus';
let currentTimeInSeconds = POMODORO_TIMES.focus;
let sessionCount = 0;
let hasNotificationPermission = false;

// --- Sound State ---
const ambientSounds = [
    { id: 'rain', name: 'Rain', icon: 'fa-solid fa-cloud-showers-heavy', url: 'https://cdn.pixabay.com/audio/2022/08/18/audio_16b864a64f.mp3' },
    { id: 'forest', name: 'Forest', icon: 'fa-solid fa-tree', url: 'https://cdn.pixabay.com/audio/2022/04/18/audio_65ed360e58.mp3' },
    { id: 'coffee', name: 'Coffee Shop', icon: 'fa-solid fa-mug-saucer', url: 'https://cdn.pixabay.com/audio/2022/07/27/audio_82c9b4e363.mp3' },
    { id: 'noise', name: 'White Noise', icon: 'fa-solid fa-wave-square', url: 'https://cdn.pixabay.com/audio/2022/05/29/audio_38fa080a71.mp3' }
];
let ambientAudio = null;
let currentSoundId = null;
let ambientVolume = 0.5;

// --- Timer Functions ---

/** Formats seconds into MM:SS */
function formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const remainingSeconds = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
}

/** Updates the timer display and page title */
function updateTimerDisplay() {
    const timeString = formatTime(currentTimeInSeconds);
    timerDisplay.textContent = timeString;
    document.title = `${timeString} - ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
}

/** Starts the countdown */
function startTimer() {
    isTimerRunning = true;
    startPauseIcon.classList.remove('fa-play');
    startPauseIcon.classList.add('fa-pause');
    startPauseBtn.title = 'Pause (Space)';

    timerInterval = setInterval(() => {
        currentTimeInSeconds--;
        updateTimerDisplay();

        if (currentTimeInSeconds <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            alarmSound.play();
            autoSwitchMode();
        }
    }, 1000);
}

/** Pauses the countdown */
function pauseTimer() {
    isTimerRunning = false;
    startPauseIcon.classList.remove('fa-pause');
    startPauseIcon.classList.add('fa-play');
    startPauseBtn.title = 'Start (Space)';
    clearInterval(timerInterval);
}

/** Toggles between Start and Pause */
function toggleStartPause() {
    if (!hasNotificationPermission) {
        requestNotificationPermission();
        hasNotificationPermission = true;
    }
    if (isTimerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

/** Updates the session count display */
function updateSessionDisplay() {
    const displayCount = sessionCount % SESSIONS_UNTIL_LONG_BREAK;
    const totalSessions = SESSIONS_UNTIL_LONG_BREAK;
    if (displayCount === 0 && sessionCount !== 0) {
        sessionCountDisplay.textContent = `Session: ${totalSessions} of ${totalSessions}`;
    } else {
        sessionCountDisplay.textContent = `Session: ${displayCount} of ${totalSessions}`;
    }
}

/** Sends a desktop notification */
function sendNotification(nextMode) {
    if (Notification.permission !== 'granted') return;
    const body = nextMode === 'focus' ? 'Time to focus!' : 'Time for a break!';
    new Notification("Focus Timer", { body });
}

/** Automatically switches to the next mode */
function autoSwitchMode() {
    let nextMode;
    if (currentMode === 'focus') {
        sessionCount++;
        updateSessionDisplay();
        nextMode = (sessionCount % SESSIONS_UNTIL_LONG_BREAK === 0) ? 'long' : 'short';
    } else {
        nextMode = 'focus';
    }
    sendNotification(nextMode);
    setMode(nextMode);
    startTimer(); // Auto-start the next session
}

/** Sets the timer to a specific mode ('focus', 'short', 'long') */
function setMode(mode) {
    currentMode = mode;
    pauseTimer();
    currentTimeInSeconds = POMODORO_TIMES[mode];
    updateTimerDisplay();

    // Update body class for theming
    bodyElement.classList.remove('state-focus', 'state-break');
    if (mode === 'focus') {
        bodyElement.classList.add('state-focus');
    } else {
        bodyElement.classList.add('state-break');
    }

    // Update button active states
    focusBtn.classList.toggle('mode-btn-active', mode === 'focus');
    shortBtn.classList.toggle('mode-btn-active', mode === 'short');
    longBtn.classList.toggle('mode-btn-active', mode === 'long');

    // Update session text
    if (mode === 'focus') {
        updateSessionDisplay();
    } else {
        sessionCountDisplay.textContent = 'Time for a break!';
    }
}

/** Skips the current session */
function skipSession() {
    pauseTimer();
    alarmSound.play(); // Play a sound on skip
    autoSwitchMode();
}

/** Asks for permission to send notifications */
function requestNotificationPermission() {
    if (!('Notification'in window)) return;
    if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
        Notification.requestPermission().then(p => { hasNotificationPermission = (p === 'granted'); });
    } else {
        hasNotificationPermission = (Notification.permission === 'granted');
    }
}

// --- Settings Logic ---

function openSettings() {
    focusTimeInput.value = POMODORO_TIMES.focus / 60;
    shortTimeInput.value = POMODORO_TIMES.short / 60;
    longTimeInput.value = POMODORO_TIMES.long / 60;
    sessionsInput.value = SESSIONS_UNTIL_LONG_BREAK;
    settingsModal.classList.remove('modal-hidden');
}

function closeSettings() {
    settingsModal.classList.add('modal-hidden');
}

function saveSettings() {
    const settings = {
        focus: parseInt(focusTimeInput.value) * 60,
        short: parseInt(shortTimeInput.value) * 60,
        long: parseInt(longTimeInput.value) * 60,
        sessions: parseInt(sessionsInput.value)
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    applySettings(settings);
    closeSettings();
}

function applySettings(settings) {
    if (!settings) return;
    POMODORO_TIMES = {
        focus: settings.focus,
        short: settings.short,
        long: settings.long
    };
    SESSIONS_UNTIL_LONG_BREAK = settings.sessions;
    setMode('focus'); // Reset to focus mode to apply new times
    updateSessionDisplay(); // Update display with new total
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
    if (settings) {
        applySettings(settings);
    }
}

// --- Sound Logic ---

/** Plays or stops an ambient sound */
function playSound(sound) {
    if (ambientAudio) {
        ambientAudio.pause();
        ambientAudio = null;
    }

    // If clicking the same sound, stop it
    if (currentSoundId === sound.id) {
        currentSoundId = null;
    } else {
        // Play the new sound
        ambientAudio = new Audio(sound.url);
        ambientAudio.loop = true;
        ambientAudio.volume = ambientVolume;
        ambientAudio.play().catch(e => console.error("Audio play failed:", e));
        currentSoundId = sound.id;
    }
    
    // Save state
    localStorage.setItem('pomodoroSound', JSON.stringify({ volume: ambientVolume, currentSoundId }));
    
    // Update button styles
    renderSoundButtons();
}

/** Updates the volume of the playing sound */
function handleVolumeChange(e) {
    ambientVolume = parseFloat(e.target.value);
    if (ambientAudio) {
        ambientAudio.volume = ambientVolume;
    }
    
    // Update icon
    if (ambientVolume === 0) {
        volumeIcon.className = "fas fa-volume-off";
    } else {
        volumeIcon.className = "fas fa-volume-low";
    }
    
    // Save volume
    localStorage.setItem('pomodoroSound', JSON.stringify({ volume: ambientVolume, currentSoundId }));
}

/** Renders the list of sound buttons */
function renderSoundButtons() {
    soundsList.innerHTML = ''; // Clear list
    ambientSounds.forEach(sound => {
        const button = document.createElement('button');
        button.className = 'sound-btn';
        button.classList.toggle('sound-btn-active', sound.id === currentSoundId);
        button.innerHTML = `<i class="${sound.icon}"></i><span>${sound.name}</span>`;
        button.onclick = () => playSound(sound);
        soundsList.appendChild(button);
    });
}

/** Loads saved sound settings */
function loadSoundSettings() {
    const settings = JSON.parse(localStorage.getItem('pomodoroSound'));
    if (settings) {
        ambientVolume = settings.volume || 0.5;
        currentSoundId = settings.currentSoundId || null;
    }
    
    volumeSlider.value = ambientVolume;
    if (ambientVolume === 0) {
        volumeIcon.className = "fas fa-volume-off";
    } else {
        volumeIcon.className = "fas fa-volume-low";
    }
    
    // Auto-play the last sound
    if (currentSoundId) {
        const sound = ambientSounds.find(s => s.id === currentSoundId);
        if (sound) {
            // We call playSound directly, but the browser might block this
            // A user click is needed to start audio reliably
            console.log("Ready to play last sound:", sound.name);
            // To prevent auto-play issues, we'll just set the state
            // The user must click the button to start it
            currentSoundId = sound.id; // Re-set it, playSound will handle it
        }
    }
    
    renderSoundButtons();
}

// --- Event Listeners ---

// Timer Controls
startPauseBtn.addEventListener('click', toggleStartPause);
skipBtn.addEventListener('click', skipSession);

// Mode Buttons
focusBtn.addEventListener('click', () => setMode('focus'));
shortBtn.addEventListener('click', () => setMode('short'));
longBtn.addEventListener('click', () => setMode('long'));

// Settings Modal
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
saveSettingsBtn.addEventListener('click', saveSettings);

// Sounds Popover
soundsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from closing it immediately
    soundsPopover.classList.toggle('popover-hidden');
});
volumeSlider.addEventListener('input', handleVolumeChange);

// Global click to close popovers
document.addEventListener('click', (e) => {
    if (!soundsPopover.contains(e.target) && !soundsBtn.contains(e.target)) {
        soundsPopover.classList.add('popover-hidden');
    }
});

// Keyboard Shortcut
window.addEventListener('keydown', (e) => {
    // Don't interfere with modal inputs
    if (settingsModal.classList.contains('modal-hidden')) {
        if (e.code === 'Space') {
            e.preventDefault();
            toggleStartPause();
        }
    }
});

// --- Initial Setup ---
function init() {
    loadSettings();
    loadSoundSettings();
    setMode('focus'); // Start on 'focus' mode
}

init();