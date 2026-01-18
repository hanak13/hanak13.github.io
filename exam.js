let students = [];
let questions = [];
let examConfig = {};
let currentStudent = null;
let timerInterval = null;
let questionCounter = 0;
// Check if accessed from student panel - prevent staff features
// ==========================================
// EXAM SYSTEM ACCESS CONTROL
// ==========================================

// Check if accessed from student panel - prevent staff features
// Check if accessed from student panel - prevent staff features
const isStudentMode = window.location.hash === '#student';
const isStaffMode = window.location.hash === '#staff';

// Auto-navigate based on hash
window.addEventListener('load', function() {
    if(isStudentMode) {
        // Hide staff panel button
        const staffBtn = document.querySelector('button[onclick="showStaffPanel()"]');
        if(staffBtn) {
            staffBtn.style.display = 'none';
        }
        
        // Auto-show student panel
        setTimeout(() => {
            showStudentPanel();
        }, 100);
    } else if(isStaffMode) {
        // Auto-show staff panel for staff access
        setTimeout(() => {
            showStaffPanel();
        }, 100);
    }
});

// ✅ NEW: Function to check if user has staff permissions
function checkExamStaffPermission() {
    // Check if parent window has staff role
    if(window.parent && window.parent.currentStaffRole) {
        const role = window.parent.currentStaffRole;
        
        // Only 'exam' and 'all' roles can access exam staff panel
        if(role === 'exam' || role === 'all') {
            return true;
        }
        
        showToast('❌ Access Denied! Your role does not have exam management permissions.', 'error', 5000);
        return false;
    }
    
    // If no role found, might be direct access - block it
    if(!isStudentMode && window.location.hash === '#staff') {
        showToast('❌ Access Denied! Please login through the main portal.', 'error', 5000);
        return false;
    }
    
    return false;
}
// Toast notification function
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if(!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        min-width: 300px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        color: white;
        font-weight: bold;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#fd7e14',
        info: '#007bff'
    };
    toast.style.background = colors[type] || colors.info;
    
    toast.textContent = message;
    
    toast.onclick = function() {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    };
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
// Load students from marksheet system
function loadStudentsFromMarksheet() {
    const students = [];
    for(let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key.startsWith('kiss_data_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                students.push({
                    roll: data.roll,
                    dob: data.dob
                });
            } catch(e) {}
        }
    }
    return students;
}

// Panel Navigation Functions
function showStaffPanel() {
    // ✅ CHECK PRIVILEGE - Students blocked
    if(isStudentMode) {
        showToast('❌ Access Denied! Students cannot access staff panel.', 'error', 4000);
        return;
    }
    
    // ✅ NEW: Check if staff has exam permissions
    if(!checkExamStaffPermission()) {
        // Redirect back to parent portal
        if(window.parent && window.parent !== window) {
            window.parent.postMessage('unauthorized_exam_access', '*');
        }
        return;
    }
    
    document.getElementById('modeSelection').classList.add('hidden');
    document.getElementById('staffPanel').classList.remove('hidden');
    loadStudents();
    displayStudents();
}

function showStudentPanel() {
    document.getElementById('modeSelection').classList.add('hidden');
    document.getElementById('studentPanel').classList.remove('hidden');
}

function backToMode() {
    document.getElementById('modeSelection').classList.remove('hidden');
    document.getElementById('staffPanel').classList.add('hidden');
    document.getElementById('studentPanel').classList.add('hidden');
    document.getElementById('studentLogin').classList.remove('hidden');
    document.getElementById('examInterface').classList.add('hidden');
    document.getElementById('examResults').classList.add('hidden');
    if (timerInterval) clearInterval(timerInterval);
}

// Student Management Functions
function addStudent() {
    const roll = document.getElementById('studentRoll').value.trim();
    const dob = document.getElementById('studentDob').value;

    if (!roll || !dob) {
        alert('Please enter both roll number and date of birth');
        return;
    }

    if (students.find(s => s.roll === roll)) {
        alert('Student with this roll number already exists');
        return;
    }

    students.push({ roll, dob });
    saveStudents();
    displayStudents();
    
    document.getElementById('studentRoll').value = '';
    document.getElementById('studentDob').value = '';
}

function deleteStudent(roll) {
    students = students.filter(s => s.roll !== roll);
    saveStudents();
    displayStudents();
}

function clearAllStudents() {
    if (confirm('Are you sure you want to delete all students?')) {
        students = [];
        saveStudents();
        displayStudents();
    }
}

function displayStudents() {
    const list = document.getElementById('studentList');
    if (students.length === 0) {
        list.innerHTML = '<p style="color: #999;">No students added yet</p>';
        return;
    }

    list.innerHTML = students.map(s => `
        <div class="student-item">
            <span><strong>Roll:</strong> ${s.roll} | <strong>DOB:</strong> ${s.dob}</span>
            <button class="delete-btn" onclick="deleteStudent('${s.roll}')">Delete</button>
        </div>
    `).join('');
}

function saveStudents() {
    localStorage.setItem('examStudents', JSON.stringify(students));
}

function loadStudents() {
    const data = localStorage.getItem('examStudents');
    if (data) {
        students = JSON.parse(data);
    }
    // Also load from marksheet system
    const marksheetStudents = loadStudentsFromMarksheet();
    marksheetStudents.forEach(ms => {
        if(!students.find(s => s.roll === ms.roll)) {
            students.push(ms);
        }
    });
}

// Question Management Functions
function addQuestion() {
    // ✅ VALIDATION: Check if previous question is complete
    if(questionCounter > 0) {
        const lastQuestionDiv = document.getElementById(`question-${questionCounter}`);
        if(lastQuestionDiv) {
            const questionText = document.getElementById(`qtext-${questionCounter}`).value.trim();
            const questionType = lastQuestionDiv.querySelector('select').value;
            
            // Check if question text is empty
            if(!questionText) {
                showToast('❌ Please fill the question text before adding a new question!', 'error', 4000);
                document.getElementById(`qtext-${questionCounter}`).focus();
                return;
            }
            
            // If MCQ, check if all options are filled
            if(questionType === 'mcq') {
                const optionCount = parseInt(document.getElementById(`optionCount-${questionCounter}`).value);
                let allOptionsFilled = true;
                let emptyOptionIndex = -1;
                
                for(let i = 0; i < optionCount; i++) {
                    const optionValue = document.getElementById(`option-${questionCounter}-${i}`).value.trim();
                    if(!optionValue) {
                        allOptionsFilled = false;
                        emptyOptionIndex = i + 1;
                        break;
                    }
                }
                
                if(!allOptionsFilled) {
                    showToast(`❌ Please fill Option ${emptyOptionIndex} before adding a new question!`, 'error', 4000);
                    document.getElementById(`option-${questionCounter}-${emptyOptionIndex - 1}`).focus();
                    return;
                }
                
                // Check if at least one correct answer is selected
                let hasCorrectAnswer = false;
                for(let i = 0; i < optionCount; i++) {
                    if(document.getElementById(`correct-${questionCounter}-${i}`).checked) {
                        hasCorrectAnswer = true;
                        break;
                    }
                }
                
                if(!hasCorrectAnswer) {
                    showToast('❌ Please select at least one correct answer before adding a new question!', 'error', 4000);
                    return;
                }
            }
        }
    }
    
    // ✅ If validation passed, add new question
    questionCounter++;
    const container = document.getElementById('questionsContainer');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.id = `question-${questionCounter}`;
    
    questionDiv.innerHTML = `
        <h4>Question ${questionCounter}</h4>
        <div class="form-group">
            <label>Question Type</label>
            <select onchange="updateQuestionType(${questionCounter}, this.value)">
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="normal">Normal (Text Answer)</option>
            </select>
        </div>
        <div class="form-group">
            <label>Question Text</label>
            <textarea id="qtext-${questionCounter}" placeholder="Enter question"></textarea>
        </div>
        <div id="mcq-options-${questionCounter}">
            <label>Number of Options</label>
            <input type="number" id="optionCount-${questionCounter}" value="4" min="2" max="10" onchange="generateOptions(${questionCounter})">
            <div class="checkbox-label">
                <input type="checkbox" id="multiAnswer-${questionCounter}">
                <label>Multiple correct answers</label>
            </div>
            <div id="options-${questionCounter}"></div>
        </div>
        <button class="delete-btn" onclick="deleteQuestion(${questionCounter})">Delete Question</button>
    `;
    
    container.appendChild(questionDiv);
    generateOptions(questionCounter);
}

function generateOptions(qNum) {
    const count = parseInt(document.getElementById(`optionCount-${qNum}`).value) || 4;
    const container = document.getElementById(`options-${qNum}`);
    
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.innerHTML += `
            <div class="option-input">
                <input type="text" id="option-${qNum}-${i}" placeholder="Option ${i + 1}">
                <input type="checkbox" id="correct-${qNum}-${i}">
                <label>Correct</label>
            </div>
        `;
    }
}

function updateQuestionType(qNum, type) {
    const mcqDiv = document.getElementById(`mcq-options-${qNum}`);
    mcqDiv.style.display = type === 'mcq' ? 'block' : 'none';
}

function deleteQuestion(qNum) {
    const element = document.getElementById(`question-${qNum}`);
    if (element) {
        element.remove();
    }
}

function publishExam() {
    const title = document.getElementById('examTitle').value.trim();
    const timer = parseInt(document.getElementById('examTimer').value);
    const showResults = document.getElementById('showResultsAfter').checked;

    if (!title || !timer) {
        showToast('Please enter exam title and timer', 'warning', 3000);
        return;
    }

    questions = [];
    for (let i = 1; i <= questionCounter; i++) {
        const qDiv = document.getElementById(`question-${i}`);
        if (!qDiv) continue;

        const qText = document.getElementById(`qtext-${i}`).value.trim();
        if (!qText) {
            showToast(`❌ Question ${i} is incomplete! Please fill the question text.`, 'error', 4000);
            document.getElementById(`qtext-${i}`).focus();
            return;
        }

        const qType = qDiv.querySelector('select').value;
        const question = {
            id: i,
            text: qText,
            type: qType
        };

        if (qType === 'mcq') {
            const optionCount = parseInt(document.getElementById(`optionCount-${i}`).value);
            const multiAnswer = document.getElementById(`multiAnswer-${i}`).checked;
            
            question.options = [];
            question.correctAnswers = [];
            question.multiAnswer = multiAnswer;

            for (let j = 0; j < optionCount; j++) {
                const optText = document.getElementById(`option-${i}-${j}`).value.trim();
                
                if (!optText) {
                    showToast(`❌ Question ${i}, Option ${j + 1} is empty! Please fill all options.`, 'error', 4000);
                    document.getElementById(`option-${i}-${j}`).focus();
                    return;
                }
                
                const isCorrect = document.getElementById(`correct-${i}-${j}`).checked;
                
                question.options.push(optText);
                if (isCorrect) question.correctAnswers.push(j);
            }
            
            if (question.correctAnswers.length === 0) {
                showToast(`❌ Question ${i} has no correct answer selected! Please mark at least one option as correct.`, 'error', 4000);
                return;
            }
        }

        questions.push(question);
    }

    if (questions.length === 0) {
        showToast('Please add at least one question', 'warning', 3000);
        return;
    }

    examConfig = { title, timer, showResults };
    
    localStorage.setItem('publishedExam', JSON.stringify({ questions, config: examConfig }));
    
    showToast('✅ Exam published successfully!', 'success', 3000);
}

// Student Login and Exam Functions
function studentLogin() {
    const roll = document.getElementById('loginRoll').value.trim();
    const dob = document.getElementById('loginDob').value;

    if (!roll || !dob) {
        alert('Please enter both roll number and date of birth');
        return;
    }

    loadStudents();
    const student = students.find(s => s.roll === roll && s.dob === dob);

    if (!student) {
        alert('Invalid credentials');
        return;
    }

    const examData = localStorage.getItem('publishedExam');
    if (!examData) {
        alert('No exam available at the moment');
        return;
    }

    const { questions: examQuestions, config } = JSON.parse(examData);
    questions = examQuestions;
    examConfig = config;
    currentStudent = student;

    document.getElementById('studentLogin').classList.add('hidden');
    document.getElementById('examInterface').classList.remove('hidden');
    
    startExam();
}

function startExam() {
    document.getElementById('examTitleDisplay').textContent = examConfig.title;
    
    let timeLeft = examConfig.timer * 60;
    updateTimerDisplay(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time is up!');
            submitExam();
        }
    }, 1000);

    displayExamQuestions();
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('examTimer').textContent = 
        `Time Left: ${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function displayExamQuestions() {
    const container = document.getElementById('examQuestions');
    container.innerHTML = questions.map((q, idx) => {
        if (q.type === 'mcq') {
            return `
                <div class="question-item">
                    <h4>Question ${idx + 1}</h4>
                    <p>${q.text}</p>
                    ${q.options.map((opt, i) => `
                        <div class="checkbox-label">
                            <input type="${q.multiAnswer ? 'checkbox' : 'radio'}" 
                                   name="q${q.id}" 
                                   id="ans-${q.id}-${i}"
                                   value="${i}">
                            <label for="ans-${q.id}-${i}">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            return `
                <div class="question-item">
                    <h4>Question ${idx + 1}</h4>
                    <p>${q.text}</p>
                    <textarea id="ans-${q.id}" class="answer-input" placeholder="Write your answer here..."></textarea>
                </div>
            `;
        }
    }).join('');
}

function submitExam() {
    if (timerInterval) clearInterval(timerInterval);
    
    // ✅ TRACK STUDENT SUBMISSION
    const submissions = JSON.parse(localStorage.getItem('examSubmissions') || '[]');
    
    // Check if student already submitted (avoid duplicates)
    if(!submissions.find(s => s.roll === currentStudent.roll)) {
        submissions.push({
            roll: currentStudent.roll,
            dob: currentStudent.dob,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('examSubmissions', JSON.stringify(submissions));
    }
    if (timerInterval) clearInterval(timerInterval);

    const answers = {};
    questions.forEach(q => {
        if (q.type === 'mcq') {
            const selected = [];
            q.options.forEach((opt, i) => {
                const input = document.getElementById(`ans-${q.id}-${i}`);
                if (input && input.checked) {
                    selected.push(i);
                }
            });
            answers[q.id] = selected;
        } else {
            const textarea = document.getElementById(`ans-${q.id}`);
            answers[q.id] = textarea ? textarea.value.trim() : '';
        }
    });

    document.getElementById('examInterface').classList.add('hidden');
    
    if (examConfig.showResults) {
        displayResults(answers);
    } else {
        document.getElementById('examResults').innerHTML = `
            <div class="result-card">
                <h3>Exam Submitted Successfully!</h3>
                <p>Your answers have been recorded. Results will be announced later.</p>
                <button onclick="backToMode()">Exit</button>
            </div>
        `;
        document.getElementById('examResults').classList.remove('hidden');
    }
}

function displayResults(answers) {
    let score = 0;
    let totalMcq = 0;

    const resultsHtml = questions.map((q, idx) => {
        if (q.type === 'mcq') {
            totalMcq++;
            const userAnswers = answers[q.id] || [];
            const correct = JSON.stringify(userAnswers.sort()) === JSON.stringify(q.correctAnswers.sort());
            if (correct) score++;

            return `
                <div class="question-item">
                    <h4>Question ${idx + 1} ${correct ? '✅' : '❌'}</h4>
                    <p>${q.text}</p>
                    <p><strong>Your answer:</strong> ${userAnswers.map(i => q.options[i]).join(', ') || 'Not answered'}</p>
                    <p><strong>Correct answer:</strong> ${q.correctAnswers.map(i => q.options[i]).join(', ')}</p>
                </div>
            `;
        } else {
            return `
                <div class="question-item">
                    <h4>Question ${idx + 1}</h4>
                    <p>${q.text}</p>
                    <p><strong>Your answer:</strong> ${answers[q.id] || 'Not answered'}</p>
                    <p style="color: #999;"><em>This will be checked manually by staff</em></p>
                </div>
            `;
        }
    }).join('');

    const percentage = totalMcq > 0 ? ((score / totalMcq) * 100).toFixed(2) : 0;

    document.getElementById('examResults').innerHTML = `
        <div class="result-card">
            <h3>Exam Results</h3>
            <p><strong>MCQ Score:</strong> ${score} / ${totalMcq} (${percentage}%)</p>
        </div>
        ${resultsHtml}
        <button onclick="backToMode()">Exit</button>
    `;
    document.getElementById('examResults').classList.remove('hidden');
}
// ==========================================
// LISTEN FOR UNAUTHORIZED ACCESS FROM IFRAME
// ==========================================

window.addEventListener('message', function(event) {
    if(event.data === 'unauthorized_exam_access') {
        showToast('❌ Access Denied! Returning to staff menu...', 'error', 3000);
        
        // Go back to staff mode selection
        setTimeout(() => {
            document.querySelectorAll('.step').forEach(e => e.classList.remove('active'));
            document.getElementById('staff-mode-selection').classList.add('active');
        }, 1000);
    }
});