
import { WritingTask, TaskType, ReadingTask, SpeakingCueCard, Lesson, PlacementQuestion, AcademyVocab, AcademyGrammarLesson, AcademyBridgeLesson } from './types';

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  { id: 'p1', question: "I ______ to the library yesterday.", options: ["go", "goes", "went", "going"], answer: "went", category: "grammar" },
  { id: 'p2', question: "Which word is a synonym for 'Huge'?", options: ["Tiny", "Massive", "Slow", "Bright"], answer: "Massive", category: "vocab" },
  { id: 'p3', question: "She ______ coffee every morning.", options: ["drink", "drinks", "drinking", "drank"], answer: "drinks", category: "grammar" },
  { id: 'p4', question: "To 'postpone' an event means to ______.", options: ["Cancel it", "Start it early", "Move it to a later time", "Join it"], answer: "Move it to a later time", category: "vocab" },
  { id: 'p5', question: "If it rains, I ______ at home.", options: ["stay", "will stay", "stayed", "stays"], answer: "will stay", category: "grammar" }
];

export const ACADEMY_VOCAB: AcademyVocab[] = [
  { id: 'v1', word: 'Requirement', meaningId: 'Persyaratan', example: 'A valid passport is a requirement for travel.', category: 'IELTS Common' },
  { id: 'v2', word: 'Sustainable', meaningId: 'Berkelanjutan', example: 'We must find sustainable energy sources.', category: 'Travel' },
  { id: 'v3', word: 'Commute', meaningId: 'Perjalanan ke tempat kerja', example: 'My daily commute takes 45 minutes.', category: 'Daily Life' },
  { id: 'v4', word: 'Significant', meaningId: 'Signifikan / Penting', example: 'There has been a significant change in the weather.', category: 'Work' },
  { id: 'v5', word: 'Beneficial', meaningId: 'Bermanfaat', example: 'Exercise is beneficial for your health.', category: 'Daily Life' },
  { id: 'v6', word: 'Departure', meaningId: 'Keberangkatan', example: 'Please check the departure board for your gate.', category: 'Travel' },
  { id: 'v7', word: 'Colleague', meaningId: 'Rekan kerja', example: 'I am going to lunch with my colleague.', category: 'Work' },
  { id: 'v8', word: 'Estimate', meaningId: 'Memperkirakan', example: 'Can you estimate the cost of the repair?', category: 'IELTS Common' }
];

export const ACADEMY_GRAMMAR: AcademyGrammarLesson[] = [
  {
    id: 'g1',
    title: 'Subject-Verb Agreement',
    explanationId: 'Subjek tunggal membutuhkan kata kerja tunggal (biasanya ditambah s/es).',
    wrong: 'He play football every Sunday.',
    correct: 'He plays football every Sunday.',
    quiz: {
      question: 'Which is correct?',
      options: ['The cat sleep on the mat.', 'The cat sleeps on the mat.'],
      answer: 'The cat sleeps on the mat.'
    }
  },
  {
    id: 'g2',
    title: 'Present Continuous',
    explanationId: 'Gunakan am/is/are + verb-ing untuk kejadian yang sedang berlangsung sekarang.',
    wrong: 'I reading a book now.',
    correct: 'I am reading a book now.',
    quiz: {
      question: 'Complete the sentence: They ______ to the radio.',
      options: ['is listening', 'are listening', 'listening'],
      answer: 'are listening'
    }
  },
  {
    id: 'g3',
    title: 'Past Simple (Regular)',
    explanationId: 'Gunakan bentuk lampau (-ed) untuk kejadian yang sudah selesai.',
    wrong: 'I work yesterday until 9 PM.',
    correct: 'I worked yesterday until 9 PM.',
    quiz: {
      question: 'Past tense of "Talk"?',
      options: ['Talked', 'Talking', 'Talks'],
      answer: 'Talked'
    }
  }
];

export const ACADEMY_BRIDGE: AcademyBridgeLesson[] = [
  {
    id: 'b1',
    title: 'Daily Commute Listening',
    type: 'listening',
    content: 'Hi! My name is Sarah. I live in a big city. Every morning, I take the train to work. It takes about 30 minutes. I usually read a book or listen to music during my commute.',
    indonesianTranslation: 'Hai! Nama saya Sarah. Saya tinggal di kota besar. Setiap pagi, saya naik kereta ke tempat kerja. Membutuhkan waktu sekitar 30 menit. Saya biasanya membaca buku atau mendengarkan musik selama perjalanan.',
    task: 'Listen and identify: How does Sarah go to work?'
  },
  {
    id: 'b2',
    title: 'Describing Your Hometown',
    type: 'speaking',
    content: 'Describe where you live. Mention the name of the city, what it is famous for, and if you like living there.',
    indonesianTranslation: 'Ceritakan tempat tinggalmu. Sebutkan nama kotanya, apa yang terkenal di sana, dan apakah kamu suka tinggal di sana.',
    task: 'Record yourself speaking for 45 seconds.'
  }
];

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
  }
];

export const WRITING_TASKS: WritingTask[] = [
  {
    id: 'w1-t1-wheat',
    topic: 'Global Exports',
    type: TaskType.WRITING_TASK_1_ACADEMIC,
    question: 'The bar chart below shows the amount of wheat exported by five different regions (in millions of tonnes) between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartConfig: {
      type: 'bar',
      xAxisKey: 'name',
      dataKeys: ['2010', '2020'],
      data: [
        { name: 'European Union', '2010': 20, '2020': 35 },
        { name: 'USA', '2010': 30, '2020': 25 },
        { name: 'Canada', '2010': 18, '2020': 24 },
        { name: 'Australia', '2010': 15, '2020': 22 },
        { name: 'Russia', '2010': 10, '2020': 38 }
      ]
    }
  },
  {
    id: 'w1-t1-fastfood',
    topic: 'Dietary Trends',
    type: TaskType.WRITING_TASK_1_ACADEMIC,
    question: 'The line graph below shows the consumption of three types of fast food (in grams per person per year) in Australia between 1975 and 2000. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartConfig: {
      type: 'line',
      // Fixed: Change year to name to satisfy ChartDataItem interface
      xAxisKey: 'name',
      dataKeys: ['Pizza', 'Fish and Chips', 'Hamburgers'],
      data: [
        { name: '1975', 'Pizza': 5, 'Fish and Chips': 100, 'Hamburgers': 10 },
        { name: '1980', 'Pizza': 20, 'Fish and Chips': 95, 'Hamburgers': 30 },
        { name: '1985', 'Pizza': 45, 'Fish and Chips': 90, 'Hamburgers': 80 },
        { name: '1990', 'Pizza': 70, 'Fish and Chips': 85, 'Hamburgers': 110 },
        { name: '1995', 'Pizza': 85, 'Fish and Chips': 75, 'Hamburgers': 125 },
        { name: '2000', 'Pizza': 95, 'Fish and Chips': 65, 'Hamburgers': 140 }
      ]
    }
  },
  {
    id: 'w1-t1-elderly',
    topic: 'Demographics',
    type: TaskType.WRITING_TASK_1_ACADEMIC,
    question: 'The table below shows the percentage of the population aged 65 and over in three countries in 1980, 2000, and 2020, with projections for 2040. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartConfig: {
      type: 'table',
      xAxisKey: 'Country',
      dataKeys: ['1980', '2000', '2020', '2040 (Proj)'],
      data: [
        { name: 'Japan', '1980': 9, '2000': 17, '2020': 28, '2040 (Proj)': 35 },
        { name: 'USA', '1980': 11, '2000': 12, '2020': 16, '2040 (Proj)': 23 },
        { name: 'Sweden', '1980': 14, '2000': 15, '2020': 20, '2040 (Proj)': 25 }
      ]
    }
  },
  {
    id: 'w1-t1-tea',
    topic: 'Manufacturing',
    type: TaskType.WRITING_TASK_1_ACADEMIC,
    question: 'The diagram below shows the various stages in the production of black tea for commercial sale. Summarize the information by selecting and reporting the main features.',
    chartConfig: {
      type: 'process',
      xAxisKey: 'Stage',
      dataKeys: ['Action'],
      data: [
        { name: '1. Plucking', Action: 'Tea leaves are picked from the bushes by hand or machine.' },
        { name: '2. Withering', Action: 'Leaves are spread on racks to dry in the air for 12-20 hours.' },
        { name: '3. Rolling', Action: 'Leaves are crushed by machines to release enzymes and juices.' },
        { name: '4. Fermentation', Action: 'Chemical changes occur in a humid environment, turning leaves dark.' },
        { name: '5. Drying', Action: 'Leaves are heated in ovens to stop fermentation and remove moisture.' },
        { name: '6. Sorting', Action: 'Final tea is graded by size and packaged for sale.' }
      ]
    }
  },
  {
    id: 'w1-t1-waste',
    topic: 'Environment',
    type: TaskType.WRITING_TASK_1_ACADEMIC,
    question: 'The pie chart below shows the proportions of different types of global waste generated in 2023. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartConfig: {
      type: 'pie',
      xAxisKey: 'Waste Type',
      dataKeys: ['value'],
      data: [
        { name: 'Food/Organic', value: 44 },
        { name: 'Paper/Cardboard', value: 17 },
        { name: 'Plastic', value: 12 },
        { name: 'Glass', value: 5 },
        { name: 'Metal', value: 4 },
        { name: 'Other', value: 18 }
      ]
    }
  },
  {
    id: 'w2-edu',
    topic: 'Education',
    type: TaskType.WRITING_TASK_2,
    question: 'Some people believe that students should be allowed to evaluate their teachers. Others argue that this would lead to a lack of discipline in the classroom. Discuss both views and give your own opinion.'
  },
  {
    id: 'w2-tech',
    topic: 'Technology',
    type: TaskType.WRITING_TASK_2,
    question: 'Nowadays, more and more people are using social media as their primary source of news. Is this a positive or negative development?'
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
  }
];

export const APP_THEME = {
  primary: '#2563eb', 
  secondary: '#64748b',
  accent: '#f59e0b',
};
