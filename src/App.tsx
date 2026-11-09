import React, { useState, useEffect } from 'react';
import { marathonStorage } from './services/marathonStorage';
import { MarathonEvent } from './types/marathon';
import { Navbar } from './components/Layout/Navbar';
import { HeroSection } from './components/Hero/HeroSection';
import { EventsShowcase } from './components/Events/EventsShowcase';
import { DistancesGrid } from './components/Distances/DistancesGrid';
import { RouteMap } from './components/Map/RouteMap';
import { RaceSchedule } from './components/Schedule/RaceSchedule';
import { ParticipantsList } from './components/Participants/ParticipantsList';
import { ResultsModal } from './components/Results/ResultsModal';
import { PaceCalculator } from './components/Tools/PaceCalculator';
import { Footer } from './components/Layout/Footer';
import { RegistrationModal } from './components/Registration/RegistrationModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { AdminLogin } from './components/Admin/AdminLogin';
import { DocumentModal } from './components/Legal/DocumentModal';
import { Trophy } from 'lucide-react';

export function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [activeEventId, setActiveEventId] = useState('aktobe-2026');
  const [events, setEvents] = useState<MarathonEvent[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [selectedDistanceId, setSelectedDistanceId] = useState<string | undefined>();
  const [activeDocumentKey, setActiveDocumentKey] = useState<'regulation' | 'offer' | 'privacy' | 'medical' | 'transfer' | null>(null);

  const loadData = () => {
    const list = marathonStorage.getEvents();
    setEvents(list);
  };

  useEffect(() => {
    loadData();

    // Check existing admin auth session
    const authStatus = sessionStorage.getItem('marathon_admin_authenticated') === 'true';
    setIsAdminAuthenticated(authStatus);

    // Check hash for #admin or ?admin=true
    const checkHashRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#admin' || params.get('admin') === 'true') {
        setIsAdminView(true);
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);

    const handleStorageUpdate = () => loadData();
    window.addEventListener('marathon-storage-update', handleStorageUpdate);

    return () => {
      window.removeEventListener('hashchange', checkHashRoute);
      window.removeEventListener('marathon-storage-update', handleStorageUpdate);
    };
  }, []);

  const handleBackToSite = () => {
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname);
    }
    setIsAdminView(false);
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminView(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('marathon_admin_authenticated');
    setIsAdminAuthenticated(false);
    handleBackToSite();
  };

  const publicEvents = events.filter(e => e.status !== 'completed');
  const activeEvent = isAdminView
    ? (events.find(e => e.id === activeEventId) || events[0])
    : (publicEvents.find(e => e.id === activeEventId) || publicEvents[0]);

  // Admin View: If user requested admin, check if authenticated
  if (isAdminView) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToSite={handleBackToSite}
        />
      );
    }

    return (
      <AdminPanel
        onBackToSite={handleBackToSite}
        onLogout={handleLogout}
        activeEventId={activeEvent?.id || events[0]?.id || 'aktobe-2026'}
        onSelectEvent={(id) => setActiveEventId(id)}
      />
    );
  }

  // If on public site and no active public events exist (all in archive)
  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-athletic text-slate-950 uppercase tracking-tight">
          Все забеги сезона завершены
        </h1>
        <p className="text-slate-600 text-sm max-w-md mt-2">
          Все проведенные старты перемещены в архив. Скоро здесь появятся анонсы новых масштабных забегов.
        </p>
        <button
          onClick={() => setIsResultsOpen(true)}
          className="mt-6 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all cursor-pointer"
        >
          Смотреть финишные протоколы
        </button>
        <ResultsModal
          isOpen={isResultsOpen}
          onClose={() => setIsResultsOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenRegistration={() => {
          setSelectedDistanceId(undefined);
          setIsRegistrationOpen(true);
        }}
        onOpenResults={() => setIsResultsOpen(true)}
      />

      {/* Main Public Hero */}
      <main>
        <HeroSection
          event={activeEvent}
          onRegisterClick={() => {
            setSelectedDistanceId(undefined);
            setIsRegistrationOpen(true);
          }}
          onExploreMapClick={() => {
            document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-16">
          
          {/* Section 0: All Marathon Events Calendar */}
          <EventsShowcase
            events={publicEvents}
            activeEventId={activeEvent.id}
            onSelectEvent={(id) => setActiveEventId(id)}
            onOpenRegistration={(id) => {
              setActiveEventId(id);
              setSelectedDistanceId(undefined);
              setIsRegistrationOpen(true);
            }}
          />

          {/* Section 1: Distances & Pricing */}
          <section id="distances" className="scroll-mt-24">
            <DistancesGrid
              distances={activeEvent.distances}
              eventStatus={activeEvent.status}
              onSelectDistance={(distId) => {
                setSelectedDistanceId(distId);
                setIsRegistrationOpen(true);
              }}
            />
          </section>

          {/* Section 2: Interactive Route Map */}
          <section id="map" className="scroll-mt-24">
            <RouteMap
              distances={activeEvent.distances}
              centerCoords={activeEvent.centerCoords}
              city={activeEvent.city}
            />
          </section>

          {/* Section 3: Race Weekend Schedule */}
          <section id="schedule" className="scroll-mt-24">
            <RaceSchedule schedule={activeEvent.schedule} />
          </section>

          {/* Section 4: Public Registered Athletes / Start Protocol List */}
          <ParticipantsList
            event={activeEvent}
            onRegisterClick={() => {
              setSelectedDistanceId(undefined);
              setIsRegistrationOpen(true);
            }}
          />

          {/* Section 5: Athlete Pace & Splits Calculator */}
          <section id="calculator" className="scroll-mt-24">
            <PaceCalculator />
          </section>

        </div>
      </main>

      {/* Footer */}
      <Footer
        sponsors={activeEvent.sponsors}
        onOpenDocument={(key) => setActiveDocumentKey(key)}
      />

      {/* Registration Modal Wizard */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        event={activeEvent}
        initialDistanceId={selectedDistanceId}
        onRegistrationSuccess={() => {
          loadData();
        }}
      />

      {/* Results & Finisher Diplomas Modal Window */}
      <ResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
      />

      {/* Legal & Regulation Document Modal */}
      <DocumentModal
        isOpen={activeDocumentKey !== null}
        onClose={() => setActiveDocumentKey(null)}
        documentKey={activeDocumentKey}
      />

    </div>
  );
}

export default App;
