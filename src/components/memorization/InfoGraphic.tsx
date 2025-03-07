
import React from 'react';
import { motion } from 'framer-motion';
import { HistoricalElementType } from '@/types';
import { BookOpen, Calendar, User, Lightbulb, Map, Award, Scroll, FileText, Clock } from 'lucide-react';

interface InfoGraphicProps {
  type: HistoricalElementType;
  year?: number;
  name: string;
  tags: string[];
}

const InfoGraphic: React.FC<InfoGraphicProps> = ({ type, year, name, tags }) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'person':
        return { 
          icon: <User className="h-8 w-8" />, 
          color: 'text-chronoPurple',
          bgColor: 'bg-chronoPurple/10',
          secondaryIcon: <Award className="h-4 w-4" />
        };
      case 'event':
        return { 
          icon: <Calendar className="h-8 w-8" />, 
          color: 'text-chronoBlue',
          bgColor: 'bg-chronoBlue/10',
          secondaryIcon: <Clock className="h-4 w-4" />
        };
      case 'document':
        return { 
          icon: <BookOpen className="h-8 w-8" />, 
          color: 'text-chronoTeal',
          bgColor: 'bg-chronoTeal/10',
          secondaryIcon: <FileText className="h-4 w-4" />
        };
      case 'concept':
      case 'term':
      default:
        return { 
          icon: <Lightbulb className="h-8 w-8" />, 
          color: 'text-chronoGold',
          bgColor: 'bg-chronoGold/10',
          secondaryIcon: <Scroll className="h-4 w-4" />
        };
    }
  };

  const { icon, color, bgColor, secondaryIcon } = getIconAndColor();
  
  // Limited to 3 tags for design consistency
  const tagElements = tags.slice(0, 3).map((tag, index) => (
    <motion.div 
      key={index}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + (index * 0.1) }}
      className={`text-xs px-3 py-1 rounded-full ${bgColor} ${color} font-medium backdrop-blur-sm border border-white/5 shadow-sm`}
    >
      {tag}
    </motion.div>
  ));

  // Format the year with proper styling if available
  const yearDisplay = year ? (
    <motion.div
      className="flex items-center gap-1 mb-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <span className={`text-xs ${color} opacity-70`}>●</span>
      <span className="text-sm font-medium">{year}</span>
    </motion.div>
  ) : null;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      {/* Design elements - Background patterns */}
      <motion.div 
        className={`absolute inset-0 ${bgColor} opacity-20 rounded-xl z-0`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 0.8 }}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 w-1/3 h-1/3 rounded-full opacity-30 blur-2xl z-0"
        style={{ background: `radial-gradient(circle at center, var(--chrono${type === 'person' ? 'Purple' : type === 'event' ? 'Blue' : type === 'document' ? 'Teal' : 'Gold'}) 0%, transparent 70%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      />
      
      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center w-full h-full p-4 justify-center">
        {/* Timeline visualization if year is available */}
        {year && (
          <motion.div 
            className="relative mb-4 w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center items-center">
              <div className={`w-20 h-[2px] ${color} opacity-40`}></div>
              <div className={`w-4 h-4 rounded-full ${color} flex items-center justify-center text-xs`}>
                <div className={`w-2 h-2 rounded-full bg-current`}></div>
              </div>
              <div className={`w-20 h-[2px] ${color} opacity-40`}></div>
            </div>
            <motion.div 
              className={`text-center mt-1 ${color} font-bold text-sm`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {year}
            </motion.div>
          </motion.div>
        )}
        
        {/* Main icon with decorative elements */}
        <motion.div 
          className={`${color} mb-4 relative`}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className={`${bgColor} p-4 rounded-full backdrop-blur-sm border border-white/10 shadow-lg relative`}>
            {/* Decorative rings */}
            <div className={`absolute inset-0 ${color} opacity-20 rounded-full animate-pulse-soft`} style={{ animation: 'pulse 3s infinite' }}></div>
            <div className={`absolute -inset-2 ${color} opacity-10 rounded-full`}></div>
            {icon}
            
            {/* Secondary icon */}
            <motion.div
              className={`absolute -right-1 -bottom-1 ${bgColor} p-1 rounded-full border border-white/10`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              {secondaryIcon}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Year display above tags (alternative position) */}
        {yearDisplay}
        
        {/* Tags with improved styling */}
        <motion.div 
          className="flex flex-wrap gap-2 justify-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {tagElements}
        </motion.div>
        
        {/* Type label with added design elements */}
        <motion.div 
          className={`mt-4 text-xs uppercase tracking-wider font-medium ${color} flex items-center gap-1`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="w-4 h-[1px] bg-current opacity-50"></span>
          {type}
          <span className="w-4 h-[1px] bg-current opacity-50"></span>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoGraphic;
