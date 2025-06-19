import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Building2,
  Heart,
  Send,
  Users,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface JobCardProps {
  job: any;
  index: number;
  savedJobs: Set<string>;
  onToggleSave: (jobId: string) => void;
}

const JobCardComponent: React.FC<JobCardProps> = ({ job, index, savedJobs, onToggleSave }) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 10px 25px rgba(32, 178, 170, 0.15)'
      }}
      className="card p-6 hover:border-namuh-teal/30 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-namuh-navy mb-2 line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center space-x-2 text-gray-600 text-sm mb-3">
            <Building2 className="h-4 w-4" />
            <span>{job.companyName || job.company_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleSave(job.id)}
          className={`p-2 rounded-lg transition-colors ${
            savedJobs.has(job.id)
              ? 'text-namuh-teal bg-namuh-teal/10'
              : 'text-gray-400 hover:text-namuh-teal hover:bg-namuh-teal/10'
          }`}
        >
          <Heart className={`h-5 w-5 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-green-600">
            <DollarSign className="h-4 w-4" />
            <span>€{job.salaryMin?.toLocaleString() || job.salary_min?.toLocaleString()} - €{job.salaryMax?.toLocaleString() || job.salary_max?.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span className="capitalize">{job.employmentType || job.employment_type}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{new Date(job.postedDate || job.posted_date).toLocaleDateString('de-DE')}</span>
          </div>
          {isAuthenticated && job.matchScore !== undefined && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-namuh-teal rounded-full"></div>
              <span className="text-namuh-teal font-medium text-xs">{job.matchScore}% Übereinstimmung</span>
            </div>
          )}
        </div>
        
        {(job.isLeadershipRole || job.is_leadership_role) && (
          <div className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
            <Users className="h-3 w-3" />
            <span>Führungsposition</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 btn-primary text-sm py-2 text-center"
        >
          Details anzeigen
        </Link>
        <Link
          to={`/jobs/${job.id}/apply`}
          className="btn-outline text-sm py-2 px-4 flex items-center space-x-1"
        >
          <Send className="h-3 w-3" />
          <span>Bewerben</span>
        </Link>
      </div>
    </motion.div>
  );
};

const JobCard = React.memo(JobCardComponent);

export default JobCard;