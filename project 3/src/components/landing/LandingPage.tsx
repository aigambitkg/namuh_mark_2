import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  Zap, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  Star,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Building2,
  Heart,
  Search,
  Briefcase,
  Euro,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import DemoSlideshow from './DemoSlideshow';

// Lazy load heavy components
const JobCard = lazy(() => import('../common/JobCard'));
const TestimonialSection = lazy(() => import('../common/TestimonialSection'));

// Optimized loading component
const ComponentLoader = React.memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-namuh-teal"></div>
  </div>
));

// Memoized Hero Section
const HeroSection = React.memo(() => {
  const { jobs } = useAppStore();
  
  const quickActions = useMemo(() => [
    {
      title: 'Stellensuche',
      description: `Durchsuchen Sie ${jobs.length}+ aktuelle Stellenausschreibungen von führenden Unternehmen`,
      icon: Search,
      link: '/jobs',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Community',
      description: 'Vernetzen Sie sich mit Fachkräften und tauschen Sie Erfahrungen aus',
      icon: Users,
      link: '/community',
      color: 'from-namuh-teal to-namuh-teal-dark'
    },
    {
      title: 'Preise & Pläne',
      description: 'Entdecken Sie unsere transparenten Preise und finden Sie den passenden Plan',
      icon: Euro,
      link: '/pricing',
      color: 'from-purple-500 to-purple-600'
    }
  ], [jobs.length]);

  // Animation variants for the underline
  const underlineVariants = {
    hidden: { width: "0%" },
    visible: { 
      width: "100%", 
      transition: { 
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 1.5
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-namuh-teal/10 via-white to-namuh-navy/10 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-namuh-navy leading-tight">
              <motion.span className="relative inline-block">
                Fairness, Humanity <span className="text-2xl lg:text-4xl">and</span>{' '}
                <span className="text-namuh-teal">Transparency</span>
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-namuh-teal/70 rounded-full"
                  variants={underlineVariants}
                  initial="hidden"
                  animate="visible"
                />
              </motion.span><br />
              <span style={{ fontSize: "0.8em", fontStretch: "condensed", letterSpacing: "-0.02em" }}>
                <span className="text-2xl lg:text-4xl">in</span> Job- <span className="text-2xl lg:text-4xl">und</span> Talent-Suche
              </span>
            </h1>
            <p className="mt-6 text-l text-gray-600 leading-relaxed">
              Verbinden Sie Ihre Talente mit Chancen oder bieten Sie Chancen für Talente durch KI-gestützte Lösungen.
Erleben Sie die Zukunft der Jobsuche und Personalbeschaffung mit unserer intelligenten zentralisierenden Plattform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
                Kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/jobs" className="btn-secondary text-lg px-8 py-4 inline-flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Jobs durchsuchen
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
              {[
                'Kostenlos starten',
                'Keine Kreditkarte erforderlich', 
                'KI-gestützte Matching'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Dashboard Preview - Replaced with Demo Slideshow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <DemoSlideshow />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-namuh-navy/10 rounded-full z-[-1]"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

// Optimized Quick Actions with memoization
const QuickActionsSection = React.memo(() => {
  const { jobs } = useAppStore();
  
  // Properly structured quick actions
  const quickActions = useMemo(() => [
    {
      title: 'Stellensuche',
      description: `Durchsuchen Sie ${jobs.length}+ aktuelle Stellenausschreibungen von führenden Unternehmen`,
      icon: Search,
      link: '/jobs',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Community',
      description: 'Vernetzen Sie sich mit Fachkräften und tauschen Sie Erfahrungen aus',
      icon: Users,
      link: '/community',
      color: 'from-namuh-teal to-namuh-teal-dark'
    },
    {
      title: 'Preise & Pläne',
      description: 'Entdecken Sie unsere transparenten Preise und finden Sie den passenden Plan',
      icon: Euro,
      link: '/pricing',
      color: 'from-purple-500 to-purple-600'
    }
  ], [jobs.length]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-namuh-navy mb-4">
            Starten Sie noch heute
          </h2>
          <p className="text-xl text-gray-600">
            Entdecken Sie Stellenangebote und verbinden Sie sich mit Top-Unternehmen
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="card p-8 text-center cursor-pointer"
            >
              <div className={`bg-gradient-to-br ${action.color} p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center`}>
                <action.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-namuh-navy mb-4">{action.title}</h3>
              <p className="text-gray-600 mb-6">{action.description}</p>
              <Link to={action.link} className="btn-primary w-full">
                {action.title === 'Stellensuche' ? 'Jobs durchsuchen' :
                 action.title === 'Community' ? 'Zur Community' : 'Preise ansehen'}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Optimized Features Section
const FeaturesSection = React.memo(() => {
  const features = useMemo(() => [
    {
      icon: Zap,
      title: 'KI-gestütztes Matching',
      description: 'Fortschrittliche Algorithmen verbinden Kandidaten mit perfekten Möglichkeiten'
    },
    {
      icon: Users,
      title: 'Talent Pool Zugang',
      description: 'Vernetzen Sie sich mit verifizierten Fachkräften aller Branchen'
    },
    {
      icon: Shield,
      title: 'Datenschutz First',
      description: 'DSGVO-konform mit transparenter Datenverarbeitung'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Datengetriebene Einblicke zur Optimierung Ihrer Recruiting-Strategie'
    }
  ], []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-namuh-navy">
            Warum namuH wählen?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Unsere Plattform kombiniert modernste KI mit menschlicher Expertise
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-namuh-teal/10 rounded-full mb-4">
                <feature.icon className="h-8 w-8 text-namuh-teal" />
              </div>
              <h3 className="text-xl font-semibold text-namuh-navy mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Main LandingPage Component with optimizations
export const LandingPage: React.FC = () => {
  const { jobs } = useAppStore();
  
  // Memoized active jobs with match scores
  const activeJobs = useMemo(() => 
    jobs.filter(job => job.status === 'active').slice(0, 6)
  , [jobs]);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <QuickActionsSection />
      <FeaturesSection />
      
      {/* Lazy Loaded Job Listings */}
      <Suspense fallback={<ComponentLoader />}>
        <JobListingsSection jobs={activeJobs} />
      </Suspense>

      {/* Lazy Loaded Testimonials */}
      <Suspense fallback={<ComponentLoader />}>
        <TestimonialSection />
      </Suspense>

      {/* CTA Section */}
      <section className="py-20 bg-namuh-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Bereit, Ihre Karriere zu transformieren?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Schließen Sie sich Tausenden von Fachkräften an, die namuH für ihre Karriere-Reise vertrauen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-namuh-teal hover:bg-namuh-teal-dark text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-lg">
                Heute kostenlos starten
              </Link>
              <Link to="/pricing" className="border-2 border-white text-white hover:bg-white hover:text-namuh-navy font-medium py-3 px-8 rounded-lg transition-all duration-200">
                Preise ansehen
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Optimized Job Listings Component
const JobListingsSection = React.memo<{ jobs: any[] }>(({ jobs }) => {
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const toggleSaveJob = useCallback((jobId: string) => {
    setSavedJobs(prev => {
      const newSavedJobs = new Set(prev);
      if (newSavedJobs.has(jobId)) {
        newSavedJobs.delete(jobId);
      } else {
        newSavedJobs.add(jobId);
      }
      return newSavedJobs;
    });
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-namuh-navy">
            Aktuelle Stellenausschreibungen
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Entdecken Sie die neuesten Karrieremöglichkeiten auf namuH
          </p>
        </div>

        {jobs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job, index) => (
                <Suspense key={job.id} fallback={<ComponentLoader />}>
                  <JobCard 
                    job={job} 
                    index={index}
                    savedJobs={savedJobs}
                    onToggleSave={toggleSaveJob}
                  />
                </Suspense>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/jobs" className="btn-outline text-lg px-8 py-4 inline-flex items-center">
                Alle Stellenausschreibungen anzeigen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Stellenausschreibungen verfügbar
            </h3>
            <p className="text-gray-600 mb-6">
              Bald werden hier die neuesten Karrieremöglichkeiten angezeigt.
            </p>
            <Link to="/register" className="btn-primary">
              Jetzt registrieren und benachrichtigt werden
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});