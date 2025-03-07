
import React from 'react';
import { motion } from 'framer-motion';
import { HistoricalElementType } from '@/types';
import { Brain, BookOpen, Calendar, User, Lightbulb } from 'lucide-react';

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
        return { icon: <User className="h-8 w-8" />, color: 'text-chronoPurple' };
      case 'event':
        return { icon: <Calendar className="h-8 w-8" />, color: 'text-chronoBlue' };
      case 'document':
        return { icon: <BookOpen className="h-8 w-8" />, color: 'text-chronoTeal' };
      case 'concept':
      case 'term':
      default:
        return { icon: <Lightbulb className="h-8 w-8" />, color: 'text-chronoGold' };
    }
  };

  const { icon, color } = getIconAndColor();
  
  // Simplified tag elements (limited to 3 tags)
  const tagElements = tags.slice(0, 3).map((tag, index) => (
    <motion.div 
      key={index}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + (index * 0.1) }}
      className="text-xs px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm"
    >
      {tag}
    </motion.div>
  ));

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {/* Timeline dot and line */}
      {year && (
        <motion.div 
          className="relative mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`w-px h-16 ${color} bg-current opacity-50 mx-auto`}></div>
          <div className={`w-4 h-4 rounded-full ${color} bg-current absolute top-16 left-1/2 -ml-2`}></div>
          <motion.div 
            className={`absolute top-20 left-1/2 transform -translate-x-1/2 ${color} font-bold`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {year}
          </motion.div>
        </motion.div>
      )}
      
      {/* Main icon */}
      <motion.div 
        className={`${color} mb-4 p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10`}
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {icon}
      </motion.div>
      
      {/* Tags */}
      <motion.div 
        className="flex flex-wrap gap-2 justify-center mt-4 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {tagElements}
      </motion.div>
      
      {/* Type label */}
      <motion.div 
        className="mt-4 text-xs text-muted-foreground uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {type}
      </motion.div>
    </div>
  );
};

export default InfoGraphic;
