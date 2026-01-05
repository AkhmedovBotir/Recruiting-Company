import { useState, useRef, useEffect } from 'react';

const CodeInput = ({ value, onChange, error }) => {
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Sync value with digits
    if (value) {
      const valueDigits = value.split('').slice(0, 5);
      const newDigits = Array(5).fill('');
      for (let i = 0; i < valueDigits.length; i++) {
        newDigits[i] = valueDigits[i];
      }
      setDigits(newDigits);
    } else {
      setDigits(['', '', '', '', '']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (index, inputValue) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(0, 1);
    
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    
    // Update parent value
    onChange(newDigits.join(''));
    
    // Auto-focus next input
    if (digit && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    const newDigits = [...digits];
    for (let i = 0; i < 5; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);
    onChange(newDigits.join(''));
    
    // Focus on next empty input or last input
    const nextIndex = Math.min(pastedData.length, 4);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2 md:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            maxLength={1}
            className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl md:text-3xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              error
                ? 'border-red-500 bg-red-50'
                : digit
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white'
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default CodeInput;

