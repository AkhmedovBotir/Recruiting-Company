export const API_BASE_URL = 'http://localhost:3000/api';

export const VACANCY_STATUS = {
  ACTIVE: 'active',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  INTERVIEW: 'interview',
  PASSED: 'passed',
  FAILED: 'failed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const WORK_TYPES = {
  FULLTIME: 'fulltime',
  PARTTIME: 'parttime',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-orange-100 text-orange-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const STATUS_LABELS = {
  pending: "Kutilyapti",
  reviewed: "Ko'rib chiqilgan",
  interview: 'Intervyuga qabul qilingan',
  passed: "Intervyudan o'tdi",
  failed: "Intervyudan o'tmadi",
  accepted: 'Qabul qilingan',
  rejected: 'Rad etilgan',
};

export const INTERVIEW_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const INTERVIEW_RESULT = {
  PASSED: 'passed',
  FAILED: 'failed',
  PENDING: 'pending',
};

export const INTERVIEW_STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const INTERVIEW_STATUS_LABELS = {
  scheduled: 'Rejalashtirilgan',
  completed: 'Yakunlangan',
  cancelled: 'Bekor qilingan',
};

export const INTERVIEW_RESULT_COLORS = {
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export const INTERVIEW_RESULT_LABELS = {
  passed: "O'tdi",
  failed: "O'tmadi",
  pending: 'Kutilmoqda',
};

