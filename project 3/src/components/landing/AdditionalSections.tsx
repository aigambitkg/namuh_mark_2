import React from 'react';
import { Users, Building2, Shield, Lightbulb, Target, Briefcase as BriefcaseBusiness, BarChart3, Heart, Sparkles, BookOpen, FileText, Star, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AboutUsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-namuh-navy mb-6">
            Über uns
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            namuH wurde gegründet, um die Recruiting-Branche zu revolutionieren und eine neue Ära der Fairness, 
            Menschlichkeit und Transparenz einzuleiten.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-namuh-navy mb-4">Unsere Mission</h3>
            <p className="text-gray-600 mb-6">
              Wir glauben an eine Arbeitswelt, in der Talent und Potential über alles andere hinweg 
              anerkannt werden. Unsere Plattform verbindet qualifizierte Bewerber mit den richtigen 
              Möglichkeiten und hilft Unternehmen, die perfekten Mitarbeiter für ihre Teams zu finden.
            </p>

            <h3 className="text-2xl font-bold text-namuh-navy mb-4">Unsere Geschichte</h3>
            <p className="text-gray-600 mb-6">
              namuH wurde 2023 von einem Team aus Recruiting-Experten und Tech-Enthusiasten gegründet, 
              die die Frustration von Bewerbern und Recruitern gleichermaßen miterlebt haben. 
              Wir haben es uns zur Aufgabe gemacht, diesen Prozess zu verbessern und 
              eine transparentere, effizientere und menschlichere Alternative zu schaffen.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { title: 'Transparenz', icon: Shield, value: 'Wir glauben an vollständige Offenheit im Recruiting-Prozess.' },
              { title: 'Innovation', icon: Lightbulb, value: 'Wir nutzen KI, um das Beste aus Menschen herauszuholen, nicht um sie zu ersetzen.' },
              { title: 'Fairness', icon: Target, value: 'Gleiche Chancen für alle, basierend auf Fähigkeiten und Potenzial.' },
              { title: 'Menschlichkeit', icon: Heart, value: 'Wir vergessen nie die Menschen hinter den Lebensläufen.' }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="bg-namuh-teal/10 p-3 rounded-lg inline-flex mb-4">
                  <value.icon className="h-6 w-6 text-namuh-teal" />
                </div>
                <h4 className="text-lg font-semibold text-namuh-navy mb-2">{value.title}</h4>
                <p className="text-gray-600 text-sm">{value.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const ValueForApplicantsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-namuh-navy mb-6">
            Ihr Mehrwert als Bewerber
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            namuH bietet Ihnen innovative Tools und Features, um Ihre Karriere voranzutreiben 
            und den perfekten Job zu finden.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'KI-gestütztes Matching',
              description: 'Unsere Algorithmen analysieren Ihre Fähigkeiten und finden die Jobs, die wirklich zu Ihnen passen.',
              icon: Target,
              color: 'bg-blue-500'
            },
            {
              title: 'Transparente Prozesse',
              description: 'Verfolgen Sie den Status Ihrer Bewerbungen in Echtzeit und wissen Sie immer, wo Sie stehen.',
              icon: Shield,
              color: 'bg-green-500'
            },
            {
              title: 'Skill-Entwicklung',
              description: 'Identifizieren Sie Fähigkeitslücken und nutzen Sie unsere KI-Tools, um Ihr Profil zu optimieren.',
              icon: BarChart3,
              color: 'bg-purple-500'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
            >
              <div className={`${feature.color} p-4 rounded-xl mb-6 inline-block`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-namuh-navy mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link to="/register" className="btn-primary text-lg inline-flex items-center">
            Kostenlos starten
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export const ValueForCompaniesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-namuh-navy mb-6">
            Ihr Mehrwert als Unternehmen
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            namuH unterstützt Ihr Recruiting-Team mit innovativen Lösungen, um die besten Talente zu finden und zu binden.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Qualifizierte Kandidaten',
              description: 'Erreichen Sie Bewerber, die wirklich zu Ihrer Stelle passen.',
              icon: Target,
              stat: '73%',
              statLabel: 'höhere Qualitätsrate'
            },
            {
              title: 'Zeit sparen',
              description: 'Automatisieren Sie repetitive Aufgaben im Bewerbungsprozess.',
              icon: Clock,
              stat: '68%',
              statLabel: 'weniger Zeitaufwand'
            },
            {
              title: 'Datengetriebene Entscheidungen',
              description: 'Nutzen Sie Analysen und KI-Insights für bessere Entscheidungen.',
              icon: BarChart3,
              stat: '85%',
              statLabel: 'genauere Vorhersagen'
            },
            {
              title: 'Employer Branding',
              description: 'Präsentieren Sie Ihr Unternehmen authentisch und attraktiv.',
              icon: Building2,
              stat: '47%',
              statLabel: 'mehr Sichtbarkeit'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <feature.icon className="h-8 w-8 text-namuh-teal" />
                <div className="bg-namuh-teal/10 px-3 py-1.5 rounded-full">
                  <span className="text-namuh-teal font-bold">{feature.stat}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-namuh-navy mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
              <div className="text-xs text-gray-500">{feature.statLabel}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link to="/pricing" className="btn-primary bg-namuh-navy hover:bg-namuh-navy-dark text-lg inline-flex items-center">
            Preisübersicht anzeigen
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export const OurSolutionSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-namuh-navy mb-6">
            Unsere Lösung für beide Seiten
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            namuH verbindet Bewerber und Unternehmen durch innovative Technologie und menschenzentrierte Prozesse
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-namuh-teal to-namuh-navy transform -translate-y-1/2 rounded-full"></div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-16 relative">
            {/* Applicants */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-8 shadow-md border border-gray-200 z-10"
            >
              <div className="bg-namuh-teal/10 p-4 rounded-full inline-block mb-6">
                <Users className="h-8 w-8 text-namuh-teal" />
              </div>
              <h3 className="text-2xl font-bold text-namuh-navy mb-4">Bewerber</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Passende Stellenangebote finden</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Bewerbungen einfach verwalten</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Karriererelevante KI-Tools nutzen</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Von Transparenz profitieren</p>
                </div>
              </div>
            </motion.div>
            
            {/* namuH Platform */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-namuh-teal to-namuh-navy text-white rounded-xl p-8 shadow-xl z-20 lg:transform lg:-translate-y-6"
            >
              <div className="bg-white/20 p-4 rounded-full inline-block mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">namuH Plattform</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-300 mt-0.5 mr-3 flex-shrink-0" />
                  <p>KI-gestütztes Matching</p>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-300 mt-0.5 mr-3 flex-shrink-0" />
                  <p>Transparente Prozesse</p>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-300 mt-0.5 mr-3 flex-shrink-0" />
                  <p>Anonymisierte Bewertungen</p>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-300 mt-0.5 mr-3 flex-shrink-0" />
                  <p>Community & Austausch</p>
                </div>
                <div className="flex items-start">
                  <Star className="h-5 w-5 text-yellow-300 mt-0.5 mr-3 flex-shrink-0" />
                  <p>Datengestützte Insights</p>
                </div>
              </div>
            </motion.div>
            
            {/* Companies */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-8 shadow-md border border-gray-200 z-10"
            >
              <div className="bg-namuh-navy/10 p-4 rounded-full inline-block mb-6">
                <BriefcaseBusiness className="h-8 w-8 text-namuh-navy" />
              </div>
              <h3 className="text-2xl font-bold text-namuh-navy mb-4">Unternehmen</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Qualifizierte Kandidaten finden</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Rekrutierungsprozesse optimieren</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Datengetriebene Entscheidungen</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700">Employer Branding stärken</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-namuh-navy max-w-3xl mx-auto mb-8">
            Bei namuH arbeiten wir kontinuierlich daran, die Recruiting-Branche zu revolutionieren und 
            ein Ökosystem zu schaffen, von dem beide Seiten profitieren.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="btn-primary">
              Jobs entdecken
            </Link>
            <Link to="/pricing" className="btn-outline">
              Preispläne vergleichen
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const MediaDataSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50" id="mediadaten">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-namuh-navy mb-4">
            Mediadaten
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hier finden Sie Informationen für Presse, Partner und alle, die mehr über namuH erfahren möchten
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-namuh-navy mb-4">Unternehmensdaten</h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-medium">Firmenname:</p>
                <p>namuH GmbH</p>
              </div>
              <div>
                <p className="font-medium">Gründungsjahr:</p>
                <p>2023</p>
              </div>
              <div>
                <p className="font-medium">Geschäftsführung:</p>
                <p>Dr. Max Mustermann, Anna Schmidt</p>
              </div>
              <div>
                <p className="font-medium">Mitarbeiterzahl:</p>
                <p>28 Vollzeitmitarbeiter</p>
              </div>
              <div>
                <p className="font-medium">Hauptsitz:</p>
                <p>Berlin, Deutschland</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-bold text-namuh-navy mb-4">Pressekontakt</h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-medium">Ansprechpartner:</p>
                <p>Sarah Weber</p>
              </div>
              <div>
                <p className="font-medium">Position:</p>
                <p>Head of Communications</p>
              </div>
              <div>
                <p className="font-medium">E-Mail:</p>
                <a href="mailto:presse@namuh.de" className="text-namuh-teal hover:underline">presse@namuh.de</a>
              </div>
              <div>
                <p className="font-medium">Telefon:</p>
                <p>+49 (0) 30 1234 5678</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl p-8 shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-namuh-navy mb-4">Logo & Branding</h3>
          <p className="text-gray-700 mb-6">
            Unsere Markenelemente stehen für autorisierte Medienvertreter und Partner zum Download zur Verfügung. 
            Bitte beachten Sie unsere Nutzungsrichtlinien bei der Verwendung.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-namuh-navy rounded-lg flex items-center justify-center text-white text-3xl font-bold">nH</div>
              <p className="text-gray-700 font-medium">Logo (PNG)</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-namuh-teal rounded-lg flex items-center justify-center text-white text-3xl font-bold">nH</div>
              <p className="text-gray-700 font-medium">Logo (SVG)</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <div className="w-full h-12 bg-gradient-to-r from-namuh-teal to-namuh-navy"></div>
              </div>
              <p className="text-gray-700 font-medium">Farbpalette</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="btn-outline">
              Press Kit herunterladen
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const LegalSections: React.FC = () => {
  return (
    <div id="legal-sections">
      <section id="datenschutz" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-namuh-navy mb-8">Datenschutz</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Datenschutzerklärung</h3>
            
            <p className="mb-4">
              Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. In dieser Datenschutzerklärung informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website und unserer Dienstleistungen.
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Verantwortliche Stelle</h4>
            <p className="mb-4">
              Verantwortlich für die Erhebung, Verarbeitung und Nutzung Ihrer personenbezogenen Daten im Sinne der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG) ist:
            </p>
            <p className="mb-4">
              namuH GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Deutschland<br />
              E-Mail: datenschutz@namuh.de<br />
              Telefon: +49 (0) 123 456 789
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Datenschutzbeauftragter</h4>
            <p className="mb-4">
              Bei Fragen zum Datenschutz können Sie sich jederzeit an unseren Datenschutzbeauftragten wenden:
            </p>
            <p className="mb-4">
              Dr. Maria Schmidt<br />
              E-Mail: datenschutzbeauftragter@namuh.de
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Erhebung und Speicherung personenbezogener Daten</h4>
            <p className="mb-4">
              Wenn Sie unsere Website besuchen, erheben wir automatisch bestimmte technische Informationen, wie z.B. die IP-Adresse, Datum und Uhrzeit der Anfrage, Browser-Typ und -version, Betriebssystem und ähnliche technische Informationen. Diese Daten werden automatisch in unseren Server-Logfiles gespeichert.
            </p>
            <p className="mb-4">
              Wenn Sie sich auf unserer Plattform registrieren, erheben wir zusätzlich personenbezogene Daten wie Ihren Namen, Ihre E-Mail-Adresse, Telefonnummer und weitere Informationen, die für die Nutzung unserer Dienste erforderlich sind.
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Zwecke der Datenverarbeitung</h4>
            <p className="mb-4">
              Wir verarbeiten Ihre personenbezogenen Daten für folgende Zwecke:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Zur Bereitstellung und Optimierung unserer Website und Dienste</li>
              <li>Zur Durchführung von Vermittlungsprozessen zwischen Bewerbern und Unternehmen</li>
              <li>Zur Kommunikation mit Ihnen bezüglich Ihrer Anfragen, Bewerbungen oder Stellenangebote</li>
              <li>Zur Verbesserung unserer Dienstleistungen und für interne Analysen</li>
              <li>Zur Erfüllung gesetzlicher Verpflichtungen</li>
            </ul>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Rechtsgrundlage der Verarbeitung</h4>
            <p className="mb-4">
              Die Rechtsgrundlage für die Verarbeitung Ihrer Daten ist in der Regel Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO, die Erfüllung eines Vertrages gemäß Art. 6 Abs. 1 lit. b DSGVO oder unser berechtigtes Interesse gemäß Art. 6 Abs. 1 lit. f DSGVO.
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Speicherdauer</h4>
            <p className="mb-4">
              Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Zwecke, für die sie erhoben wurden, erforderlich ist oder solange gesetzliche Aufbewahrungsfristen bestehen.
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Ihre Rechte</h4>
            <p className="mb-4">
              Sie haben jederzeit das Recht:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu verlangen (Art. 15 DSGVO)</li>
              <li>Die Berichtigung unrichtiger oder unvollständiger Daten zu verlangen (Art. 16 DSGVO)</li>
              <li>Die Löschung Ihrer bei uns gespeicherten Daten zu verlangen (Art. 17 DSGVO)</li>
              <li>Die Einschränkung der Datenverarbeitung zu verlangen (Art. 18 DSGVO)</li>
              <li>Der Verarbeitung Ihrer Daten zu widersprechen (Art. 21 DSGVO)</li>
              <li>Ihre Einwilligung jederzeit zu widerrufen</li>
              <li>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</li>
              <li>Beschwerde bei einer Aufsichtsbehörde einzulegen</li>
            </ul>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Cookies und Tracking-Technologien</h4>
            <p className="mb-4">
              Wir verwenden Cookies und ähnliche Technologien, um unsere Website zu optimieren und Ihnen ein besseres Nutzungserlebnis zu bieten. Detaillierte Informationen hierzu finden Sie in unserer Cookie-Richtlinie.
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Datensicherheit</h4>
            <p className="mb-4">
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder gegen den Zugriff unberechtigter Personen zu schützen.
            </p>
            
            <h4 className="text-lg font-medium text-namuh-navy mt-6 mb-2">Änderungen dieser Datenschutzerklärung</h4>
            <p className="mb-4">
              Wir behalten uns das Recht vor, diese Datenschutzerklärung jederzeit unter Beachtung der geltenden Datenschutzvorschriften zu ändern.
            </p>
            
            <p className="text-sm text-gray-500 mt-8">
              Stand: Januar 2024
            </p>
          </div>
        </div>
      </section>

      <section id="impressum" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-namuh-navy mb-8">Impressum</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <h3 className="text-xl font-semibold text-namuh-navy mt-6 mb-4">Angaben gemäß § 5 TMG:</h3>
            <p className="mb-4">
              namuH GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Deutschland
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Vertreten durch:</h3>
            <p className="mb-4">
              Dr. Max Mustermann (Geschäftsführer)<br />
              Anna Schmidt (Geschäftsführerin)
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Kontakt:</h3>
            <p className="mb-4">
              Telefon: +49 (0) 123 456 789<br />
              E-Mail: hello@namuh.de
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Registereintrag:</h3>
            <p className="mb-4">
              Eintragung im Handelsregister.<br />
              Registergericht: Amtsgericht Berlin-Charlottenburg<br />
              Registernummer: HRB 123456
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Umsatzsteuer-ID:</h3>
            <p className="mb-4">
              Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
              DE 123456789
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h3>
            <p className="mb-4">
              Sarah Weber<br />
              Head of Communications<br />
              namuH GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Deutschland
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Streitschlichtung:</h3>
            <p className="mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-namuh-teal hover:underline">https://ec.europa.eu/consumers/odr/</a><br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
            
            <p className="mb-4">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Haftung für Inhalte:</h3>
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach 
              den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter 
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu 
              überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mb-4">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den 
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch 
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei 
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Haftung für Links:</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
              Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche 
              Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className="mb-4">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete 
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen 
              werden wir derartige Links umgehend entfernen.
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-8 mb-4">Urheberrecht:</h3>
            <p className="mb-4">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
              Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind 
              nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="mb-4">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die 
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. 
              Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen 
              entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte 
              umgehend entfernen.
            </p>
            
            <p className="text-sm text-gray-500 mt-8">
              Stand: Januar 2024
            </p>
          </div>
        </div>
      </section>

      <section id="cookie-policy" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-namuh-navy mb-8">Cookie-Richtlinie</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Unsere Website verwendet Cookies und ähnliche Technologien, um Ihnen ein optimales Nutzungserlebnis zu bieten und unsere Dienste kontinuierlich zu verbessern.
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-6 mb-4">Was sind Cookies?</h3>
            <p className="mb-4">
              Cookies sind kleine Textdateien, die beim Besuch einer Website auf Ihrem Gerät gespeichert werden. Sie ermöglichen es einer Website, sich Informationen über Ihren Besuch zu merken, wie z.B. Ihre bevorzugte Sprache und andere Einstellungen.
            </p>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-6 mb-4">Welche Arten von Cookies verwenden wir?</h3>
            <p className="mb-4">
              Wir verwenden folgende Arten von Cookies:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Notwendige Cookies:</strong> Diese sind für die Funktionalität der Website unerlässlich und können nicht deaktiviert werden.</li>
              <li><strong>Funktionale Cookies:</strong> Diese ermöglichen es uns, die Nutzung der Website zu analysieren und die Benutzerfreundlichkeit zu verbessern.</li>
              <li><strong>Marketing-Cookies:</strong> Diese werden verwendet, um Besuchern auf Websites zu folgen und relevante Werbung anzuzeigen.</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-namuh-navy mt-6 mb-4">Wie können Sie Cookies kontrollieren?</h3>
            <p className="mb-4">
              Die meisten Browser erlauben es Ihnen, Cookies zu kontrollieren. Sie können Ihren Browser so einstellen, dass er alle Cookies ablehnt oder anzeigt, wenn ein Cookie gesetzt wird. Sie können auch alle Cookies löschen, die bereits auf Ihrem Gerät gespeichert sind.
            </p>
            
            <p className="text-sm text-gray-500 mt-8">
              Stand: Januar 2024
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export const EnhancedContactSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50" id="kontakt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-namuh-navy mb-4">
            Kontaktieren Sie uns
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Haben Sie Fragen zu unseren Services oder benötigen Sie Unterstützung? Unser Team steht Ihnen gerne zur Verfügung.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 h-full">
              <h3 className="text-xl font-bold text-namuh-navy mb-6">Kontaktinformationen</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="font-medium text-namuh-navy mb-1">Hauptsitz:</p>
                  <p className="text-gray-700">
                    namuH GmbH<br />
                    Musterstraße 123<br />
                    10115 Berlin<br />
                    Deutschland
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-namuh-navy mb-1">Allgemeine Anfragen:</p>
                  <p className="text-gray-700">
                    E-Mail: <a href="mailto:hello@namuh.de" className="text-namuh-teal hover:underline">hello@namuh.de</a><br />
                    Telefon: <a href="tel:+4901234567899" className="text-namuh-teal hover:underline">+49 (0) 123 456 789</a>
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-namuh-navy mb-1">Kundenservice:</p>
                  <p className="text-gray-700">
                    E-Mail: <a href="mailto:support@namuh.de" className="text-namuh-teal hover:underline">support@namuh.de</a><br />
                    Telefon: <a href="tel:+4901234567890" className="text-namuh-teal hover:underline">+49 (0) 123 456 790</a><br />
                    Montag bis Freitag, 9:00 - 17:00 Uhr
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-namuh-navy mb-1">Verkauf & Beratung:</p>
                  <p className="text-gray-700">
                    E-Mail: <a href="mailto:sales@namuh.de" className="text-namuh-teal hover:underline">sales@namuh.de</a><br />
                    Telefon: <a href="tel:+4901234567891" className="text-namuh-teal hover:underline">+49 (0) 123 456 791</a>
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-namuh-navy mb-1">Datenschutz:</p>
                  <p className="text-gray-700">
                    E-Mail: <a href="mailto:datenschutz@namuh.de" className="text-namuh-teal hover:underline">datenschutz@namuh.de</a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-namuh-navy mb-6">Nachricht senden</h3>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    className="input-field" 
                    placeholder="Ihr Name" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail *
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    className="input-field" 
                    placeholder="Ihre E-Mail-Adresse" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Betreff *
                  </label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="input-field" 
                    placeholder="Worum geht es?" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Nachricht *
                  </label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="input-field resize-none" 
                    placeholder="Ihre Nachricht an uns..." 
                    required 
                  ></textarea>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="privacy"
                      type="checkbox"
                      className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                      required
                    />
                  </div>
                  <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
                    Ich habe die <Link to="/datenschutz" className="text-namuh-teal hover:underline">Datenschutzerklärung</Link> gelesen und stimme der Verarbeitung meiner Daten zu.
                  </label>
                </div>
                
                <div className="pt-2">
                  <button type="submit" className="btn-primary w-full">
                    Nachricht senden
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};