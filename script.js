// DOM Elements
const stopwatchDisplay = document.getElementById('stopwatchDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const lapsList = document.getElementById('lapsList');
const progressRing = document.getElementById('progressRing');

// Buttons
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const splitBtn = document.getElementById('splitBtn');
const clearLapsBtn = document.getElementById('clearLapsBtn');
const exportLapsBtn = document.getElementById('exportLapsBtn');

const timerStartStopBtn = document.getElementById('timerStartStopBtn');
const timerResetBtn = document.getElementById('timerResetBtn');

const stopwatchTab = document.getElementById('stopwatchTab');
const timerTab = document.getElementById('timerTab');
const pomodoroTab = document.getElementById('pomodoroTab');
const analyticsTab = document.getElementById('analyticsTab');

const darkModeToggle = document.getElementById('darkModeToggle');
const backToTopBtn = document.getElementById('backToTop');
const themeToggle = document.getElementById('themeToggle');
const voiceControlBtn = document.getElementById('voiceControlBtn');

// Timer Inputs
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');

// Timer Options
const volumeControl = document.getElementById('volumeControl');
const loopTimer = document.getElementById('loopTimer');

// Pomodoro Elements
const pomodoroDisplay = document.getElementById('pomodoroDisplay');
const pomodoroProgressRing = document.getElementById('pomodoroProgressRing');
const pomodoroStatus = document.getElementById('pomodoroStatus');
const workDuration = document.getElementById('workDuration');
const breakDuration = document.getElementById('breakDuration');
const longBreakDuration = document.getElementById('longBreakDuration');
const pomodoroStartStopBtn = document.getElementById('pomodoroStartStopBtn');
const pomodoroResetBtn = document.getElementById('pomodoroResetBtn');
const pomodoroSkipBtn = document.getElementById('pomodoroSkipBtn');
const sessionsCompleted = document.getElementById('sessionsCompleted');
const breaksTaken = document.getElementById('breaksTaken');

// Analytics Elements
const lapChartCtx = document.getElementById('lapChart').getContext('2d');
const totalTimeTracked = document.getElementById('totalTimeTracked');
const avgLapTime = document.getElementById('avgLapTime');
const fastestLap = document.getElementById('fastestLap');
const sessionCount = document.getElementById('sessionCount');
const predictionResult = document.getElementById('predictedTime');

// Speech Recognition
const speechStatus = document.getElementById('speechStatus');
const speechText = document.getElementById('speechText');

// Alarm Sound
const alarmSound = document.getElementById('alarmSound');
const timerEndMessage = document.getElementById('timerEndMessage');

// State Variables
let stopwatchRunning = false;
let stopwatchStartTime = 0;
let stopwatchElapsedTime = 0;
let stopwatchInterval = null;

let timerRunning = false;
let timerTotalTime = 0;
let timerRemainingTime = 0;
let timerInterval = null;

let pomodoroRunning = false;
let pomodoroState = 'work'; // 'work', 'break', 'longBreak'
let pomodoroTotalTime = 25 * 60;
let pomodoroRemainingTime = 25 * 60;
let pomodoroInterval = null;
let sessionCountValue = 0;
let breaksCountValue = 0;

let laps = [];
let lapCounter = 1;

let chart = null;
let recognition = null;

// Check for saved dark mode preference
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize progress ring
    updateProgressRing(100);
    
    // Initialize particles
    initParticles();
    
    // Initialize chart
    initChart();
    
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
});

// Set up all event listeners
function setupEventListeners() {
    // Stopwatch buttons
    startStopBtn.addEventListener('click', toggleStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    lapBtn.addEventListener('click', recordLap);
    splitBtn.addEventListener('click', recordSplit);
    clearLapsBtn.addEventListener('click', clearLaps);
    exportLapsBtn.addEventListener('click', exportLaps);
    
    // Timer buttons
    timerStartStopBtn.addEventListener('click', toggleTimer);
    timerResetBtn.addEventListener('click', resetTimer);
    
    // Pomodoro buttons
    pomodoroStartStopBtn.addEventListener('click', togglePomodoro);
    pomodoroResetBtn.addEventListener('click', resetPomodoro);
    pomodoroSkipBtn.addEventListener('click', skipPomodoro);
    
    // Tab switching
    stopwatchTab.addEventListener('click', () => switchTab('stopwatch'));
    timerTab.addEventListener('click', () => switchTab('timer'));
    pomodoroTab.addEventListener('click', () => switchTab('pomodoro'));
    analyticsTab.addEventListener('click', () => {
        switchTab('analytics');
        updateAnalytics();
    });
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleThemeCustomizer);
    
    // Voice control
    voiceControlBtn.addEventListener('click', toggleVoiceControl);
    
    // Back to top button
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Timer inputs validation
    hoursInput.addEventListener('change', validateTimerInputs);
    minutesInput.addEventListener('change', validateTimerInputs);
    secondsInput.addEventListener('change', validateTimerInputs);
    
    // Timer options
    volumeControl.addEventListener('input', updateVolume);
    loopTimer.addEventListener('change', saveLoopSetting);
    
    // Pomodoro settings
    workDuration.addEventListener('change', savePomodoroSettings);
    breakDuration.addEventListener('change', savePomodoroSettings);
    longBreakDuration.addEventListener('change', savePomodoroSettings);
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(button => {
        button.addEventListener('click', () => {
            const seconds = parseInt(button.dataset.seconds);
            setTimerPreset(seconds);
        });
    });
    
    // Theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            applyTheme(option.dataset.theme);
        });
    });
    
    // Close theme customizer
    document.querySelector('.close-theme-customizer').addEventListener('click', () => {
        document.querySelector('.theme-customizer').classList.remove('show');
    });
    
    // Initialize settings
    const savedLoop = localStorage.getItem('loopTimer') === 'true';
    loopTimer.checked = savedLoop;
    
    loadPomodoroSettings();
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Reinitialize particles with new theme
    initParticles();
    
    // Update chart
    if (chart) {
        chart.destroy();
        initChart();
        updateAnalytics();
    }
}

// Apply custom theme
function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset');
    
    // Apply selected theme
    if (theme && theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Save theme preference
    localStorage.setItem('customTheme', theme);
    
    // Hide theme customizer
    document.querySelector('.theme-customizer').classList.remove('show');
}

// Toggle theme customizer
function toggleThemeCustomizer() {
    document.querySelector('.theme-customizer').classList.toggle('show');
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all sections
    document.querySelectorAll('.timer-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section and activate tab
    switch (tabName) {
        case 'stopwatch':
            document.getElementById('stopwatchSection').classList.add('active');
            stopwatchTab.classList.add('active');
            break;
        case 'timer':
            document.getElementById('timerSection').classList.add('active');
            timerTab.classList.add('active');
            break;
        case 'pomodoro':
            document.getElementById('pomodoroSection').classList.add('active');
            pomodoroTab.classList.add('active');
            break;
        case 'analytics':
            document.getElementById('analyticsSection').classList.add('active');
            analyticsTab.classList.add('active');
            break;
    }
}

// Stopwatch Functions
function toggleStopwatch() {
    if (stopwatchRunning) {
        pauseStopwatch();
    } else {
        startStopwatch();
    }
}

function startStopwatch() {
    stopwatchRunning = true;
    stopwatchStartTime = Date.now() - stopwatchElapsedTime;
    stopwatchInterval = requestAnimationFrame(updateStopwatch);
    
    startStopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    startStopBtn.classList.remove('primary');
    startStopBtn.classList.add('secondary');
}

function pauseStopwatch() {
    stopwatchRunning = false;
    cancelAnimationFrame(stopwatchInterval);
    
    startStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    startStopBtn.classList.remove('secondary');
    startStopBtn.classList.add('primary');
}

function resetStopwatch() {
    pauseStopwatch();
    stopwatchElapsedTime = 0;
    updateStopwatchDisplay();
    clearLaps();
}

function updateStopwatch() {
    if (stopwatchRunning) {
        stopwatchElapsedTime = Date.now() - stopwatchStartTime;
        updateStopwatchDisplay();
        stopwatchInterval = requestAnimationFrame(updateStopwatch);
    }
}

function updateStopwatchDisplay() {
    const time = formatTime(stopwatchElapsedTime);
    stopwatchDisplay.innerHTML = `${time.hours}:${time.minutes}:${time.seconds}<span class="milliseconds">${time.milliseconds}</span>`;
}

function recordLap() {
    if (!stopwatchRunning) return;
    
    const lapTime = stopwatchElapsedTime;
    const lapItem = document.createElement('li');
    lapItem.className = 'lap-item';
    lapItem.innerHTML = `
        <span class="lap-number">Lap ${lapCounter}</span>
        <span class="lap-time">${formatTime(lapTime).display}</span>
    `;
    
    lapsList.prepend(lapItem);
    laps.push({
        type: 'lap',
        number: lapCounter,
        time: lapTime,
        display: formatTime(lapTime).display
    });
    lapCounter++;
}

function recordSplit() {
    if (!stopwatchRunning) return;
    
    const splitTime = stopwatchElapsedTime;
    const splitItem = document.createElement('li');
    splitItem.className = 'lap-item';
    splitItem.innerHTML = `
        <span class="lap-number">Split</span>
        <span class="lap-time">${formatTime(splitTime).display}</span>
    `;
    
    lapsList.prepend(splitItem);
    laps.push({
        type: 'split',
        time: splitTime,
        display: formatTime(splitTime).display
    });
}

function clearLaps() {
    lapsList.innerHTML = '';
    laps = [];
    lapCounter = 1;
}

function exportLaps() {
    if (laps.length === 0) return;
    
    let csvContent = "Type,Number,Time\n";
    laps.forEach(lap => {
        const type = lap.type;
        const number = lap.type === 'lap' ? lap.number : '';
        const time = lap.display;
        csvContent += `${type},${number},${time}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'timemaster_laps.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Timer Functions
function toggleTimer() {
    if (timerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (timerRemainingTime <= 0) {
        // Get time from inputs
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        
        timerTotalTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        timerRemainingTime = timerTotalTime;
        
        if (timerTotalTime <= 0) return;
    }
    
    timerRunning = true;
    timerStartStopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    timerStartStopBtn.classList.remove('primary');
    timerStartStopBtn.classList.add('secondary');
    
    // Disable inputs while timer is running
    hoursInput.disabled = true;
    minutesInput.disabled = true;
    secondsInput.disabled = true;
    
    timerInterval = setInterval(updateTimer, 10);
}

function pauseTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    
    timerStartStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    timerStartStopBtn.classList.remove('secondary');
    timerStartStopBtn.classList.add('primary');
}

function resetTimer() {
    pauseTimer();
    timerRemainingTime = 0;
    timerTotalTime = 0;
    
    // Enable inputs
    hoursInput.disabled = false;
    minutesInput.disabled = false;
    secondsInput.disabled = false;
    
    updateTimerDisplay();
    updateProgressRing(100);
    hideTimerEndMessage();
}

function updateTimer() {
    if (timerRunning && timerRemainingTime > 0) {
        timerRemainingTime -= 10;
        
        if (timerRemainingTime <= 0) {
            timerRemainingTime = 0;
            pauseTimer();
            playAlarm();
            showTimerEndMessage();
            triggerConfetti();
            
            // Check if loop is enabled
            if (loopTimer.checked) {
                setTimeout(() => {
                    if (timerTab.classList.contains('active')) {
                        startTimer();
                    }
                }, 1000);
            }
        }
        
        updateTimerDisplay();
        updateProgressRing((timerRemainingTime / timerTotalTime) * 100);
    }
}

function updateTimerDisplay() {
    const time = formatTime(timerRemainingTime);
    timerDisplay.textContent = `${time.hours}:${time.minutes}:${time.seconds}`;
}

function updateProgressRing(percentage) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRing.style.strokeDashoffset = offset;
}

function showTimerEndMessage() {
    timerEndMessage.classList.add('show');
}

function hideTimerEndMessage() {
    timerEndMessage.classList.remove('show');
}

function playAlarm() {
    alarmSound.volume = volumeControl.value / 100;
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log("Audio play error:", e));
}

function validateTimerInputs() {
    // Ensure values are within valid ranges
    if (parseInt(hoursInput.value) > 23) hoursInput.value = 23;
    if (parseInt(hoursInput.value) < 0) hoursInput.value = 0;
    
    if (parseInt(minutesInput.value) > 59) minutesInput.value = 59;
    if (parseInt(minutesInput.value) < 0) minutesInput.value = 0;
    
    if (parseInt(secondsInput.value) > 59) secondsInput.value = 59;
    if (parseInt(secondsInput.value) < 0) secondsInput.value = 0;
}

function setTimerPreset(seconds) {
    if (timerRunning) return;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    hoursInput.value = hours;
    minutesInput.value = minutes;
    secondsInput.value = secs;
}

function updateVolume() {
    localStorage.setItem('timerVolume', volumeControl.value);
}

function saveLoopSetting() {
    localStorage.setItem('loopTimer', loopTimer.checked);
}

// Pomodoro Functions
function togglePomodoro() {
    if (pomodoroRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}

function startPomodoro() {
    if (pomodoroRemainingTime <= 0) {
        // Set time based on current state
        switch (pomodoroState) {
            case 'work':
                pomodoroTotalTime = parseInt(workDuration.value) * 60;
                break;
            case 'break':
                pomodoroTotalTime = parseInt(breakDuration.value) * 60;
                break;
            case 'longBreak':
                pomodoroTotalTime = parseInt(longBreakDuration.value) * 60;
                break;
        }
        pomodoroRemainingTime = pomodoroTotalTime;
    }
    
    pomodoroRunning = true;
    pomodoroStartStopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    pomodoroStartStopBtn.classList.remove('primary');
    pomodoroStartStopBtn.classList.add('secondary');
    
    pomodoroInterval = setInterval(updatePomodoro, 1000);
}

function pausePomodoro() {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    
    pomodoroStartStopBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    pomodoroStartStopBtn.classList.remove('secondary');
    pomodoroStartStopBtn.classList.add('primary');
}

function resetPomodoro() {
    pausePomodoro();
    pomodoroRemainingTime = parseInt(workDuration.value) * 60;
    pomodoroTotalTime = parseInt(workDuration.value) * 60;
    pomodoroState = 'work';
    updatePomodoroDisplay();
    updatePomodoroStatus();
    updatePomodoroProgressRing(100);
}

function skipPomodoro() {
    pausePomodoro();
    
    // Move to next state
    if (pomodoroState === 'work') {
        sessionCountValue++;
        sessionsCompleted.textContent = sessionCountValue;
        localStorage.setItem('sessionsCompleted', sessionCountValue);
        
        // Every 4 sessions, take a long break
        if (sessionCountValue % 4 === 0) {
            pomodoroState = 'longBreak';
        } else {
            pomodoroState = 'break';
            breaksCountValue++;
            breaksTaken.textContent = breaksCountValue;
            localStorage.setItem('breaksTaken', breaksCountValue);
        }
    } else {
        pomodoroState = 'work';
    }
    
    pomodoroRemainingTime = 0; // Will be set on next start
    updatePomodoroDisplay();
    updatePomodoroStatus();
    updatePomodoroProgressRing(100);
}

function updatePomodoro() {
    if (pomodoroRunning && pomodoroRemainingTime > 0) {
        pomodoroRemainingTime--;
        
        if (pomodoroRemainingTime <= 0) {
            pausePomodoro();
            playAlarm();
            triggerConfetti();
            
            // Move to next state
            if (pomodoroState === 'work') {
                sessionCountValue++;
                sessionsCompleted.textContent = sessionCountValue;
                localStorage.setItem('sessionsCompleted', sessionCountValue);
                
                // Every 4 sessions, take a long break
                if (sessionCountValue % 4 === 0) {
                    pomodoroState = 'longBreak';
                } else {
                    pomodoroState = 'break';
                    breaksCountValue++;
                    breaksTaken.textContent = breaksCountValue;
                    localStorage.setItem('breaksTaken', breaksCountValue);
                }
            } else {
                pomodoroState = 'work';
            }
            
            pomodoroRemainingTime = 0; // Will be set on next start
        }
        
        updatePomodoroDisplay();
        updatePomodoroProgressRing((pomodoroRemainingTime / pomodoroTotalTime) * 100);
    }
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroRemainingTime / 60);
    const seconds = pomodoroRemainingTime % 60;
    pomodoroDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updatePomodoroStatus() {
    switch (pomodoroState) {
        case 'work':
            pomodoroStatus.textContent = 'Work Session';
            pomodoroStatus.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
            break;
        case 'break':
            pomodoroStatus.textContent = 'Short Break';
            pomodoroStatus.style.backgroundColor = 'rgba(76, 201, 240, 0.1)';
            break;
        case 'longBreak':
            pomodoroStatus.textContent = 'Long Break';
            pomodoroStatus.style.backgroundColor = 'rgba(233, 233, 233, 0.1)';
            break;
    }
}

function updatePomodoroProgressRing(percentage) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    pomodoroProgressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    pomodoroProgressRing.style.strokeDashoffset = offset;
}

function savePomodoroSettings() {
    localStorage.setItem('workDuration', workDuration.value);
    localStorage.setItem('breakDuration', breakDuration.value);
    localStorage.setItem('longBreakDuration', longBreakDuration.value);
}

function loadPomodoroSettings() {
    const savedWork = localStorage.getItem('workDuration') || 25;
    const savedBreak = localStorage.getItem('breakDuration') || 5;
    const savedLongBreak = localStorage.getItem('longBreakDuration') || 15;
    const savedSessions = localStorage.getItem('sessionsCompleted') || 0;
    const savedBreaks = localStorage.getItem('breaksTaken') || 0;
    
    workDuration.value = savedWork;
    breakDuration.value = savedBreak;
    longBreakDuration.value = savedLongBreak;
    sessionCountValue = parseInt(savedSessions);
    breaksCountValue = parseInt(savedBreaks);
    
    sessionsCompleted.textContent = sessionCountValue;
    breaksTaken.textContent = breaksCountValue;
}

// Analytics Functions
function initChart() {
    chart = new Chart(lapChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Lap Times (seconds)',
                data: [],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-theme') ? 
                            'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-theme') ? 
                            '#adb5bd' : '#6c757d'
                    }
                },
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-theme') ? 
                            'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-theme') ? 
                            '#adb5bd' : '#6c757d'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('dark-theme') ? 
                            '#f8f9fa' : '#212529'
                    }
                }
            }
        }
    });
}

function updateAnalytics() {
    if (laps.length === 0) {
        totalTimeTracked.textContent = '00:00:00';
        avgLapTime.textContent = '00:00.00';
        fastestLap.textContent = '00:00.00';
        sessionCount.textContent = '0';
        predictionResult.textContent = '--:--';
        
        // Clear chart
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.update();
        return;
    }
    
    // Calculate total time
    const totalMilliseconds = laps.reduce((sum, lap) => sum + lap.time, 0);
    totalTimeTracked.textContent = formatTime(totalMilliseconds).display.split('.')[0];
    
    // Calculate average lap time
    const lapTimes = laps.filter(lap => lap.type === 'lap').map(lap => lap.time);
    if (lapTimes.length > 0) {
        const avgTime = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
        avgLapTime.textContent = formatTime(avgTime).display.split('.')[0] + '.' + formatTime(avgTime).milliseconds;
        
        // Find fastest lap
        const fastest = Math.min(...lapTimes);
        fastestLap.textContent = formatTime(fastest).display.split('.')[0] + '.' + formatTime(fastest).milliseconds;
    } else {
        avgLapTime.textContent = '00:00.00';
        fastestLap.textContent = '00:00.00';
    }
    
    // Session count
    sessionCount.textContent = lapTimes.length;
    
    // Update chart
    const labels = lapTimes.map((_, index) => `Lap ${index + 1}`);
    const data = lapTimes.map(time => time / 1000); // Convert to seconds
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
    
    // Simple time prediction (based on last 3 laps)
    if (lapTimes.length >= 3) {
        const recentLaps = lapTimes.slice(-3);
        const avgRecent = recentLaps.reduce((sum, time) => sum + time, 0) / recentLaps.length;
        const predicted = formatTime(avgRecent).display.split('.')[0] + '.' + formatTime(avgRecent).milliseconds;
        predictionResult.textContent = predicted;
    } else {
        predictionResult.textContent = '--:--';
    }
}

// Speech Recognition Functions
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            handleVoiceCommand(command);
            speechStatus.classList.remove('show');
        };
        
        recognition.onerror = (event) => {
            console.log('Speech recognition error', event.error);
            speechStatus.classList.remove('show');
        };
        
        recognition.onend = () => {
            speechStatus.classList.remove('show');
        };
    } else {
        console.log('Speech recognition not supported');
        voiceControlBtn.style.display = 'none';
    }
}

function toggleVoiceControl() {
    if (recognition) {
        speechStatus.classList.add('show');
        recognition.start();
    }
}

function handleVoiceCommand(command) {
    console.log('Voice command:', command);
    
    // Stopwatch commands
    if (command.includes('start stopwatch') || command.includes('begin stopwatch')) {
        if (stopwatchTab.classList.contains('active')) {
            if (!stopwatchRunning) startStopwatch();
        } else {
            switchTab('stopwatch');
            setTimeout(() => startStopwatch(), 300);
        }
    } else if (command.includes('pause stopwatch') || command.includes('stop stopwatch')) {
        if (stopwatchTab.classList.contains('active') && stopwatchRunning) {
            pauseStopwatch();
        }
    } else if (command.includes('reset stopwatch')) {
        if (stopwatchTab.classList.contains('active')) {
            resetStopwatch();
        }
    } else if (command.includes('lap') || command.includes('mark')) {
        if (stopwatchTab.classList.contains('active') && stopwatchRunning) {
            recordLap();
        }
    } else if (command.includes('split')) {
        if (stopwatchTab.classList.contains('active') && stopwatchRunning) {
            recordSplit();
        }
    }
    
    // Timer commands
    else if (command.includes('start timer') || command.includes('begin timer')) {
        if (timerTab.classList.contains('active')) {
            if (!timerRunning) startTimer();
        } else {
            switchTab('timer');
            setTimeout(() => startTimer(), 300);
        }
    } else if (command.includes('pause timer') || command.includes('stop timer')) {
        if (timerTab.classList.contains('active') && timerRunning) {
            pauseTimer();
        }
    } else if (command.includes('reset timer')) {
        if (timerTab.classList.contains('active')) {
            resetTimer();
        }
    }
    
    // Pomodoro commands
    else if (command.includes('start pomodoro') || command.includes('begin pomodoro')) {
        if (pomodoroTab.classList.contains('active')) {
            if (!pomodoroRunning) startPomodoro();
        } else {
            switchTab('pomodoro');
            setTimeout(() => startPomodoro(), 300);
        }
    } else if (command.includes('pause pomodoro') || command.includes('stop pomodoro')) {
        if (pomodoroTab.classList.contains('active') && pomodoroRunning) {
            pausePomodoro();
        }
    } else if (command.includes('skip') || command.includes('next')) {
        if (pomodoroTab.classList.contains('active')) {
            skipPomodoro();
        }
    }
    
    // Navigation commands
    else if (command.includes('stopwatch')) {
        switchTab('stopwatch');
    } else if (command.includes('timer')) {
        switchTab('timer');
    } else if (command.includes('pomodoro')) {
        switchTab('pomodoro');
    } else if (command.includes('analytics') || command.includes('statistics')) {
        switchTab('analytics');
    }
}

// Utility Functions
function formatTime(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        milliseconds: ms.toString().padStart(2, '0'),
        display: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
    };
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    // Only trigger if not in an input field
    if (event.target.tagName === 'INPUT') return;
    
    switch (event.key) {
        case ' ':
            event.preventDefault();
            // Toggle stopwatch if on stopwatch tab, otherwise toggle timer
            if (document.getElementById('stopwatchSection').classList.contains('active')) {
                toggleStopwatch();
            } else if (document.getElementById('timerSection').classList.contains('active')) {
                toggleTimer();
            } else if (document.getElementById('pomodoroSection').classList.contains('active')) {
                togglePomodoro();
            }
            break;
        case 'r':
        case 'R':
            event.preventDefault();
            if (document.getElementById('stopwatchSection').classList.contains('active')) {
                resetStopwatch();
            } else if (document.getElementById('timerSection').classList.contains('active')) {
                resetTimer();
            } else if (document.getElementById('pomodoroSection').classList.contains('active')) {
                resetPomodoro();
            }
            break;
        case 'l':
        case 'L':
            event.preventDefault();
            if (document.getElementById('stopwatchSection').classList.contains('active')) {
                recordLap();
            }
            break;
        case 's':
        case 'S':
            event.preventDefault();
            if (document.getElementById('stopwatchSection').classList.contains('active')) {
                recordSplit();
            }
            break;
        case 'n':
        case 'N':
            event.preventDefault();
            if (document.getElementById('pomodoroSection').classList.contains('active')) {
                skipPomodoro();
            }
            break;
    }
}

// Particles.js initialization
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        const isDarkMode = document.body.classList.contains('dark-theme');
        
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: isDarkMode ? 80 : 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: isDarkMode ? "#4895ef" : "#4361ee"
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: isDarkMode ? 0.5 : 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: isDarkMode ? "#4895ef" : "#4361ee",
                    opacity: isDarkMode ? 0.3 : 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// Confetti effect
function triggerConfetti() {
    if (typeof confetti !== 'undefined') {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }
}

// Add theme customizer HTML dynamically
document.addEventListener('DOMContentLoaded', () => {
    const themeCustomizer = document.createElement('div');
    themeCustomizer.className = 'theme-customizer';
    themeCustomizer.innerHTML = `
        <button class="close-theme-customizer">
            <i class="fas fa-times"></i>
        </button>
        <h3>Customize Theme</h3>
        <div class="theme-options">
            <div class="theme-option default" data-theme="default">
                Default
            </div>
            <div class="theme-option ocean" data-theme="ocean">
                Ocean
            </div>
            <div class="theme-option forest" data-theme="forest">
                Forest
            </div>
            <div class="theme-option sunset" data-theme="sunset">
                Sunset
            </div>
        </div>
    `;
    document.body.appendChild(themeCustomizer);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
});