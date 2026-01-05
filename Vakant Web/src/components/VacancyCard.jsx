import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../utils/helpers';
import { WORK_TYPES } from '../utils/constants';

const VacancyCard = ({ vacancy }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer"
    >
      <Link to={`/vacancies/${vacancy._id}`} className="block">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                {vacancy.title}
              </h3>
              {vacancy.company && (
                <p className="text-base text-gray-700 font-medium mb-2">
                  {vacancy.company.name}
                </p>
              )}
            </div>
            {vacancy.salary && (
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                  {formatCurrency(vacancy.salary)}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {vacancy.department && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                {vacancy.department}
              </span>
            )}
            {vacancy.position && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm">
                {vacancy.position}
              </span>
            )}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                vacancy.workType === WORK_TYPES.FULLTIME
                  ? 'bg-purple-50 text-purple-700'
                  : 'bg-orange-50 text-orange-700'
              }`}
            >
              {vacancy.workType === WORK_TYPES.FULLTIME
                ? 'To\'liq ish kuni'
                : 'Yarim ish kuni'}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
            {vacancy.experience && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>{vacancy.experience}</span>
              </div>
            )}
            {(vacancy.minAge || vacancy.maxAge) && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>
                  {vacancy.minAge && vacancy.maxAge
                    ? `${vacancy.minAge}-${vacancy.maxAge} yosh`
                    : vacancy.minAge
                    ? `${vacancy.minAge}+ yosh`
                    : `gacha ${vacancy.maxAge} yosh`}
                </span>
              </div>
            )}
            <div className="flex items-center text-gray-500">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(vacancy.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VacancyCard;

