
import { WritingTask, TaskType } from './types';

export const WRITING_TASKS: WritingTask[] = [
  {
    id: 'w1-t1',
    topic: 'Demographics',
    type: TaskType.WRITING_TASK_1_ACADEMIC,
    question: 'The bar chart below shows the number of people who visited three different museums in London between 2015 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartConfig: {
      type: 'bar',
      xAxisKey: 'name',
      dataKeys: ['British Museum', 'Science Museum', 'Natural History Museum'],
      data: [
        { name: '2015', 'British Museum': 6.8, 'Science Museum': 3.2, 'Natural History Museum': 5.4 },
        { name: '2016', 'British Museum': 6.4, 'Science Museum': 3.5, 'Natural History Museum': 4.8 },
        { name: '2017', 'British Museum': 5.9, 'Science Museum': 3.1, 'Natural History Museum': 4.4 },
        { name: '2018', 'British Museum': 6.2, 'Science Museum': 2.9, 'Natural History Museum': 4.5 },
        { name: '2019', 'British Museum': 6.6, 'Science Museum': 3.8, 'Natural History Museum': 5.2 },
        { name: '2020', 'British Museum': 1.2, 'Science Museum': 0.8, 'Natural History Museum': 0.9 },
      ]
    }
  },
  {
    id: 'w1-t1-line',
    topic: 'Technology',
    type: TaskType.WRITING_TASK_1_ACADEMIC,
    question: 'The line graph shows the percentage of households with internet access in three different countries between 2005 and 2015. Summarize the information by selecting and reporting the main features.',
    chartConfig: {
      type: 'line',
      xAxisKey: 'name',
      dataKeys: ['Country A', 'Country B', 'Country C'],
      data: [
        { name: '2005', 'Country A': 15, 'Country B': 30, 'Country C': 5 },
        { name: '2007', 'Country A': 25, 'Country B': 35, 'Country C': 12 },
        { name: '2009', 'Country A': 45, 'Country B': 38, 'Country C': 25 },
        { name: '2011', 'Country A': 60, 'Country B': 42, 'Country C': 38 },
        { name: '2013', 'Country A': 75, 'Country B': 55, 'Country C': 50 },
        { name: '2015', 'Country A': 85, 'Country B': 70, 'Country C': 65 },
      ]
    }
  },
  {
    id: 'w1-t1-g',
    topic: 'Employment',
    type: TaskType.WRITING_TASK_1_GENERAL,
    question: 'You have recently started a new job. Write a letter to a friend and tell them about it. In your letter: explain what the job is, describe your new colleagues, and invite your friend to visit you.'
  },
  {
    id: 'w1',
    topic: 'Education',
    type: TaskType.WRITING_TASK_2,
    question: 'Some people believe that students should be allowed to evaluate their teachers. Others argue that this would lead to a lack of discipline in the classroom. Discuss both views and give your own opinion.',
    modelAnswer: {
      text: "In the modern educational landscape, the question of whether students should be granted the authority to appraise their instructors remains a subject of intense debate. While critics argue that such a measure might undermine classroom decorum, I believe that a constructive feedback loop is essential for academic excellence, provided it is implemented with professional safeguards.\n\nOpponents of student evaluations primarily cite the potential erosion of authority. They contend that if teachers feel their job security is tethered to student satisfaction, they may resort to 'grade inflation' or leniency in discipline to curry favor. For instance, a teacher might hesitate to enforce strict deadlines or behavioral standards for fear of receiving negative reviews. Consequently, the classroom environment could transform from a place of rigorous learning into a popularity contest, ultimately compromising the educational standard.\n\nOn the other hand, the benefits of incorporating student perspectives are manifold. Learners are the primary consumers of education, and their insights into teaching methodology and clarity are invaluable. By providing regular feedback, students can highlight areas where instructional techniques may be outdated or ineffective. Furthermore, being heard fosters a sense of agency among students, encouraging them to take greater responsibility for their learning journey. This collaborative approach often leads to higher engagement levels and a more dynamic classroom atmosphere.\n\nIn my opinion, the merits of student appraisals far outweigh the risks of disciplinary breakdown. The key lies in the design of the evaluation system; it should focus on pedagogical effectiveness rather than personal likability. When combined with peer reviews and management observations, student feedback forms a balanced and holistic view of a teacher's performance.\n\nIn conclusion, while concerns regarding discipline are not entirely unfounded, they can be mitigated through robust system design. Allowing students a voice in their education not only enhances teaching quality but also prepares them for a democratic society where constructive criticism is a cornerstone of progress.",
      overallBand: 9,
      explanation: "This response achieves a Band 9 because it provides a highly sophisticated argument that fully addresses all parts of the prompt with nuanced development and exceptional linguistic control.",
      criteria: {
        taskResponse: "The essay provides a comprehensive discussion of both sides and a clear, consistent opinion. Each point is extended with relevant logical examples.",
        coherenceCohesion: "Cohesion is seamless. Paragraphing is logical, and a wide range of cohesive devices is used naturally (e.g., 'Consequently', 'Furthermore', 'The key lies in').",
        lexicalResource: "The vocabulary is precise, sophisticated, and natural. Phrases like 'tethered to', 'curry favor', and 'pedagogical effectiveness' demonstrate a Band 9 level of flexibility.",
        grammaticalRange: "A wide range of complex structures is used with full flexibility and accuracy. The writer uses various subordinate clauses and inverted structures flawlessly."
      },
      strengths: [
        "Sophisticated balance between opposing viewpoints.",
        "Precision in collocations (e.g., 'grade inflation', 'constructive feedback loop').",
        "Clear and logical progression from introduction to conclusion."
      ],
      commonWeaknesses: [
        "Band 5-6 students often fail to give their opinion clearly until the very end.",
        "Over-use of basic transitions like 'Firstly' and 'Secondly' instead of contextual linking.",
        "Repetitive vocabulary (e.g., using 'good' instead of 'effective' or 'meritorious')."
      ],
      improvementTips: [
        "Focus on 'Idea Extension': Don't just state a point, explain the consequence (the 'So What?' factor).",
        "Use 'Hedge' Language: Instead of saying 'Teachers will become lazy', say 'Instructors may potentially resort to less rigorous standards'.",
        "Diversify Sentence Openers: Avoid starting every sentence with a Subject-Verb structure."
      ],
      bandUpgrades: [
        {
          low: "Students should judge teachers because they are the ones who learn.",
          high: "Learners are the primary consumers of education, and their insights into teaching methodology and clarity are invaluable.",
          explanation: "The improved version uses formal terminology ('primary consumers') and more specific criteria for evaluation ('teaching methodology and clarity')."
        },
        {
          low: "If teachers are evaluated, they will give easy grades to get high scores.",
          high: "They contend that if instructors feel their job security is tethered to student satisfaction, they may resort to 'grade inflation' to curry favor.",
          explanation: "Uses advanced collocations like 'tethered to' and 'curry favor', showing high lexical flexibility."
        }
      ],
      highlights: [
        { phrase: "In the modern educational landscape", type: "topic", note: "A strong, contextual opening that sets the stage without repeating the prompt verbatim." },
        { phrase: "tethered to", type: "vocab", note: "A high-level metaphorical use of vocabulary meaning 'connected to' or 'dependent on'." },
        { phrase: "Furthermore", type: "linking", note: "A transition used to add a complementary point, maintaining the flow of the argument." },
        { phrase: "curry favor", type: "vocab", note: "An idiomatic expression meaning to try to get someone to like you, used perfectly in a formal context." },
        { phrase: "The key lies in the design of the evaluation system", type: "grammar", note: "A complex sentence structure that effectively shifts the focus to a specific solution." }
      ]
    }
  },
  {
    id: 'w2',
    topic: 'Environment',
    type: TaskType.WRITING_TASK_2,
    question: 'Climate change is one of the most pressing issues of our time. Some say individuals can do little to help, while others think government action is the only solution. Discuss both views.'
  },
  {
    id: 'w3',
    topic: 'Technology',
    type: TaskType.WRITING_TASK_2,
    question: 'The rise of artificial intelligence will bring more benefits than harm to the workplace. To what extent do you agree or disagree?'
  }
];

export const SPEAKING_QUESTIONS = [
  { id: 's1', question: 'Tell me about your hometown.' },
  { id: 's2', question: 'Do you work or are you a student?' },
  { id: 's3', question: 'What do you like to do in your free time?' },
  { id: 's4', question: 'Do you prefer to travel alone or with friends?' }
];

export const APP_THEME = {
  primary: '#2563eb', // Blue 600
  secondary: '#64748b', // Slate 500
  accent: '#f59e0b', // Amber 500
};
