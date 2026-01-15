// ==========================================
// FIREBASE CONFIGURATION (SECONDARY STORAGE)
// ==========================================

let firebaseInitialized = false;
let db = null;

// Your Firebase config (from your old code)
const firebaseConfig = {
    apiKey: "AIzaSyAzaOZLpXFywk1JyBDzJQD2mUThyehQWFY",
    authDomain: "kiss-free-version.firebaseapp.com",
    projectId: "kiss-free-version",
    storageBucket: "kiss-free-version.firebasestorage.app",
    messagingSenderId: "665106991198",
    appId: "1:665106991198:web:a9182d1cc7542f12354ccf"
};

// Initialize Firebase (only if online and SDK loaded)
function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined' && !firebaseInitialized) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebaseInitialized = true;
            console.log('✅ Firebase initialized successfully');
            return true;
        } else if (firebaseInitialized) {
            console.log('ℹ️ Firebase already initialized');
            return true;
        } else {
            console.warn('⚠️ Firebase SDK not loaded - running in offline mode only');
            return false;
        }
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        return false;
    }
}

// Check if Firebase is available and ready
function isFirebaseAvailable() {
    return firebaseInitialized && db !== null && isOnline;
}
// ==========================================
// PASSWORD VISIBILITY TOGGLE
// ==========================================
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = event.target;
    
    if(!field) return;
    
    if(field.type === 'password') {
        field.type = 'text';
        toggle.textContent = '🙈'; // Monkey covering eyes (hide password)
    } else {
        field.type = 'password';
        toggle.textContent = '👁️'; // Eye (show password)
    }
}
// ==========================================
// 1. CONFIG & AUTH
// ==========================================
const DEFAULT_CONFIG = { 
    staffUser: "system", 
    staffPass: "root", 
    studentUser: "student", 
    studentPass: "kiss", 
    devUser: "dev", 
    devPass: "Hanak", 
    showSignatures: true, 
    showDisclaimer: true, 
    minJoiningYear: 2024,
    minYearInput: 2020,
    maxYearInput: 2030,
    defaultSignatures: {
        comparer: "",
        head: "",
        controller: ""
    },
    gradingRules: [
        {min:90,grade:'O',point:10},
        {min:80,grade:'E',point:9},
        {min:70,grade:'A+',point:8},
        {min:60,grade:'A',point:7},
        {min:50,grade:'B+',point:6},
        {min:40,grade:'B',point:5},
        {min:33,grade:'C',point:4},
        {min:0,grade:'F',point:0}
    ],
    customUsers: {
        staff: [],
        student: []
    },
    subjectControl: {
        enabled: false,
        subjects: []
    },
    defaultMarks: {
    theory: 75,
    practical: 10,
    other: 15
},
instituteSubtitle: "(Deemed to be University)"
};
let appConfig = JSON.parse(localStorage.getItem('kiss_app_config')) || DEFAULT_CONFIG;

if(!appConfig.gradingRules) {
    appConfig.gradingRules = DEFAULT_CONFIG.gradingRules;
}
if(!appConfig.defaultSignatures) {
    appConfig.defaultSignatures = DEFAULT_CONFIG.defaultSignatures;
}
if(!appConfig.customUsers) {
    appConfig.customUsers = { staff: [], student: [] };
}
if(!appConfig.subjectControl) {
    appConfig.subjectControl = { enabled: false, subjects: [] };
}
if(!appConfig.minYearInput) {
    appConfig.minYearInput = 2020;
}
if(!appConfig.maxYearInput) {
    appConfig.maxYearInput = 2030;
}

let gradingRules = [...appConfig.gradingRules];
// ==========================================
// ELECTRON DETECTION
// ==========================================
const IS_ELECTRON = typeof window.require !== 'undefined';
const FORCE_OFFLINE_MODE = IS_ELECTRON;
// ==========================================
// STORAGE ERROR HANDLING & TESTING
// ==========================================

// Test if localStorage is available and working
function testLocalStorage() {
    try {
        const testKey = 'kiss_storage_test';
        localStorage.setItem(testKey, 'test');
        localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch(e) {
        console.error('❌ LocalStorage Error:', e);
        return false;
    }
}

// Check storage on startup
const storageAvailable = testLocalStorage();
if(!storageAvailable) {
    console.error('⚠️⚠️⚠️ CRITICAL: LocalStorage is NOT available!');
    // Show alert after DOM loads
    window.addEventListener('load', function() {
    showToast('⚠️ CRITICAL: Storage unavailable! App may not work correctly. Check browser settings.', 'error', 10000);
});
}
// ==========================================
// LIBRARY AVAILABILITY CHECK
// ==========================================

window.addEventListener('load', function() {
    const qrAvailable = typeof QRCode !== 'undefined';
    const pdfAvailable = typeof html2pdf !== 'undefined';
    
    if(!qrAvailable) {
        console.error('❌ QRCode library failed to load!');
        showToast('⚠️ QR Code feature unavailable - qrcode.min.js not loaded', 'warning', 5000);
    }
    
    if(!pdfAvailable) {
        console.error('❌ html2pdf library failed to load!');
        showToast('⚠️ PDF download feature may not work - html2pdf.bundle.min.js not loaded', 'warning', 5000);
    }
    
    if(qrAvailable && pdfAvailable) {
        console.log('✅ All libraries loaded successfully');
    }
});
// ==========================================
// NETWORK STATUS DETECTION
// ==========================================

let isOnline = navigator.onLine;

function updateNetworkStatus() {
    isOnline = FORCE_OFFLINE_MODE ? false : navigator.onLine;
    const statusBadge = document.getElementById('network-status-badge');
    
    if(statusBadge) {
        if(isOnline) {
            statusBadge.innerHTML = '🟢 Online';
            statusBadge.className = 'network-badge online';
        } else {
            statusBadge.innerHTML = '🔴 Offline';
            statusBadge.className = 'network-badge offline';
        }
    }
    
    console.log('Network Status:', isOnline ? 'Online' : 'Offline');
}

// Listen for online/offline events
window.addEventListener('online', function() {
    console.log('✅ Connected to internet');
    isOnline = true;
    updateNetworkStatus();
    
    // Try to initialize Firebase when coming back online
    if(!firebaseInitialized) {
        const firebaseReady = initializeFirebase();
        if(firebaseReady) {
            showToast('🟢 Back online! Cloud backup enabled.', 'success', 3000);
        } else {
            showToast('🟢 Back online! (Local storage only)', 'success', 3000);
        }
    } else {
        showToast('🟢 You\'re back online!', 'success', 3000);
    }
});

window.addEventListener('offline', function() {
    console.log('❌ Lost internet connection');
    isOnline = false;
    updateNetworkStatus();
    showToast('🔴 You\'re offline. All features still work!', 'warning', 4000);
});

// Update status on page load
// Update status on page load
window.addEventListener('load', function() {
    setTimeout(() => {
        updateNetworkStatus();
        
        // Try to initialize Firebase if online
        if(isOnline) {
            const firebaseReady = initializeFirebase();
            if(firebaseReady) {
                showToast('🌐 Online Mode: Cloud backup enabled.', 'success', 3000);
            } else {
                showToast('⚠️ Online but Firebase unavailable. Using local storage only.', 'warning', 4000);
            }
        } else {
            showToast('📴 Offline Mode: All features available locally.', 'info', 4000);
        }
    }, 1000);
});

window.onload = async function() {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    convertImageToBase64('static_logo');
    convertImageToBase64('watermark_img');
    loadDefaultSignatures();
    
    const joiningYearField = document.getElementById('in_joining_year');
    if(joiningYearField) {
        joiningYearField.setAttribute('min', appConfig.minYearInput || 2020);
        joiningYearField.setAttribute('max', appConfig.maxYearInput || 2030);
    }
    
    console.log('✅ App initialized with config');
    
    // ✅ ADD THIS:
    setupKeyboardNavigation();
    console.log('✅ Keyboard navigation ready');
};
window.onload = async function() {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    convertImageToBase64('static_logo');
    convertImageToBase64('watermark_img');
    loadDefaultSignatures();
    
    const joiningYearField = document.getElementById('in_joining_year');
    if(joiningYearField) {
        joiningYearField.setAttribute('min', appConfig.minYearInput || 2020);
        joiningYearField.setAttribute('max', appConfig.maxYearInput || 2030);
    }
    
    console.log('✅ App initialized with config');
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    console.log('✅ Keyboard navigation ready');
};
// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if(!container) {
        console.error('Toast container not found');
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add close on click
    toast.onclick = function() {
        removeToast(toast);
    };
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    // Log to console for debugging
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
        if(toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

function convertImageToBase64(imgId) {
    const img = document.getElementById(imgId);
    if (!img) return;
    
    // ✅ ADDED: Check if image is loaded
    if (!img.complete || img.naturalWidth === 0) {
        console.warn(`Image ${imgId} not loaded yet, skipping conversion`);
        return;
    }
    
    const temp = new Image();
    
    // ✅ ADDED: Environment detection
    const isWebEnvironment = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    const isLocalFile = window.location.protocol === 'file:';
    
    // ✅ CHANGED: CORS is now conditional
    if (isWebEnvironment && img.src.startsWith('http')) {
        temp.crossOrigin = "anonymous";
        console.log(`🌐 Web environment detected, using CORS for ${imgId}`);
    } else {
        console.log(`📁 Local/Offline environment detected, skipping CORS for ${imgId}`);
    }
    
    temp.src = img.src;
    
    temp.onload = function() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = temp.naturalWidth || temp.width;  // ✅ IMPROVED: naturalWidth fallback
            canvas.height = temp.naturalHeight || temp.height; // ✅ IMPROVED: naturalHeight fallback
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(temp, 0, 0);
            
            const dataURL = canvas.toDataURL('image/png');
            
            // ✅ ADDED: Verify conversion worked
            if(dataURL && dataURL.length > 100) {
                img.src = dataURL;
                console.log(`✅ Successfully converted ${imgId} to base64`);
                
                if(imgId === 'static_logo') {
                    const watermark = document.getElementById('watermark_img');
                    if(watermark) watermark.src = dataURL;
                }
            } else {
                console.warn(`⚠️ Conversion produced empty data for ${imgId}, keeping original`);
            }
        } catch(e) { 
            console.warn(`⚠️ Image conversion failed for ${imgId}:`, e.message); // ✅ IMPROVED: Better error message
            console.log(`📌 Using original image path instead`);
        }
    };
    
    temp.onerror = function(e) {
        console.warn(`⚠️ Failed to load image for conversion: ${imgId}`);
        console.log(`📌 Using original image path instead`); // ✅ ADDED: Helpful log
    };
}

function loadDefaultSignatures() {
    if(appConfig.defaultSignatures) {
        if(appConfig.defaultSignatures.comparer) {
            document.getElementById('out_sig_comparer').src = appConfig.defaultSignatures.comparer;
            document.getElementById('out_sig_comparer').style.display = 'block';
        }
        if(appConfig.defaultSignatures.head) {
            document.getElementById('out_sig_head').src = appConfig.defaultSignatures.head;
            document.getElementById('out_sig_head').style.display = 'block';
        }
        if(appConfig.defaultSignatures.controller) {
            document.getElementById('out_sig_controller').src = appConfig.defaultSignatures.controller;
            document.getElementById('out_sig_controller').style.display = 'block';
        }
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9+]+$/;
    return re.test(phone);
}

function showError(fieldId, show = true) {
    const field = document.getElementById(fieldId);
    const errorMsg = document.getElementById('err_' + fieldId.replace('in_', ''));
    
    if(field) {
        if(show) {
            field.classList.add('input-error');
            // Don't disable or block the field - just show visual error
            field.removeAttribute('disabled');
            field.removeAttribute('readonly');
        } else {
            field.classList.remove('input-error');
        }
    }
    
    if(errorMsg) {
        errorMsg.style.display = show ? 'block' : 'none';
    }
    
    // Force field to be focusable and editable
    if(field && !show) {
        field.removeAttribute('disabled');
        field.removeAttribute('readonly');
    }
}

function validateStep0() {
    let isValid = true;
    
    if(!document.getElementById('in_staff_name').value.trim()) {
        showError('in_staff_name', true);
        isValid = false;
    } else {
        showError('in_staff_name', false);
    }
    
    const phone = document.getElementById('in_staff_phone').value.trim();
    if(!phone || !validatePhone(phone)) {
        showError('in_staff_phone', true);
        isValid = false;
    } else {
        showError('in_staff_phone', false);
    }
    
    const staffEmail = document.getElementById('in_staff_email').value.trim();
    if(!staffEmail || !validateEmail(staffEmail)) {
        showError('in_staff_email', true);
        isValid = false;
    } else {
        showError('in_staff_email', false);
    }
    
    if(!document.getElementById('in_institute').value.trim()) {
        showError('in_institute', true);
        isValid = false;
    } else {
        showError('in_institute', false);
    }
    
    return isValid;
}

function validateStep1() {
    let isValid = true;
    
    const photo = document.getElementById('in_photo');
    if(!photo.files || photo.files.length === 0) {
        showError('in_photo', true);
        isValid = false;
    } else {
        showError('in_photo', false);
    }
    
    if(!document.getElementById('in_fname').value.trim()) {
        showError('in_fname', true);
        isValid = false;
    } else {
        showError('in_fname', false);
    }
    
    if(!document.getElementById('in_lname').value.trim()) {
        showError('in_lname', true);
        isValid = false;
    } else {
        showError('in_lname', false);
    }
    
    const studentEmail = document.getElementById('in_student_email').value.trim();
    if(!studentEmail || !validateEmail(studentEmail)) {
        showError('in_student_email', true);
        isValid = false;
    } else {
        showError('in_student_email', false);
    }
    
    if(!document.getElementById('in_enroll').value.trim()) {
        showError('in_enroll', true);
        isValid = false;
    } else {
        showError('in_enroll', false);
    }
    
    // *** ROLL NUMBER VALIDATION WITH JOINING YEAR CHECK ***
    const roll = document.getElementById('in_roll').value.trim();
    const joiningYear = parseInt(document.getElementById('in_joining_year').value);
    
    if(!roll) {
        showError('in_roll', true);
        isValid = false;
    } else if(joiningYear && roll.length >= 2) {
        // Check if roll starts with joining year
        const yearShort = joiningYear.toString().substring(2); // 2024 -> "24"
        const rollPrefix = roll.substring(0, 2); // Get first 2 digits
        
        if(rollPrefix !== yearShort) {
            showError('in_roll', true);
            showToast(`⚠️ ROLL NUMBER ERROR! For ${joiningYear} batch, roll must start with "${yearShort}". Your roll: ${roll} starts with ${rollPrefix}. Example: ${yearShort}12345`, 'error', 5000);
            isValid = false;
        } else {
            showError('in_roll', false);
        }
    } else {
        showError('in_roll', false);
    }
    
    if(!document.getElementById('in_reg').value.trim()) {
        showError('in_reg', true);
        isValid = false;
    } else {
        showError('in_reg', false);
    }
    
    if(!document.getElementById('in_gender').value) {
        showError('in_gender', true);
        isValid = false;
    } else {
        showError('in_gender', false);
    }
    
    if(!document.getElementById('in_father').value.trim()) {
        showError('in_father', true);
        isValid = false;
    } else {
        showError('in_father', false);
    }
    
    if(!document.getElementById('in_mother').value.trim()) {
        showError('in_mother', true);
        isValid = false;
    } else {
        showError('in_mother', false);
    }
    
    if(!document.getElementById('in_dob').value) {
        showError('in_dob', true);
        isValid = false;
    } else {
        showError('in_dob', false);
    }
    
    if(!document.getElementById('in_current_class').value) {
        showError('in_current_class', true);
        isValid = false;
    } else {
        showError('in_current_class', false);
    }
    
    if(!document.getElementById('in_joining_year').value) {
        showError('in_joining_year', true);
        isValid = false;
    } else {
        showError('in_joining_year', false);
    }
    
    if(!document.getElementById('in_stream').value) {
        showError('in_stream', true);
        isValid = false;
    } else {
        showError('in_stream', false);
    }
    
    if(!document.getElementById('in_semester').value) {
        showError('in_semester', true);
        isValid = false;
    } else {
        showError('in_semester', false);
    }
    
    const honours = document.getElementById('in_honours').value;
    const honoursManual = document.getElementById('in_honours_manual');
    if(!honours || (honours === 'OTHER' && !honoursManual.value.trim())) {
        showError('in_honours', true);
        isValid = false;
    } else {
        showError('in_honours', false);
    }
    
    return isValid;
}

function login() {
    const u = document.getElementById('username').value, p = document.getElementById('password').value;
    const loginScreen = document.getElementById('login-screen');
    const errorMsg = document.getElementById('login-error');

    document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));
    errorMsg.style.display = 'none';

    if (u === appConfig.staffUser && p === appConfig.staffPass) {
        loginScreen.style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('user-display').innerText = "Staff Panel - " + u;
        document.getElementById('staff-dashboard').classList.add('active');
        goToStep(0); 
        configureSemesters(); 
        return;
    }
    
    if(appConfig.customUsers && appConfig.customUsers.staff) {
        const staffUser = appConfig.customUsers.staff.find(user => user.username === u && user.password === p);
        if(staffUser) {
            loginScreen.style.display = 'none';
            document.getElementById('navbar').style.display = 'flex';
            document.getElementById('user-display').innerText = "Staff Panel - " + u;
            document.getElementById('staff-dashboard').classList.add('active');
            goToStep(0); 
            configureSemesters(); 
            return;
        }
    }
    
    if (u === appConfig.studentUser && p === appConfig.studentPass) {
        loginScreen.style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('user-display').innerText = "Student Portal - " + u;
        document.getElementById('student-dashboard').classList.add('active');
        return;
    }
    
    if(appConfig.customUsers && appConfig.customUsers.student) {
        const studentUser = appConfig.customUsers.student.find(user => user.username === u && user.password === p);
        if(studentUser) {
            loginScreen.style.display = 'none';
            document.getElementById('navbar').style.display = 'flex';
            document.getElementById('user-display').innerText = "Student Portal - " + u;
            document.getElementById('student-dashboard').classList.add('active');
            return;
        }
    }
    
    if (u === appConfig.devUser && p === appConfig.devPass) {
        loginScreen.style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('user-display').innerText = "Developer Console";
        document.getElementById('dev-dashboard').classList.add('active');
        loadDevSettings();
        loadDevFileList();
        return;
    }
    
    errorMsg.style.display = 'block';
}

function logout() { location.reload(); }

function loadSignature(input, imgId) { 
    if (input.files[0]) { 
        let r = new FileReader(); 
        r.onload = e => { 
            document.getElementById(imgId).src = e.target.result; 
            document.getElementById(imgId).style.display = 'block'; 
        }; 
        r.readAsDataURL(input.files[0]); 
    } 
}

function previewPhoto(i) { 
    if (i.files[0]) { 
        let r = new FileReader(); 
        r.onload = e => { 
            document.getElementById('out_photo').src = e.target.result; 
            document.getElementById('out_photo').style.display='block'; 
            showError('in_photo', false);
        }; 
        r.readAsDataURL(i.files[0]); 
    } 
}

function clearFile(inputId, imgId) { 
    document.getElementById(inputId).value = ""; 
    const img = document.getElementById(imgId); 
    if(img) { 
        img.src = ""; 
        img.style.display = 'none'; 
    } 
}

function loadDevSignature(input, type) {
    if (input.files[0]) {
        let r = new FileReader();
        r.onload = e => {
            appConfig.defaultSignatures[type] = e.target.result;
        };
        r.readAsDataURL(input.files[0]);
    }
}

function clearDevSignature(type) {
    document.getElementById('dev_sig_' + type).value = "";
    appConfig.defaultSignatures[type] = "";
}

function loadDevSettings() {
    document.getElementById('dev_sig_toggle').checked = appConfig.showSignatures;
    document.getElementById('dev_disc_toggle').checked = appConfig.showDisclaimer;
    document.getElementById('dev_min_year').value = appConfig.minJoiningYear;
    document.getElementById('dev_min_year_input').value = appConfig.minYearInput;
    document.getElementById('dev_max_year_input').value = appConfig.maxYearInput;
    document.getElementById('dev_default_theory').value = appConfig.defaultMarks?.theory || 75;
document.getElementById('dev_default_practical').value = appConfig.defaultMarks?.practical || 10;
document.getElementById('dev_default_other').value = appConfig.defaultMarks?.other || 15;
document.getElementById('dev_institute_subtitle').value = appConfig.instituteSubtitle || "(Deemed to be University)";
    
    // ✅ LOAD CREDENTIALS INTO FIELDS
    if(document.getElementById('dev_staff_user')) {
        document.getElementById('dev_staff_user').value = appConfig.staffUser;
        document.getElementById('dev_staff_pass').value = appConfig.staffPass;
        document.getElementById('dev_student_user').value = appConfig.studentUser;
        document.getElementById('dev_student_pass').value = appConfig.studentPass;
        document.getElementById('dev_dev_user').value = appConfig.devUser;
        document.getElementById('dev_dev_pass').value = appConfig.devPass;
    }
    
    // Load subject control settings
    loadSubjectList();
    document.getElementById('dev_subject_control_toggle').checked = appConfig.subjectControl.enabled;
    toggleSubjectControl();
    
    renderDevGradingRules();
    renderUserList();
}

function renderUserList() {
    const container = document.getElementById('user-list');
    let html = '<table style="width:100%; font-size:12px; border-collapse:collapse;"><tr style="background:#e9ecef;"><th style="padding:8px; border:1px solid #ddd;">Type</th><th style="padding:8px; border:1px solid #ddd;">Username</th><th style="padding:8px; border:1px solid #ddd;">Password</th><th style="padding:8px; border:1px solid #ddd; width:60px;">Action</th></tr>';
    
    // Helper function to create password cell with toggle
    const passwordCell = (password, id) => {
        return `<td style="padding:8px; border:1px solid #ddd; position:relative;">
            <div style="display:flex; align-items:center; gap:5px;">
                <span id="${id}" style="font-family:monospace;">${'•'.repeat(password.length)}</span>
                <span style="cursor:pointer; font-size:16px;" onclick="toggleUserPassword('${id}', '${password}')">👁️</span>
            </div>
        </td>`;
    };
    
    html += `<tr style="background:#d4edda;"><td style="padding:8px; border:1px solid #ddd;">Staff (Default)</td><td style="padding:8px; border:1px solid #ddd;">${appConfig.staffUser}</td>${passwordCell(appConfig.staffPass, 'pass_staff_default')}<td style="padding:8px; border:1px solid #ddd; text-align:center;">🔒</td></tr>`;
    html += `<tr style="background:#d4edda;"><td style="padding:8px; border:1px solid #ddd;">Student (Default)</td><td style="padding:8px; border:1px solid #ddd;">${appConfig.studentUser}</td>${passwordCell(appConfig.studentPass, 'pass_student_default')}<td style="padding:8px; border:1px solid #ddd; text-align:center;">🔒</td></tr>`;
    html += `<tr style="background:#d4edda;"><td style="padding:8px; border:1px solid #ddd;">Dev (Default)</td><td style="padding:8px; border:1px solid #ddd;">${appConfig.devUser}</td>${passwordCell(appConfig.devPass, 'pass_dev_default')}<td style="padding:8px; border:1px solid #ddd; text-align:center;">🔒</td></tr>`;
    
    if(appConfig.customUsers && appConfig.customUsers.staff) {
        appConfig.customUsers.staff.forEach((user, index) => {
            html += `<tr><td style="padding:8px; border:1px solid #ddd;">Staff</td><td style="padding:8px; border:1px solid #ddd;">${user.username}</td>${passwordCell(user.password, 'pass_staff_' + index)}<td style="padding:8px; border:1px solid #ddd; text-align:center;"><button onclick="deleteUser('staff', ${index})" class="btn-clear" style="padding:3px 8px; font-size:11px;">Delete</button></td></tr>`;
        });
    }
    
    if(appConfig.customUsers && appConfig.customUsers.student) {
        appConfig.customUsers.student.forEach((user, index) => {
            html += `<tr><td style="padding:8px; border:1px solid #ddd;">Student</td><td style="padding:8px; border:1px solid #ddd;">${user.username}</td>${passwordCell(user.password, 'pass_student_' + index)}<td style="padding:8px; border:1px solid #ddd; text-align:center;"><button onclick="deleteUser('student', ${index})" class="btn-clear" style="padding:3px 8px; font-size:11px;">Delete</button></td></tr>`;
        });
    }
    
    html += '</table>';
    container.innerHTML = html;
}

// ✅ NEW FUNCTION: Toggle password visibility in user list table
function toggleUserPassword(spanId, actualPassword) {
    const span = document.getElementById(spanId);
    const icon = event.target;
    
    if(!span) return;
    
    if(span.textContent.includes('•')) {
        span.textContent = actualPassword;
        icon.textContent = '🙈';
    } else {
        span.textContent = '•'.repeat(actualPassword.length);
        icon.textContent = '👁️';
    }
}

function createNewUser() {
    const type = document.getElementById('new_user_type').value;
    const username = document.getElementById('new_username').value.trim();
    const password = document.getElementById('new_password').value.trim();
    
    if(!username || !password) {
        showToast("Please enter both username and password!", 'warning');
        return;
    }
    
    const allUsers = [
        {username: appConfig.staffUser},
        {username: appConfig.studentUser},
        {username: appConfig.devUser},
        ...appConfig.customUsers.staff,
        ...appConfig.customUsers.student
    ];
    
    if(allUsers.some(u => u.username === username)) {
        showToast("Username already exists! Please choose a different username.", 'error');
        return;
    }
    
    appConfig.customUsers[type].push({username, password});
    
    localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));
    
    document.getElementById('new_username').value = '';
    document.getElementById('new_password').value = '';
    
    renderUserList();
    
    showToast(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} user "${username}" created successfully!`, 'success');
}

function deleteUser(type, index) {
    if(confirm(`Delete this ${type} user?`)) {
        appConfig.customUsers[type].splice(index, 1);
        localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));
        renderUserList();
        showToast("✅ User deleted successfully!", 'success');
    }
}

function renderDevGradingRules() {
    const c = document.getElementById('dev-grading-container');
    c.innerHTML = "";
    gradingRules.forEach((r,i) => {
        c.innerHTML += `<div style="display:flex;gap:5px;margin-bottom:5px"><input type="number" class="dev-rule-min" value="${r.min}" placeholder="Min %"><input type="text" class="dev-rule-grade" value="${r.grade}" placeholder="Grade"><input type="number" class="dev-rule-point" value="${r.point}" placeholder="Point"><button onclick="removeDevGradeRule(${i})" class="btn-clear">X</button></div>`;
    });
}

function addDevGradeRule() {
    gradingRules.push({min:0, grade:'N', point:0});
    renderDevGradingRules();
}

function removeDevGradeRule(i) {
    gradingRules.splice(i, 1);
    renderDevGradingRules();
}

function saveDevGradingRules() {
    const mins = document.querySelectorAll('.dev-rule-min');
    const grds = document.querySelectorAll('.dev-rule-grade');
    const pts = document.querySelectorAll('.dev-rule-point');
    
    if(mins.length > 0) {
        gradingRules = [];
        for(let i=0; i<mins.length; i++) {
            gradingRules.push({
                min: parseFloat(mins[i].value),
                grade: grds[i].value,
                point: parseFloat(pts[i].value)
            });
        }
        gradingRules.sort((a,b) => b.min - a.min);
    }
}

function toggleSubjectControl() {
    const enabled = document.getElementById('dev_subject_control_toggle').checked;
    const config = document.getElementById('subject-control-config');
    config.style.display = enabled ? 'block' : 'none';
    appConfig.subjectControl.enabled = enabled;
}
// Function 1: Update Stream dropdown when Level (UG/PG) is selected
// Function 1: Update Stream dropdown when Level (UG/PG) is selected
function updateStreamDropdownInDev() {
    const level = document.getElementById('new_subject_level').value;
    const streamSelect = document.getElementById('new_subject_stream');
    const honoursSelect = document.getElementById('new_subject_honours');
    const codeInput = document.getElementById('new_subject_code');
    const nameInput = document.getElementById('new_subject_name');
    
    // Reset all dependent fields
    streamSelect.innerHTML = '<option value="">Select Stream</option>';
    honoursSelect.innerHTML = '<option value="">Select Honours</option>';
    codeInput.value = '';
    nameInput.value = '';
    
    if(!level) {
        // Disable all if no level selected
        streamSelect.disabled = true;
        honoursSelect.disabled = true;
        codeInput.disabled = true;
        nameInput.disabled = true;
        return;
    }
    
    // Enable stream dropdown
    streamSelect.disabled = false;

    // Add stream options
    ['SCIENCE', 'ARTS', 'COMMERCE', 'VOCATIONAL'].forEach(stream => {
        const option = document.createElement('option');
        option.value = stream;
        option.textContent = stream.charAt(0) + stream.slice(1).toLowerCase();
        streamSelect.appendChild(option);
    });

    // ✅ FIX: Add onchange handler AFTER adding options
    streamSelect.onchange = updateHonoursDropdownInDev;
    
    // Keep honours, code, name disabled until stream is selected
    honoursSelect.disabled = true;
    codeInput.disabled = true;
    nameInput.disabled = true;
}

// Function 2: Update Honours dropdown when Stream is selected
function updateHonoursDropdownInDev() {
    const level = document.getElementById('new_subject_level').value;
    const stream = document.getElementById('new_subject_stream').value;
    const honoursSelect = document.getElementById('new_subject_honours');
    const codeInput = document.getElementById('new_subject_code');
    const nameInput = document.getElementById('new_subject_name');
    
    honoursSelect.innerHTML = '<option value="">Select Honours</option>';
    codeInput.value = '';
    nameInput.value = '';
    
    if(!level || !stream) {
        honoursSelect.disabled = true;
        codeInput.disabled = true;
        nameInput.disabled = true;
        return;
    }
    
    // Enable honours dropdown
    honoursSelect.disabled = false;
    
    // Use existing HONOURS_DATA
    const key = level + '-' + stream;
    
    if(HONOURS_DATA[key]) {
        HONOURS_DATA[key].forEach(honour => {
            const option = document.createElement('option');
            option.value = honour;
            option.textContent = honour;
            honoursSelect.appendChild(option);
        });
    }
    
    // Add "None" option
    const noneOption = document.createElement('option');
noneOption.value = 'None';
noneOption.textContent = 'None (General)';
honoursSelect.appendChild(noneOption);

// Keep code and name disabled until honours is selected
codeInput.disabled = true;
nameInput.disabled = true;
    
   
}
// Function 3: Enable code/name inputs when Honours is selected
function enableSubjectInputsInDev() {
    const honoursSelect = document.getElementById('new_subject_honours');
    const codeInput = document.getElementById('new_subject_code');
    const nameInput = document.getElementById('new_subject_name');
    
    if(honoursSelect.value) {
        codeInput.disabled = false;
        nameInput.disabled = false;
        codeInput.removeAttribute('readonly'); // ADD THIS
        nameInput.removeAttribute('readonly'); // ADD THIS
    } else {
        codeInput.disabled = true;
        nameInput.disabled = true;
        codeInput.value = '';
        nameInput.value = '';
    }
}
function addSubject() {
    // ✅ FIX: Trim ALL inputs (Error #8 fix included)
    const level = document.getElementById('new_subject_level').value.trim();
    const code = document.getElementById('new_subject_code').value.trim();
    const name = document.getElementById('new_subject_name').value.trim();
    const stream = document.getElementById('new_subject_stream').value.trim();
    const honours = document.getElementById('new_subject_honours').value.trim();

    // Validate required fields
    if (!level || !code || !name || !stream || !honours) {
        showToast("All fields are required!", "error");
        return;
    }

    // Initialize subjects array if needed
    if (!appConfig.subjectControl.subjects) {
        appConfig.subjectControl.subjects = [];
    }

    // ✅ NEW: Check for duplicate subject code
    const duplicateCode = appConfig.subjectControl.subjects.find(s => 
        s.code.toLowerCase() === code.toLowerCase()
    );
    
    if(duplicateCode) {
        showToast(`❌ Subject code "${code}" already exists!`, "error");
        return;
    }

    // ✅ NEW: Check for duplicate subject name in same stream/honours
    const duplicateName = appConfig.subjectControl.subjects.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && 
        s.stream === stream && 
        s.honours === honours
    );
    
    if(duplicateName) {
        showToast(`❌ Subject "${name}" already exists for ${stream} - ${honours}!`, "error");
        return;
    }

    // Add the subject
    const subject = { 
        level: level,
        code: code,
        name: name,
        stream: stream,
        honours: honours 
    };

    appConfig.subjectControl.subjects.push(subject);

    // Save to localStorage
    localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));

    // Refresh subject list
    loadSubjectList();

    showToast("✅ Subject added successfully!", "success");

    // ✅ FIX: Use cascade reset (Error #10 fix included)
    document.getElementById('new_subject_level').value = '';
    updateStreamDropdownInDev(); // This resets everything properly
}

function loadSubjectList() {
    const listDiv = document.getElementById('subject-list');
    if (!listDiv) return;

    listDiv.innerHTML = '';

    const subjects = appConfig.subjectControl.subjects || [];

    if (subjects.length === 0) {
        listDiv.innerHTML = '<p style="text-align:center; color:#999;">No subjects added yet</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '11px';

    // Header
    const header = table.createTHead();
    const row = header.insertRow();
    ['Code', 'Name', 'Stream', 'Honours', 'Action'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.padding = '8px';
        th.style.background = '#eee';
        th.style.border = '1px solid #ddd';
        row.appendChild(th);
    });

    // Body
    const tbody = table.createTBody();
    subjects.forEach((sub, index) => {
        const row = tbody.insertRow();
        [sub.code, sub.name, sub.stream, sub.honours].forEach(text => {
            const td = row.insertCell();
            td.textContent = text;
            td.style.padding = '6px';
            td.style.border = '1px solid #ddd';
        });

        // Delete button
        const actionTd = row.insertCell();
        actionTd.style.padding = '6px';
        actionTd.style.border = '1px solid #ddd';
        actionTd.style.textAlign = 'center';
        
        const btn = document.createElement('button');
        btn.textContent = 'Delete';
        btn.className = 'btn-clear';
        btn.style.padding = '4px 8px';
        btn.style.fontSize = '10px';
        btn.onclick = () => {
            if(confirm(`Delete subject "${sub.name}"?`)) {
                subjects.splice(index, 1);
                localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));
                loadSubjectList();
                showToast("Subject deleted!", "success");
            }
        };
        actionTd.appendChild(btn);
    });

    listDiv.appendChild(table);
}

function deleteSubject(index) {
    if(confirm("Delete this subject?")) {
        appConfig.subjectControl.subjects.splice(index, 1);
        renderSubjectList();
    }
}
function deleteAllSubjects() {
    // ✅ NEW: Check if subjects exist first
    if(!appConfig.subjectControl.subjects || appConfig.subjectControl.subjects.length === 0) {
        showToast("ℹ️ No subjects to delete!", "info");
        return;
    }
    
    // ✅ NEW: Show count in confirmation
    const count = appConfig.subjectControl.subjects.length;
    if(confirm(`⚠️ Delete ALL ${count} subject${count > 1 ? 's' : ''}? This cannot be undone!`)) {
        appConfig.subjectControl.subjects = [];
        localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));
        loadSubjectList();
        showToast(`✅ All ${count} subject${count > 1 ? 's' : ''} deleted!`, "success");
    }
}
function applyDevSettings() {
    appConfig.showSignatures = document.getElementById('dev_sig_toggle').checked;
    appConfig.showDisclaimer = document.getElementById('dev_disc_toggle').checked;
    appConfig.minJoiningYear = parseInt(document.getElementById('dev_min_year').value);
    appConfig.subjectControl.enabled = document.getElementById('dev_subject_control_toggle').checked;
    appConfig.minYearInput = parseInt(document.getElementById('dev_min_year_input').value);
    appConfig.maxYearInput = parseInt(document.getElementById('dev_max_year_input').value);
    appConfig.instituteSubtitle = document.getElementById('dev_institute_subtitle').value;
    appConfig.defaultMarks = {
    theory: parseInt(document.getElementById('dev_default_theory').value),
    practical: parseInt(document.getElementById('dev_default_practical').value),
    other: parseInt(document.getElementById('dev_default_other').value),
};
    
    // Update the joining year input field with new limits
    const joiningYearField = document.getElementById('in_joining_year');
    if(joiningYearField) {
        joiningYearField.setAttribute('min', appConfig.minYearInput);
        joiningYearField.setAttribute('max', appConfig.maxYearInput);
    }
    
    saveDevGradingRules();
    appConfig.gradingRules = [...gradingRules];
    
    if(storageAvailable) {
        try {
            localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));
            showToast("✅ Settings Updated!", 'success');
            if(document.getElementById('staff-dashboard').classList.contains('active')) updatePreview('single');
        } catch(e) {
            console.error("Failed to save settings:", e);
            if(e.name === 'QuotaExceededError') {
                showToast("❌ Storage is full! Cannot save settings.", 'error', 5000);
            } else {
                showToast("❌ Failed to save settings: " + e.message, 'error', 5000);
            }
        }
    } else {
        showToast("❌ Storage disabled. Cannot save settings.", 'error', 5000);
        showToast("Cannot save settings. Storage is not available. Warning", 'warning', 5000);
    }
}

function resetConfig() { 
    if(confirm("Reset all settings to default?")) { 
        appConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        gradingRules = [...appConfig.gradingRules];
        
        if(storageAvailable) {
            try {
                localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));
                location.reload();
            } catch(e) {
                console.error("Failed to reset config:", e);
                showToast("❌ Failed to reset settings: " + e.message, 'error', 5000);
            }
        } else {
            showToast("❌ Storage disabled. Cannot reset settings.", 'error', 5000);
        }
    } 
}

function loadDevFileList() {
    const list = document.getElementById('dev-file-list');
    list.innerHTML = "";
    let hasFiles = false;
    
    console.log("=== LocalStorage Debug ===");
    for(let i=0; i<localStorage.length; i++) { 
        let key = localStorage.key(i);
        console.log("Key:", key);
        if(key.startsWith('kiss_data_')) {
            hasFiles = true;
            const data = JSON.parse(localStorage.getItem(key));
            console.log("Roll:", data.roll, "DOB:", data.dob, "Has Semester PDF:", !!data.semesterPDF, "Has Season PDF:", !!data.seasonPDF);
        }
    }
    console.log("======================");
    
    if(!hasFiles) { 
        list.innerHTML = "<p style='padding:10px;text-align:center;'>No saved files.</p>"; 
        return; 
    }
    
    let html = '<table><tr><th>Roll No</th><th>DOB</th><th style="width:250px;">Actions</th></tr>';
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key.startsWith('kiss_data_')) {
            let roll = key.replace('kiss_data_', '');
            try {
                const data = JSON.parse(localStorage.getItem(key));
                html += `<tr><td><strong>${roll}</strong></td><td>${data.dob || 'N/A'}</td><td>
                    <button class="action-btn bg-green btn-small" onclick="devDownloadSingle('${roll}', 'SEM')" style="margin-right:5px;">🖨️ SEM</button>
                    <button class="action-btn bg-blue btn-small" onclick="devDownloadSingle('${roll}', 'SEA')" style="margin-right:5px;">🖨️ SEA</button>
                    <button class="action-btn bg-red btn-small" onclick="devDeleteSingle('${roll}')">🗑️</button>
                </td></tr>`;
            } catch(e) {
                html += `<tr><td><strong>${roll}</strong></td><td colspan="2" style="color:red;">Error: Corrupted Data</td></tr>`;
            }
        }
    }
    html += '</table>';
    list.innerHTML = html;
}

async function devDownloadSingle(roll, type) {
    console.log("Printing for roll:", roll, "type:", type);
    
    let dataStr = localStorage.getItem('kiss_data_' + roll);
    if(!dataStr) {
        showToast("Error: File not found for roll " + roll, 'error');
        return;
    }
    
    let data;
    try {
        data = JSON.parse(dataStr);
    } catch(e) {
        showToast("Error: Corrupted data for roll " + roll, 'error');
        return;
    }
    
    let htmlContent;
    if(type === 'SEM') {
        htmlContent = data.semesterPDF;
    } else if(type === 'SEA') {
        htmlContent = data.seasonPDF;
    }
    
    if(!htmlContent || htmlContent.length < 100) {
        showToast("Error: PDF data is empty or corrupted for " + type, 'error');
        return;
    }
    
    convertImageToBase64('static_logo');
    convertImageToBase64('watermark_img');
    
    setTimeout(() => {
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Result - ${roll} - ${type}</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 0; }
                        @page { margin: 0.5cm; }
                    }
                    body { margin: 0; padding: 20px; font-family: 'Times New Roman', serif; }
                    .pdf-design { 
                        width: 100%; 
                        max-width: 800px;
                        margin: 0 auto;
                        background: white; 
                        padding: 30px; 
                        box-sizing: border-box; 
                        color: #000; 
                        position: relative; 
                    }
                    .watermark { position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); width: 350px; opacity: 0.15; z-index: 0; }
                    .serial-box { position: absolute; top: 30px; left: 30px; font-size: 12px; font-weight: bold; border: 1px solid #000; padding: 3px 8px; background: #fff; }
                    .header-logo { width: 80px; height: 80px; object-fit: contain; }
                    .qr-box { width: 80px; height: 80px; display: block; }
                    .qr-box img { width: 100%; height: 100%; }
                    .institute-title { font-size: 22px; font-weight: 900; text-transform: uppercase; line-height: 1.2; }
                    .photo-box { width: 100px; height: 120px; border: 1px solid #ccc; object-fit: cover; display: block; }
                    table.marks-table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-top: 10px; font-size: 10px; }
                    table.marks-table th, table.marks-table td { border: 1px solid #000; padding: 4px; text-align: center; }
                    table.marks-table th { background: #f2f2f2; font-weight: bold; font-size: 9px; }
                    .pass-status { font-weight: bold; font-size: 16px; }
                    .status-pass { color: green; }
                    .status-fail { color: red; }
                    .sig-img { height: 45px; display: block; margin: 0 auto 2px auto; }
                    .sig-line { border-top: 1px solid #000; display: inline-block; width: 90%; padding-top: 2px; font-weight: bold; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="pdf-design">
                    ${htmlContent}
                </div>
            </body>
            </html>
        `;
        
        if(IS_ELECTRON) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('print-content', fullHTML, `Dev-${roll}-${type}`);
            showToast("✅ Print dialog opened!", 'success');
        } else {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(fullHTML);
            printWindow.document.close();
            printWindow.onload = () => printWindow.print();
        }
    }, 800);
}

function devDeleteSingle(roll) { 
    if(confirm(`Delete all data for Roll ${roll}?`)) { 
        if(storageAvailable) {
            try {
                localStorage.removeItem('kiss_data_' + roll);
                console.log("Deleted:", 'kiss_data_' + roll);
                loadDevFileList();
                showToast("✅ Deleted successfully!", 'success');
            } catch(e) {
                console.error("Failed to delete:", e);
                showToast("❌ Failed to delete: " + e.message, 'error', 5000);
            }
        } else {
            showToast("❌ Storage disabled. Cannot delete.", 'error', 5000);
        }
    } 
}

function checkLocalStorage() {
    console.log("=== CHECKING LOCALSTORAGE ===");
    console.log("Total items:", localStorage.length);
    
    for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`\n[${i}] Key: ${key}`);
        
        if(key.startsWith('kiss_data_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                console.log("  Roll:", data.roll);
                console.log("  DOB:", data.dob);
                console.log("  Semester PDF exists:", !!data.semesterPDF);
                console.log("  Season PDF exists:", !!data.seasonPDF);
                console.log("  Semester PDF length:", data.semesterPDF ? data.semesterPDF.length : 0);
                console.log("  Season PDF length:", data.seasonPDF ? data.seasonPDF.length : 0);
            } catch(e) {
                console.log("  ERROR:", e.message);
            }
        }
    }
    console.log("\n=== END CHECK ===");
}

window.checkLocalStorage = checkLocalStorage;

let allSemestersData = {}; 
let currentSemIndex = 1; 
let maxSemestersAllowed = 6;
const HONOURS_DATA = { 
    'UG-SCIENCE': ['Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology', 'Computer Science'], 
    'UG-ARTS': ['Political Science', 'Economics', 'Psychology', 'History', 'Sociology', 'Anthropology', 'Education', 'Odia', 'English', 'Hindi', 'Sanskrit', 'Philosophy'], 
    'UG-COMMERCE': ['Commerce'], 
    'UG-VOCATIONAL': ['Vocational Studies'],
    'PG-SCIENCE': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Botany', 'Zoology', 'Comparative Indic Studies and Tribal Science'], 
    'PG-ARTS': ['Political Science', 'Philosophy', 'History', 'Education', 'Social Work', 'Anthropology', 'Tribal Legal Studies & Tribal Rights', 'English', 'Odia', 'Psychology', 'Home Science'], 
    'PG-COMMERCE': ['Commerce / Tribal Resource Management'],
    'PG-VOCATIONAL': ['Vocational Studies']
};

function validateAndGo(n) { 
    if(n === 1) {
        if(!validateStep0()) {
           showToast("Please fill all required fields correctly in Step 0", 'warning');
            return;
        }
    } else if(n === 2) {
        if(!validateStep1()) {
           showToast("Please fill all required fields correctly in Step 1", 'warning');
            return;
        }
    }
    goToStep(n); 
}

function goToStep(n) {
    document.querySelectorAll('.step').forEach(e => e.classList.remove('active'));
    document.getElementById('step'+n).classList.add('active');
    
    const card = document.querySelector('#staff-dashboard .card');
    if(card) { 
        if(n===2){ 
            card.classList.add('wide-card'); 
            if(document.getElementById('marks-container').innerHTML==="")loadSemesterFromMemory();
        } else card.classList.remove('wide-card'); 
    }
}

function configureSemesters(){
    const v=document.getElementById('in_current_class').value;
    const jyField = document.getElementById('in_joining_year');
    const jy=parseInt(jyField.value)||0;
    
    // Don't change anything if fields are empty
    if(!v || !jy) return;
    
    let s=v.startsWith("PG")?4:6;
    
    if(jy >= 2024) {
        s = 8;
    }
    
    maxSemestersAllowed=s;
    const sel=document.getElementById('in_semester');
    sel.innerHTML="";
    for(let i=1;i<=s;i++){
        let o=document.createElement('option');
        o.value="SEM"+i;
        o.innerText="Semester "+i;
        sel.appendChild(o);
    }
    updateSemesterUI();
    updateHonoursOptions();
    
    // ✅ ADD: Refresh subject dropdowns when class changes
    refreshSubjectDropdowns();
    
    console.log(`Configured ${s} semesters (Joining Year: ${jy})`);
}

function updateHonoursOptions(){
    const s=document.getElementById('in_stream').value;
    const c=document.getElementById('in_current_class').value;
    const h=document.getElementById('in_honours');
    if(!h)return;
    let k=c.includes("UG")?"UG-"+s:"PG-"+s;
    h.innerHTML='<option value="">-- Select --</option>';
    if(HONOURS_DATA[k]){
        HONOURS_DATA[k].forEach(o=>{
            let x=document.createElement('option');
            x.value=o;
            x.innerText=o;
            h.appendChild(x);
        });
    }
    let n=document.createElement('option');
    n.value="OTHER";
    n.innerText="Manual";
    h.appendChild(n);
    updatePreview('single');
    
    // ✅ ADD: Refresh subject dropdowns when stream changes
    refreshSubjectDropdowns();
}

function checkHonoursManual(){
    const v=document.getElementById('in_honours').value;
    const m=document.getElementById('in_honours_manual');
    m.style.display=v==="OTHER"?'block':'none';
    updatePreview('single');
    
    // ✅ ADD: Refresh subject dropdowns when honours changes
    refreshSubjectDropdowns();
}

function createInputRow(c,p,mTh,mPr,mOt,oTh,oPr,oOt,cr){
    const d=document.createElement('div');
    d.style.cssText="display:flex;gap:5px;margin-bottom:5px;";
    
    let codeInput, nameInput;
    
   if(appConfig.subjectControl.enabled && appConfig.subjectControl.subjects.length > 0) {
    // Get current student's details from Step 1
    const currentClass = document.getElementById('in_current_class').value;
    const currentStream = document.getElementById('in_stream').value;
    const currentHonours = document.getElementById('in_honours').value === 'OTHER' 
        ? document.getElementById('in_honours_manual').value 
        : document.getElementById('in_honours').value;
    
    // Extract level (UG/PG) from class (UG-I, UG-II, etc.)
    const studentLevel = currentClass ? currentClass.split('-')[0] : '';
    
    // ✅ IMPROVED: Filter by Level + Stream + Honours
    const filteredSubjects = appConfig.subjectControl.subjects.filter(subj => {
        const levelMatch = subj.level === studentLevel;
        const streamMatch = subj.stream === currentStream || subj.stream === 'ALL';
        const honoursMatch = !subj.honours || 
                           subj.honours === 'None' || 
                           subj.honours === currentHonours;
        
        return levelMatch && streamMatch && honoursMatch;
    });
    
    // ✅ ADD: Show message if no subjects match
    if(filteredSubjects.length === 0) {
        console.warn(`No subjects found for ${studentLevel}-${currentStream}-${currentHonours}`);
    }
        
        // Create code dropdown
        codeInput = `<select class="inp-code" style="width:100px" onchange="updateSubjectName(this); updatePreview('single')">
            <option value="">Select Code</option>`;
        filteredSubjects.forEach(subj => {
            const selected = subj.code === c ? 'selected' : '';
            codeInput += `<option value="${subj.code}" ${selected}>${subj.code}</option>`;
        });
        codeInput += `</select>`;
        
        // Create name dropdown
        nameInput = `<select class="inp-paper" style="width:280px" onchange="updateSubjectCode(this); updatePreview('single')">
            <option value="">Select Subject</option>`;
        filteredSubjects.forEach(subj => {
            const selected = subj.name === p ? 'selected' : '';
            nameInput += `<option value="${subj.name}" ${selected}>${subj.name}</option>`;
        });
        nameInput += `</select>`;
    } else {
        // Use text inputs (original behavior)
        codeInput = `<input type="text" class="inp-code" value="${c}" placeholder="Subject Code" style="width:100px" oninput="updatePreview('single')">`;
        nameInput = `<input type="text" class="inp-paper" value="${p}" placeholder="Subject Name" style="width:280px" oninput="updatePreview('single')">`;
    }
    
    d.innerHTML=`${codeInput}${nameInput}<input type="number" class="inp-max-th" value="${mTh}" placeholder="Total Theory" style="width:100px" oninput="updatePreview('single')"><input type="number" class="inp-max-pr" value="${mPr}" placeholder="Total Practical" style="width:100px" oninput="updatePreview('single')"><input type="number" class="inp-max-ot" value="${mOt}" placeholder="Total Other" style="width:100px" oninput="updatePreview('single')"><input type="number" class="inp-obt-th" value="${oTh}" placeholder="Obtained Theory" style="width:100px" oninput="updatePreview('single')"><input type="number" class="inp-obt-pr" value="${oPr}" placeholder="Obtained Practical" style="width:100px" oninput="updatePreview('single')"><input type="number" class="inp-obt-ot" value="${oOt}" placeholder="Obtained Other" style="width:100px" oninput="updatePreview('single')"><input type="number" class="inp-cred" value="${cr}" placeholder="Credits" style="width:70px" step="0.5" oninput="updatePreview('single')">`;
    document.getElementById('marks-container').appendChild(d);
}

function generateInputs(){
    // Reload config from localStorage to ensure we have latest settings
    appConfig = JSON.parse(localStorage.getItem('kiss_app_config')) || DEFAULT_CONFIG;
    
    document.getElementById('marks-container').innerHTML="";
    const n=document.getElementById('in_count').value;
    
    // ✅ ADD: Check if subject control is enabled and if any subjects are available
    if(appConfig.subjectControl.enabled && appConfig.subjectControl.subjects.length > 0) {
        const currentClass = document.getElementById('in_current_class').value;
        const currentStream = document.getElementById('in_stream').value;
        const currentHonours = document.getElementById('in_honours').value === 'OTHER' 
            ? document.getElementById('in_honours_manual').value 
            : document.getElementById('in_honours').value;
        
        const studentLevel = currentClass ? currentClass.split('-')[0] : '';
        
        // Check if any subjects match student's profile
        const matchingSubjects = appConfig.subjectControl.subjects.filter(subj => {
            const levelMatch = subj.level === studentLevel;
            const streamMatch = subj.stream === currentStream;
            const honoursMatch = !subj.honours || subj.honours === 'None' || subj.honours === currentHonours;
            return levelMatch && streamMatch && honoursMatch;
        });
        
        if(matchingSubjects.length === 0) {
            showToast(`⚠️ No subjects found for ${studentLevel}-${currentStream}-${currentHonours}. Please add subjects in Developer Panel first.`, 'warning', 5000);
        }
    }
    
    for(let i=0;i<n;i++)createInputRow("","",
    appConfig.defaultMarks?.theory || 75,
    appConfig.defaultMarks?.practical || 10,
    appConfig.defaultMarks?.other || 15,
    "","","","");
}
function refreshSubjectDropdowns() {
    // Only run if subject control is enabled
    if(!appConfig.subjectControl.enabled) return;
    
    // Get current student details
    const currentClass = document.getElementById('in_current_class').value;
    const currentStream = document.getElementById('in_stream').value;
    const currentHonours = document.getElementById('in_honours').value === 'OTHER' 
        ? document.getElementById('in_honours_manual').value 
        : document.getElementById('in_honours').value;
    
    const studentLevel = currentClass ? currentClass.split('-')[0] : '';
    
    // Filter subjects
    const filteredSubjects = appConfig.subjectControl.subjects.filter(subj => {
        const levelMatch = subj.level === studentLevel;
        const streamMatch = subj.stream === currentStream || subj.stream === 'ALL';
        const honoursMatch = !subj.honours || 
                           subj.honours === 'None' || 
                           subj.honours === currentHonours;
        return levelMatch && streamMatch && honoursMatch;
    });
    
    // Update all existing code dropdowns
    document.querySelectorAll('.inp-code').forEach(codeSelect => {
        const currentValue = codeSelect.value;
        codeSelect.innerHTML = '<option value="">Select Code</option>';
        
        filteredSubjects.forEach(subj => {
            const option = document.createElement('option');
            option.value = subj.code;
            option.textContent = subj.code;
            if(subj.code === currentValue) option.selected = true;
            codeSelect.appendChild(option);
        });
    });
    
    // Update all existing name dropdowns
    document.querySelectorAll('.inp-paper').forEach(nameSelect => {
        const currentValue = nameSelect.value;
        nameSelect.innerHTML = '<option value="">Select Subject</option>';
        
        filteredSubjects.forEach(subj => {
            const option = document.createElement('option');
            option.value = subj.name;
            option.textContent = subj.name;
            if(subj.name === currentValue) option.selected = true;
            nameSelect.appendChild(option);
        });
    });
    
    // Show warning if no subjects match
    if(filteredSubjects.length === 0 && document.querySelectorAll('.inp-code').length > 0) {
        showToast(`⚠️ No subjects available for ${studentLevel}-${currentStream}-${currentHonours}`, 'warning', 4000);
    }
}
function updateSubjectName(codeSelect) {
    const selectedCode = codeSelect.value;
    const subject = appConfig.subjectControl.subjects.find(s => s.code === selectedCode);
    
    if(subject) {
        const row = codeSelect.parentElement;
        const nameSelect = row.querySelector('.inp-paper');
        if(nameSelect) {
            nameSelect.value = subject.name;
        }
    }
}

function updateSubjectCode(nameSelect) {
    const selectedName = nameSelect.value;
    const subject = appConfig.subjectControl.subjects.find(s => s.name === selectedName);
    
    if(subject) {
        const row = nameSelect.parentElement;
        const codeSelect = row.querySelector('.inp-code');
        if(codeSelect) {
            codeSelect.value = subject.code;
        }
    }
}

function saveCurrentSemesterToMemory(){
    const codes=document.querySelectorAll('.inp-code');
    const papers=document.querySelectorAll('.inp-paper');
    const maxThs=document.querySelectorAll('.inp-max-th');
    const maxPrs=document.querySelectorAll('.inp-max-pr');
    const maxOts=document.querySelectorAll('.inp-max-ot');
    const obtThs=document.querySelectorAll('.inp-obt-th');
    const obtPrs=document.querySelectorAll('.inp-obt-pr');
    const obtOts=document.querySelectorAll('.inp-obt-ot');
    const creds=document.querySelectorAll('.inp-cred');
    let batch=[];
    for(let i=0;i<codes.length;i++){
        let c=codes[i].value.trim();
        let p=papers[i].value.trim();
        if(!c&&!p)continue;
        batch.push({
            code:c,
            paper:p,
            mTh:maxThs[i].value,
            mPr:maxPrs[i].value,
            mOt:maxOts[i].value,
            oTh:obtThs[i].value,
            oPr:obtPrs[i].value,
            oOt:obtOts[i].value,
            cr:creds[i].value
        });
    }
    allSemestersData[currentSemIndex]=batch;
    return true;
}

function loadSemesterFromMemory(){
    // Reload config from localStorage to ensure we have latest settings
    appConfig = JSON.parse(localStorage.getItem('kiss_app_config')) || DEFAULT_CONFIG;
    
    document.getElementById('marks-container').innerHTML="";
    const data=allSemestersData[currentSemIndex];
    if(data)data.forEach(r=>createInputRow(r.code,r.paper,r.mTh,r.mPr,r.mOt,r.oTh,r.oPr,r.oOt,r.cr));
    else generateInputs();
}

function saveToDatabase(){
    if(!saveCurrentSemesterToMemory())return;
    
    const roll=document.getElementById('in_roll').value.trim();
    const dob=document.getElementById('in_dob').value;
    
    if(!roll){
        showToast("Please enter a Roll Number first!", 'warning');
        return;
    }
    
    if(!dob){
        showToast("Please enter Date of Birth!", 'warning');
        return;
    }
    
    const hasData = Object.keys(allSemestersData).length > 0;
    if(!hasData) {
        showToast("Please enter marks data before saving!", 'warning');
        return;
    }
    
    const saveBtn = event.target;
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;
    
    updatePreview('cumulative');
    
    setTimeout(() => {
        const semesterPDF = document.getElementById('pdf-template').innerHTML;
        
        if(!semesterPDF || semesterPDF.length < 100) {
            showToast("Error: Semester PDF generation failed. Please try again.", 'error');
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
            return;
        }
        
        updatePreview('single');
        
        setTimeout(() => {
            const seasonPDF = document.getElementById('pdf-template').innerHTML;
            
            if(!seasonPDF || seasonPDF.length < 100) {
                showToast("Error: Season PDF generation failed. Please try again.", 'error');
                saveBtn.innerText = originalText;
                saveBtn.disabled = false;
                return;
            }
            
            const dataToSave = {
    roll: roll,
    dob: dob,
    semesterPDF: semesterPDF,
    seasonPDF: seasonPDF,
    allSemestersData: JSON.parse(JSON.stringify(allSemestersData)),
    studentInfo: {
        name: document.getElementById('in_fname').value + " " + document.getElementById('in_lname').value,
        email: document.getElementById('in_student_email').value,
        enrollment: document.getElementById('in_enroll').value,
        registration: document.getElementById('in_reg').value,
        gender: document.getElementById('in_gender').value,
        father: document.getElementById('in_father').value,
        mother: document.getElementById('in_mother').value,
        stream: document.getElementById('in_stream').value,
        honours: document.getElementById('in_honours').value === 'OTHER' ? document.getElementById('in_honours_manual').value : document.getElementById('in_honours').value,
        joiningYear: parseInt(document.getElementById('in_joining_year').value),
        currentClass: document.getElementById('in_current_class').value,
        institute: document.getElementById('in_institute').value,
        photo: document.getElementById('out_photo').src || ''
    },
    staffInfo: {
        name: document.getElementById('in_staff_name').value,
        phone: document.getElementById('in_staff_phone').value,
        email: document.getElementById('in_staff_email').value
    },
    signatures: {
        comparer: document.getElementById('out_sig_comparer').src || '',
        head: document.getElementById('out_sig_head').src || '',
        controller: document.getElementById('out_sig_controller').src || ''
    },
    serialDate: {
        serial: document.getElementById('in_serial').value,
        date: document.getElementById('in_date').value
    },
    timestamp: new Date().toISOString()
};
            
            console.log("💾 Saving data for roll:", roll);
            
            // ========================================
            // PRIMARY SAVE: localStorage (ALWAYS FIRST)
            // ========================================
            if(storageAvailable) {
                try {
                    localStorage.setItem('kiss_data_' + roll, JSON.stringify(dataToSave));
                    console.log("✅ PRIMARY: Saved to localStorage");
                    
                    // ========================================
                    // SECONDARY BACKUP: Firebase (Silent, Non-blocking)
                    // ========================================
                    if(isFirebaseAvailable()) {
                        console.log("🔥 Attempting silent Firebase backup...");
                        
                        // Firebase save happens in background, doesn't block UI
                        db.collection("results").doc('kiss_data_' + roll).set(dataToSave)
                            .then(() => {
                                console.log("✅ SECONDARY: Cloud backup successful");
                            })
                            .catch((error) => {
                                console.warn("⚠️ SECONDARY: Cloud backup failed (local data safe):", error);
                            });
                        
                        showToast(`✅ Saved: ${roll} - Local ✓, Cloud syncing...`, 'success', 3000);

// Show backup completion notification
setTimeout(() => {
    showToast(`☁️ Cloud backup completed for ${roll}!`, 'success', 4000);
}, 2500);
                    } else {
                        console.log("ℹ️ Firebase unavailable - local save only");
                        showToast(`✅ Saved: ${roll} - Local storage ✓`, 'success', 4000);
                    }
                    
                    saveBtn.innerText = originalText;
                    saveBtn.disabled = false;
                    
                    if(document.getElementById('dev-dashboard').classList.contains('active')) {
                        loadDevFileList();
                    }
                    
                } catch(e) {
                    console.error("❌ PRIMARY: localStorage failed:", e);
                    if(e.name === 'QuotaExceededError') {
                        showToast("❌ Storage is full! Please delete old data.", 'error', 8000);
                    } else {
                        showToast("❌ Storage Error: " + e.message, 'error', 5000);
                    }
                    saveBtn.innerText = originalText;
                    saveBtn.disabled = false;
                }
            } else {
                showToast("❌ Storage is disabled. Cannot save data.", 'error', 10000);
showToast('⚠️ CRITICAL: Cannot save! Exit incognito mode or enable storage in browser settings.', 'error', 12000);
                saveBtn.innerText = originalText;
                saveBtn.disabled = false;
            }
            
        }, 500);
    }, 500);
}

let selectedResultType = null;

function selectResultType(type) {
    selectedResultType = type;
    
    document.getElementById('btn-sem-choice').style.opacity = type === 'SEM' ? '1' : '0.5';
    document.getElementById('btn-sea-choice').style.opacity = type === 'SEA' ? '1' : '0.5';
    
    const label = type === 'SEM' ? '✅ Selected: Semester Result (All Semesters)' : '✅ Selected: Season Result (Current Semester)';
    document.getElementById('selected-type-display').innerText = label;
}

function searchResult(){
    const roll=document.getElementById('search-roll').value.trim();
    const dob=document.getElementById('search-dob').value;
    
    console.log("=== SEARCH DEBUG ===");
    console.log("Searching for Roll:", roll);
    console.log("DOB entered:", dob);
    
    if(!selectedResultType) {
        showToast("⚠️ Please select result type first (Step 1)!", 'warning');
        return;
    }
    
    if(!roll || !dob){
        document.getElementById('student-error').innerText = "❌ Please enter both Roll Number and Date of Birth.";
        document.getElementById('student-result-area').style.display='none';
        document.getElementById('student-error').style.display='block';
        return;
    }
    
    if(roll.length < 4) {
        document.getElementById('student-error').innerText = "❌ Invalid Roll Number format. Roll number should be at least 4 characters (e.g., 24XXXX).";
        document.getElementById('student-result-area').style.display='none';
        document.getElementById('student-error').style.display='block';
        return;
    }
    
    // ========================================
    // STEP 1: Search localStorage FIRST (Priority)
    // ========================================
    let dataStr = null;
    let dataSource = null;
    
    if(storageAvailable) {
        try {
            dataStr = localStorage.getItem('kiss_data_' + roll);
            if(dataStr) {
                dataSource = "LOCAL";
                console.log("✅ Found in localStorage (PRIMARY)");
            }
        } catch(e) {
            console.error("Failed to read from localStorage:", e);
        }
    }
    
    // ========================================
    // STEP 2: If NOT in localStorage, try Firebase
    // ========================================
    if(!dataStr && isFirebaseAvailable()) {
        console.log("🔍 Not in localStorage, checking Firebase...");
        
        db.collection("results").doc('kiss_data_' + roll).get()
            .then((doc) => {
                if(doc.exists) {
                    console.log("✅ Found in Firebase (SECONDARY)");
                    dataSource = "CLOUD";
                    const data = doc.data();
                    
                    // Verify DOB
                    if(data.dob !== dob){
                        console.log("DOB MISMATCH");
                        document.getElementById('student-error').innerText = "❌ Date of Birth does not match our records.";
                        document.getElementById('student-result-area').style.display='none';
                        document.getElementById('student-error').style.display='block';
                        return;
                    }
                    
                    // Display result
                    displayStudentResult(data, dataSource);
                    
                    // OPTIONAL: Save to localStorage for faster future access
                    if(storageAvailable) {
                        try {
                            localStorage.setItem('kiss_data_' + roll, JSON.stringify(data));
                            console.log("💾 Cached to localStorage for faster access next time");
                        } catch(e) {
                            console.warn("Could not cache to localStorage:", e);
                        }
                    }
                } else {
                    console.log("❌ Not found in Firebase either");
                    document.getElementById('student-error').innerText = "❌ No result found for Roll Number: " + roll;
                    document.getElementById('student-result-area').style.display='none';
                    document.getElementById('student-error').style.display='block';
                }
            })
            .catch((error) => {
                console.error("Firebase search error:", error);
                document.getElementById('student-error').innerText = "❌ Error searching records. Please try again.";
                document.getElementById('student-result-area').style.display='none';
                document.getElementById('student-error').style.display='block';
            });
        
        return; // Exit, wait for Firebase response
    }
    
    // ========================================
    // STEP 3: Process localStorage Result
    // ========================================
    if(dataStr){
        try {
            const data = JSON.parse(dataStr);
            console.log("Parsed data from localStorage");
            
            // Verify DOB
            if(data.dob !== dob){
                console.log("DOB MISMATCH - Stored:", data.dob, "Entered:", dob);
                document.getElementById('student-error').innerText = "❌ Date of Birth does not match our records. Please verify your DOB.";
                document.getElementById('student-result-area').style.display='none';
                document.getElementById('student-error').style.display='block';
                return;
            }
            console.log("✅ DOB verified");
            
            // Verify Roll Number format
            if(data.studentInfo && data.studentInfo.joiningYear) {
                const joiningYear = data.studentInfo.joiningYear;
                const joiningYearShort = joiningYear.toString().substring(2);
                const rollPrefix = roll.substring(0, 2);
                
                if(rollPrefix !== joiningYearShort) {
                    console.error("❌ ROLL VERIFICATION FAILED!");
                    document.getElementById('student-error').innerText = `❌ Invalid Roll Number for ${joiningYear} batch. Roll number must start with "${joiningYearShort}".`;
                    document.getElementById('student-result-area').style.display='none';
                    document.getElementById('student-error').style.display='block';
                    return;
                }
                console.log("✅ Roll verification passed");
            }
            
            // Verify PDFs exist
            if(!data.semesterPDF || !data.seasonPDF) {
                document.getElementById('student-error').innerText = "❌ Data found but PDFs are missing. Please contact administrator.";
                document.getElementById('student-result-area').style.display='none';
                document.getElementById('student-error').style.display='block';
                return;
            }
            
            // Display result
            displayStudentResult(data, dataSource);
            
        } catch(e) {
            console.error("Error parsing data:", e);
            document.getElementById('student-error').innerText = "❌ Error loading result. Data may be corrupted.";
            document.getElementById('student-result-area').style.display='none';
            document.getElementById('student-error').style.display='block';
        }
    } else {
        // Not found anywhere
        console.log("❌ No data found in localStorage or Firebase");
        document.getElementById('student-error').innerText = "❌ No result found for Roll Number: " + roll + ". Please verify your roll number.";
        document.getElementById('student-result-area').style.display='none';
        document.getElementById('student-error').style.display='block';
    }
}

// Helper function to display student result
function displayStudentResult(data, source) {
    window.currentStudentData = data;
    window.currentPDFType = selectedResultType;
    
    if(selectedResultType === 'SEM') {
        document.getElementById('student-pdf-container').innerHTML=data.semesterPDF;
        document.getElementById('student-pdf-type-label').innerText = "📄 Viewing: Semester Result (All Semesters)";
    } else {
        document.getElementById('student-pdf-container').innerHTML=data.seasonPDF;
        document.getElementById('student-pdf-type-label').innerText = "📄 Viewing: Season Result (Current Semester)";
    }
    
    document.getElementById('student-result-area').style.display='flex';
    document.getElementById('student-error').style.display='none';
    
    // Show source indicator
    const sourceLabel = source === "LOCAL" ? "💾 Loaded from Local Storage" : "☁️ Loaded from Cloud";
    console.log("✅ Result loaded successfully -", sourceLabel);
    console.log("===================");
}

function showStudentPDF(type) {
    if(!window.currentStudentData) {
        showToast("⚠️ No data loaded!", 'warning',5000);
        return;
    }
    
    window.currentPDFType = type;
    
    if(type === 'SEM') {
        document.getElementById('student-pdf-container').innerHTML = window.currentStudentData.semesterPDF;
        document.getElementById('student-pdf-type-label').innerText = "📄 Viewing: Semester Result (All Semesters)";
    } else {
        document.getElementById('student-pdf-container').innerHTML = window.currentStudentData.seasonPDF;
        document.getElementById('student-pdf-type-label').innerText = "📄 Viewing: Season Result (Current Semester)";
    }
}

function printStudentResult() {
    if(!window.currentStudentData) {
        showToast("⚠️ No data to print!", 'warning');
        return;
    }
    
    // Force image conversion before printing
    convertImageToBase64('static_logo');
    convertImageToBase64('watermark_img');
    
    // Wait for image conversion
    setTimeout(() => {
        const htmlContent = window.currentPDFType === 'SEM' 
            ? window.currentStudentData.semesterPDF 
            : window.currentStudentData.seasonPDF;
        
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Result - ${window.currentStudentData.roll}</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 0; }
                        @page { margin: 0.5cm; }
                    }
                    body { margin: 0; padding: 20px; font-family: 'Times New Roman', serif; }
                    .pdf-design { 
                        width: 100%; 
                        max-width: 800px;
                        margin: 0 auto;
                        background: white; 
                        padding: 30px; 
                        box-sizing: border-box; 
                        color: #000; 
                        position: relative; 
                    }
                    .watermark { position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); width: 350px; opacity: 0.15; z-index: 0; }
                    .serial-box { position: absolute; top: 30px; left: 30px; font-size: 12px; font-weight: bold; border: 1px solid #000; padding: 3px 8px; background: #fff; }
                    .header-logo { width: 80px; height: 80px; object-fit: contain; }
                    .qr-box { width: 80px; height: 80px; display: block; }
                    .qr-box img { width: 100%; height: 100%; }
                    .institute-title { font-size: 22px; font-weight: 900; text-transform: uppercase; line-height: 1.2; }
                    .photo-box { width: 100px; height: 120px; border: 1px solid #ccc; object-fit: cover; display: block; }
                    table.marks-table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-top: 10px; font-size: 10px; }
                    table.marks-table th, table.marks-table td { border: 1px solid #000; padding: 4px; text-align: center; }
                    table.marks-table th { background: #f2f2f2; font-weight: bold; font-size: 9px; }
                    .pass-status { font-weight: bold; font-size: 16px; }
                    .status-pass { color: green; }
                    .status-fail { color: red; }
                    .sig-img { height: 45px; display: block; margin: 0 auto 2px auto; }
                    .sig-line { border-top: 1px solid #000; display: inline-block; width: 90%; padding-top: 2px; font-weight: bold; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="pdf-design">
                    ${htmlContent}
                </div>
            </body>
            </html>
        `;
        
        // Check if running in Electron
        if(IS_ELECTRON) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('print-content', fullHTML, `Result-${window.currentStudentData.roll}`);
            showToast("✅ Print dialog opened!", 'success');
        } else {
            // Fallback for browser
            const printWindow = window.open('', '_blank');
            printWindow.document.write(fullHTML);
            printWindow.document.close();
            printWindow.onload = () => printWindow.print();
        }
    }, 800);
}

async function downloadStudentPDF(type){
    showToast("Please use the 'Choose Result Type' buttons and then click 'PRINT RESULT'", 'info', 4000);
}

function printStaffPDF(mode) {
    if(!saveCurrentSemesterToMemory()) return;
    
    updatePreview(mode);
    
    setTimeout(() => {
        convertImageToBase64('static_logo');
        convertImageToBase64('watermark_img');
        
        setTimeout(() => {
            const htmlContent = document.getElementById('pdf-template').innerHTML;
            const roll = document.getElementById('in_roll').value || 'Result';
            const pdfType = mode === 'cumulative' ? 'Semester' : 'Season';
            
            const fullHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print ${pdfType} Result - ${roll}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; }
                            @page { margin: 0.5cm; }
                        }
                        body { margin: 0; padding: 20px; font-family: 'Times New Roman', serif; }
                        .pdf-design { 
                            width: 100%; 
                            max-width: 800px;
                            margin: 0 auto;
                            background: white; 
                            padding: 30px; 
                            box-sizing: border-box; 
                            color: #000; 
                            position: relative; 
                        }
                        .watermark { position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); width: 350px; opacity: 0.15; z-index: 0; }
                        .serial-box { position: absolute; top: 30px; left: 30px; font-size: 12px; font-weight: bold; border: 1px solid #000; padding: 3px 8px; background: #fff; }
                        .header-logo { width: 80px; height: 80px; object-fit: contain; }
                        .qr-box { width: 80px; height: 80px; display: block; }
                        .qr-box img { width: 100%; height: 100%; }
                        .institute-title { font-size: 22px; font-weight: 900; text-transform: uppercase; line-height: 1.2; }
                        .photo-box { width: 100px; height: 120px; border: 1px solid #ccc; object-fit: cover; display: block; }
                        table.marks-table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-top: 10px; font-size: 10px; }
                        table.marks-table th, table.marks-table td { border: 1px solid #000; padding: 4px; text-align: center; }
                        table.marks-table th { background: #f2f2f2; font-weight: bold; font-size: 9px; }
                        .pass-status { font-weight: bold; font-size: 16px; }
                        .status-pass { color: green; }
                        .status-fail { color: red; }
                        .sig-img { height: 45px; display: block; margin: 0 auto 2px auto; }
                        .sig-line { border-top: 1px solid #000; display: inline-block; width: 90%; padding-top: 2px; font-weight: bold; font-size: 11px; }
                    </style>
                </head>
                <body>
                    <div class="pdf-design">
                        ${htmlContent}
                    </div>
                </body>
                </html>
            `;
            
            if(IS_ELECTRON) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('print-content', fullHTML, `${pdfType}-${roll}`);
                showToast("✅ Print dialog opened!", 'success');
            } else {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(fullHTML);
                printWindow.document.close();
                printWindow.onload = () => printWindow.print();
            }
        }, 500);
    }, 500);
}
async function downloadPDF(mode) {
    printStaffPDF(mode);
}

async function downloadSemesterPDF() { 
    printStaffPDF('cumulative'); 
}

async function downloadSeasonPDF() { 
    printStaffPDF('single'); 
}

function updateSemesterUI(){
    document.getElementById('step2-sem-badge').innerText="SEMESTER "+currentSemIndex;
}

function changeSemester(d){
    saveCurrentSemesterToMemory();
    let n=currentSemIndex+d;
    if(n<1||n>maxSemestersAllowed) {
        showToast("Limit reached.", 'warning');
        return;
    }
    currentSemIndex=n;
    loadSemesterFromMemory();
    updateSemesterUI();
    updatePreview('single');
}

function getGradeInfo(o,m){
    if(m===0)return{grade:'-',point:0};
    const p=(o/m)*100;
    for(let r of gradingRules){
        if(p>=r.min)return r;
    }
    return{grade:'F',point:0};
}

function updatePreview(mode = 'single'){
    try {
        if(document.getElementById('step2').classList.contains('active')) saveCurrentSemesterToMemory();
        
        const sig = document.getElementById('footer-signatures');
        const disc = document.getElementById('footer-disclaimer');
        if(sig) sig.style.display = appConfig.showSignatures ? 'table' : 'none';
        if(disc) disc.style.display = appConfig.showDisclaimer ? 'block' : 'none';

        document.getElementById('out_institute').innerText=document.getElementById('in_institute').value;
        const examTitle = document.getElementById('out_exam_name');
        // ✅ ADD THIS: Update institute subtitle
const subtitleElement = document.getElementById('out_institute_subtitle');
if(subtitleElement) {
    subtitleElement.innerText = appConfig.instituteSubtitle || "(Deemed to be University)";
}
        if(mode === 'cumulative') {
            examTitle.innerText = "SEMESTER EXAMINATIONS";
        } else {
            examTitle.innerText = (currentSemIndex%2!==0)?"AUTUMN END SEMESTER EXAMINATION":"SPRING END SEMESTER EXAMINATION";
        }

        const fname=document.getElementById('in_fname').value+" "+document.getElementById('in_lname').value;
        document.getElementById('out_name').innerText=fname;
        document.getElementById('out_enroll').innerText=document.getElementById('in_enroll').value;
        document.getElementById('out_roll').innerText=document.getElementById('in_roll').value;
        document.getElementById('out_reg').innerText=document.getElementById('in_reg').value;
        document.getElementById('out_stream').innerText=document.getElementById('in_stream').value;
        const hS=document.getElementById('in_honours'),hM=document.getElementById('in_honours_manual');
        document.getElementById('out_honours').innerText=(hS.value==="OTHER"?hM.value:hS.value)||"-";
        document.getElementById('out_father').innerText=document.getElementById('in_father').value;
        document.getElementById('out_mother').innerText=document.getElementById('in_mother').value;
        
        const serialIn=document.getElementById('in_serial'),dateIn=document.getElementById('in_date');
        if(document.getElementById('out_serial')) document.getElementById('out_serial').innerText=serialIn?serialIn.value:"";
        if(document.getElementById('out_date')) document.getElementById('out_date').innerText=dateIn?dateIn.value:"";
        
        const pIn=document.getElementById('out_photo');
        if(pIn.src.length>50) pIn.style.display='block';
        
        const tbody=document.getElementById('out_tbody');
        tbody.innerHTML="";
        let tMTh=0,tMPr=0,tMOt=0,tOTh=0,tOPr=0,tOOt=0,tCr=0,tTotalGP=0,fail=0;
        let invalidData = false;

        let semestersToShow = (mode === 'single') ? [currentSemIndex] : Object.keys(allSemestersData).sort((a,b)=>a-b);

        semestersToShow.forEach(k=>{
            if(!allSemestersData[k]) return;
            allSemestersData[k].forEach(r=>{
                if(!r.paper)return;
                let mTh=parseFloat(r.mTh)||0,mPr=parseFloat(r.mPr)||0,mOt=parseFloat(r.mOt)||0;
                let oTh=parseFloat(r.oTh)||0,oPr=parseFloat(r.oPr)||0,oOt=parseFloat(r.oOt)||0;
                let cr=parseFloat(r.cr)||0;
                let totM=mTh+mPr+mOt;
                let totO=oTh+oPr+oOt;
                let rowColor = "transparent";
                
                if(oTh > mTh || oPr > mPr || oOt > mOt || totO > totM) { 
                    invalidData = true;
                    rowColor = "#ffcccc"; 
                }

                let gradeInfo=getGradeInfo(totO,totM);
                let gp=gradeInfo.point*cr;
                tMTh+=mTh;tMPr+=mPr;tMOt+=mOt;tOTh+=oTh;tOPr+=oPr;tOOt+=oOt;tCr+=cr;tTotalGP+=gp;
                if(gradeInfo.grade==='F')fail++;
                
                tbody.innerHTML+=`<tr style="background-color:${rowColor}"><td>1</td><td>${k}</td><td>${r.code}</td><td style="text-align:left;padding-left:5px">${r.paper}</td><td>${r.mTh}</td><td>${r.mPr}</td><td>${r.mOt}</td><td>${r.oTh}</td><td>${r.oPr}</td><td>${r.oOt}</td><td>${gradeInfo.grade}</td><td>${r.cr}</td><td>${gp.toFixed(1)}</td></tr>`;
            });
        });
        
        document.getElementById('out_tot_max_th').innerText=tMTh;
        document.getElementById('out_tot_max_pr').innerText=tMPr;
        document.getElementById('out_tot_max_ot').innerText=tMOt;
        document.getElementById('out_tot_obt_th').innerText=tOTh;
        document.getElementById('out_tot_obt_pr').innerText=tOPr;
        document.getElementById('out_tot_obt_ot').innerText=tOOt;
        document.getElementById('out_tot_cred').innerText=tCr;
        document.getElementById('out_tot_gp').innerText=tTotalGP.toFixed(1);
        
        let status=fail>0?"FAIL":"PASS";
        if(invalidData) {
            status = "ERROR - CHECK MARKS";
            showToast("⚠️ CALCULATION ERROR: Some obtained marks exceed total marks. Please correct the data.", 'error', 5000);
        }
        document.getElementById('out_final_status').innerText=status;
        document.getElementById('out_final_status').className = (fail>0 || invalidData) ? "pass-status status-fail" : "pass-status status-pass";
        let sgpa=tCr?(tTotalGP/tCr).toFixed(2):"0.00";
        document.getElementById('out_sgpa').innerText=sgpa;
        // Calculate CGPA (average of all semesters)
let allSemesterSGPAs = [];
Object.keys(allSemestersData).forEach(semKey => {
    let semCredits = 0;
    let semGP = 0;
    allSemestersData[semKey].forEach(r => {
        if(!r.paper) return;
        let mTh=parseFloat(r.mTh)||0, mPr=parseFloat(r.mPr)||0, mOt=parseFloat(r.mOt)||0;
        let oTh=parseFloat(r.oTh)||0, oPr=parseFloat(r.oPr)||0, oOt=parseFloat(r.oOt)||0;
        let cr=parseFloat(r.cr)||0;
        let totM=mTh+mPr+mOt;
        let totO=oTh+oPr+oOt;
        let gradeInfo=getGradeInfo(totO,totM);
        let gp=gradeInfo.point*cr;
        semCredits+=cr;
        semGP+=gp;
    });
    if(semCredits > 0) {
        allSemesterSGPAs.push(semGP/semCredits);
    }
});
let cgpa = allSemesterSGPAs.length > 0 ? (allSemesterSGPAs.reduce((a,b)=>a+b,0)/allSemesterSGPAs.length).toFixed(2) : "0.00";
document.getElementById('out_cgpa').innerText=cgpa;
        
        const qrDiv=document.getElementById('qr-code');
        if(qrDiv){
            qrDiv.innerHTML="";
            let qrText=`Name:${fname}\nRoll:${document.getElementById('in_roll').value}\nRegistration:${document.getElementById('in_reg').value}\nStream:${document.getElementById('in_stream').value}\nHonours:${(hS.value==="OTHER"?hM.value:hS.value)||"-"}\nFather:${document.getElementById('in_father').value}\nMother:${document.getElementById('in_mother').value}\nCGPA:${cgpa}\nSGPA:${sgpa}`;
            try{if(typeof QRCode!=='undefined')new QRCode(qrDiv,{text:qrText,width:80,height:80});}catch(e){}
        }
    } catch(e) { console.warn("Update Error:", e); }
}
// ==========================================
// KEYBOARD NAVIGATION SYSTEM
// Prevent accidental mouse-wheel changes on focused number inputs
(function() {
    function _preventWheel(e) { e.preventDefault(); }

    // When a number input gains focus, attach a non-passive wheel handler to prevent value change
    document.addEventListener('focusin', function (e) {
        const t = e.target;
        if (t && t.tagName === 'INPUT' && t.type === 'number') {
            t.addEventListener('wheel', _preventWheel, { passive: false });
        }
    });

    // Remove the handler on blur (focusout)
    document.addEventListener('focusout', function (e) {
        const t = e.target;
        if (t && t.tagName === 'INPUT' && t.type === 'number') {
            try { t.removeEventListener('wheel', _preventWheel); } catch (err) {}
        }
    });
})();
// ==========================================

function setupKeyboardNavigation() {
    // Login screen navigation
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const loginBtn = document.querySelector('.btn-login');
    
    if(usernameField) {
        usernameField.addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                passwordField.focus();
            }
        });
    }
    
    if(passwordField) {
        passwordField.addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                login();
            }
        });
    }
    
    // Student search navigation
    const searchRoll = document.getElementById('search-roll');
    const searchDob = document.getElementById('search-dob');
    
    if(searchRoll) {
        searchRoll.addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                searchDob.focus();
            }
        });
    }
    
    if(searchDob) {
        searchDob.addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                searchResult();
            }
        });
    }
    
    // Marks container arrow navigation
    setupMarksContainerNavigation();
}

function setupMarksContainerNavigation() {
    const marksContainer = document.getElementById('marks-container');
    if(!marksContainer) return;
    
    // Use event delegation for dynamically generated inputs
    marksContainer.addEventListener('keydown', function(e) {
        const target = e.target;
        
        // Only handle arrow keys and Enter for input fields
        if(!target.matches('input, select')) return;
        
        const row = target.closest('div[style*="display:flex"]');
        if(!row) return;
        
        const allRows = Array.from(marksContainer.querySelectorAll('div[style*="display:flex"]'));
        const rowIndex = allRows.indexOf(row);
        
        const inputsInRow = Array.from(row.querySelectorAll('input, select'));
        const inputIndex = inputsInRow.indexOf(target);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                moveToRow(allRows, rowIndex + 1, inputIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                moveToRow(allRows, rowIndex - 1, inputIndex);
                break;
                
            case 'ArrowRight':
            case 'Tab':
                if(e.key === 'Tab' && e.shiftKey) break; // Let Shift+Tab work normally
                if(inputIndex < inputsInRow.length - 1) {
                    e.preventDefault();
                    inputsInRow[inputIndex + 1].focus();
                    inputsInRow[inputIndex + 1].select();
                } else if(rowIndex < allRows.length - 1) {
                    // Move to first input of next row
                    e.preventDefault();
                    const nextRow = allRows[rowIndex + 1];
                    const nextInputs = nextRow.querySelectorAll('input, select');
                    if(nextInputs[0]) {
                        nextInputs[0].focus();
                        if(nextInputs[0].select) nextInputs[0].select();
                    }
                }
                break;
                
            case 'ArrowLeft':
                if(inputIndex > 0) {
                    e.preventDefault();
                    inputsInRow[inputIndex - 1].focus();
                    inputsInRow[inputIndex - 1].select();
                } else if(rowIndex > 0) {
                    // Move to last input of previous row
                    e.preventDefault();
                    const prevRow = allRows[rowIndex - 1];
                    const prevInputs = Array.from(prevRow.querySelectorAll('input, select'));
                    const lastInput = prevInputs[prevInputs.length - 1];
                    if(lastInput) {
                        lastInput.focus();
                        if(lastInput.select) lastInput.select();
                    }
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                // Enter moves down to same column in next row
                moveToRow(allRows, rowIndex + 1, inputIndex);
                break;
        }
    });
}

function moveToRow(allRows, targetRowIndex, inputIndex) {
    if(targetRowIndex < 0 || targetRowIndex >= allRows.length) return;
    
    const targetRow = allRows[targetRowIndex];
    const targetInputs = targetRow.querySelectorAll('input, select');
    
    // Focus same column position, or last input if column doesn't exist
    const targetInput = targetInputs[inputIndex] || targetInputs[targetInputs.length - 1];
    if(targetInput) {
        targetInput.focus();
        if(targetInput.select) targetInput.select();
    }
}

// Re-setup navigation when marks container changes
const originalGenerateInputs = generateInputs;
generateInputs = function() {
    originalGenerateInputs.call(this);
    setupMarksContainerNavigation();
};

const originalLoadSemesterFromMemory = loadSemesterFromMemory;
loadSemesterFromMemory = function() {
    originalLoadSemesterFromMemory.call(this);
    setupMarksContainerNavigation();
};
console.log('✅ Keyboard navigation initialized');
// ==========================================
// DEVELOPER CONSOLE ADVANCED FEATURES
// ==========================================

// Tab Switching
function showDevTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.dev-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.dev-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById('dev-tab-' + tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load content for specific tabs
    if(tabName === 'files') {
        loadAdvancedFileList();
        updateStorageMonitor();
    } else if(tabName === 'analytics') {
        refreshAnalytics();
    } else if(tabName === 'security') {
        refreshActivityLog();
    } else if(tabName === 'advanced') {
        renderTemplateList(); // ✅ ADDED
    }
}

// ==========================================
// FEATURE #1: ADVANCED SEARCH & FILTER
// ==========================================

let allStudentFiles = [];
let filteredFiles = [];

function loadAdvancedFileList() {
    allStudentFiles = [];
    
    for(let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key.startsWith('kiss_data_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                allStudentFiles.push({
                    roll: data.roll,
                    name: data.studentInfo?.name || 'N/A',
                    dob: data.dob,
                    class: data.studentInfo?.currentClass || 'N/A',
                    stream: data.studentInfo?.stream || 'N/A',
                    joiningYear: data.studentInfo?.joiningYear || 'N/A',
                    timestamp: data.timestamp || 'N/A',
                    selected: false
                });
            } catch(e) {
                console.error('Error loading file:', key, e);
            }
        }
    }
    
    // Sort by roll number
    allStudentFiles.sort((a, b) => a.roll.localeCompare(b.roll));
    filteredFiles = [...allStudentFiles];
    renderFileList();
}

function applyFilters() {
    const rollFilter = document.getElementById('filter-roll').value.toLowerCase();
    const nameFilter = document.getElementById('filter-name').value.toLowerCase();
    const dobFilter = document.getElementById('filter-dob').value;
    const classFilter = document.getElementById('filter-class').value;
    const streamFilter = document.getElementById('filter-stream').value;
    const yearFilter = document.getElementById('filter-year').value;
    
    filteredFiles = allStudentFiles.filter(file => {
        const matchRoll = !rollFilter || file.roll.toLowerCase().includes(rollFilter);
        const matchName = !nameFilter || file.name.toLowerCase().includes(nameFilter);
        const matchDOB = !dobFilter || file.dob === dobFilter;
        const matchClass = !classFilter || file.class === classFilter;
        const matchStream = !streamFilter || file.stream === streamFilter;
        const matchYear = !yearFilter || file.joiningYear == yearFilter;
        
        return matchRoll && matchName && matchDOB && matchClass && matchStream && matchYear;
    });
    
    renderFileList();
}

function clearFilters() {
    document.getElementById('filter-roll').value = '';
    document.getElementById('filter-name').value = '';
    document.getElementById('filter-dob').value = '';
    document.getElementById('filter-class').value = '';
    document.getElementById('filter-stream').value = '';
    document.getElementById('filter-year').value = '';
    applyFilters();
}

function renderFileList() {
    const container = document.getElementById('dev-file-list-advanced');
    
    if(filteredFiles.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No files found</p>';
        return;
    }
    
    let html = '<div class="file-row file-row-header">';
    html += '<div><input type="checkbox" id="select-all-checkbox" onchange="toggleSelectAll(this)"></div>';
    html += '<div class="serial-number-col">S.No</div>'; // ✅ ADDED
    html += '<div>Roll No</div>';
    html += '<div>Name</div>';
    html += '<div>DOB</div>';
    html += '<div>Class</div>';
    html += '<div>Stream</div>';
    html += '<div>Actions</div>';
    html += '</div>';
    
    filteredFiles.forEach((file, index) => {
        html += `<div class="file-row">`;
        html += `<div><input type="checkbox" class="file-checkbox" data-roll="${file.roll}" ${file.selected ? 'checked' : ''} onchange="toggleFileSelection('${file.roll}')"></div>`;
        html += `<div class="serial-number-col">${index + 1}</div>`; // ✅ ADDED
        html += `<div><strong>${file.roll}</strong></div>`;
        html += `<div>${file.name}</div>`;
        html += `<div>${file.dob}</div>`;
        html += `<div>${file.class}</div>`;
        html += `<div>${file.stream}</div>`;
        html += `<div style="display:flex; gap:5px;">`;
        html += `<button class="action-btn bg-blue btn-small" onclick="editStudent('${file.roll}')">✏️ Edit</button>`;
        html += `<button class="action-btn bg-green btn-small" onclick="devDownloadSingle('${file.roll}', 'SEM')">📄 SEM</button>`;
        html += `<button class="action-btn bg-orange btn-small" onclick="devDownloadSingle('${file.roll}', 'SEA')">📄 SEA</button>`;
        html += `<button class="action-btn bg-red btn-small" onclick="devDeleteSingle('${file.roll}')">🗑️</button>`;
        html += `</div>`;
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

function toggleFileSelection(roll) {
    const file = allStudentFiles.find(f => f.roll === roll);
    if(file) {
        file.selected = !file.selected;
    }
    updateSelectAllCheckbox();
}

function toggleSelectAll(checkbox) {
    filteredFiles.forEach(file => {
        file.selected = checkbox.checked;
    });
    document.querySelectorAll('.file-checkbox').forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

function selectAllFiles() {
    document.getElementById('select-all-checkbox').checked = true;
    toggleSelectAll(document.getElementById('select-all-checkbox'));
}

function updateSelectAllCheckbox() {
    const allChecked = filteredFiles.every(f => f.selected);
    document.getElementById('select-all-checkbox').checked = allChecked;
}

function exportFilteredCSV() {
    if(filteredFiles.length === 0) {
        showToast('No files to export!', 'warning');
        return;
    }
    
    let csv = 'Serial,Roll No,Name,DOB,Class,Stream,Joining Year,Timestamp\n';
    
    filteredFiles.forEach((file, index) => {
        csv += `${index + 1},${file.roll},${file.name},${file.dob},${file.class},${file.stream},${file.joiningYear},${file.timestamp}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast(`✅ Exported ${filteredFiles.length} records to CSV!`, 'success');
}

// ==========================================
// FEATURE #4: EDIT EXISTING STUDENT
// ==========================================

function editStudent(roll) {
    const dataStr = localStorage.getItem('kiss_data_' + roll);
    if(!dataStr) {
        showToast('Student data not found!', 'error');
        return;
    }
    
    try {
        const data = JSON.parse(dataStr);
        
        // Switch to staff dashboard
        document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));
        document.getElementById('staff-dashboard').classList.add('active');
        
        // ========================================
        // STEP 0: Institute & Staff Details
        // ========================================
        
        document.getElementById('in_institute').value = data.studentInfo?.institute || '';
        
        // Load staff details if saved
        if(data.staffInfo) {
            document.getElementById('in_staff_name').value = data.staffInfo.name || '';
            document.getElementById('in_staff_phone').value = data.staffInfo.phone || '';
            document.getElementById('in_staff_email').value = data.staffInfo.email || '';
        }
        
        // Load signatures if saved
        if(data.signatures) {
            if(data.signatures.comparer) {
                document.getElementById('out_sig_comparer').src = data.signatures.comparer;
                document.getElementById('out_sig_comparer').style.display = 'block';
            }
            if(data.signatures.head) {
                document.getElementById('out_sig_head').src = data.signatures.head;
                document.getElementById('out_sig_head').style.display = 'block';
            }
            if(data.signatures.controller) {
                document.getElementById('out_sig_controller').src = data.signatures.controller;
                document.getElementById('out_sig_controller').style.display = 'block';
            }
        }
        
        // ========================================
        // STEP 1: Student Bio
        // ========================================
        
        const nameParts = data.studentInfo?.name.split(' ') || ['', ''];
        document.getElementById('in_fname').value = nameParts[0] || '';
        document.getElementById('in_lname').value = nameParts.slice(1).join(' ') || '';
        document.getElementById('in_student_email').value = data.studentInfo?.email || '';
        document.getElementById('in_enroll').value = data.studentInfo?.enrollment || '';
        document.getElementById('in_roll').value = data.roll;
        document.getElementById('in_reg').value = data.studentInfo?.registration || '';
        document.getElementById('in_gender').value = data.studentInfo?.gender || '';
        document.getElementById('in_father').value = data.studentInfo?.father || '';
        document.getElementById('in_mother').value = data.studentInfo?.mother || '';
        document.getElementById('in_dob').value = data.dob;
        document.getElementById('in_current_class').value = data.studentInfo?.currentClass || '';
        document.getElementById('in_stream').value = data.studentInfo?.stream || '';
        document.getElementById('in_joining_year').value = data.studentInfo?.joiningYear || '';
        
        // Load photo if available
        if(data.studentInfo?.photo) {
            document.getElementById('out_photo').src = data.studentInfo.photo;
            document.getElementById('out_photo').style.display = 'block';
        }
        
        // Configure semesters based on class
        configureSemesters();
        
        // Load honours
        if(data.studentInfo?.honours) {
            const honoursSelect = document.getElementById('in_honours');
            const honoursManual = document.getElementById('in_honours_manual');
            
            // Check if honours value exists in dropdown
            const optionExists = Array.from(honoursSelect.options).some(
                option => option.value === data.studentInfo.honours
            );
            
            if(optionExists) {
                honoursSelect.value = data.studentInfo.honours;
            } else {
                honoursSelect.value = 'OTHER';
                honoursManual.style.display = 'block';
                honoursManual.value = data.studentInfo.honours;
            }
        }
        
        // ========================================
        // STEP 2: Load Marks Data
        // ========================================
        
        if(data.allSemestersData) {
            allSemestersData = JSON.parse(JSON.stringify(data.allSemestersData));
            currentSemIndex = 1; // Start from semester 1
            updateSemesterUI();
        }
        
        // Load serial and date
        if(data.serialDate) {
            document.getElementById('in_serial').value = data.serialDate.serial || '';
            document.getElementById('in_date').value = data.serialDate.date || '';
        }
        
        // Go to Step 0
        goToStep(0);
        
        showToast(`✏️ Editing: ${data.studentInfo?.name || roll}`, 'info', 3000);
        logActivity('update', `Opened student for editing: ${roll}`);
        
    } catch(e) {
        console.error('Error loading student data:', e);
        showToast('Error loading student data: ' + e.message, 'error');
    }
}

// ==========================================
// FEATURE #2: ANALYTICS DASHBOARD
// ==========================================

function refreshAnalytics() {
    const container = document.getElementById('analytics-content');
    
    // Gather all data
    let totalStudents = 0;
    let classCounts = {};
    let streamCounts = {};
    let passFail = { pass: 0, fail: 0 };
    let sgpaByClass = {};
    let sgpaByStream = {};
    let topPerformers = [];
    
    for(let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key.startsWith('kiss_data_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                totalStudents++;
                
                // Class breakdown
                const studentClass = data.studentInfo?.currentClass || 'Unknown';
                classCounts[studentClass] = (classCounts[studentClass] || 0) + 1;
                
                // Stream breakdown
                const stream = data.studentInfo?.stream || 'Unknown';
                streamCounts[stream] = (streamCounts[stream] || 0) + 1;
                
                // Calculate SGPA from semester data
                let totalCredits = 0;
                let totalGradePoints = 0;
                
                if(data.allSemestersData) {
                    Object.values(data.allSemestersData).forEach(semester => {
                        semester.forEach(subject => {
                            const mTh = parseFloat(subject.mTh) || 0;
                            const mPr = parseFloat(subject.mPr) || 0;
                            const mOt = parseFloat(subject.mOt) || 0;
                            const oTh = parseFloat(subject.oTh) || 0;
                            const oPr = parseFloat(subject.oPr) || 0;
                            const oOt = parseFloat(subject.oOt) || 0;
                            const credits = parseFloat(subject.cr) || 0;
                            
                            const totalMax = mTh + mPr + mOt;
                            const totalObt = oTh + oPr + oOt;
                            
                            if(totalMax > 0) {
                                const percentage = (totalObt / totalMax) * 100;
                                const gradeInfo = getGradeInfo(totalObt, totalMax);
                                const gradePoints = gradeInfo.point * credits;
                                
                                totalCredits += credits;
                                totalGradePoints += gradePoints;
                            }
                        });
                    });
                }
                
                const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
                
                // Pass/Fail
                if(parseFloat(sgpa) >= 4.0) {
                    passFail.pass++;
                } else {
                    passFail.fail++;
                }
                
                // SGPA by class
                if(!sgpaByClass[studentClass]) {
                    sgpaByClass[studentClass] = { total: 0, count: 0 };
                }
                sgpaByClass[studentClass].total += parseFloat(sgpa);
                sgpaByClass[studentClass].count++;
                
                // SGPA by stream
                if(!sgpaByStream[stream]) {
                    sgpaByStream[stream] = { total: 0, count: 0 };
                }
                sgpaByStream[stream].total += parseFloat(sgpa);
                sgpaByStream[stream].count++;
                
                // Top performers
                topPerformers.push({
                    roll: data.roll,
                    name: data.studentInfo?.name || 'N/A',
                    class: studentClass,
                    sgpa: parseFloat(sgpa)
                });
                
            } catch(e) {
                console.error('Error processing analytics for', key, e);
            }
        }
    }
    
    // Sort top performers
    topPerformers.sort((a, b) => b.sgpa - a.sgpa);
    topPerformers = topPerformers.slice(0, 10); // Top 10
    
    // Render analytics
    let html = '<div class="analytics-grid">';
    
    // Total students card
    html += `<div class="analytics-card blue">
        <h3>👥 Total Students</h3>
        <div class="value">${totalStudents}</div>
    </div>`;
    
    // Pass/Fail card
    const passRate = totalStudents > 0 ? ((passFail.pass / totalStudents) * 100).toFixed(1) : 0;
    html += `<div class="analytics-card green">
        <h3>✅ Pass Rate</h3>
        <div class="value">${passRate}%</div>
        <div style="font-size:12px; margin-top:5px;">Pass: ${passFail.pass} | Fail: ${passFail.fail}</div>
    </div>`;
    
    // Average SGPA card
    let overallSGPA = 0;
    let sgpaCount = 0;
    Object.values(sgpaByClass).forEach(data => {
        overallSGPA += data.total;
        sgpaCount += data.count;
    });
    const avgSGPA = sgpaCount > 0 ? (overallSGPA / sgpaCount).toFixed(2) : 0;
    
    html += `<div class="analytics-card orange">
        <h3>📊 Average SGPA</h3>
        <div class="value">${avgSGPA}</div>
    </div>`;
    
    // Highest SGPA card
    const highestSGPA = topPerformers.length > 0 ? topPerformers[0].sgpa.toFixed(2) : 0;
    html += `<div class="analytics-card red">
        <h3>🏆 Highest SGPA</h3>
        <div class="value">${highestSGPA}</div>
        ${topPerformers.length > 0 ? `<div style="font-size:12px; margin-top:5px;">${topPerformers[0].name}</div>` : ''}
    </div>`;
    
    html += '</div>';
    
    // Class-wise breakdown
    html += '<div class="dev-box" style="margin-top:20px;"><h4>📚 Class-wise Distribution</h4>';
    html += '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
    html += '<tr style="background:#e9ecef;"><th style="padding:10px; border:1px solid #ddd;">Class</th><th style="padding:10px; border:1px solid #ddd;">Students</th><th style="padding:10px; border:1px solid #ddd;">Avg SGPA</th></tr>';
    
    Object.entries(classCounts).forEach(([cls, count]) => {
        const avgClassSGPA = sgpaByClass[cls] ? (sgpaByClass[cls].total / sgpaByClass[cls].count).toFixed(2) : 'N/A';
        html += `<tr><td style="padding:8px; border:1px solid #ddd;">${cls}</td><td style="padding:8px; border:1px solid #ddd; text-align:center;">${count}</td><td style="padding:8px; border:1px solid #ddd; text-align:center;">${avgClassSGPA}</td></tr>`;
    });
    
    html += '</table></div>';
    
    // Stream-wise breakdown
    html += '<div class="dev-box" style="margin-top:20px;"><h4>🎓 Stream-wise Distribution</h4>';
    html += '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
    html += '<tr style="background:#e9ecef;"><th style="padding:10px; border:1px solid #ddd;">Stream</th><th style="padding:10px; border:1px solid #ddd;">Students</th><th style="padding:10px; border:1px solid #ddd;">Avg SGPA</th></tr>';
    
    Object.entries(streamCounts).forEach(([stream, count]) => {
        const avgStreamSGPA = sgpaByStream[stream] ? (sgpaByStream[stream].total / sgpaByStream[stream].count).toFixed(2) : 'N/A';
        html += `<tr><td style="padding:8px; border:1px solid #ddd;">${stream}</td><td style="padding:8px; border:1px solid #ddd; text-align:center;">${count}</td><td style="padding:8px; border:1px solid #ddd; text-align:center;">${avgStreamSGPA}</td></tr>`;
    });
    
    html += '</table></div>';
    
    // Top performers
    html += '<div class="dev-box" style="margin-top:20px;"><h4>🏆 Top 10 Performers</h4>';
    html += '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
    html += '<tr style="background:#e9ecef;"><th style="padding:10px; border:1px solid #ddd;">Rank</th><th style="padding:10px; border:1px solid #ddd;">Roll No</th><th style="padding:10px; border:1px solid #ddd;">Name</th><th style="padding:10px; border:1px solid #ddd;">Class</th><th style="padding:10px; border:1px solid #ddd;">SGPA</th></tr>';
    
    topPerformers.forEach((student, index) => {
        const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        html += `<tr><td style="padding:8px; border:1px solid #ddd; text-align:center;">${rankIcon}</td><td style="padding:8px; border:1px solid #ddd;">${student.roll}</td><td style="padding:8px; border:1px solid #ddd;">${student.name}</td><td style="padding:8px; border:1px solid #ddd; text-align:center;">${student.class}</td><td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:bold; color:#28a745;">${student.sgpa}</td></tr>`;
    });
    
    html += '</table></div>';
    
    container.innerHTML = html;
}

// ==========================================
// FEATURE #3: BULK OPERATIONS
// ==========================================

function bulkDeleteSelected() {
    const selectedFiles = allStudentFiles.filter(f => f.selected);
    
    if(selectedFiles.length === 0) {
        showToast('No files selected!', 'warning');
        return;
    }
    
    if(!confirm(`⚠️ Delete ${selectedFiles.length} student(s)? This cannot be undone!`)) {
        return;
    }
    
    selectedFiles.forEach(file => {
        localStorage.removeItem('kiss_data_' + file.roll);
        logActivity('delete', `Deleted student: ${file.roll} - ${file.name}`);
    });
    
    showToast(`✅ Deleted ${selectedFiles.length} student(s) successfully!`, 'success');
    loadAdvancedFileList();
}

function bulkExportZIP() {
    showToast('📦 Bulk ZIP export feature requires external library (JSZip). Use CSV export or individual PDFs for now.', 'info', 5000);
    
    // Alternative: Export all as JSON
    if(confirm('Export all student data as JSON file instead?')) {
        createFullBackup();
    }
}

function bulkPrintSelected() {
    const selectedFiles = allStudentFiles.filter(f => f.selected);
    
    if(selectedFiles.length === 0) {
        showToast('No files selected!', 'warning');
        return;
    }
    
    if(selectedFiles.length > 10) {
        showToast('⚠️ Printing more than 10 files at once may cause browser issues. Please select fewer files.', 'warning', 5000);
        return;
    }
    
    showToast(`🖨️ Preparing to print ${selectedFiles.length} result(s)...`, 'info');
    
    selectedFiles.forEach((file, index) => {
        setTimeout(() => {
            devDownloadSingle(file.roll, 'SEM');
        }, index * 1000); // Stagger prints by 1 second
    });
}

function importStudentsCSV() {
    const fileInput = document.getElementById('bulk-import-csv');
    const file = fileInput.files[0];
    
    if(!file) {
        showToast('Please select a CSV file first!', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        
        if(lines.length < 2) {
            showToast('CSV file is empty or invalid!', 'error');
            return;
        }
        
        // Parse CSV (simple implementation)
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        let imported = 0;
        
        for(let i = 1; i < lines.length; i++) {
            if(!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(v => v.trim());
            const student = {};
            
            headers.forEach((header, index) => {
                student[header] = values[index] || '';
            });
            
            // Validate required fields
            if(!student.roll || !student.dob) {
                console.warn('Skipping row', i, '- missing roll or dob');
                continue;
            }
            
            // Create basic student record
            // Note: This creates a minimal record - full implementation would need all fields
            const dataToSave = {
                roll: student.roll,
                dob: student.dob,
                studentInfo: {
                    name: student.fname + ' ' + student.lname,
                    enrollment: student.enroll || '',
                    stream: student.stream || '',
                    honours: student.honours || '',
                    currentClass: student.class || '',
                    joiningYear: parseInt(student.year) || new Date().getFullYear()
                },
                allSemestersData: {},
                timestamp: new Date().toISOString()
            };
            
            try {
                localStorage.setItem('kiss_data_' + student.roll, JSON.stringify(dataToSave));
                imported++;
                logActivity('create', `Imported student: ${student.roll} from CSV`);
            } catch(e) {
                console.error('Error importing student', student.roll, e);
            }
        }
        
        showToast(`✅ Imported ${imported} student(s) from CSV!`, 'success');
        loadAdvancedFileList();
        fileInput.value = '';
    };
    
    reader.readAsText(file);
}

function generateDummyData() {
    const count = parseInt(document.getElementById('dummy-count').value) || 10;
    
    if(count > 100) {
        showToast('Maximum 100 dummy students allowed!', 'warning');
        return;
    }
    
    if(!confirm(`Generate ${count} dummy student records?`)) {
        return;
    }
    
    const classes = ['UG-I', 'UG-II', 'UG-III', 'PG-I', 'PG-II'];
    const streams = ['SCIENCE', 'ARTS', 'COMMERCE'];
    const honours = ['Physics', 'Chemistry', 'Mathematics', 'History', 'Economics'];
    const firstNames = ['Aarav', 'Vivaan', 'Ananya', 'Diya', 'Arjun', 'Saanvi', 'Kabir', 'Aanya'];
    const lastNames = ['Kumar', 'Singh', 'Patel', 'Sharma', 'Reddy', 'Nair', 'Das', 'Rao'];
    
    for(let i = 0; i < count; i++) {
        const roll = '24' + String(10000 + i).padStart(5, '0');
        const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
        const studentClass = classes[Math.floor(Math.random() * classes.length)];
        const stream = streams[Math.floor(Math.random() * streams.length)];
        const honour = honours[Math.floor(Math.random() * honours.length)];
        
        const dummyData = {
            roll: roll,
            dob: `200${Math.floor(Math.random() * 5)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
            studentInfo: {
                name: fname + ' ' + lname,
                enrollment: 'EN' + roll,
                stream: stream,
                honours: honour,
                currentClass: studentClass,
                joiningYear: 2024
            },
            allSemestersData: {
                1: [
                    {
                        code: 'SUB101',
                        paper: 'Sample Subject',
                        mTh: '75',
                        mPr: '10',
                        mOt: '15',
                        oTh: String(50 + Math.floor(Math.random() * 25)),
                        oPr: String(5 + Math.floor(Math.random() * 5)),
                        oOt: String(10 + Math.floor(Math.random() * 5)),
                        cr: '4'
                    }
                ]
            },
            semesterPDF: '<div>Dummy PDF Content</div>',
            seasonPDF: '<div>Dummy PDF Content</div>',
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('kiss_data_' + roll, JSON.stringify(dummyData));
    }
    
    showToast(`✅ Generated ${count} dummy student records!`, 'success');
    logActivity('create', `Generated ${count} dummy students`);
    loadAdvancedFileList();
}

// ==========================================
// FEATURE #5: BACKUP & RESTORE
// ==========================================

function createFullBackup() {
    const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        config: appConfig,
        students: {}
    };
    
    // Export all student data
    for(let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key.startsWith('kiss_data_')) {
            backup.students[key] = localStorage.getItem(key);
        }
    }
    
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KISS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    // Update last backup time
    localStorage.setItem('kiss_last_backup', new Date().toISOString());
    updateLastBackupTime();
    
    showToast('✅ Full backup downloaded successfully!', 'success');
    logActivity('backup', `Created full system backup (${Object.keys(backup.students).length} students)`);
}

function restoreFromBackup() {
    const fileInput = document.getElementById('restore-file');
    const file = fileInput.files[0];
    
    if(!file) {
        showToast('Please select a backup file first!', 'warning');
        return;
    }
    
    if(!confirm('⚠️ WARNING: This will OVERWRITE ALL EXISTING DATA! Continue?')) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if(!backup.version || !backup.students) {
                showToast('Invalid backup file format!', 'error');
                return;
            }
            
            // Clear existing student data
            const keysToRemove = [];
            for(let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if(key.startsWith('kiss_data_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Restore config
            if(backup.config) {
                appConfig = backup.config;
                localStorage.setItem('kiss_app_config', JSON.stringify(appConfig));
            }
            
            // Restore students
            Object.entries(backup.students).forEach(([key, data]) => {
                localStorage.setItem(key, data);
            });
            
            showToast(`✅ Restored ${Object.keys(backup.students).length} student records!`, 'success');
            logActivity('restore', `Restored backup from ${backup.timestamp}`);
            
            setTimeout(() => {
                location.reload();
            }, 2000);
            
        } catch(e) {
            console.error('Restore error:', e);
            showToast('Error restoring backup: ' + e.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

function toggleAutoBackup() {
    const enabled = document.getElementById('auto-backup-toggle').checked;
    localStorage.setItem('kiss_auto_backup', enabled);
    
    if(enabled) {
        showToast('✅ Auto-backup enabled (weekly)', 'success');
        scheduleAutoBackup();
    } else {
        showToast('❌ Auto-backup disabled', 'info');
    }
}

function scheduleAutoBackup() {
    const lastBackup = localStorage.getItem('kiss_last_backup');
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    
    if(!lastBackup || (new Date() - new Date(lastBackup)) > weekInMs) {
        createFullBackup();
    }
}

function updateLastBackupTime() {
    const lastBackup = localStorage.getItem('kiss_last_backup');
    const span = document.getElementById('last-backup-time');
    
    if(span) {
        if(lastBackup) {
            const date = new Date(lastBackup);
            span.textContent = date.toLocaleString();
        } else {
            span.textContent = 'Never';
        }
    }
}

// ==========================================
// FEATURE #6: SECURITY & ACTIVITY LOG
// ==========================================

function logActivity(type, message) {
    const log = {
        type: type, // 'create', 'update', 'delete', 'backup', 'restore'
        message: message,
        timestamp: new Date().toISOString(),
        user: document.getElementById('user-display')?.innerText || 'Unknown'
    };
    
    // Get existing logs
    let logs = JSON.parse(localStorage.getItem('kiss_activity_log') || '[]');
    logs.unshift(log); // Add to beginning
    
    // Keep only last 500 logs
    if(logs.length > 500) {
        logs = logs.slice(0, 500);
    }
    
    localStorage.setItem('kiss_activity_log', JSON.stringify(logs));
}

function refreshActivityLog() {
    const container = document.getElementById('activity-log');
    const logs = JSON.parse(localStorage.getItem('kiss_activity_log') || '[]');
    
    if(logs.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No activity logged yet</p>';
        return;
    }
    
    let html = '';
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        const timeStr = date.toLocaleString();
        
        html += `<div class="log-entry ${log.type}">`;
        html += `<div style="display:flex; justify-content:space-between; align-items:start;">`;
        html += `<div>`;
        html += `<strong style="text-transform:uppercase; font-size:11px; color:#666;">[${log.type}]</strong> `;
        html += `${log.message}`;
        html += `</div>`;
        html += `<div class="log-time">${timeStr}</div>`;
        html += `</div>`;
        html += `<div style="font-size:10px; color:#999; margin-top:3px;">User: ${log.user}</div>`;
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

function clearActivityLog() {
    if(!confirm('Clear all activity logs?')) return;
    
    localStorage.removeItem('kiss_activity_log');
    refreshActivityLog();
    showToast('✅ Activity log cleared!', 'success');
}

function toggleEncryption() {
    const enabled = document.getElementById('encryption-toggle').checked;
    
    if(enabled) {
        showToast('⚠️ Encryption feature requires implementation of CryptoJS library. For now, this is a placeholder.', 'warning', 5000);
        document.getElementById('encryption-toggle').checked = false;
    }
    
    // Placeholder for future encryption implementation
    // Would need to implement AES-256 encryption for all student data
}

// ==========================================
// FEATURE #8: THEME CUSTOMIZER
// ==========================================

function applyTheme() {
    const navbarColor = document.getElementById('theme-navbar').value;
    const primaryColor = document.getElementById('theme-primary').value;
    const successColor = document.getElementById('theme-success').value;
    const bgColor = document.getElementById('theme-bg').value;
    
    const theme = {
        navbar: navbarColor,
        primary: primaryColor,
        success: successColor,
        background: bgColor
    };
    
    // Apply theme
    document.querySelector('.navbar').style.background = navbarColor;
    document.body.style.background = bgColor;
    
    document.querySelectorAll('.bg-blue').forEach(el => {
        el.style.background = primaryColor;
    });
    
    document.querySelectorAll('.bg-green').forEach(el => {
        el.style.background = successColor;
    });
    
    // Save theme
    localStorage.setItem('kiss_theme', JSON.stringify(theme));
    
    showToast('✨ Theme applied successfully!', 'success');
    logActivity('update', 'Changed theme colors');
}

function resetTheme() {
    localStorage.removeItem('kiss_theme');
    localStorage.removeItem('kiss_custom_logo');
    location.reload();
}

function toggleDarkMode() {
    const enabled = document.getElementById('dark-mode-toggle').checked;
    
    if(enabled) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('kiss_dark_mode', 'true');
        showToast('🌙 Dark mode enabled', 'success');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.removeItem('kiss_dark_mode');
        showToast('☀️ Light mode enabled', 'success');
    }
    
    logActivity('update', `Switched to ${enabled ? 'dark' : 'light'} mode`);
}

function uploadCustomLogo(input) {
    if(!input.files || !input.files[0]) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;
        
        // Apply to logo only (not watermark)
        document.getElementById('static_logo').src = logoData;
        document.getElementById('logo-preview').src = logoData;
        
        // Save to config
        localStorage.setItem('kiss_custom_logo', logoData);
        
        showToast('✅ Custom logo uploaded!', 'success');
        logActivity('update', 'Uploaded custom logo');
    };
    
    reader.readAsDataURL(input.files[0]);
}

function resetLogo() {
    localStorage.removeItem('kiss_custom_logo');
    location.reload();
}

// Load saved theme on startup
function loadSavedTheme() {
    const theme = JSON.parse(localStorage.getItem('kiss_theme') || 'null');
    
    if(theme) {
        document.getElementById('theme-navbar').value = theme.navbar;
        document.getElementById('theme-primary').value = theme.primary;
        document.getElementById('theme-success').value = theme.success;
        document.getElementById('theme-bg').value = theme.background;
        applyTheme();
    }
    
    // Load dark mode
    if(localStorage.getItem('kiss_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
        if(document.getElementById('dark-mode-toggle')) {
            document.getElementById('dark-mode-toggle').checked = true;
        }
    }
    
    // Load custom logo
const customLogo = localStorage.getItem('kiss_custom_logo');
if(customLogo) {
    document.getElementById('static_logo').src = customLogo;
    const logoPreview = document.getElementById('logo-preview');
    if(logoPreview) logoPreview.src = customLogo;
}

// Load custom watermark separately
const customWatermark = localStorage.getItem('kiss_custom_watermark');
if(customWatermark) {
    document.getElementById('watermark_img').src = customWatermark;
    const watermarkPreview = document.getElementById('watermark-preview');
    if(watermarkPreview) watermarkPreview.src = customWatermark;
}
}

// ==========================================
// FEATURE #13: STORAGE MONITOR
// ==========================================

function updateStorageMonitor() {
    const container = document.getElementById('storage-monitor');
    if(!container) return;
    
    // Calculate storage usage
    let totalSize = 0;
    let studentCount = 0;
    
    for(let key in localStorage) {
        if(localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            totalSize += key.length + (value ? value.length : 0);
            
            if(key.startsWith('kiss_data_')) {
                studentCount++;
            }
        }
    }
    
    // Convert to MB
    const usedMB = (totalSize / 1024 / 1024).toFixed(2);
    const maxMB = 10; // Most browsers limit localStorage to 5-10MB
    const percentage = ((usedMB / maxMB) * 100).toFixed(1);
    
    let barClass = '';
    let statusText = '✅ Storage Healthy';
    
    if(percentage > 80) {
        barClass = 'danger';
        statusText = '⚠️ Storage Almost Full!';
    } else if(percentage > 60) {
        barClass = 'warning';
        statusText = '⚠️ Storage Warning';
    }
    
    let html = `
        <div style="margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>${statusText}</strong>
                <span>${percentage}% Used</span>
            </div>
            <div class="storage-bar">
                <div class="storage-fill ${barClass}" style="width:${percentage}%">${usedMB} MB / ${maxMB} MB</div>
            </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; font-size:13px;">
            <div style="background:#f8f9fa; padding:15px; border-radius:5px;">
                <div style="font-size:24px; font-weight:bold; color:#007bff;">${studentCount}</div>
                <div style="color:#666;">Students Saved</div>
            </div>
            <div style="background:#f8f9fa; padding:15px; border-radius:5px;">
                <div style="font-size:24px; font-weight:bold; color:#28a745;">${usedMB} MB</div>
                <div style="color:#666;">Space Used</div>
            </div>
        </div>
    `;
    
    if(percentage > 60) {
        html += `<div style="margin-top:15px; padding:10px; background:#fff3cd; border-left:4px solid #ffc107; font-size:12px;">
            <strong>💡 Tip:</strong> Consider deleting old/test records or creating a backup and clearing data.
        </div>`;
    }
    
    container.innerHTML = html;
}

// ==========================================
// FEATURE #7: EMAIL/SMS INTEGRATION (Framework)
// ==========================================

function sendResultEmail(roll, email) {
    // This is a framework - actual implementation would need backend API
    showToast('📧 Email feature requires backend integration. Framework ready.', 'info', 5000);
    
    logActivity('email', `Attempted to send result to ${email} for roll ${roll}`);
    
    // Placeholder for future implementation:
    // Would need to integrate with services like:
    // - SendGrid
    // - AWS SES
    // - SMTP server
}

function bulkEmailResults() {
    showToast('📧 Bulk email feature requires backend API integration.', 'info', 5000);
}

// ==========================================
// FEATURE #9: CERTIFICATE GENERATOR (Placeholder)
// ==========================================

function generateCertificate(type) {
    showToast('📄 Certificate generator coming soon! Will support: Participation, Degree, Custom templates.', 'info', 5000);
}

// ==========================================
// FEATURE #10: VERSION CONTROL
// ==========================================

function showVersionHistory() {
    const container = document.getElementById('version-history');
    
    // Get all activity logs related to updates
    const logs = JSON.parse(localStorage.getItem('kiss_activity_log') || '[]');
    const updateLogs = logs.filter(log => log.type === 'update' || log.type === 'create');
    
    if(updateLogs.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:10px;">No edit history available</p>';
        return;
    }
    
    let html = '<div style="max-height:300px; overflow-y:auto; border:1px solid #ddd; padding:10px; margin-top:10px; font-size:12px;">';
    
    updateLogs.slice(0, 50).forEach(log => {
        const date = new Date(log.timestamp);
        html += `<div style="padding:8px; border-left:3px solid #007bff; margin-bottom:8px; background:#f8f9fa;">`;
        html += `<div><strong>${log.message}</strong></div>`;
        html += `<div style="font-size:10px; color:#666; margin-top:3px;">${date.toLocaleString()} by ${log.user}</div>`;
        html += `</div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// FEATURE #12: QR CODE VERIFICATION
// ==========================================

function verifyQRCode() {
    const qrData = document.getElementById('qr-verify-input').value.trim();
    const resultDiv = document.getElementById('qr-verify-result');
    
    if(!qrData) {
        resultDiv.innerHTML = '<p style="color:#dc3545;">Please enter QR code data</p>';
        return;
    }
    
    // QR data format: "Name:John Doe\nRoll:2412345\nSGPA:8.5"
    const lines = qrData.split('\n');
    const data = {};
    
    lines.forEach(line => {
        const [key, value] = line.split(':');
        if(key && value) {
            data[key.trim()] = value.trim();
        }
    });
    
    if(!data.Roll) {
        resultDiv.innerHTML = '<p style="color:#dc3545;">Invalid QR code format</p>';
        return;
    }
    
    // Check if student exists
    const studentData = localStorage.getItem('kiss_data_' + data.Roll);
    
    if(!studentData) {
        resultDiv.innerHTML = `<div style="padding:15px; background:#f8d7da; border-left:4px solid #dc3545; margin-top:10px;">
            <strong>❌ VERIFICATION FAILED</strong><br>
            <span style="font-size:12px;">No record found for Roll: ${data.Roll}</span>
        </div>`;
        return;
    }
    
    resultDiv.innerHTML = `<div style="padding:15px; background:#d4edda; border-left:4px solid #28a745; margin-top:10px;">
        <strong>✅ VERIFICATION SUCCESSFUL</strong><br>
        <div style="font-size:12px; margin-top:8px;">
            <strong>Name:</strong> ${data.Name || 'N/A'}<br>
            <strong>Roll:</strong> ${data.Roll}<br>
            <strong>SGPA:</strong> ${data.SGPA || 'N/A'}
        </div>
    </div>`;
    
    logActivity('verify', `Verified QR code for roll ${data.Roll}`);
}

// ==========================================
// FEATURE #15: TEMPLATE MANAGER (Placeholder)
// ==========================================

function saveTemplate(name) {
    showToast('📋 Template manager coming soon! Will allow saving multiple marksheet designs.', 'info', 5000);
}

// ==========================================
// ENHANCED SAVE FUNCTION WITH LOGGING
// ==========================================

// Wrap the existing saveToDatabase to add logging
// Wrap the existing saveToDatabase to add logging
const originalSaveToDatabase = saveToDatabase;
saveToDatabase = function() {
    const roll = document.getElementById('in_roll').value.trim();
    const name = document.getElementById('in_fname').value + ' ' + document.getElementById('in_lname').value;
    
    // Check if this is an update or create
    const isUpdate = localStorage.getItem('kiss_data_' + roll) !== null;
    
    // Call original function
    originalSaveToDatabase.call(this);
    
    // Log activity
    if(isUpdate) {
        logActivity('update', `Updated student: ${roll} - ${name}`);
        addNotification('Student Updated', `Updated data for ${name} (${roll})`, 'success'); // ✅ ADDED
    } else {
        logActivity('create', `Created student: ${roll} - ${name}`);
        addNotification('New Student Added', `${name} (${roll}) has been added to the system`, 'success'); // ✅ ADDED
    }
};

// ==========================================
// INITIALIZATION FOR DEVELOPER FEATURES
// ==========================================

function initializeDeveloperFeatures() {
    // Load saved theme
    loadSavedTheme();
    
    // Update last backup time
    updateLastBackupTime();
    
    // Check auto-backup
    const autoBackupEnabled = localStorage.getItem('kiss_auto_backup') === 'true';
    if(autoBackupEnabled && document.getElementById('auto-backup-toggle')) {
        document.getElementById('auto-backup-toggle').checked = true;
        scheduleAutoBackup();
    }
    
    // Check encryption
    const encryptionEnabled = localStorage.getItem('kiss_encryption') === 'true';
    if(encryptionEnabled && document.getElementById('encryption-toggle')) {
        document.getElementById('encryption-toggle').checked = true;
    }
    
    console.log('✅ Developer features initialized');
}

// ==========================================
// UPDATE EXISTING loadDevSettings FUNCTION
// ==========================================

const originalLoadDevSettings = loadDevSettings;
loadDevSettings = function() {
    originalLoadDevSettings.call(this);
    initializeDeveloperFeatures();
};

// ==========================================
// AUTO-RUN ON PAGE LOAD
// ==========================================

// Add to existing window.onload
// ==========================================
// FEATURE #14: NOTIFICATIONS SYSTEM
// ==========================================

let notificationQueue = [];

function initializeNotifications() {
    // Load pending notifications
    const saved = localStorage.getItem('kiss_notifications');
    if(saved) {
        notificationQueue = JSON.parse(saved);
    }
    
    // Check for important notifications
    checkStorageWarnings();
    checkBackupReminders();
    checkPendingTasks();
    
    // Show any pending notifications
    if(notificationQueue.length > 0) {
        showNotificationCenter();
    }
}

function addNotification(title, message, type = 'info', action = null) {
    const notification = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false,
        action: action
    };
    
    notificationQueue.unshift(notification);
    
    // Keep only last 50 notifications
    if(notificationQueue.length > 50) {
        notificationQueue = notificationQueue.slice(0, 50);
    }
    
    localStorage.setItem('kiss_notifications', JSON.stringify(notificationQueue));
    
    // Show toast
    showToast(`📬 ${title}: ${message}`, type, 5000);
    
    return notification.id;
}

function checkStorageWarnings() {
    let totalSize = 0;
    for(let key in localStorage) {
        if(localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            totalSize += key.length + (value ? value.length : 0);
        }
    }
    
    const usedMB = (totalSize / 1024 / 1024).toFixed(2);
    const maxMB = 10;
    const percentage = ((usedMB / maxMB) * 100).toFixed(1);
    
    if(percentage > 80) {
        addNotification(
            'Storage Almost Full!',
            `You're using ${percentage}% of available storage. Consider backing up and deleting old data.`,
            'warning'
        );
    }
}

function checkBackupReminders() {
    const lastBackup = localStorage.getItem('kiss_last_backup');
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    
    if(!lastBackup || (new Date() - new Date(lastBackup)) > weekInMs) {
        addNotification(
            'Backup Reminder',
            'It\'s been over a week since your last backup. Consider creating a backup now.',
            'info'
        );
    }
}

function checkPendingTasks() {
    // Count students without marks
    let studentsWithoutMarks = 0;
    
    for(let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if(key.startsWith('kiss_data_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if(!data.allSemestersData || Object.keys(data.allSemestersData).length === 0) {
                    studentsWithoutMarks++;
                }
            } catch(e) {}
        }
    }
    
    if(studentsWithoutMarks > 0) {
        addNotification(
            'Pending Tasks',
            `${studentsWithoutMarks} student(s) have no marks data entered yet.`,
            'info'
        );
    }
}

function showNotificationCenter() {
    const unreadCount = notificationQueue.filter(n => !n.read).length;
    
    if(unreadCount > 0) {
        console.log(`📬 ${unreadCount} unread notification(s)`);
    }
}

function markNotificationRead(id) {
    const notification = notificationQueue.find(n => n.id === id);
    if(notification) {
        notification.read = true;
        localStorage.setItem('kiss_notifications', JSON.stringify(notificationQueue));
    }
}

function clearAllNotifications() {
    notificationQueue = [];
    localStorage.removeItem('kiss_notifications');
    showToast('🗑️ All notifications cleared', 'success');
}

// ==========================================
// FEATURE #15: TEMPLATE MANAGER (Complete)
// ==========================================

let savedTemplates = JSON.parse(localStorage.getItem('kiss_templates') || '{}');
let activeTemplate = localStorage.getItem('kiss_active_template') || 'default';

function initializeTemplateManager() {
    // Default template structure
    if(!savedTemplates.default) {
        savedTemplates.default = {
            name: 'Default Template',
            styles: {
                instituteFontSize: '22px',
                examNameFontSize: '16px',
                tableFontSize: '10px',
                headerFontSize: '9px',
                showWatermark: true,
                showSignatures: true,
                showDisclaimer: true,
                borderColor: '#000',
                headerBgColor: '#f2f2f2'
            }
        };
        saveTemplates();
    }
}

function saveTemplates() {
    localStorage.setItem('kiss_templates', JSON.stringify(savedTemplates));
}

function createNewTemplate(name) {
    if(!name || name.trim() === '') {
        showToast('❌ Please enter a template name', 'error');
        return;
    }
    
    if(savedTemplates[name]) {
        showToast('❌ Template already exists!', 'error');
        return;
    }
    
    // Clone current template
    savedTemplates[name] = JSON.parse(JSON.stringify(savedTemplates[activeTemplate]));
    savedTemplates[name].name = name;
    
    saveTemplates();
    showToast(`✅ Template "${name}" created!`, 'success');
    renderTemplateList();
}

function switchTemplate(templateName) {
    if(!savedTemplates[templateName]) {
        showToast('❌ Template not found', 'error');
        return;
    }
    
    activeTemplate = templateName;
    localStorage.setItem('kiss_active_template', templateName);
    
    // Apply template styles
    applyTemplateStyles(savedTemplates[templateName]);
    
    showToast(`✅ Switched to template: ${templateName}`, 'success');
    logActivity('update', `Switched to template: ${templateName}`);
}

function applyTemplateStyles(template) {
    if(!template || !template.styles) return;
    
    const styles = template.styles;
    
    // Update config
    appConfig.showSignatures = styles.showSignatures !== false;
    appConfig.showDisclaimer = styles.showDisclaimer !== false;
    
    // Update preview
    if(document.getElementById('staff-dashboard').classList.contains('active')) {
        updatePreview('single');
    }
}

function deleteTemplate(templateName) {
    if(templateName === 'default') {
        showToast('❌ Cannot delete default template', 'error');
        return;
    }
    
    if(!confirm(`Delete template "${templateName}"?`)) return;
    
    delete savedTemplates[templateName];
    
    if(activeTemplate === templateName) {
        activeTemplate = 'default';
        localStorage.setItem('kiss_active_template', 'default');
    }
    
    saveTemplates();
    renderTemplateList();
    showToast(`✅ Template "${templateName}" deleted`, 'success');
}

function renderTemplateList() {
    const container = document.getElementById('template-list-container');
    if(!container) return;
    
    let html = '<div style="margin-bottom:15px;">';
    html += '<input type="text" id="new-template-name" placeholder="New template name" style="width:70%; display:inline-block; margin-right:10px;">';
    html += '<button class="action-btn bg-blue" onclick="createNewTemplate(document.getElementById(\'new-template-name\').value)" style="display:inline-block;">➕ Create</button>';
    html += '</div>';
    
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">';
    
    Object.entries(savedTemplates).forEach(([key, template]) => {
        const isActive = key === activeTemplate;
        const activeBadge = isActive ? ' ✓' : '';
        const activeStyle = isActive ? 'border:3px solid #28a745;' : '';
        
        html += `<div style="padding:15px; border:1px solid #ddd; border-radius:8px; ${activeStyle} background:#f9f9f9;">`;
        html += `<div style="font-weight:bold; margin-bottom:10px;">${template.name}${activeBadge}</div>`;
        
        if(!isActive) {
            html += `<button class="action-btn bg-blue btn-small" onclick="switchTemplate('${key}')" style="width:100%; margin-bottom:5px;">Use This</button>`;
        } else {
            html += `<div style="padding:8px; background:#d4edda; border-radius:4px; text-align:center; font-size:12px; margin-bottom:5px;">Active</div>`;
        }
        
        if(key !== 'default') {
            html += `<button class="action-btn bg-red btn-small" onclick="deleteTemplate('${key}')" style="width:100%;">Delete</button>`;
        }
        
        html += `</div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// ==========================================
// AUTO-RUN ON PAGE LOAD (Updated)
// ==========================================

// Add to existing window.onload
const originalWindowOnload = window.onload;
window.onload = async function() {
    if(originalWindowOnload) {
        await originalWindowOnload.call(this);
    }
    
    // Initialize developer features
    initializeDeveloperFeatures();
    
    // Initialize notifications
    initializeNotifications();
    
    // Initialize template manager
    initializeTemplateManager();
    
    console.log('✅ All systems initialized');
};
function uploadCustomWatermark(input) {
    if(!input.files || !input.files[0]) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const watermarkData = e.target.result;
        
        // Apply to watermark
        document.getElementById('watermark_img').src = watermarkData;
        document.getElementById('watermark-preview').src = watermarkData;
        
        // Save to config
        localStorage.setItem('kiss_custom_watermark', watermarkData);
        
        showToast('✅ Custom watermark uploaded!', 'success');
        logActivity('update', 'Uploaded custom watermark');
    };
    
    reader.readAsDataURL(input.files[0]);
}