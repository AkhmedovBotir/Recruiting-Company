/**
 * Update Status Modal Component
 * Updates application status with notes
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateStatusModal = ({ isOpen, onClose, onUpdate, application, loading }) => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (application) {
      setStatus(application.status || '');
      setNotes(application.notes || '');
      setErrors({});
    }
  }, [application]);

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!status.trim()) {
      newErrors.status = 'Status tanlash majburiy';
    }

    if (notes && notes.trim().length > 1000) {
      newErrors.notes = 'Eslatma maksimal 1000 belgi bo\'lishi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onUpdate(application._id, status, notes.trim() || null);
      handleClose();
    } catch (error) {
      // Error handling will be done in parent component
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setStatus('');
    setNotes('');
    setErrors({});
    onClose();
  };

  /**
   * Get status workflow steps
   */
  const getStatusWorkflow = () => {
    return [
      { value: 'pending', label: 'Kutilmoqda', icon: '⏳', color: 'yellow' },
      { value: 'reviewed', label: "Ko'rib chiqilgan", icon: '👁️', color: 'blue' },
      { value: 'interview', label: 'Intervyu', icon: '💼', color: 'purple' },
      { value: 'passed', label: "O'tgan", icon: '✅', color: 'green' },
      { value: 'failed', label: "O'tmagan", icon: '❌', color: 'red' },
      { value: 'accepted', label: 'Qabul qilingan', icon: '🎉', color: 'emerald' },
      { value: 'rejected', label: 'Rad etilgan', icon: '🚫', color: 'gray' },
    ];
  };

  /**
   * Get available statuses based on current status (workflow progression)
   */
  const getAvailableStatuses = () => {
    const currentStatus = application?.status || 'pending';
    
    // Define workflow progression
    const workflowMap = {
      pending: ['reviewed'],
      reviewed: ['interview', 'rejected'],
      interview: ['passed', 'failed'],
      passed: ['accepted', 'rejected'],
      failed: ['rejected'],
      accepted: [],
      rejected: [],
    };

    const nextStatuses = workflowMap[currentStatus] || [];
    const workflow = getStatusWorkflow();
    
    // Return next available statuses + current status for reference
    return workflow.filter((s) => nextStatuses.includes(s.value) || s.value === currentStatus);
  };

  /**
   * Get current status index in workflow
   * Handles parallel paths (passed/failed) correctly
   */
  const getCurrentStatusIndex = () => {
    const workflow = getStatusWorkflow();
    const currentStatus = application?.status || 'pending';
    const index = workflow.findIndex((s) => s.value === currentStatus);
    
    // For passed/failed, use interview index + 1 (they come after interview)
    if (currentStatus === 'passed' || currentStatus === 'failed') {
      const interviewIndex = workflow.findIndex((s) => s.value === 'interview');
      return interviewIndex + 1;
    }
    
    // For accepted/rejected after passed, use passed index + 1
    if (currentStatus === 'accepted') {
      const passedIndex = workflow.findIndex((s) => s.value === 'passed');
      return passedIndex + 1;
    }
    
    return index >= 0 ? index : 0;
  };

  if (!isOpen || !application) return null;

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
            className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Status O'zgartirish</h3>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 text-white hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-blue-100 mt-1">
                {application.candidate?.firstName} {application.candidate?.lastName}
              </p>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="bg-white px-6 py-6 space-y-6">
                {/* Status Workflow Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status Workflow
                  </label>
                  <div className="relative bg-gray-50 rounded-lg p-4">
                    {/* Progress Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200">
                      <div
                        className="absolute top-0 left-0 w-full bg-blue-600 transition-all duration-500"
                        style={{
                          height: `${Math.min((getCurrentStatusIndex() / Math.max(getStatusWorkflow().length - 1, 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      {getStatusWorkflow().map((step, index) => {
                        const isActive = step.value === application.status;
                        const currentIndex = getCurrentStatusIndex();
                        
                        // For passed/failed, check if we're past interview
                        let isCompleted = false;
                        if (step.value === 'passed' || step.value === 'failed') {
                          const interviewIndex = getStatusWorkflow().findIndex((s) => s.value === 'interview');
                          isCompleted = currentIndex > interviewIndex && !isActive;
                        } else if (step.value === 'accepted' || step.value === 'rejected') {
                          // Accepted/rejected are completed if we're past passed/failed
                          const passedIndex = getStatusWorkflow().findIndex((s) => s.value === 'passed');
                          const failedIndex = getStatusWorkflow().findIndex((s) => s.value === 'failed');
                          isCompleted = (currentIndex > passedIndex || currentIndex > failedIndex) && !isActive;
                        } else {
                          isCompleted = currentIndex > index && !isActive;
                        }
                        
                        const isNext = getAvailableStatuses().some((s) => s.value === step.value && s.value !== application.status);
                        
                        // Show all steps for better visibility
                        const shouldShow = 
                          isActive || 
                          isCompleted || 
                          isNext || 
                          index <= currentIndex ||
                          (step.value === 'passed' && application.status === 'accepted') ||
                          (step.value === 'failed' && application.status === 'rejected');

                        if (!shouldShow && !isActive && !isNext && !isCompleted) {
                          return null;
                        }

                        return (
                          <div key={step.value} className="relative flex items-center">
                            {/* Step Circle */}
                            <div
                              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                                isActive
                                  ? 'bg-blue-600 border-blue-600 shadow-md'
                                  : isCompleted
                                  ? 'bg-green-600 border-green-600'
                                  : isNext
                                  ? 'bg-yellow-100 border-yellow-400'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <span className={`text-sm ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                {step.icon}
                              </span>
                            </div>

                            {/* Step Label */}
                            <div className="ml-3">
                              <span
                                className={`text-sm font-medium ${
                                  isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : isNext ? 'text-yellow-900' : 'text-gray-500'
                                }`}
                              >
                                {step.label}
                                {isActive && <span className="ml-2 text-xs text-blue-600">(Joriy)</span>}
                                {isNext && <span className="ml-2 text-xs text-yellow-600">(Keyingi)</span>}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Current Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joriy Status
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-base font-semibold text-gray-900">
                      {getStatusWorkflow().find((s) => s.value === application.status)?.label || application.status}
                    </p>
                  </div>
                </div>

                {/* Status Selection - Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Yangi Status <span className="text-red-500">*</span>
                  </label>
                  
                  {getAvailableStatuses().filter((s) => s.value !== application.status).length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">
                        Bu status uchun keyingi qadamlar mavjud emas. Workflow tugallangan.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getAvailableStatuses()
                        .filter((s) => s.value !== application.status)
                        .map((s) => {
                          const isSelected = status === s.value;
                          const colorClasses = {
                            yellow: isSelected
                              ? 'bg-yellow-600 border-yellow-600 text-white shadow-lg'
                              : 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100',
                            blue: isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                              : 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100',
                            purple: isSelected
                              ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                              : 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100',
                            green: isSelected
                              ? 'bg-green-600 border-green-600 text-white shadow-lg'
                              : 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100',
                            red: isSelected
                              ? 'bg-red-600 border-red-600 text-white shadow-lg'
                              : 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100',
                            emerald: isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100',
                            gray: isSelected
                              ? 'bg-gray-600 border-gray-600 text-white shadow-lg'
                              : 'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100',
                          };

                          return (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => {
                                setStatus(s.value);
                                if (errors.status) {
                                  setErrors((prev) => ({ ...prev, status: '' }));
                                }
                              }}
                              className={`relative flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                colorClasses[s.color] || colorClasses.gray
                              } ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
                            >
                              <span className="text-xl mr-2">{s.icon}</span>
                              <span className="font-semibold text-sm">{s.label}</span>
                              {isSelected && (
                                <svg
                                  className="absolute top-2 right-2 w-5 h-5 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  )}
                  
                  {errors.status && <p className="mt-2 text-sm text-red-600">{errors.status}</p>}
                  
                  {status && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-700">
                          Tanlangan: <span className="font-semibold">{getStatusWorkflow().find((s) => s.value === status)?.label}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Eslatma (ixtiyoriy)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      if (errors.notes) {
                        setErrors((prev) => ({ ...prev, notes: '' }));
                      }
                    }}
                    rows={5}
                    maxLength={1000}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.notes ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Eslatma kiriting (maksimal 1000 belgi)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {notes.length} / 1000 belgi
                  </p>
                  {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
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

export default UpdateStatusModal;

