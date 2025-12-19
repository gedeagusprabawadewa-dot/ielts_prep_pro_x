
import { WritingTask, TaskType, ReadingTask, SpeakingCueCard, Lesson } from './types';

export const FOUNDATION_LESSONS: Lesson[] = [
  {
    id: 'f1',
    category: 'basics',
    title: 'What is IELTS?',
    content: 'IELTS (International English Language Testing System) is the world’s most popular English language test for higher education and global migration. It measures your ability to communicate in English across four skills: Listening, Reading, Writing, and Speaking.',
    bullets: [
      'Academic: For university applications.',
      'General Training: For work or migration.',
      'Scored from 1.0 to 9.0.',
      'Most top universities require a Band 7.0+.'
    ],
    teacherTip: 'Don’t worry about perfection. The test is designed to find out what you CAN do, not just what you get wrong.'
  },
  {
    id: 'f2',
    category: 'writing',
    title: 'The Two Writing Tasks',
    content: 'The Writing test lasts 60 minutes and consists of two parts. You should spend about 20 minutes on Task 1 and 40 minutes on Task 2.',
    bullets: [
      'Task 1: Describe data (Academic) or write a letter (General). Min 150 words.',
      'Task 2: Write a formal essay on a social issue. Min 250 words.',
      'Task 2 is worth twice as many marks as Task 1.'
    ],
    teacherTip: 'Writing Task 2 is not just about your opinion. It is about how clearly you explain and organise your ideas.'
  },
  {
    id: 'f3',
    category: 'speaking',
    title: 'Speaking: Face to Face',
    content: 'The Speaking test is a 11–14 minute interview with a human examiner. It has three parts, designed to get progressively more difficult.',
    bullets: [
      'Part 1: Familiar topics like your home, work, or hobbies.',
      'Part 2: A "Long Turn" where you speak for 2 minutes on a specific topic.',
      'Part 3: An abstract discussion related to the Part 2 topic.'
    ],
    teacherTip: 'Think of it as a conversation, not an interrogation. Eye contact and natural intonation help you score higher.'
  }
];

export const READING_TASKS: ReadingTask[] = [
  {
    id: 'r1',
    title: 'The Future of Urban Transportation',
    passage: `In the first half of the 21st century, the concept of urban transportation underwent a radical transformation. As global populations shifted increasingly toward megacities, the traditional reliance on private internal combustion engine vehicles became unsustainable. This shift was driven not only by environmental concerns but also by the sheer physical limitations of urban space.

One of the most significant developments was the rise of Autonomous Electric Vehicles (AEVs). Unlike traditional cars, AEVs operate as part of a synchronized network, drastically reducing traffic congestion by eliminating the 'human factor' of erratic braking and lane switching. Furthermore, the integration of Vertical Take-Off and Landing (VTOL) craft, once the stuff of science fiction, began to offer a viable 'third dimension' to city transit.

However, critics argue that the technological focus on high-tech vehicles overlooks the fundamental importance of active transport, such as cycling and walking. Urban planners in cities like Copenhagen and Amsterdam have demonstrated that infrastructure dedicated to human-powered mobility can be just as effective at reducing carbon footprints as multi-billion dollar tech investments. The debate continues as to whether the cities of 2050 will be dominated by silent drones or bustling bicycle lanes.`,
    questions: [
      {
        id: 'q1',
        type: 'tfng',
        question: 'Private petrol cars are considered a sustainable option for modern megacities.',
        answer: 'False'
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'What is cited as a primary benefit of AEVs in the text?',
        options: [
          'They are cheaper to manufacture than traditional cars.',
          'They eliminate traffic jams caused by human driving behavior.',
          'They allow people to travel longer distances in less time.',
          'They are more aesthetically pleasing than older models.'
        ],
        answer: 'They eliminate traffic jams caused by human driving behavior.'
      },
      {
        id: 'q3',
        type: 'tfng',
        question: 'VTOL craft have already become the most common form of urban transport.',
        answer: 'Not Given'
      },
      {
        id: 'q4',
        type: 'gapfill',
        question: 'Planners in Copenhagen emphasize ________ mobility over expensive technology.',
        answer: 'human-powered'
      }
    ]
  },
  {
    id: 'r2',
    title: 'Nutmeg – a valuable spice',
    passage: `The nutmeg tree, Myristica fragrans, is a large evergreen tree native to Southeast Asia. Until the late 18th century, it only grew in one place in the world: a small group of islands in the Banda Sea, part of the Moluccas – or Spice Islands – in northeastern Indonesia. The tree is thickly branched with dense foliage of tough, dark green oval leaves, and produces small, yellow, bell-shaped flowers and pale yellow pear-shaped fruits. The fruit is encased in a flesh husk. When the fruit is ripe, this husk splits into two halves along a ridge running the length of the fruit. Inside is a purple-brown shiny seed, 2-3 cm long by about 2 cm across, surrounded by a lacy red or crimson covering called an ‘aril’. These are the sources of the two spices nutmeg and mace, the former being produced from the dried seed and the latter from the aril.

Nutmeg was a highly prized and costly ingredient in European cuisine in the Middle Ages, and was used as a flavouring, medicinal, and preservative agent. Throughout this period, the Arabs were the exclusive importers of the spice to Europe. They sold nutmeg for high prices to merchants based in Venice, but they never revealed the exact location of the source of this extremely valuable commodity. The Arab-Venetian dominance of the trade finally ended in 1512, when the Portuguese reached the Banda Islands and began exploiting its precious resources.

Always in danger of competition from neighbouring Spain, the Portuguese began subcontracting their spice distribution to Dutch traders. Profits began to flow into the Netherlands, and the Dutch commercial fleet swiftly grew into one of the largest in the world. The Dutch quietly gained control of most of the shipping and trading of spices in Northern Europe. Then, in 1580, Portugal fell under Spanish rule, and by the end of the 16th century the Dutch found themselves locked out of the market. As prices for pepper, nutmeg, and other spices soared across Europe, they decided to fight back.

In 1602, Dutch merchants founded the VOC, a trading corporation better known as the Dutch East India Company. By 1617, the VOC was the richest commercial operation in the world. The company had 50,000 employees worldwide, with a private army of 30,000 men and a fleet of 200 ships. At the same time, thousands of people across Europe were dying of the plague, a highly contagious and deadly disease. Doctors were desperate for a way to stop the spread of this disease, and they decided nutmeg held the cure. Everybody wanted nutmeg, and many were willing to spare no expense to have it. Nutmeg bought for a few pennies in Indonesia could be sold for 68,000 times its original cost on the streets of London. The only problem was the short supply. And that’s where the Dutch found their opportunity.

The Banda Islands were ruled by local sultans who insisted on maintaining a neutral trading policy towards foreign powers. This allowed them to avoid the presence of Portuguese or Spanish troops on their soil, but it also left them unprotected from other invaders. In 1621, the Dutch arrived and took over. Once securely in control of the Bandas, the Dutch went to work protecting their new investment. They concentrated all nutmeg production into a few easily guarded areas, uprooting and destroying any trees outside the plantation zones. Anyone caught growing a nutmeg seedling or carrying seeds without the proper authority was severely punished. In addition, all exported nutmeg was covered with lime to make sure there was no chance a fertile seed which could be grown elsewhere would leave the islands.

There was only one obstacle to Dutch domination. One of the Banda Islands, a sliver of land called Run, only 3 km long by less than 1 km wide, was under the control of the British. After decades of fighting for control of this tiny island, the Dutch and British arrived at a compromise settlement, the Treaty of Breda, in 1667. Intent on securing their hold over every nutmeg-producing island, the Dutch offered a trade: if the British would give them the island of Run, they would in turn give Britain a distant and much less valuable island in North America. The British agreed. That other island was Manhattan, which is how New Amsterdam became New York. The Dutch now had a monopoly over the nutmeg trade which would last for another century.

Then, in 1770, a Frenchman named Pierre Poivre successfully smuggled nutmeg plants to safety in Mauritius, an island off the coast of Africa. Some of these were later exported to the Caribbean where they thrived, especially on the island of Grenada. Next, in 1778, a volcanic eruption in the Banda region caused a tsunami that wiped out half the nutmeg groves. Finally, in 1809, the British returned to Indonesia and seized the Banda Islands by force. They returned the islands to the Dutch in 1817, but not before transplanting hundreds of nutmeg seedlings to plantations in several locations across southern Asia. The Dutch nutmeg monopoly was over.`,
    questions: [
      {
        id: 'r2-q1',
        type: 'gapfill',
        question: 'The leaves of the nutmeg tree are ________ in shape.',
        answer: 'oval'
      },
      {
        id: 'r2-q2',
        type: 'gapfill',
        question: 'The ________ surrounds the fruit and breaks open when the fruit is ripe.',
        answer: 'husk'
      },
      {
        id: 'r2-q3',
        type: 'gapfill',
        question: 'The ________ is used to produce the spice nutmeg.',
        answer: 'seed'
      },
      {
        id: 'r2-q4',
        type: 'gapfill',
        question: 'The covering known as the aril is used to produce ________.',
        answer: 'mace'
      },
      {
        id: 'r2-q5',
        type: 'tfng',
        question: 'In the Middle Ages, most Europeans knew where nutmeg was grown.',
        answer: 'False'
      },
      {
        id: 'r2-q6',
        type: 'tfng',
        question: 'The VOC was the world’s first major trading company.',
        answer: 'Not Given'
      },
      {
        id: 'r2-q7',
        type: 'tfng',
        question: 'Following the Treaty of Breda, the Dutch had control of all the islands where nutmeg grew.',
        answer: 'True'
      },
      {
        id: 'r2-q8',
        type: 'gapfill',
        question: 'In the Middle Ages, nutmeg was brought to Europe by the ________.',
        answer: 'Arabs'
      },
      {
        id: 'r2-q9',
        type: 'gapfill',
        question: 'In the 17th century, nutmeg was believed to be effective against the disease known as the ________.',
        answer: 'plague'
      },
      {
        id: 'r2-q10',
        type: 'gapfill',
        question: 'The Dutch put ________ on nutmeg to avoid it being cultivated outside the islands.',
        answer: 'lime'
      },
      {
        id: 'r2-q11',
        type: 'gapfill',
        question: 'The Dutch finally obtained the island of ________ from the British.',
        answer: 'Run'
      },
      {
        id: 'r2-q12',
        type: 'gapfill',
        question: 'In 1770, nutmeg plants were secretly taken to ________.',
        answer: 'Mauritius'
      },
      {
        id: 'r2-q13',
        type: 'gapfill',
        question: 'In 1778, half the Banda Islands\' nutmeg plantations were destroyed by a ________.',
        answer: 'tsunami'
      }
    ]
  }
];

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

export const SPEAKING_PART2_TASKS: SpeakingCueCard[] = [
  {
    id: 'p2-1',
    topic: 'Describe an important journey that was delayed.',
    bulletPoints: [
      'when it was',
      'where you were going',
      'why it was delayed',
      'and explain how you felt about the delay.'
    ]
  },
  {
    id: 'p2-2',
    topic: 'Describe a person you know who is very beautiful or handsome.',
    bulletPoints: [
      'who this person is',
      'how you know them',
      'what they look like',
      'and explain why you think they are beautiful or handsome.'
    ]
  },
  {
    id: 'p2-3',
    topic: 'Describe a traditional object of your country.',
    bulletPoints: [
      'what it is',
      'how it is made',
      'what it is used for',
      'and explain why it is important for your country.'
    ]
  },
  {
    id: 'p2-4',
    topic: 'Describe a time when you shared something with others.',
    bulletPoints: [
      'what you shared',
      'who you shared it with',
      'why you shared it',
      'and explain how you felt about sharing it.'
    ]
  }
];

export const APP_THEME = {
  primary: '#2563eb', // Blue 600
  secondary: '#64748b', // Slate 500
  accent: '#f59e0b', // Amber 500
};
