
import React from 'react';
import { motion } from 'framer-motion';
import { HistoricalElementType } from '@/types';
import { BookOpen, Calendar, User, Lightbulb, Map, Award, Scroll, FileText, Clock, Flag, MapPin, Landmark, Building } from 'lucide-react';

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
          secondaryIcon: <Award className="h-5 w-5" />,
          mapIcon: <Flag className="h-6 w-6" />
        };
      case 'event':
        return { 
          icon: <Calendar className="h-8 w-8" />, 
          color: 'text-chronoBlue',
          bgColor: 'bg-chronoBlue/10',
          secondaryIcon: <Clock className="h-5 w-5" />,
          mapIcon: <MapPin className="h-6 w-6" />
        };
      case 'document':
        return { 
          icon: <BookOpen className="h-8 w-8" />, 
          color: 'text-chronoTeal',
          bgColor: 'bg-chronoTeal/10',
          secondaryIcon: <FileText className="h-5 w-5" />,
          mapIcon: <Landmark className="h-6 w-6" />
        };
      case 'concept':
      case 'term':
      default:
        return { 
          icon: <Lightbulb className="h-8 w-8" />, 
          color: 'text-chronoGold',
          bgColor: 'bg-chronoGold/10',
          secondaryIcon: <Scroll className="h-5 w-5" />,
          mapIcon: <Building className="h-6 w-6" />
        };
    }
  };

  const { icon, color, bgColor, secondaryIcon, mapIcon } = getIconAndColor();
  
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

  // Calculate data visualization percentages for visual effect
  const mainValue = Math.floor(Math.random() * 60) + 40; // Random value between 40-100%
  const secondaryValue = 100 - mainValue;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      {/* Background patterns and effects */}
      <motion.div 
        className={`absolute inset-0 ${bgColor} opacity-20 rounded-xl z-0 overflow-hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        
        {/* Map-like decorative overlay */}
        <motion.div 
          className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path 
              d="M42.3,-65.5C53.5,-56.5,60.2,-42.4,65.1,-28.2C70,-13.9,73,-0.5,69.2,10.5C65.5,21.5,55,30.1,44.8,38.3C34.6,46.5,24.8,54.3,12.4,61.2C0,68.1,-14.9,74.1,-28,71.3C-41.1,68.4,-52.4,56.7,-58.4,43.4C-64.3,30.1,-65,15.1,-65.9,-0.5C-66.9,-16,-68.2,-32.1,-61.9,-43.8C-55.6,-55.5,-41.7,-62.9,-28.5,-70.2C-15.2,-77.4,-2.6,-84.4,8.7,-97.1C20,-109.7,31.2,-74.5,42.3,-65.5Z" 
              transform="translate(100 100)" 
              className={`${color} opacity-50`}
            />
          </svg>
        </motion.div>
      </motion.div>
      
      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center w-full h-full p-4 justify-center">
        {/* Timeline visualization if year is available */}
        {year && (
          <motion.div 
            className="relative mb-6 w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-[120px] w-[2px] bg-white/20"></div>
              
              {/* Year marker */}
              <motion.div 
                className={`absolute left-1/2 transform -translate-x-1/2 w-5 h-5 ${color} rounded-full flex items-center justify-center z-10`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </motion.div>
              
              {/* Year display */}
              <motion.div 
                className={`absolute left-1/2 transform -translate-x-1/2 mt-8 ${color} font-bold text-lg`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {year}
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className={`w-4 h-[1px] ${color} opacity-60`}></div>
                <div className="text-xs opacity-70 ml-1">{year - 10}</div>
              </motion.div>
              
              <motion.div 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-xs opacity-70 mr-1">{year + 10}</div>
                <div className={`w-4 h-[1px] ${color} opacity-60`}></div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Map visualization inspired by the reference image */}
        <motion.div 
          className="relative mb-4 w-full flex justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`relative w-24 h-24 ${bgColor} rounded-full p-1 backdrop-blur-md overflow-hidden shadow-lg border border-white/10`}>
            {/* Map-like pattern inside */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/10 to-transparent overflow-hidden">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-40">
                <path 
                  d="M42.3,-65.5C53.5,-56.5,60.2,-42.4,65.1,-28.2C70,-13.9,73,-0.5,69.2,10.5C65.5,21.5,55,30.1,44.8,38.3C34.6,46.5,24.8,54.3,12.4,61.2C0,68.1,-14.9,74.1,-28,71.3C-41.1,68.4,-52.4,56.7,-58.4,43.4C-64.3,30.1,-65,15.1,-65.9,-0.5C-66.9,-16,-68.2,-32.1,-61.9,-43.8C-55.6,-55.5,-41.7,-62.9,-28.5,-70.2C-15.2,-77.4,-2.6,-84.4,8.7,-97.1C20,-109.7,31.2,-74.5,42.3,-65.5Z" 
                  transform="translate(100 100)" 
                  className={`${color} opacity-20`}
                />
              </svg>
            </div>
            
            {/* Flag or location marker */}
            <motion.div 
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <div className={`${color}`}>
                {mapIcon}
              </div>
            </motion.div>
            
            {/* Main icon */}
            <motion.div 
              className="absolute bottom-2 right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <div className={`${bgColor} p-2 rounded-full backdrop-blur-sm border border-white/10 shadow-md ${color}`}>
                {secondaryIcon}
              </div>
            </motion.div>
          </div>
          
          {/* Connected line to the right */}
          <motion.div 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center"
            initial={{ width: 0 }}
            animate={{ width: "30%" }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className={`h-[2px] w-full ${color} opacity-40`}></div>
            <div className={`w-2 h-2 rounded-full ${color} ml-1`}></div>
          </motion.div>
        </motion.div>
        
        {/* Data visualization graphic (inspired by pie charts in the reference) */}
        <motion.div 
          className="flex justify-center items-center mb-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="#444" 
                strokeWidth="1" 
                strokeDasharray={`${mainValue}, 100`}
                className={`${color}`}
              />
              <text x="18" y="20.35" className="text-[8px] font-semibold fill-current text-center" textAnchor="middle">
                {mainValue}%
              </text>
            </svg>
          </div>
          
          {/* Main info */}
          <div className="text-center">
            <motion.h3 
              className="text-lg font-bold mb-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {name}
            </motion.h3>
            
            {/* Tags with improved styling */}
            <motion.div 
              className="flex flex-wrap gap-2 justify-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {tagElements}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Type label with enhanced design */}
        <motion.div 
          className={`mt-2 text-xs uppercase tracking-wider font-medium ${color} flex items-center gap-2`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <span className="w-6 h-[1px] bg-current opacity-50"></span>
          <div className="flex items-center gap-1">
            {icon}
            <span>{type}</span>
          </div>
          <span className="w-6 h-[1px] bg-current opacity-50"></span>
        </motion.div>
        
        {/* Connected events indicator (dotted line) */}
        <motion.div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "20px", opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className={`w-[2px] h-full ${color} opacity-40 dashed-line`}></div>
          <div className={`w-3 h-3 rounded-full ${bgColor} ${color} border border-white/10 flex items-center justify-center mt-1`}>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoGraphic;
