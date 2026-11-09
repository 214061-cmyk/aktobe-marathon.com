import React, { useState, useEffect } from 'react';
import type { MarathonEvent, Distance, Participant, AgeCategory, Sponsor, EventOptionsConfig, ScheduleDay, ScheduleItem, RoutePoint, DocumentKey } from '../../types/marathon';
import { DocumentsManager } from './DocumentsManager';
import { DocumentModal } from '../Legal/DocumentModal';
import { marathonStorage } from '../../services/marathonStorage';
import { calculateAge, determineAgeCategory, DEFAULT_ADULT_CATEGORIES, DEFAULT_YOUTH_10K_CATEGORIES, DEFAULT_KIDS_CATEGORIES } from '../../utils/ageUtils';
import { 
  LayoutDashboard, Calendar, Route, Users, QrCode, 
  FileSpreadsheet, FileText, Plus, Trash2, Edit3, 
  Check, X, Search, Filter, ShieldCheck, ArrowLeft, 
  DollarSign, TrendingUp, RefreshCw, Download, ChevronRight,
  MapPin, Clock, Award, AlertCircle, AlertTriangle, CheckCircle2,
  Tag, Layers, Sparkles, ExternalLink, Globe, Shirt, Utensils, Heart, Image as ImageIcon,
  CalendarDays, Flag, LogOut, Archive, RotateCcw, FolderArchive
} from 'lucide-react';

interface AdminPanelProps {
  onBackToSite: () => void;
  onLogout?: () => void;
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToSite,
  onLogout,
  activeEventId,
  onSelectEvent
}) => {
  const [events, setEvents] = useState<MarathonEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<MarathonEvent | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'distances' | 'schedule' | 'sponsors' | 'participants' | 'expo' | 'archive' | 'documents'>('overview');
  const [previewDocKey, setPreviewDocKey] = useState<DocumentKey | null>(null);

  // Participants Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistance, setFilterDistance] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Distance Edit / Add Modal States
  const [editingDistance, setEditingDistance] = useState<Distance | null>(null);
  const [isAddDistanceOpen, setIsAddDistanceOpen] = useState(false);

  // Form State for Editing/Adding Distance
  const [distanceForm, setDistanceForm] = useState<{
    name: string;
    tag: string;
    distanceKm: number;
    price: number;
    slots: number;
    startTime: string;
    timeLimit: string;
    minAge: number;
    elevationGain: string;
    hexColor: string;
    badgeColor: string;
    mapImageUrl?: string;
    points: RoutePoint[];
    ageCategories: AgeCategory[];
    bibPrefix?: string;
    bibStartNumber?: number;
    bibEndNumber?: number;
    bibDigitsPadding?: number;
  }>({
    name: '',
    tag: '',
    distanceKm: 10,
    price: 8000,
    slots: 1000,
    startTime: '08:00',
    timeLimit: '1:30:00',
    minAge: 18,
    elevationGain: '+30 м',
    hexColor: '#84cc16',
    badgeColor: 'lime',
    mapImageUrl: '',
    points: [],
    ageCategories: [],
    bibPrefix: '',
    bibStartNumber: 1,
    bibEndNumber: 1000,
    bibDigitsPadding: 3
  });

  // Category addition sub-form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryMinAge, setNewCategoryMinAge] = useState(18);
  const [newCategoryMaxAge, setNewCategoryMaxAge] = useState(25);

  // Add Participant Manual Modal State
  const [isAddRunnerOpen, setIsAddRunnerOpen] = useState(false);
  const [newRunnerForm, setNewRunnerForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female',
    distanceId: '',
    birthDate: '1998-06-15',
    email: '',
    phone: '',
    city: 'Актобе',
    club: '',
    tShirtSize: 'L' as any,
    totalAmount: 14000
  });

  // Edit Event State
  const [eventForm, setEventForm] = useState<{
    title: string;
    subtitle: string;
    city: string;
    location: string;
    date: string;
    displayDate: string;
    description: string;
    bannerImage: string;
    prizePool: string;
    totalSlots: number;
    status: any;
    optionsConfig: EventOptionsConfig;
  }>({
    title: '',
    subtitle: '',
    city: '',
    location: '',
    date: '2026-05-17T07:00',
    displayDate: '',
    description: '',
    bannerImage: '',
    prizePool: '',
    totalSlots: 4500,
    status: 'registration_open',
    optionsConfig: {
      enableTShirt: true,
      tShirtPrice: 0,
      enableMedalEngraving: true,
      medalEngravingPrice: 2000,
      enablePastaParty: true,
      pastaPartyPrice: 3500,
      enableCharity: true,
      enableStartClusters: false
    }
  });

  // Sponsor Management State
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [sponsorForm, setSponsorForm] = useState<{
    id?: string;
    name: string;
    tier: 'title' | 'general' | 'technical' | 'official' | 'media';
    logoText: string;
    logoUrl: string;
    accent: string;
    websiteUrl: string;
  }>({
    name: '',
    tier: 'official',
    logoText: '',
    logoUrl: '',
    accent: '#84cc16',
    websiteUrl: ''
  });

  // Schedule Management State
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [dayForm, setDayForm] = useState<{ date: string; dayName: string }>({ date: '', dayName: '' });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemTargetDayIndex, setItemTargetDayIndex] = useState<number>(0);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState<ScheduleItem>({
    time: '07:00',
    title: '',
    location: 'Стартовая арка',
    category: 'start'
  });

  // Create New Event Modal
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCity, setNewEventCity] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-09-20');
  const [newEventLocation, setNewEventLocation] = useState('');

  const refreshData = () => {
    const allEvents = marathonStorage.getEvents();
    setEvents(allEvents);
    const curr = allEvents.find(e => e.id === activeEventId) || allEvents[0];
    setCurrentEvent(curr);
    if (curr) {
      setParticipants(marathonStorage.getParticipants(curr.id));
      let formattedDate = curr.date || '2026-05-17T07:00:00';
      if (formattedDate.length >= 16) {
        formattedDate = formattedDate.substring(0, 16);
      }
      setEventForm({
        title: curr.title || '',
        subtitle: curr.subtitle || '',
        city: curr.city || '',
        location: curr.location || '',
        date: formattedDate,
        displayDate: curr.displayDate || '',
        description: curr.description || '',
        bannerImage: curr.bannerImage || '',
        prizePool: curr.prizePool || '',
        totalSlots: curr.totalSlots || 4500,
        status: curr.status || 'registration_open',
        optionsConfig: curr.optionsConfig ? {
          ...curr.optionsConfig,
          enableStartClusters: Boolean(curr.optionsConfig.enableStartClusters)
        } : {
          enableTShirt: true,
          tShirtPrice: 0,
          enableMedalEngraving: true,
          medalEngravingPrice: 2000,
          enablePastaParty: true,
          pastaPartyPrice: 3500,
          enableCharity: true,
          enableStartClusters: false
        }
      });
      if (curr.distances[0]) {
        setNewRunnerForm(prev => ({ ...prev, distanceId: curr.distances[0].id }));
      }
    }
  };

  useEffect(() => {
    refreshData();
    const handleStorageUpdate = () => refreshData();
    window.addEventListener('marathon-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('marathon-storage-update', handleStorageUpdate);
  }, [activeEventId]);

  if (!currentEvent) return null;

  // Analytics Metrics
  const totalRunners = participants.length;
  const totalRevenue = participants.reduce((sum, p) => sum + p.totalAmount, 0);
  const paidRunners = participants.filter(p => p.paymentStatus === 'paid').length;
  const expoCheckedInCount = participants.filter(p => p.checkedInExpo).length;
  const archivedEvents = events.filter(e => e.status === 'completed');
  const activeEventsList = events.filter(e => e.status !== 'completed');

  // Unique categories for filter dropdown
  const allCategoriesSet = new Set<string>();
  participants.forEach(p => {
    if (p.ageCategory) allCategoriesSet.add(p.ageCategory);
  });
  const uniqueCategories = Array.from(allCategoriesSet);

  // Filtered Participants
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = 
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bibNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDist = filterDistance === 'all' || p.distanceId === filterDistance;
    const matchesCat = filterCategory === 'all' || p.ageCategory === filterCategory;
    return matchesSearch && matchesDist && matchesCat;
  });

  // --- DISTANCE EDIT HANDLERS ---
  const handleOpenEditDistance = (dist: Distance) => {
    setEditingDistance(dist);
    setDistanceForm({
      name: dist.name,
      tag: dist.tag,
      distanceKm: dist.distanceKm,
      price: dist.price,
      slots: dist.slots,
      startTime: dist.startTime,
      timeLimit: dist.timeLimit,
      minAge: dist.minAge,
      elevationGain: dist.elevationGain,
      hexColor: dist.hexColor,
      badgeColor: dist.badgeColor,
      mapImageUrl: dist.mapImageUrl || '',
      points: dist.points ? [...dist.points] : [],
      ageCategories: dist.ageCategories ? [...dist.ageCategories] : [...DEFAULT_ADULT_CATEGORIES],
      bibPrefix: dist.bibPrefix ?? Math.round(dist.distanceKm).toString().padStart(2, '0'),
      bibStartNumber: dist.bibStartNumber ?? 1,
      bibEndNumber: dist.bibEndNumber ?? dist.slots,
      bibDigitsPadding: dist.bibDigitsPadding ?? 3
    });
  };

  const handleSaveEditedDistance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !editingDistance) return;

    const updatedDist: Distance = {
      ...editingDistance,
      ...distanceForm,
      mapImageUrl: distanceForm.mapImageUrl?.trim() || undefined,
      points: distanceForm.points,
      price: Number(distanceForm.price),
      slots: Number(distanceForm.slots),
      minAge: Number(distanceForm.minAge),
      distanceKm: Number(distanceForm.distanceKm),
      bibPrefix: distanceForm.bibPrefix?.trim() || Math.round(distanceForm.distanceKm).toString().padStart(2, '0'),
      bibStartNumber: Number(distanceForm.bibStartNumber || 1),
      bibEndNumber: Number(distanceForm.bibEndNumber || distanceForm.slots),
      bibDigitsPadding: Number(distanceForm.bibDigitsPadding || 3)
    };

    marathonStorage.updateDistance(currentEvent.id, updatedDist);
    setEditingDistance(null);
    refreshData();
    alert(`Дистанция "${updatedDist.name}" успешно обновлена! Схема трассы, точки сервиса и параметры сохранены.`);
  };

  const handleOpenAddDistance = () => {
    setDistanceForm({
      name: '15.0 км',
      tag: 'Спринт',
      distanceKm: 15,
      price: 9000,
      slots: 800,
      startTime: '08:00',
      timeLimit: '2:00:00',
      minAge: 16,
      elevationGain: '+40 м',
      hexColor: '#06b6d4',
      badgeColor: 'cyan',
      mapImageUrl: '',
      points: [
        { id: 'p-' + Date.now() + '-1', type: 'start', coords: [50.2877, 57.1856], title: 'Стартовая арка', description: 'Старт в 08:00' },
        { id: 'p-' + Date.now() + '-2', type: 'water', coords: [50.2920, 57.1750], title: 'Пункт питания и гидратации', description: 'Вода и изотоник' },
        { id: 'p-' + Date.now() + '-3', type: 'medical', coords: [50.2980, 57.1700], title: 'Медицинский пост', description: 'Бригада скорой помощи' },
        { id: 'p-' + Date.now() + '-4', type: 'toilet', coords: [50.2985, 57.1710], title: 'Санитарная зона (WC)', description: 'Биотуалеты' },
        { id: 'p-' + Date.now() + '-5', type: 'finish', coords: [50.2877, 57.1856], title: 'Финишная арка', description: 'Вручение медалей' }
      ],
      ageCategories: [...DEFAULT_YOUTH_10K_CATEGORIES]
    });
    setIsAddDistanceOpen(true);
  };

  const handleCreateDistance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;

    const newDist: Distance = {
      id: 'dist-' + Date.now(),
      ...distanceForm,
      registeredCount: 0,
      price: Number(distanceForm.price),
      slots: Number(distanceForm.slots),
      minAge: Number(distanceForm.minAge),
      distanceKm: Number(distanceForm.distanceKm),
      features: ['Официальный чип-тайминг', 'Медаль финишера', 'Стартовый пакет'],
      routeWaypoints: currentEvent.distances[0]?.routeWaypoints || [],
      points: currentEvent.distances[0]?.points || []
    };

    const updated: MarathonEvent = {
      ...currentEvent,
      distances: [...currentEvent.distances, newDist]
    };
    marathonStorage.saveEvent(updated);
    setIsAddDistanceOpen(false);
    refreshData();
    alert(`Новая дистанция "${newDist.name}" успешно добавлена в мероприятие!`);
  };

  const handleDeleteDistance = (distId: string) => {
    if (currentEvent.distances.length <= 1) {
      alert('Мероприятие должно содержать хотя бы одну дистанцию!');
      return;
    }
    if (confirm('Вы уверены, что хотите удалить эту дистанцию?')) {
      const updated: MarathonEvent = {
        ...currentEvent,
        distances: currentEvent.distances.filter(d => d.id !== distId)
      };
      marathonStorage.saveEvent(updated);
      refreshData();
    }
  };

  // Category Management inside Distance Form
  const handleAddCategoryToForm = () => {
    if (!newCategoryName.trim()) {
      alert('Укажите название категории, например "18-25 лет"');
      return;
    }
    const newCat: AgeCategory = {
      id: 'cat-' + Date.now(),
      name: newCategoryName.trim(),
      minAge: Number(newCategoryMinAge),
      maxAge: Number(newCategoryMaxAge)
    };
    setDistanceForm(prev => ({
      ...prev,
      ageCategories: [...prev.ageCategories, newCat]
    }));
    setNewCategoryName('');
  };

  const handleRemoveCategoryFromForm = (catId: string) => {
    setDistanceForm(prev => ({
      ...prev,
      ageCategories: prev.ageCategories.filter(c => c.id !== catId)
    }));
  };

  const handleApplyCategoryPreset = (preset: 'adult' | 'youth' | 'kids') => {
    if (preset === 'adult') {
      setDistanceForm(prev => ({ ...prev, ageCategories: [...DEFAULT_ADULT_CATEGORIES] }));
    } else if (preset === 'youth') {
      setDistanceForm(prev => ({ ...prev, ageCategories: [...DEFAULT_YOUTH_10K_CATEGORIES] }));
    } else {
      setDistanceForm(prev => ({ ...prev, ageCategories: [...DEFAULT_KIDS_CATEGORIES] }));
    }
  };

  // Event Edit & Date Handlers
  const handleEventDateChange = (val: string) => {
    let autoDisplay = eventForm.displayDate;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const dStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        autoDisplay = dStr;
      }
    } catch {
      // Keep existing
    }
    setEventForm(prev => ({
      ...prev,
      date: val,
      displayDate: autoDisplay
    }));
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    const isoDate = eventForm.date.length === 16 ? `${eventForm.date}:00` : eventForm.date;
    const updated: MarathonEvent = {
      ...currentEvent,
      title: eventForm.title.trim(),
      subtitle: eventForm.subtitle.trim(),
      city: eventForm.city.trim(),
      location: eventForm.location.trim(),
      date: isoDate,
      displayDate: eventForm.displayDate.trim(),
      description: eventForm.description.trim(),
      bannerImage: eventForm.bannerImage.trim(),
      prizePool: eventForm.prizePool.trim(),
      totalSlots: Number(eventForm.totalSlots),
      status: eventForm.status,
      optionsConfig: eventForm.optionsConfig
    };
    marathonStorage.saveEvent(updated);
    alert('Параметры забега успешно сохранены! Дата старта, опции и настройки обновлены.');
    refreshData();
  };

  const handleArchiveEvent = (eventId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    const updated: MarathonEvent = { ...ev, status: 'completed' };
    marathonStorage.saveEvent(updated);
    refreshData();
  };

  const handleRestoreEvent = (eventId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    const updated: MarathonEvent = { ...ev, status: 'registration_open' };
    marathonStorage.saveEvent(updated);
    refreshData();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (events.length <= 1) {
      alert('Нельзя удалить единственное оставшееся событие.');
      return;
    }
    if (window.confirm('Вы действительно хотите удалить этот забег? Это действие необратимо.')) {
      marathonStorage.deleteEvent(eventId);
      const remaining = events.filter(e => e.id !== eventId);
      if (currentEvent?.id === eventId && remaining.length > 0) {
        onSelectEvent(remaining[0].id);
      }
      refreshData();
    }
  };

  // Sponsor Handlers
  const handleOpenAddSponsor = () => {
    setEditingSponsor(null);
    setSponsorForm({
      name: '',
      tier: 'official',
      logoText: '',
      logoUrl: '',
      accent: '#84cc16',
      websiteUrl: ''
    });
    setIsSponsorModalOpen(true);
  };

  const handleOpenEditSponsor = (sp: Sponsor) => {
    setEditingSponsor(sp);
    setSponsorForm({
      id: sp.id,
      name: sp.name,
      tier: sp.tier,
      logoText: sp.logoText || '',
      logoUrl: sp.logoUrl || '',
      accent: sp.accent || '#84cc16',
      websiteUrl: sp.websiteUrl || ''
    });
    setIsSponsorModalOpen(true);
  };

  const handleSaveSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    if (!sponsorForm.name.trim()) {
      alert('Пожалуйста, укажите название компании или бренда');
      return;
    }

    const currentSponsors = currentEvent.sponsors || [];
    let updatedSponsors: Sponsor[];

    if (editingSponsor) {
      updatedSponsors = currentSponsors.map(sp => {
        if (sp.id === editingSponsor.id || (editingSponsor.name && sp.name === editingSponsor.name)) {
          return {
            id: sp.id || 'sp-' + Date.now(),
            name: sponsorForm.name.trim(),
            tier: sponsorForm.tier,
            logoText: sponsorForm.logoText.trim() || sponsorForm.name.trim().toUpperCase(),
            logoUrl: sponsorForm.logoUrl.trim() || undefined,
            accent: sponsorForm.accent,
            websiteUrl: sponsorForm.websiteUrl.trim() || undefined
          };
        }
        return sp;
      });
    } else {
      const newSp: Sponsor = {
        id: 'sp-' + Date.now(),
        name: sponsorForm.name.trim(),
        tier: sponsorForm.tier,
        logoText: sponsorForm.logoText.trim() || sponsorForm.name.trim().toUpperCase(),
        logoUrl: sponsorForm.logoUrl.trim() || undefined,
        accent: sponsorForm.accent,
        websiteUrl: sponsorForm.websiteUrl.trim() || undefined
      };
      updatedSponsors = [...currentSponsors, newSp];
    }

    const updatedEvent: MarathonEvent = {
      ...currentEvent,
      sponsors: updatedSponsors
    };

    marathonStorage.saveEvent(updatedEvent);
    setIsSponsorModalOpen(false);
    setEditingSponsor(null);
    refreshData();
    alert('Спонсор/партнер успешно сохранен!');
  };

  const handleDeleteSponsor = (sp: Sponsor) => {
    if (!currentEvent) return;
    if (confirm(`Вы уверены, что хотите удалить спонсора/партнера "${sp.name}"?`)) {
      const updatedSponsors = (currentEvent.sponsors || []).filter(s => (sp.id ? s.id !== sp.id : s.name !== sp.name));
      const updatedEvent: MarathonEvent = {
        ...currentEvent,
        sponsors: updatedSponsors
      };
      marathonStorage.saveEvent(updatedEvent);
      refreshData();
    }
  };

  // Schedule Days Handlers
  const handleOpenAddDay = () => {
    setEditingDayIndex(null);
    setDayForm({ date: '', dayName: '' });
    setIsDayModalOpen(true);
  };

  const handleOpenEditDay = (dayIndex: number) => {
    if (!currentEvent || !currentEvent.schedule[dayIndex]) return;
    const day = currentEvent.schedule[dayIndex];
    setEditingDayIndex(dayIndex);
    setDayForm({ date: day.date, dayName: day.dayName });
    setIsDayModalOpen(true);
  };

  const handleSaveDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    if (!dayForm.date.trim() || !dayForm.dayName.trim()) {
      alert('Укажите дату и название дня программы');
      return;
    }

    const currentSchedule = currentEvent.schedule || [];
    let updatedSchedule: ScheduleDay[];

    if (editingDayIndex !== null) {
      updatedSchedule = currentSchedule.map((d, idx) => {
        if (idx === editingDayIndex) {
          return { ...d, date: dayForm.date.trim(), dayName: dayForm.dayName.trim() };
        }
        return d;
      });
    } else {
      updatedSchedule = [
        ...currentSchedule,
        { date: dayForm.date.trim(), dayName: dayForm.dayName.trim(), items: [] }
      ];
    }

    const updatedEvent: MarathonEvent = { ...currentEvent, schedule: updatedSchedule };
    marathonStorage.saveEvent(updatedEvent);
    setIsDayModalOpen(false);
    refreshData();
  };

  const handleDeleteDay = (dayIndex: number) => {
    if (!currentEvent || !currentEvent.schedule[dayIndex]) return;
    if (confirm(`Удалить весь день "${currentEvent.schedule[dayIndex].dayName}" и все его пункты?`)) {
      const updatedSchedule = currentEvent.schedule.filter((_, idx) => idx !== dayIndex);
      const updatedEvent: MarathonEvent = { ...currentEvent, schedule: updatedSchedule };
      marathonStorage.saveEvent(updatedEvent);
      refreshData();
    }
  };

  // Schedule Items Handlers
  const handleOpenAddItem = (dayIndex: number) => {
    setItemTargetDayIndex(dayIndex);
    setEditingItemIndex(null);
    setItemForm({
      time: '07:00',
      title: '',
      location: 'Стартовая арка',
      category: 'start'
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (dayIndex: number, itemIndex: number) => {
    if (!currentEvent || !currentEvent.schedule[dayIndex]) return;
    const item = currentEvent.schedule[dayIndex].items[itemIndex];
    setItemTargetDayIndex(dayIndex);
    setEditingItemIndex(itemIndex);
    setItemForm({ ...item });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent || !currentEvent.schedule[itemTargetDayIndex]) return;
    if (!itemForm.title.trim() || !itemForm.time.trim()) {
      alert('Укажите время и название события');
      return;
    }

    const currentSchedule = currentEvent.schedule || [];
    const targetDay = currentSchedule[itemTargetDayIndex];
    let updatedItems: ScheduleItem[];

    if (editingItemIndex !== null) {
      updatedItems = targetDay.items.map((it, idx) => {
        if (idx === editingItemIndex) {
          return {
            time: itemForm.time.trim(),
            title: itemForm.title.trim(),
            location: itemForm.location.trim() || 'Стартовый городок',
            category: itemForm.category
          };
        }
        return it;
      });
    } else {
      updatedItems = [
        ...targetDay.items,
        {
          time: itemForm.time.trim(),
          title: itemForm.title.trim(),
          location: itemForm.location.trim() || 'Стартовый городок',
          category: itemForm.category
        }
      ];
    }

    // Sort items chronologically by time
    updatedItems.sort((a, b) => a.time.localeCompare(b.time));

    const updatedSchedule = currentSchedule.map((d, idx) => {
      if (idx === itemTargetDayIndex) {
        return { ...d, items: updatedItems };
      }
      return d;
    });

    const updatedEvent: MarathonEvent = { ...currentEvent, schedule: updatedSchedule };
    marathonStorage.saveEvent(updatedEvent);
    setIsItemModalOpen(false);
    refreshData();
  };

  const handleDeleteItem = (dayIndex: number, itemIndex: number) => {
    if (!currentEvent || !currentEvent.schedule[dayIndex]) return;
    if (confirm('Удалить этот пункт расписания?')) {
      const currentSchedule = currentEvent.schedule || [];
      const updatedSchedule = currentSchedule.map((d, idx) => {
        if (idx === dayIndex) {
          return { ...d, items: d.items.filter((_, i) => i !== itemIndex) };
        }
        return d;
      });
      const updatedEvent: MarathonEvent = { ...currentEvent, schedule: updatedSchedule };
      marathonStorage.saveEvent(updatedEvent);
      refreshData();
    }
  };

  const handleCreateNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventCity.trim()) {
      alert('Заполните название и город мероприятия');
      return;
    }

    const newEv: MarathonEvent = {
      id: 'event-' + Date.now(),
      title: newEventTitle.trim(),
      slug: newEventTitle.toLowerCase().replace(/\s+/g, '-'),
      subtitle: `Официальный забег в городе ${newEventCity}`,
      date: `${newEventDate}T07:00:00`,
      displayDate: new Date(newEventDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      city: `г. ${newEventCity.trim()}`,
      location: newEventLocation.trim() || 'Центральная площадь',
      status: 'registration_open',
      description: 'Масштабный городской забег с электронной регистрацией и чиповым хронометражем.',
      bannerImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop',
      prizePool: '5 000 000 ₸',
      totalSlots: 2000,
      centerCoords: [50.2877, 57.1856],
      distances: [
        {
          id: 'dist-42-' + Date.now(),
          name: '42.195 км',
          tag: 'Марафон',
          distanceKm: 42.195,
          price: 14000,
          slots: 500,
          registeredCount: 0,
          minAge: 18,
          timeLimit: '6:00:00',
          elevationGain: '+80 м',
          startTime: '07:00',
          badgeColor: 'lime',
          hexColor: '#84cc16',
          features: ['Чип-тайминг', 'Медаль финишера', 'Футболка'],
          ageCategories: [...DEFAULT_ADULT_CATEGORIES],
          routeWaypoints: [],
          points: []
        },
        {
          id: 'dist-21-' + Date.now(),
          name: '21.097 км',
          tag: 'Полумарафон',
          distanceKm: 21.097,
          price: 11000,
          slots: 800,
          registeredCount: 0,
          minAge: 18,
          timeLimit: '3:00:00',
          elevationGain: '+40 м',
          startTime: '07:30',
          badgeColor: 'orange',
          hexColor: '#f97316',
          features: ['Чип-тайминг', 'Медаль финишера', 'Футболка'],
          ageCategories: [...DEFAULT_ADULT_CATEGORIES],
          routeWaypoints: [],
          points: []
        },
        {
          id: 'dist-10-' + Date.now(),
          name: '10.0 км',
          tag: 'Спринт',
          distanceKm: 10,
          price: 8000,
          slots: 700,
          registeredCount: 0,
          minAge: 15,
          timeLimit: '1:30:00',
          elevationGain: '+20 м',
          startTime: '08:15',
          badgeColor: 'cyan',
          hexColor: '#06b6d4',
          features: ['Чип-тайминг', 'Медаль финишера'],
          ageCategories: [...DEFAULT_YOUTH_10K_CATEGORIES],
          routeWaypoints: [],
          points: []
        }
      ],
      schedule: [],
      sponsors: []
    };

    marathonStorage.saveEvent(newEv);
    setIsCreateEventOpen(false);
    onSelectEvent(newEv.id);
    refreshData();
    alert(`Мероприятие "${newEv.title}" успешно создано! Вы можете настроить дистанции и трассу.`);
  };

  const handleExportExcel = () => {
    marathonStorage.exportToExcel(currentEvent.id, `${currentEvent.slug}_participants.xlsx`);
  };

  const handleExportCSV = () => {
    marathonStorage.exportToCSV(currentEvent.id, `${currentEvent.slug}_participants.csv`);
  };

  const handleToggleExpo = (id: string) => {
    marathonStorage.toggleExpoCheckin(id);
    refreshData();
  };

  const handleDeleteRunner = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого участника?')) {
      marathonStorage.deleteParticipant(id);
      refreshData();
    }
  };

  const handleCreateRunner = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = currentEvent.distances.find(d => d.id === newRunnerForm.distanceId) || currentEvent.distances[0];
    const age = calculateAge(newRunnerForm.birthDate, currentEvent.date);

    if (age < dist.minAge) {
      alert(`Внимание: Минимальный возраст для дистанции ${dist.name} — ${dist.minAge} лет. Возраст участника: ${age} лет.`);
      return;
    }

    const matchedCat = determineAgeCategory(age, dist.ageCategories);

    marathonStorage.registerParticipant({
      eventId: currentEvent.id,
      distanceId: dist.id,
      distanceName: dist.name,
      firstName: newRunnerForm.firstName,
      lastName: newRunnerForm.lastName,
      gender: newRunnerForm.gender,
      birthDate: newRunnerForm.birthDate,
      age,
      ageCategory: matchedCat ? matchedCat.name : `${age} лет`,
      email: newRunnerForm.email,
      phone: newRunnerForm.phone,
      city: newRunnerForm.city,
      country: 'Казахстан',
      club: newRunnerForm.club || undefined,
      wantsTShirt: true,
      tShirtSize: newRunnerForm.tShirtSize,
      emergencyContact: 'Орг. комитет',
      medalEngraving: true,
      pastaParty: false,
      charityContribution: 0,
      totalAmount: newRunnerForm.totalAmount,
      paymentStatus: 'paid',
      paymentMethod: 'kaspi'
    });
    setIsAddRunnerOpen(false);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 text-lime-400" />
            Вернуться на сайт
          </button>
          
          <div className="hidden sm:block h-5 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-lime-400 text-black flex items-center justify-center font-black text-xs">
              AD
            </div>
            <div>
              <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                Оргкомитет & Судейская коллегия
                <span className="px-1.5 py-0.2 rounded bg-lime-400/10 text-lime-400 text-[10px] font-mono border border-lime-400/20">
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Selector & Actions */}
        <div className="flex items-center gap-3">
          <select
            value={currentEvent.id}
            onChange={(e) => onSelectEvent(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-lime-400"
          >
            {activeEventsList.length > 0 && (
              <optgroup label="Активные на сайте">
                {activeEventsList.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.city})
                  </option>
                ))}
              </optgroup>
            )}
            {archivedEvents.length > 0 && (
              <optgroup label="Архив / Завершенные">
                {archivedEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    📁 {ev.title} ({ev.city}) [АРХИВ]
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-lime-300 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Новое событие
          </button>

          <button
            onClick={() => {
              if (confirm('Сбросить базу участников и забегов к исходным демо-данным?')) {
                marathonStorage.resetToDefaults();
                refreshData();
              }
            }}
            title="Сбросить к исходным демо-данным"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Выйти из панели администратора"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white border border-red-900/60 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          )}
        </div>
      </header>

      {/* Archived Event Notice Banner */}
      {currentEvent.status === 'completed' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <b>Забег находится в Архиве:</b> Событие «{currentEvent.title}» завершено и скрыто с публичной части сайта. Участники и протоколы сохранены.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleRestoreEvent(currentEvent.id)}
            className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] uppercase flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Вернуть забег на сайт
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Admin Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#0a0b10] border-r border-zinc-850 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Обзор & Аналитика
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'participants'
                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              База участников (CRM)
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'participants' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {totalRunners}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('distances')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'distances'
                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Route className="w-4 h-4" />
            Дистанции и Тарифы
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              Программа & Расписание
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'schedule' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {currentEvent.schedule?.reduce((acc, d) => acc + (d.items?.length || 0), 0) || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'events'
                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Параметры забега
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Archive className="w-4 h-4" />
              Архив забегов
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'archive' ? 'bg-black text-white font-bold' : 'bg-zinc-800 text-amber-400 font-bold'
            }`}>
              {archivedEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sponsors')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'sponsors'
                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4" />
              Партнеры & Спонсоры
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'sponsors' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {currentEvent.sponsors?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expo')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'expo'
                ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/15'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-4 h-4" />
              Expo Check-in (Выдача)
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'expo' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {expoCheckedInCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              Документы и регламенты
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'documents' ? 'bg-white text-red-600 font-bold' : 'bg-zinc-800 text-zinc-300'
            }`}>
              5
            </span>
          </button>

          {/* Export Short Links */}
          <div className="pt-6 border-t border-zinc-850 mt-6 space-y-2">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
              Экспорт судейских протоколов
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Скачать Excel (.xlsx)
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 border border-blue-800/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              Скачать CSV (.csv)
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black font-athletic text-white">
                    {currentEvent.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {currentEvent.displayDate} • {currentEvent.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer hover:bg-emerald-400"
                  >
                    <Download className="w-4 h-4" />
                    Экспорт участников (Excel)
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0e0f17] border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
                    <span>ВСЕГО РЕГИСТРАЦИЙ</span>
                    <Users className="w-4 h-4 text-lime-400" />
                  </div>
                  <div className="text-3xl font-black text-white font-bebas tracking-wide">
                    {totalRunners} <span className="text-xs text-zinc-500 font-sans">человек</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Оплачено: <b className="text-lime-400">{paidRunners}</b>
                  </div>
                </div>

                <div className="bg-[#0e0f17] border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
                    <span>ОБЩАЯ ВЫРУЧКА</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white font-bebas tracking-wide">
                    {totalRevenue.toLocaleString('ru-RU')} <span className="text-base text-lime-400">₸</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Средний чек: <b>{totalRunners > 0 ? Math.round(totalRevenue / totalRunners).toLocaleString('ru-RU') : 0} ₸</b>
                  </div>
                </div>

                <div className="bg-[#0e0f17] border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
                    <span>ЗАПОЛНЕННОСТЬ СЛОТОВ</span>
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-3xl font-black text-white font-bebas tracking-wide">
                    {Math.round((totalRunners / (currentEvent.totalSlots || 4500)) * 100)}%
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Лимит: {currentEvent.totalSlots} мест
                  </div>
                </div>

                <div className="bg-[#0e0f17] border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
                    <span>ВЫДАЧА EXPO (CHECK-IN)</span>
                    <QrCode className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-black text-white font-bebas tracking-wide">
                    {expoCheckedInCount} <span className="text-xs text-zinc-500 font-sans">/ {totalRunners}</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 mt-1 font-semibold">
                    {totalRunners > 0 ? Math.round((expoCheckedInCount / totalRunners) * 100) : 0}% получили пакеты
                  </div>
                </div>
              </div>

              {/* Slot Occupancy Per Distance Table */}
              <div className="bg-[#0e0f17] border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Route className="w-4 h-4 text-lime-400" />
                  Заполняемость квот по дистанциям:
                </h3>
                <div className="space-y-4">
                  {currentEvent.distances.map(d => {
                    const count = participants.filter(p => p.distanceId === d.id).length;
                    const percent = Math.min(100, Math.round((count / d.slots) * 100));
                    return (
                      <div key={d.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2 text-white">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.hexColor }} />
                            {d.name} ({d.tag}) — {d.price.toLocaleString('ru-RU')} ₸
                          </span>
                          <span className="text-zinc-400">
                            <b className="text-white">{count}</b> из {d.slots} мест ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: d.hexColor
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS CRM */}
          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
                    РЕЕСТР УЧАСТНИКОВ ЗАБЕГА
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Всего зарегистрировано: {participants.length} атлетов
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsAddRunnerOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-lime-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-lime-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Добавить участника
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Excel (.xlsx)
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> CSV (.csv)
                  </button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Поиск по ФИО, Bib, телефону, email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                  />
                </div>

                <select
                  value={filterDistance}
                  onChange={e => setFilterDistance(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="all">Все дистанции</option>
                  {currentEvent.distances.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="all">Все возрастные категории</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Participants Table */}
              <div className="bg-[#0e0f17] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-3">Bib</th>
                        <th className="py-3 px-3">Атлет</th>
                        <th className="py-3 px-3">Возраст & Категория</th>
                        <th className="py-3 px-3">Дистанция</th>
                        <th className="py-3 px-3">Контакты</th>
                        <th className="py-3 px-3">Город / Клуб</th>
                        <th className="py-3 px-3">Футболка</th>
                        <th className="py-3 px-3">Оплата</th>
                        <th className="py-3 px-3">Expo Выдача</th>
                        <th className="py-3 px-3 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/30">
                      {filteredParticipants.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-zinc-500">
                            Участники не найдены
                          </td>
                        </tr>
                      ) : (
                        filteredParticipants.map(runner => (
                          <tr key={runner.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-lime-400">
                              {runner.bibNumber}
                            </td>
                            <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                              {runner.lastName} {runner.firstName}
                              <div className="text-[10px] text-zinc-400 font-normal">
                                {runner.gender === 'male' ? 'Мужчина' : 'Женщина'} • {runner.birthDate}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-lime-300 border border-zinc-700 whitespace-nowrap">
                                {runner.ageCategory}
                              </span>
                              <div className="text-[10px] text-zinc-500 mt-0.5">{runner.age} лет</div>
                            </td>
                            <td className="py-3 px-3 text-zinc-300 font-medium whitespace-nowrap">
                              {runner.distanceName}
                            </td>
                            <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                              <div>{runner.phone}</div>
                              <div className="text-zinc-500">{runner.email}</div>
                            </td>
                            <td className="py-3 px-3 text-zinc-300">
                              {runner.city}
                              {runner.club && <div className="text-[10px] text-zinc-400">{runner.club}</div>}
                            </td>
                            <td className="py-3 px-3 font-bold text-zinc-300">
                              {runner.tShirtSize}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20">
                                {runner.totalAmount.toLocaleString('ru-RU')} ₸
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => handleToggleExpo(runner.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer ${
                                  runner.checkedInExpo
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                              >
                                {runner.checkedInExpo ? 'ВЫДАН' : 'НЕ ВЫДАН'}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleDeleteRunner(runner.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Удалить участника"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISTANCES & PRICING & AGE CATEGORIES */}
          {activeTab === 'distances' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
                    УПРАВЛЕНИЕ ДИСТАНЦИЯМИ И ТАРИФАМИ
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Редактируйте стоимость слотов, время старта, лимиты и возрастные категории участников
                  </p>
                </div>
                <button
                  onClick={handleOpenAddDistance}
                  className="px-4 py-2.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-lime-300 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Добавить новую дистанцию
                </button>
              </div>

              {/* Distance Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {currentEvent.distances.map(d => (
                  <div
                    key={d.id}
                    className="bg-[#0e0f17] border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative hover:border-zinc-700 transition-all"
                  >
                    <div>
                      {/* Top Bar with Tag and Action Buttons */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="px-3 py-1 rounded-xl text-xs font-black uppercase text-black"
                          style={{ backgroundColor: d.hexColor }}
                        >
                          {d.tag}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditDistance(d)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-lime-400 hover:text-black text-xs font-bold text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Изменить сумму, время старта и возрастные категории"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteDistance(d.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-xl hover:bg-zinc-800 transition-colors"
                            title="Удалить дистанцию"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-3xl font-black font-bebas text-white tracking-wide">
                        {d.name}
                      </div>

                      {/* Key Parameters 4-grid */}
                      <div className="grid grid-cols-2 gap-2.5 my-4 text-xs">
                        <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Стоимость слота</span>
                          <span className="text-lg font-black text-lime-400">{d.price.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Квота мест</span>
                          <span className="text-lg font-black text-white">{d.slots} слотов</span>
                        </div>
                        <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Время старта</span>
                          <span className="text-base font-bold text-white">{d.startTime}</span>
                        </div>
                        <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Лимит времени</span>
                          <span className="text-base font-bold text-white">{d.timeLimit}</span>
                        </div>
                      </div>

                      {/* Age categories section on the card */}
                      <div className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 mb-3">
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-lime-400" />
                            Возрастные категории дистанции:
                          </span>
                          <span className="text-zinc-500 font-mono text-[11px]">
                            {d.ageCategories?.length || 0} категорий
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {d.ageCategories && d.ageCategories.length > 0 ? (
                            d.ageCategories.map(cat => (
                              <span
                                key={cat.id}
                                className="px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px] font-semibold"
                              >
                                {cat.name} ({cat.minAge}-{cat.maxAge === 99 ? '99+' : cat.maxAge})
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-500 italic">Категории не заданы</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-400 pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <span className="font-bold text-amber-400">
                        Мин. возраст участия: {d.minAge}+ лет
                      </span>
                      <div className="flex items-center gap-2">
                        {d.mapImageUrl && (
                          <span className="px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 text-[10px] font-bold border border-lime-400/20">
                            Схема загружена
                          </span>
                        )}
                        <span>Набор: {d.elevationGain}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SCHEDULE & TIMELINE MANAGEMENT */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-lime-400 uppercase tracking-widest mb-1">
                    <Clock className="w-4 h-4" />
                    Программа соревнований
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
                    УПРАВЛЕНИЕ РАСПИСАНИЕМ ЗАБЕГА
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Добавляйте соревновательные дни, редактируйте время стартов, разминки, паста-пати и церемонии награждения
                  </p>
                </div>
                <button
                  onClick={handleOpenAddDay}
                  className="px-4 py-2.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-lime-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Добавить день программы
                </button>
              </div>

              {/* Schedule Days List */}
              <div className="space-y-6">
                {(!currentEvent.schedule || currentEvent.schedule.length === 0) ? (
                  <div className="py-12 text-center bg-[#0e0f17] border border-zinc-800 rounded-3xl">
                    <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <div className="text-white font-bold text-sm">Расписание еще не составлено</div>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Нажмите «Добавить день программы», чтобы добавить дни Expo, Race Day и стартовые волны.
                    </p>
                  </div>
                ) : (
                  currentEvent.schedule.map((day, dayIdx) => (
                    <div
                      key={day.date || dayIdx}
                      className="bg-[#0e0f17] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
                    >
                      {/* Day Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-lime-400/10 border border-lime-400/20 text-lime-400 flex items-center justify-center font-black text-xs font-mono">
                            D{dayIdx + 1}
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white font-athletic">
                              {day.dayName}
                            </h3>
                            <span className="text-xs text-zinc-400 font-mono">{day.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenAddItem(dayIdx)}
                            className="px-3 py-1.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm hover:bg-lime-300 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Добавить событие
                          </button>
                          <button
                            onClick={() => handleOpenEditDay(dayIdx)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Редактировать день"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDay(dayIdx)}
                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Удалить день"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Day Items List */}
                      {day.items.length === 0 ? (
                        <div className="text-xs text-zinc-500 py-4 text-center italic bg-zinc-950/40 rounded-2xl border border-zinc-850">
                          В этот день еще нет событий. Нажмите «Добавить событие».
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {day.items.map((item, itemIdx) => {
                            const badge = 
                              item.category === 'start' ? { label: 'СТАРТ ЗАБЕГА', color: 'text-lime-400 bg-lime-400/10 border-lime-400/30' } :
                              item.category === 'expo' ? { label: 'ЭКСПО & ВЫДАЧА', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' } :
                              item.category === 'award' ? { label: 'НАГРАЖДЕНИЕ', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' } :
                              { label: 'СОБЫТИЕ', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };

                            return (
                              <div
                                key={itemIdx}
                                className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-850 hover:border-zinc-750 transition-all flex items-start justify-between gap-3 group"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-black text-lime-400 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {item.time}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.color}`}>
                                      {badge.label}
                                    </span>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-bold text-white">
                                    {item.title}
                                  </h4>
                                  <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                                    <span>{item.location}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleOpenEditItem(dayIdx, itemIdx)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title="Редактировать событие"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(dayIdx, itemIdx)}
                                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title="Удалить событие"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EVENT SETTINGS */}
          {activeTab === 'events' && (
            <div className="max-w-3xl bg-[#0e0f17] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-lime-400 uppercase tracking-widest mb-1">
                    <Calendar className="w-4 h-4" />
                    Параметры забега
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
                    НАСТРОЙКА СОБЫТИЯ: {currentEvent.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Редактируйте дату и время старта, локацию, лимиты и опции стартового пакета
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {currentEvent.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => handleRestoreEvent(currentEvent.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-amber-300 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Вернуть из архива на сайт
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Отправить «${currentEvent.title}» в архив? Забег завершится и будет скрыт с сайта.`)) {
                          handleArchiveEvent(currentEvent.id);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-amber-400 hover:text-black transition-all cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" /> Отправить в архив
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCreateEventOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-lime-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-lime-300 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Создать новый забег
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-6 text-xs">
                
                {/* SECTION 1: MAIN INFO */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-1 border-b border-zinc-800">
                    <Sparkles className="w-4 h-4 text-lime-400" />
                    Основная информация
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1">Название забега *</label>
                      <input
                        type="text"
                        required
                        value={eventForm.title}
                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none"
                        placeholder="Например: Aqtobe International Marathon 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1">Подзаголовок / Слоган</label>
                      <input
                        type="text"
                        value={eventForm.subtitle}
                        onChange={e => setEventForm({ ...eventForm, subtitle: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-lime-400 focus:outline-none"
                        placeholder="Главный праздник бега и скорости"
                      />
                    </div>
                  </div>

                  {/* DATE & TIME SETTINGS */}
                  <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-bold text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-lime-400" />
                        Точная дата и время старта (Race Day & Time) *
                      </label>
                      <span className="text-[11px] text-lime-400 font-mono">
                        Синхронизирует таймер обратного отсчета
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">
                          Календарная дата и время (ISO)
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={eventForm.date}
                          onChange={e => handleEventDateChange(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-lime-400 font-bold focus:border-lime-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">
                          Отображаемый текст даты на сайте
                        </label>
                        <input
                          type="text"
                          required
                          value={eventForm.displayDate}
                          onChange={e => setEventForm({ ...eventForm, displayDate: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                          placeholder="Например: 17 Мая 2026"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      💡 При изменении даты таймер обратного отсчета на главной странице немедленно пересчитывается.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1">Город проведения *</label>
                      <input
                        type="text"
                        required
                        value={eventForm.city}
                        onChange={e => setEventForm({ ...eventForm, city: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                        placeholder="г. Актобе"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1">Локация / Стадион / Старт *</label>
                      <input
                        type="text"
                        required
                        value={eventForm.location}
                        onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                        placeholder="Центральный стадион / Парк Первого Президента"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1">Призовой фонд</label>
                      <input
                        type="text"
                        value={eventForm.prizePool}
                        onChange={e => setEventForm({ ...eventForm, prizePool: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-lime-400 font-black focus:border-lime-400 focus:outline-none"
                        placeholder="15 000 000 ₸"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1">Лимит всех слотов</label>
                      <input
                        type="number"
                        value={eventForm.totalSlots}
                        onChange={e => setEventForm({ ...eventForm, totalSlots: parseInt(e.target.value) || 0 })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                        placeholder="4500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-bold mb-1">Статус регистрации</label>
                      <select
                        value={eventForm.status}
                        onChange={e => setEventForm({ ...eventForm, status: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                      >
                        <option value="registration_open">Регистрация открыта</option>
                        <option value="coming_soon">Скоро открытие</option>
                        <option value="sold_out">Все слоты проданы</option>
                        <option value="completed">📁 Забег завершен (переместить в архив)</option>
                      </select>
                    </div>
                  </div>

                  {eventForm.status === 'completed' && (
                    <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs flex items-start gap-2.5">
                      <Archive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-amber-400">Событие переносится в архив</div>
                        <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                          При статусе «Забег завершен» мероприятие <b>не отображается на главной странице сайта</b> для обычных пользователей. Вся история, база участников и протоколы финишеров доступны во вкладке <b>«Архив забегов»</b>.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Описание мероприятия</label>
                    <textarea
                      rows={3}
                      value={eventForm.description}
                      onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none resize-none"
                      placeholder="Краткое описание трассы, особенностей и сервиса для бегунов..."
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">URL баннера / обложки</label>
                    <input
                      type="text"
                      value={eventForm.bannerImage}
                      onChange={e => setEventForm({ ...eventForm, bannerImage: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none font-mono text-xs"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* SECTION 2: EVENT OPTIONS (T-SHIRT, MEDAL, PASTA, CHARITY) */}
                <div className="space-y-4 pt-4 border-t border-zinc-850">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-lime-400" />
                      Опции стартового пакета (Включение и отключение для участников)
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Настройте, какие дополнительные опции будут доступны бегунам на Шаге 3 формы регистрации
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* T-Shirt Toggle */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-lime-400" />
                          <span className="font-bold text-white text-xs">Фирменная футболка Dry-Fit</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={eventForm.optionsConfig.enableTShirt}
                          onChange={e => setEventForm({
                            ...eventForm,
                            optionsConfig: {
                              ...eventForm.optionsConfig,
                              enableTShirt: e.target.checked
                            }
                          })}
                          className="w-5 h-5 rounded text-lime-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer accent-lime-400"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {eventForm.optionsConfig.enableTShirt
                          ? 'Опция активна: бегуны могут выбрать размер футболки или отказаться от неё.'
                          : 'Опция отключена: выбор футболки будет скрыт в форме регистрации.'}
                      </p>
                    </div>

                    {/* Medal Engraving Toggle */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white text-xs">Лазерная гравировка медали</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={eventForm.optionsConfig.enableMedalEngraving}
                          onChange={e => setEventForm({
                            ...eventForm,
                            optionsConfig: {
                              ...eventForm.optionsConfig,
                              enableMedalEngraving: e.target.checked
                            }
                          })}
                          className="w-5 h-5 rounded text-lime-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer accent-lime-400"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[11px]">Стоимость (₸):</span>
                        <input
                          type="number"
                          disabled={!eventForm.optionsConfig.enableMedalEngraving}
                          value={eventForm.optionsConfig.medalEngravingPrice}
                          onChange={e => setEventForm({
                            ...eventForm,
                            optionsConfig: {
                              ...eventForm.optionsConfig,
                              medalEngravingPrice: Number(e.target.value)
                            }
                          })}
                          className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-lime-400 font-bold disabled:opacity-40"
                        />
                      </div>
                    </div>

                    {/* Pasta Party Toggle */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-orange-400" />
                          <span className="font-bold text-white text-xs">Предстартовая Pasta Party</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={eventForm.optionsConfig.enablePastaParty}
                          onChange={e => setEventForm({
                            ...eventForm,
                            optionsConfig: {
                              ...eventForm.optionsConfig,
                              enablePastaParty: e.target.checked
                            }
                          })}
                          className="w-5 h-5 rounded text-lime-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer accent-lime-400"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[11px]">Стоимость билета (₸):</span>
                        <input
                          type="number"
                          disabled={!eventForm.optionsConfig.enablePastaParty}
                          value={eventForm.optionsConfig.pastaPartyPrice}
                          onChange={e => setEventForm({
                            ...eventForm,
                            optionsConfig: {
                              ...eventForm.optionsConfig,
                              pastaPartyPrice: Number(e.target.value)
                            }
                          })}
                          className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-lime-400 font-bold disabled:opacity-40"
                        />
                      </div>
                    </div>

                    {/* Charity Toggle */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span className="font-bold text-white text-xs">Благотворительный взнос</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={eventForm.optionsConfig.enableCharity}
                          onChange={e => setEventForm({
                            ...eventForm,
                            optionsConfig: {
                              ...eventForm.optionsConfig,
                              enableCharity: e.target.checked
                            }
                          })}
                          className="w-5 h-5 rounded text-lime-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer accent-lime-400"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {eventForm.optionsConfig.enableCharity
                          ? 'Опция активна: бегуны могут внести 500, 1000, 2000, 5000 ₸ либо любую произвольную сумму.'
                          : 'Опция отключена: сбор взносов скрыт в форме регистрации.'}
                      </p>
                      {eventForm.optionsConfig.enableCharity && (
                        <div className="space-y-3 pt-3 border-t border-zinc-800">
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[11px]">
                              Название благотворительного фонда / проекта
                            </label>
                            <input
                              type="text"
                              value={eventForm.optionsConfig.charityFundName ?? ''}
                              placeholder="Например: фонд «Бақытты Бала» или Фонд «Аяла»"
                              onChange={e => setEventForm({
                                ...eventForm,
                                optionsConfig: {
                                  ...eventForm.optionsConfig,
                                  charityFundName: e.target.value
                                }
                              })}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-lime-400"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 font-bold block mb-1 text-[11px]">
                              Описание назначения сбора
                            </label>
                            <input
                              type="text"
                              value={eventForm.optionsConfig.charityDescription ?? ''}
                              placeholder="Например: Средства пойдут на закупку спортивной формы для детей..."
                              onChange={e => setEventForm({
                                ...eventForm,
                                optionsConfig: {
                                  ...eventForm.optionsConfig,
                                  charityDescription: e.target.value
                                }
                              })}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-lime-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Start Clusters / Elite Selection Toggle */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-white text-xs">Стартовые кластеры / Элита (выбор темпа)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(eventForm.optionsConfig.enableStartClusters)}
                          onChange={e => setEventForm({
                            ...eventForm,
                            optionsConfig: {
                              ...eventForm.optionsConfig,
                              enableStartClusters: e.target.checked
                            }
                          })}
                          className="w-5 h-5 rounded text-lime-500 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer accent-lime-400"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {eventForm.optionsConfig.enableStartClusters
                          ? 'Опция активна: на Шаге 1 регистрации отображается выбор стартового кластера (Кластер А Элита, B, C, D).'
                          : 'Опция отключена: выбор стартового кластера/элиты скрыт при регистрации.'}
                      </p>
                    </div>

                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase tracking-wider hover:bg-lime-300 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Сохранить все параметры забега
                </button>
              </form>
            </div>
          )}

          {/* TAB: ARCHIVE / COMPLETED EVENTS */}
          {activeTab === 'archive' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                    <Archive className="w-4 h-4" />
                    Архив и завершенные забеги
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
                    АРХИВ ЗАВЕРШЕННЫХ СТАРТОВ
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                    Завершенные забеги автоматически скрыты с главной страницы сайта, но их списки участников, результаты и история сохранены. Вы можете вернуть забег из архива на сайт в любой момент.
                  </p>
                </div>

                <div className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  В архиве: <b className="text-white">{archivedEvents.length}</b> событий
                </div>
              </div>

              {archivedEvents.length === 0 ? (
                <div className="bg-[#0e0f17] border border-zinc-800 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/20">
                    <Archive className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-white font-athletic">
                    В АРХИВЕ ПОКА НЕТ ЗАБЕГОВ
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Когда забег завершится, перейдите в «Параметры забега» и выберите статус «Забег завершен» (или нажмите кнопку «Отправить в архив»). Событие автоматически переместится сюда и исчезнет с витрины сайта.
                  </p>
                  {currentEvent && currentEvent.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Отправить забег «${currentEvent.title}» в архив? Он перестанет отображаться на сайте.`)) {
                          handleArchiveEvent(currentEvent.id);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      Перенести текущий забег «{currentEvent.title}» в архив
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {archivedEvents.map(ev => {
                    const eventParticipants = marathonStorage.getParticipants(ev.id);
                    const isCurrent = currentEvent?.id === ev.id;

                    return (
                      <div
                        key={ev.id}
                        className={`bg-[#0e0f17] border-2 rounded-3xl overflow-hidden flex flex-col justify-between transition-all ${
                          isCurrent ? 'border-amber-400/60 ring-2 ring-amber-400/10' : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {/* Event Card Header Image */}
                        <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                          <img
                            src={ev.bannerImage || 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop'}
                            alt={ev.title}
                            className="w-full h-full object-cover grayscale opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f17] via-[#0e0f17]/40 to-black/30" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-zinc-900/90 text-amber-400 border border-amber-400/40 flex items-center gap-1.5 shadow-md">
                              <Archive className="w-3 h-3 text-amber-400" /> В архиве (Завершен)
                            </span>

                            <span className="text-[11px] font-bold text-zinc-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                              {ev.city}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-4 right-4">
                            <div className="text-[11px] font-bold text-amber-400 mb-0.5 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {ev.displayDate || ev.date}
                            </div>
                            <h3 className="text-lg font-black text-white line-clamp-1 font-athletic">
                              {ev.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <p className="text-xs text-zinc-400 line-clamp-2">
                              {ev.description || ev.subtitle || 'Завершенный забег платформы.'}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 text-center">
                              <div>
                                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Участников</div>
                                <div className="text-sm font-black text-white font-mono mt-0.5">
                                  {eventParticipants.length}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Дистанций</div>
                                <div className="text-sm font-black text-lime-400 font-mono mt-0.5">
                                  {ev.distances?.length || 0}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-500 font-semibold uppercase">Призовой фонд</div>
                                <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
                                  {ev.prizePool || '—'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleRestoreEvent(ev.id);
                                onSelectEvent(ev.id);
                              }}
                              className="flex-1 py-2 px-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                              title="Вернуть забег на сайт, чтобы он снова стал виден пользователям"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Вернуть на сайт
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onSelectEvent(ev.id);
                                setActiveTab('participants');
                              }}
                              className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
                              title="Посмотреть финишные протоколы и список атлетов"
                            >
                              <Users className="w-3.5 h-3.5 text-zinc-400" />
                              Протоколы ({eventParticipants.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onSelectEvent(ev.id);
                                setActiveTab('events');
                              }}
                              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                              title="Редактировать параметры забега"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-900/40 transition-all cursor-pointer"
                              title="Удалить окончательно"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: SPONSORS & PARTNERS MANAGEMENT */}
          {activeTab === 'sponsors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-lime-400 uppercase tracking-widest mb-1">
                    <Award className="w-4 h-4" />
                    Партнеры & Спонсоры
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
                    УПРАВЛЕНИЕ СПОНСОРАМИ И ПАРТНЕРАМИ
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Добавляйте логотипы брендов, назначайте спонсорские уровни, цвета и ссылки на официальные сайты
                  </p>
                </div>
                <button
                  onClick={handleOpenAddSponsor}
                  className="px-4 py-2.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md hover:bg-lime-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Добавить спонсора
                </button>
              </div>

              {/* Sponsors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(currentEvent.sponsors || []).length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-[#0e0f17] border border-zinc-800 rounded-3xl">
                    <Award className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <div className="text-white font-bold text-sm">Спонсоры еще не добавлены</div>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Нажмите кнопку «Добавить спонсора», чтобы указать партнеров мероприятия и их логотипы.
                    </p>
                  </div>
                ) : (
                  currentEvent.sponsors.map(sp => {
                    const tierLabel = 
                      sp.tier === 'title' ? 'Титульный спонсор' :
                      sp.tier === 'general' ? 'Генеральный партнер' :
                      sp.tier === 'technical' ? 'Технический партнер' :
                      sp.tier === 'media' ? 'Медиа-партнер' : 'Официальный партнер';

                    return (
                      <div
                        key={sp.id || sp.name}
                        className="bg-[#0e0f17] border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-xl"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-750">
                              {tierLabel}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditSponsor(sp)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                title="Редактировать спонсора"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSponsor(sp)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Удалить спонсора"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Logo Display */}
                          <div className="h-16 flex items-center justify-center p-3 rounded-2xl bg-zinc-950/80 border border-zinc-850 my-2">
                            {sp.logoUrl ? (
                              <img
                                src={sp.logoUrl}
                                alt={sp.name}
                                className="max-h-12 max-w-[160px] object-contain drop-shadow"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className="font-bebas text-2xl font-black tracking-wider"
                                style={{ color: sp.accent }}
                              >
                                {sp.logoText || sp.name}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="mt-3">
                            <h4 className="text-base font-bold text-white truncate">{sp.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: sp.accent }}
                              />
                              <span className="text-[11px] text-zinc-400 font-mono">Цвет: {sp.accent}</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Link */}
                        <div className="pt-3 border-t border-zinc-850 mt-4 flex items-center justify-between text-xs">
                          {sp.websiteUrl ? (
                            <a
                              href={sp.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lime-400 hover:underline flex items-center gap-1 text-[11px] font-semibold truncate max-w-[180px]"
                            >
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              {sp.websiteUrl.replace(/^https?:\/\//, '')}
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-zinc-500">Сайт не указан</span>
                          )}

                          <span className="text-[10px] text-zinc-500 uppercase font-mono">
                            {sp.logoUrl ? 'Графический лого' : 'Текстовый лого'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: EXPO CHECK-IN SCANNER */}
          {activeTab === 'expo' && (
            <div className="space-y-6">
              <div className="max-w-xl mx-auto text-center space-y-2">
                <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto border border-cyan-500/30">
                  <QrCode className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black font-athletic text-white">
                  EXPO CHECK-IN ДЛЯ ВОЛОНТЕРОВ
                </h2>
                <p className="text-xs text-zinc-400">
                  Быстрый поиск по номеру Bib или фамилии для отметки о выдаче стартового пакета
                </p>

                <div className="relative pt-2">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Введите Bib (например: 42-101) или фамилию..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredParticipants.map(runner => (
                  <div
                    key={runner.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      runner.checkedInExpo
                        ? 'bg-emerald-950/20 border-emerald-700/40'
                        : 'bg-zinc-900/50 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black font-bebas text-lime-400">
                        {runner.bibNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        runner.checkedInExpo ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {runner.checkedInExpo ? 'ПАКЕТ ВЫДАН' : 'ОЖИДАЕТ'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {runner.lastName} {runner.firstName}
                    </h4>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Дистанция: <b className="text-zinc-200">{runner.distanceName}</b> • Категория: <b className="text-lime-400">{runner.ageCategory}</b>
                    </div>

                    <button
                      onClick={() => handleToggleExpo(runner.id)}
                      className={`w-full mt-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                        runner.checkedInExpo
                          ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                          : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-md'
                      }`}
                    >
                      {runner.checkedInExpo ? 'Отменить отметку' : 'Отметить выдачу пакета'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LEGAL DOCUMENTS & REGULATIONS */}
          {activeTab === 'documents' && (
            <DocumentsManager onOpenPreview={(key) => setPreviewDocKey(key)} />
          )}

        </main>
      </div>

      {/* MODAL: EDIT DISTANCE & AGE CATEGORIES */}
      {editingDistance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
                  Настройка параметров
                </span>
                <h3 className="text-xl font-black font-bebas text-white tracking-wide">
                  РЕДАКТИРОВАТЬ ДИСТАНЦИЮ: {editingDistance.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingDistance(null)}
                className="p-1.5 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedDistance} className="space-y-4 text-xs">
              
              {/* Row 1: Name & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Название дистанции *</label>
                  <input
                    type="text"
                    required
                    value={distanceForm.name}
                    onChange={e => setDistanceForm({ ...distanceForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Тег (Марафон, Спринт, Трейл) *</label>
                  <input
                    type="text"
                    required
                    value={distanceForm.tag}
                    onChange={e => setDistanceForm({ ...distanceForm, tag: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Row 2: Price & Quota */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Стоимость слота (₸) *
                  </label>
                  <input
                    type="number"
                    required
                    value={distanceForm.price}
                    onChange={e => setDistanceForm({ ...distanceForm, price: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-base font-black text-lime-400 focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Квота участников (слотов) *
                  </label>
                  <input
                    type="number"
                    required
                    value={distanceForm.slots}
                    onChange={e => setDistanceForm({ ...distanceForm, slots: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Километраж (км) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={distanceForm.distanceKm}
                    onChange={e => setDistanceForm({ ...distanceForm, distanceKm: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Row 3: Timing & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Время старта (ЧЧ:ММ) *</label>
                  <input
                    type="text"
                    required
                    value={distanceForm.startTime}
                    onChange={e => setDistanceForm({ ...distanceForm, startTime: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Лимит времени (Cut-off) *</label>
                  <input
                    type="text"
                    required
                    value={distanceForm.timeLimit}
                    onChange={e => setDistanceForm({ ...distanceForm, timeLimit: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Мин. возраст участия (лет) *
                  </label>
                  <input
                    type="number"
                    required
                    value={distanceForm.minAge}
                    onChange={e => setDistanceForm({ ...distanceForm, minAge: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-base font-black text-amber-400 focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Elevation & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Набор высоты (м) *</label>
                  <input
                    type="text"
                    value={distanceForm.elevationGain}
                    onChange={e => setDistanceForm({ ...distanceForm, elevationGain: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white"
                    placeholder="Например: +85 м или +250 м"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Цвет акцента</label>
                  <div className="flex gap-2">
                    {[
                      { color: '#84cc16', badge: 'lime' },
                      { color: '#f97316', badge: 'orange' },
                      { color: '#06b6d4', badge: 'cyan' },
                      { color: '#a855f7', badge: 'purple' },
                      { color: '#f59e0b', badge: 'amber' },
                    ].map(c => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setDistanceForm({ ...distanceForm, hexColor: c.color, badgeColor: c.badge }) }
                        className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                          distanceForm.hexColor === c.color ? 'scale-110 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* BIB Number Range & Format */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Tag className="w-4 h-4 text-lime-400" />
                    Диапазон и нумерация участников (BIB)
                  </span>
                  <span className="text-[11px] text-lime-400 font-mono font-bold bg-lime-950/60 px-2.5 py-0.5 rounded-lg border border-lime-800/60 self-start sm:self-auto">
                    Пример: {(distanceForm.bibPrefix || Math.round(distanceForm.distanceKm).toString().padStart(2, '0'))}-{String(distanceForm.bibStartNumber || 1).padStart(distanceForm.bibDigitsPadding || 3, '0')} ... {(distanceForm.bibPrefix || Math.round(distanceForm.distanceKm).toString().padStart(2, '0'))}-{String(distanceForm.bibEndNumber || distanceForm.slots).padStart(distanceForm.bibDigitsPadding || 3, '0')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1 text-[11px]">Префикс номера</label>
                    <input
                      type="text"
                      value={distanceForm.bibPrefix ?? ''}
                      onChange={e => setDistanceForm({ ...distanceForm, bibPrefix: e.target.value })}
                      placeholder={`По умолчанию: ${Math.round(distanceForm.distanceKm).toString().padStart(2, '0')}`}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-lime-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1 text-[11px]">Начальный номер (от)</label>
                    <input
                      type="number"
                      min="1"
                      value={distanceForm.bibStartNumber ?? 1}
                      onChange={e => setDistanceForm({ ...distanceForm, bibStartNumber: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-lime-400 font-bold focus:border-lime-400"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1 text-[11px]">Конечный номер (до)</label>
                    <input
                      type="number"
                      min="1"
                      value={distanceForm.bibEndNumber ?? distanceForm.slots}
                      onChange={e => setDistanceForm({ ...distanceForm, bibEndNumber: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-lime-400 font-bold focus:border-lime-400"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Номера участников на дистанции будут присваиваться последовательно: например, <b>{(distanceForm.bibPrefix || Math.round(distanceForm.distanceKm).toString().padStart(2, '0'))}-001</b>, <b>{(distanceForm.bibPrefix || Math.round(distanceForm.distanceKm).toString().padStart(2, '0'))}-002</b> и далее до <b>{(distanceForm.bibPrefix || Math.round(distanceForm.distanceKm).toString().padStart(2, '0'))}-{distanceForm.bibEndNumber || distanceForm.slots}</b>.
                </p>
              </div>

              {/* ROUTE MAP & SERVICE POINTS MANAGEMENT */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-black text-sm flex items-center gap-2">
                      <Route className="w-4 h-4 text-lime-400" />
                      Карта и схема трассы дистанции
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      Загрузите схему трассы в виде изображения или укажите точки старт/финиш, питание, медпост, туалет
                    </p>
                  </div>
                </div>

                {/* Upload Map Image or URL */}
                <div className="p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex-1 w-full">
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">
                        Ссылка на карту (Plotaroute, AllTrails, Yandex, или URL картинки):
                      </label>
                      <input
                        type="text"
                        placeholder="Например: https://www.plotaroute.com/route/3478900"
                        value={distanceForm.mapImageUrl || ''}
                        onChange={e => setDistanceForm({ ...distanceForm, mapImageUrl: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-lime-400"
                      />
                    </div>
                    <div className="shrink-0 w-full sm:w-auto">
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">
                        Или загрузить файл схемы:
                      </label>
                      <label className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700">
                        <ImageIcon className="w-3.5 h-3.5 text-lime-400" />
                        Выбрать файл схемы
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setDistanceForm(prev => ({ ...prev, mapImageUrl: reader.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {distanceForm.mapImageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-700 max-h-56 bg-black flex items-center justify-center p-1">
                      {distanceForm.mapImageUrl.includes('plotaroute.com') ? (
                        <div className="w-full text-center py-4 bg-zinc-950 rounded-lg">
                          <span className="text-xs text-lime-400 font-bold block mb-1">
                            ✓ Маршрут Plotaroute распознан (ID: {distanceForm.mapImageUrl.match(/route\/(\d+)/)?.[1] || '3478900'})
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            На сайте будет отображаться нарисованная вами интерактивная карта с высотами и точками
                          </span>
                        </div>
                      ) : (
                        <img
                          src={distanceForm.mapImageUrl}
                          alt="Предпросмотр карты"
                          className="max-h-56 max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setDistanceForm({ ...distanceForm, mapImageUrl: '' })}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-black/80 text-white hover:text-rose-400 cursor-pointer"
                        title="Удалить ссылку / схему"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Route Service Points Toggle/Summary */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                      <span>Точки на трассе этой дистанции:</span>
                      <span className="text-lime-400 font-mono text-[11px]">
                        {distanceForm.points.length} точек
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { type: 'start', label: 'Старт', emoji: '🏁', color: 'text-emerald-400' },
                        { type: 'finish', label: 'Финиш', emoji: '🏆', color: 'text-red-400' },
                        { type: 'water', label: 'Пункт питания', emoji: '💧', color: 'text-cyan-400' },
                        { type: 'medical', label: 'Медпост', emoji: '🚑', color: 'text-rose-400' },
                        { type: 'toilet', label: 'Туалет (WC)', emoji: '🚻', color: 'text-amber-400' }
                      ].map(pt => {
                        const count = distanceForm.points.filter(p => p.type === pt.type).length;
                        return (
                          <div
                            key={pt.type}
                            className="bg-zinc-950 p-2 rounded-xl border border-zinc-800 flex flex-col items-center justify-center text-center"
                          >
                            <span className="text-sm">{pt.emoji}</span>
                            <span className="text-[10px] text-zinc-300 font-bold mt-0.5">{pt.label}</span>
                            <span className={`text-[11px] font-mono font-black ${pt.color}`}>
                              {count} на трассе
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* AGE CATEGORIES SECTION */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-white font-black text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-lime-400" />
                      Возрастные категории для дистанции
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      Участники автоматически распределяются по этим категориям при регистрации на основе даты рождения
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApplyCategoryPreset('adult')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-750"
                    >
                      Шаблон: Взрослые
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCategoryPreset('youth')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-750"
                    >
                      Шаблон: 10K
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCategoryPreset('kids')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-750"
                    >
                      Шаблон: Дети
                    </button>
                  </div>
                </div>

                {/* Categories Table / List */}
                <div className="space-y-2 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
                  {distanceForm.ageCategories.length === 0 ? (
                    <div className="text-zinc-500 py-3 text-center italic">
                      Нет настроенных возрастных категорий. Добавьте вручную или выберите шаблон выше.
                    </div>
                  ) : (
                    distanceForm.ageCategories.map(cat => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/80 border border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-lime-400" />
                          <span className="font-bold text-white text-xs">{cat.name}</span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            (от {cat.minAge} до {cat.maxAge === 99 ? '99+' : cat.maxAge} лет)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategoryFromForm(cat.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}

                  {/* Add New Category Row */}
                  <div className="pt-2 border-t border-zinc-800 flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Название (напр: 18-25 лет)"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-[10px]">От:</span>
                      <input
                        type="number"
                        placeholder="Мин"
                        value={newCategoryMinAge}
                        onChange={e => setNewCategoryMinAge(Number(e.target.value))}
                        className="w-14 bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-white text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-[10px]">До:</span>
                      <input
                        type="number"
                        placeholder="Макс"
                        value={newCategoryMaxAge}
                        onChange={e => setNewCategoryMaxAge(Number(e.target.value))}
                        className="w-14 bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-white text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCategoryToForm}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-lime-400 hover:text-black text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      + Добавить
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDistance(null)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold hover:bg-zinc-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-black font-black uppercase tracking-wider hover:bg-lime-300 shadow-lg shadow-lime-400/20 cursor-pointer"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW DISTANCE */}
      {isAddDistanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
                  Создание трассы
                </span>
                <h3 className="text-xl font-black font-bebas text-white tracking-wide">
                  ДОБАВИТЬ НОВУЮ ДИСТАНЦИЮ В ЗАБЕГ
                </h3>
              </div>
              <button
                onClick={() => setIsAddDistanceOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDistance} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Название дистанции *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: 15.0 км"
                    value={distanceForm.name}
                    onChange={e => setDistanceForm({ ...distanceForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Тег (Спринт, Трейл, и т.д.) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Speed Sprint"
                    value={distanceForm.tag}
                    onChange={e => setDistanceForm({ ...distanceForm, tag: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Стоимость слота (₸) *</label>
                  <input
                    type="number"
                    required
                    value={distanceForm.price}
                    onChange={e => setDistanceForm({ ...distanceForm, price: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-base font-black text-lime-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Квота мест *</label>
                  <input
                    type="number"
                    required
                    value={distanceForm.slots}
                    onChange={e => setDistanceForm({ ...distanceForm, slots: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Дистанция (км) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={distanceForm.distanceKm}
                    onChange={e => setDistanceForm({ ...distanceForm, distanceKm: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Время старта *</label>
                  <input
                    type="text"
                    value={distanceForm.startTime}
                    onChange={e => setDistanceForm({ ...distanceForm, startTime: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Лимит времени *</label>
                  <input
                    type="text"
                    value={distanceForm.timeLimit}
                    onChange={e => setDistanceForm({ ...distanceForm, timeLimit: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Мин. возраст участия *</label>
                  <input
                    type="number"
                    value={distanceForm.minAge}
                    onChange={e => setDistanceForm({ ...distanceForm, minAge: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Age Categories for new distance */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs">Возрастные категории</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyCategoryPreset('adult')}
                      className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-300"
                    >
                      Взрослые
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCategoryPreset('youth')}
                      className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-300"
                    >
                      10K
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCategoryPreset('kids')}
                      className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-300"
                    >
                      Дети
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  {distanceForm.ageCategories.map(cat => (
                    <span key={cat.id} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px]">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDistanceOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-black font-black uppercase tracking-wider hover:bg-lime-300"
                >
                  Создать дистанцию
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW EVENT */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">Создать новое мероприятие (забег)</h3>
              <button onClick={() => setIsCreateEventOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Название забега *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Almaty Half Marathon 2026"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Город проведения *</label>
                  <input
                    type="text"
                    required
                    placeholder="Алматы, Астана, Актобе..."
                    value={newEventCity}
                    onChange={e => setNewEventCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Дата забега *</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Локация / Место старта</label>
                <input
                  type="text"
                  placeholder="Центральный парк, Набережная, Стадион..."
                  value={newEventLocation}
                  onChange={e => setNewEventLocation(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-lime-400 text-black font-black uppercase tracking-wider hover:bg-lime-300 mt-2 cursor-pointer"
              >
                Создать мероприятие
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ADD PARTICIPANT */}
      {isAddRunnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">Добавить участника вручную</h3>
              <button onClick={() => setIsAddRunnerOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRunner} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Имя *</label>
                  <input
                    type="text"
                    required
                    value={newRunnerForm.firstName}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, firstName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Фамилия *</label>
                  <input
                    type="text"
                    required
                    value={newRunnerForm.lastName}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, lastName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Дистанция *</label>
                  <select
                    value={newRunnerForm.distanceId}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, distanceId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    {currentEvent.distances.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.minAge}+ лет)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Дата рождения *</label>
                  <input
                    type="date"
                    required
                    value={newRunnerForm.birthDate}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, birthDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Телефон</label>
                  <input
                    type="text"
                    value={newRunnerForm.phone}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newRunnerForm.email}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Город</label>
                  <input
                    type="text"
                    value={newRunnerForm.city}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, city: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Размер футболки</label>
                  <select
                    value={newRunnerForm.tShirtSize}
                    onChange={e => setNewRunnerForm({ ...newRunnerForm, tShirtSize: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-lime-400 text-black font-black uppercase tracking-wider hover:bg-lime-300 mt-2 cursor-pointer"
              >
                Сохранить участника
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SPONSOR */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
                  {editingSponsor ? 'Редактирование' : 'Новый партнер'}
                </span>
                <h3 className="text-xl font-black font-bebas text-white tracking-wide">
                  {editingSponsor ? `РЕДАКТИРОВАТЬ СПОНСОРА: ${editingSponsor.name}` : 'ДОБАВИТЬ СПОНСОРА / ПАРТНЕРА'}
                </h3>
              </div>
              <button
                onClick={() => setIsSponsorModalOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSponsor} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Название компании / бренда *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Kaspi.kz, ERG, Nike, Tassay"
                  value={sponsorForm.name}
                  onChange={e => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Категория / Спонсорский уровень (Tier) *
                </label>
                <select
                  value={sponsorForm.tier}
                  onChange={e => setSponsorForm({ ...sponsorForm, tier: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                >
                  <option value="title">Титульный спонсор (Title Sponsor)</option>
                  <option value="general">Генеральный партнер (General Partner)</option>
                  <option value="official">Официальный спонсор (Official Sponsor)</option>
                  <option value="technical">Технический партнер (Technical Partner)</option>
                  <option value="media">Информационный / Медиа-партнер (Media Partner)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  URL логотипа (ссылка на изображение PNG/SVG/WebP)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={sponsorForm.logoUrl}
                    onChange={e => setSponsorForm({ ...sponsorForm, logoUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:border-lime-400 focus:outline-none font-mono"
                  />
                  <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Рекомендуется PNG или SVG с прозрачным фоном. Если поле пустое, отображается текстовый логотип.
                </p>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Текстовый логотип / Название для бейджа
                </label>
                <input
                  type="text"
                  placeholder="Например: KASPI PAY, ERG, NIKE PRO"
                  value={sponsorForm.logoText}
                  onChange={e => setSponsorForm({ ...sponsorForm, logoText: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none font-bebas tracking-wider"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Фирменный цвет акцента
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sponsorForm.accent}
                    onChange={e => setSponsorForm({ ...sponsorForm, accent: e.target.value })}
                    className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={sponsorForm.accent}
                    onChange={e => setSponsorForm({ ...sponsorForm, accent: e.target.value })}
                    className="w-28 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                  {/* Preset chips */}
                  <div className="flex gap-1.5">
                    {['#00d26a', '#f14635', '#00a3e0', '#ffffff', '#f59e0b', '#3b82f6'].map(hex => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSponsorForm({ ...sponsorForm, accent: hex })}
                        className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer ${
                          sponsorForm.accent === hex ? 'scale-110 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Ссылка на официальный сайт партнера
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://kaspi.kz"
                    value={sponsorForm.websiteUrl}
                    onChange={e => setSponsorForm({ ...sponsorForm, websiteUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                  />
                  <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* LIVE PREVIEW BOX */}
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Предпросмотр карточки на сайте:
                </span>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                    {sponsorForm.tier === 'title' ? 'Титульный спонсор' : sponsorForm.tier === 'general' ? 'Генеральный партнер' : sponsorForm.tier === 'technical' ? 'Технический партнер' : sponsorForm.tier === 'media' ? 'Медиа-партнер' : 'Официальный партнер'}
                  </span>
                  {sponsorForm.logoUrl ? (
                    <div className="h-10 flex items-center justify-center my-1">
                      <img src={sponsorForm.logoUrl} alt="Preview" className="max-h-9 max-w-[130px] object-contain" />
                    </div>
                  ) : (
                    <div
                      className="font-bebas text-2xl font-black tracking-wider"
                      style={{ color: sponsorForm.accent }}
                    >
                      {sponsorForm.logoText || sponsorForm.name || 'BRAND NAME'}
                    </div>
                  )}
                  <div className="text-[10px] text-zinc-400 mt-1">{sponsorForm.name || 'Название компании'}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase tracking-wider hover:bg-lime-300 transition-colors shadow-lg cursor-pointer"
                >
                  {editingSponsor ? 'Сохранить изменения' : 'Добавить спонсора'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSponsorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SCHEDULE DAY */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-athletic">
                {editingDayIndex !== null ? 'Редактировать день программы' : 'Добавить день в расписание'}
              </h3>
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDay} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Название и день недели *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Воскресенье — RACE DAY (ДЕНЬ СТАРТА)"
                  value={dayForm.dayName}
                  onChange={e => setDayForm({ ...dayForm, dayName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Календарная дата *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: 17 Мая 2026"
                  value={dayForm.date}
                  onChange={e => setDayForm({ ...dayForm, date: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase tracking-wider hover:bg-lime-300 transition-colors shadow-lg cursor-pointer"
                >
                  {editingDayIndex !== null ? 'Сохранить изменения' : 'Создать день'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SCHEDULE ITEM */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-athletic">
                {editingItemIndex !== null ? 'Редактировать событие' : 'Добавить событие в программу'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  День программы
                </label>
                <select
                  value={itemTargetDayIndex}
                  onChange={e => setItemTargetDayIndex(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                >
                  {(currentEvent.schedule || []).map((d, idx) => (
                    <option key={idx} value={idx}>
                      {d.dayName} ({d.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Время события (ЧЧ:ММ) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="07:00"
                    value={itemForm.time}
                    onChange={e => setItemForm({ ...itemForm, time: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-lime-400 font-mono font-bold focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Категория *
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                  >
                    <option value="start">СТАРТ ЗАБЕГА</option>
                    <option value="expo">ЭКСПО & ВЫДАЧА</option>
                    <option value="award">ЦЕРЕМОНИЯ НАГРАЖДЕНИЯ</option>
                    <option value="social">РАЗВЛЕЧЕНИЯ / КОНЦЕРТ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Название события *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: СТАРТ ДИСТАНЦИИ 42.195 км (Марафон)"
                  value={itemForm.title}
                  onChange={e => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">
                  Локация / Место сбора
                </label>
                <input
                  type="text"
                  placeholder="Например: Стартовая арка, Центральная площадь"
                  value={itemForm.location}
                  onChange={e => setItemForm({ ...itemForm, location: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-lime-400 text-black font-black text-xs uppercase tracking-wider hover:bg-lime-300 transition-colors shadow-lg cursor-pointer"
                >
                  {editingItemIndex !== null ? 'Сохранить изменения' : 'Добавить событие'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW LEGAL DOCUMENT MODAL */}
      {previewDocKey && (
        <DocumentModal
          isOpen={previewDocKey !== null}
          onClose={() => setPreviewDocKey(null)}
          documentKey={previewDocKey}
        />
      )}

    </div>
  );
};
