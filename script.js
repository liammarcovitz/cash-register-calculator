// Denominations in dollars for reference
const denominations = [100, 50, 20, 10, 5, 1, 0.25, 0.10, 0.05, 0.01];

// Calculate register totals based on register number
function calculateRegister(registerNum) {
    const inputPrefix = `r${registerNum}-`;
    const totalElement = document.getElementById(`total-r${registerNum}`);
    const adjustmentElement = document.getElementById(`adjustment-r${registerNum}`);
    
    // Initialize totals
    let total = 0;
    const denominationCounts = {};
    
    // Calculate total by iterating through each denomination
    denominations.forEach(denomValue => {
        // Convert denomValue to input ID format
        let inputId = denomValue.toString().replace('.', '');
        if (denomValue < 1) {
            inputId = `0${inputId}`;
        }
        
        const input = document.getElementById(`${inputPrefix}${inputId}`);
        if (!input) return;
        
        const count = parseInt(input.value) || 0;
        const value = denomValue * count;
        
        // Store count for potential adjustment calculation
        denominationCounts[denomValue] = count;
        
        // Add to total
        total += value;
    });
    
    // Format and display total
    totalElement.textContent = formatCurrency(total);
    
    // Check if adjustment is needed (total > 200)
    if (total > 200) {
        const adjustmentInfo = calculateAdjustment(total - 200, denominationCounts);
        displayAdjustmentMessage(adjustmentElement, adjustmentInfo);
    } else {
        // Hide adjustment message if no adjustment needed
        adjustmentElement.style.display = 'none';
    }
}

// Calculate how to remove money to get to $200 max
function calculateAdjustment(excessAmount, denominationCounts) {
    const adjustmentCounts = {};
    let remainingExcess = excessAmount;
    
    // Try to remove bills starting from highest denomination
    for (const denom of denominations) {
        const availableCount = denominationCounts[denom] || 0;
        
        if (availableCount > 0 && remainingExcess >= denom) {
            // Calculate how many bills/coins of this denomination to remove
            const countToRemove = Math.min(
                availableCount, 
                Math.floor(remainingExcess / denom)
            );
            
            if (countToRemove > 0) {
                adjustmentCounts[denom] = countToRemove;
                remainingExcess -= denom * countToRemove;
                remainingExcess = parseFloat(remainingExcess.toFixed(2)); // Fix floating point precision
            }
        }
    }
    
    return {
        adjustmentCounts,
        remainingExcess,
        totalExcess: excessAmount
    };
}

// Display adjustment message to user
function displayAdjustmentMessage(element, adjustmentInfo) {
    const { adjustmentCounts, remainingExcess, totalExcess } = adjustmentInfo;
    
    let message = `<strong>Total exceeds $200.00 by ${formatCurrency(totalExcess)}.</strong><br>`;
    message += "To reduce to $200.00, you can remove:<br>";
    
    let hasAdjustments = false;
    
    // Build message with the bills/coins to remove
    for (const denom of denominations) {
        const count = adjustmentCounts[denom] || 0;
        if (count > 0) {
            hasAdjustments = true;
            message += `• ${count} x ${formatCurrency(denom)}<br>`;
        }
    }
    
    // If perfect adjustment isn't possible
    if (remainingExcess > 0.001) { // Small threshold for floating point errors
        message += `<br>Note: After these adjustments, you'll still be over by ${formatCurrency(remainingExcess)}. `;
        message += `Consider adjusting smaller denominations manually.`;
    } else if (!hasAdjustments) {
        message = `<strong>Total exceeds $200.00 by ${formatCurrency(totalExcess)}.</strong><br>`;
        message += "Consider removing some bills to get under the $200.00 limit.";
    }
    
    // Display message
    element.innerHTML = message;
    element.style.display = 'block';
}

// Format number as currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Clear inputs when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set all inputs to empty or 0
    const inputs = document.querySelectorAll('.denomination-input');
    inputs.forEach(input => {
        input.value = '';
    });
    
    // Initialize result displays
    document.getElementById('total-r1').textContent = formatCurrency(0);
    document.getElementById('total-r2').textContent = formatCurrency(0);
});

// Add input validation to ensure only numbers
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('denomination-input')) {
        // Remove non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
});