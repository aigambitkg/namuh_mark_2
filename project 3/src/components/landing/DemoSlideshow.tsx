import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Users, 
  FileText, 
  Zap,
  BarChart3,
  Brain,
  Clock,
  Sparkles,
  Building2,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Search,
  Award,
  User
} from 'lucide-react';

const slides = [
  // Applicant Slides
  {
    type: 'applicant',
    title: 'KI-gestütztes Matching',
    description: 'Finden Sie die perfekt passenden Jobs basierend auf Ihren Fähigkeiten und Präferenzen',
    icon: Target,
    stats: '95% Match Score',
    color: 'from-blue-500 to-namuh-teal',
    dashboard: (
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto scale-90">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-namuh-teal rounded-lg flex items-center justify-center text-white font-bold text-xs">nH</div>
            <span className="ml-2 font-semibold text-namuh-navy text-xs">namuH Match</span>
          </div>
          <div className="text-xs text-gray-500">Bewerber-Ansicht</div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-namuh-teal" />
              <span className="text-xs text-gray-700">KI Match Score</span>
            </div>
            <div className="flex items-center">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                <div className="h-1.5 bg-namuh-teal rounded-full animate-pulse" style={{width: '95%'}}></div>
              </div>
              <span className="ml-2 font-bold text-namuh-teal text-xs">95%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-700">CV Analyse</span>
            </div>
            <span className="text-green-500 font-medium text-xs">Abgeschlossen</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-700">Job Empfehlungen</span>
            </div>
            <span className="text-blue-500 font-medium text-xs">24 neue</span>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'applicant',
    title: 'Bewerbungsfortschritt transparent verfolgen',
    description: 'Behalten Sie alle Ihre Bewerbungen im Blick - vom ersten Kontakt bis zum Angebot',
    icon: FileText,
    stats: '100% Transparenz',
    color: 'from-purple-500 to-blue-600',
    dashboard: (
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto scale-90">
        <h3 className="font-bold text-namuh-navy mb-3 flex items-center text-xs">
          <FileText className="h-4 w-4 mr-1 text-namuh-teal" />
          Bewerbungsfortschritt
        </h3>
        
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-2 top-0 h-full">
              <div className="h-full w-0.5 bg-namuh-teal"></div>
            </div>
            
            <div className="relative pl-6 pb-2">
              <div className="flex items-center">
                <div className="absolute left-0 w-4 h-4 bg-namuh-teal rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="h-2 w-2" />
                </div>
                <div>
                  <h4 className="font-medium text-xs">Bewerbung eingereicht</h4>
                  <p className="text-[10px] text-gray-500">15. Jan 2024</p>
                </div>
              </div>
            </div>
            
            <div className="relative pl-6 pb-2">
              <div className="flex items-center">
                <div className="absolute left-0 w-4 h-4 bg-namuh-teal rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="h-2 w-2" />
                </div>
                <div>
                  <h4 className="font-medium text-xs">Lebenslauf geprüft</h4>
                  <p className="text-[10px] text-gray-500">18. Jan 2024</p>
                </div>
              </div>
            </div>
            
            <div className="relative pl-6 pb-2">
              <div className="flex items-center">
                <div className="absolute left-0 w-4 h-4 bg-namuh-teal rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="h-2 w-2" />
                </div>
                <div>
                  <h4 className="font-medium text-xs">Zum Gespräch eingeladen</h4>
                  <p className="text-[10px] text-gray-500">22. Jan 2024</p>
                </div>
              </div>
            </div>
            
            <div className="relative pl-6">
              <div className="flex items-center">
                <div className="absolute left-0 w-4 h-4 border-2 border-namuh-teal bg-white rounded-full"></div>
                <div>
                  <h4 className="font-medium text-xs text-gray-400">Feedback erhalten</h4>
                  <p className="text-[10px] text-gray-500">Ausstehend</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'applicant',
    title: 'KI-Tools für Ihre Karriere',
    description: 'Nutzen Sie unsere intelligenten Assistenten für optimierte Bewerbungsunterlagen und Vorbereitung',
    icon: Brain,
    stats: '75% höhere Erfolgsquote',
    color: 'from-namuh-teal to-namuh-navy',
    dashboard: (
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto scale-90">
        <h3 className="font-bold text-namuh-navy mb-3 text-xs">KI-Assistenten Hub</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 border border-gray-200 rounded-lg hover:border-namuh-teal transition-all cursor-pointer bg-gradient-to-br from-namuh-teal/5 to-namuh-navy/5">
            <div className="flex items-center mb-1">
              <FileText className="h-3 w-3 text-namuh-teal mr-1" />
              <span className="font-medium text-[10px]">CV Optimizer</span>
            </div>
            <p className="text-[10px] text-gray-500">Optimiere deinen Lebenslauf</p>
          </div>
          
          <div className="p-2 border border-gray-200 rounded-lg hover:border-namuh-teal transition-all cursor-pointer bg-gradient-to-br from-namuh-teal/5 to-namuh-navy/5">
            <div className="flex items-center mb-1">
              <MessageCircle className="h-3 w-3 text-namuh-teal mr-1" />
              <span className="font-medium text-[10px]">Interview Coach</span>
            </div>
            <p className="text-[10px] text-gray-500">Übe Interviews</p>
          </div>
          
          <div className="p-2 border border-gray-200 rounded-lg hover:border-namuh-teal transition-all cursor-pointer bg-gradient-to-br from-namuh-teal/5 to-namuh-navy/5">
            <div className="flex items-center mb-1">
              <Sparkles className="h-3 w-3 text-namuh-teal mr-1" />
              <span className="font-medium text-[10px]">Anschreiben</span>
            </div>
            <p className="text-[10px] text-gray-500">Passende Anschreiben</p>
          </div>
          
          <div className="p-2 border border-gray-200 rounded-lg hover:border-namuh-teal transition-all cursor-pointer bg-gradient-to-br from-namuh-teal/5 to-namuh-navy/5">
            <div className="flex items-center mb-1">
              <Search className="h-3 w-3 text-namuh-teal mr-1" />
              <span className="font-medium text-[10px]">Job Matcher</span>
            </div>
            <p className="text-[10px] text-gray-500">Passende Stellen</p>
          </div>
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-[10px] text-gray-500">8 Token verfügbar</span>
        </div>
      </div>
    )
  },
  
  // Recruiter Slides
  {
    type: 'recruiter',
    title: 'Qualifizierte Kandidaten finden',
    description: 'Präzises Matching bringt Ihnen nur relevante Bewerbungen von qualifizierten Kandidaten',
    icon: Users,
    stats: '73% weniger unpassende Bewerbungen',
    color: 'from-indigo-500 to-blue-600',
    dashboard: (
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto scale-90">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-namuh-navy rounded-lg flex items-center justify-center text-white font-bold text-xs">nH</div>
            <span className="ml-2 font-semibold text-namuh-navy text-xs">Recruiter Dashboard</span>
          </div>
          <div className="text-xs text-gray-500">Recruiter-Ansicht</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 bg-namuh-teal/10 rounded-lg">
            <div className="text-lg font-bold text-namuh-navy">24</div>
            <div className="text-[10px] text-gray-600">Neue Bewerbungen</div>
          </div>
          
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="text-lg font-bold text-green-600">85%</div>
            <div className="text-[10px] text-gray-600">Match-Rate</div>
          </div>
          
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="text-lg font-bold text-blue-600">3</div>
            <div className="text-[10px] text-gray-600">Aktive Stellen</div>
          </div>
          
          <div className="p-2 bg-purple-100 rounded-lg">
            <div className="text-lg font-bold text-purple-600">5</div>
            <div className="text-[10px] text-gray-600">Interviews geplant</div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Top-Kandidaten Match</span>
            <span className="text-[10px] text-namuh-teal">92% Übereinstimmung</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
            <div className="h-1.5 bg-namuh-teal rounded-full animate-pulse" style={{width: '92%'}}></div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'recruiter',
    title: 'Optimierte Recruiting-Prozesse',
    description: 'Verkürzen Sie Time-to-Hire und verbessern Sie die Candidate Experience',
    icon: Clock,
    stats: '68% schnellere Einstellungen',
    color: 'from-green-500 to-teal-600',
    dashboard: (
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto scale-90">
        <h3 className="font-bold text-namuh-navy mb-3 flex items-center text-xs">
          <BarChart3 className="h-4 w-4 mr-1 text-namuh-navy" />
          Recruiting-Leistung
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium">Time-to-Hire</span>
              <span className="text-[10px] font-medium text-green-600">12 Tage (↓32%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{width: '35%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium">Antwortrate</span>
              <span className="text-[10px] font-medium text-namuh-teal">94%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-namuh-teal h-1.5 rounded-full" style={{width: '94%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium">Conversion Rate</span>
              <span className="text-[10px] font-medium text-blue-600">28% (↑15%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '28%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium">Candidate Satisfaction</span>
              <span className="text-[10px] font-medium text-purple-600">4.8/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{width: '96%'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'recruiter',
    title: 'Datengetriebene Einblicke',
    description: 'Nutzen Sie KI-gestützte Analysen und Empfehlungen, um bessere Einstellungsentscheidungen zu treffen',
    icon: BarChart3,
    stats: '47% bessere Candidate Experience',
    color: 'from-amber-500 to-pink-600',
    dashboard: (
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-md mx-auto scale-90">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-namuh-navy flex items-center text-xs">
            <Brain className="h-4 w-4 mr-1 text-namuh-teal" />
            KI-Recruiting Insights
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 bg-namuh-teal/10 text-namuh-teal rounded-full">Premium</span>
        </div>
        
        <div className="space-y-2 mb-2">
          <div className="p-2 border border-gray-200 rounded-lg bg-gradient-to-r from-namuh-navy/5 to-namuh-teal/5">
            <div className="flex items-start">
              <Sparkles className="h-3 w-3 text-namuh-teal mt-0.5 mr-1" />
              <div>
                <p className="text-[10px] font-medium text-gray-900 mb-0.5">Stellenausschreibung optimieren</p>
                <p className="text-[9px] text-gray-600">Frontend-Skills präziser definieren</p>
              </div>
            </div>
          </div>
          
          <div className="p-2 border border-gray-200 rounded-lg bg-gradient-to-r from-namuh-navy/5 to-namuh-teal/5">
            <div className="flex items-start">
              <TrendingUp className="h-3 w-3 text-namuh-teal mt-0.5 mr-1" />
              <div>
                <p className="text-[10px] font-medium text-gray-900 mb-0.5">Gehaltstrends</p>
                <p className="text-[9px] text-gray-600">DevOps: Markt €85-95k</p>
              </div>
            </div>
          </div>
          
          <div className="p-2 border border-gray-200 rounded-lg bg-gradient-to-r from-namuh-navy/5 to-namuh-teal/5">
            <div className="flex items-start">
              <Users className="h-3 w-3 text-namuh-teal mt-0.5 mr-1" />
              <div>
                <p className="text-[10px] font-medium text-gray-900 mb-0.5">Talent-Pool Aktivierung</p>
                <p className="text-[9px] text-gray-600">5 passende Kandidaten identifiziert</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const DemoSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    // Erhöhung der Anzeigedauer von 5000ms auf 10000ms (10 Sekunden)
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  const currentSlideData = slides[currentSlide];

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="relative overflow-hidden">
        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-1 flex items-center justify-between bg-gradient-to-b from-black/30 to-transparent">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-namuh-teal rounded-lg flex items-center justify-center text-white font-bold text-xs">
              nH
            </div>
            <span className="text-xs font-bold text-white ml-1 text-shadow">namuH Platform</span>
          </div>
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-red-400 rounded-full"></div>
            <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
          </div>
        </div>

        {/* Slideshow Content */}
        <div className="p-5 pt-8 relative">
          <div className="absolute top-2 right-2 z-10">
            <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              currentSlideData.type === 'applicant' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-namuh-navy/20 text-namuh-navy'
            }`}>
              {currentSlideData.type === 'applicant' ? 'Für Bewerbende' : 'Für Recruiter & Unternehmen'}
            </div>
          </div>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.5 }}
              className="flex flex-col"
            >
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentSlideData.color} flex items-center justify-center text-white mb-2`}>
                    <currentSlideData.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-namuh-navy mb-1">
                    {currentSlideData.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {currentSlideData.description}
                  </p>
                  <div className="bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 px-2 py-1 rounded-lg inline-block">
                    <div className="flex items-center">
                      <Award className="h-3 w-3 text-namuh-teal mr-1" />
                      <span className="text-xs font-semibold text-namuh-navy">
                        {currentSlideData.stats}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center transform scale-90">
                  {currentSlideData.dashboard}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-1.5 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? `bg-${slides[index].type === 'applicant' ? 'namuh-teal' : 'namuh-navy'} scale-110` 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Type Indicators */}
          <div className="flex justify-center mt-2 space-x-2">
            <button 
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                slides[currentSlide].type === 'applicant'
                  ? 'bg-namuh-teal text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              onClick={() => {
                // Go to first applicant slide
                const applicantIndex = slides.findIndex(slide => slide.type === 'applicant');
                if (applicantIndex >= 0) goToSlide(applicantIndex);
              }}
            >
              <User className="h-2.5 w-2.5 inline mr-0.5" />
              Für Bewerbende
            </button>
            
            <button 
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                slides[currentSlide].type === 'recruiter'
                  ? 'bg-namuh-navy text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              onClick={() => {
                // Go to first recruiter slide
                const recruiterIndex = slides.findIndex(slide => slide.type === 'recruiter');
                if (recruiterIndex >= 0) goToSlide(recruiterIndex);
              }}
            >
              <Building2 className="h-2.5 w-2.5 inline mr-0.5" />
              Für Recruiter
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoSlideshow;