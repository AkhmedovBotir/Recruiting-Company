/**
 * Create Company Modal Component
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateCompanyModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    ownerFullName: '',
    ownerPhone: '',
    companyPhone: '',
    status: 'active',
  });

  // Phone number formatting handlers
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as XX XXX XX XX (9 digits after +998)
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const handlePhoneChange = (name, value) => {
    const formatted = formatPhoneNumber(value);
    setFormData((prev) => ({
      ...prev,
      [name]: formatted,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Validate form fields
   * @returns {boolean} true if valid
   */
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Kompaniya nomi majburiy';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Kompaniya nomi kamida 2 belgi bo\'lishi kerak';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Kompaniya nomi maksimal 200 belgi bo\'lishi kerak';
    }

    // INN validation
    if (!formData.inn.trim()) {
      newErrors.inn = 'INN majburiy';
    } else if (!/^\d{9}$|^\d{12}$/.test(formData.inn.trim())) {
      newErrors.inn = 'INN 9 yoki 12 raqamdan iborat bo\'lishi kerak';
    }

    // Owner Full Name validation
    if (!formData.ownerFullName.trim()) {
      newErrors.ownerFullName = 'Ega ism-familiyasi majburiy';
    } else if (formData.ownerFullName.trim().length < 3) {
      newErrors.ownerFullName = 'Ism-familiya kamida 3 belgi bo\'lishi kerak';
    } else if (formData.ownerFullName.trim().length > 100) {
      newErrors.ownerFullName = 'Ism-familiya maksimal 100 belgi bo\'lishi kerak';
    }

    // Owner Phone validation
    const ownerPhoneDigits = formData.ownerPhone.replace(/\D/g, '');
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = 'Ega telefon raqami majburiy';
    } else if (ownerPhoneDigits.length !== 9) {
      newErrors.ownerPhone = 'Telefon raqami 9 raqamdan iborat bo\'lishi kerak';
    }

    // Company Phone validation
    const companyPhoneDigits = formData.companyPhone.replace(/\D/g, '');
    if (!formData.companyPhone.trim()) {
      newErrors.companyPhone = 'Kompaniya telefon raqami majburiy';
    } else if (companyPhoneDigits.length !== 9) {
      newErrors.companyPhone = 'Telefon raqami 9 raqamdan iborat bo\'lishi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Format phone numbers with +998 prefix before sending
      const submitData = {
        ...formData,
        ownerPhone: `+998${formData.ownerPhone.replace(/\D/g, '')}`,
        companyPhone: `+998${formData.companyPhone.replace(/\D/g, '')}`,
      };
      await onCreate(submitData);
      handleClose();
    } catch (error) {
      // Error handling will be done in parent component
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setFormData({
      name: '',
      inn: '',
      ownerFullName: '',
      ownerPhone: '',
      companyPhone: '',
      status: 'active',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 transition-opacity z-40"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 relative z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Yangi Kompaniya Qo'shish</h3>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-6 py-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Company Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Kompaniya Nomi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tech Solutions LLC"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* INN */}
                  <div>
                    <label htmlFor="inn" className="block text-sm font-medium text-gray-700 mb-2">
                      INN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="inn"
                      name="inn"
                      value={formData.inn}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.inn ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="123456789"
                    />
                    {errors.inn && <p className="mt-1 text-sm text-red-600">{errors.inn}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Faol</option>
                      <option value="inactive">Nofaol</option>
                    </select>
                  </div>

                  {/* Owner Full Name */}
                  <div>
                    <label htmlFor="ownerFullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Ega Ism-Familiyasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="ownerFullName"
                      name="ownerFullName"
                      value={formData.ownerFullName}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.ownerFullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.ownerFullName && <p className="mt-1 text-sm text-red-600">{errors.ownerFullName}</p>}
                  </div>

                  {/* Owner Phone */}
                  <div>
                    <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Ega Telefon Raqami <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex rounded-lg border ${
                      errors.ownerPhone ? 'border-red-300' : 'border-gray-300'
                    } focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500`}>
                      <span className="inline-flex items-center px-3 border-r border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +998
                      </span>
                      <input
                        type="tel"
                        id="ownerPhone"
                        name="ownerPhone"
                        value={formData.ownerPhone}
                        onChange={(e) => handlePhoneChange('ownerPhone', e.target.value)}
                        maxLength={13}
                        className="flex-1 px-3 py-2 border-0 focus:outline-none focus:ring-0 rounded-r-lg"
                        placeholder="90 123 45 67"
                      />
                    </div>
                    {errors.ownerPhone && <p className="mt-1 text-sm text-red-600">{errors.ownerPhone}</p>}
                  </div>

                  {/* Company Phone */}
                  <div>
                    <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Kompaniya Telefon Raqami <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex rounded-lg border ${
                      errors.companyPhone ? 'border-red-300' : 'border-gray-300'
                    } focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500`}>
                      <span className="inline-flex items-center px-3 border-r border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +998
                      </span>
                      <input
                        type="tel"
                        id="companyPhone"
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={(e) => handlePhoneChange('companyPhone', e.target.value)}
                        maxLength={13}
                        className="flex-1 px-3 py-2 border-0 focus:outline-none focus:ring-0 rounded-r-lg"
                        placeholder="90 123 45 68"
                      />
                    </div>
                    {errors.companyPhone && <p className="mt-1 text-sm text-red-600">{errors.companyPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Saqlnayapti...' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CreateCompanyModal;

