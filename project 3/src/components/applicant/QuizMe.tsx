import React, { useState } from 'react';
import { 
  Brain,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Target,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Coins
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export const QuizMe: React.FC = () => {
  const { user } = useAuthStore();
  const { jobs } = useAppStore();
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [quizState, setQuizState] = useState<'select' | 'quiz' | 'results'>('select');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeStart, setTimeStart] = useState<Date | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Mock quiz questions
  const mockQuestions: Question[] = [
    {
      id: '1',
      question: 'Welche der folgenden JavaScript-Methoden wird verwendet, um ein neues Array mit allen Elementen zu erstellen, die einen Test bestehen?',
      options: ['filter()', 'map()', 'reduce()', 'forEach()'],
      correctAnswer: 0,
      explanation: 'filter() erstellt ein neues Array mit allen Elementen, die den Test einer bereitgestellten Funktion bestehen.',
      difficulty: 'medium'
    },
    {
      id: '2',
      question: 'Was ist der Hauptzweck von React Hooks?',
      options: [
        'Performance-Optimierung',
        'State und Lifecycle in funktionalen Komponenten',
        'CSS-Styling',
        'API-Aufrufe'
      ],
      correctAnswer: 1,
      explanation: 'React Hooks ermöglichen es, State und andere React-Features in funktionalen Komponenten zu verwenden.',
      difficulty: 'easy'
    },
    {
      id: '3',
      question: 'Welches Designprinzip besagt, dass Software-Entitäten für Erweiterungen offen, aber für Modifikationen geschlossen sein sollten?',
      options: [
        'Single Responsibility Principle',
        'Open/Closed Principle',
        'Liskov Substitution Principle',
        'Dependency Inversion Principle'
      ],
      correctAnswer: 1,
      explanation: 'Das Open/Closed Principle (OCP) ist eines der SOLID-Prinzipien und besagt, dass Klassen offen für Erweiterungen, aber geschlossen für Modifikationen sein sollten.',
      difficulty: 'hard'
    }
  ];

  const canUseQuiz = () => {
    if (!user) return false;
    
    // Check subscription tier
    if (user.tier === 'applicant_starter') return false;
    if (user.tier === 'applicant_professional') {
      // Check remaining uses (mock: assume 2 uses per month)
      return true; // In real app, check actual remaining uses
    }
    if (user.tier === 'applicant_premium') return true;
    
    return false;
  };

  const startQuiz = () => {
    if (!selectedJob) return;
    
    setQuizState('quiz');
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeStart(new Date());
    setShowExplanation(false);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!timeStart) return;
    
    const timeSpent = Math.floor((new Date().getTime() - timeStart.getTime()) / 1000);
    const correctAnswers = answers.filter((answer, index) => 
      answer === mockQuestions[index].correctAnswer
    ).length;
    
    const result: QuizResult = {
      score: Math.round((correctAnswers / mockQuestions.length) * 100),
      totalQuestions: mockQuestions.length,
      timeSpent,
      strengths: ['JavaScript Grundlagen', 'React Konzepte'],
      improvements: ['Software Design Patterns', 'Algorithmische Komplexität'],
      recommendations: [
        'Vertiefen Sie Ihr Wissen über SOLID-Prinzipien',
        'Üben Sie mehr mit Design Patterns',
        'Erweitern Sie Ihre React Advanced Konzepte'
      ]
    };
    
    setQuizResult(result);
    setQuizState('results');
  };

  const resetQuiz = () => {
    setQuizState('select');
    setSelectedJob('');
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeStart(null);
    setShowExplanation(false);
    setQuizResult(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!canUseQuiz()) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Brain className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-namuh-navy mb-4">Quiz-Me</h1>
            <p className="text-xl text-gray-600 mb-8">
              Diese Funktion ist ab dem Professional Tier verfügbar
            </p>
            <div className="card p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-namuh-navy mb-4">Upgrade erforderlich</h3>
              <p className="text-gray-600 mb-6">
                Mit Quiz-Me können Sie Ihr Wissen für spezifische Stellenausschreibungen testen und erhalten personalisiertes Feedback.
              </p>
              <button className="btn-primary w-full">
                Auf Professional upgraden
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-namuh-navy mb-4">Quiz-Me</h1>
          <p className="text-xl text-gray-600 mb-6">
            Testen Sie Ihr Wissen für spezifische Stellenausschreibungen
          </p>
          <div className="inline-flex items-center space-x-2 bg-namuh-teal/10 px-4 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-namuh-teal" />
            <span className="text-namuh-teal font-medium">
              {user?.tier === 'applicant_professional' ? '2 Quiz-Nutzungen pro Monat' : 'Unbegrenzte Nutzung'}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {quizState === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8"
            >
              <h2 className="text-2xl font-semibold text-namuh-navy mb-6">Stellenausschreibung auswählen</h2>
              <p className="text-gray-600 mb-6">
                Wählen Sie eine Stelle aus, für die Sie Ihr Wissen testen möchten. Die KI generiert passende Fragen basierend auf den Anforderungen.
              </p>

              <div className="space-y-4 mb-8">
                {jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className={`border rounded-lg p-6 cursor-pointer transition-all ${
                      selectedJob === job.id
                        ? 'border-namuh-teal bg-namuh-teal/5'
                        : 'border-gray-200 hover:border-namuh-teal/50'
                    }`}
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-namuh-navy">{job.title}</h3>
                        <p className="text-gray-600">{job.companyName}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{job.location}</span>
                          <span className="capitalize">{job.employmentType}</span>
                          {job.matchScore && (
                            <span className="text-namuh-teal font-medium">
                              {job.matchScore}% Match
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedJob === job.id
                          ? 'border-namuh-teal bg-namuh-teal'
                          : 'border-gray-300'
                      }`}>
                        {selectedJob === job.id && (
                          <CheckCircle className="w-6 h-6 text-white -m-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Geschätzte Dauer: 5-10 Minuten
                </div>
                <button
                  onClick={startQuiz}
                  disabled={!selectedJob}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Quiz starten
                </button>
              </div>
            </motion.div>
          )}

          {quizState === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-8"
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Frage {currentQuestion + 1} von {mockQuestions.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    {timeStart && formatTime(Math.floor((new Date().getTime() - timeStart.getTime()) / 1000))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-namuh-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    mockQuestions[currentQuestion].difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    mockQuestions[currentQuestion].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {mockQuestions[currentQuestion].difficulty === 'easy' ? 'Einfach' :
                     mockQuestions[currentQuestion].difficulty === 'medium' ? 'Mittel' : 'Schwer'}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-namuh-navy mb-6">
                  {mockQuestions[currentQuestion].question}
                </h2>

                <div className="space-y-3">
                  {mockQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        answers[currentQuestion] === index
                          ? showExplanation
                            ? index === mockQuestions[currentQuestion].correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-namuh-teal bg-namuh-teal/5'
                          : showExplanation && index === mockQuestions[currentQuestion].correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-namuh-teal/50'
                      } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                          answers[currentQuestion] === index
                            ? showExplanation
                              ? index === mockQuestions[currentQuestion].correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : 'border-red-500 bg-red-500'
                              : 'border-namuh-teal bg-namuh-teal'
                            : showExplanation && index === mockQuestions[currentQuestion].correctAnswer
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {showExplanation && (
                            answers[currentQuestion] === index
                              ? index === mockQuestions[currentQuestion].correctAnswer
                                ? <CheckCircle className="w-4 h-4 text-white" />
                                : <XCircle className="w-4 h-4 text-white" />
                              : index === mockQuestions[currentQuestion].correctAnswer
                              ? <CheckCircle className="w-4 h-4 text-white" />
                              : null
                          )}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Erklärung:</h4>
                        <p className="text-blue-800">{mockQuestions[currentQuestion].explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <div />
                {showExplanation && (
                  <button onClick={nextQuestion} className="btn-primary">
                    {currentQuestion < mockQuestions.length - 1 ? 'Nächste Frage' : 'Quiz beenden'}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {quizState === 'results' && quizResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Score Overview */}
              <div className="card p-8 text-center">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-2xl font-bold ${
                  quizResult.score >= 80 ? 'bg-green-100 text-green-600' :
                  quizResult.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {quizResult.score}%
                </div>
                <h2 className="text-3xl font-bold text-namuh-navy mb-2">Quiz abgeschlossen!</h2>
                <p className="text-gray-600 mb-4">
                  Sie haben {quizResult.score}% erreicht ({answers.filter((answer, index) => 
                    answer === mockQuestions[index].correctAnswer
                  ).length} von {quizResult.totalQuestions} Fragen richtig)
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Zeit: {formatTime(quizResult.timeSpent)}
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Schwierigkeit: Gemischt
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-namuh-navy mb-4">
                    <CheckCircle className="h-5 w-5 inline mr-2 text-green-600" />
                    Ihre Stärken
                  </h3>
                  <ul className="space-y-2">
                    {quizResult.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-namuh-navy mb-4">
                    <TrendingUp className="h-5 w-5 inline mr-2 text-yellow-600" />
                    Verbesserungsmöglichkeiten
                  </h3>
                  <ul className="space-y-2">
                    {quizResult.improvements.map((improvement, index) => (
                      <li key={index} className="text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-namuh-navy mb-4">
                  <BookOpen className="h-5 w-5 inline mr-2 text-namuh-teal" />
                  Empfehlungen für Ihr Lernen
                </h3>
                <ul className="space-y-3">
                  {quizResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-namuh-teal rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={resetQuiz} className="btn-outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Neues Quiz starten
                </button>
                <button className="btn-primary">
                  Ergebnisse speichern
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};