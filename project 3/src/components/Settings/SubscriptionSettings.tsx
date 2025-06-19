import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Zap, 
  Shield, 
  Check, 
  X, 
  Crown, 
  Download, 
  DollarSign, 
  AlertTriangle, 
  Clock,
  Users,
  PlusCircle,
  Info,
  Settings,
  RefreshCw,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { SettingsSidebar } from './SettingsSidebar';

// Types for subscription information
interface SubscriptionDetails {
  tier: string;
  name: string;
  price: string;
  renewalDate: string;
  features: string[];
  tokenBalance?: number;
  nextRefreshDate?: string;
}

// Token package for applicants
interface TokenPackage {
  id: string;
  tokens: number;
  price: string;
  popular?: boolean;
}

interface BudgetTransaction {
  id: string;
  date: Date;
  amount: number;
  type: 'deposit' | 'usage';
  description: string;
}

export const SubscriptionSettings: React.FC = () => {
  const { user } = useAuthStore();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showTokenPurchase, setShowTokenPurchase] = useState(false);
  const [showBudgetDeposit, setShowBudgetDeposit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const isApplicant = user?.role === 'applicant';
  
  // Current subscription details based on user role
  const currentSubscription: SubscriptionDetails = isApplicant
    ? {
        tier: user?.tier || 'applicant_starter',
        name: getTierName(user?.tier || 'applicant_starter'),
        price: getTierPrice(user?.tier || 'applicant_starter'),
        renewalDate: '15.02.2025', // Example date
        features: getSubscriptionFeatures(user?.tier || 'applicant_starter'),
        tokenBalance: user?.tokenBalance || 0,
        nextRefreshDate: '01.02.2025'
      }
    : {
        tier: user?.tier || 'recruiter_basis',
        name: getTierName(user?.tier || 'recruiter_basis'),
        price: getTierPrice(user?.tier || 'recruiter_basis'),
        renewalDate: '15.02.2025', // Example date
        features: getSubscriptionFeatures(user?.tier || 'recruiter_basis')
      };
  
  // Token packages for applicants
  const tokenPackages: TokenPackage[] = [
    { id: 'small', tokens: 10, price: '€2,99' },
    { id: 'medium', tokens: 20, price: '€4,99', popular: true },
    { id: 'large', tokens: 50, price: '€9,99' }
  ];
  
  // Budget transactions for recruiters
  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>([
    {
      id: '1',
      date: new Date(2024, 0, 15),
      amount: 100,
      type: 'deposit',
      description: 'Budget deposit'
    },
    {
      id: '2',
      date: new Date(2024, 0, 20),
      amount: -15,
      type: 'usage',
      description: 'Multiposting campaign'
    },
    {
      id: '3',
      date: new Date(2024, 0, 25),
      amount: -10,
      type: 'usage',
      description: 'Featured job post'
    },
    {
      id: '4',
      date: new Date(2024, 1, 5),
      amount: 50,
      type: 'deposit',
      description: 'Additional budget deposit'
    }
  ]);
  
  // Calculate current budget balance
  const currentBudget = budgetTransactions.reduce((total, transaction) => 
    total + transaction.amount, 0);
  
  // Pricing tiers based on role
  const pricingTiers = isApplicant
    ? [
        {
          id: 'applicant_starter',
          name: 'Starter',
          price: 'Kostenlos',
          popular: false,
          features: {
            'KI-Anwendungen (Tokens)': '20 Tokens / Monat',
            'Dokumenten-Speicher': '5 Dokumente (max. 10 MB/Dokument)',
            'Bewerbungshistorie': 'Letzte 5 Bewerbungen',
            'Profilverwaltung': true,
            'Jobsuche & Bewerbung': true,
            'Dashboard (Übersicht)': true,
            'Quiz-Me': 'Verbraucht Tokens',
            'CV Matcher': 'Verbraucht Tokens',
            'Talent Pool Sichtbarkeit': true
          }
        },
        {
          id: 'applicant_professional',
          name: 'Professional',
          price: '€2,99',
          popular: true,
          features: {
            'KI-Anwendungen (Tokens)': '50 Tokens / Monat',
            'Dokumenten-Speicher': '20 Dokumente (max. 25 MB/Dokument)',
            'Bewerbungshistorie': 'Unbegrenzt',
            'Profilverwaltung': true,
            'Jobsuche & Bewerbung': true,
            'Dashboard (Übersicht)': true,
            'Quiz-Me': 'Verbraucht Tokens',
            'CV Matcher': 'Verbraucht Tokens',
            'Talent Pool Sichtbarkeit': true
          }
        },
        {
          id: 'applicant_premium',
          name: 'Premium',
          price: '€8,99',
          popular: false,
          features: {
            'KI-Anwendungen (Tokens)': '150 Tokens / Monat',
            'Dokumenten-Speicher': '50 Dokumente (max. 50 MB/Dokument)',
            'Bewerbungshistorie': 'Unbegrenzt (mit Notizen & Status)',
            'Profilverwaltung': true,
            'Jobsuche & Bewerbung': true,
            'Dashboard (Übersicht)': true,
            'Quiz-Me': 'Verbraucht Tokens',
            'CV Matcher': 'Verbraucht Tokens',
            'Talent Pool Sichtbarkeit': true
          }
        }
      ]
    : [
        {
          id: 'recruiter_basis',
          name: 'Basis',
          price: 'Kostenlos',
          popular: false,
          features: {
            'Gleichzeitige Stellenanzeigen': '2',
            'Gesamter Bewerber-Datenspeicher': '1 GB',
            'Unternehmensprofil-Medien': '25 MB',
            'Multiposting Funktion': 'Servicepauschale €59,99 pro Posting',
            'Unternehmensprofil': true,
            'Bewerbermanagement': 'Grundfunktionen',
            'Team-Mitglieder': '1 Nutzer'
          }
        },
        {
          id: 'recruiter_starter',
          name: 'Starter Business',
          price: '€49,99',
          popular: true,
          features: {
            'Gleichzeitige Stellenanzeigen': 'Bis zu 7',
            'Gesamter Bewerber-Datenspeicher': '5 GB',
            'Unternehmensprofil-Medien': '100 MB',
            'Budget hinterlegen': true,
            'Multiposting Funktion': 'Ohne Servicepauschale',
            'Unternehmensprofil': true,
            'Bewerbermanagement': 'Vollumfänglich',
            'Team-Mitglieder': '3 Nutzer'
          }
        },
        {
          id: 'recruiter_professional',
          name: 'Professional Business',
          price: '€102,99',
          popular: false,
          features: {
            'Gleichzeitige Stellenanzeigen': 'Bis zu 20',
            'Gesamter Bewerber-Datenspeicher': '25 GB',
            'Unternehmensprofil-Medien': '500 MB',
            'Budget hinterlegen': true,
            'Multiposting Funktion': 'Ohne Servicepauschale',
            'Bewerbermanagement': 'Vollumfänglich, Team-Funktionen',
            'Team-Mitglieder': '10 Nutzer'
          }
        }
      ];
  
  function getTierName(tier: string): string {
    const tierMap: Record<string, string> = {
      'applicant_starter': 'Starter',
      'applicant_professional': 'Professional',
      'applicant_premium': 'Premium',
      'recruiter_basis': 'Basis',
      'recruiter_starter': 'Starter Business',
      'recruiter_professional': 'Professional Business',
      'recruiter_enterprise': 'Enterprise'
    };
    
    return tierMap[tier] || 'Unbekannt';
  }
  
  function getTierPrice(tier: string): string {
    const tierMap: Record<string, string> = {
      'applicant_starter': 'Kostenlos',
      'applicant_professional': '€2,99 / Monat',
      'applicant_premium': '€8,99 / Monat',
      'recruiter_basis': 'Kostenlos',
      'recruiter_starter': '€49,99 / Monat',
      'recruiter_professional': '€102,99 / Monat',
      'recruiter_enterprise': '€334,99 / Monat'
    };
    
    return tierMap[tier] || 'Unbekannt';
  }
  
  function getSubscriptionFeatures(tier: string): string[] {
    const tierFeaturesMap: Record<string, string[]> = {
      'applicant_starter': [
        '20 Tokens / Monat',
        'Dokumentenspeicher: 5 Dokumente',
        'Bewerbungshistorie: 5 Bewerbungen',
        'Kostenlose Chat Lobby'
      ],
      'applicant_professional': [
        '50 Tokens / Monat',
        'Dokumentenspeicher: 20 Dokumente',
        'Unbegrenzte Bewerbungshistorie',
        'Priority Support'
      ],
      'applicant_premium': [
        '150 Tokens / Monat',
        'Dokumentenspeicher: 50 Dokumente',
        'Erweiterte Bewerbungsverwaltung mit Notizen',
        'Priority Support'
      ],
      'recruiter_basis': [
        'Bis zu 2 aktive Stellen',
        '1 GB Datenspeicher',
        'Grundlegende Bewerber-verwaltung',
        'Multiposting mit Servicepauschale'
      ],
      'recruiter_starter': [
        'Bis zu 7 aktive Stellen',
        '5 GB Datenspeicher',
        'Multiposting ohne Servicepauschale',
        'Bis zu 3 Team-Mitglieder'
      ],
      'recruiter_professional': [
        'Bis zu 20 aktive Stellen',
        '25 GB Datenspeicher',
        'Erweiterte Bewerber-verwaltung',
        'Bis zu 10 Team-Mitglieder'
      ],
      'recruiter_enterprise': [
        'Unbegrenzte aktive Stellen',
        '100 GB Datenspeicher',
        'API-Integrationen',
        'Unbegrenzte Team-Mitglieder'
      ]
    };
    
    return tierFeaturesMap[tier] || ['Standardfeatures'];
  }

  // Handle token purchase
  const handleTokenPurchase = (packageId: string) => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowTokenPurchase(false);
      
      // Would normally update token balance in the store
      console.log(`Purchased token package: ${packageId}`);
      
      // Alert for demo purposes
      alert(`Token-Paket erfolgreich gekauft! Ihre Tokens wurden gutgeschrieben.`);
    }, 2000);
  };
  
  // Handle budget deposit
  const handleBudgetDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowBudgetDeposit(false);
      
      // Add the new transaction
      const newTransaction: BudgetTransaction = {
        id: Date.now().toString(),
        date: new Date(),
        amount: parseFloat(depositAmount),
        type: 'deposit',
        description: 'Budget deposit'
      };
      
      setBudgetTransactions([newTransaction, ...budgetTransactions]);
      setDepositAmount('');
      
      // Alert for demo purposes
      alert(`Budget erfolgreich aufgeladen: €${depositAmount}`);
    }, 2000);
  };
  
  // Function to render token package card
  const renderTokenPackage = (pkg: TokenPackage) => (
    <motion.div
      key={pkg.id}
      whileHover={{ scale: 1.03 }}
      className={`relative border-2 rounded-xl p-6 text-center ${
        pkg.popular
          ? 'border-namuh-teal bg-namuh-teal/5'
          : 'border-gray-200 hover:border-namuh-teal/50'
      }`}
    >
      {pkg.popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-namuh-teal text-white px-3 py-1 rounded-full text-xs">
            Am beliebtesten
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className="text-3xl font-bold text-namuh-navy">
          {pkg.tokens} <span className="text-lg">Tokens</span>
        </div>
        <div className="text-xl text-namuh-teal font-semibold mt-1">{pkg.price}</div>
      </div>
      
      <button
        onClick={() => handleTokenPurchase(pkg.id)}
        className={`w-full py-2 rounded-lg font-medium ${
          pkg.popular ? 'bg-namuh-teal text-white' : 'bg-white border border-gray-200 text-namuh-navy'
        }`}
      >
        Jetzt kaufen
      </button>
    </motion.div>
  );
  
  // Function to render a pricing tier card
  const renderPricingTier = (tier: any) => (
    <motion.div
      key={tier.id}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white rounded-xl p-6 border-2 transition-all ${
        currentSubscription.tier === tier.id
          ? 'border-namuh-teal bg-namuh-teal/5'
          : tier.popular
          ? 'border-namuh-navy shadow-md'
          : 'border-gray-200'
      }`}
    >
      {currentSubscription.tier === tier.id && (
        <div className="absolute top-0 right-0 bg-namuh-teal text-white p-1 px-2 rounded-bl-lg rounded-tr-lg text-xs font-medium">
          Aktuell
        </div>
      )}
      
      {tier.popular && currentSubscription.tier !== tier.id && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-namuh-navy text-white px-3 py-1 rounded-full text-xs">
            Empfohlen
          </div>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-namuh-navy">{tier.name}</h3>
        <div className="mt-2">
          <span className="text-2xl font-bold text-namuh-teal">{tier.price}</span>
          {tier.price !== 'Kostenlos' && <span className="text-sm text-gray-500 ml-1">/Monat</span>}
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {Object.entries(tier.features).map(([feature, value], index) => (
          <div key={index} className="flex items-start">
            {typeof value === 'boolean' ? (
              value ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              )
            ) : (
              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div className="flex justify-between w-full">
              <span className="text-sm text-gray-700">{feature}</span>
              {typeof value !== 'boolean' && (
                <span className="text-sm font-medium">{value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        {currentSubscription.tier === tier.id ? (
          <button 
            className="btn-outline w-full"
            onClick={() => setShowCancelDialog(true)}
          >
            Abo kündigen
          </button>
        ) : (
          <button className="btn-primary w-full">
            {tier.price === 'Kostenlos' ? 'Downgraden' : 'Upgraden'}
          </button>
        )}
      </div>
    </motion.div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">Abonnement & Zahlungen</h1>
          <p className="mt-2 text-gray-600">
            Verwalten Sie Ihr Abonnement, Tokens und Zahlungsinformationen.
          </p>
        </div>
        
        {/* Layout with Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <SettingsSidebar />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Current Subscription Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-namuh-navy flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Aktuelles Abonnement
                </h2>
                
                <div className="flex items-center">
                  <div className="bg-namuh-teal/10 text-namuh-teal px-3 py-1 rounded-full text-sm font-medium">
                    Aktiv
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Plan</div>
                  <div className="font-semibold text-lg text-namuh-navy mb-2">
                    {currentSubscription.name}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-1">Preis</div>
                  <div className="font-semibold text-namuh-navy mb-2">
                    {currentSubscription.price}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-1">Nächste Verlängerung</div>
                  <div className="font-semibold text-namuh-navy mb-4">
                    {currentSubscription.renewalDate}
                  </div>
                  
                  <button 
                    onClick={() => setShowCancelDialog(true)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Abonnement kündigen
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 mb-2">Enthaltene Features:</div>
                  {currentSubscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Token Balance for Applicants */}
            {isApplicant && (
              <div className="card p-6 bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-namuh-navy flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-namuh-teal" />
                    Token Balance
                  </h2>
                  
                  <button 
                    onClick={() => setShowTokenPurchase(true)}
                    className="btn-primary text-sm"
                  >
                    Tokens kaufen
                  </button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-namuh-teal/20 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-namuh-teal mb-2">{currentSubscription.tokenBalance}</div>
                    <div className="text-sm text-gray-600">Verfügbare Tokens</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-namuh-teal/20">
                    <div className="text-sm text-gray-500 mb-1">Nächste Aufladung</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-namuh-teal mr-2" />
                      <div className="font-medium">{currentSubscription.nextRefreshDate}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Tokens werden monatlich gemäß Ihres Abonnements aufgeladen.
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-namuh-teal/20">
                    <div className="text-sm text-gray-500 mb-1">Monatliches Token-Guthaben</div>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-namuh-teal mr-2" />
                      <div className="font-medium">
                        {isApplicant && (
                          <>
                            {user?.tier === 'applicant_starter' && '20 Tokens'}
                            {user?.tier === 'applicant_professional' && '50 Tokens'}
                            {user?.tier === 'applicant_premium' && '150 Tokens'}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Basierend auf Ihrem aktuellen {currentSubscription.name} Plan
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Budget Management for Recruiters */}
            {!isApplicant && (
              <div className="card p-6 bg-gradient-to-br from-namuh-navy/10 to-namuh-teal/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-namuh-navy flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-namuh-navy" />
                    Budget-Verwaltung
                  </h2>
                  
                  <button 
                    onClick={() => setShowBudgetDeposit(true)}
                    className="btn-primary text-sm"
                  >
                    Budget aufladen
                  </button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg border border-namuh-navy/20 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-namuh-navy mb-2">€{currentBudget.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Aktuelles Budget</div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-namuh-navy/20">
                    <div className="text-sm text-gray-500 mb-1">Letzter Monat ausgegeben</div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-namuh-navy mr-2" />
                      <div className="font-medium">€25.00</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Für Multiposting und Featured Jobs
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-namuh-navy/20">
                    <div className="text-sm text-gray-500 mb-1">Ausgleichsintervall</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-namuh-navy mr-2" />
                      <div className="font-medium">Monatlich</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Abrechnung zum 1. des Monats
                    </div>
                  </div>
                </div>
                
                {/* Budget Transactions */}
                <h3 className="text-lg font-medium text-namuh-navy mb-4">Budget Transaktionen</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschreibung</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Betrag</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {budgetTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.date.toLocaleDateString('de-DE')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}€{Math.abs(transaction.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Available Plans */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Verfügbare Pläne
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-4">
                {pricingTiers.map(tier => renderPricingTier(tier))}
              </div>
              
              <div className="text-center mt-6 text-sm text-gray-500">
                <p>
                  Alle Pläne beinhalten automatische Verlängerung. Sie können jederzeit kündigen.
                </p>
                <p className="mt-1">
                  Bei Fragen zu unseren Plänen kontaktieren Sie bitte unseren <a href="mailto:support@namuh.de" className="text-namuh-teal hover:underline">Kundensupport</a>.
                </p>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Zahlungsmethoden
              </h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-4">Keine Zahlungsmethode hinterlegt</p>
                <button className="btn-primary">
                  Zahlungsmethode hinzufügen
                </button>
              </div>
            </div>
            
            {/* Billing History */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Rechnungshistorie
              </h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-4">Keine Rechnungen verfügbar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Token Purchase Dialog */}
      {showTokenPurchase && isApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-namuh-navy mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-namuh-teal" />
              Tokens kaufen
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {tokenPackages.map(pkg => renderTokenPackage(pkg))}
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setShowTokenPurchase(false)}
                className="btn-outline"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Budget Deposit Dialog */}
      {showBudgetDeposit && !isApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-namuh-navy mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-namuh-navy" />
              Budget aufladen
            </h3>
            
            <form onSubmit={handleBudgetDeposit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betrag (€)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="input-field"
                  placeholder="z.B. 100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mindestbetrag: €10
                </p>
              </div>
              
              <div className="flex justify-between">
                <button 
                  type="button"
                  onClick={() => setShowBudgetDeposit(false)}
                  className="btn-outline"
                  disabled={isProcessing}
                >
                  Abbrechen
                </button>
                
                <button
                  type="submit"
                  disabled={!depositAmount || isProcessing}
                  className="btn-primary"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Wird bearbeitet...
                    </>
                  ) : (
                    'Jetzt aufladen'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Cancel Subscription Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Abonnement kündigen</h3>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Sind Sie sicher, dass Sie Ihr Abonnement kündigen möchten? Die folgenden Einschränkungen werden ab dem Ende Ihrer aktuellen Abrechnungsperiode gelten:
              </p>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                <h4 className="font-medium text-red-800 mb-2">Nach der Kündigung:</h4>
                <ul className="space-y-2 text-sm text-red-700">
                  {isApplicant ? (
                    <>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Sie verlieren Zugang zu Premium-Features und erhalten nur noch 20 Tokens pro Monat</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Ihr Dokumentenspeicher wird auf 5 Dokumente begrenzt</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Sie können nur noch 2 aktive Stellenanzeigen gleichzeitig schalten</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Multiposting ist nur noch mit Servicepauschale verfügbar</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <p className="text-sm text-gray-500">
                Ihr Abonnement läuft noch bis zum {currentSubscription.renewalDate}. Sie können Ihr Abo jederzeit vor diesem Datum wieder aktivieren.
              </p>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setShowCancelDialog(false)}
                className="btn-outline"
              >
                Zurück
              </button>
              
              <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Abonnement kündigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSettings;