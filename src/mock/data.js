export const currentUser = {
  name: 'Arun Kumar',
  email: 'arun.kumar@college.edu',
  role: 'Student',
};

export const facultyUser = {
  name: 'Dr. Priya Menon',
  email: 'priya.menon@college.edu',
  role: 'Faculty',
};

export const modelScores = [
  { name: 'RoBERTa (HC3)', score: 76 },
  { name: 'BERT', score: 69 },
  { name: 'GPT-2 Perplexity', score: 73 },
  { name: 'Burstiness Analysis', score: 67 },
  { name: 'BART (Zero-shot)', score: 61 },
  { name: 'TF-IDF + LR', score: 52 },
];

export const plagiarismSources = [
  { name: 'Wikipedia', similarity: 6 },
  { name: 'OpenAlex', similarity: 5 },
  { name: 'CrossRef', similarity: 4 },
  { name: 'Semantic Scholar', similarity: 3 },
  { name: 'arXiv', similarity: 2 },
  { name: 'Other Sources', similarity: 1 },
];

export const matchedSources = [
  { id: 1, name: 'OpenAlex', similarity: 82 },
  { id: 2, name: 'Wikipedia', similarity: 71 },
  { id: 3, name: 'Research Article', similarity: 64 },
  { id: 4, name: 'Semantic Scholar', similarity: 52 },
];

export const sentenceAnalysis = [
  { id: 1, text: 'This research demonstrates the effectiveness of the proposed approach across multiple benchmark datasets.', aiScore: 91 },
  { id: 2, text: 'The experiment was conducted using a controlled environment with standardized parameters.', aiScore: 68 },
  { id: 3, text: 'Our results indicate a significant improvement over baseline methods in most test cases.', aiScore: 82 },
  { id: 4, text: 'In conclusion, this study shows that the method holds strong potential for future applications.', aiScore: 45 },
  { id: 5, text: 'Further research is needed to explore edge cases and generalize the findings to other domains.', aiScore: 28 },
];

export const documents = [
  {
    id: 'doc1',
    name: 'Assignment1.pdf',
    sizeMb: 2.4,
    student: 'Arun Kumar',
    uploadedAt: '2025-04-12T10:42:00',
    status: 'Completed',
    aiPercent: 72,
    plagiarismPercent: 18,
  },
  {
    id: 'doc2',
    name: 'Report.pdf',
    sizeMb: 1.8,
    student: 'Rahul S',
    uploadedAt: '2025-04-11T15:20:00',
    status: 'Completed',
    aiPercent: 78,
    plagiarismPercent: 14,
  },
  {
    id: 'doc3',
    name: 'Assignment2.docx',
    sizeMb: 0.9,
    student: 'Priya V',
    uploadedAt: '2025-04-11T09:05:00',
    status: 'Completed',
    aiPercent: 21,
    plagiarismPercent: 5,
  },
  {
    id: 'doc4',
    name: 'Project.pdf',
    sizeMb: 3.1,
    student: 'Karthik R',
    uploadedAt: '2025-04-10T18:44:00',
    status: 'Processing',
    aiPercent: 36,
    plagiarismPercent: 10,
  },
  {
    id: 'doc5',
    name: 'Research.docx',
    sizeMb: 1.2,
    student: 'Sneha K',
    uploadedAt: '2025-04-09T12:15:00',
    status: 'Completed',
    aiPercent: 9,
    plagiarismPercent: 3,
  },
];

export const facultyStats = {
  totalDocuments: 128,
  avgAiContent: 34,
  avgPlagiarism: 12,
};

export const processingSteps = [
  { key: 'extraction', label: 'Text Extraction' },
  { key: 'ocr', label: 'OCR Processing' },
  { key: 'matching', label: 'Source Matching' },
  { key: 'ai', label: 'AI Detection' },
  { key: 'report', label: 'Generating Report' },
];
