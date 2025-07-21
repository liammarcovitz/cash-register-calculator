# Cash Register Calculator V2

[Website](https://liammarcovitz.github.io/cash-register-calculator)

## Description

A sleek, user-friendly cash register calculator web application built with vanilla JavaScript, HTML, and CSS. This application helps users manage and calculate cash denomination totals for two separate registers, with a built-in safety feature that provides recommendations when register totals exceed the customizable limit (default: $200).

## What's New in V2

- **Status Indicators**: Visual indicators showing whether registers are under or over the limit
- **Keyboard Navigation**: Press Enter to move between denomination fields
- **Adjustable Register Limit**: Customize the $200 limit to any amount that suits your business needs
- **Persistent Storage**: All denomination values and settings are automatically saved in cookies
- **Enhanced Coin Handling**: Improved algorithm for calculating adjustments with coin-only registers
- **Multiple Adjustment Options**: Choose from different strategies for cash removal:
  - Default: Bills first, then coins (up to $1)
  - Bills Only: Adjust using only bills, no coins
  - Fewest Denominations: Use the minimum number of bills/coins possible
- **Improved UI**: Cleaner interface with better visual feedback
- **Modal Adjustment Interface**: Detailed recommendations in a modal with various options

## Features

- **Dual Register Management**: Track cash for two separate registers simultaneously
- **Denomination Tracking**: Input quantities for standard US currency denominations ($100, $50, $20, $10, $5, $1, $0.25, $0.10, $0.05, $0.01)
- **Automatic Calculations**: Instantly calculate total values based on denomination quantities
- **Customizable Limit**: Set your own limit for excess cash management (default: $200)
- **Smart Adjustment Recommendations**: Intelligent suggestions for which bills/coins to remove when totals exceed the limit
- **Input Validation**: Only accepts numerical inputs to prevent errors
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark & Light Mode**: Toggle between dark and light themes for user comfort
- **Print Button**: Print register summaries directly from the browser
- **Reset Button**: Clear all inputs with a single click (with confirmation)
- **Copy to Clipboard**: Easily copy totals for sharing or record-keeping
- **Persistent Settings**: All values and preferences are saved between sessions

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks or libraries)

## Technical Highlights

- **Local Storage**: Browser cookies for saving all user inputs and preferences
- **Event Delegation**: Efficient event handling for keyboard navigation
- **Dynamic DOM Manipulation**: Real-time updates without page reloads
- **Object-Oriented Approach**: Structured data management for register contents
- **Responsive Calculations**: Instant recalculation with algorithm improvements
- **Modal System**: Custom-built modal interface for adjustments
- **Flexible Money Handling**: Smart algorithms for coins vs bills calculations

## Visual Design

- Modern black and red color scheme
- Clean, intuitive user interface
- Distinctive calculator favicon
- Status messages with color coding (green for under limit, red for over limit)
- Animated modals with detailed information
- Smooth theme transitions

## Development Process

- **V1**: Basic calculator functionality with fixed $200 limit
- **V2**: Complete overhaul with persistent storage, customizable limits, and improved algorithms
  - Enhanced the user experience with keyboard navigation
  - Implemented cookies for persistent storage
  - Added modal system for detailed adjustments
  - Improved the coin handling algorithm for edge cases
  - Added status indicators for quick visual reference
  - Created a more robust theme system

## Installation & Setup

1. Visit the [live website](https://liammarcovitz.github.io/cash-register-calculator) or:
   - Clone this repository
   - Open `index.html` in any modern web browser
2. No installation or setup required - works entirely in the browser
3. All data is stored locally in cookies - no server or database required

## Getting Started

1. Enter denomination quantities in either register
2. Press Enter to navigate between fields or click "Calculate" to see totals
3. If over the limit, click "Calculate" again to see detailed adjustment suggestions
4. Use the adjustment options to find the best way to reduce your register total

## Usage Tips

- **Changing the Limit**: Click the pencil icon (✏️) next to the limit amount in the adjustment modal
- **Keyboard Navigation**: Use Enter key to move through denomination fields from top to bottom
- **Adjustment Options**: Try different adjustment strategies using the dropdown in the modal:
  - **Default**: Smart balance of bills and coins (up to $1 in coins unless coin-only register)
  - **Bills Only**: Only removes bills, leaving coins untouched
  - **Fewest Denominations**: Removes the minimum number of bills/coins possible
- **Dark/Light Mode**: Toggle between modes using the sun/moon button in the top right
- **Print Reports**: Click the printer icon to generate a printable summary of both registers
- **Reset**: The reset button will clear all values for a register (requires confirmation)
- **Your Progress**: All your entered values are automatically saved between sessions

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari
- Mobile browsers

## License

MIT License - Feel free to use, modify, and distribute this code for personal or commercial use.

## Created By

Liam Marcovitz - 2025
