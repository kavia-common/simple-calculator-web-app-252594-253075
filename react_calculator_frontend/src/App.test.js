import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

function click(btnText) {
  const btn = screen.getByRole('button', { name: btnText });
  fireEvent.click(btn);
}

test('initial display is 0', () => {
  render(<App />);
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^0$/);
});

test('7 + 5 = 12', () => {
  render(<App />);
  click('7');
  click('+');
  click('5');
  click('=');
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^12$/);
});

test('1.2 + 3.4 = 4.6', () => {
  render(<App />);
  click('1');
  click('.');
  click('2');
  click('+');
  click('3');
  click('.');
  click('4');
  click('=');
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^4\.6$/);
});

test('divide by zero yields Error', () => {
  render(<App />);
  click('8');
  click('÷');
  click('0');
  click('=');
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^Error$/);
});

test('Clear resets to 0 after Error', () => {
  render(<App />);
  click('9');
  click('÷');
  click('0');
  click('=');
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^Error$/);

  // Clear via the clear button (aria-label stable even if label toggles)
  const clearBtn = screen.getByRole('button', { name: /clear/i });
  fireEvent.click(clearBtn);
  fireEvent.click(clearBtn); // may require two presses if it first clears entry

  expect(display).toHaveTextContent(/^0$/);
});

/* New tests for square root and memory functionality */

test('sqrt(9) = 3', () => {
  render(<App />);
  click('9');
  // Square root button has text "√"
  click('√');
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^3$/);
});

test('sqrt(2) has reasonable precision', () => {
  render(<App />);
  click('2');
  click('√');
  const display = screen.getByTestId('display');
  // 10-decimal rounding then trimmed, expected: 1.4142135624
  expect(display).toHaveTextContent(/^1\.4142135624$/);
});

test('sqrt of negative shows Error', () => {
  render(<App />);
  click('9');
  click('+/-'); // toggle to -9
  click('√');
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^Error$/);
});

test('Memory store and recall (MS/MR roundtrip)', () => {
  render(<App />);
  // Enter 42.5 and store
  click('4');
  click('2');
  click('.');
  click('5');

  const msBtn = screen.getByRole('button', { name: /memory store/i });
  fireEvent.click(msBtn);

  // Change current input
  click('7');

  // Recall
  const mrBtn = screen.getByRole('button', { name: /memory recall/i });
  fireEvent.click(mrBtn);

  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^42\.5$/);
});

test('Memory add (M+) and subtract (M-) accumulate correctly', () => {
  render(<App />);
  // Initialize memory to 5 via MS
  click('5');
  const msBtn = screen.getByRole('button', { name: /memory store/i });
  fireEvent.click(msBtn);

  // Add 2 -> memory = 7
  click('2');
  const mPlusBtn = screen.getByRole('button', { name: /memory add/i });
  fireEvent.click(mPlusBtn);

  const mrBtn = screen.getByRole('button', { name: /memory recall/i });
  fireEvent.click(mrBtn);
  let display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^7$/);

  // Subtract 3 -> memory = 4
  click('3');
  const mMinusBtn = screen.getByRole('button', { name: /memory subtract/i });
  fireEvent.click(mMinusBtn);

  fireEvent.click(mrBtn);
  display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^4$/);
});

test('Memory clear (MC) clears memory to 0', () => {
  render(<App />);
  // Seed memory with 9
  click('9');
  const msBtn = screen.getByRole('button', { name: /memory store/i });
  fireEvent.click(msBtn);

  // Clear memory
  const mcBtn = screen.getByRole('button', { name: /memory clear/i });
  fireEvent.click(mcBtn);

  // Recall should show 0
  const mrBtn = screen.getByRole('button', { name: /memory recall/i });
  fireEvent.click(mrBtn);
  const display = screen.getByTestId('display');
  expect(display).toHaveTextContent(/^0$/);
});
