const historyList = document.getElementById('history-list');
const totalSpentElement = document.getElementById('total-spent');
let totalSpent = 0;

// Load saved history from localStorage on page load
const savedHistory = JSON.parse(localStorage.getItem('calculationHistory')) || [];

// Function to create a history item
function createHistoryItem(expression, result, text) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <input class="history-input" value="${expression}" readonly>
        <input class="history-text" value="${text || ''}" readonly>
        = <span class="history-result" data-result="${result}">${result}</span>
        <button class="edit-button" onclick="editHistoryItem(this)"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="save-button" style="display: none;" onclick="saveHistoryItem(this)"><i class="fa-solid fa-floppy-disk"></i></button>
        <button class="delete-button" onclick="deleteHistoryItem(this)"><i class="fa-solid fa-trash"></i></button>
    `;
    return listItem;
}

// Populate the history list
savedHistory.forEach(item => {
    const [expression, result, text] = item.split(' = ');
    const listItem = createHistoryItem(expression, result, text);
    historyList.appendChild(listItem);
    totalSpent += parseFloat(result);
});

// Update the total amount spent
totalSpentElement.textContent = totalSpent.toFixed(2);

function appendToDisplay(value) {
    const display = document.getElementById('display');
    const currentDisplay = display.value;

    // Convert '*' to 'x' for display
    if (value === '*') {
        value = 'x';
    }

    // Check if the last character is an operator
    if (isOperator(currentDisplay[currentDisplay.length - 1]) && isOperator(value)) {
        // Replace the last operator with the new one
        display.value = currentDisplay.slice(0, -1) + value;
    } else {
        display.value += value;
    }
}

function isOperator(char) {
    return ['+', '-', 'x', '/'].includes(char);
}

function deleteLastCharacter() {
    const currentDisplay = document.getElementById('display').value;
    document.getElementById('display').value = currentDisplay.slice(0, -1);
}

function clearDisplay() {
    document.getElementById('display').value = ''; // Reset to zero
}

function calculateResult() {
    const displayValue = document.getElementById('display').value.replace(/x/g, '*');
    try {
        let result = eval(displayValue);

        // Limit the result to two decimal places
        result = parseFloat(result.toFixed(2));

        document.getElementById('display').value = result;

        // Reset display to zero after calculation
        setTimeout(() => {
            document.getElementById('display').value = '';
        }, 1000);

        // Add the calculation to the history
        const listItem = createHistoryItem(displayValue.replace(/\*/g, 'x'), result.toFixed(2), ""); // Format result to two decimal places
        historyList.appendChild(listItem);

        // Update the total amount spent
        totalSpent += result;
        totalSpentElement.textContent = totalSpent.toFixed(2);

        // Save the updated history to localStorage
        updateLocalStorage();
    } catch (error) {
        document.getElementById('display').value = 'Error';
    }
}

function updateLocalStorage() {
    const historyItems = [];
    const historyElements = historyList.querySelectorAll('li');
    historyElements.forEach(item => {
        const expression = item.querySelector('.history-input').value;
        const result = item.querySelector('.history-result').textContent;
        const text = item.querySelector('.history-text').value;
        historyItems.push(`${expression} = ${result} ${text || ''}`);
    });

    // Save the updated history to localStorage
    localStorage.setItem('calculationHistory', JSON.stringify(historyItems));
}

function editHistoryItem(button) {
    const listItem = button.parentElement;
    const inputExpression = listItem.querySelector('.history-input');
    const inputText = listItem.querySelector('.history-text');
    const saveButton = listItem.querySelector('.save-button');

    saveButton.style.display = 'block';
    inputExpression.removeAttribute('readonly');
    inputText.removeAttribute('readonly');
    inputExpression.focus();
    button.style.display = 'none';
}

function saveHistoryItem(button) {
    const listItem = button.parentElement;
    const inputExpression = listItem.querySelector('.history-input');
    const inputText = listItem.querySelector('.history-text');
    const saveButton = listItem.querySelector('.save-button');
    const resultElement = listItem.querySelector('.history-result');

    // Store the previous result
    const previousResult = parseFloat(resultElement.dataset.result);

    const newText = inputText.value;
    listItem.querySelector('.history-text').textContent = newText;

    saveButton.style.display = 'none';
    inputExpression.setAttribute('readonly', 'readonly');
    inputText.setAttribute('readonly', 'readonly');

    const editButton = listItem.querySelector('.edit-button');
    editButton.style.display = 'block';

    // Recalculate the result if the expression is edited
    const expression = inputExpression.value.replace(/x/g, '*');
    try {
        let result = eval(expression);
        result = parseFloat(result.toFixed(2));

        resultElement.textContent = result;
        resultElement.dataset.result = result; // Update the data-result attribute

        // Update the total amount spent
        totalSpent = totalSpent - previousResult + result;
        totalSpentElement.textContent = totalSpent.toFixed(2);

        // Save the updated history to localStorage
        updateLocalStorage();
    } catch (error) {
        document.getElementById('error-message').textContent = 'Invalid expression';
        setTimeout(() => {
            document.getElementById('error-message').textContent = '';
        }, 3000);
    }
}

function deleteHistoryItem(button) {
    const listItem = button.parentElement;
    const result = parseFloat(listItem.querySelector('.history-result').dataset.result);

    // Update the total amount spent
    totalSpent -= result;
    totalSpentElement.textContent = totalSpent.toFixed(2);

    // Remove the item from the DOM
    listItem.remove();

    // Save the updated history to localStorage
    updateLocalStorage();
}

function clearHistory() {
    // Clear the history list
    historyList.innerHTML = '';

    // Reset the total amount spent
    totalSpent = 0;
    totalSpentElement.textContent = totalSpent.toFixed(2);

    // Clear the history in localStorage
    localStorage.removeItem('calculationHistory');
}