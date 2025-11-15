import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Utility: Round to a fixed precision to avoid floating point artifacts.
 * @param {number} value - numeric value to round
 * @param {number} decimals - decimal places to keep
 * @returns {number} rounded number
 */
function roundToPrecision(value, decimals = 10) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Utility: Format number string by trimming trailing zeroes and decimal dot if unnecessary.
 * @param {number|string} value - numeric value or string
 * @returns {string} formatted display string
 */
function formatResult(value) {
  if (value === 'Error') return 'Error';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (!isFinite(num)) return 'Error';
  // Ensure fixed precision, then trim trailing zeros
  let s = roundToPrecision(num, 10).toFixed(10);
  s = s.replace(/\.?0+$/, '');
  return s.length ? s : '0';
}

/**
 * Utility: Perform an arithmetic operation.
 * Returns 'Error' on divide by zero.
 * @param {string} aStr - left operand as string
 * @param {string} bStr - right operand as string
 * @param {'+'|'−'|'×'|'÷'} op - operator
 * @returns {string} result as formatted string or 'Error'
 */
function performOperation(aStr, bStr, op) {
  const a = parseFloat(aStr || '0');
  const b = parseFloat(bStr || '0');

  let res;
  switch (op) {
    case '+':
      res = a + b;
      break;
    case '−':
      res = a - b;
      break;
    case '×':
      res = a * b;
      break;
    case '÷':
      if (b === 0) return 'Error';
      res = a / b;
      break;
    default:
      return formatResult(bStr || aStr || '0');
  }
  return formatResult(res);
}

/**
 * Utility: Check if current state is in error.
 * @param {string} input
 * @returns {boolean}
 */
function isError(input) {
  return input === 'Error';
}

/**
 * Map keyboard key to operator symbol used in the UI/logic.
 * @param {string} key
 * @returns {'+'|'−'|'×'|'÷'|null}
 */
function mapKeyToOperator(key) {
  if (key === '+') return '+';
  if (key === '-') return '−';
  if (key === '*' || key === 'x' || key === 'X') return '×';
  if (key === '/') return '÷';
  return null;
}

// PUBLIC_INTERFACE
function App() {
  /** This component renders a minimalist calculator with full UI, logic, and keyboard support. */

  // Calculator state
  const [currentInput, setCurrentInput] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [overwrite, setOverwrite] = useState(true); // replace display on next digit

  const inError = isError(currentInput);
  const isInitialState = currentInput === '0' && !previousValue && !operation;
  const clearLabel = isInitialState ? 'AC' : 'C';
  const lastOperationText =
    previousValue && operation ? `${formatResult(previousValue)} ${operation}` : '';

  // Handlers
  const handleClear = () => {
    if (isInitialState) {
      // All clear
      setCurrentInput('0');
      setPreviousValue(null);
      setOperation(null);
      setOverwrite(true);
    } else {
      // Clear entry
      setCurrentInput('0');
      setOverwrite(true);
    }
  };

  const handleDelete = () => {
    if (inError) return;
    if (overwrite) {
      setCurrentInput('0');
      return;
    }
    if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
      setCurrentInput('0');
      setOverwrite(true);
      return;
    }
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleToggleSign = () => {
    if (inError) return;
    // Do not create "-0"
    if (parseFloat(currentInput) === 0) {
      setCurrentInput('0');
      return;
    }
    if (currentInput.startsWith('-')) {
      setCurrentInput(currentInput.slice(1));
    } else {
      setCurrentInput(`-${currentInput}`);
    }
  };

  const handlePercent = () => {
    if (inError) return;
    const curr = parseFloat(currentInput || '0');
    if (previousValue !== null && operation) {
      const base = parseFloat(previousValue || '0');
      const percentValue = (base * curr) / 100;
      setCurrentInput(formatResult(percentValue));
    } else {
      setCurrentInput(formatResult(curr / 100));
    }
    setOverwrite(true);
  };

  const handleDecimal = () => {
    if (inError) return;
    if (overwrite) {
      setCurrentInput('0.');
      setOverwrite(false);
      return;
    }
    if (!currentInput.includes('.')) {
      setCurrentInput((prev) => `${prev}.`);
    }
  };

  const handleDigit = (digit) => {
    if (inError) return;
    if (overwrite) {
      setCurrentInput(digit);
      setOverwrite(false);
      return;
    }
    // Prevent multiple leading zeros
    if (currentInput === '0') {
      setCurrentInput(digit);
      return;
    }
    setCurrentInput((prev) => prev + digit);
  };

  const handleOperator = (op) => {
    if (inError) return;
    if (previousValue === null) {
      setPreviousValue(currentInput);
      setOperation(op);
      setOverwrite(true);
      return;
    }
    if (overwrite) {
      // Updating the operator without changing current input
      setOperation(op);
      return;
    }
    // Compute chaining
    const result = performOperation(previousValue, currentInput, operation);
    if (result === 'Error') {
      setCurrentInput('Error');
      setPreviousValue(null);
      setOperation(null);
      setOverwrite(true);
      return;
    }
    setPreviousValue(result);
    setCurrentInput(result);
    setOperation(op);
    setOverwrite(true);
  };

  const handleEquals = () => {
    if (inError) return;
    if (previousValue === null || !operation) return;
    if (overwrite && !inError) {
      // Ignore equals if no new number entered
      return;
    }
    const result = performOperation(previousValue, currentInput, operation);
    if (result === 'Error') {
      setCurrentInput('Error');
      setPreviousValue(null);
      setOperation(null);
      setOverwrite(true);
      return;
    }
    setCurrentInput(result);
    setPreviousValue(null);
    setOperation(null);
    setOverwrite(true);
  };

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      const { key } = e;

      // Allow clear with Escape
      if (key === 'Escape') {
        e.preventDefault();
        handleClear();
        return;
      }
      // Equals
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
        return;
      }
      // Delete/backspace
      if (key === 'Backspace') {
        e.preventDefault();
        handleDelete();
        return;
      }
      // Decimal
      if (key === '.') {
        e.preventDefault();
        handleDecimal();
        return;
      }
      // Percent
      if (key === '%') {
        e.preventDefault();
        handlePercent();
        return;
      }
      // Operators
      const mapped = mapKeyToOperator(key);
      if (mapped) {
        e.preventDefault();
        handleOperator(mapped);
        return;
      }
      // Digits
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInput, previousValue, operation, overwrite, inError]);

  const handleButtonAction = (type, payload) => {
    switch (type) {
      case 'digit':
        handleDigit(payload);
        break;
      case 'decimal':
        handleDecimal();
        break;
      case 'operator':
        handleOperator(payload);
        break;
      case 'equals':
        handleEquals();
        break;
      case 'clear':
        handleClear();
        break;
      case 'delete':
        handleDelete();
        break;
      case 'toggleSign':
        handleToggleSign();
        break;
      case 'percent':
        handlePercent();
        break;
      default:
        break;
    }
  };

  const displayValue = currentInput;

  return (
    <div className="app-container">
      <main className="calculator" aria-label="Calculator" role="region">
        <div className="display" aria-live="polite" aria-atomic="true" data-testid="display">
          <div className="last-operation" aria-label="Last operation">
            {lastOperationText}
          </div>
          <div
            className={`current-value ${inError ? 'error' : ''}`}
            aria-label="Current value"
            title={displayValue}
          >
            {displayValue}
          </div>
        </div>

        <div className="button-grid" role="group" aria-label="Calculator keys">
          <button
            type="button"
            className="btn control"
            aria-label="Clear"
            onClick={() => handleButtonAction('clear')}
          >
            {clearLabel}
          </button>
          <button
            type="button"
            className="btn control"
            aria-label="Delete"
            onClick={() => handleButtonAction('delete')}
          >
            ⌫
          </button>
          <button
            type="button"
            className="btn control"
            aria-label="Percent"
            onClick={() => handleButtonAction('percent')}
          >
            %
          </button>
          <button
            type="button"
            className="btn operator"
            aria-label="Divide"
            onClick={() => handleButtonAction('operator', '÷')}
          >
            ÷
          </button>

          <button type="button" className="btn" aria-label="Digit 7" onClick={() => handleButtonAction('digit', '7')}>
            7
          </button>
          <button type="button" className="btn" aria-label="Digit 8" onClick={() => handleButtonAction('digit', '8')}>
            8
          </button>
          <button type="button" className="btn" aria-label="Digit 9" onClick={() => handleButtonAction('digit', '9')}>
            9
          </button>
          <button
            type="button"
            className="btn operator"
            aria-label="Multiply"
            onClick={() => handleButtonAction('operator', '×')}
          >
            ×
          </button>

          <button type="button" className="btn" aria-label="Digit 4" onClick={() => handleButtonAction('digit', '4')}>
            4
          </button>
          <button type="button" className="btn" aria-label="Digit 5" onClick={() => handleButtonAction('digit', '5')}>
            5
          </button>
          <button type="button" className="btn" aria-label="Digit 6" onClick={() => handleButtonAction('digit', '6')}>
            6
          </button>
          <button
            type="button"
            className="btn operator"
            aria-label="Subtract"
            onClick={() => handleButtonAction('operator', '−')}
          >
            −
          </button>

          <button type="button" className="btn" aria-label="Digit 1" onClick={() => handleButtonAction('digit', '1')}>
            1
          </button>
          <button type="button" className="btn" aria-label="Digit 2" onClick={() => handleButtonAction('digit', '2')}>
            2
          </button>
          <button type="button" className="btn" aria-label="Digit 3" onClick={() => handleButtonAction('digit', '3')}>
            3
          </button>
          <button
            type="button"
            className="btn operator"
            aria-label="Add"
            onClick={() => handleButtonAction('operator', '+')}
          >
            +
          </button>

          <button
            type="button"
            className="btn control"
            aria-label="Toggle sign"
            onClick={() => handleButtonAction('toggleSign')}
          >
            +/-
          </button>
          <button type="button" className="btn" aria-label="Digit 0" onClick={() => handleButtonAction('digit', '0')}>
            0
          </button>
          <button type="button" className="btn" aria-label="Decimal" onClick={() => handleButtonAction('decimal')}>
            .
          </button>
          <button
            type="button"
            className="btn equals"
            aria-label="Equals"
            onClick={() => handleButtonAction('equals')}
          >
            =
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
