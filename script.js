// Configuration - YAHAN APNE LINKS DALO
const CONFIG = {
    // Earning Shortlinks - YAHAN APNE LINKS DALO
    task1Link: "https://arolinks.com/dahs",
    
    // Key Settings
    keyValidityHours: 24, // Key kitne hours valid rahega
    keyFormat: "XXXX-XXXX-XXXX-XXXX" // Key ka format
};

// Global Variables
let tasksCompleted = 0;
let authKey = "";
let keyExpiryTime = null;

// DOM Elements
const authKeyInput = document.getElementById('authKeyInput');
const verifyBtn = document.getElementById('verifyBtn');
const generateBtn = document.getElementById('generateBtn');
const taskSection = document.getElementById('taskSection');
const generateKeyBtn = document.getElementById('generateKeyBtn');
const keyDisplay = document.getElementById('keyDisplay');
const generatedKeyValue = document.getElementById('generatedKeyValue');
const copyKeyBtn = document.getElementById('copyKeyBtn');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load saved key if exists
    loadSavedKey();
    
    // Event Listeners
    verifyBtn.addEventListener('click', verifyAuthKey);
    generateBtn.addEventListener('click', showTasks);
    generateKeyBtn.addEventListener('click', generateAuthKey);
    copyKeyBtn.addEventListener('click', copyAuthKey);
    
    // Enter key to verify
    authKeyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyAuthKey();
        }
    });
});

// Show Tasks Section
function showTasks() {
    taskSection.style.display = 'block';
    tasksCompleted = 0;
    generateKeyBtn.style.display = 'none';
    keyDisplay.style.display = 'none';
    
    // Reset task status
    document.getElementById('task1Status').style.display = 'none';
    document.getElementById('task2Status').style.display = 'none';
    
    // Scroll to tasks
    taskSection.scrollIntoView({ behavior: 'smooth' });
    
    showMessage('success', 'Complete both tasks to generate your Auth Key');
}

// Complete Task Function
function completeTask(taskNumber) {
    if (taskNumber === 1 && !document.getElementById('task1Status').textContent) {
        // Open task link in new tab
        window.open(CONFIG.task1Link, '_blank');
        
        // Mark as completed after delay
        setTimeout(() => {
            document.getElementById('task1Status').textContent = '✓ Completed';
            document.getElementById('task1Status').style.display = 'block';
            tasksCompleted++;
            checkAllTasksCompleted();
        }, 3000);
    }
    
    else if (taskNumber === 2 && !document.getElementById('task2Status').textContent) {
        window.open(CONFIG.task2Link, '_blank');
        
        setTimeout(() => {
            document.getElementById('task2Status').textContent = '✓ Completed';
            document.getElementById('task2Status').style.display = 'block';
            tasksCompleted++;
            checkAllTasksCompleted();
        }, 3000);
    }
}

// Check if all tasks completed
function checkAllTasksCompleted() {
    if (tasksCompleted >= 2) {
        generateKeyBtn.style.display = 'block';
        showMessage('success', 'All tasks completed! You can now generate your Auth Key.');
    }
}

// Generate Auth Key
function generateAuthKey() {
    // Generate unique key (format: XXXX-XXXX-XXXX-XXXX)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3 || i === 7 || i === 11) {
            key += '-';
        }
    }
    
    authKey = key;
    
    // Set expiry time
    keyExpiryTime = Date.now() + (CONFIG.keyValidityHours * 60 * 60 * 1000);
    
    // Save to localStorage
    const keyData = {
        key: authKey,
        expiry: keyExpiryTime,
        generated: new Date().toISOString()
    };
    
    localStorage.setItem('selectionWayAuthKey', JSON.stringify(keyData));
    
    // Display the key
    generatedKeyValue.textContent = authKey;
    keyDisplay.style.display = 'block';
    taskSection.style.display = 'none';
    
    // Auto-copy to clipboard
    setTimeout(() => {
        copyAuthKey();
    }, 500);
    
    // Show success message
    showMessage('success', 'Auth Key generated! Copied to clipboard.');
    
    // Scroll to key display
    keyDisplay.scrollIntoView({ behavior: 'smooth' });
}

// Copy Auth Key to Clipboard
function copyAuthKey() {
    if (!authKey) return;
    
    navigator.clipboard.writeText(authKey).then(() => {
        showMessage('success', 'Auth Key copied to clipboard!');
        
        // Highlight the input field
        authKeyInput.focus();
        authKeyInput.value = authKey;
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = authKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showMessage('success', 'Auth Key copied!');
    });
}

// Verify Auth Key
function verifyAuthKey() {
    const inputKey = authKeyInput.value.trim();
    
    if (!inputKey) {
        showMessage('error', 'Please enter an Auth Key');
        return;
    }
    
    // Get saved key data
    const savedData = localStorage.getItem('selectionWayAuthKey');
    
    if (!savedData) {
        showMessage('error', 'No Auth Key found. Please generate a new one.');
        return;
    }
    
    try {
        const keyData = JSON.parse(savedData);
        const currentTime = Date.now();
        
        // Check if key matches
        if (inputKey !== keyData.key) {
            showMessage('error', 'Invalid Auth Key. Please check and try again.');
            return;
        }
        
        // Check if key expired
        if (currentTime > keyData.expiry) {
            showMessage('error', 'Auth Key has expired. Please generate a new one.');
            localStorage.removeItem('selectionWayAuthKey');
            return;
        }
        
        // Calculate remaining time
        const remainingTime = keyData.expiry - currentTime;
        const hoursLeft = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutesLeft = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        
        // SUCCESS
        showMessage('success', `✅ Verification Successful! Key expires in ${hoursLeft}h ${minutesLeft}m`);
        
        // You can redirect to another page or show premium content here
        // window.location.href = "https://your-main-website.com";
        
    } catch (error) {
        showMessage('error', 'Error verifying key. Please try again.');
    }
}

// Load Saved Key
function loadSavedKey() {
    const savedData = localStorage.getItem('selectionWayAuthKey');
    
    if (savedData) {
        try {
            const keyData = JSON.parse(savedData);
            const currentTime = Date.now();
            
            if (currentTime < keyData.expiry) {
                // Key is still valid
                authKey = keyData.key;
                keyExpiryTime = keyData.expiry;
                
                // Auto-fill the input
                authKeyInput.value = authKey;
                
                // Calculate and show remaining time
                const remainingTime = keyExpiryTime - currentTime;
                const hoursLeft = Math.floor(remainingTime / (1000 * 60 * 60));
                const minutesLeft = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                
                showMessage('success', `You have a valid Auth Key (expires in ${hoursLeft}h ${minutesLeft}m)`);
                
                // Auto-hide message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            } else {
                // Key expired
                localStorage.removeItem('selectionWayAuthKey');
            }
        } catch (error) {
            // Invalid data, remove it
            localStorage.removeItem('selectionWayAuthKey');
        }
    }
}

// Show Messages
function showMessage(type, text) {
    if (type === 'success') {
        successText.textContent = text;
        successMessage.style.display = 'flex';
        errorMessage.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    } else {
        errorText.textContent = text;
        errorMessage.style.display = 'flex';
        successMessage.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
      }
