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

let isDarkMode = true;

function calculateRegister(registerNum) {
    const inputPrefix = `r${registerNum}-`;
    const totalElement = document.getElementById(`total-r${registerNum}`);
    const adjustmentElement = document.getElementById(`adjustment-r${registerNum}`);
    
    let total = 0;
    const denominationCounts = {};
    
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
    
    if (total > 200) {
        const adjustmentInfo = calculateAdjustment(total - 200, denominationCounts);
        displayAdjustmentMessage(adjustmentElement, adjustmentInfo);
    } else {
        adjustmentElement.style.display = 'none';
    }
}

function calculateAdjustment(excessAmount, denominationCounts) {
    const adjustmentCounts = {};
    let remainingExcess = excessAmount;
    
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
    
    return {
        adjustmentCounts,
        remainingExcess,
        totalExcess: excessAmount
    };
}

function displayAdjustmentMessage(element, adjustmentInfo) {
    const { adjustmentCounts, remainingExcess, totalExcess } = adjustmentInfo;
    
    let message = `<strong>Total exceeds $200.00 by ${formatCurrency(totalExcess)}.</strong><br>`;
    message += "To reduce to $200.00, you can remove:<br>";
    
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
        message = `<strong>Total exceeds $200.00 by ${formatCurrency(totalExcess)}.</strong><br>`;
        message += "Consider removing some bills to get under the $200.00 limit.";
    }
    
    element.innerHTML = message;
    element.style.display = 'block';
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
    const inputPrefix = `r${registerNum}-`;
    
    denominations.forEach(denomValue => {
        const inputIdSuffix = denominationToId[denomValue];
        const inputId = `${inputPrefix}${inputIdSuffix}`;
        
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    });
    
    document.getElementById(`total-r${registerNum}`).textContent = formatCurrency(0);
    document.getElementById(`adjustment-r${registerNum}`).style.display = 'none';
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
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.denomination-input');
    inputs.forEach(input => {
        input.value = '';
    });
    
    document.getElementById('total-r1').textContent = formatCurrency(0);
    document.getElementById('total-r2').textContent = formatCurrency(0);
    
    // Add event listeners
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('print-btn').addEventListener('click', printRegisters);
});

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('denomination-input')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
});