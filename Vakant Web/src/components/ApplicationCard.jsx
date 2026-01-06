import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, formatCurrency } from '../utils/helpers';
import { STATUS_COLORS, STATUS_LABELS, WORK_TYPES } from '../utils/constants';

const ApplicationCard = ({ application }) => {
  const { vacancy } = application;
  const statusClass = STATUS_COLORS[application.status] || STATUS_COLORS.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 p-6"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {vacancy.title}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
              <span className="bg-blue-100 px-3 py-1 rounded-full">
                {vacancy.department}
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full">
                {vacancy.position}
              </span>
              <span
                className={`px-3 py-1 rounded-full ${
                  vacancy.workType === WORK_TYPES.FULLTIME
                    ? 'bg-purple-100'
                    : 'bg-orange-100'
                }`}
              >
                {vacancy.workType === WORK_TYPES.FULLTIME
                  ? "To'liq ish kuni"
                  : 'Yarim ish kuni'}
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
          >
            {STATUS_LABELS[application.status] || application.status}
          </span>
        </div>

        {vacancy.company && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Kompaniya:</span>{' '}
              {vacancy.company.name}
            </p>
          </div>
        )}

        {vacancy.salary && (
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Maosh:</span>{' '}
            <span className="text-green-600 font-bold">
              {formatCurrency(vacancy.salary)}
            </span>
          </div>
        )}

        {application.status === 'interview' && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                Intervyuga qabul qilingan
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">
            Topshirilgan: {formatDate(application.createdAt)}
          </span>
          <Link
            to={`/applications/${application._id}`}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Ko'rish
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;

