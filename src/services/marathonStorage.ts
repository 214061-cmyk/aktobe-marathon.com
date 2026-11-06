import type { MarathonEvent, Participant, RaceResult, Distance } from '../types/marathon';
import { INITIAL_EVENTS, INITIAL_PARTICIPANTS, INITIAL_RESULTS } from '../data/initialData';
import * as XLSX from 'xlsx';

const STORAGE_KEY_EVENTS = 'qazaq_run_events_v2';
const STORAGE_KEY_PARTICIPANTS = 'qazaq_run_participants_v2';
const STORAGE_KEY_RESULTS = 'qazaq_run_results_v2';

class MarathonStorage {
  private events: MarathonEvent[] = [];
  private participants: Participant[] = [];
  private results: RaceResult[] = [];

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
    } catch {
      this.events = INITIAL_EVENTS;
      this.participants = INITIAL_PARTICIPANTS;
      this.results = INITIAL_RESULTS;
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events));
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(this.participants));
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(this.results));
      window.dispatchEvent(new Event('marathon-storage-update'));
    } catch (e) {
      console.error('Storage error', e);
    }
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
    return event;
  }

  public deleteEvent(id: string): void {
    this.events = this.events.filter(e => e.id !== id);
    this.persist();
  }

  // --- PARTICIPANTS ---
  public getParticipants(eventId?: string): Participant[] {
    if (eventId) {
      return this.participants.filter(p => p.eventId === eventId);
    }
    return [...this.participants];
  }

  public registerParticipant(data: Omit<Participant, 'id' | 'bibNumber' | 'registrationDate' | 'checkedInExpo'>): Participant {
    // Generate next bib number based on distance
    const event = this.getEventById(data.eventId);
    const distance = event?.distances.find(d => d.id === data.distanceId);
    const prefix = distance ? Math.round(distance.distanceKm).toString().padStart(2, '0') : '99';
    
    // Count existing in distance
    const count = this.participants.filter(p => p.distanceId === data.distanceId).length + 1;
    const bibNumber = `${prefix}-${(count + 100).toString()}`;

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

    return newParticipant;
  }

  public updateParticipant(participant: Participant): Participant {
    const idx = this.participants.findIndex(p => p.id === participant.id);
    if (idx >= 0) {
      this.participants[idx] = participant;
      this.persist();
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
  }

  public toggleExpoCheckin(id: string): Participant | undefined {
    const idx = this.participants.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.participants[idx].checkedInExpo = !this.participants[idx].checkedInExpo;
      this.persist();
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
