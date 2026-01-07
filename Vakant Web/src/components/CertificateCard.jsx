import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/helpers';

const CertificateCard = ({ certificate }) => {
  const { vacancy, interview, certificateNumber, issuedDate, status } = certificate;
  const statusClass = status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
  const statusLabel = status === 'active' ? 'Faol' : 'Bekor qilingan';

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
              {vacancy.company && (
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {vacancy.company.name}
                </span>
              )}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        {interview && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Suhbat:</span> {formatDate(interview.date)} {interview.time}
            </p>
            {interview.interviewer && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Suhbat o'tkazuvchi:</span> {interview.interviewer}
              </p>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Sertifikat raqami:</span> {certificateNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Berilgan sana:</span> {formatDate(issuedDate)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">
            Yaratilgan: {formatDate(certificate.createdAt)}
          </span>
          <Link
            to={`/certificates/${certificate._id}`}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Ko'rish
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;

