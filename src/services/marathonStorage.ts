import type { MarathonEvent, Participant, RaceResult, Distance, DocumentKey, LegalDocument } from '../types/marathon';
import { INITIAL_EVENTS, INITIAL_PARTICIPANTS, INITIAL_RESULTS, INITIAL_LEGAL_DOCUMENTS } from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import * as XLSX from 'xlsx';

const STORAGE_KEY_EVENTS = 'qazaq_run_events_v2';
const STORAGE_KEY_PARTICIPANTS = 'qazaq_run_participants_v2';
const STORAGE_KEY_RESULTS = 'qazaq_run_results_v2';
const STORAGE_KEY_DOCUMENTS = 'qazaq_run_documents_v2';

function eventToDb(e: MarathonEvent) {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug || e.id,
    subtitle: e.subtitle || '',
    date: e.date,
    display_date: e.displayDate,
    city: e.city,
    location: e.location,
    status: e.status,
    description: e.description || '',
    banner_image: e.bannerImage || '',
    prize_pool: e.prizePool || '',
    total_slots: e.totalSlots || 4500,
    center_coords: e.centerCoords,
    distances: e.distances,
    schedule: e.schedule || [],
    sponsors: e.sponsors || [],
    options_config: e.optionsConfig
  };
}

function dbToEvent(row: any): MarathonEvent {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || row.id,
    subtitle: row.subtitle,
    date: row.date,
    displayDate: row.display_date || row.displayDate,
    city: row.city,
    location: row.location,
    status: row.status,
    description: row.description,
    bannerImage: row.banner_image || row.bannerImage,
    prizePool: row.prize_pool || row.prizePool,
    totalSlots: row.total_slots || row.totalSlots,
    centerCoords: row.center_coords || row.centerCoords || [50.2877, 57.1856],
    distances: row.distances || [],
    schedule: row.schedule || [],
    sponsors: row.sponsors || [],
    optionsConfig: row.options_config || row.optionsConfig
  };
}

function participantToDb(p: Participant) {
  return {
    id: p.id,
    event_id: p.eventId,
    distance_id: p.distanceId,
    distance_name: p.distanceName,
    bib_number: p.bibNumber,
    first_name: p.firstName,
    last_name: p.lastName,
    gender: p.gender,
    birth_date: p.birthDate,
    age: p.age,
    age_category: p.ageCategory,
    email: p.email,
    phone: p.phone,
    city: p.city,
    country: p.country || 'Казахстан',
    club: p.club || '',
    wants_tshirt: Boolean(p.wantsTShirt),
    tshirt_size: p.tShirtSize || null,
    emergency_contact: p.emergencyContact || '',
    medal_engraving: Boolean(p.medalEngraving),
    pasta_party: Boolean(p.pastaParty),
    charity_contribution: p.charityContribution || 0,
    total_amount: p.totalAmount,
    payment_status: p.paymentStatus || 'paid',
    payment_method: p.paymentMethod || 'kaspi',
    registration_date: p.registrationDate,
    checked_in_expo: Boolean(p.checkedInExpo)
  };
}

function dbToParticipant(row: any): Participant {
  return {
    id: row.id,
    eventId: row.event_id || row.eventId,
    distanceId: row.distance_id || row.distanceId,
    distanceName: row.distance_name || row.distanceName,
    bibNumber: row.bib_number || row.bibNumber,
    firstName: row.first_name || row.firstName,
    lastName: row.last_name || row.lastName,
    gender: row.gender,
    birthDate: row.birth_date || row.birthDate,
    age: row.age,
    ageCategory: row.age_category || row.ageCategory,
    email: row.email,
    phone: row.phone,
    city: row.city,
    country: row.country,
    club: row.club,
    wantsTShirt: row.wants_tshirt ?? row.wantsTShirt,
    tShirtSize: row.tshirt_size || row.tShirtSize,
    emergencyContact: row.emergency_contact || row.emergencyContact,
    medalEngraving: row.medal_engraving ?? row.medalEngraving,
    pastaParty: row.pasta_party ?? row.pastaParty,
    charityContribution: row.charity_contribution ?? row.charityContribution,
    totalAmount: row.total_amount ?? row.totalAmount,
    paymentStatus: row.payment_status || row.paymentStatus || 'paid',
    paymentMethod: row.payment_method || row.paymentMethod || 'kaspi',
    registrationDate: row.registration_date || row.registrationDate,
    checkedInExpo: row.checked_in_expo ?? row.checkedInExpo
  };
}

class MarathonStorage {
  private events: MarathonEvent[] = [];
  private participants: Participant[] = [];
  private results: RaceResult[] = [];
  private documents: LegalDocument[] = INITIAL_LEGAL_DOCUMENTS;
  private isSyncing = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      this.events = storedEvents ? JSON.parse(storedEvents) : INITIAL_EVENTS;

      const storedParts = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      this.participants = storedParts ? JSON.parse(storedParts) : INITIAL_PARTICIPANTS;

      const storedRes = localStorage.getItem(STORAGE_KEY_RESULTS);
      this.results = storedRes ? JSON.parse(storedRes) : INITIAL_RESULTS;

      const storedDocs = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
      if (storedDocs) {
        try {
          const parsed = JSON.parse(storedDocs);
          if (Array.isArray(parsed)) {
            this.documents = parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
            this.documents = Object.values(parsed);
          } else {
            this.documents = [...INITIAL_LEGAL_DOCUMENTS];
          }
        } catch {
          this.documents = [...INITIAL_LEGAL_DOCUMENTS];
        }
      } else {
        this.documents = [...INITIAL_LEGAL_DOCUMENTS];
      }
    } catch {
      this.events = INITIAL_EVENTS;
      this.participants = INITIAL_PARTICIPANTS;
      this.results = INITIAL_RESULTS;
      this.documents = [...INITIAL_LEGAL_DOCUMENTS];
    }

    // If Supabase SQL is configured, sync in background
    if (isSupabaseConfigured && supabase) {
      this.syncFromSupabase();
      this.setupRealtimeSubscription();
    }
  }

  public async syncFromSupabase() {
    if (!supabase || this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Fetch events
      const { data: dbEvents, error: eventsErr } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (!eventsErr && dbEvents && dbEvents.length > 0) {
        this.events = dbEvents.map(dbToEvent);
      } else if (!eventsErr && (!dbEvents || dbEvents.length === 0)) {
        // Seed initial events to Supabase if database table is empty
        for (const ev of this.events) {
          await supabase.from('events').upsert(eventToDb(ev));
        }
      }

      // 2. Fetch participants
      const { data: dbParts, error: partsErr } = await supabase
        .from('participants')
        .select('*')
        .order('registration_date', { ascending: false });

      if (!partsErr && dbParts && dbParts.length > 0) {
        this.participants = dbParts.map(dbToParticipant);
      }

      // Persist local cache & notify UI
      this.persistLocalOnly();
      window.dispatchEvent(new Event('marathon-storage-update'));
    } catch (e) {
      console.warn('Supabase sync skipped, working in local mode', e);
    } finally {
      this.isSyncing = false;
    }
  }

  private setupRealtimeSubscription() {
    if (!supabase) return;
    try {
      supabase
        .channel('marathon_cloud_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
          this.syncFromSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
          this.syncFromSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error', e);
    }
  }

  private persistLocalOnly() {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events));
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(this.participants));
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(this.results));
      localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(this.documents));
    } catch (e) {
      console.error('Storage cache error', e);
    }
  }

  private persist() {
    this.persistLocalOnly();
    window.dispatchEvent(new Event('marathon-storage-update'));
  }

  // --- LEGAL DOCUMENTS ---
  public getDocuments(): LegalDocument[] {
    return [...this.documents];
  }

  public getDocument(idOrKey: string): LegalDocument | undefined {
    return this.documents.find(d => d.id === idOrKey || d.key === idOrKey);
  }

  public saveDocument(doc: LegalDocument): LegalDocument {
    const idx = this.documents.findIndex(d => d.id === doc.id || (doc.key && d.key === doc.key));
    if (idx >= 0) {
      this.documents[idx] = { ...this.documents[idx], ...doc };
    } else {
      this.documents.push(doc);
    }
    this.persist();
    return doc;
  }

  public deleteDocument(idOrKey: string): void {
    this.documents = this.documents.filter(d => d.id !== idOrKey && d.key !== idOrKey);
    this.persist();
  }

  public reorderDocuments(docs: LegalDocument[]): void {
    this.documents = [...docs];
    this.persist();
  }

  // --- EVENTS ---
  public getEvents(): MarathonEvent[] {
    return [...this.events];
  }

  public getEventById(id: string): MarathonEvent | undefined {
    return this.events.find(e => e.id === id);
  }

  public saveEvent(event: MarathonEvent): MarathonEvent {
    const idx = this.events.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      this.events[idx] = event;
    } else {
      this.events.unshift(event);
    }
    this.persist();

    // Async sync to SQL Database
    if (supabase) {
      supabase.from('events').upsert(eventToDb(event)).then(({ error }) => {
        if (error) console.error('Supabase saveEvent error:', error);
      });
    }

    return event;
  }

  public deleteEvent(id: string): void {
    this.events = this.events.filter(e => e.id !== id);
    this.persist();

    // Async sync to SQL Database
    if (supabase) {
      supabase.from('events').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase deleteEvent error:', error);
      });
    }
  }

  // --- PARTICIPANTS ---
  public getParticipants(eventId?: string): Participant[] {
    if (eventId) {
      return this.participants.filter(p => p.eventId === eventId);
    }
    return [...this.participants];
  }

  public getNextBibNumber(eventId: string, distanceId: string): string {
    const event = this.getEventById(eventId);
    const distance = event?.distances.find(d => d.id === distanceId);
    
    // Custom prefix or formatted kilometers (e.g. 27, 42)
    const prefix = distance?.bibPrefix?.trim() || 
      (distance ? Math.round(distance.distanceKm).toString().padStart(2, '0') : '99');

    // Starting number configured by admin (default 1)
    const startNum = (distance?.bibStartNumber !== undefined && distance.bibStartNumber > 0)
      ? distance.bibStartNumber
      : 1;

    // Existing registered participants on this distance
    const count = this.participants.filter(p => p.distanceId === distanceId).length;
    const currentNum = startNum + count;

    // Format with leading zeros (e.g. 3 digits: 001, 002, 300)
    const padLength = distance?.bibDigitsPadding || 3;
    const formattedNum = currentNum.toString().padStart(padLength, '0');

    return `${prefix}-${formattedNum}`;
  }

  public registerParticipant(data: Omit<Participant, 'id' | 'bibNumber' | 'registrationDate' | 'checkedInExpo'> & { bibNumber?: string }): Participant {
    const event = this.getEventById(data.eventId);
    const distance = event?.distances.find(d => d.id === data.distanceId);
    const bibNumber = data.bibNumber || this.getNextBibNumber(data.eventId, data.distanceId);

    const newParticipant: Participant = {
      ...data,
      id: 'runner-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      bibNumber,
      registrationDate: new Date().toISOString(),
      checkedInExpo: false
    };

    this.participants.unshift(newParticipant);

    // Update distance slot count
    if (event && distance) {
      distance.registeredCount = (distance.registeredCount || 0) + 1;
      this.saveEvent(event);
    } else {
      this.persist();
    }

    // Async sync to SQL Database
    if (supabase) {
      supabase.from('participants').insert(participantToDb(newParticipant)).then(({ error }) => {
        if (error) console.error('Supabase registerParticipant error:', error);
      });
    }

    return newParticipant;
  }

  public updateParticipant(participant: Participant): Participant {
    const idx = this.participants.findIndex(p => p.id === participant.id);
    if (idx >= 0) {
      this.participants[idx] = participant;
      this.persist();

      // Async sync to SQL Database
      if (supabase) {
        supabase.from('participants').update(participantToDb(participant)).eq('id', participant.id).then(({ error }) => {
          if (error) console.error('Supabase updateParticipant error:', error);
        });
      }
    }
    return participant;
  }

  public deleteParticipant(id: string): void {
    const p = this.participants.find(part => part.id === id);
    if (p) {
      const event = this.getEventById(p.eventId);
      const distance = event?.distances.find(d => d.id === p.distanceId);
      if (distance && distance.registeredCount > 0) {
        distance.registeredCount -= 1;
      }
    }
    this.participants = this.participants.filter(item => item.id !== id);
    this.persist();

    // Async sync to SQL Database
    if (supabase) {
      supabase.from('participants').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase deleteParticipant error:', error);
      });
    }
  }

  public toggleExpoCheckin(id: string): Participant | undefined {
    const idx = this.participants.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.participants[idx].checkedInExpo = !this.participants[idx].checkedInExpo;
      const isChecked = this.participants[idx].checkedInExpo;
      this.persist();

      // Async sync to SQL Database
      if (supabase) {
        supabase.from('participants').update({ checked_in_expo: isChecked }).eq('id', id).then(({ error }) => {
          if (error) console.error('Supabase toggleExpoCheckin error:', error);
        });
      }

      return this.participants[idx];
    }
    return undefined;
  }

  public updateDistance(eventId: string, updatedDistance: Distance): void {
    const event = this.getEventById(eventId);
    if (!event) return;
    const idx = event.distances.findIndex(d => d.id === updatedDistance.id);
    if (idx >= 0) {
      event.distances[idx] = updatedDistance;
      this.saveEvent(event);
    }
  }

  // --- RESULTS ---
  public getResults(): RaceResult[] {
    return [...this.results];
  }

  // --- EXPORT TO EXCEL & CSV ---
  public exportToExcel(eventId?: string, fileName = 'marathon_participants.xlsx'): void {
    const list = this.getParticipants(eventId);
    const rows = list.map((p, i) => ({
      '№': i + 1,
      'Стартовый номер (Bib)': p.bibNumber,
      'Фамилия': p.lastName,
      'Имя': p.firstName,
      'Пол': p.gender === 'male' ? 'Мужской' : 'Женский',
      'Дата рождения': p.birthDate,
      'Возраст': p.age,
      'Возрастная категория': p.ageCategory,
      'Дистанция': p.distanceName,
      'Город': p.city,
      'Страна': p.country,
      'Беговой Клуб': p.club || '-',
      'Размер футболки': p.wantsTShirt ? p.tShirtSize : 'Не требуется',
      'Телефон': p.phone,
      'Email': p.email,
      'Экстренный контакт': p.emergencyContact,
      'Гравировка медали': p.medalEngraving ? 'Да (+2 000 ₸)' : 'Нет',
      'Pasta Party': p.pastaParty ? 'Да (+3 500 ₸)' : 'Нет',
      'Благотворительность ₸': p.charityContribution || 0,
      'Оплачено ₸': p.totalAmount,
      'Статус оплаты': p.paymentStatus === 'paid' ? 'Оплачено' : 'Ожидание',
      'Метод оплаты': p.paymentMethod,
      'Дата регистрации': new Date(p.registrationDate).toLocaleString('ru-RU'),
      'Выдан стартовый пакет (Expo)': p.checkedInExpo ? 'ВЫДАН' : 'НЕ ВЫДАН'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Участники');
    
    // Auto column widths
    const max_width = rows.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet['!cols'] = Array(max_width).fill({ wch: 18 });

    XLSX.writeFile(workbook, fileName);
  }

  public exportToCSV(eventId?: string, fileName = 'marathon_participants.csv'): void {
    const list = this.getParticipants(eventId);
    const rows = list.map((p, i) => ({
      id: i + 1,
      bib: p.bibNumber,
      last_name: p.lastName,
      first_name: p.firstName,
      gender: p.gender,
      birth_date: p.birthDate,
      age: p.age,
      age_category: p.ageCategory,
      distance: p.distanceName,
      city: p.city,
      phone: p.phone,
      email: p.email,
      club: p.club || '',
      tshirt: p.wantsTShirt ? p.tShirtSize : 'NONE',
      paid_amount: p.totalAmount,
      status: p.paymentStatus,
      expo_checkin: p.checkedInExpo ? 'YES' : 'NO'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(["\uFEFF" + csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public resetToDefaults(): void {
    this.events = INITIAL_EVENTS;
    this.participants = INITIAL_PARTICIPANTS;
    this.results = INITIAL_RESULTS;
    this.persist();
  }
}

export const marathonStorage = new MarathonStorage();
