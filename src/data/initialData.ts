import type { MarathonEvent, Participant, RaceResult, EventOptionsConfig, DocumentKey, LegalDocument, EmailTemplate, EmailServerConfig } from '../types/marathon';
import { DEFAULT_ADULT_CATEGORIES, DEFAULT_YOUTH_10K_CATEGORIES, DEFAULT_KIDS_CATEGORIES } from '../utils/ageUtils';

export const DEFAULT_OPTIONS_CONFIG: EventOptionsConfig = {
  enableTShirt: true,
  tShirtPrice: 0,
  enableMedalEngraving: true,
  medalEngravingPrice: 2000,
  enablePastaParty: true,
  pastaPartyPrice: 3500,
  enableCharity: true,
  charityFundName: 'фонд «Бақытты Бала»',
  charityDescription: 'Средства пойдут на закупку спортивной формы для детей из интернатов Актюбинской области',
  enableStartClusters: false
};

// Aktobe center around Central Park / Abilkhayyr Khan Ave: [50.2877, 57.1856]
export const INITIAL_EVENTS: MarathonEvent[] = [
  {
    id: 'aktobe-2026',
    title: 'Aqtobe International Marathon 2026',
    slug: 'aqtobe-marathon-2026',
    subtitle: 'Главный праздник бега и скорости Западного Казахстана',
    date: '2026-05-17T07:00:00',
    displayDate: '17 Мая 2026',
    city: 'г. Актобе',
    location: 'Парк им. Первого Президента / Центральный стадион',
    status: 'registration_open',
    description: 'Масштабный международный забег, сертифицированный AIMS. Быстрая плоская трасса через знаковые проспекты города, поддержка тысяч болельщиков, литые медали финишера и рекордный призовой фонд!',
    bannerImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop',
    resultsUrl: '',
    prizePool: '15 000 000 ₸',
    totalSlots: 4500,
    centerCoords: [50.2877, 57.1856],
    distances: [
      {
        id: 'dist-42k',
        name: '42.195 км',
        tag: 'Марафон AIMS',
        distanceKm: 42.195,
        price: 14000,
        slots: 800,
        registeredCount: 645,
        minAge: 18,
        timeLimit: '6:00:00',
        elevationGain: '+85 м',
        startTime: '07:00',
        badgeColor: 'lime',
        hexColor: '#84cc16',
        features: [
          'Официальная трасса AIMS / World Athletics',
          'Лимитированная литая медаль финишера с эмалью',
          'Премиум футболка Dry-Fit с символикой забега',
          'Хронометражный чип BibTag с онлайн сплитами',
          'Пункты питания и изотоника каждые 3 км',
          'Горячий обед и восстановительная зона на финише',
          'Бесплатные профессиональные фото на трассе',
        ],
        ageCategories: DEFAULT_ADULT_CATEGORIES,
        routeWaypoints: [
          [50.2877, 57.1856],
          [50.2895, 57.1720],
          [50.2940, 57.1650],
          [50.3010, 57.1700],
          [50.3080, 57.1850],
          [50.3120, 57.2020],
          [50.3050, 57.2200],
          [50.2920, 57.2150],
          [50.2830, 57.2010],
          [50.2800, 57.1880],
          [50.2877, 57.1856]
        ],
        points: [
          { id: 'p1', type: 'start', coords: [50.2877, 57.1856], title: 'Стартовая арка', description: 'Старт кластеров A, B, C в 07:00' },
          { id: 'p2', type: 'water', coords: [50.2940, 57.1650], title: 'Пункт питания 5 км', description: 'Вода Tassay, бананы, губки' },
          { id: 'p3', type: 'cheer', coords: [50.3010, 57.1700], title: 'DJ Cheer Zone', description: 'Живые барабаны и поддержка зрителей' },
          { id: 'p4', type: 'timing', coords: [50.3080, 57.1850], title: 'Отсечка 10 км', description: 'Хронометражные маты ChronoTrack' },
          { id: 'p5', type: 'medical', coords: [50.3120, 57.2020], title: 'Медпункт и изотоник 15 км', description: 'Врачи скорой помощи, изотоник Dymatize' },
          { id: 'p6', type: 'timing', coords: [50.3050, 57.2200], title: 'Отсечка 21.1 км (Полумарафон)', description: 'Контрольный пункт половины дистанции' },
          { id: 'p7', type: 'water', coords: [50.2920, 57.2150], title: 'Пункт питания 30 км', description: 'Энергетические гели, кола, вода' },
          { id: 'p8', type: 'finish', coords: [50.2877, 57.1856], title: 'Финишная арка и зона славы', description: 'Вручение медалей и гравировка' }
        ]
      },
      {
        id: 'dist-21k',
        name: '21.097 км',
        tag: 'Полумарафон',
        distanceKm: 21.097,
        price: 11000,
        slots: 1500,
        registeredCount: 1310,
        minAge: 18,
        timeLimit: '3:00:00',
        elevationGain: '+45 м',
        startTime: '07:30',
        badgeColor: 'orange',
        hexColor: '#f97316',
        features: [
          'Самая популярная дистанция забега',
          'Медаль финишера Half-Marathon',
          'Футболка Dry-Fit участника',
          'Чип хронометража со сплитом 10 км',
          'Пункты воды и изотоника каждые 3.5 км',
          'Электронный диплом финишера',
        ],
        ageCategories: DEFAULT_ADULT_CATEGORIES,
        routeWaypoints: [
          [50.2877, 57.1856],
          [50.2895, 57.1720],
          [50.2940, 57.1650],
          [50.3010, 57.1750],
          [50.2980, 57.1950],
          [50.2910, 57.2000],
          [50.2877, 57.1856]
        ],
        points: [
          { id: 'p21-start', type: 'start', coords: [50.2877, 57.1856], title: 'Старт 21.1 км', description: '07:30' },
          { id: 'p21-water', type: 'water', coords: [50.2940, 57.1650], title: 'Вода и изотоник 5 км', description: 'Питание на трассе' },
          { id: 'p21-cheer', type: 'cheer', coords: [50.3010, 57.1750], title: 'Фан-зона и музыка', description: 'Зона активной поддержки' },
          { id: 'p21-finish', type: 'finish', coords: [50.2877, 57.1856], title: 'Финиш Полумарафона', description: 'Медаль и стартовый городок' }
        ]
      },
      {
        id: 'dist-10k',
        name: '10.0 км',
        tag: 'City Sprint',
        distanceKm: 10.0,
        price: 8000,
        slots: 1200,
        registeredCount: 980,
        minAge: 15,
        timeLimit: '1:30:00',
        elevationGain: '+25 м',
        startTime: '08:15',
        badgeColor: 'cyan',
        hexColor: '#06b6d4',
        features: [
          'Идеально для любителей и личных рекордов',
          'Медаль финишера 10K City Run',
          'Стартовый номер с чипом хронометража',
          'Вода и фрукты на трассе и финише',
          'СМС-оповещение с чистым временем',
        ],
        ageCategories: DEFAULT_YOUTH_10K_CATEGORIES,
        routeWaypoints: [
          [50.2877, 57.1856],
          [50.2895, 57.1750],
          [50.2960, 57.1800],
          [50.2950, 57.1930],
          [50.2877, 57.1856]
        ],
        points: [
          { id: 'p10-start', type: 'start', coords: [50.2877, 57.1856], title: 'Старт 10 км', description: '08:15' },
          { id: 'p10-water', type: 'water', coords: [50.2960, 57.1800], title: 'Пункт воды 5 км', description: 'Освежение' },
          { id: 'p10-finish', type: 'finish', coords: [50.2877, 57.1856], title: 'Финиш 10 км', description: 'Арка финишера' }
        ]
      },
      {
        id: 'dist-5k',
        name: '5.0 км',
        tag: 'Fun Run / Скандинавская ходьба',
        distanceKm: 5.0,
        price: 6000,
        slots: 600,
        registeredCount: 470,
        minAge: 12,
        timeLimit: '1:00:00',
        elevationGain: '+10 м',
        startTime: '09:00',
        badgeColor: 'purple',
        hexColor: '#a855f7',
        features: [
          'Забег и северная скандинавская ходьба',
          'Медаль финишера 5K',
          'Красочный стартовый пакет',
          'Подходит для начинающих и семейных команд',
        ],
        ageCategories: DEFAULT_YOUTH_10K_CATEGORIES,
        routeWaypoints: [
          [50.2877, 57.1856],
          [50.2885, 57.1790],
          [50.2920, 57.1820],
          [50.2877, 57.1856]
        ],
        points: [
          { id: 'p5-start', type: 'start', coords: [50.2877, 57.1856], title: 'Старт 5 км', description: '09:00' },
          { id: 'p5-finish', type: 'finish', coords: [50.2877, 57.1856], title: 'Финиш 5 км', description: 'Вручение медалей' }
        ]
      },
      {
        id: 'dist-3k',
        name: '3.0 км Kids',
        tag: 'Детский забег (7-14 лет)',
        distanceKm: 3.0,
        price: 4000,
        slots: 400,
        registeredCount: 320,
        minAge: 7,
        timeLimit: '0:45:00',
        elevationGain: '+5 м',
        startTime: '09:45',
        badgeColor: 'amber',
        hexColor: '#f59e0b',
        features: [
          'Специальная детская дистанция в парке',
          'Яркая памятная медаль каждому ребенку',
          'Детская анимация и подарки от спонсоров',
          'Безопасный перекрытый маршрут без машин',
        ],
        ageCategories: DEFAULT_KIDS_CATEGORIES,
        routeWaypoints: [
          [50.2877, 57.1856],
          [50.2860, 57.1810],
          [50.2890, 57.1830],
          [50.2877, 57.1856]
        ],
        points: [
          { id: 'p3-start', type: 'start', coords: [50.2877, 57.1856], title: 'Старт Kids Run', description: '09:45' },
          { id: 'p3-finish', type: 'finish', coords: [50.2877, 57.1856], title: 'Финиш Kids Run', description: 'Сладкие призы и медали' }
        ]
      }
    ],
    schedule: [
      {
        date: '15 Мая 2026',
        dayName: 'Пятница — День 1',
        items: [
          { time: '10:00 - 20:00', title: 'Открытие Sport Expo & Выдача стартовых пакетов', location: 'Дворец Единоборств "Жекпе-жек"', category: 'expo' },
          { time: '14:00 - 18:00', title: 'Лекторий: спортивное питание и тактика на марафон', location: 'Конференц-зал Экспо', category: 'social' },
          { time: '17:00 - 18:00', title: 'Shakeout Run (Легкая пробежка с пейсмейкерами)', location: 'Парк Первого Президента', category: 'social' }
        ]
      },
      {
        date: '16 Мая 2026',
        dayName: 'Суббота — День 2',
        items: [
          { time: '10:00 - 19:00', title: 'Выдача стартовых пакетов для иногородних', location: 'Дворец "Жекпе-жек"', category: 'expo' },
          { time: '16:00 - 19:00', title: 'Традиционная Pasta Party для участников 42.2 км и 21.1 км', location: 'Food Village у Экспо', category: 'social' },
          { time: '18:00 - 18:45', title: 'Брифинг элитных атлетов и координация пейсмейкеров', location: 'Сцена Экспо', category: 'expo' }
        ]
      },
      {
        date: '17 Мая 2026',
        dayName: 'Воскресенье — RACE DAY (ДЕНЬ СТАРТА)',
        items: [
          { time: '06:00', title: 'Открытие стартово-финишного городка и камер хранения', location: 'Центральная площадь', category: 'start' },
          { time: '06:30', title: 'Официальная разминка с олимпийскими чемпионами', location: 'Главная сцена', category: 'start' },
          { time: '07:00', title: 'СТАРТ ДИСТАНЦИИ 42.195 км (Марафон)', location: 'Стартовая арка', category: 'start' },
          { time: '07:30', title: 'СТАРТ ДИСТАНЦИИ 21.097 км (Полумарафон)', location: 'Стартовая арка', category: 'start' },
          { time: '08:15', title: 'СТАРТ ДИСТАНЦИИ 10 км', location: 'Стартовая арка', category: 'start' },
          { time: '09:00', title: 'СТАРТ ДИСТАНЦИИ 5 км & Скандинавская ходьба', location: 'Стартовая арка', category: 'start' },
          { time: '09:45', title: 'СТАРТ ДИСТАНЦИИ 3 км Kids', location: 'Стартовая арка', category: 'start' },
          { time: '11:30', title: 'Торжественная церемония награждения абсолютных победителей', location: 'Главная сцена', category: 'award' },
          { time: '13:00', title: 'Закрытие финишной линии и праздничный концерт', location: 'Главная сцена', category: 'social' }
        ]
      }
    ],
    sponsors: [
      { id: 'sp-1', name: 'ERG / Казхром', tier: 'title', logoText: 'ERG', accent: '#00d26a' },
      { id: 'sp-2', name: 'Kaspi.kz', tier: 'general', logoText: 'Kaspi Pay', accent: '#f14635' },
      { id: 'sp-3', name: 'Tassay', tier: 'official', logoText: 'TASSAY WATER', accent: '#00a3e0' },
      { id: 'sp-4', name: 'Nike Running', tier: 'technical', logoText: 'NIKE PRO', accent: '#ffffff' },
      { id: 'sp-5', name: 'Dymatize Isotonic', tier: 'official', logoText: 'DYMATIZE', accent: '#f59e0b' },
      { id: 'sp-6', name: 'Tengri Sport', tier: 'media', logoText: 'TENGRI SPORT', accent: '#3b82f6' }
    ],
    optionsConfig: DEFAULT_OPTIONS_CONFIG
  },
  {
    id: 'khromtau-trail-2026',
    title: 'Khromtau Industrial Trail 2026',
    slug: 'khromtau-trail-2026',
    subtitle: 'Экстремальный трейл по марсианским ландшафтам Хромтау',
    date: '2026-06-27T08:00:00',
    displayDate: '27 Июня 2026',
    city: 'г. Хромтау',
    location: 'Каньон Донского ГОК',
    status: 'coming_soon',
    description: 'Уникальный индустриальный трейл среди гигантских хромитовых карьеров и степных хребтов Мугоджар. Проверь свой дух на каменистых подъемах!',
    bannerImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1600&auto=format&fit=crop',
    prizePool: '5 000 000 ₸',
    totalSlots: 1000,
    centerCoords: [50.2520, 58.4350],
    distances: [
      {
        id: 'trail-30k',
        name: '30.0 км Ultra',
        tag: 'Горный трейл',
        distanceKm: 30.0,
        price: 15000,
        slots: 300,
        registeredCount: 140,
        minAge: 18,
        timeLimit: '5:00:00',
        elevationGain: '+620 м',
        startTime: '08:00',
        badgeColor: 'orange',
        hexColor: '#ea580c',
        features: ['Набор высоты 620м', 'Обязательное снаряжение', 'Медаль с хромитовой рудой'],
        ageCategories: DEFAULT_ADULT_CATEGORIES,
        routeWaypoints: [[50.2520, 58.4350], [50.2600, 58.4500], [50.2520, 58.4350]],
        points: [{ id: 'tr1', type: 'start', coords: [50.2520, 58.4350], title: 'Старт Трейла', description: '08:00' }]
      },
      {
        id: 'trail-15k',
        name: '15.0 км Speed',
        tag: 'Трейловый спринт',
        distanceKm: 15.0,
        price: 10000,
        slots: 700,
        registeredCount: 380,
        minAge: 16,
        timeLimit: '2:30:00',
        elevationGain: '+280 м',
        startTime: '08:30',
        badgeColor: 'lime',
        hexColor: '#84cc16',
        features: ['Степные каньоны', 'Медаль финишера', 'Питание на трассе'],
        ageCategories: DEFAULT_YOUTH_10K_CATEGORIES,
        routeWaypoints: [[50.2520, 58.4350], [50.2570, 58.4420], [50.2520, 58.4350]],
        points: [{ id: 'tr2', type: 'start', coords: [50.2520, 58.4350], title: 'Старт 15 км', description: '08:30' }]
      }
    ],
    schedule: [],
    sponsors: [],
    optionsConfig: DEFAULT_OPTIONS_CONFIG
  }
];

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'part-01',
    eventId: 'aktobe-2026',
    distanceId: 'dist-42k',
    distanceName: '42.195 км',
    bibNumber: '42-101',
    firstName: 'Алибек',
    lastName: 'Жумагулов',
    gender: 'male',
    birthDate: '1992-04-12',
    age: 34,
    ageCategory: '26-35 лет',
    email: 'alibek.run@gmail.com',
    phone: '+7 705 123 45 67',
    city: 'Актобе',
    country: 'Казахстан',
    club: 'Aqtobe Runners Club',
    wantsTShirt: true,
    tShirtSize: 'L',
    emergencyContact: '+7 705 987 65 43 (Супруга Алия)',
    medalEngraving: true,
    pastaParty: true,
    charityContribution: 5000,
    totalAmount: 24500,
    paymentStatus: 'paid',
    paymentMethod: 'kaspi',
    registrationDate: '2026-03-10T14:22:00',
    checkedInExpo: true
  },
  {
    id: 'part-02',
    eventId: 'aktobe-2026',
    distanceId: 'dist-42k',
    distanceName: '42.195 км',
    bibNumber: '42-102',
    firstName: 'Елена',
    lastName: 'Смирнова',
    gender: 'female',
    birthDate: '1995-08-23',
    age: 30,
    ageCategory: '26-35 лет',
    email: 'elena.marathon@mail.ru',
    phone: '+7 777 234 56 78',
    city: 'Алматы',
    country: 'Казахстан',
    club: 'Almaty Marathon Team',
    wantsTShirt: true,
    tShirtSize: 'S',
    emergencyContact: '+7 777 999 88 77 (Брат Дмитрий)',
    medalEngraving: true,
    pastaParty: false,
    charityContribution: 2000,
    totalAmount: 18000,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    registrationDate: '2026-03-11T11:05:00',
    checkedInExpo: false
  },
  {
    id: 'part-03',
    eventId: 'aktobe-2026',
    distanceId: 'dist-21k',
    distanceName: '21.097 км',
    bibNumber: '21-201',
    firstName: 'Данияр',
    lastName: 'Султанов',
    gender: 'male',
    birthDate: '1988-11-05',
    age: 37,
    ageCategory: '36-45 лет',
    email: 'daniyar.s@yahoo.com',
    phone: '+7 701 555 12 34',
    city: 'Астана',
    country: 'Казахстан',
    club: 'Nomad Runners',
    wantsTShirt: true,
    tShirtSize: 'M',
    emergencyContact: '+7 701 444 33 22',
    medalEngraving: false,
    pastaParty: true,
    charityContribution: 0,
    totalAmount: 14500,
    paymentStatus: 'paid',
    paymentMethod: 'kaspi',
    registrationDate: '2026-03-12T16:40:00',
    checkedInExpo: true
  },
  {
    id: 'part-04',
    eventId: 'aktobe-2026',
    distanceId: 'dist-21k',
    distanceName: '21.097 км',
    bibNumber: '21-202',
    firstName: 'Айгерим',
    lastName: 'Касымова',
    gender: 'female',
    birthDate: '1998-02-17',
    age: 28,
    ageCategory: '26-35 лет',
    email: 'aigerim.k@inbox.kz',
    phone: '+7 708 777 44 11',
    city: 'Актобе',
    country: 'Казахстан',
    club: 'IronGirls Aqtobe',
    wantsTShirt: true,
    tShirtSize: 'XS',
    emergencyContact: '+7 708 111 22 33',
    medalEngraving: true,
    pastaParty: false,
    charityContribution: 1000,
    totalAmount: 14000,
    paymentStatus: 'paid',
    paymentMethod: 'apple_pay',
    registrationDate: '2026-03-14T09:15:00',
    checkedInExpo: false
  },
  {
    id: 'part-05',
    eventId: 'aktobe-2026',
    distanceId: 'dist-10k',
    distanceName: '10.0 км',
    bibNumber: '10-501',
    firstName: 'Нурлан',
    lastName: 'Байзаков',
    gender: 'male',
    birthDate: '2001-07-30',
    age: 24,
    ageCategory: '18-25 лет',
    email: 'nurlan.b@gmail.com',
    phone: '+7 702 333 44 55',
    city: 'Уральск',
    country: 'Казахстан',
    club: 'West Athletics',
    wantsTShirt: true,
    tShirtSize: 'L',
    emergencyContact: '+7 702 666 77 88',
    medalEngraving: false,
    pastaParty: false,
    charityContribution: 0,
    totalAmount: 8000,
    paymentStatus: 'paid',
    paymentMethod: 'kaspi',
    registrationDate: '2026-03-15T18:22:00',
    checkedInExpo: false
  },
  {
    id: 'part-06',
    eventId: 'aktobe-2026',
    distanceId: 'dist-5k',
    distanceName: '5.0 км',
    bibNumber: '05-701',
    firstName: 'Гульнара',
    lastName: 'Ибраева',
    gender: 'female',
    birthDate: '1980-05-14',
    age: 46,
    ageCategory: '46-55 лет',
    email: 'gulnara.nordic@mail.kz',
    phone: '+7 705 444 88 99',
    city: 'Актобе',
    country: 'Казахстан',
    club: 'Aqtobe Nordic Walkers',
    wantsTShirt: true,
    tShirtSize: 'M',
    emergencyContact: '+7 705 111 00 22',
    medalEngraving: true,
    pastaParty: false,
    charityContribution: 3000,
    totalAmount: 11000,
    paymentStatus: 'paid',
    paymentMethod: 'card',
    registrationDate: '2026-03-16T12:00:00',
    checkedInExpo: true
  },
  {
    id: 'part-07',
    eventId: 'aktobe-2026',
    distanceId: 'dist-3k',
    distanceName: '3.0 км Kids',
    bibNumber: '03-901',
    firstName: 'Санжар',
    lastName: 'Амангельды',
    gender: 'male',
    birthDate: '2016-09-10',
    age: 9,
    ageCategory: '7-10 лет (Младшие)',
    email: 'amangeldy.parent@gmail.com',
    phone: '+7 771 999 00 11',
    city: 'Актобе',
    country: 'Казахстан',
    club: 'Junior Runner Stars',
    wantsTShirt: true,
    tShirtSize: 'XS',
    emergencyContact: '+7 771 999 00 11 (Отец Марат)',
    medalEngraving: false,
    pastaParty: false,
    charityContribution: 1000,
    totalAmount: 5000,
    paymentStatus: 'paid',
    paymentMethod: 'kaspi',
    registrationDate: '2026-03-18T10:30:00',
    checkedInExpo: false
  }
];

export const INITIAL_RESULTS: RaceResult[] = [
  {
    id: 'res-1',
    bibNumber: '42-101',
    fullName: 'Ильяс Сагиндыков',
    gender: 'M',
    ageGroup: 'M 18-29',
    distanceName: '42.195 км',
    chipTime: '02:18:42',
    gunTime: '02:18:45',
    avgPace: '3:17 мин/км',
    overallPlace: 1,
    genderPlace: 1,
    categoryPlace: 1,
    splits: { split10k: '00:32:40', split21k: '01:09:15', split30k: '01:38:20' }
  },
  {
    id: 'res-2',
    bibNumber: '42-105',
    fullName: 'Кевин Кипротич',
    gender: 'M',
    ageGroup: 'M 30-39',
    distanceName: '42.195 км',
    chipTime: '02:21:10',
    gunTime: '02:21:12',
    avgPace: '3:20 мин/км',
    overallPlace: 2,
    genderPlace: 2,
    categoryPlace: 1,
    splits: { split10k: '00:32:42', split21k: '01:09:30', split30k: '01:39:50' }
  },
  {
    id: 'res-3',
    bibNumber: '42-114',
    fullName: 'Жанна Мамажанова',
    gender: 'F',
    ageGroup: 'F 18-29',
    distanceName: '42.195 км',
    chipTime: '02:32:15',
    gunTime: '02:32:18',
    avgPace: '3:36 мин/км',
    overallPlace: 7,
    genderPlace: 1,
    categoryPlace: 1,
    splits: { split10k: '00:35:50', split21k: '01:15:40', split30k: '01:48:10' }
  },
  {
    id: 'res-4',
    bibNumber: '21-201',
    fullName: 'Данияр Султанов',
    gender: 'M',
    ageGroup: 'M 30-39',
    distanceName: '21.097 км',
    chipTime: '01:14:22',
    gunTime: '01:14:25',
    avgPace: '3:31 мин/км',
    overallPlace: 1,
    genderPlace: 1,
    categoryPlace: 1,
    splits: { split10k: '00:35:10' }
  },
  {
    id: 'res-5',
    bibNumber: '21-204',
    fullName: 'Мадина Каримова',
    gender: 'F',
    ageGroup: 'F 18-29',
    distanceName: '21.097 км',
    chipTime: '01:22:50',
    gunTime: '01:22:55',
    avgPace: '3:55 мин/км',
    overallPlace: 8,
    genderPlace: 1,
    categoryPlace: 1,
    splits: { split10k: '00:39:15' }
  },
  {
    id: 'res-6',
    bibNumber: '10-501',
    fullName: 'Нурлан Байзаков',
    gender: 'M',
    ageGroup: 'M 18-29',
    distanceName: '10.0 км',
    chipTime: '00:33:14',
    gunTime: '00:33:16',
    avgPace: '3:19 мин/км',
    overallPlace: 1,
    genderPlace: 1,
    categoryPlace: 1,
    splits: { split5k: '00:16:30' }
  }
];

export const INITIAL_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'regulation',
    key: 'regulation',
    title: 'Официальное Положение забега (PDF)',
    subtitle: 'AQTOBE INTERNATIONAL MARATHON 2026',
    date: 'Утверждено Оргкомитетом и Управлением спорта',
    fileName: 'Polozhenie_Aqtobe_2026.pdf',
    fileSize: '1.2 МБ'
  },
  {
    id: 'offer',
    key: 'offer',
    title: 'Договор публичной оферты',
    subtitle: 'AQTOBE INTERNATIONAL MARATHON',
    date: 'Редакция от 01 января 2026 года',
    fileName: 'Oferta_Aqtobe_2026.pdf',
    fileSize: '340 КБ'
  },
  {
    id: 'privacy',
    key: 'privacy',
    title: 'Политика конфиденциальности',
    subtitle: 'Обработка персональных данных участников',
    date: 'Редакция от 01 января 2026 года',
    fileName: 'Privacy_Policy_Aqtobe.pdf',
    fileSize: '210 КБ'
  },
  {
    id: 'medical',
    key: 'medical',
    title: 'Медицинские требования и справки',
    subtitle: 'Правила допуска к старту и медицинский регламент',
    date: 'Редакция от 01 января 2026 года',
    fileName: 'Medical_Requirements_Aqtobe.pdf',
    fileSize: '180 КБ'
  },
  {
    id: 'transfer',
    key: 'transfer',
    title: 'Правила передачи стартового слота',
    subtitle: 'Порядок перерегистрации слота на другого участника',
    date: 'Редакция от 01 января 2026 года',
    fileName: 'Slot_Transfer_Rules.pdf',
    fileSize: '150 КБ'
  }
];

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_registration_open',
    name: '🚀 Открытие регистрации на новый забег',
    subject: '🚀 Открыта регистрация на Aqtobe International Marathon 2026!',
    bannerImageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop',
    badgeText: 'ОФИЦИАЛЬНЫЙ АНОНС СЕЗОНА',
    title: 'РЕГИСТРАЦИЯ НА AQTOBE MARATHON 2026 ОТКРЫТА!',
    greetingText: 'Здравствуйте, {NAME}!',
    mainBodyText: `Рады сообщить, что регистрация на главное легкоатлетическое событие Западного Казахстана официально открыта!

Вас ждут сертифицированные трассы AIMS, быстрый плоский маршрут через центральные проспекты города, литые медали финишера, мощная поддержка тысяч болельщиков и рекордный призовой фонд 15 000 000 ₸.

Доступны дистанции: 42.195 км (Классический марафон), 21.097 км (Полумарафон), 10 км, Скандинавская ходьба и Детский забег 3 км.`,
    highlightBoxTitle: '🔥 РАННЯЯ РЕГИСТРАЦИЯ (EARLY BIRD)',
    highlightBoxText: 'Первые 500 слотов доступны по специальной стартовой стоимости. Количество участников на дистанциях ограничено — успейте забронировать свой номер!',
    ctaButtonText: 'ВЫБРАТЬ ДИСТАНЦИЮ И ЗАРЕГИСТРИРОВАТЬСЯ',
    ctaButtonUrl: 'https://aktobe-marathoncom.vercel.app/',
    footerNote: 'Поторопитесь, слоты на популярные дистанции быстро заканчиваются!'
  },
  {
    id: 'tpl_expo_info',
    name: '📢 Выдача стартовых пакетов (Expo)',
    subject: '📢 Важная информация: Выдача стартовых пакетов Expo на Aqtobe Marathon',
    bannerImageUrl: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=1200&auto=format&fit=crop',
    badgeText: 'ИНФОРМАЦИЯ ДЛЯ УЧАСТНИКОВ',
    title: 'ИНСТРУКЦИЯ ПО ПОЛУЧЕНИЮ СТАРТОВОГО ПАКЕТА',
    greetingText: 'Уважаемый(ая) {NAME}!',
    mainBodyText: `До старта Aqtobe Marathon остаются считанные дни! 

Спортивная выставка Expo и выдача стартовых номеров пройдут 15 и 16 мая в Спортивном комплексе «Коныс» с 10:00 до 20:00.

Для получения стартового пакета вам понадобятся:
1. Документ, удостоверяющий личность (удостоверение или паспорт).
2. Медицинская справка о допуске (для дистанций 21.1 км и 42.2 км).
3. Ваш электронный билет / стартовый номер из письма подтверждения.`,
    highlightBoxTitle: '⚠️ ОБРАТИТЕ ВНИМАНИЕ',
    highlightBoxText: 'В день старта 17 мая выдача стартовых пакетов производиться НЕ БУДЕТ. Пожалуйста, заберите ваш стартовый пакет заранее на Expo!',
    ctaButtonText: 'СМОТРЕТЬ РАСПИСАНИЕ И ЛОКАЦИЮ EXPO',
    ctaButtonUrl: 'https://aktobe-marathoncom.vercel.app/#schedule',
    footerNote: 'Ждем вас на спортивной ярмарке Expo!'
  },
  {
    id: 'tpl_custom_announcement',
    name: '✉️ Информационное сообщение оргкомитета',
    subject: 'Важное сообщение от оргкомитета Aqtobe Marathon',
    bannerImageUrl: '',
    badgeText: 'НОВОСТИ И ОБНОВЛЕНИЯ',
    title: 'СООБЩЕНИЕ ДЛЯ БЕГОВОГО СООБЩЕСТВА',
    greetingText: 'Приветствуем, {NAME}!',
    mainBodyText: `Оргкомитет Aqtobe International Marathon приветствует вас и делится важными новостями подготовки к новому беговому сезону.

Мы подготовили для вас обновленные сертифицированные маршруты, улучшенные пункты питания и гидратации каждые 3 км, а также эксклюзивный дизайн медалей финишера.`,
    highlightBoxTitle: '💡 БУДЬТЕ В КУРСЕ',
    highlightBoxText: 'Следите за новостями в наших официальных соцсетях и на сайте мероприятия.',
    ctaButtonText: 'ПЕРЕЙТИ НА САЙТ ЗАБЕГА',
    ctaButtonUrl: 'https://aktobe-marathoncom.vercel.app/',
    footerNote: 'С уважением, Команда Aqtobe Marathon'
  }
];

export const DEFAULT_EMAIL_SERVER_CONFIG: EmailServerConfig = {
  provider: 'demo',
  fromName: 'Aqtobe International Marathon',
  fromEmail: 'noreply@aktobe-marathon.com',
  smtpHost: 'smtp.yandex.ru',
  smtpPort: 465,
  smtpSecure: true
};
