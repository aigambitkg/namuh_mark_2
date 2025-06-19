import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Sparkles, FileText, MessageCircle, BookMarked, Zap, Brain, Target, ArrowLeft, Bot, Send, User, Briefcase, CheckCircle, AlertCircle, Book, Award, HelpCircle, Lightbulb, Star, Users, GraduationCap, Heart, BarChart3, Clock, PenTool, Edit, Waypoints, MonitorPlay, Megaphone, BookOpen, RefreshCw, Puzzle, Handshake, ShieldCheck, Scale, Feather, Home, Globe, LibraryBig, Eye, TrendingUp, School, Gem, Building, Compass, Rocket, CheckSquare, UsersRound, ExternalLink, UserCog, Monitor, Map, Search, Layers, Smile as Family, Crown, RotateCcw, Dices, Flag, Equal, Scale as Scales, PenSquare, Play } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

// Define types for AI tools
interface AITool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tokenCost: number;
  color: string;
  category: 'document' | 'interview' | 'career' | 'coaching' | 'assessment';
  premium: boolean;
}

export const AIHub: React.FC = () => {
  const { user } = useAuthStore();
  const { tool } = useParams<{ tool: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  // Define available AI tools
  const aiTools: AITool[] = [
    // Document Tools
    {
      id: 'cv-optimizer',
      title: 'CV Optimizer',
      description: 'Optimiere deinen Lebenslauf für ATS-Systeme und verbessere deine Chancen',
      icon: FileText,
      tokenCost: 1,
      color: 'from-blue-500 to-blue-600',
      category: 'document',
      premium: false
    },
    {
      id: 'cover-letter-generator',
      title: 'Anschreiben-Generator',
      description: 'Erstelle personalisierte Anschreiben, die auf die Stellenanzeige abgestimmt sind',
      icon: BookMarked,
      tokenCost: 1,
      color: 'from-amber-500 to-orange-600',
      category: 'document',
      premium: false
    },
    {
      id: 'linkedin-profile-optimizer',
      title: 'LinkedIn-Profil-Optimierung',
      description: 'Verbessere deine Online-Präsenz für Recruiter mit KI-Empfehlungen',
      icon: User,
      tokenCost: 1,
      color: 'from-blue-600 to-blue-800',
      category: 'document',
      premium: false
    },
    
    // Interview Tools
    {
      id: 'interview-simulator',
      title: 'Online-Interview-Training',
      description: 'Simuliere Online-Interviews und erhalte Echtzeit-Feedback zur Optimierung deiner Performance.',
      icon: MonitorPlay,
      tokenCost: 2,
      color: 'from-purple-500 to-purple-700',
      category: 'interview',
      premium: false
    },
    {
      id: 'answer-strategy-optimization',
      title: 'Antwortstrategien Optimierung',
      description: 'Erarbeite überzeugende Antworten auf typische Interviewfragen mit detailliertem KI-Feedback.',
      icon: Edit,
      tokenCost: 2,
      color: 'from-blue-400 to-indigo-600',
      category: 'interview',
      premium: false
    },
    {
      id: 'specific-interview-formats',
      title: 'Spezifische Interviewformate',
      description: 'Bereite dich gezielt auf Videointerviews, Telefoninterviews und Assessment Center vor.',
      icon: GraduationCap,
      tokenCost: 3,
      color: 'from-violet-500 to-purple-700',
      category: 'interview',
      premium: true
    },
    {
      id: 'voice-speech-training',
      title: 'Stimm- & Sprechtraining',
      description: 'Verbessere deine verbale und nonverbale Kommunikation für souveränes Auftreten in Gesprächen.',
      icon: Megaphone,
      tokenCost: 2,
      color: 'from-orange-500 to-red-600',
      category: 'interview',
      premium: false
    },
    {
      id: 'application-strategy-optimization',
      title: 'Bewerbungsstrategie-Optimierung',
      description: 'Optimiere deine gesamte Bewerbungsstrategie für maximale Erfolgschancen.',
      icon: Star,
      tokenCost: 2,
      color: 'from-orange-500 to-red-600',
      category: 'career',
      premium: false
    },

    // General Counseling and Support
    {
      id: 'reflection-decision-making',
      title: 'Reflexion & Entscheidungsfindung',
      description: 'Unterstützung bei der Reflexion deiner beruflichen Situation und wichtigen Entscheidungen.',
      icon: Lightbulb,
      tokenCost: 2,
      color: 'from-amber-400 to-yellow-600',
      category: 'coaching',
      premium: false
    },
    {
      id: 'information-advice',
      title: 'Informationen & Ratschläge',
      description: 'Erhalte präzise und umsetzbare Informationen zu spezifischen beruflichen Themen.',
      icon: BookOpen,
      tokenCost: 1,
      color: 'from-gray-500 to-slate-700',
      category: 'coaching',
      premium: false
    },
    {
      id: 'goal-setting-planning',
      title: 'Zielsetzung & Wegeplanung',
      description: 'Lege attraktive Ziele fest und entwickle klare, umsetzbare Pläne, um sie zu erreichen.',
      icon: Target,
      tokenCost: 2,
      color: 'from-green-500 to-emerald-700',
      category: 'career',
      premium: false
    },
    {
      id: 'career-management-skills',
      title: 'Karriere-Management-Skills',
      description: 'Entwickle deine berufsbiografischen Gestaltungskompetenzen für eine proaktive Karriere.',
      icon: Waypoints,
      tokenCost: 2,
      color: 'from-teal-500 to-blue-600',
      category: 'career',
      premium: false
    },
    {
      id: 'engagement-performance-boost',
      title: 'Engagement & Leistungssteigerung',
      description: 'Identifiziere Ursachen für fehlendes Engagement und steigere deine berufliche Leistung.',
      icon: Zap,
      tokenCost: 2,
      color: 'from-yellow-400 to-orange-600',
      category: 'coaching',
      premium: false
    },
    {
      id: 'transition-management',
      title: 'Übergänge erfolgreich gestalten',
      description: 'Unterstützung bei beruflichen Übergängen und Wandel in turbulenten Arbeitsmärkten.',
      icon: RefreshCw,
      tokenCost: 2,
      color: 'from-cyan-400 to-blue-600',
      category: 'career',
      premium: false
    },
    {
      id: 'skill-aspiration-matching',
      title: 'Fähigkeiten & Aspirationen Matching',
      description: 'Finde die perfekte Passung zwischen deinen Talenten, Wünschen und beruflichen Möglichkeiten.',
      icon: Puzzle,
      tokenCost: 2,
      color: 'from-purple-400 to-pink-600',
      category: 'assessment',
      premium: false
    },
    {
      id: 'reduce-social-benefits-dependency',
      title: 'Abhängigkeit von Sozialleistungen reduzieren',
      description: 'Schrittweise Unterstützung zur (Wieder-)Integration in den Arbeitsmarkt und Stärkung der Eigenständigkeit.',
      icon: Handshake,
      tokenCost: 2,
      color: 'from-lime-500 to-green-600',
      category: 'coaching',
      premium: false
    },
    {
      id: 'adaptability-resilience',
      title: 'Anpassungsfähigkeit & Belastbarkeit',
      description: 'Stärke deine Resilienz und Handlungsfähigkeit im Umgang mit beruflichem Wandel.',
      icon: ShieldCheck,
      tokenCost: 2,
      color: 'from-rose-400 to-red-600',
      category: 'coaching',
      premium: false
    },
    {
      id: 'decision-competence-improvement',
      title: 'Entscheidungskompetenz verbessern',
      description: 'Lerne strukturierte Entscheidungsprozesse, um autonomere und reflektiertere Entscheidungen zu treffen.',
      icon: Scale,
      tokenCost: 2,
      color: 'from-indigo-400 to-purple-600',
      category: 'coaching',
      premium: false
    },
    {
      id: 'personal-development',
      title: 'Persönliche Weiterentwicklung',
      description: 'Fördere deine Kompetenzen in Bereichen wie Kommunikation, Selbstvertrauen und emotionale Intelligenz.',
      icon: Feather,
      tokenCost: 2,
      color: 'from-amber-300 to-yellow-500',
      category: 'coaching',
      premium: false
    },
    {
      id: 'unemployed-support',
      title: 'Stärkung für Arbeitslose',
      description: 'Stärke deine Ausrichtung, Ziele und Zuversicht auf dem Weg zurück in den Job.',
      icon: Home,
      tokenCost: 2,
      color: 'from-blue-300 to-cyan-500',
      category: 'coaching',
      premium: false
    },
    {
      id: 'career-break-management',
      title: 'Sinnvolle Gestaltung von Berufspausen',
      description: 'Nutze Unterbrechungen der Erwerbstätigkeit (z.B. Elternzeit, Sabbatical) für persönliches Wachstum.',
      icon: Clock,
      tokenCost: 2,
      color: 'from-lime-300 to-green-500',
      category: 'career',
      premium: false
    },
    {
      id: 'migrant-employment-support',
      title: 'Arbeitnehmer mit Migrationshintergrund',
      description: 'Unterstützung beim Verständnis von Mobilitätsprozessen und der Integration in neue Arbeitsmärkte.',
      icon: Globe,
      tokenCost: 2,
      color: 'from-sky-500 to-blue-700',
      category: 'coaching',
      premium: false
    },
    {
      id: 'lifelong-learning',
      title: 'Lebenslanges Lernen',
      description: 'Fördere deine Lernbereitschaft und persönliche Weiterentwicklung für eine zukunftsfähige Karriere.',
      icon: LibraryBig,
      tokenCost: 1,
      color: 'from-teal-400 to-emerald-600',
      category: 'coaching',
      premium: false
    },
    {
      id: 'self-help-problem-solving',
      title: 'Hilfe zur Selbsthilfe & Problemlösung',
      description: 'Lerne systematische Problemlösung und stärke deine Selbstwirksamkeit im Umgang mit Herausforderungen.',
      icon: Puzzle,
      tokenCost: 2,
      color: 'from-pink-400 to-purple-600',
      category: 'coaching',
      premium: false
    },
    {
      id: 'self-concept-career-role',
      title: 'Selbstkonzept & Berufsrolle',
      description: 'Kläre dein Selbstkonzept und setze es in eine authentische und passende berufliche Rolle um.',
      icon: Eye,
      tokenCost: 2,
      color: 'from-fuchsia-400 to-rose-600',
      category: 'career',
      premium: false
    },
    {
      id: 'career-development-promotion',
      title: 'Berufliche Entwicklung fördern',
      description: 'Identifiziere Entwicklungsbedarfe und erhalte personalisierte Wege zur Entfaltung deines Potenzials.',
      icon: TrendingUp,
      tokenCost: 2,
      color: 'from-cyan-500 to-teal-700',
      category: 'career',
      premium: false
    }
  ];

  // Filter tools based on search and category
  const filteredTools = aiTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: null, name: 'Alle', icon: Sparkles },
    { id: 'document', name: 'Dokumente', icon: FileText },
    { id: 'interview', name: 'Interviews', icon: MessageCircle },
    { id: 'career', name: 'Karriere', icon: Briefcase },
    { id: 'assessment', name: 'Assessment', icon: Target },
    { id: 'coaching', name: 'Coaching', icon: Users }
  ];

  // Function to get gradient for card
  const getGradient = (color: string) => `bg-gradient-to-br ${color}`;

  // If specific tool is opened
  if (tool) {
    const selectedTool = aiTools.find(t => t.id === tool);
    
    if (!selectedTool) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-namuh-navy mb-4">Tool nicht gefunden</h1>
              <p className="text-xl text-gray-600 mb-8">
                Das gesuchte AI-Tool konnte nicht gefunden werden.
              </p>
              <button 
                onClick={() => navigate('/ai-hub')}
                className="btn-primary inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum AI-Hub
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    const IconComponent = selectedTool.icon;
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/ai-hub')}
              className="inline-flex items-center text-namuh-teal hover:text-namuh-navy transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum AI-Hub
            </button>
            
            <div className="flex items-start">
              <div className={`p-3 rounded-xl ${getGradient(selectedTool.color)} text-white mr-4`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-namuh-navy">{selectedTool.title}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex items-center bg-namuh-teal/10 text-namuh-teal px-3 py-1 rounded-full text-sm">
                    <Zap className="h-4 w-4 mr-2" />
                    {selectedTool.tokenCost} Tokens
                  </div>
                  {selectedTool.premium && (
                    <div className="ml-3 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                      Premium Feature
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card p-8 space-y-6 mb-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              {selectedTool.description}
            </p>
            
            <div className="bg-namuh-teal/10 border border-namuh-teal/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-4 flex items-center">
                <Bot className="h-5 w-5 mr-2 text-namuh-teal" />
                Wie kann ich dir helfen?
              </h2>
              
              <div className="mb-4">
                <textarea 
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-namuh-teal focus:border-transparent transition-all resize-none"
                  placeholder={`Beschreibe hier, was du vom ${selectedTool.title} Tool benötigst...`}
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-namuh-teal" />
                  Kostet {selectedTool.tokenCost} Token ({user?.tokenBalance} verfügbar)
                </div>
                <button className="btn-primary flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Anfrage senden
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-namuh-navy mb-4">So funktioniert's:</h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-namuh-teal text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Beschreibe dein Anliegen</h3>
                    <p className="text-gray-600">Je detaillierter deine Anfrage, desto besser kann die KI dir helfen.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-namuh-teal text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Die KI verarbeitet deine Anfrage</h3>
                    <p className="text-gray-600">Unsere spezialisierte KI analysiert dein Anliegen und erstellt eine personalisierte Antwort.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-namuh-teal text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Erhalte dein Ergebnis</h3>
                    <p className="text-gray-600">Du erhältst eine maßgeschneiderte Antwort oder ein Dokument, das du weiter anpassen kannst.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Examples Section */}
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-namuh-navy mb-6">Beispiele für Anfragen:</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {selectedTool.id === 'cv-optimizer' && (
                <>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal/50 hover:bg-namuh-teal/5 transition-colors">
                    "Bitte optimiere meinen Lebenslauf für eine Stelle als Frontend-Entwickler und hebe relevante React-Erfahrungen hervor."
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal/50 hover:bg-namuh-teal/5 transition-colors">
                    "Analysiere meinen Lebenslauf auf ATS-Kompatibilität und verbessere die Schlüsselwort-Optimierung."
                  </div>
                </>
              )}
              
              {selectedTool.id === 'interview-simulator' && (
                <>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal/50 hover:bg-namuh-teal/5 transition-colors">
                    "Simuliere ein Vorstellungsgespräch für eine Produktmanagement-Position mit Fokus auf agile Methoden."
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal/50 hover:bg-namuh-teal/5 transition-colors">
                    "Stelle mir typische Stressfragen, die in einem Vorstellungsgespräch vorkommen könnten."
                  </div>
                </>
              )}
              
              {/* Fallback for other tools */}
              {![
                'cv-optimizer', 'interview-simulator'
              ].includes(selectedTool.id) && (
                <>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal/50 hover:bg-namuh-teal/5 transition-colors">
                    "Ich benötige Hilfe bei [spezifisches Problem im Zusammenhang mit {selectedTool.title}]."
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal/50 hover:bg-namuh-teal/5 transition-colors">
                    "Kannst du mir Ratschläge zu [relevantes Thema für {selectedTool.title}] geben?"
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main AI Hub view
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">AI Hub</h1>
          <p className="mt-2 text-gray-600">
            Nutze unsere KI-gestützten Tools, um deine Karriere und Bewerbungen zu optimieren
          </p>
          <div className="mt-4 flex items-center">
            <div className="mr-3 flex items-center bg-namuh-teal/10 text-namuh-teal px-3 py-1 rounded-full text-sm">
              <Zap className="h-4 w-4 mr-2" />
              <span className="font-medium">{user?.tokenBalance} Tokens verfügbar</span>
            </div>
            <button 
              className="text-namuh-teal hover:text-namuh-teal-dark text-sm flex items-center"
              onClick={() => setShowTokenInfo(!showTokenInfo)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Was sind Tokens?
            </button>
          </div>
          
          <AnimatePresence>
            {showTokenInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <h3 className="font-medium text-blue-900 flex items-center mb-2">
                  <Zap className="h-4 w-4 text-blue-500 mr-2" />
                  Über Tokens
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  Tokens sind deine Währung für KI-gestützte Features. Jedes AI-Tool verbraucht eine bestimmte Anzahl an Tokens.
                </p>
                <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                  <li>Starter-Plan: 2 Tokens pro Monat</li>
                  <li>Professional-Plan: 10 Tokens pro Monat</li>
                  <li>Premium-Plan: 30 Tokens pro Monat</li>
                </ul>
                <p className="text-sm text-blue-800 mt-2">
                  Du erhältst jeden Monat neue Tokens basierend auf deinem Abonnement. Zusätzliche Token-Pakete können im Preisbereich erworben werden.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setShowTokenInfo(false)}
                    className="text-xs text-blue-700 hover:text-blue-900"
                  >
                    Schließen
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Search and Categories */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Suche nach AI-Tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Bot className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <motion.button
                    key={category.id || 'all'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${
                      activeCategory === category.id
                        ? 'bg-namuh-teal text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-namuh-teal/50'
                    }`}
                  >
                    <CategoryIcon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Section - AI Tools */}
        <div className="mb-8">
          {/* Individuelles Karrierecoaching & -beratung */}
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-namuh-teal/10 rounded-lg mr-3">
                <Briefcase className="h-5 w-5 text-namuh-teal" />
              </div>
              <h2 className="text-2xl font-bold text-namuh-navy">Individuelles Karrierecoaching & -beratung</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools
                .filter(tool => ['career', 'coaching', 'assessment'].includes(tool.category))
                .map((tool) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                    className="card p-6 hover:border-namuh-teal transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getGradient(tool.color)} text-white`}>
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center bg-namuh-teal/10 text-namuh-teal px-2 py-1 rounded-full text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {tool.tokenCost} Tokens
                        </div>
                        {tool.premium && (
                          <div className="ml-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                            Premium
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-namuh-navy mb-2">{tool.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                    <Link to={`/ai-hub/${tool.id}`} className="btn-primary w-full text-center text-sm">
                      Tool starten
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
          
          {/* KI-gestützte Vorbereitung auf Vorstellungsgespräche & Assessment Center */}
          <div>
            <div className="flex items-center mb-6">
              <div className="p-2 bg-namuh-navy/10 rounded-lg mr-3">
                <MessageCircle className="h-5 w-5 text-namuh-navy" />
              </div>
              <h2 className="text-2xl font-bold text-namuh-navy">KI-gestützte Vorbereitung auf Vorstellungsgespräche & Assessment Center</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools
                .filter(tool => ['interview', 'document'].includes(tool.category))
                .map((tool) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                    className="card p-6 hover:border-namuh-teal transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${getGradient(tool.color)} text-white`}>
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center bg-namuh-teal/10 text-namuh-teal px-2 py-1 rounded-full text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {tool.tokenCost} Tokens
                        </div>
                        {tool.premium && (
                          <div className="ml-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                            Premium
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-namuh-navy mb-2">{tool.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                    <Link to={`/ai-hub/${tool.id}`} className="btn-primary w-full text-center text-sm">
                      Tool starten
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Tier Upgrade Banner */}
        {user?.tier === 'applicant_starter' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 text-center"
          >
            <h2 className="text-2xl font-semibold text-namuh-navy mb-4">Mehr Token. Mehr Möglichkeiten.</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Upgrade auf Professional oder Premium für mehr monatliche Tokens und Zugang zu exklusiven Features.
            </p>
            <Link to="/pricing" className="btn-primary inline-flex items-center">
              Upgrade zu Professional
              <Zap className="h-4 w-4 ml-2" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};