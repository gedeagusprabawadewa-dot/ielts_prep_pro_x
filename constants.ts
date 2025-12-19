
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
    id: 'w1',
    topic: 'Education',
    type: TaskType.WRITING_TASK_2,
    question: 'Some people believe that students should be allowed to evaluate their teachers. Others argue that this would lead to a lack of discipline in the classroom. Discuss both views and give your own opinion.'
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
