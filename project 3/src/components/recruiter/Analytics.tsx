import React, { useState } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30d');
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Check access based on tier
  const getAccessLevel = () => {
    if (user?.tier === 'recruiter_basis') return 'none';
    if (user?.tier === 'recruiter_starter') return 'basic';
    if (user?.tier === 'recruiter_professional') return 'detailed';
    if (user?.tier === 'recruiter_enterprise') return 'advanced';
    return 'none';
  };

  const accessLevel = getAccessLevel();

  if (accessLevel === 'none') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BarChart3 className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-namuh-navy mb-4">Analytics & Statistiken</h1>
            <p className="text-xl text-gray-600 mb-8">
              Diese Funktion ist ab dem Starter Business Tier verfügbar
            </p>
            <div className="card p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-namuh-navy mb-4">Upgrade erforderlich</h3>
              <p className="text-gray-600 mb-6">
                Erhalten Sie detaillierte Einblicke in Ihre Recruiting-Performance mit 
                umfassenden Analytics und KI-gestützten Insights.
              </p>
              <button className="btn-primary w-full">
                Auf Starter Business upgraden
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Stellenaufrufe',
      value: '12,458',
      change: '+15.3%',
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Bewerbungen',
      value: '342',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Conversion Rate',
      value: '2.74%',
      change: '-2.1%',
      trend: 'down',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Ø Bewerbungszeit',
      value: '3.2 Tage',
      change: '+0.8',
      trend: 'neutral',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const topPerformingJobs = [
    {
      title: 'Senior Frontend Developer',
      views: 2843,
      applications: 87,
      conversionRate: 3.06
    },
    {
      title: 'UX/UI Designer',
      views: 1967,
      applications: 62,
      conversionRate: 3.15
    },
    {
      title: 'Product Manager',
      views: 1523,
      applications: 41,
      conversionRate: 2.69
    }
  ];

  const applicationFunnel = [
    { stage: 'Stellenaufrufe', count: 12458, percentage: 100 },
    { stage: 'Klicks auf "Bewerben"', count: 1847, percentage: 14.8 },
    { stage: 'Bewerbungen gestartet', count: 523, percentage: 4.2 },
    { stage: 'Bewerbungen abgeschlossen', count: 342, percentage: 2.7 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-namuh-navy">Analytics & Statistiken</h1>
            <p className="mt-2 text-gray-600">
              {accessLevel === 'basic' ? 'Grundlegende Analyse' : 
               accessLevel === 'detailed' ? 'Detaillierte Analyse' : 
               'Erweiterte Analyse mit KI Co-Pilot'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field"
            >
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
              <option value="90d">Letzte 90 Tage</option>
              <option value="1y">Letztes Jahr</option>
            </select>
            {accessLevel === 'advanced' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAIInsights(!showAIInsights)}
                className={`btn-primary flex items-center space-x-2 ${
                  showAIInsights ? 'bg-namuh-navy' : ''
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>KI Co-Pilot</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </motion.button>
          </div>
        </div>

        {/* KI Insights Panel */}
        {accessLevel === 'advanced' && showAIInsights && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-8 bg-gradient-to-r from-namuh-teal/5 to-namuh-navy/5 border border-namuh-teal/20"
          >
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-namuh-teal mr-3" />
              <h3 className="text-lg font-semibold text-namuh-navy">KI Co-Pilot Insights</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-namuh-navy mb-2">🎯 Strategische Empfehlungen</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Ihre Frontend Developer Stelle hat 40% höhere Conversion Rate - ähnliche Stellen erstellen</li>
                  <li>• Dienstag und Mittwoch zeigen beste Bewerbungsraten - Timing für neue Posts optimieren</li>
                  <li>• Benefit-Hervorhebung führt zu 23% mehr qualifizierten Bewerbungen</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-namuh-navy mb-2">📊 Trend-Analyse</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Remote-Work Keywords steigern Aufrufe um 35%</li>
                  <li>• Gehaltstransparenz reduziert Bewerbungsabbrüche um 18%</li>
                  <li>• Kurze Stellenbeschreibungen ({'<300 Wörter'}) performen besser</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-namuh-teal text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                Detaillierte Analyse anfordern (1 Token)
              </button>
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              className="card p-6 hover:border-namuh-teal/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUp className={`h-4 w-4 mr-1 ${
                    metric.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {metric.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-namuh-navy mb-1">{metric.value}</h3>
                <p className="text-sm text-gray-600">{metric.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Jobs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-namuh-navy mb-6">
              Top Performance Stellen
            </h3>
            <div className="space-y-4">
              {topPerformingJobs.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-namuh-teal/50 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-namuh-navy">{job.title}</h4>
                    <span className="text-sm font-semibold text-green-600">
                      {job.conversionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{job.views.toLocaleString()} Aufrufe</span>
                    <span>{job.applications} Bewerbungen</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-namuh-teal h-2 rounded-full transition-all duration-500"
                      style={{ width: `${job.conversionRate * 10}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Application Funnel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-namuh-navy mb-6">
              Bewerbungstrichter
            </h3>
            <div className="space-y-4">
              {applicationFunnel.map((stage, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-namuh-navy">
                        {stage.count.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({stage.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className={`h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' : 'bg-namuh-teal'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Analytics (Professional+ only) */}
        {accessLevel !== 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-namuh-navy">
                  Detaillierte Performance-Analyse
                </h3>
                <button className="btn-outline flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Aktualisieren</span>
                </button>
              </div>
              
              {/* Mock Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Interaktive Charts und detaillierte Metriken
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-namuh-teal mb-1">47%</div>
                    <div className="text-gray-600">Mobile Traffic</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">3.2 min</div>
                    <div className="text-gray-600">Ø Verweildauer</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">68%</div>
                    <div className="text-gray-600">Qualified Leads</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};