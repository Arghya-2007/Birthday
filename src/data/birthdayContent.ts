export interface Scene {
  id: string
  sceneLabel: string
  text: string | null
  subtext: string | null
  frameStart: number
  frameEnd: number
  position: 'left' | 'right' | 'center'
}

export interface FinalMessage {
  title: string
  name: string
  message: string
  from: string
}

export interface BirthdayContent {
  recipientName: string
  birthdayDate: string
  hero: {
    title: string
    subtitle: string
  }
  scenes: Scene[]
  traits: string[]
  devReference: string
  finalMessage: FinalMessage
  audio: {
    ambient: string
    birthday: string
  }
}

export const birthdayContent: BirthdayContent = {
  recipientName: 'Antara',
  birthdayDate: '13th August',

  hero: {
    title: 'For someone special.',
    subtitle: 'A moment, just for you.',
  },

  scenes: [
    {
      id: 'scene-01',
      sceneLabel: 'SCENE 01',
      text: 'Some people enter our lives quietly...',
      subtext: 'and somehow, change everything.',
      frameStart: 20,
      frameEnd: 50,
      position: 'left',
    },
    {
      id: 'scene-02',
      sceneLabel: 'SCENE 02',
      text: 'The little things matter most.',
      subtext: null,
      frameStart: 65,
      frameEnd: 95,
      position: 'right',
    },
    {
      id: 'scene-03',
      sceneLabel: 'SCENE 03',
      text: null,
      subtext: null,
      frameStart: 110,
      frameEnd: 140,
      position: 'center',
    },
    {
      id: 'scene-04',
      sceneLabel: 'SCENE 04',
      text: 'Through all our classes and shared laughs,\nyou\'ve brought so much light into my days.\nThank you for being such an amazing friend.',
      subtext: null,
      frameStart: 155,
      frameEnd: 185,
      position: 'center',
    },
    {
      id: 'scene-05',
      sceneLabel: 'SCENE 05',
      text: 'But there is one last surprise...',
      subtext: null,
      frameStart: 200,
      frameEnd: 230,
      position: 'center',
    },
  ],

  traits: [
    'Friendly',
    'Calm',
    'Funny',
    'Energetic',
    'Hardworking',
    'Caring',
    'Honest',
    'Kind',
    'Loyal',
    'Sincere',
    'Optimistic',
    'Beautiful',
    'Pretty',
    'Cute',
    'Smart',
    'Intelligent',
  ],

  devReference: 'Still shipping dreams, one commit at a time. 🚀',

  finalMessage: {
    title: 'Happy Birthday!',
    name: 'Antara',
    message: 'From surviving long lectures together to all the unforgettable memories we\'ve shared, I am so incredibly grateful to have you as both a classmate and a friend. May your special day be just as beautiful, bright, and wonderful as you are. Here\'s to more laughs and great moments ahead!',
    from: 'Your Friend',
  },

  audio: {
    ambient: '/audio/ambient.mp3',
    birthday: '/audio/birthday.mp3',
  },
}
