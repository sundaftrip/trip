"""Editorial copy for the corporate B2B brochure (ID / EN / RU).
Operating-service descriptions remain shared with the website's profile data.
"""

def tri(id, en, ru):
    return {'id': id, 'en': en, 'ru': ru}

COPY = {
    'profile': tri('Profil Perusahaan', 'Company Profile', 'Профиль компании'),
    'subtitle': tri('Layanan Perjalanan & Operasional B2B', 'B2B Travel & Ground Operations', 'B2B-поездки и наземное обслуживание'),
    'focus': tri('RUSIA / ASIA TENGAH', 'RUSSIA / CENTRAL ASIA', 'РОССИЯ / ЦЕНТРАЛЬНАЯ АЗИЯ'),
    'intro': tri(
        'Sundaf Trip adalah biro perjalanan Indonesia yang dioperasikan oleh CV Sundaf Holiday Group. Kami mendukung agen perjalanan dan mitra dalam perencanaan serta pelaksanaan perjalanan grup, dengan fokus pada Rusia dan Asia Tengah.',
        'Sundaf Trip is an Indonesia-based travel company operated by CV Sundaf Holiday Group. We support travel agencies and partners with the planning and delivery of group journeys, with a focus on Russia and Central Asia.',
        'Sundaf Trip — туристическая компания из Индонезии, работающая под юридическим лицом CV Sundaf Holiday Group. Мы помогаем агентствам и партнёрам планировать и проводить групповые поездки, специализируясь на России и Центральной Азии.'),
    'coverNote': tri('Perencanaan rute. Koordinasi vendor. Pendampingan di destinasi.', 'Route planning. Supplier coordination. Destination support.', 'Планирование маршрутов. Координация поставщиков. Сопровождение на месте.'),
    'edition': tri('Edisi November 2026', 'November 2026 edition', 'Выпуск: ноябрь 2026'),
    'company': tri('Perusahaan & fokus operasional', 'Company & operating focus', 'Компания и специализация'),
    'companyIntro': tri(
        'Layanan kami menghubungkan kebutuhan mitra dengan pelaksanaan di destinasi: menyusun rute, menyesuaikan akomodasi dan transportasi, mengoordinasikan reservasi, serta menyiapkan komunikasi sebelum dan selama perjalanan.',
        'Our services connect partner requirements with delivery at the destination: route planning, accommodation and transport coordination, reservations, and communication before and throughout the journey.',
        'Мы связываем задачи партнёра с исполнением на месте: разрабатываем маршрут, координируем размещение и транспорт, бронирования и коммуникацию до начала и во время поездки.'),
    'identity': tri('Identitas perusahaan', 'Company information', 'Реквизиты компании'),
    'brandLabel': tri('Nama dagang', 'Trading name', 'Торговое наименование'),
    'entityLabel': tri('Badan usaha', 'Legal entity', 'Юридическое лицо'),
    'nibLabel': tri('NIB', 'Business ID (NIB)', 'Бизнес-ID (NIB)'),
    'ahuLabel': tri('Pendaftaran AHU', 'AHU registration', 'Регистрация AHU'),
    'officeLabel': tri('Kantor', 'Office', 'Офис'),
    'visitLabel': tri('Kunjungan', 'Office visits', 'Посещение офиса'),
    'appointment': tri('Dengan janji temu', 'By appointment', 'По предварительной записи'),
    'markets': tri('Destinasi utama', 'Core destinations', 'Основные направления'),
    'russia': tri('Rusia', 'Russia', 'Россия'),
    'centralAsia': tri('Asia Tengah', 'Central Asia', 'Центральная Азия'),
    'russiaRoutes': tri('Moskow, Saint Petersburg, Murmansk dan rute regional.', 'Moscow, Saint Petersburg, Murmansk and regional routes.', 'Москва, Санкт-Петербург, Мурманск и региональные маршруты.'),
    'asiaRoutes': tri('Kazakhstan, Uzbekistan, Kyrgyzstan dan Tajikistan.', 'Kazakhstan, Uzbekistan, Kyrgyzstan and Tajikistan.', 'Казахстан, Узбекистан, Кыргызстан и Таджикистан.'),
    'capabilities': tri('Lingkup layanan', 'Service capabilities', 'Возможности и услуги'),
    'capabilityIntro': tri('Setiap program disusun dari kebutuhan perjalanan mitra. Lingkup akhir dan pembagian tanggung jawab ditetapkan dalam penawaran tertulis.', 'Each program is built around the partner’s travel requirements. The final scope and allocation of responsibilities are defined in the written quotation.', 'Каждая программа составляется под задачи партнёра. Окончательный объём услуг и распределение ответственности фиксируются в письменном предложении.'),
    'area': tri('Area layanan', 'Service area', 'Услуга'),
    'scope': tri('Ruang lingkup koordinasi', 'Coordination scope', 'Объём координации'),
    'output': tri('Rincian dalam penawaran', 'Quotation details', 'Детали предложения'),
    'roles': tri('Koordinasi bersama mitra', 'Working with our partners', 'Взаимодействие с партнёром'),
    'partnerRole': tri('Mitra perjalanan', 'Travel partner', 'Туристический партнёр'),
    'partnerRoleBody': tri('Mengelola relasi klien, menyampaikan brief dan kebutuhan peserta, serta menyetujui program dan ketentuan komersial.', 'Manages the client relationship, provides the brief and participant requirements, and approves the program and commercial terms.', 'Ведёт отношения с клиентом, передаёт запрос и требования участников, согласовывает программу и коммерческие условия.'),
    'sundafRoleBody': tri('Menyusun rencana operasional dan penawaran, mengoordinasikan vendor, serta menyiapkan PIC dan alur komunikasi sesuai lingkup yang disepakati.', 'Prepares the operating plan and quotation, coordinates suppliers, and establishes contacts and communication within the agreed scope.', 'Готовит операционный план и предложение, координирует поставщиков, определяет ответственных и порядок связи в согласованном объёме.'),
    'process': tri('Alur kerja sama', 'How we work', 'Процесс сотрудничества'),
    'processIntro': tri('Dari permintaan awal hingga pelaksanaan, kebutuhan dan keputusan program dikoordinasikan melalui tahapan berikut.', 'From the initial request to delivery, program requirements and decisions are coordinated through the following stages.', 'От первого запроса до исполнения требования и решения по программе координируются на следующих этапах.'),
    'brief': tri('Informasi untuk permintaan penawaran', 'What to include in your request', 'Данные для подготовки предложения'),
    'briefNote': tri('Kirim brief ke info@sundaftrip.com atau hubungi kontak B2B pada halaman terakhir.', 'Send your brief to info@sundaftrip.com or contact the B2B lead on the final page.', 'Отправьте запрос на info@sundaftrip.com или свяжитесь с руководителем B2B на последней странице.'),
    'evidence': tri('Dokumentasi perjalanan', 'Journeys in practice', 'Документация поездок'),
    'evidenceIntro': tri('Pilihan dokumentasi asli dari perjalanan grup bersama tim Sundaf. Foto memperlihatkan peserta, destinasi, dan kegiatan perjalanan.', 'Selected original photographs from group journeys with the Sundaf team, showing participants, destinations and travel activities.', 'Избранные оригинальные фотографии групповых поездок с командой Sundaf: участники, направления и события путешествий.'),
    'contact': tri('Kontak & informasi pembayaran', 'Contact & payment information', 'Контакты и информация об оплате'),
    'contactIntro': tri('Untuk rencana perjalanan grup, kerja sama agen, atau kebutuhan land services, hubungi tim B2B Sundaf Trip.', 'For group travel plans, agency cooperation or ground-service requirements, contact the Sundaf Trip B2B team.', 'По вопросам групповых поездок, сотрудничества с агентствами и наземного обслуживания обращайтесь в B2B-отдел Sundaf Trip.'),
    'b2bContact': tri('Kontak B2B', 'B2B contact', 'Контакт B2B'),
    'founder': tri('Founder / B2B Lead', 'Founder / B2B Lead', 'Основатель / руководитель B2B'),
    'transfer': tri('Transfer perusahaan', 'Company bank transfers', 'Банковские переводы компании'),
    'holder': tri('Atas nama', 'Account holder', 'Владелец счёта'),
    'invoiceNote': tri('Detail rekening dan ketentuan pembayaran tercantum dalam invoice resmi.', 'Bank details and payment terms are provided in the official invoice.', 'Банковские реквизиты и условия оплаты указаны в официальном счёте.'),
    'cards': tri('Pembayaran kartu', 'Card payments', 'Оплата картой'),
    'verify': tri('Informasi perusahaan', 'Company information', 'Информация о компании'),
    'legalLink': tri('Lihat legalitas perusahaan', 'View company registration', 'Регистрационные данные компании'),
    'scan': tri('Hubungi melalui WhatsApp', 'Contact us on WhatsApp', 'Связаться через WhatsApp'),
}

SERVICE_TITLES = [
    tri('Hotel & akomodasi', 'Hotels & accommodation', 'Отели и размещение'),
    tri('Transportasi darat', 'Ground transport', 'Наземный транспорт'),
    tri('Pengaturan makan', 'Meals & dietary needs', 'Питание и особые требования'),
    tri('Atraksi & reservasi', 'Attractions & reservations', 'Достопримечательности и билеты'),
    tri('Tim pendamping', 'On-ground coordination', 'Координация на месте'),
    tri('Perencanaan rute', 'Itinerary planning', 'Планирование маршрута'),
]
SERVICE_OUTPUTS = [
    tri('Kategori kamar, rooming list, tanggal menginap.', 'Room categories, rooming list, stay dates.', 'Категории номеров, rooming list, даты проживания.'),
    tri('Jenis kendaraan, kapasitas, jadwal dan jam layanan.', 'Vehicle type, capacity, schedule and service hours.', 'Тип транспорта, вместимость, график и часы обслуживания.'),
    tri('Pola makan, kebutuhan khusus dan reservasi grup.', 'Meal plan, special requirements and group bookings.', 'План питания, особые требования и групповые бронирования.'),
    tri('Daftar kunjungan, slot waktu dan ketentuan tiket.', 'Visit list, timed entries and ticket conditions.', 'Список посещений, временные слоты и условия билетов.'),
    tri('PIC, bahasa pendamping dan jalur komunikasi.', 'Contacts, guiding language and communication line.', 'Ответственные, язык сопровождения и порядок связи.'),
    tri('Itinerary harian, perpindahan kota dan waktu tempuh.', 'Daily itinerary, intercity transfers and travel time.', 'Программа по дням, переезды и время в пути.'),
]
STAGE_TITLES = [
    tri('Brief perjalanan', 'Travel brief', 'Запрос на поездку'),
    tri('Pemeriksaan rencana', 'Program review', 'Проверка программы'),
    tri('Penawaran & kesepakatan', 'Quotation & agreement', 'Предложение и согласование'),
    tri('Persiapan keberangkatan', 'Pre-departure preparation', 'Подготовка к выезду'),
    tri('Pelaksanaan & evaluasi', 'Delivery & review', 'Исполнение и разбор'),
]
STAGE_BODIES = [
    tri('Mitra menyampaikan rute, tanggal, jumlah peserta, preferensi layanan dan target anggaran.', 'The partner provides the route, dates, passenger count, service preferences and target budget.', 'Партнёр передаёт маршрут, даты, число участников, требования к услугам и бюджет.'),
    tri('Tim meninjau alur perjalanan, musim, waktu tempuh, kebutuhan reservasi dan hal yang perlu dikonfirmasi.', 'The team reviews the route, seasonality, travel time, reservation needs and outstanding confirmations.', 'Команда проверяет маршрут, сезонность, время в пути, бронирования и вопросы для уточнения.'),
    tri('Penawaran merinci layanan, opsi, pengecualian, masa berlaku harga dan ketentuan pembayaran.', 'The quotation sets out services, options, exclusions, price validity and payment terms.', 'Предложение содержит услуги, опции, исключения, срок действия цен и условия оплаты.'),
    tri('Koordinasi vendor, rooming list, kebutuhan peserta dan kontak operasional disiapkan sesuai program.', 'Suppliers, rooming lists, participant needs and operating contacts are coordinated for the program.', 'Координируются поставщики, rooming list, требования участников и операционные контакты.'),
    tri('Komunikasi selama perjalanan dan tindak lanjut dikelola sesuai pembagian tanggung jawab yang disepakati.', 'Trip communication and follow-up are managed according to the agreed responsibilities.', 'Связь во время поездки и последующие действия ведутся согласно согласованным обязанностям.'),
]
BRIEF_ITEMS = [
    tri('Destinasi dan rute yang diinginkan', 'Destinations and preferred route', 'Направления и желаемый маршрут'),
    tri('Tanggal, durasi dan jumlah peserta', 'Dates, duration and passenger count', 'Даты, продолжительность и число участников'),
    tri('Kategori hotel dan pembagian kamar', 'Hotel category and room allocation', 'Категория отелей и распределение номеров'),
    tri('Pola makan dan kebutuhan khusus', 'Meal plan and special requirements', 'План питания и особые требования'),
    tri('Target anggaran dan layanan tambahan', 'Target budget and additional services', 'Бюджет и дополнительные услуги'),
    tri('Batas waktu penawaran dan PIC mitra', 'Quotation deadline and partner contact', 'Срок предложения и контакт партнёра'),
]
PHOTOS = [
    ('trip-photos/trip-1.jpg', tri('Perjalanan grup / Moskow, Rusia', 'Group journey / Moscow, Russia', 'Групповая поездка / Москва, Россия')),
    ('trip-photos/trip-4.jpg', tri('Perjalanan grup / Danau Kaindy, Kazakhstan', 'Group journey / Kaindy Lake, Kazakhstan', 'Групповая поездка / озеро Каинды, Казахстан')),
    ('b2b-gallery/b2b-01.webp', tri('Dokumentasi grup / Aurora', 'Group documentation / Aurora', 'Документация группы / Северное сияние')),
    ('b2b-gallery/b2b-06.webp', tri('Dokumentasi grup / Bandara Sheremetyevo', 'Group documentation / Sheremetyevo Airport', 'Документация группы / аэропорт Шереметьево')),
    ('trip-photos/trip-5.jpg', tri('Pengalaman perjalanan / Aurora', 'Travel experience / Aurora', 'Впечатления от поездки / Северное сияние')),
    ('b2b-gallery/b2b-18.webp', tri('Dokumentasi peserta / Aurora', 'Participant documentation / Aurora', 'Документация участников / Северное сияние')),
]
