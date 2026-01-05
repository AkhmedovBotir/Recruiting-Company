import { useRef, useEffect } from 'react';

const PhoneInput = ({ value, onChange, error }) => {
  const inputRef = useRef(null);

  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    // Remove 998 prefix if exists
    let digits = cleaned;
    if (cleaned.startsWith('998')) {
      digits = cleaned.substring(3);
    }
    
    // Limit to 9 digits
    digits = digits.slice(0, 9);
    
    // Format as 90 123 45 67
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.substring(0, 2)} ${digits.substring(2)}`;
    if (digits.length <= 7) return `${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    return `${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 7)} ${digits.substring(7, 9)}`;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Remove all non-digit characters
    const cleaned = inputValue.replace(/\D/g, '');
    
    // Remove 998 prefix if user typed it
    let digits = cleaned;
    if (cleaned.startsWith('998')) {
      digits = cleaned.substring(3);
    }
    
    // Limit to 9 digits (after +998)
    const limited = digits.slice(0, 9);
    
    // Format as full phone number for storage
    const formatted = '+998' + limited;
    onChange(formatted);

    // Set cursor position after the formatted text
    setTimeout(() => {
      if (inputRef.current) {
        const cursorPosition = formatPhoneDisplay(formatted).length;
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const displayValue = formatPhoneDisplay(value);

  return (
    <div>
      <div className="flex">
        <div className="flex items-center px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg border-gray-300">
          <span className="text-gray-700 font-medium">+998</span>
        </div>
        <input
          ref={inputRef}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          placeholder="90 123 45 67"
          maxLength={13} // "90 123 45 67" = 13 characters
          className={`flex-1 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default PhoneInput;

