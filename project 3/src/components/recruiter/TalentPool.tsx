import React, { useState } from 'react';
import { 
  Users,
  Plus,
  Search,
  Filter,
  Star,
  MessageCircle,
  Eye,
  MoreVertical,
  Target,
  Calendar,
  User,
  Briefcase,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface TalentPoolCategory {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  color: string;
}

interface TalentEntry {
  id: string;
  name: string;
  role: string;
  skills: string[];
  matchScore: number;
  addedDate: Date;
  lastContact?: Date;
  notes: string;
  avatar: string;
  experience: string;
  location: string;
}

export const TalentPool: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // Check if user has access to Talent Pool based on tier
  const hasAccess = user?.tier !== 'recruiter_basis' && user?.tier !== 'recruiter_starter';

  const mockCategories: TalentPoolCategory[] = [
    {
      id: '1',
      name: 'Frontend Developers',
      description: 'Experienced React, Vue.js and Angular developers',
      memberCount: 24,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'UX/UI Designers',
      description: 'Creative designers with strong portfolios',
      memberCount: 18,
      color: 'bg-purple-500'
    },
    {
      id: '3',
      name: 'Product Managers',
      description: 'Strategic thinkers with proven track records',
      memberCount: 12,
      color: 'bg-green-500'
    },
    {
      id: '4',
      name: 'Backend Engineers',
      description: 'Node.js, Python, and Java specialists',
      memberCount: 31,
      color: 'bg-namuh-teal'
    }
  ];

  const mockTalentEntries: TalentEntry[] = [
    {
      id: '1',
      name: 'SYNONYM_ID_USER789',
      role: 'Senior Frontend Developer',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      matchScore: 95,
      addedDate: new Date('2024-01-15'),
      lastContact: new Date('2024-01-20'),
      notes: 'Excellent technical skills, great communication. Previously worked at FAANG companies.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      experience: '7+ Jahre',
      location: 'Berlin, Deutschland'
    },
    {
      id: '2',
      name: 'SYNONYM_ID_USER456',
      role: 'UX/UI Designer',
      skills: ['Figma', 'Sketch', 'Prototyping', 'User Research'],
      matchScore: 88,
      addedDate: new Date('2024-01-10'),
      notes: 'Strong portfolio with B2B focus. Available for contract work.',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      experience: '5+ Jahre',
      location: 'München, Deutschland'
    },
    {
      id: '3',
      name: 'SYNONYM_ID_USER123',
      role: 'Product Manager',
      skills: ['Strategy', 'Analytics', 'Agile', 'Leadership'],
      matchScore: 82,
      addedDate: new Date('2024-01-08'),
      lastContact: new Date('2024-01-18'),
      notes: 'Led successful product launches. Looking for leadership opportunities.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      experience: '8+ Jahre',
      location: 'Hamburg, Deutschland'
    }
  ];

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Users className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-namuh-navy mb-4">Talent Pool</h1>
            <p className="text-xl text-gray-600 mb-8">
              Diese Funktion ist ab dem Professional Tier verfügbar
            </p>
            <div className="card p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-namuh-navy mb-4">Upgrade erforderlich</h3>
              <p className="text-gray-600 mb-6">
                Mit dem Talent Pool können Sie qualifizierte Kandidaten sammeln und verwalten. 
                Professional Tier: 10 Suchen/Monat, Enterprise: 40 Suchen/Monat.
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-namuh-navy">Talent Pool</h1>
            <p className="mt-2 text-gray-600">
              Verwalten Sie Ihre Kandidaten-Pipeline und bauen Sie Beziehungen auf.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewCategory(true)}
              className="btn-outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Kategorie
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Talent hinzufügen
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-namuh-navy">Kategorien</h2>
                <span className="text-sm text-gray-500">{mockCategories.length} Kategorien</span>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Kategorien suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent text-sm"
                />
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-namuh-teal/10 text-namuh-teal border border-namuh-teal/20'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-sm">Alle Talente</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    {mockTalentEntries.length} Personen
                  </p>
                </motion.button>

                {mockCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-namuh-teal/10 text-namuh-teal border border-namuh-teal/20'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-1">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 ml-6">{category.description}</p>
                    <p className="text-xs text-gray-400 mt-1 ml-6">
                      {category.memberCount} Personen
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="card p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Talente durchsuchen..."
                    className="input-field pl-10"
                  />
                </div>
                <div className="flex gap-4">
                  <select className="input-field">
                    <option>Alle Rollen</option>
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>UX/UI Designer</option>
                    <option>Product Manager</option>
                  </select>
                  <button className="btn-outline flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Talent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockTalentEntries.map((talent, index) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  className="card p-6 hover:border-namuh-teal/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-namuh-navy text-sm">{talent.name}</h3>
                        <p className="text-gray-600 text-sm">{talent.role}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowDropdown(showDropdown === talent.id ? null : talent.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </motion.button>
                      
                      <AnimatePresence>
                        {showDropdown === talent.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                          >
                            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Eye className="h-4 w-4 mr-2" />
                              Vollständiges Profil
                            </button>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Nachricht senden
                            </button>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Edit className="h-4 w-4 mr-2" />
                              Notizen bearbeiten
                            </button>
                            <hr className="my-1" />
                            <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Entfernen
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="flex items-center mb-3">
                    <Target className="h-4 w-4 text-namuh-teal mr-2" />
                    <span className="text-sm text-gray-600">Match Score:</span>
                    <span className="ml-2 font-semibold text-namuh-teal">{talent.matchScore}%</span>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-namuh-teal h-2 rounded-full transition-all duration-500"
                        style={{ width: `${talent.matchScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {talent.experience} Erfahrung
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {talent.location}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {talent.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-namuh-teal/10 text-namuh-teal px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {talent.skills.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{talent.skills.length - 3} weitere
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {talent.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 line-clamp-2 italic">
                        "{talent.notes}"
                      </p>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Hinzugefügt: {talent.addedDate.toLocaleDateString('de-DE')}
                    </div>
                    {talent.lastContact && (
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Kontakt: {talent.lastContact.toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      Profil anzeigen
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-outline p-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-outline p-2"
                    >
                      <Star className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {mockTalentEntries.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ihr Talent Pool ist leer
                </h3>
                <p className="text-gray-500 mb-6">
                  Beginnen Sie damit, qualifizierte Kandidaten zu Ihrem Talent Pool hinzuzufügen.
                </p>
                <button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Talent hinzufügen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};