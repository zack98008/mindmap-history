import { HistoricalElement, Relationship } from "../types";

export const historicalElements: HistoricalElement[] = [
  {
    id: "p1",
    name: "Leonardo da Vinci",
    type: "person",
    date: "1452-04-15",
    year: 1452,
    description: "Italian polymath of the Renaissance whose areas of interest included invention, drawing, painting, sculpture, architecture, science, music, mathematics, engineering, literature, anatomy, geology, astronomy, botany, paleontology, and cartography.",
    tags: ["Renaissance", "Art", "Science", "Italy"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Leonardo_self.jpg/800px-Leonardo_self.jpg"
  },
  {
    id: "p2",
    name: "Galileo Galilei",
    type: "person",
    date: "1564-02-15",
    year: 1564,
    description: "Italian astronomer, physicist and engineer, sometimes described as a polymath, from Pisa. Galileo has been called the 'father of observational astronomy', the 'father of modern physics', the 'father of the scientific method', and the 'father of modern science'.",
    tags: ["Astronomy", "Physics", "Science", "Italy"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/800px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg"
  },
  {
    id: "p3",
    name: "Marie Curie",
    type: "person",
    date: "1867-11-07",
    year: 1867,
    description: "Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person to win a Nobel Prize twice, and the only person to win a Nobel Prize in two scientific fields.",
    tags: ["Physics", "Chemistry", "Radioactivity", "Nobel Prize"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/800px-Marie_Curie_c1920.jpg"
  },
  {
    id: "e1",
    name: "Renaissance",
    type: "event",
    date: "1400",
    year: 1400,
    description: "The Renaissance was a period in European history marking the transition from the Middle Ages to modernity and covering the 15th and 16th centuries. In addition to the standard periodization, proponents of a 'long Renaissance' may put its beginning in the 14th century and its end in the 17th century.",
    tags: ["Europe", "Art", "Science", "Culture", "History"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Raffaello%2C_scuola_di_atene_01.jpg/1024px-Raffaello%2C_scuola_di_atene_01.jpg"
  },
  {
    id: "e2",
    name: "Scientific Revolution",
    type: "event",
    date: "1550",
    year: 1550,
    description: "The Scientific Revolution was a series of events that marked the emergence of modern science during the early modern period, when developments in mathematics, physics, astronomy, biology and chemistry transformed the views of society about nature.",
    tags: ["Science", "History", "Astronomy", "Physics"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Solvay_conference_1927.jpg/1024px-Solvay_conference_1927.jpg"
  },
  {
    id: "e3",
    name: "World War II",
    type: "event",
    date: "1939-09-01",
    year: 1939,
    description: "World War II, also known as the Second World War, was a global war that lasted from 1939 to 1945. It involved the vast majority of the world's countries—including all the great powers—forming two opposing military alliances: the Allies and the Axis.",
    tags: ["War", "History", "Politics", "Military"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Allied_leaders_WW2.jpg/1024px-Allied_leaders_WW2.jpg"
  },
  {
    id: "d1",
    name: "Mona Lisa",
    type: "document",
    date: "1503",
    year: 1503,
    description: "The Mona Lisa is a half-length portrait painting by Italian artist Leonardo da Vinci. Considered an archetypal masterpiece of the Italian Renaissance, it has been described as 'the best known, the most visited, the most written about, the most sung about, the most parodied work of art in the world'.",
    tags: ["Art", "Painting", "Renaissance", "Italy"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg"
  },
  {
    id: "d2",
    name: "Dialogue Concerning the Two Chief World Systems",
    type: "document",
    date: "1632",
    year: 1632,
    description: "The Dialogue Concerning the Two Chief World Systems is a 1632 Italian-language book by Galileo Galilei comparing the Copernican system with the traditional Ptolemaic system. It was translated into Latin as Systema cosmicum in 1635 by Matthias Bernegger.",
    tags: ["Astronomy", "Science", "Book", "Italy"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Galileo-dialogues.jpg/800px-Galileo-dialogues.jpg"
  },
  {
    id: "c1",
    name: "Heliocentrism",
    type: "concept",
    date: "1543",
    year: 1543,
    description: "Heliocentrism is the astronomical model in which the Earth and planets revolve around the Sun at the center of the universe. Historically, heliocentrism was opposed to geocentrism, which placed the Earth at the center.",
    tags: ["Astronomy", "Science", "Physics", "Model"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Copernican_heliocentrism_diagram-2.jpg/1024px-Copernican_heliocentrism_diagram-2.jpg"
  },
  {
    id: "c2",
    name: "Radioactivity",
    type: "concept",
    date: "1896",
    year: 1896,
    description: "Radioactivity is the spontaneous emission of radiation from the unstable nucleus of an atom. This phenomenon was discovered in 1896 by Henri Becquerel and further studied by Marie Curie and Pierre Curie.",
    tags: ["Physics", "Chemistry", "Science", "Nuclear"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Radioactive.svg/1024px-Radioactive.svg.png"
  }
];

export const relationships: Relationship[] = [
  {
    id: "r1",
    sourceId: "p1",
    targetId: "d1",
    description: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.",
    type: "created"
  },
  {
    id: "r2",
    sourceId: "p1",
    targetId: "e1",
    description: "Leonardo da Vinci was a key figure in the Renaissance period.",
    type: "participated"
  },
  {
    id: "r3",
    sourceId: "p2",
    targetId: "c1",
    description: "Galileo Galilei was a strong advocate for heliocentrism.",
    type: "influenced"
  },
  {
    id: "r4",
    sourceId: "p2",
    targetId: "d2",
    description: "Galileo Galilei wrote the Dialogue Concerning the Two Chief World Systems.",
    type: "created"
  },
  {
    id: "r5",
    sourceId: "p2",
    targetId: "e2",
    description: "Galileo Galilei was a key figure in the Scientific Revolution.",
    type: "participated"
  },
  {
    id: "r6",
    sourceId: "p3",
    targetId: "c2",
    description: "Marie Curie discovered the elements polonium and radium, and conducted pioneering research on radioactivity.",
    type: "influenced"
  },
  {
    id: "r7",
    sourceId: "e2",
    targetId: "c1",
    description: "The Scientific Revolution helped establish heliocentrism as the prevailing astronomical model.",
    type: "influenced"
  },
  {
    id: "r8",
    sourceId: "e1",
    targetId: "e2",
    description: "The Renaissance period preceded and influenced the Scientific Revolution.",
    type: "influenced"
  }
];

// Function to convert historical elements into timeline compatible format
export const getTimelineItems = () => {
  return historicalElements
    .filter(item => item.date) // Only include items with dates
    .map(item => {
      const year = parseInt(item.date?.split('-')[0] || '0');
      return {
        ...item,
        year
      };
    })
    .sort((a, b) => a.year - b.year); // Sort by year
};

// Generate nodes with positions for the map visualization
export const generateMapNodes = () => {
  const centerX = 500;
  const centerY = 300;
  const radius = 250;
  
  return historicalElements.map((element, index) => {
    const angle = (index / historicalElements.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    return {
      id: element.id,
      x,
      y,
      element,
      originalX: x,
      originalY: y
    };
  });
};

// Helper to get node position by ID
export const getNodeById = (id: string) => {
  const nodes = generateMapNodes();
  return nodes.find(node => node.id === id);
};

// Generate links for the map visualization
export const generateMapLinks = () => {
  return relationships.map(rel => {
    return {
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      relationship: rel
    };
  });
};

// Function to get element by id
export const getElementById = (id: string): HistoricalElement | undefined => {
  return historicalElements.find(element => element.id === id);
};

// Function to get relationships by element id
export const getRelationshipsByElementId = (id: string): Relationship[] => {
  return relationships.filter(rel => rel.sourceId === id || rel.targetId === id);
};

// Function to get related elements for a specific element
export const getRelatedElements = (id: string): HistoricalElement[] => {
  const relatedIds = relationships
    .filter(rel => rel.sourceId === id || rel.targetId === id)
    .map(rel => (rel.sourceId === id ? rel.targetId : rel.sourceId));
  
  return historicalElements.filter(element => relatedIds.includes(element.id));
};

// Function to search elements
export const searchElements = (query: string): HistoricalElement[] => {
  const lowerQuery = query.toLowerCase();
  return historicalElements.filter(element => 
    element.name.toLowerCase().includes(lowerQuery) || 
    element.description.toLowerCase().includes(lowerQuery) || 
    element.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
