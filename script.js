// Global variables
let tasksCompleted = 0;
let keyGenerated = false;
let expiryTime = null;

// DOM Elements
const taskSection = document.getElementById('taskSection');
const generateBtn = document.getElementById('generateBtn');
const keyDisplay = document.getElementById('keyDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const countdownElement = document.getElementById('countdown');
const validUntilElement = document.getElementById('validUntil');

// Start the process
function startProcess() {
    taskSection.style.display = 'block';
    tasksCompleted = 0;
    keyGenerated = false;
    
    // Reset buttons
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-lock"></i> Generate Auth Key (Complete Tasks First)';
    generateBtn.style.background = 'linear-gradient(to right, #6c757d, #868e96)';
    
    // Hide previous key
    keyDisplay.style.display = 'none';
    
    alert('Complete both tasks to generate your 48-hour valid key!');
}

// Complete a task
function completeTask(taskNumber) {
    // Prevent multiple clicks
    event.preventDefault();
    const link = event.target.href;
    
    if (taskNumber === 1 && !document.querySelector('.task-item:nth-child(1) .status').classList.contains('completed')) {
        // Open link in new tab
        window.open(link, '_blank');
        
        // Mark as completed after delay
        setTimeout(() => {
            const statusElement = document.querySelector('.task-item:nth-child(1) .status');
            statusElement.classList.remove('pending');
            statusElement.classList.add('completed');
            statusElement.innerHTML = '✅ Completed';
            statusElement.removeAttribute('href');
            statusElement.style.cursor = 'default';
            
            tasksCompleted++;
            checkTasks();
        }, 3000); // 3 seconds delay
    }
    
    else if (taskNumber === 2 && !document.querySelector('.task-item:nth-child(2) .status').classList.contains('completed')) {
        window.open(link, '_blank');
        
        setTimeout(() => {
            const statusElement = document.querySelector('.task-item:nth-child(2) .status');
            statusElement.classList.remove('pending');
            statusElement.classList.add('completed');
            statusElement.innerHTML = '✅ Completed';
            statusElement.removeAttribute('href');
            statusElement.style.cursor = 'default';
            
            tasksCompleted++;
            checkTasks();
        }, 3000);
    }
    
    return false; // Prevent default link behavior
}

// Check if all tasks completed
function checkTasks() {
    if (tasksCompleted >= 2) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-key"></i> GENERATE AUTH KEY (48 Hours Valid)';
        generateBtn.style.background = 'linear-gradient(to right, #28a745, #20c997)';
        
        // Add click event to generate button
        generateBtn.onclick = generateKey;
    }
}

// Generate 48-hour valid key
function generateKey() {
    // Generate unique key
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
    const key = `AUTH-${randomPart}-${timestamp.toString(36).toUpperCase()}`;
    
    // Set expiry time (48 hours from now)
    expiryTime = Date.now() + (48 * 60 * 60 * 1000); // 48 hours in milliseconds
    
    // Save to localStorage with expiry
    const keyData = {
        key: key,
        expiry: expiryTime,
        generatedAt: Date.now()
    };
    
    localStorage.setItem('authKeyData', JSON.stringify(keyData));
    
    // Display the key
    document.getElementById('generatedKey').value = key;
    keyDisplay.style.display = 'block';
    
    // Calculate expiry time display
    const expiryDate = new Date(expiryTime);
    const formattedDate = expiryDate.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    validUntilElement.textContent = formattedDate;
    
    // Start countdown timer
    startCountdown();
    
    alert('✅ Key generated! Valid for 48 hours until ' + formattedDate);
}

// Start countdown timer
function startCountdown() {
    function updateCountdown() {
        if (!expiryTime) return;
        
        const now = Date.now();
        const remaining = expiryTime - now;
        
        if (remaining <= 0) {
            countdownElement.textContent = 'EXPIRED';
            countdownElement.style.color = '#dc3545';
            return;
        }
        
        // Calculate hours, minutes, seconds
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        // Format as HH:MM:SS
        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        countdownElement.textContent = formatted;
        
        // Change color based on time
        if (hours < 12) {
            countdownElement.style.color = '#ffc107'; // Yellow warning
        }
        if (hours < 6) {
            countdownElement.style.color = '#dc3545'; // Red danger
        }
    }
    
    // Update every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Copy key to clipboard
function copyKey() {
    const keyInput = document.getElementById('generatedKey');
    keyInput.select();
    keyInput.setSelectionRange(0, 99999); // For mobile
    
    navigator.clipboard.writeText(keyInput.value)
        .then(() => {
            alert('✅ Key copied! Paste it above to verify.');
        })
        .catch(err => {
            // Fallback for older browsers
            document.execCommand('copy');
            alert('✅ Key copied!');
        });
}

// Verify the key
function verifyKey() {
    const inputKey = document.getElementById('authInput').value.trim();
    
    if (!inputKey) {
        alert('⚠️ Please enter a key first!');
        return;
    }
    
    // Get saved key data
    const savedData = localStorage.getItem('authKeyData');
    
    if (!savedData) {
        alert('❌ No key found! Generate a new key first.');
        return;
    }
    
    const keyData = JSON.parse(savedData);
    const now = Date.now();
    
    // Check if key matches
    if (inputKey !== keyData.key) {
        alert('❌ Invalid key! Please enter the correct key.');
        return;
    }
    
    // Check if key expired
    if (now > keyData.expiry) {
        alert('❌ KEY EXPIRED! This key was valid for 48 hours only.\nPlease generate a new key.');
        localStorage.removeItem('authKeyData'); // Remove expired key
        return;
    }
    
    // Calculate remaining time
    const remainingTime = keyData.expiry - now;
    const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    
    alert(`✅ VERIFICATION SUCCESSFUL!\n\n🔑 Key is valid!\n⏳ Expires in: ${remainingHours}h ${remainingMinutes}m\n📅 Generated on: ${new Date(keyData.generatedAt).toLocaleString()}`);
}

// Initialize on page load
window.onload = function() {
    // Check for existing key and show countdown
    const savedData = localStorage.getItem('authKeyData');
    if (savedData) {
        const keyData = JSON.parse(savedData);
        expiryTime = keyData.expiry;
        startCountdown();
    }
    
    // Replace these with your actual earning shortlinks
    // LINE 84: Replace YOUR_FIRST_SHORTLINK_HERE
    // LINE 95: Replace YOUR_SECOND_SHORTLINK_HERE
    
    // Example:
    // document.querySelector('.task-item:nth-child(1) a').href = "https://your-earning-link1.com";
    // document.querySelector('.task-item:nth-child(2) a').href = "https://your-earning-link2.com";
};
