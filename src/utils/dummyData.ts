import { HistoricalElement, HistoricalEvent, HistoricalPerson, HistoricalDocument, HistoricalConcept, Relationship, TimelineItem, MapNode, MapLink } from '@/types';

const historicalPersons: HistoricalPerson[] = [
  { id: 'person_1', name: 'Cleopatra', type: 'person', description: 'Last active ruler of the Ptolemaic Kingdom of Egypt.', tags: ['ruler', 'egypt', 'ptolemaic'] },
  { id: 'person_2', name: 'Julius Caesar', type: 'person', date: '100 BC - 44 BC', description: 'Roman general and statesman.', tags: ['general', 'rome', 'statesman'] },
  { id: 'person_3', name: 'Leonardo da Vinci', type: 'person', date: '1452-04-15', description: 'Italian polymath of the High Renaissance.', tags: ['artist', 'inventor', 'renaissance'], imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' },
  { id: 'person_4', name: 'Marie Curie', type: 'person', date: '1867-11-07', description: 'Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity.', tags: ['physicist', 'chemist', 'radioactivity'], imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/640px-Marie_Curie_c._1920s.jpg' },
  { id: 'person_5', name: 'Nelson Mandela', type: 'person', date: '1918-07-18', description: 'South African anti-apartheid revolutionary, political leader, and philanthropist.', tags: ['revolutionary', 'leader', 'philanthropist'] },
  { id: 'person_6', name: 'William Shakespeare', type: 'person', date: '1564-04-26', description: 'English playwright, poet and actor, widely regarded as the greatest writer in the English language.', tags: ['playwright', 'poet', 'actor'] },
  { id: 'person_7', name: 'Albert Einstein', type: 'person', date: '1879-03-14', description: 'German-born theoretical physicist who developed the theory of relativity.', tags: ['physicist', 'relativity', 'scientist'] },
  { id: 'person_8', name: 'Queen Elizabeth II', type: 'person', date: '1926-04-21', description: 'Queen of the United Kingdom and the other Commonwealth realms from 6 February 1952 until her death in 2022.', tags: ['queen', 'monarch', 'commonwealth'] },
  { id: 'person_9', name: 'Mahatma Gandhi', type: 'person', date: '1869-10-02', description: 'Indian lawyer, anti-colonial nationalist, and political ethicist.', tags: ['lawyer', 'nationalist', 'ethicist'] },
  { id: 'person_10', name: 'Martin Luther King Jr.', type: 'person', date: '1929-01-15', description: 'American Baptist minister and activist who became the most visible spokesperson and leader in the civil rights movement.', tags: ['minister', 'activist', 'civil rights'] },
];

const historicalEvents: HistoricalEvent[] = [
  { id: 'event_1', name: 'Battle of Actium', type: 'event', date: '31 BC', description: 'Decisive confrontation of the Final War of the Roman Republic.', tags: ['war', 'rome', 'republic'] },
  { id: 'event_2', name: 'Renaissance', type: 'event', date: '1300-1600', description: 'A period in European history marking the transition from the Middle Ages to modernity.', tags: ['europe', 'art', 'culture'] },
  { id: 'event_3', name: 'World War II', type: 'event', date: '1939-09-01', description: 'A global war that lasted from 1939 to 1945.', tags: ['war', 'global', 'conflict'] },
  { id: 'event_4', name: 'French Revolution', type: 'event', date: '1789-05-05', description: 'An influential period of social and political upheaval in late 1700\'s France', tags: ['revolution', 'france', 'political'] },
  { id: 'event_5', name: 'American Civil War', type: 'event', date: '1861-04-12', description: 'Civil war in the United States from 1861 to 1865', tags: ['civil war', 'america', 'conflict'] },
  { id: 'event_6', name: 'The Cold War', type: 'event', date: '1947-03-12', description: 'A period of geopolitical tension between the United States and the Soviet Union and their respective allies', tags: ['cold war', 'usa', 'soviet union'] },
  { id: 'event_7', name: 'The Moon Landing', type: 'event', date: '1969-07-20', description: 'The first crewed landing on the Moon', tags: ['moon', 'space', 'usa'] },
  { id: 'event_8', name: 'The Black Death', type: 'event', date: '1346-01-01', description: 'One of the most devastating pandemics in human history', tags: ['pandemic', 'europe', 'disease'] },
  { id: 'event_9', name: 'The Reformation', type: 'event', date: '1517-10-31', description: 'A major movement within Western Christianity in 16th-century Europe', tags: ['christianity', 'europe', 'religion'] },
  { id: 'event_10', name: 'The Industrial Revolution', type: 'event', date: '1760-01-01', description: 'The transition to new manufacturing processes in the period from about 1760 to sometime between 1820 and 1840', tags: ['industry', 'economy', 'innovation'] },
];

const historicalDocuments: HistoricalDocument[] = [
  { id: 'document_1', name: 'The Epic of Gilgamesh', type: 'document', date: '2100 BC', description: 'An epic poem from ancient Mesopotamia.', tags: ['literature', 'mesopotamia', 'poem'] },
  { id: 'document_2', name: 'The Bible', type: 'document', date: '313 AD', description: 'A collection of religious texts or scriptures.', tags: ['religion', 'christianity', 'scripture'] },
  { id: 'document_3', name: 'The Quran', type: 'document', date: '610 AD', description: 'The central religious text of Islam.', tags: ['religion', 'islam', 'text'] },
  { id: 'document_4', name: 'The Declaration of Independence', type: 'document', date: '1776-07-04', description: 'A statement adopted by the Continental Congress declaring the United States independent from Great Britain.', tags: ['politics', 'usa', 'independence'] },
  { id: 'document_5', name: 'The Constitution of the United States', type: 'document', date: '1788-06-21', description: 'The supreme law of the United States of America.', tags: ['law', 'usa', 'politics'] },
  { id: 'document_6', name: 'Magna Carta', type: 'document', date: '1215-06-15', description: 'A charter of rights agreed to by King John of England.', tags: ['law', 'england', 'rights'] },
  { id: 'document_7', name: 'The Communist Manifesto', type: 'document', date: '1848-02-21', description: 'A political document by Karl Marx and Friedrich Engels.', tags: ['politics', 'communism', 'philosophy'] },
  { id: 'document_8', name: 'The Art of War', type: 'document', date: '5th century BC', description: 'An ancient Chinese military treatise attributed to Sun Tzu.', tags: ['military', 'china', 'strategy'] },
  { id: 'document_9', name: 'The Diary of Anne Frank', type: 'document', date: '1947-06-25', description: 'A book of the writings from the Dutch language diary of a young Jewish girl', tags: ['diary', 'jewish', 'world war 2'] },
  { id: 'document_10', name: 'The Universal Declaration of Human Rights', type: 'document', date: '1948-12-10', description: 'An international document adopted by the United Nations', tags: ['human rights', 'united nations', 'politics'] },
];

const historicalConcepts: HistoricalConcept[] = [
  { id: 'concept_1', name: 'Democracy', type: 'concept', description: 'A system of government by the whole population or all the eligible members of a state.', tags: ['politics', 'government', 'society'] },
  { id: 'concept_2', name: 'Capitalism', type: 'concept', description: 'An economic and political system in which a country\'s trade and industry are controlled by private owners for profit.', tags: ['economics', 'politics', 'trade'] },
  { id: 'concept_3', name: 'Socialism', type: 'concept', description: 'A political and economic theory of social organization which advocates that the means of production, distribution, and exchange should be owned or regulated by the community as a whole.', tags: ['politics', 'economics', 'society'] },
  { id: 'concept_4', name: 'Nationalism', type: 'concept', description: 'Identification with one\'s own nation and support for its interests, especially to the exclusion or detriment of the interests of other nations.', tags: ['politics', 'society', 'identity'] },
  { id: 'concept_5', name: 'Existentialism', type: 'concept', description: 'A philosophical theory or approach that emphasizes the existence of the individual person as a free and responsible agent determining their own development through acts of will.', tags: ['philosophy', 'individual', 'freedom'] },
  { id: 'concept_6', name: 'Globalization', type: 'concept', description: 'The process by which businesses or other organizations develop international influence or start operating on an international scale.', tags: ['business', 'international', 'economy'] },
  { id: 'concept_7', name: 'Renaissance Humanism', type: 'concept', description: 'A cultural and intellectual movement of the Renaissance that emphasized human potential and achievement.', tags: ['culture', 'renaissance', 'philosophy'] },
  { id: 'concept_8', name: 'The Enlightenment', type: 'concept', description: 'An intellectual and philosophical movement that dominated the world of ideas in Europe during the 18th century.', tags: ['philosophy', 'europe', 'ideas'] },
  { id: 'concept_9', name: 'Postmodernism', type: 'concept', description: 'A late 20th-century movement characterized by broad skepticism, subjectivism, and relativism', tags: ['philosophy', 'culture', 'society'] },
  { id: 'concept_10', name: 'Environmentalism', type: 'concept', description: 'Concern about and action aimed at protecting the environment.', tags: ['environment', 'politics', 'society'] },
];

const relationships: Relationship[] = [
  { id: 'relationship_1', sourceId: 'person_1', targetId: 'event_1', description: 'Involved in', type: 'participated' },
  { id: 'relationship_2', sourceId: 'person_2', targetId: 'event_1', description: 'Involved in', type: 'participated' },
  { id: 'relationship_3', sourceId: 'person_3', targetId: 'event_2', description: 'Lived during', type: 'influenced' },
  { id: 'relationship_4', sourceId: 'person_4', targetId: 'concept_10', description: 'Advocated for', type: 'documented' },
  { id: 'relationship_5', sourceId: 'person_5', targetId: 'concept_1', description: 'Fought for', type: 'documented' },
  { id: 'relationship_6', sourceId: 'person_6', targetId: 'document_4', description: 'Inspired by', type: 'influenced' },
  { id: 'relationship_7', sourceId: 'person_7', targetId: 'concept_5', description: 'Developed', type: 'created' },
  { id: 'relationship_8', sourceId: 'person_8', targetId: 'event_3', description: 'Reigned during', type: 'influenced' },
  { id: 'relationship_9', sourceId: 'person_9', targetId: 'concept_3', description: 'Advocated for', type: 'documented' },
  { id: 'relationship_10', sourceId: 'person_10', targetId: 'concept_2', description: 'Inspired by', type: 'influenced' },
  { id: 'relationship_11', sourceId: 'person_3', targetId: 'person_4', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_12', sourceId: 'person_4', targetId: 'person_5', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_13', sourceId: 'person_5', targetId: 'person_6', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_14', sourceId: 'person_6', targetId: 'person_7', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_15', sourceId: 'person_7', targetId: 'person_8', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_16', sourceId: 'person_8', targetId: 'person_9', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_17', sourceId: 'person_9', targetId: 'person_10', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_18', sourceId: 'person_10', targetId: 'person_1', description: 'Inspired', type: 'influenced' },
  { id: 'relationship_19', sourceId: 'person_1', targetId: 'person_2', description: 'Related to', type: 'custom' },
  { id: 'relationship_20', sourceId: 'person_2', targetId: 'person_3', description: 'Related to', type: 'custom' },
];

export const getHistoricalPersons = (): HistoricalPerson[] => historicalPersons;
export const getHistoricalEvents = (): HistoricalEvent[] => historicalEvents;
export const getHistoricalDocuments = (): HistoricalDocument[] => historicalDocuments;
export const getHistoricalConcepts = (): HistoricalConcept[] => historicalConcepts;
export const getAllRelationships = (): Relationship[] => relationships;

export const getTimelineItems = (): TimelineItem[] => {
  return [
    ...getHistoricalPersons().map(p => ({ ...p, year: parseInt(p.date?.split('-')[0] || '0') })),
    ...getHistoricalEvents().map(e => ({ ...e, year: parseInt(e.date?.split('-')[0] || '0') })),
    ...getHistoricalDocuments().map(d => ({ ...d, year: parseInt(d.date?.split('-')[0] || '0') })),
    ...getHistoricalConcepts().map(c => ({ ...c, year: 1900 + Math.floor(Math.random() * 120) }))
  ].sort((a, b) => (a.year || 0) - (b.year || 0));
};

export const getElementById = (id: string): HistoricalElement | undefined => {
  return [
    ...getHistoricalPersons(),
    ...getHistoricalEvents(),
    ...getHistoricalDocuments(),
    ...getHistoricalConcepts()
  ].find(element => element.id === id);
};

export const generateMapLinks = (): MapLink[] => {
  return getAllRelationships().map(r => ({
    id: r.id,
    source: r.sourceId,
    target: r.targetId,
    relationship: r,
    layer: 1,
    opacity: 1
  }));
};

// When updating the interfaces for MapNode, make sure the functions that create nodes also include these properties
export const generateMapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];
  const elements = [
    ...getHistoricalPersons(),
    ...getHistoricalEvents(),
    ...getHistoricalDocuments(),
    ...getHistoricalConcepts()
  ];
  
  const centerX = 500;
  const centerY = 300;
  const radius = 200;
  
  elements.forEach((element, i) => {
    const angle = (i / elements.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    nodes.push({
      id: element.id,
      x,
      y,
      element,
      originalX: x,
      originalY: y,
      layer: 1, // Add layer property
      opacity: 1 // Add opacity property
    });
  });
  
  return nodes;
};

export function generateExtendedMapData(centralNodeId: string, maxDepth = 2) {
  const allElements = [
    ...getHistoricalPersons(),
    ...getHistoricalEvents(),
    ...getHistoricalDocuments(),
    ...getHistoricalConcepts()
  ];
  
  const allRelationships = getAllRelationships();
  
  const centralElement = allElements.find(el => el.id === centralNodeId);
  if (!centralElement) {
    return { nodes: generateMapNodes(), links: generateMapLinks() };
  }
  
  const nodes: MapNode[] = [];
  const links: MapLink[] = [];
  const processedNodeIds = new Set<string>();
  const processedLinkIds = new Set<string>();
  
  // Helper function to add a node if it's not already added
  const addNodeIfNew = (element: HistoricalElement, depth: number) => {
    if (processedNodeIds.has(element.id)) return;
    
    const angle = Math.random() * Math.PI * 2;
    const radius = 150 + depth * 100; // Position nodes in concentric circles based on depth
    const jitter = (Math.random() - 0.5) * 50; // Add some randomness
    
    const x = 500 + Math.cos(angle) * (radius + jitter);
    const y = 300 + Math.sin(angle) * (radius + jitter);
    
    const node: MapNode = {
      id: element.id,
      x,
      y,
      element,
      originalX: x,
      originalY: y,
      layer: depth, // Set layer based on relationship depth
      opacity: depth === 1 ? 1 : depth === 2 ? 0.8 : depth === 3 ? 0.6 : 0.4 // Set opacity based on depth
    };
    
    nodes.push(node);
    processedNodeIds.add(element.id);
  };
  
  // Add the central node
  addNodeIfNew(centralElement, 1);
  
  // Process relationships recursively up to maxDepth
  const processElementRelationships = (elementId: string, currentDepth: number) => {
    if (currentDepth > maxDepth) return;
    
    // Find all relationships where this element is either source or target
    allRelationships.forEach(rel => {
      if (rel.sourceId === elementId || rel.targetId === elementId) {
        // Avoid adding the same link twice
        if (processedLinkIds.has(rel.id)) return;
        
        // Get the other element in the relationship
        const otherId = rel.sourceId === elementId ? rel.targetId : rel.sourceId;
        const otherElement = allElements.find(el => el.id === otherId);
        
        if (otherElement) {
          // Add the other node if it's not already added
          addNodeIfNew(otherElement, currentDepth);
          
          // Add the link
          const link: MapLink = {
            id: rel.id,
            source: rel.sourceId,
            target: rel.targetId,
            relationship: rel,
            layer: currentDepth,
            opacity: currentDepth === 1 ? 1 : currentDepth === 2 ? 0.8 : 0.6
          };
          
          links.push(link);
          processedLinkIds.add(rel.id);
          
          // Process relationships for the other element
          processElementRelationships(otherId, currentDepth + 1);
        }
      }
    });
  };
  
  // Start processing from the central node
  processElementRelationships(centralNodeId, 1);
  
  return { nodes, links };
}
