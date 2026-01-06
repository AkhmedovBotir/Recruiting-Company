import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { formatDate } from '../utils/helpers';
import { renderHTML } from '../utils/htmlUtils';
import { TestIcon } from '../components/Icons';

const MaterialDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testAnswers, setTestAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  useEffect(() => {
    fetchMaterial();
    fetchTestResult();
  }, [id]);

  const fetchMaterial = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getMaterial(id);
      if (response.success) {
        setMaterial(response.data.material);
        if (response.data.material.tests) {
          setTestAnswers(new Array(response.data.material.tests.length).fill(''));
        }
      }
    } catch (err) {
      setError(err.message || 'Material ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResult = async () => {
    setLoadingResult(true);
    try {
      const response = await api.getTestResults(id);
      if (response.success) {
        setTestResult(response.data.testResult);
      }
    } catch (err) {
      // Not found is OK (test not submitted yet)
      if (err.message && !err.message.includes('not found')) {
        console.error('Test result fetch error:', err);
      }
    } finally {
      setLoadingResult(false);
    }
  };

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...testAnswers];
    newAnswers[index] = answer;
    setTestAnswers(newAnswers);
  };

  const handleSubmitTest = async () => {
    if (testAnswers.some(answer => !answer)) {
      setError('Iltimos, barcha savollarga javob bering');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await api.submitTest(id, testAnswers);
      if (response.success) {
        setTestResult(response.data.testResult);
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Test topshirishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
          <Alert message={error} type="error" />
          <Link to="/materials" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
            ← Materiallarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (!material) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
          <button
            onClick={() => {
              // Agar state'da company va vacancy bo'lsa, ularni URL'ga qo'shish
              const state = location.state;
              if (state?.companyId && state?.vacancyId) {
                navigate(`/materials?company=${state.companyId}&vacancy=${state.vacancyId}`, { replace: true });
              } else if (state?.companyId) {
                navigate(`/materials?company=${state.companyId}`, { replace: true });
              } else {
                navigate('/materials', { replace: true });
              }
            }}
            className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Darslarga qaytish
          </button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{material.title}</h1>
          {material.vacancy && (
            <p className="text-lg text-gray-600 mt-2">{material.vacancy.title}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
        {error && <Alert message={error} type="error" />}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video */}
            {material.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Videodars</h2>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={getYouTubeEmbedUrl(material.videoUrl)}
                    title={material.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}

            {/* Description */}
            {material.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tavsif</h2>
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={renderHTML(material.description)}
                />
              </motion.div>
            )}

            {/* Tests */}
            {material.tests && material.tests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TestIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Test savollar</h2>
                </div>
                {testResult ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-blue-900 mb-2">Test natijalari</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{testResult.correctCount}</p>
                          <p className="text-sm text-gray-600">To'g'ri</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">{testResult.incorrectCount}</p>
                          <p className="text-sm text-gray-600">Noto'g'ri</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{testResult.score}%</p>
                          <p className="text-sm text-gray-600">Ball</p>
                        </div>
                      </div>
                    </div>
                    {material.tests.map((test, index) => {
                      const userAnswer = testResult.answers && testResult.answers.length > 0
                        ? (testResult.answers.find(
                            (ans) => ans.questionIndex === index
                          ) || testResult.answers[index])
                        : null;
                      
                      // To'g'ri javobni topish
                      // Avval test obyektidan, keyin testResult dan, oxirida userAnswer dan
                      const correctAnswer = test.correctAnswer || 
                                          test.answer || 
                                          (testResult.correctAnswers && testResult.correctAnswers[index]) ||
                                          (userAnswer && userAnswer.isCorrect ? userAnswer.answer : null);
                      
                      if (!userAnswer) {
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              {index + 1}. {test.question}
                            </h3>
                            <div className="space-y-2">
                              {test.options.map((option, optIndex) => {
                                const optionLetter = String.fromCharCode(65 + optIndex);
                                return (
                                  <div
                                    key={optIndex}
                                    className="p-3 rounded-lg border-2 bg-gray-50 border-gray-200"
                                  >
                                    <span className="font-medium">{optionLetter}.</span> {option}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            {index + 1}. {test.question}
                          </h3>
                          <div className="space-y-2">
                            {test.options.map((option, optIndex) => {
                              const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                              const isSelected = userAnswer.answer === optionLetter;
                              const isCorrect = userAnswer.isCorrect;
                              const isCorrectAnswer = correctAnswer === optionLetter || (isSelected && isCorrect);
                              const isWrongAnswer = isSelected && !isCorrect;
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    isWrongAnswer
                                      ? 'bg-red-50 border-red-500'
                                      : isCorrectAnswer
                                      ? 'bg-green-50 border-green-500'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>
                                      <span className="font-medium">{optionLetter}.</span> {option}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {isSelected && (
                                        <span className={`text-sm font-semibold ${
                                          isCorrect ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {isCorrect ? '✓ To\'g\'ri' : '✗ Noto\'g\'ri'}
                                        </span>
                                      )}
                                      {!isSelected && isCorrectAnswer && (
                                        <span className="text-sm font-semibold text-green-600">
                                          ✓ To'g'ri javob
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {material.tests.map((test, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {index + 1}. {test.question}
                        </h3>
                        <div className="space-y-2">
                          {test.options.map((option, optIndex) => {
                            const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                            return (
                              <label
                                key={optIndex}
                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  testAnswers[index] === optionLetter
                                    ? 'bg-blue-50 border-blue-500'
                                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={optionLetter}
                                  checked={testAnswers[index] === optionLetter}
                                  onChange={() => handleAnswerChange(index, optionLetter)}
                                  className="mr-3"
                                />
                                <span>{optionLetter}.</span> <span className="ml-2">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSubmitTest}
                      disabled={submitting || testAnswers.some(answer => !answer)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Topshirilmoqda...' : 'Testni topshirish'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4"
            >
              {material.vacancy && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Vakansiya</p>
                  <p className="font-semibold text-gray-900">{material.vacancy.title}</p>
                </div>
              )}
              {material.company && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Kompaniya</p>
                  <p className="font-semibold text-gray-900">{material.company.name}</p>
                </div>
              )}
              {material.tests && material.tests.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Test savollar</p>
                  <p className="font-semibold text-gray-900">{material.tests.length} ta</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage;

