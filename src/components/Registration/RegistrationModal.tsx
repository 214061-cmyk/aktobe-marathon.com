import React, { useState } from 'react';
import type { MarathonEvent, TShirtSize, PaymentMethod, Participant } from '../../types/marathon';
import { DigitalBib } from '../Bib/DigitalBib';
import { marathonStorage } from '../../services/marathonStorage';
import { calculateAge, determineAgeCategory } from '../../utils/ageUtils';
import confetti from 'canvas-confetti';
import { 
  X, Check, ChevronRight, ChevronLeft, CreditCard, 
  Smartphone, Award, Utensils, Heart, ShieldCheck, Download, 
  Sparkles, Calendar, MapPin, QrCode, AlertTriangle, CheckCircle2, UserCheck, Lock
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MarathonEvent;
  initialDistanceId?: string;
  onRegistrationSuccess?: (participant: Participant) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  initialDistanceId,
  onRegistrationSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDistanceId, setSelectedDistanceId] = useState<string>(
    initialDistanceId || event.distances[0]?.id || ''
  );
  const [cluster, setCluster] = useState<string>('Кластер B (Целевой темп 4:30 - 5:15 мин/км)');

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('2000-05-15');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+7 705 ');
  const [city, setCity] = useState('Актобе');
  const [club, setClub] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Step 3
  const [wantsTShirt, setWantsTShirt] = useState<boolean>(true);
  const [tShirtSize, setTShirtSize] = useState<TShirtSize>('L');
  const [medalEngraving, setMedalEngraving] = useState(false);
  const [pastaParty, setPastaParty] = useState(false);
  const [charityContribution, setCharityContribution] = useState<number>(0);

  // Step 5
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('kaspi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [registeredRunner, setRegisteredRunner] = useState<Participant | null>(null);

  if (!isOpen) return null;

  // STRICT CHECK: Disallow registration if event status is NOT registration_open
  if (event.status !== 'registration_open') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black font-bebas text-slate-900 mb-2">
            РЕГИСТРАЦИЯ ЗАКРЫТА
          </h3>

          <p className="text-sm text-slate-600 mb-6">
            {event.status === 'coming_soon' && (
              <>Регистрация на мероприятие <b>«{event.title}»</b> еще не открыта оргкомитетом. Следите за анонсами в календаре забегов.</>
            )}
            {event.status === 'sold_out' && (
              <>Все стартовые слоты на забег <b>«{event.title}»</b> полностью выкуплены. Регистрация завершена.</>
            )}
            {event.status === 'completed' && (
              <>Мероприятие <b>«{event.title}»</b> уже состоялось. Регистрация не производится.</>
            )}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider"
          >
            Вернуться к просмотру
          </button>
        </div>
      </div>
    );
  }

  const selectedDistance = event.distances.find(d => d.id === selectedDistanceId) || event.distances[0];

  // Options configuration from event (organizer controlled)
  const optionsConfig = event.optionsConfig || {
    enableTShirt: true,
    tShirtPrice: 0,
    enableMedalEngraving: true,
    medalEngravingPrice: 2000,
    enablePastaParty: true,
    pastaPartyPrice: 3500,
    enableCharity: true
  };

  // Age calculation and validation against distance requirement
  const runnerAge = calculateAge(birthDate, event.date);
  const isUnderAge = runnerAge < (selectedDistance?.minAge || 0);
  const matchedCategory = determineAgeCategory(runnerAge, selectedDistance?.ageCategories) || {
    id: 'default-cat',
    name: 'Абсолют',
    minAge: 18,
    maxAge: 99
  };

  // Price Calculation respecting organizer configuration
  const basePrice = selectedDistance?.price || 0;
  const engravingPrice = (optionsConfig.enableMedalEngraving && medalEngraving) ? optionsConfig.medalEngravingPrice : 0;
  const pastaPrice = (optionsConfig.enablePastaParty && pastaParty) ? optionsConfig.pastaPartyPrice : 0;
  const charityPrice = optionsConfig.enableCharity ? charityContribution : 0;
  const totalPrice = basePrice + engravingPrice + pastaPrice + charityPrice;

  const handleNext = () => {
    if (currentStep === 2) {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !birthDate) {
        alert('Пожалуйста, заполните обязательные поля: Имя, Фамилия, Дата рождения, Email и Телефон');
        return;
      }

      if (isUnderAge) {
        alert(
          `Внимание: На дистанцию "${selectedDistance.name}" допускаются участники строго от ${selectedDistance.minAge} лет!\n\n` +
          `Ваш расчетный возраст на день соревнований: ${runnerAge} лет.\n` +
          `Пожалуйста, вернитесь на Шаг 1 и выберите разрешенную дистанцию.`
        );
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinishPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Register in Storage with calculated age and ageCategory
      const newRunner = marathonStorage.registerParticipant({
        eventId: event.id,
        distanceId: selectedDistance.id,
        distanceName: selectedDistance.name,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        birthDate,
        age: runnerAge,
        ageCategory: matchedCategory.name,
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        country: 'Казахстан',
        club: club.trim() || undefined,
        wantsTShirt: optionsConfig.enableTShirt ? wantsTShirt : false,
        tShirtSize: optionsConfig.enableTShirt && wantsTShirt ? tShirtSize : 'NONE',
        emergencyContact: emergencyContact.trim() || 'Не указан',
        medalEngraving: optionsConfig.enableMedalEngraving ? medalEngraving : false,
        pastaParty: optionsConfig.enablePastaParty ? pastaParty : false,
        charityContribution: optionsConfig.enableCharity ? charityContribution : 0,
        totalAmount: totalPrice,
        paymentStatus: 'paid',
        paymentMethod
      });

      setIsProcessing(false);
      setRegisteredRunner(newRunner);
      setCurrentStep(6); // Success Step

      // Launch Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (onRegistrationSuccess) {
        onRegistrationSuccess(newRunner);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm">
              AR
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Регистрация участника
              </h3>
              <p className="text-xs text-slate-500">
                {event.title} • {event.displayDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker (Steps 1 to 5) */}
        {currentStep <= 5 && (
          <div className="px-6 pt-3 pb-2 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
              <span className={currentStep >= 1 ? 'text-red-600 font-bold' : ''}>1. Дистанция</span>
              <span className={currentStep >= 2 ? 'text-red-600 font-bold' : ''}>2. Данные атлета</span>
              <span className={currentStep >= 3 ? 'text-red-600 font-bold' : ''}>3. Опции пакета</span>
              <span className={currentStep >= 4 ? 'text-red-600 font-bold' : ''}>4. Стартовый номер</span>
              <span className={currentStep >= 5 ? 'text-red-600 font-bold' : ''}>5. Оплата</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">

          {/* STEP 1: DISTANCE SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900">Выберите дистанцию забега:</h4>
                <span className="text-xs text-slate-500">Внимание на возрастные лимиты</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {event.distances.map(d => {
                  const isSelected = d.id === selectedDistanceId;
                  const slotsLeft = d.slots - (d.registeredCount || 0);
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDistanceId(d.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center border-2 shrink-0"
                          style={{ borderColor: d.hexColor || '#dc2626' }}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.hexColor || '#dc2626' }} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-black text-slate-900">{d.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                              {d.tag}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                              Строго {d.minAge}+ лет
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Старт в {d.startTime} • Лимит: {d.timeLimit} • Высота: {d.elevationGain}
                          </div>
                          {d.ageCategories && d.ageCategories.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <span className="text-[10px] text-slate-400 font-bold">Категории:</span>
                              {d.ageCategories.slice(0, 4).map(cat => (
                                <span key={cat.id} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {cat.name}
                                </span>
                              ))}
                              {d.ageCategories.length > 4 && (
                                <span className="text-[10px] text-slate-400 font-bold">+{d.ageCategories.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <div className="text-xl font-black text-slate-900 font-athletic">
                          {d.price.toLocaleString('ru-RU')} ₸
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {slotsLeft > 0 ? `Осталось ${slotsLeft} мест` : 'Слоты распроданы'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cluster Choice */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Стартовый кластер (по ожидаемому темпу)
                </label>
                <select
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 font-medium"
                >
                  <option>Кластер A (Элита, целевой темп быстрее 4:15 мин/км)</option>
                  <option>Кластер B (Опытные, темп 4:30 - 5:15 мин/км)</option>
                  <option>Кластер C (Любители, темп 5:30 - 6:30 мин/км)</option>
                  <option>Кластер D (Начинающие / Финишеры, темп спокойный)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: ATHLETE PROFILE & AGE CATEGORY DETERMINATION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-900">Анкета спортсмена</h4>
                <span className="text-xs text-red-600 font-bold">
                  Выбрано: {selectedDistance.name} ({selectedDistance.minAge}+ лет)
                </span>
              </div>

              {/* Age Validation Warning */}
              {isUnderAge && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-900">Внимание! Ограничение по возрасту</div>
                    <div>
                      Для участия на дистанции {selectedDistance.name} минимальный возраст — <b>{selectedDistance.minAge} лет</b>. 
                      По указанной дате рождения ваш возраст составит <b>{runnerAge} лет</b>.
                    </div>
                  </div>
                </div>
              )}

              {/* Automatically Determined Age Category Preview */}
              {!isUnderAge && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-600">Определена возрастная категория:</span>
                    <b className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {matchedCategory.name}
                    </b>
                  </div>
                  <span className="text-slate-500 font-mono">
                    Возраст: <b>{runnerAge} лет</b>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Имя *</label>
                  <input
                    type="text"
                    required
                    placeholder="Алибек"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Фамилия *</label>
                  <input
                    type="text"
                    required
                    placeholder="Жумагулов"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Пол *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        gender === 'male'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Мужской
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        gender === 'female'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Женский
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Дата рождения (ДД.ММ.ГГГГ) *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email для билета *</label>
                  <input
                    type="email"
                    required
                    placeholder="runner@example.kz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Мобильный телефон *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 705 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Город</label>
                  <input
                    type="text"
                    placeholder="Актобе"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Беговой клуб / Команда</label>
                  <input
                    type="text"
                    placeholder="Aqtobe Runners Club"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Экстренный контакт (Имя и телефон близкого человека)
                </label>
                <input
                  type="text"
                  placeholder="Супруга Алия +7 705 987 65 43"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 3: OPTIONS & EXTRAS (CONTROLLED BY ORGANIZER) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-900">Опции стартового пакета</h4>
                <span className="text-xs text-slate-500">Дополнительный сервис</span>
              </div>

              {/* T-Shirt option */}
              {optionsConfig.enableTShirt && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        Фирменная футболка участника Dry-Fit
                        <span className="px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                          {optionsConfig.tShirtPrice === 0 ? 'ВКЛЮЧЕНА В СЛОТ' : `+${optionsConfig.tShirtPrice} ₸`}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Дышащая беговая футболка с символикой забега
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={wantsTShirt}
                      onChange={(e) => setWantsTShirt(e.target.checked)}
                      className="w-5 h-5 rounded text-red-600 focus:ring-0 cursor-pointer accent-red-600"
                    />
                  </div>

                  {wantsTShirt && (
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Выберите размер футболки:
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setTShirtSize(sz)}
                            className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              tShirtSize === sz
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Medal Engraving option */}
              {optionsConfig.enableMedalEngraving && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Лазерная гравировка медали на финише
                      <span className="text-xs text-red-600 font-bold">
                        +{optionsConfig.medalEngravingPrice.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Нанесение вашего официального чистого времени финиша и имени на медаль
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={medalEngraving}
                    onChange={(e) => setMedalEngraving(e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-0 cursor-pointer accent-red-600"
                  />
                </div>
              )}

              {/* Pasta Party ticket option */}
              {optionsConfig.enablePastaParty && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-red-500" />
                      Билет на традиционную Pasta Party
                      <span className="text-xs text-red-600 font-bold">
                        +{optionsConfig.pastaPartyPrice.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Углеводный ужин накануне старта (16 мая) в компании пейсмейкеров и элиты
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={pastaParty}
                    onChange={(e) => setPastaParty(e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-0 cursor-pointer accent-red-600"
                  />
                </div>
              )}

              {/* Charity contribution option */}
              {optionsConfig.enableCharity && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Благотворительный взнос в фонд «Бақытты Бала»
                    </div>
                    <span className="text-xs font-bold text-rose-600">
                      {charityContribution > 0 ? `+${charityContribution.toLocaleString('ru-RU')} ₸` : 'По желанию'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Средства пойдут на закупку спортивной формы для детей из интернатов Актюбинской области
                  </div>
                  <div className="flex gap-2 pt-1">
                    {[0, 1000, 2500, 5000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCharityContribution(val)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          charityContribution === val
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300'
                        }`}
                      >
                        {val === 0 ? 'Без взноса' : `+${val} ₸`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PREVIEW OF DIGITAL BIB */}
          {currentStep === 4 && (
            <div className="space-y-4 text-center">
              <div>
                <h4 className="text-lg font-black font-bebas text-slate-900 tracking-wide">
                  ВАШ СТАРТОВЫЙ НОМЕР СФОРМИРОВАН
                </h4>
                <p className="text-xs text-slate-500">
                  Электронный чип-номер будет привязан к вашей анкете сразу после оплаты
                </p>
              </div>

              {/* Virtual Bib Preview */}
              <div className="flex justify-center py-2">
                <DigitalBib
                  bibNumber={`${Math.round(selectedDistance.distanceKm)}-${Math.floor(100 + Math.random() * 899)}`}
                  runnerName={`${firstName || 'АТЛЕТ'} ${lastName || 'МАРАФОНЕЦ'}`}
                  distanceName={selectedDistance.name}
                  hexColor={selectedDistance.hexColor || '#dc2626'}
                  eventName={event.title}
                  city={event.city}
                  wave={cluster.split('(')[0].trim()}
                />
              </div>

              {/* Summary Cards */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Дистанция забега:</span>
                  <b className="text-slate-900">{selectedDistance.name} ({selectedDistance.tag})</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Возрастная категория:</span>
                  <b className="text-red-600">{matchedCategory.name}</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Стартовый кластер:</span>
                  <b className="text-slate-900">{cluster.split('(')[0]}</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Время старта волны:</span>
                  <b className="text-slate-900">{selectedDistance.startTime} (17 мая 2026)</b>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-900">Оплата регистрационного взноса</h4>
                <div className="text-xl font-black text-red-600 font-athletic">
                  {totalPrice.toLocaleString('ru-RU')} ₸
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Стартовый слот ({selectedDistance.name}):</span>
                  <b>{basePrice.toLocaleString('ru-RU')} ₸</b>
                </div>
                {optionsConfig.enableMedalEngraving && medalEngraving && (
                  <div className="flex justify-between text-slate-700">
                    <span>Гравировка медали:</span>
                    <b>+{engravingPrice.toLocaleString('ru-RU')} ₸</b>
                  </div>
                )}
                {optionsConfig.enablePastaParty && pastaParty && (
                  <div className="flex justify-between text-slate-700">
                    <span>Билет на Pasta Party:</span>
                    <b>+{pastaPrice.toLocaleString('ru-RU')} ₸</b>
                  </div>
                )}
                {optionsConfig.enableCharity && charityContribution > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>Благотворительный взнос:</span>
                    <b>+{charityContribution.toLocaleString('ru-RU')} ₸</b>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>ИТОГО К ОПЛАТЕ:</span>
                  <span className="text-red-600 font-black text-base">{totalPrice.toLocaleString('ru-RU')} ₸</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  Выберите способ оплаты:
                </label>

                {/* Kaspi Pay */}
                <div
                  onClick={() => setPaymentMethod('kaspi')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'kaspi'
                      ? 'border-red-600 bg-red-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f14635] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      Kaspi
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Kaspi Pay / Kaspi QR</div>
                      <div className="text-[11px] text-slate-500">Быстрая оплата в приложении Kaspi.kz без комиссии</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-5 h-5 ${paymentMethod === 'kaspi' ? 'text-red-600' : 'text-slate-300'}`} />
                </div>

                {/* Bank Card (Visa / Mastercard) */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'card'
                      ? 'border-red-600 bg-red-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Банковская карта (Visa / Mastercard)</div>
                      <div className="text-[11px] text-slate-500">Любые казахстанские и международные карты</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-red-600' : 'text-slate-300'}`} />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Платеж защищен 256-битным шифрованием по стандарту PCI DSS
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS CONFIRMATION */}
          {currentStep === 6 && registeredRunner && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-2xl font-black font-bebas text-slate-900 tracking-wide">
                  РЕГИСТРАЦИЯ УСПЕШНО ЗАВЕРШЕНА!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Поздравляем! Ваш слот официально подтвержден. Электронный билет с QR-кодом для получения стартового пакета отправлен на <b>{registeredRunner.email}</b>
                </p>
              </div>

              {/* Final Digital Bib display */}
              <div className="flex justify-center py-2">
                <DigitalBib
                  bibNumber={registeredRunner.bibNumber}
                  runnerName={`${registeredRunner.firstName} ${registeredRunner.lastName}`}
                  distanceName={registeredRunner.distanceName}
                  hexColor={selectedDistance.hexColor || '#dc2626'}
                  eventName={event.title}
                  city={event.city}
                  wave={cluster.split('(')[0].trim()}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Скачать электронный билет
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  Отлично, на главную!
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar (Steps 1 to 5) */}
        {currentStep <= 5 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Назад
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                disabled={currentStep === 2 && isUnderAge}
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Продолжить <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinishPayment}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-red-600/25 cursor-pointer hover:from-red-500 hover:to-rose-500 flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Обработка платежа...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    Оплатить {totalPrice.toLocaleString('ru-RU')} ₸
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
