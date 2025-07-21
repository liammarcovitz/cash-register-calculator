const denominations = [100, 50, 20, 10, 5, 1, 0.25, 0.10, 0.05, 0.01];

const denominationToId = {
    100: "100",
    50: "50",
    20: "20",
    10: "10",
    5: "5",
    1: "1",
    0.25: "025",
    0.10: "010",
    0.05: "005",
    0.01: "001"
};

// Default to dark mode, but will be overridden by cookie if available
let isDarkMode = true;

let currentRegisterNum = 1;
let currentDenominationCounts = {};
let currentExcessAmount = 0;
let registerLimit = 200; // Default value, will be overridden by cookie if available

function calculateRegister(registerNum) {
    const inputPrefix = `r${registerNum}-`;
    const totalElement = document.getElementById(`total-r${registerNum}`);
    const adjustmentElement = document.getElementById(`adjustment-r${registerNum}`);
    
    let total = 0;
    const denominationCounts = {};
    
    // Save the current state to cookies
    saveDenominationValues();
    
    denominations.forEach(denomValue => {
        const inputIdSuffix = denominationToId[denomValue];
        const inputId = `${inputPrefix}${inputIdSuffix}`;
        
        const input = document.getElementById(inputId);
        if (!input) {
            console.error(`Input not found: ${inputId}`);
            return;
        }
        
        const count = parseInt(input.value) || 0;
        const value = denomValue * count;
        
        denominationCounts[denomValue] = count;
        
        total += value;
    });
    
    totalElement.textContent = formatCurrency(total);
    
    if (total > registerLimit) {
        currentRegisterNum = registerNum;
        currentDenominationCounts = {...denominationCounts};
        currentExcessAmount = total - registerLimit;
        
        const adjustmentInfo = calculateAdjustment(currentExcessAmount, currentDenominationCounts);
        
        updateModalContent(adjustmentInfo);
        
        showAdjustmentModal();
        
        adjustmentElement.innerHTML = '<p class="status-message over-limit">Over $' + registerLimit + ', click Calculate to show suggestions of what to take out</p>';
        adjustmentElement.style.display = 'block';
    } else if (total === 0) {
        adjustmentElement.style.display = 'none';
    } else {
        adjustmentElement.innerHTML = '<p class="status-message under-limit">Under $' + registerLimit + '</p>';
        adjustmentElement.style.display = 'block';
    }
}

function calculateAdjustment(excessAmount, denominationCounts, option = 'maxCoin1') {
    const adjustmentCounts = {};
    let remainingExcess = excessAmount;
    let coinRemovalTotal = 0;
    const coinDenominations = [0.25, 0.10, 0.05, 0.01];
    
    switch (option) {
        case 'noCoin':
            for (const denom of denominations) {
                if (denom >= 1) {
                    const availableCount = denominationCounts[denom] || 0;
                    
                    if (availableCount > 0 && remainingExcess >= denom) {
                        const countToRemove = Math.min(
                            availableCount, 
                            Math.floor(remainingExcess / denom)
                        );
                        
                        if (countToRemove > 0) {
                            adjustmentCounts[denom] = countToRemove;
                            remainingExcess -= denom * countToRemove;
                            remainingExcess = parseFloat(remainingExcess.toFixed(2));
                        }
                    }
                }
            }
            break;
            
        case 'minCount':
            for (const denom of denominations) {
                const availableCount = denominationCounts[denom] || 0;
                
                if (availableCount > 0 && remainingExcess >= denom) {
                    const countToRemove = Math.min(
                        availableCount, 
                        Math.floor(remainingExcess / denom)
                    );
                    
                    if (countToRemove > 0) {
                        adjustmentCounts[denom] = countToRemove;
                        remainingExcess -= denom * countToRemove;
                        remainingExcess = parseFloat(remainingExcess.toFixed(2));
                    }
                }
            }
            break;
            
        case 'maxCoin1':
        default:
            let initialRemainingExcess = remainingExcess;
            let billsOnlyAdjustmentCounts = {};
            for (const denom of denominations) {
                if (denom >= 1) {
                    const availableCount = denominationCounts[denom] || 0;
                    
                    if (availableCount > 0 && remainingExcess >= denom) {
                        const countToRemove = Math.min(
                            availableCount, 
                            Math.floor(remainingExcess / denom)
                        );
                        
                        if (countToRemove > 0) {
                            adjustmentCounts[denom] = countToRemove;
                            billsOnlyAdjustmentCounts[denom] = countToRemove;
                            remainingExcess -= denom * countToRemove;
                            remainingExcess = parseFloat(remainingExcess.toFixed(2));
                        }
                    }
                }
            }
            
            if (remainingExcess > 0.001) {
                let coinsRemoved = 0;
                for (const denom of coinDenominations) {
                    if (coinRemovalTotal >= 1) {
                        break;
                    }
                    
                    const availableCount = denominationCounts[denom] || 0;
                    
                    if (availableCount > 0 && remainingExcess >= denom) {
                        const maxCoinsAllowed = Math.floor((1 - coinRemovalTotal) / denom);
                        const countToRemove = Math.min(
                            availableCount,
                            Math.floor(remainingExcess / denom),
                            maxCoinsAllowed
                        );
                        
                        if (countToRemove > 0) {
                            adjustmentCounts[denom] = countToRemove;
                            const amountRemoved = denom * countToRemove;
                            remainingExcess -= amountRemoved;
                            coinRemovalTotal += amountRemoved;
                            coinsRemoved += amountRemoved;
                            remainingExcess = parseFloat(remainingExcess.toFixed(2));
                        }
                    }
                }
                
                if (remainingExcess > 0.5) {
                    let onlyCoinsAvailable = true;
                    for (const denom of denominations) {
                        if (denom >= 1 && denominationCounts[denom] > 0) {
                            onlyCoinsAvailable = false;
                            break;
                        }
                    }
                    
                    const noLimitAdjustments = {};
                    let noLimitRemainingExcess = initialRemainingExcess;
                    
                    Object.assign(noLimitAdjustments, billsOnlyAdjustmentCounts);
                    for (const denom of coinDenominations) {
                        const availableCount = denominationCounts[denom] || 0;
                        
                        if (availableCount > 0 && noLimitRemainingExcess >= denom) {
                            const countToRemove = Math.min(
                                availableCount,
                                Math.floor(noLimitRemainingExcess / denom)
                            );
                            
                            if (countToRemove > 0) {
                                noLimitAdjustments[denom] = countToRemove;
                                noLimitRemainingExcess -= denom * countToRemove;
                                noLimitRemainingExcess = parseFloat(noLimitRemainingExcess.toFixed(2));
                            }
                        }
                    }
                    
                    if (noLimitRemainingExcess < remainingExcess * 0.5 || onlyCoinsAvailable) {
                        Object.keys(adjustmentCounts).forEach(key => delete adjustmentCounts[key]);
                        Object.assign(adjustmentCounts, noLimitAdjustments);
                        remainingExcess = noLimitRemainingExcess;
                    }
                }
            }
            break;
    }
    
    return {
        adjustmentCounts,
        remainingExcess,
        totalExcess: excessAmount,
        option
    };
}

function displayAdjustmentMessage(element, adjustmentInfo) {
    const { adjustmentCounts, remainingExcess, totalExcess } = adjustmentInfo;
    
    const formattedLimit = formatCurrency(registerLimit);
    
    let message = `<strong>Total exceeds ${formattedLimit} by ${formatCurrency(totalExcess)}.</strong><br>`;
    message += `To reduce to ${formattedLimit}, you can remove:<br>`;
    
    let hasAdjustments = false;
    
    for (const denom of denominations) {
        const count = adjustmentCounts[denom] || 0;
        if (count > 0) {
            hasAdjustments = true;
            message += `• ${count} x ${formatCurrency(denom)}<br>`;
        }
    }
    
    if (remainingExcess > 0.001) {
        message += `<br>Note: After these adjustments, you'll still be over by ${formatCurrency(remainingExcess)}. `;
        message += `Consider adjusting smaller denominations manually.`;
    } else if (!hasAdjustments) {
        message = `<strong>Total exceeds ${formattedLimit} by ${formatCurrency(totalExcess)}.</strong><br>`;
        message += `Consider removing some bills to get under the ${formattedLimit} limit.`;
    }
    
    element.innerHTML = message;
    element.style.display = 'block';
}

function showAdjustmentModal() {
    const modal = document.getElementById('adjustment-modal');
    modal.style.display = 'block';
    
    const total = parseFloat(currentExcessAmount) + registerLimit;
    document.getElementById('modal-title').textContent = `Register ${currentRegisterNum}: ${formatCurrency(total)}`;
    const option = document.getElementById('adjustment-option').value;
    const adjustmentInfo = calculateAdjustment(currentExcessAmount, currentDenominationCounts, option);
    updateModalContent(adjustmentInfo);
}

function hideAdjustmentModal() {
    const modal = document.getElementById('adjustment-modal');
    modal.style.display = 'none';
}

function updateModalContent(adjustmentInfo) {
    const { adjustmentCounts, remainingExcess, totalExcess, option } = adjustmentInfo;
    const modalMessage = document.getElementById('modal-adjustment-message');
    
    const formattedLimit = formatCurrency(registerLimit);
    
    let message = `<strong>Total exceeds <span id="limit-amount">${formattedLimit}</span> <button id="edit-limit-btn" class="edit-btn" title="Edit limit">✏️</button> by ${formatCurrency(totalExcess)}.</strong><br>`;
    message += `<div id="limit-input-container">
                    <input type="number" id="limit-input" min="1" step="1" value="${registerLimit}">
                    <button id="save-limit-btn" class="limit-btn save-btn">Save</button>
                    <button id="cancel-limit-btn" class="limit-btn cancel-btn">Cancel</button>
                </div>`;
    message += `To reduce to <span id="limit-amount-2">${formattedLimit}</span>, you can remove:<br><br>`;
    
    let hasAdjustments = false;
    
    for (const denom of denominations) {
        const count = adjustmentCounts[denom] || 0;
        if (count > 0) {
            hasAdjustments = true;
            message += `• ${count} x ${formatCurrency(denom)}<br>`;
        }
    }
    
    if (remainingExcess > 0.001) {
        message += `<br>Note: After these adjustments, you'll still be over by ${formatCurrency(remainingExcess)}. `;
        message += `There is no way to reach exactly back to ${formattedLimit}.<br><br>`;
        message += `<button id="adjust-limit-btn" class="limit-adjust-btn">Adjust Limit</button>`;
    } else if (!hasAdjustments) {
        message = `<strong>Total exceeds ${formattedLimit} by ${formatCurrency(totalExcess)}.</strong><br>`;
        message += `There is no way to reach exactly back to ${formattedLimit}.<br><br>`;
        message += `<button id="adjust-limit-btn" class="limit-adjust-btn">Adjust Limit</button>`;
    }
    
    modalMessage.innerHTML = message;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function resetRegister(registerNum) {
    window.registerToReset = registerNum;
    
    showResetConfirmationModal();
}

function performReset(registerNum) {
    const inputPrefix = `r${registerNum}-`;
    
    denominations.forEach(denomValue => {
        const inputIdSuffix = denominationToId[denomValue];
        const inputId = `${inputPrefix}${inputIdSuffix}`;
        
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
            // Clear the cookie for this input
            setCookie(inputId, '', -1); // Setting expiry to past will delete the cookie
        }
    });
    
    document.getElementById(`total-r${registerNum}`).textContent = formatCurrency(0);
    
    const adjustmentElement = document.getElementById(`adjustment-r${registerNum}`);
    adjustmentElement.style.display = 'none';
}

function showResetConfirmationModal() {
    const modal = document.getElementById('reset-confirmation-modal');
    modal.style.display = 'block';
}

function hideResetConfirmationModal() {
    const modal = document.getElementById('reset-confirmation-modal');
    modal.style.display = 'none';
}

function copyToClipboard(registerNum) {
    const total = document.getElementById(`total-r${registerNum}`).textContent;
    
    navigator.clipboard.writeText(total)
        .then(() => {
            const copyBtn = document.querySelector(`#register${registerNum} .button-row .action-btn:last-child`);
            copyBtn.innerHTML = '✓';
            
            setTimeout(() => {
                copyBtn.innerHTML = '📋';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard. Please try again.');
        });
}

function printRegisters() {
    const printWindow = window.open('', '_blank');
    
    const total1 = document.getElementById('total-r1').textContent;
    const total2 = document.getElementById('total-r2').textContent;
    
    let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cash Register Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
            }
            h1 {
                text-align: center;
                margin-bottom: 20px;
            }
            .print-container {
                display: flex;
                justify-content: space-between;
            }
            .register-column {
                width: 48%;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .total-row {
                font-weight: bold;
            }
            .date {
                text-align: right;
                margin-bottom: 20px;
            }
            @media print {
                body {
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <h1>Cash Register Report</h1>
        <div class="date">Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <div class="print-container">
    `;
    
    for (let regNum = 1; regNum <= 2; regNum++) {
        printContent += `
        <div class="register-column">
            <h2>Register ${regNum}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Denomination</th>
                        <th>Count</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let regTotal = 0;
        denominations.forEach(denomValue => {
            const inputId = `r${regNum}-${denominationToId[denomValue]}`;
            const input = document.getElementById(inputId);
            
            if (input) {
                const count = parseInt(input.value) || 0;
                const value = denomValue * count;
                regTotal += value;
                
                if (count > 0) {
                    printContent += `
                    <tr>
                        <td>${formatCurrency(denomValue)}</td>
                        <td>${count}</td>
                        <td>${formatCurrency(value)}</td>
                    </tr>
                    `;
                }
            }
        });
        
        printContent += `
                <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td>${document.getElementById(`total-r${regNum}`).textContent}</td>
                </tr>
            </tbody>
            </table>
        </div>
        `;
    }
    
    printContent += `
        </div>
    </body>
    </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        printWindow.print();
    };
}

function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        body.classList.remove('light-mode');
        themeBtn.innerHTML = '☀️';
        themeBtn.title = 'Switch to Light Mode';
    } else {
        body.classList.add('light-mode');
        themeBtn.innerHTML = '🌙';
        themeBtn.title = 'Switch to Dark Mode';
    }
    
    // Save the theme preference
    setCookie('darkMode', isDarkMode ? 'true' : 'false', 30);
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function saveDenominationValues() {
    for (let regNum = 1; regNum <= 2; regNum++) {
        for (const denom of denominations) {
            const inputId = `r${regNum}-${denominationToId[denom]}`;
            const input = document.getElementById(inputId);
            if (input) {
                const value = input.value;
                setCookie(inputId, value, 30); // Save for 30 days
            }
        }
    }
}

function loadDenominationValues() {
    for (let regNum = 1; regNum <= 2; regNum++) {
        for (const denom of denominations) {
            const inputId = `r${regNum}-${denominationToId[denom]}`;
            const input = document.getElementById(inputId);
            if (input) {
                const savedValue = getCookie(inputId);
                if (savedValue !== null) {
                    input.value = savedValue;
                }
            }
        }
        calculateRegister(regNum); // Calculate the total for each register after loading values
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.denomination-input');
    
    // Load theme preference
    const savedTheme = getCookie('darkMode');
    if (savedTheme !== null) {
        isDarkMode = savedTheme === 'true';
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');
        
        if (isDarkMode) {
            body.classList.remove('light-mode');
            themeBtn.innerHTML = '☀️';
            themeBtn.title = 'Switch to Light Mode';
        } else {
            body.classList.add('light-mode');
            themeBtn.innerHTML = '🌙';
            themeBtn.title = 'Switch to Dark Mode';
        }
    }
    
    // Load register limit
    const savedLimit = getCookie('registerLimit');
    if (savedLimit !== null) {
        const parsedLimit = parseFloat(savedLimit);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            registerLimit = parsedLimit;
        }
    }
    
    // Load saved values from cookies instead of setting to empty
    loadDenominationValues();
    
    // Only initialize to empty if no cookies exist
    if (!getCookie('r1-100')) {
        inputs.forEach(input => {
            input.value = '';
        });
        
        document.getElementById('total-r1').textContent = formatCurrency(0);
        document.getElementById('total-r2').textContent = formatCurrency(0);
    }
    
    for (let i = 1; i <= 2; i++) {
        const adjustmentElement = document.getElementById(`adjustment-r${i}`);
        adjustmentElement.style.display = 'none';
    }
    
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('print-btn').addEventListener('click', printRegisters);
    
    document.querySelector('.close-modal').addEventListener('click', hideAdjustmentModal);
    document.getElementById('confirm-reset-btn').addEventListener('click', function() {
        performReset(window.registerToReset);
        hideResetConfirmationModal();
    });
    document.getElementById('cancel-reset-btn').addEventListener('click', hideResetConfirmationModal);
    
    window.addEventListener('click', function(event) {
        const adjustmentModal = document.getElementById('adjustment-modal');
        const resetModal = document.getElementById('reset-confirmation-modal');
        
        if (event.target === adjustmentModal) {
            hideAdjustmentModal();
        }
        
        if (event.target === resetModal) {
            hideResetConfirmationModal();
        }
    });
    
    document.getElementById('adjustment-option').addEventListener('change', function() {
        const option = this.value;
        const adjustmentInfo = calculateAdjustment(currentExcessAmount, currentDenominationCounts, option);
        updateModalContent(adjustmentInfo);
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            const adjustmentModal = document.getElementById('adjustment-modal');
            const resetModal = document.getElementById('reset-confirmation-modal');
            
            if (adjustmentModal.style.display === 'block') {
                hideAdjustmentModal();
            }
            
            if (resetModal.style.display === 'block') {
                hideResetConfirmationModal();
            }
        }
        
        if (event.key === "Enter" && document.activeElement.id === "limit-input") {
            document.getElementById('save-limit-btn').click();
        }
    });
    
    document.addEventListener('click', function(event) {
        if (event.target && (event.target.id === 'edit-limit-btn' || event.target.id === 'adjust-limit-btn')) {
            document.getElementById('limit-input-container').style.display = 'block';
            document.getElementById('limit-input').focus();
        }
        
        if (event.target && event.target.id === 'save-limit-btn') {
            const newLimit = parseFloat(document.getElementById('limit-input').value);
            if (!isNaN(newLimit) && newLimit > 0) {
                const currentTotal = parseFloat(currentExcessAmount) + parseFloat(registerLimit);
                
                registerLimit = newLimit;
                // Save the new limit to a cookie
                setCookie('registerLimit', newLimit, 30);
                
                currentExcessAmount = Math.max(0, currentTotal - newLimit);
                
                document.getElementById('modal-title').textContent = `Register ${currentRegisterNum}: ${formatCurrency(currentTotal)}`;
                const option = document.getElementById('adjustment-option').value;
                const adjustmentInfo = calculateAdjustment(currentExcessAmount, currentDenominationCounts, option);
                updateModalContent(adjustmentInfo);
                
                document.getElementById('limit-input-container').style.display = 'none';
                if (currentTotal <= newLimit) {
                    hideAdjustmentModal();
                }
            }
        }
        
        if (event.target && event.target.id === 'cancel-limit-btn') {
            document.getElementById('limit-input-container').style.display = 'none';
        }
    });
});

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('denomination-input')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // Save to cookies whenever user types
        setCookie(e.target.id, e.target.value, 30);
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('denomination-input')) {
        e.preventDefault();
        
        const currentRegister = e.target.id.startsWith('r1-') ? 1 : 2;
        const inputPrefix = `r${currentRegister}-`;
        
        let currentDenomIndex = -1;
        for (let i = 0; i < denominations.length; i++) {
            const denomId = denominationToId[denominations[i]];
            if (e.target.id === `${inputPrefix}${denomId}`) {
                currentDenomIndex = i;
                break;
            }
        }
        
        if (currentDenomIndex !== -1) {
            if (currentDenomIndex < denominations.length - 1) {
                const nextDenomId = denominationToId[denominations[currentDenomIndex + 1]];
                const nextInput = document.getElementById(`${inputPrefix}${nextDenomId}`);
                nextInput.focus();
            } else {
                calculateRegister(currentRegister);
            }
        }
    }
});