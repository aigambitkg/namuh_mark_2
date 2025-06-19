import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Users, 
  Building2, 
  Star,
  ArrowRight,
  Coins,
  Globe,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

// Lazy load heavy components
const FAQ = lazy(() => import('./FAQ'));
const TokenPackages = lazy(() => import('./TokenPackages'));

// Optimized loading component
const ComponentLoader = React.memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-namuh-teal"></div>
  </div>
));

// Memoized tier data
const APPLICANT_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Kostenlos',
    monthly: 0,
    description: 'Perfekt für den Einstieg in die Jobsuche',
    popular: false,
    color: 'border-gray-200',
    buttonClass: 'btn-outline',
    features: {
      'KI-Anwendungen (Tokens)': '20 Tokens / Monat',
      'Dokumenten-Speicher': '5 Dokumente (max. 10 MB/Dokument)',
      'Bewerbungshistorie': 'Letzte 5 Bewerbungen',
      'Profilverwaltung': true,
      'Jobsuche & Bewerbung': true,
      'Dashboard (Übersicht)': true,
      'Quiz-Me': 'Verbraucht Tokens',
      'Anschreiben Generator': 'Verbraucht Tokens',
      'CV Matcher': 'Verbraucht Tokens',
      'Dokumenten-Analyse': 'Verbraucht Tokens',
      'CV Creator (Text)': 'Verbraucht Tokens',
      'CV Creator (Visuell)': false,
      'Talent Pool Sichtbarkeit': true,
      'Kostenlose Chat Lobby': true,
      'Community Forum': 'Anonym',
      'Priority Support': false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '€2,99',
    monthly: 2.99,
    description: 'Erweiterte Tools für ernsthafte Jobsuchende',
    popular: true,
    color: 'border-namuh-teal shadow-lg shadow-namuh-teal/20',
    buttonClass: 'btn-primary',
    features: {
      'KI-Anwendungen (Tokens)': '50 Tokens / Monat',
      'Dokumenten-Speicher': '20 Dokumente (max. 25 MB/Dokument)',
      'Bewerbungshistorie': 'Unbegrenzt',
      'Profilverwaltung': true,
      'Jobsuche & Bewerbung': true,
      'Dashboard (Übersicht)': true,
      'Quiz-Me': 'Verbraucht Tokens',
      'Anschreiben Generator': 'Verbraucht Tokens',
      'CV Matcher': 'Verbraucht Tokens',
      'Dokumenten-Analyse': 'Verbraucht Tokens',
      'CV Creator (Text)': 'Verbraucht Tokens',
      'CV Creator (Visuell)': 'Verbraucht Tokens',
      'Talent Pool Sichtbarkeit': true,
      'Kostenlose Chat Lobby': true,
      'Community Forum': 'Anonym',
      'Priority Support': true
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€8,99',
    monthly: 8.99,
    description: 'Vollständiger Zugang zu allen Features',
    popular: false,
    color: 'border-namuh-navy',
    buttonClass: 'bg-namuh-navy hover:bg-namuh-navy/90 text-white',
    features: {
      'KI-Anwendungen (Tokens)': '150 Tokens / Monat',
      'Dokumenten-Speicher': '50 Dokumente (max. 50 MB/Dokument)',
      'Bewerbungshistorie': 'Unbegrenzt (mit Notizen & Status)',
      'Profilverwaltung': true,
      'Jobsuche & Bewerbung': true,
      'Dashboard (Übersicht)': true,
      'Quiz-Me': 'Verbraucht Tokens',
      'Anschreiben Generator': 'Verbraucht Tokens',
      'CV Matcher': 'Verbraucht Tokens',
      'Dokumenten-Analyse': 'Verbraucht Tokens',
      'CV Creator (Text)': 'Verbraucht Tokens',
      'CV Creator (Visuell)': 'Verbraucht Tokens',
      'Talent Pool Sichtbarkeit': true,
      'Kostenlose Chat Lobby': true,
      'Community Forum': 'Anonym, mit Profilverknüpfung optional',
      'Priority Support': true
    }
  }
];

const RECRUITER_TIERS = [
  {
    id: 'basis',
    name: 'Basis',
    price: 'Kostenlos',
    monthly: 0,
    description: 'Grundlegende Recruiting-Funktionen',
    popular: false,
    color: 'border-gray-200',
    buttonClass: 'btn-outline',
    features: {
      'Gleichzeitige Stellenanzeigen': '2',
      'Gesamter Bewerber-Datenspeicher': '1 GB',
      'Unternehmensprofil-Medien': '25 MB',
      'KI-Anwendungen (Tokens)': false,
      'Multiposting Funktion': 'Servicepauschale €59,99 pro Posting',
      'Unternehmensprofil': true,
      'Bewerbermanagement': 'Grundfunktionen',
      'Profil Matcher Suchen': false,
      'Kommunikations-Templates': false,
      'Newsletter- & Update-Management': false,
      'Recruiter-Dashboard': true,
      'Statistiken & Analyse': false,
      'Archivierte Job-Analyse': false,
      'Chat Lobby': true,
      'Community Forum': true,
      'Personalberatungsservice': false,
      'Landingpage für Unternehmen': false,
      'Zugeschnittene APIs (HRM)': false,
      'Team-Mitglieder': '1 Nutzer',
      'Dedicated Account Manager': false
    }
  },
  {
    id: 'starter',
    name: 'Starter Business',
    price: {
      monthly: '€49,99',
      yearly: '€46,99'
    },
    monthly: 49.99,
    yearlyPrice: 46.99,
    description: 'Ideal für kleine Teams und Startups',
    popular: true,
    color: 'border-namuh-teal shadow-lg shadow-namuh-teal/20',
    buttonClass: 'btn-primary',
    features: {
      'Gleichzeitige Stellenanzeigen': 'Bis zu 7',
      'Gesamter Bewerber-Datenspeicher': '5 GB',
      'Unternehmensprofil-Medien': '100 MB',
      'KI-Anwendungen (Tokens)': 'Budget hinterlegt',
      'Multiposting Funktion': 'Ohne Servicepauschale',
      'Unternehmensprofil': true,
      'Bewerbermanagement': 'Vollumfänglich',
      'Profil Matcher Suchen': '10 Suchen / Monat',
      'Kommunikations-Templates': false,
      'Newsletter- & Update-Management': true,
      'Recruiter-Dashboard': true,
      'Statistiken & Analyse': 'Basis',
      'Archivierte Job-Analyse': true,
      'Chat Lobby': true,
      'Community Forum': true,
      'Personalberatungsservice': false,
      'Landingpage für Unternehmen': false,
      'Zugeschnittene APIs (HRM)': false,
      'Team-Mitglieder': '3 Nutzer',
      'Dedicated Account Manager': false
    }
  },
  {
    id: 'professional',
    name: 'Professional Business',
    price: {
      monthly: '€102,99',
      yearly: '€94,99'
    },
    monthly: 102.99,
    yearlyPrice: 94.99,
    description: 'Erweiterte Features für wachsende Unternehmen',
    popular: false,
    color: 'border-namuh-navy',
    buttonClass: 'bg-namuh-navy hover:bg-namuh-navy/90 text-white',
    features: {
      'Gleichzeitige Stellenanzeigen': 'Bis zu 20',
      'Gesamter Bewerber-Datenspeicher': '25 GB',
      'Unternehmensprofil-Medien': '500 MB',
      'KI-Anwendungen (Tokens)': 'Budget hinterlegt',
      'Multiposting Funktion': 'Ohne Servicepauschale',
      'Unternehmensprofil': true,
      'Bewerbermanagement': 'Vollumfänglich, Team-Funktionen',
      'Profil Matcher Suchen': '50 Suchen / Monat',
      'Kommunikations-Templates': true,
      'Newsletter- & Update-Management': true,
      'Recruiter-Dashboard': true,
      'Statistiken & Analyse': 'Vollumfänglich',
      'Archivierte Job-Analyse': true,
      'Chat Lobby': true,
      'Community Forum': true,
      'Personalberatungsservice': '12% Honorar',
      'Landingpage für Unternehmen': true,
      'Zugeschnittene APIs (HRM)': false,
      'Team-Mitglieder': '10 Nutzer',
      'Dedicated Account Manager': false
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: '€334,99',
      yearly: '€299,99'
    },
    monthly: 334.99,
    yearlyPrice: 299.99,
    description: 'Vollständige Lösung für große Unternehmen',
    popular: false,
    color: 'border-gradient-to-r from-namuh-teal to-namuh-navy',
    buttonClass: 'bg-gradient-to-r from-namuh-teal to-namuh-navy hover:from-namuh-teal-dark hover:to-namuh-navy text-white',
    features: {
      'Gleichzeitige Stellenanzeigen': 'Unbegrenzt',
      'Gesamter Bewerber-Datenspeicher': '100 GB (oder Unbegrenzt für Standardnutzung)',
      'Unternehmensprofil-Medien': '2 GB',
      'KI-Anwendungen (Tokens)': 'Budget hinterlegt',
      'Multiposting Funktion': 'Ohne Servicepauschale',
      'Unternehmensprofil': true,
      'Bewerbermanagement': 'Vollumfänglich, Team & API',
      'Profil Matcher Suchen': '200 Suchen / Monat',
      'Kommunikations-Templates': true,
      'Newsletter- & Update-Management': true,
      'Recruiter-Dashboard': true,
      'Statistiken & Analyse': 'Vollumfänglich',
      'Archivierte Job-Analyse': true,
      'Chat Lobby': true,
      'Community Forum': true,
      'Personalberatungsservice': '10% Honorar',
      'Landingpage für Unternehmen': true,
      'Zugeschnittene APIs (HRM)': true,
      'Team-Mitglieder': 'Unbegrenzt',
      'Dedicated Account Manager': true
    }
  }
];

// Optimized feature renderer with consistent alignment
const FeatureRenderer = React.memo<{ value: any }>(({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="flex justify-end">
        <Check className="h-4 w-4 text-green-600" />
      </div>
    ) : (
      <div className="flex justify-end">
        <X className="h-4 w-4 text-gray-400" />
      </div>
    );
  }
  return (
    <div className="text-right">
      <span className="text-xs text-gray-700 leading-tight">{value}</span>
    </div>
  );
});

// Optimized pricing card with table-like feature layout
const PricingCard = React.memo<{ tier: any; index: number }>(({ tier, index }) => {
  // Handle dual pricing display for recruiter tiers
  const showDualPricing = tier.price && typeof tier.price === 'object';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}
      className={`relative bg-white rounded-2xl p-5 md:p-6 border-2 transition-all duration-300 ${tier.color} ${
        tier.popular ? 'ring-2 ring-namuh-teal ring-offset-2' : ''
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-namuh-teal to-namuh-teal-dark text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>Beliebtester Plan</span>
          </div>
        </div>
      )}

      <div className="text-center mb-5">
        <h3 className="text-xl font-bold text-namuh-navy mb-1">{tier.name}</h3>
        <p className="text-xs text-gray-600 mb-3 h-8 flex items-center justify-center">{tier.description}</p>
        <div className="mb-3">
          {showDualPricing ? (
            <div>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-namuh-navy">{tier.price.monthly}</span>
                <span className="text-xs text-gray-500 ml-1">/Monat</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                oder {tier.price.yearly}/Monat bei Jahreszahlung
              </div>
            </div>
          ) : (
            <div>
              <span className="text-2xl font-bold text-namuh-navy">{tier.price}</span>
              {tier.monthly > 0 && <span className="text-xs text-gray-500 ml-1">/Monat</span>}
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 max-h-80 overflow-y-auto px-1 scrollbar-thin">
        <table className="w-full">
          <tbody>
            {Object.entries(tier.features).map(([feature, value], i) => (
              <tr key={feature} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="py-1.5 pl-2 text-left">
                  <span className="text-xs text-gray-700 leading-tight">{feature}</span>
                </td>
                <td className="py-1.5 pr-2 w-1/2 text-right">
                  <FeatureRenderer value={value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-2 px-4 text-sm rounded-lg font-medium transition-all duration-200 ${tier.buttonClass}`}
      >
        {tier.monthly === 0 ? 'Kostenlos starten' : 'Plan auswählen'}
      </motion.button>
    </motion.div>
  );
});

export const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applicant' | 'recruiter'>('applicant');
  const { user } = useAuthStore();

  // Determine if user is a recruiter
  const isRecruiter = user?.role === 'recruiter' || activeTab === 'recruiter';

  // Memoized tier selection
  const currentTiers = useMemo(() => 
    activeTab === 'applicant' ? APPLICANT_TIERS : RECRUITER_TIERS
  , [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-namuh-navy mb-4">
            Transparente Preise für jeden Bedarf
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Wählen Sie den Plan, der perfekt zu Ihren Zielen passt. 
            Keine versteckten Kosten, jederzeit kündbar.
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('applicant')}
              className={`px-4 py-2 text-sm sm:px-5 sm:py-2.5 rounded-md font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${
                activeTab === 'applicant'
                  ? 'bg-namuh-teal text-white shadow-sm'
                  : 'text-gray-600 hover:text-namuh-teal'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Für Bewerbende</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('recruiter')}
              className={`px-4 py-2 text-sm sm:px-5 sm:py-2.5 rounded-md font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${
                activeTab === 'recruiter'
                  ? 'bg-namuh-teal text-white shadow-sm'
                  : 'text-gray-600 hover:text-namuh-teal'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Für Recruiter & Unternehmen</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        {activeTab === 'applicant' ? (
          // Applicant pricing - 3 columns on large screens
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {APPLICANT_TIERS.map((tier, index) => (
              <PricingCard key={tier.id} tier={tier} index={index} />
            ))}
          </div>
        ) : (
          // Recruiter pricing - always max 2 columns
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {RECRUITER_TIERS.slice(0, 2).map((tier, index) => (
              <PricingCard key={tier.id} tier={tier} index={index} />
            ))}
            
            <div className="md:col-span-2 h-8"></div>
            
            {RECRUITER_TIERS.slice(2, 4).map((tier, index) => (
              <PricingCard key={tier.id} tier={tier} index={index + 2} />
            ))}
          </div>
        )}

        {/* Additional Offerings - Lazy Loaded - Only for applicants */}
        {!isRecruiter && (
          <Suspense fallback={<ComponentLoader />}>
            <TokenPackages />
          </Suspense>
        )}

        {/* FAQ Section - Lazy Loaded */}
        <Suspense fallback={<ComponentLoader />}>
          <FAQ />
        </Suspense>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="card p-8 sm:p-12 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-namuh-navy mb-4 sm:mb-6">
              Bereit, Ihre Karriere voranzutreiben?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Schließen Sie sich Tausenden von Fachkräften an, die bereits mit namuH erfolgreich sind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link to="/demo" className="btn-outline text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center">
                Demo anfordern
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};