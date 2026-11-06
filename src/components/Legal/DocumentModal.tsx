import React, { useState } from 'react';
import { X, FileText, Download, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentKey: 'regulation' | 'offer' | 'privacy' | 'medical' | 'transfer' | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documentKey
}) => {
  if (!isOpen || !documentKey) return null;

  const docsData = {
    regulation: {
      title: 'Официальное Положение о проведении международного марафона',
      subtitle: 'AQTOBE INTERNATIONAL MARATHON 2026',
      date: 'Утверждено Оргкомитетом и Управлением физической культуры и спорта',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">1. Цели и задачи соревнования</h4>
            <p>
              Международный марафон «AQTOBE MARATHON 2026» проводится с целью пропаганды здорового образа жизни, популяризации циклических видов спорта в Республике Казахстан, развития спортивного туризма и укрепления международных связей. Трассы марафона (42.195 км) и полумарафона (21.0975 км) сертифицированы AIMS (Ассоциация международных марафонов и пробегов).
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">2. Руководство проведением</h4>
            <p>
              Общее руководство подготовкой и проведением соревнований осуществляет Оргкомитет «AQTOBE MARATHON» совместно с Акиматом Актюбинской области. Судейство осуществляется утвержденной судейской коллегией национальной категории с применением электронной системы хронометража ChronoTrack BibTag.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">3. Время и место проведения</h4>
            <p>
              Соревнование состоится 17 мая 2026 года в г. Актобе. Старт и финиш расположены на Центральной площади (пр. Абилкайыр хана). Старт дистанции 42.195 км — в 07:00. Выдача стартовых пакетов проводится на ЭКСПО 15-16 мая 2026 года.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">4. Участники и возрастные ограничения</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>42.195 км (Марафон)</b> — строго лица от 18 лет и старше (лимит времени 6 часов 00 минут).</li>
              <li><b>21.097 км (Полумарафон)</b> — строго лица от 18 лет и старше (лимит времени 3 часа 00 минут).</li>
              <li><b>10.0 км (Спринт)</b> — лица от 15 лет и старше (лимит времени 1 час 30 минут).</li>
              <li><b>5.0 км (Fun Run)</b> — лица от 12 лет и старше (лимит времени 50 минут).</li>
              <li><b>3.0 км (Kids Run)</b> — дети от 7 до 14 лет в сопровождении родителей.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">5. Награждение и призовой фонд</h4>
            <p>
              Общий призовой фонд составляет 15 000 000 ₸. Победители и призеры в абсолютном первенстве среди мужчин и женщин на дистанциях 42.2 км и 21.1 км награждаются денежными сертификатами, кубками и памятными призами. Победители в возрастных категориях награждаются медалями и дипломами. Все финишеры, уложившиеся в лимит времени, получают памятную литую медаль финишера.
            </p>
          </section>
        </div>
      )
    },
    offer: {
      title: 'Договор публичной оферты на оказание услуг',
      subtitle: 'Участие в спортивно-массовом мероприятии AQTOBE MARATHON',
      date: 'Редакция действует с 01 января 2026 года',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">1. Общие положения</h4>
            <p>
              Настоящий документ является официальным предложением (публичной офертой) Организатора мероприятия «AQTOBE MARATHON» и содержит все существенные условия договора оказания услуг по организации и проведению спортивного мероприятия, предоставлению стартового пакета и судейского хронометража.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">2. Акцепт оферты</h4>
            <p>
              В соответствии со статьей 395 Гражданского Кодекса Республики Казахстан, оплата регистрационного взноса участником является полным и безоговорочным акцептом условий настоящей Оферты. С момента оплаты Участник считается заключившим настоящий Договор.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">3. Обязанности сторон</h4>
            <p>
              Организатор обязуется обеспечить безопасность на перекрытой трассе, работу пунктов питания и гидратации, медицинское сопровождение каретами скорой помощи, выдачу стартового номера с хронометражным чипом и выдачу медали финишера при пересечении финишной черты в пределах лимита времени.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">4. Условия возврата и отмены</h4>
            <p>
              Регистрационный взнос не подлежит возврату в случае неявки участника на старт по личным причинам. Перерегистрация слота на другое лицо возможна в Личном кабинете или по запросу в Оргкомитет не позднее чем за 14 дней до даты старта.
            </p>
          </section>
        </div>
      )
    },
    privacy: {
      title: 'Политика конфиденциальности и обработки персональных данных',
      subtitle: 'Защита данных участников соревнований AQTOBE MARATHON',
      date: 'В соответствии с Законом РК «О персональных данных и их защите»',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">1. Сбор и использование информации</h4>
            <p>
              Оргкомитет собирает персональные данные участников (ФИО, дату рождения, пол, контактный телефон, e-mail, город, экстренный контакт) исключительно в целях регистрации, присвоения стартового номера, определения возрастной категории, фиксации судейских результатов и безопасности на трассе.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">2. Публикация результатов и медиа</h4>
            <p>
              Регистрируясь на забег, Участник дает согласие на публикацию своего имени, фамилии, стартового номера, возрастной категории и спортивного результата в открытых финишных протоколах на сайте и в системе тайминга. Участник также соглашается на бесплатную фото- и видеосъемку во время соревнований и использование материалов в отчетах марафона.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">3. Безопасность платежей</h4>
            <p>
              Оплата банковскими картами и через Kaspi Pay происходит через защищенный шлюз эквайринга с шифрованием TLS/SSL. Оргкомитет не хранит и не обрабатывает реквизиты банковских карт участников.
            </p>
          </section>
        </div>
      )
    },
    medical: {
      title: 'Медицинские требования и допуск к соревнованиям',
      subtitle: 'Безопасность здоровья участников забега',
      date: 'Регламент медицинской комиссии соревнований',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Марафон и полумарафон требуют значительной физической подготовки и выносливости сердечно-сосудистой системы. Пожалуйста, объективно оценивайте готовность вашего организма!
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">1. Обязательные медицинские документы</h4>
            <p>
              Для получения стартового пакета на дистанциях 42.195 км и 21.097 км каждый участник обязан предоставить:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Оригинал удостоверения личности или паспорта;</li>
              <li>Медицинскую справку с заключением спортивного врача или терапевта о допуске к беговым соревнованиям на заявленную дистанцию (справка действительна в течение 6 месяцев с даты выдачи);</li>
              <li>Лично подписанную расписку об ответственности за состояние своего здоровья (заполняется на ЭКСПО при выдаче пакета).</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">2. Медицинское сопровождение на трассе</h4>
            <p>
              Вдоль трассы дежурят 6 бригад скорой медицинской помощи, мобильные парамедики на электрокарах и велосипедах, а также стационарные медпосты каждые 5 км. Врачи имеют право снять участника с дистанции при угрозе жизни и здоровью.
            </p>
          </section>
        </div>
      )
    },
    transfer: {
      title: 'Правила передачи стартового слота и смены дистанции',
      subtitle: 'Регламент перерегистрации участников AQTOBE MARATHON',
      date: 'Утверждено судейской коллегией соревнований',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">1. Передача слота другому участнику</h4>
            <p>
              Передача стартового слота другому лицу допускается не позднее 03 мая 2026 года (за 14 дней до старта). Для перерегистрации необходимо отправить запрос на электронную почту <b>info@aktobe-marathon.kz</b> с указанием данных действующего участника и данных нового участника.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">2. Смена дистанции</h4>
            <p>
              Смена дистанции возможна при наличии свободных слотов на запрашиваемой дистанции:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>При переходе на большую дистанцию участник доплачивает разницу в стоимости слота;</li>
              <li>При переходе на меньшую дистанцию разница в стоимости слота не возвращается;</li>
              <li>Смена дистанции после закрытия онлайн-регистрации (10 мая 2026 г.) не производится.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">3. Запрет бега под чужим номером</h4>
            <p>
              Бег под чужим стартовым номером строго запрещен. В случае выявления факта передачи номера без официальной перерегистрации оба спортсмена дисквалифицируются, а их результаты аннулируются.
            </p>
          </section>
        </div>
      )
    }
  };

  const currentDoc = docsData[documentKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Top Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest block">
                Официальная документация
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-athletic text-slate-900 leading-snug">
                {currentDoc.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {currentDoc.subtitle} • {currentDoc.date}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          {currentDoc.content}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Юридически заверенная версия документа
          </div>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Распечатать / Сохранить
          </button>
        </div>

      </div>
    </div>
  );
};
