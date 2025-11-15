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
