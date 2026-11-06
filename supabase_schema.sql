-- =========================================================================
-- AQTOBE MARATHON PLATFORM — ПОЛНАЯ СХЕМА SQL БАЗЫ ДАННЫХ (SUPABASE / POSTGRESQL)
-- Скопируйте этот скрипт и вставьте в Supabase -> SQL Editor -> Run
-- =========================================================================

-- 1. ТАБЛИЦА МЕРОПРИЯТИЙ (EVENTS)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    subtitle TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    display_date TEXT NOT NULL,
    city TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'registration_open', -- 'registration_open', 'coming_soon', 'sold_out', 'completed'
    description TEXT,
    banner_image TEXT,
    prize_pool TEXT,
    total_slots INT NOT NULL DEFAULT 4500,
    center_coords JSONB DEFAULT '[50.2877, 57.1856]'::jsonb,
    distances JSONB NOT NULL DEFAULT '[]'::jsonb,
    schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    sponsors JSONB NOT NULL DEFAULT '[]'::jsonb,
    options_config JSONB DEFAULT '{
        "enableTShirt": true,
        "tShirtPrice": 0,
        "enableMedalEngraving": true,
        "medalEngravingPrice": 2000,
        "enablePastaParty": true,
        "pastaPartyPrice": 3500,
        "enableCharity": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ТАБЛИЦА УЧАСТНИКОВ (PARTICIPANTS CRM)
CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    distance_id TEXT NOT NULL,
    distance_name TEXT NOT NULL,
    bib_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL, -- 'male' | 'female'
    birth_date DATE NOT NULL,
    age INT NOT NULL,
    age_category TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'Казахстан',
    club TEXT,
    wants_tshirt BOOLEAN DEFAULT false,
    tshirt_size TEXT,
    emergency_contact TEXT,
    medal_engraving BOOLEAN DEFAULT false,
    pasta_party BOOLEAN DEFAULT false,
    charity_contribution INT DEFAULT 0,
    total_amount INT NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'paid', -- 'paid' | 'pending' | 'failed'
    payment_method TEXT NOT NULL DEFAULT 'kaspi', -- 'kaspi' | 'card' | 'apple_pay'
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    checked_in_expo BOOLEAN DEFAULT false,
    checked_in_time TIMESTAMP WITH TIME ZONE
);

-- 3. ТАБЛИЦА ФИНИШНЫХ РЕЗУЛЬТАТОВ (RACE RESULTS)
CREATE TABLE IF NOT EXISTS race_results (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    distance_id TEXT NOT NULL,
    distance_name TEXT NOT NULL,
    bib_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INT NOT NULL,
    age_category TEXT NOT NULL,
    city TEXT,
    club TEXT,
    gun_time TEXT NOT NULL,
    chip_time TEXT NOT NULL,
    pace TEXT NOT NULL,
    overall_place INT NOT NULL,
    gender_place INT NOT NULL,
    category_place INT NOT NULL,
    splits JSONB DEFAULT '{}'::jsonb
);

-- 4. НАСТРОЙКА БЕЗОПАСНОСТИ (ROW LEVEL SECURITY - RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

-- Политики для событий: читать могут все, менять может админ/anon
CREATE POLICY "Public events can be viewed by anyone" ON events FOR SELECT USING (true);
CREATE POLICY "Enable insert/update/delete for events" ON events FOR ALL USING (true);

-- Политики для участников: регистрация доступна всем (INSERT), просмотр списка (SELECT)
CREATE POLICY "Public participants view" ON participants FOR SELECT USING (true);
CREATE POLICY "Public registration insert" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for participants" ON participants FOR UPDATE USING (true);
CREATE POLICY "Enable delete for participants" ON participants FOR DELETE USING (true);

-- Политики для результатов забега: смотреть могут все
CREATE POLICY "Public race results view" ON race_results FOR SELECT USING (true);
CREATE POLICY "Enable manage race results" ON race_results FOR ALL USING (true);

-- 5. ИНДЕКСЫ ДЛЯ БЫСТРОГО ПОИСКА
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_bib ON participants(bib_number);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_results_event_distance ON race_results(event_id, distance_id);
CREATE INDEX IF NOT EXISTS idx_results_bib ON race_results(bib_number);

-- =========================================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (Aqtobe International Marathon 2026)
-- =========================================================================
INSERT INTO events (
    id, title, slug, subtitle, date, display_date, city, location, status, description, 
    banner_image, prize_pool, total_slots, distances
) VALUES (
    'aktobe-2026',
    'Aqtobe International Marathon 2026',
    'aqtobe-marathon-2026',
    'Главный праздник бега и скорости Западного Казахстана',
    '2026-05-17T07:00:00+05:00',
    '17 Мая 2026',
    'г. Актобе',
    'Парк им. Первого Президента / Центральный стадион',
    'registration_open',
    'Масштабный международный забег, сертифицированный AIMS. Быстрая плоская трасса через знаковые проспекты города, поддержка тысяч болельщиков, литые медали финишера и рекордный призовой фонд!',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop',
    '15 000 000 ₸',
    4500,
    '[
      {
        "id": "dist-42k",
        "name": "42.195 км",
        "tag": "Марафон AIMS",
        "distanceKm": 42.195,
        "price": 14000,
        "slots": 800,
        "registeredCount": 645,
        "minAge": 18,
        "timeLimit": "6:00:00",
        "elevationGain": "+85 м",
        "startTime": "07:00",
        "badgeColor": "lime",
        "hexColor": "#84cc16",
        "features": [
          "Официальная трасса AIMS / World Athletics",
          "Лимитированная литая медаль финишера с эмалью",
          "Премиум футболка Dry-Fit с символикой забега",
          "Хронометражный чип BibTag с онлайн сплитами",
          "Пункты питания и изотоника каждые 3 км",
          "Горячий обед и восстановительная зона на финише"
        ]
      },
      {
        "id": "dist-21k",
        "name": "21.097 км",
        "tag": "Полумарафон",
        "distanceKm": 21.097,
        "price": 11000,
        "slots": 1500,
        "registeredCount": 1310,
        "minAge": 18,
        "timeLimit": "3:00:00",
        "elevationGain": "+45 м",
        "startTime": "07:30",
        "badgeColor": "orange",
        "hexColor": "#f97316",
        "features": [
          "Самая популярная дистанция забега",
          "Медаль финишера Half-Marathon",
          "Футболка Dry-Fit участника",
          "Чип хронометража со сплитом 10 км",
          "Пункты воды и изотоника каждые 3.5 км"
        ]
      },
      {
        "id": "dist-10k",
        "name": "10.0 км",
        "tag": "Скоростная десятка",
        "distanceKm": 10.0,
        "price": 8500,
        "slots": 1200,
        "registeredCount": 980,
        "minAge": 15,
        "timeLimit": "1:30:00",
        "elevationGain": "+20 м",
        "startTime": "08:15",
        "badgeColor": "cyan",
        "hexColor": "#06b6d4",
        "features": [
          "Быстрый плоский асфальт для личных рекордов",
          "Медаль финишера 10K",
          "Футболка участника",
          "Хронометраж и смс с результатом"
        ]
      },
      {
        "id": "dist-5k",
        "name": "5.0 км",
        "tag": "Fun Run / Скандинавская ходьба",
        "distanceKm": 5.0,
        "price": 6000,
        "slots": 600,
        "registeredCount": 470,
        "minAge": 12,
        "timeLimit": "1:00:00",
        "elevationGain": "+10 м",
        "startTime": "09:00",
        "badgeColor": "purple",
        "hexColor": "#a855f7",
        "features": [
          "Забег и северная скандинавская ходьба",
          "Медаль финишера 5K",
          "Красочный стартовый пакет"
        ]
      },
      {
        "id": "dist-3k",
        "name": "3.0 км Kids",
        "tag": "Детский забег (7-14 лет)",
        "distanceKm": 3.0,
        "price": 4000,
        "slots": 400,
        "registeredCount": 320,
        "minAge": 7,
        "timeLimit": "0:45:00",
        "elevationGain": "+5 м",
        "startTime": "09:45",
        "badgeColor": "amber",
        "hexColor": "#f59e0b",
        "features": [
          "Специальная детская дистанция в парке",
          "Яркая памятная медаль каждому ребенку",
          "Детская анимация и подарки"
        ]
      }
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;
