let assessmentData = { DataList: [] };

// Fetch assessment data
async function fetchData() {
    try {
        const response = await fetch("http://localhost:3001/api/cloudsave", { method: "GET" });
        if (!response.ok) {
            throw new Error("Failed to fetch data.");
        }
        
        const result = await response.json();
        
        // Parse the nested JSON structure
        if (result.results && result.results.length > 0) {
            const parsedData = JSON.parse(result.results[0]?.value || "{}");
            assessmentData = parsedData.hasOwnProperty('DataList') 
                ? parsedData 
                : { DataList: parsedData };
        }
        
        console.log("Assessment Data:", assessmentData);
        displayData();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function fetchGameData() {
    try {
        const response = await fetch("http://localhost:3001/api/cloudsave");
        const data = await response.json();
        console.log("Game Data:", data.results[0]?.value);
    } catch (error) {
        console.error("Error fetching game data:", error);
    }
}

fetchGameData();

// Display data in table
function displayData() {
    const tableBody = document.getElementById("assessmentList");
    tableBody.innerHTML = ""; // Clear previous entries

    assessmentData.DataList.forEach((item, index) => {
        const row = document.createElement("tr");
        var categories = ["None", "Analyzing Literature", "Modals", "VerbForms", "Vocabulary", "Making Connection"];
        var gameType = ["None", "Grab And Place", "Paragraph Grab And Place", "Sliding Puzzle", "Slice Game", "Categorize Answers", "Grab And Throw", "Graphic Organizer"];

        row.innerHTML = `
            <td>
                ${item.Title}
            </td>
            <td>${categories[item.GameCategory]}</td>
            <td>${gameType[item.Type]}</td>
            <td>
                <button 
                    class="action-btn btn-view" 
                    onclick="viewDetails(${index})"
                >
                    View Details
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Update title in data array
function updateTitle(index, newTitle) {
    assessmentData.DataList[index].Title = newTitle;
}

// Update score in data array
function updateScore(index, newScore) {
    assessmentData.DataList[index].Score = parseInt(newScore);
}

// Modify the showDetailsView function to include toggle, add, and remove functionality
function showDetailsView(index) {
    const assessment = assessmentData.DataList[index];
    const detailsContainer = document.getElementById('dashboardDetails');
    var categories = ["None", "Analyzing Literature", "Modals", "VerbForms", "Vocabulary", "Making Connection"];
        var gameType = ["None", "Grab And Place", "Paragraph Grab And Place", "Sliding Puzzle", "Slice Game", "Categorize Answers", "Grab And Throw", "Graphic Organizer"];

    var assessmentLabel = "Question";
    var assessmentQuestionLabel = "Question:";
    var assessmentCorrectAnswerLabel = "Correct Answer:";
    var assessmentChoicesLabel = "Choices:";

    switch (assessment.Type) {
        case 5:
            assessmentLabel = "Category";
            assessmentQuestionLabel = "Description:";
            assessmentCorrectAnswerLabel = "Category:";
            assessmentChoicesLabel = "Correct Answers:";
            break;
    }
    
    detailsContainer.innerHTML = `
        <div class="assessment-details-content">
            <div class="modal-header">
                <h2>${assessment.Title}</h2>
            </div>

            <div class="assessment-overview">
                <div class="overview-grid">
                    <div class="overview-item">
                        <label>Lesson</label>
                        <span>${categories[assessment.GameCategory]}</span>
                    </div>
                    <div class="overview-item">
                        <label>Game Type</label>
                        <span>${gameType[assessment.Type]}</span>
                    </div>
                </div>
                
                    <div class="overview-item">
                        <label>Time Limit (Seconds)</label>
                        <input 
                            type="number" 
                            value="${assessment.ActivitySecondsTimer || 0}" 
                            class="editable-input timer-input" 
                            id="activity-timer-input"
                            min="0"
                        >
                    </div>
            </div>

            <div class="questions-section">
                <h3>Assessment Questions</h3>
                ${assessment.Data.map((question, qIndex) => `
                    <div class="question-card" data-question-index="${qIndex}">
                        <div class="question-header">
                            <span class="question-number">${assessmentLabel} ${qIndex + 1}</span>
                        </div>
                        <div class="question-body">
                            <div class="question-text">
                                <strong>${assessmentQuestionLabel}</strong> 
                                <input 
                                    type="text" 
                                    value="${question.Question}" 
                                    class="editable-input full-width question-input"
                                    data-original-value="${question.Question}"
                                >
                            </div>
                            <div class="question-details">
                                <div class="detail-item correct-answer-container">
                                    <strong>${assessmentCorrectAnswerLabel}</strong>
                                    <input 
                                        type="text" 
                                        value="${question.CorrectAnswer}" 
                                        class="editable-input correct-answer correct-answer-input"
                                        data-original-value="${question.CorrectAnswer}"
                                    >
                                </div>
                                <div class="detail-item">
                                    <div class="choices-header">
                                        <strong>${assessmentChoicesLabel} (${question.ChoicesList.length})</strong>
                                        <button type="button" class="toggle-choices-btn" onclick="toggleChoices(${qIndex})">
                                            <span class="toggle-icon">►</span>
                                        </button>
                                    </div>
                                    <ul class="choices-list collapsed" id="choices-list-${qIndex}">
                                        ${question.ChoicesList.map((choice, choiceIndex) => `
                                            <li class="${choice === question.CorrectAnswer ? 'correct-choice' : ''}">
                                                <div class="choice-container">
                                                    <input 
                                                        type="text" 
                                                        value="${choice}" 
                                                        class="editable-input choice-input"
                                                        data-original-value="${choice}"
                                                    >
                                                    <button 
                                                        type="button" 
                                                        class="remove-choice-btn" 
                                                        onclick="removeChoice(${qIndex}, ${choiceIndex})"
                                                    >
                                                        ${choice === question.CorrectAnswer ? '' : '✕'}
                                                    </button>
                                                </div>
                                            </li>
                                        `).join('')}
                                    </ul>
                                    <button 
                                        type="button" 
                                        class="add-choice-btn" 
                                        onclick="addChoice(${qIndex})"
                                    >
                                        + Add Choice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div class="modal-actions">
                    <button class="action-btn btn-save" onclick="saveModalChanges(${index})">Save Changes</button>
                </div>
            </div>
        </div>
    `;
}

// Toggle choices visibility
function toggleChoices(questionIndex) {
    const choicesList = document.getElementById(`choices-list-${questionIndex}`);
    const toggleBtn = choicesList.previousElementSibling.querySelector('.toggle-icon');
    
    if (choicesList.classList.contains('collapsed')) {
        choicesList.classList.remove('collapsed');
        toggleBtn.textContent = '▼';
    } else {
        choicesList.classList.add('collapsed');
        toggleBtn.textContent = '►';
    }
}

// Remove a choice
function removeChoice(questionIndex, choiceIndex) {
    // Make sure we don't remove the last choice
    if (assessmentData.DataList[currentAssessmentIndex].Data[questionIndex].ChoicesList.length <= 1) {
        showSaveModal('Cannot remove the last choice!', 'error');
        return;
    }
    
    // Remove the choice from the data
    assessmentData.DataList[currentAssessmentIndex].Data[questionIndex].ChoicesList.splice(choiceIndex, 1);
    
    // Check if removed choice was the correct answer
    const correctAnswer = assessmentData.DataList[currentAssessmentIndex].Data[questionIndex].CorrectAnswer;
    const removedChoice = assessmentData.DataList[currentAssessmentIndex].Data[questionIndex].ChoicesList[choiceIndex];
    
    if (correctAnswer === removedChoice) {
        // If correct answer was removed, set first remaining choice as correct
        assessmentData.DataList[currentAssessmentIndex].Data[questionIndex].CorrectAnswer = 
            assessmentData.DataList[currentAssessmentIndex].Data[questionIndex].ChoicesList[0];
    }
    
    // Refresh the view
    showDetailsView(currentAssessmentIndex);
}

// Add a new choice
function addChoice(questionIndex) {
    // Add a new empty choice
    assessmentData.DataList[currentAssessmentIndex].Data[questionIndex].ChoicesList.push("New Choice");
    
    // Refresh the view
    showDetailsView(currentAssessmentIndex);
    
    // Focus on the new choice input
    const choicesList = document.getElementById(`choices-list-${questionIndex}`);
    const inputs = choicesList.querySelectorAll('.choice-input');
    const newInput = inputs[inputs.length - 1];
    
    if (newInput) {
        newInput.focus();
        newInput.select();
    }
}

// Add a variable to track the current assessment being viewed
let currentAssessmentIndex = -1;

// Modify viewDetails to save the current index
function viewDetails(index) {
    currentAssessmentIndex = index;
    showDetailsView(index);
}

// Update the saveModalChanges function to use currentAssessmentIndex as a fallback
function saveModalChanges(assessmentIndex) {
    // Use provided index or fall back to currentAssessmentIndex
    const index = (assessmentIndex !== undefined) ? assessmentIndex : currentAssessmentIndex;
    
    if (index === -1) {
        console.error("No assessment selected");
        return;
    }

    const detailsContainer = document.getElementById('dashboardDetails');

    // Save the selected game type
    const gameTypeDropdown = document.getElementById('game-type-dropdown');
    if (gameTypeDropdown) {
        assessmentData.DataList[index].Type = parseInt(gameTypeDropdown.value);
    }
    
    // Save the timer value
    const timerInput = document.getElementById('activity-timer-input');
    if (timerInput) {
        assessmentData.DataList[index].ActivitySecondsTimer = parseInt(timerInput.value) || 0;
    }

    const questionCards = detailsContainer.querySelectorAll('.question-card');

    questionCards.forEach((card, questionIndex) => {
        // Update question text
        const questionInput = card.querySelector('.question-input');
        assessmentData.DataList[index].Data[questionIndex].Question = questionInput.value;

        // Update correct answer
        const correctAnswerInput = card.querySelector('.correct-answer-input');
        assessmentData.DataList[index].Data[questionIndex].CorrectAnswer = correctAnswerInput.value;

        // Update choices - now we collect them directly from DOM
        const choiceInputs = card.querySelectorAll('.choice-input');
        assessmentData.DataList[index].Data[questionIndex].ChoicesList = 
            Array.from(choiceInputs).map(input => input.value);
    });

    // Refresh the display
    displayData();

    // Save to cloud
    updateData();

    // Show save confirmation modal
    showSaveModal('Changes saved successfully!');
}

function showSaveModal(message, type = 'success') {
    // Remove any existing modals first
    const existingModal = document.querySelector('.save-confirmation-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal wrapper
    const modalWrapper = document.createElement('div');
    modalWrapper.className = `modal save-confirmation-modal ${type}`;
    
    // Modal content
    modalWrapper.innerHTML = `
        <div class="modal-content save-modal">
            <div class="save-modal-icon">
                ${type === 'success' 
                    ? '✅' 
                    : type === 'error' 
                    ? '❌' 
                    : 'ℹ️'}
            </div>
            <h3>${message}</h3>
            <button class="save-modal-close">Close</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modalWrapper);
    
    // Trigger show
    setTimeout(() => {
        modalWrapper.classList.add('show');
    }, 10);
    
    // Close button functionality
    const closeButton = modalWrapper.querySelector('.save-modal-close');
    closeButton.addEventListener('click', () => {
        modalWrapper.classList.remove('show');
        setTimeout(() => {
            modalWrapper.remove();
            location.reload();
        }, 300);
    });

    // Auto-close after 3 seconds
    setTimeout(() => {
        if (modalWrapper) {
            modalWrapper.classList.remove('show');
            setTimeout(() => {
                modalWrapper.remove();
            }, 300);
        }
    }, 3000);
}

async function updateData() {
    try {
        const response = await fetch("http://localhost:3001/api/cloudsave", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                assessmentData: assessmentData 
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update data.");
        }

        const result = await response.json();
        console.log("Data updated successfully:", result);
    } catch (error) {
        console.error("Error updating data:", error);
        alert("Failed to update data. Please try again.");
    }
}

// Apply search and sorting
function applyFilters() {
    const searchValue = document.getElementById("search").value.toLowerCase();

    let filteredData = [...assessmentData.DataList];
    var categories = ["None", "Analyzing Literature", "Modals", "VerbForms", "Vocabulary", "Making Connection"];
        var gameType = ["None", "Grab And Place", "Paragraph Grab And Place", "Sliding Puzzle", "Slice Game", "Categorize Answers", "Grab And Throw", "Graphic Organizer"];

    // Search filter
    if (searchValue) {
        filteredData = filteredData.filter(item => 
            item.Title.toLowerCase().includes(searchValue)
        );
    }

    // Update the display with filtered and sorted data
    const tableBody = document.getElementById("assessmentList");
    tableBody.innerHTML = ""; // Clear previous entries

    filteredData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                ${item.Title}
            </td>
            <td>${categories[item.GameCategory]}</td>
            <td>${gameType[item.Type]}</td>
            <td>
                <button 
                    class="action-btn btn-view" 
                    onclick="viewDetails(${index})"
                >
                    View Details
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Load data on startup
fetchData();