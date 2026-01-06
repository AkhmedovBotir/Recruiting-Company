/**
 * Create Material Modal Component
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateMaterialModal = ({ isOpen, onClose, onCreate, selectedVacancyId, selectedCompanyId }) => {
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    description: '',
    vacancy: selectedVacancyId || '',
    company: selectedCompanyId || '',
    tests: [],
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        videoUrl: '',
        description: '',
        vacancy: selectedVacancyId || '',
        company: selectedCompanyId || '',
        tests: [],
        isActive: true,
      });
      setErrors({});
    }
  }, [isOpen, selectedVacancyId, selectedCompanyId]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Mavzu nomi majburiy';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Mavzu nomi kamida 3 belgi bo\'lishi kerak';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Mavzu nomi maksimal 200 belgi bo\'lishi kerak';
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'Video URL majburiy';
    } else if (!/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(formData.videoUrl.trim())) {
      newErrors.videoUrl = 'To\'g\'ri YouTube URL kiriting';
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = 'Tavsif maksimal 5000 belgi bo\'lishi kerak';
    }

    if (!formData.vacancy) {
      newErrors.vacancy = 'Vakansiya majburiy';
    }

    if (!formData.company) {
      newErrors.company = 'Kompaniya majburiy';
    }

    if (!formData.tests || formData.tests.length < 3) {
      newErrors.tests = 'Kamida 3 ta test majburiy';
    } else {
      formData.tests.forEach((test, index) => {
        if (!test.question || test.question.trim().length < 5) {
          newErrors[`test_${index}_question`] = `Test ${index + 1}: Savol kamida 5 belgi bo'lishi kerak`;
        }
        if (!test.options || test.options.length < 2 || test.options.length > 10) {
          newErrors[`test_${index}_options`] = `Test ${index + 1}: 2-10 ta variant bo'lishi kerak`;
        }
        if (!test.correctAnswer) {
          newErrors[`test_${index}_correctAnswer`] = `Test ${index + 1}: To'g'ri javob tanlang`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Add new test
   */
  const addTest = () => {
    setFormData((prev) => ({
      ...prev,
      tests: [
        ...prev.tests,
        {
          question: '',
          options: ['', ''],
          correctAnswer: '',
        },
      ],
    }));
  };

  /**
   * Remove test
   */
  const removeTest = (index) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  /**
   * Update test
   */
  const updateTest = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) => (i === index ? { ...test, [field]: value } : test)),
    }));
  };

  /**
   * Add option to test
   */
  const addOption = (testIndex) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) =>
        i === testIndex ? { ...test, options: [...test.options, ''] } : test
      ),
    }));
  };

  /**
   * Remove option from test
   */
  const removeOption = (testIndex, optionIndex) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) =>
        i === testIndex
          ? {
              ...test,
              options: test.options.filter((_, oi) => oi !== optionIndex),
              correctAnswer: test.correctAnswer && String.fromCharCode(65 + optionIndex) === test.correctAnswer ? '' : test.correctAnswer,
            }
          : test
      ),
    }));
  };

  /**
   * Update option
   */
  const updateOption = (testIndex, optionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) =>
        i === testIndex
          ? {
              ...test,
              options: test.options.map((opt, oi) => (oi === optionIndex ? value : opt)),
            }
          : test
      ),
    }));
  };

  /**
   * Get option letters
   */
  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  /**
   * Handle submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        title: formData.title.trim(),
        videoUrl: formData.videoUrl.trim(),
        description: formData.description.trim() || undefined,
      };
      await onCreate(submitData);
      handleClose();
    } catch (error) {
      // Error handling in parent
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    setFormData({
      title: '',
      videoUrl: '',
      description: '',
      vacancy: selectedVacancyId || '',
      company: selectedCompanyId || '',
      tests: [],
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 transition-opacity z-40"
          onClick={handleClose}
        />

        <div className="flex min-h-full items-center justify-center p-4 relative z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Yangi Material Qo'shish</h3>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="bg-white px-6 py-4 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Mavzu Nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, title: e.target.value }));
                      if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="JavaScript Asoslari"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Video URL */}
                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (YouTube) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, videoUrl: e.target.value }));
                      if (errors.videoUrl) setErrors((prev) => ({ ...prev, videoUrl: '' }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.videoUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {errors.videoUrl && <p className="mt-1 text-sm text-red-600">{errors.videoUrl}</p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Tavsif (ixtiyoriy)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, description: e.target.value }));
                      if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                    }}
                    rows={4}
                    maxLength={5000}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Qo'shimcha ma'lumot..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Vacancy and Company (read-only if selected) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vakansiya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedVacancyId ? 'Tanlangan' : 'Vakansiya tanlang'}
                      disabled
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    {errors.vacancy && <p className="mt-1 text-sm text-red-600">{errors.vacancy}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kompaniya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedCompanyId ? 'Tanlangan' : 'Kompaniya tanlang'}
                      disabled
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
                  </div>
                </div>

                {/* Tests */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Testlar <span className="text-red-500">*</span> (kamida 3 ta)
                    </label>
                    <button
                      type="button"
                      onClick={addTest}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Test qo'shish
                    </button>
                  </div>
                  {errors.tests && <p className="mb-2 text-sm text-red-600">{errors.tests}</p>}

                  <div className="space-y-4">
                    {formData.tests.map((test, testIndex) => (
                      <div key={testIndex} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Test {testIndex + 1}</h4>
                          {formData.tests.length > 3 && (
                            <button
                              type="button"
                              onClick={() => removeTest(testIndex)}
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Question */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Savol <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={test.question}
                            onChange={(e) => updateTest(testIndex, 'question', e.target.value)}
                            rows={2}
                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`test_${testIndex}_question`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Savol matnini kiriting..."
                          />
                          {errors[`test_${testIndex}_question`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`test_${testIndex}_question`]}</p>
                          )}
                        </div>

                        {/* Options */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Variantlar <span className="text-red-500">*</span> (2-10 ta)
                            </label>
                            {test.options.length < 10 && (
                              <button
                                type="button"
                                onClick={() => addOption(testIndex)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                              >
                                + Variant qo'shish
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {test.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <span className="font-semibold text-gray-600 w-6">{getOptionLetter(optionIndex)}.</span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(testIndex, optionIndex, e.target.value)}
                                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Variant matni..."
                                />
                                {test.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(testIndex, optionIndex)}
                                    className="text-red-600 hover:text-red-700 cursor-pointer"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {errors[`test_${testIndex}_options`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`test_${testIndex}_options`]}</p>
                          )}
                        </div>

                        {/* Correct Answer */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            To'g'ri javob <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={test.correctAnswer}
                            onChange={(e) => updateTest(testIndex, 'correctAnswer', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                              errors[`test_${testIndex}_correctAnswer`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Tanlang</option>
                            {test.options.map((_, optionIndex) => (
                              <option key={optionIndex} value={getOptionLetter(optionIndex)}>
                                {getOptionLetter(optionIndex)}
                              </option>
                            ))}
                          </select>
                          {errors[`test_${testIndex}_correctAnswer`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`test_${testIndex}_correctAnswer`]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3 flex-shrink-0">
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

export default CreateMaterialModal;
