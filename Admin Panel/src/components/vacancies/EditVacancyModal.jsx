/**
 * Edit Vacancy Modal Component
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from '../common/RichTextEditor.jsx';
import * as companyService from '../../services/companyService.js';

const EditVacancyModal = ({ isOpen, onClose, onUpdate, vacancy }) => {
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    department: '',
    position: '',
    experience: '',
    workType: 'fulltime',
    minAge: '',
    maxAge: '',
    salary: '',
    description: '',
    responsibilities: '',
    preferences: '',
    skills: [],
    status: 'active',
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Load companies on mount
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  /**
   * Load companies
   */
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await companyService.getAllCompanies({ limit: 100, status: 'active' });
      if (response.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Populate form when vacancy data is available
  useEffect(() => {
    if (vacancy) {
      setFormData({
        company: vacancy.company?._id || vacancy.company || '',
        title: vacancy.title || '',
        department: vacancy.department || '',
        position: vacancy.position || '',
        experience: vacancy.experience || '',
        workType: vacancy.workType || 'fulltime',
        minAge: vacancy.minAge || '',
        maxAge: vacancy.maxAge || '',
        salary: vacancy.salary || '',
        description: vacancy.description || '',
        responsibilities: vacancy.responsibilities || '',
        preferences: vacancy.preferences || '',
        skills: vacancy.skills || [],
        status: vacancy.status || 'active',
      });
      setErrors({});
    }
  }, [vacancy]);


  /**
   * Validate form fields
   * @returns {boolean} true if valid
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.company) {
      newErrors.company = 'Kompaniya majburiy';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Vakansiya nomi majburiy';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Vakansiya nomi kamida 3 belgi bo\'lishi kerak';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Vakansiya nomi maksimal 200 belgi bo\'lishi kerak';
    }

    if (formData.department && formData.department.length > 100) {
      newErrors.department = 'Bo\'lim nomi maksimal 100 belgi bo\'lishi kerak';
    }

    if (formData.position && formData.position.length > 100) {
      newErrors.position = 'Lavozim nomi maksimal 100 belgi bo\'lishi kerak';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Tajriba majburiy';
    }

    if (!formData.minAge) {
      newErrors.minAge = 'Minimum yosh majburiy';
    } else if (formData.minAge < 18 || formData.minAge > 100) {
      newErrors.minAge = 'Minimum yosh 18-100 orasida bo\'lishi kerak';
    }

    if (!formData.maxAge) {
      newErrors.maxAge = 'Maximum yosh majburiy';
    } else if (formData.maxAge < 18 || formData.maxAge > 100) {
      newErrors.maxAge = 'Maximum yosh 18-100 orasida bo\'lishi kerak';
    } else if (Number(formData.maxAge) <= Number(formData.minAge)) {
      newErrors.maxAge = 'Maximum yosh minimum yoshdan katta bo\'lishi kerak';
    }

        if (!formData.salary || !formData.salary.trim()) {
          newErrors.salary = 'Oylik majburiy';
        }

    // Validate HTML content for rich text fields
    const isEmptyHtml = (htmlValue) => {
      if (!htmlValue || !htmlValue.trim()) return true;
      // Strip HTML tags and check if there's actual text content
      const tmp = document.createElement('DIV');
      tmp.innerHTML = htmlValue;
      const text = tmp.textContent || tmp.innerText || '';
      return !text.trim();
    };

    if (isEmptyHtml(formData.description)) {
      newErrors.description = 'Tavsif majburiy';
    }

    if (isEmptyHtml(formData.responsibilities)) {
      newErrors.responsibilities = 'Majburiyatlar majburiy';
    }

    if (isEmptyHtml(formData.preferences)) {
      newErrors.preferences = 'Afzalliklar majburiy';
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'Kamida 1 ta ko\'nikma qo\'shilishi kerak';
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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Handle skills input
   */
  const handleSkillsKeyPress = (e) => {
    if (e.key === 'Enter' && skillsInput.trim()) {
      e.preventDefault();
      const newSkill = skillsInput.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill],
        }));
        setSkillsInput('');
        if (errors.skills) {
          setErrors((prev) => ({
            ...prev,
            skills: '',
          }));
        }
      }
    }
  };

  /**
   * Remove skill
   */
  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
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
      const submitData = {
        ...formData,
        minAge: Number(formData.minAge),
        maxAge: Number(formData.maxAge),
        salary: formData.salary.trim(),
      };
      await onUpdate(vacancy._id, submitData);
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
    setErrors({});
    onClose();
  };

  if (!isOpen || !vacancy) return null;

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
            className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Vakansiya Ma'lumotlarini Tahrirlash</h3>
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
                {/* Company */}
                <div>
                  <label htmlFor="edit-company" className="block text-sm font-medium text-gray-700 mb-2">
                    Kompaniya <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={loadingCompanies}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.company ? 'border-red-300' : 'border-gray-300'
                    } ${loadingCompanies ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <option value="">Kompaniya tanlang</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Vakansiya Nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Senior Full Stack Developer"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Department and Position Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Department */}
                  <div>
                    <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-2">
                      Bo'lim
                    </label>
                    <input
                      type="text"
                      id="edit-department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.department ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="IT"
                    />
                    {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                  </div>

                  {/* Position */}
                  <div>
                    <label htmlFor="edit-position" className="block text-sm font-medium text-gray-700 mb-2">
                      Lavozim
                    </label>
                    <input
                      type="text"
                      id="edit-position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.position ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Senior Developer"
                    />
                    {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                  </div>
                </div>

                {/* Experience, Work Type, Age, Salary Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Experience */}
                  <div>
                    <label htmlFor="edit-experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Tajriba <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.experience ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="3+ years"
                    />
                    {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
                  </div>

                  {/* Work Type */}
                  <div>
                    <label htmlFor="edit-workType" className="block text-sm font-medium text-gray-700 mb-2">
                      Ish Turi <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-workType"
                      name="workType"
                      value={formData.workType}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="fulltime">To'liq ish kuni</option>
                      <option value="parttime">Qisman ish kuni</option>
                    </select>
                  </div>

                  {/* Min Age */}
                  <div>
                    <label htmlFor="edit-minAge" className="block text-sm font-medium text-gray-700 mb-2">
                      Min. Yosh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="edit-minAge"
                      name="minAge"
                      value={formData.minAge}
                      onChange={handleChange}
                      min="18"
                      max="100"
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.minAge ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="25"
                    />
                    {errors.minAge && <p className="mt-1 text-sm text-red-600">{errors.minAge}</p>}
                  </div>

                  {/* Max Age */}
                  <div>
                    <label htmlFor="edit-maxAge" className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Yosh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="edit-maxAge"
                      name="maxAge"
                      value={formData.maxAge}
                      onChange={handleChange}
                      min="18"
                      max="100"
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.maxAge ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="45"
                    />
                    {errors.maxAge && <p className="mt-1 text-sm text-red-600">{errors.maxAge}</p>}
                  </div>
                </div>

                {/* Salary and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Salary */}
                  <div>
                    <label htmlFor="edit-salary" className="block text-sm font-medium text-gray-700 mb-2">
                      Oylik <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.salary ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Masalan: 5 000 000 so'm yoki kelishiladi"
                    />
                    {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="active">Faol</option>
                      <option value="close">Yopilgan</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tavsif <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, description: value }));
                      if (errors.description) {
                        setErrors((prev) => ({ ...prev, description: '' }));
                      }
                    }}
                    placeholder="Vakansiya haqida batafsil ma'lumot..."
                    error={!!errors.description}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Majburiyatlar <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.responsibilities}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, responsibilities: value }));
                      if (errors.responsibilities) {
                        setErrors((prev) => ({ ...prev, responsibilities: '' }));
                      }
                    }}
                    placeholder="Ish vazifalari va majburiyatlar..."
                    error={!!errors.responsibilities}
                  />
                  {errors.responsibilities && <p className="mt-1 text-sm text-red-600">{errors.responsibilities}</p>}
                </div>

                {/* Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Afzalliklar <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.preferences}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, preferences: value }));
                      if (errors.preferences) {
                        setErrors((prev) => ({ ...prev, preferences: '' }));
                      }
                    }}
                    placeholder="Qo'shimcha afzalliklar va talablar..."
                    error={!!errors.preferences}
                  />
                  {errors.preferences && <p className="mt-1 text-sm text-red-600">{errors.preferences}</p>}
                </div>

                {/* Skills */}
                <div>
                  <label htmlFor="edit-skills" className="block text-sm font-medium text-gray-700 mb-2">
                    Ko'nikmalar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyPress={handleSkillsKeyPress}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.skills ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ko'nikma nomini kiriting va Enter bosing"
                  />
                  {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
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
                  {loading ? 'Saqlanayapti...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default EditVacancyModal;

