// all app logic lives in this one file

// zoom level shared across pages
const zoomStorageKey = 'jomjalanZoomFactor';
let electronWebFrame = null;
let electronIpcRenderer = null;

try {
  if (typeof require !== 'undefined') {
    const electron = require('electron');
    if (electron && electron.webFrame) electronWebFrame = electron.webFrame;
    if (electron && electron.ipcRenderer) electronIpcRenderer = electron.ipcRenderer;
  }
} catch {
  electronWebFrame = null;
  electronIpcRenderer = null;
}

function getStoredZoom() {
  const saved = parseFloat(localStorage.getItem(zoomStorageKey));
  return !isNaN(saved) && saved >= 0.5 && saved <= 2.0 ? saved : 1.0;
}

function updateZoomDisplay(factor) {
  const display = document.getElementById('zoomLevelDisplay');
  if (display) {
    display.textContent = `${Math.round(factor * 100)}%`;
  }
}

function applyZoom(factor, save = true) {
  const clamped = Math.min(Math.max(Number(factor.toFixed(2)), 0.5), 2.0);
  
  if (electronWebFrame) {
    electronWebFrame.setZoomFactor(clamped);
  } else {
    document.body.style.zoom = clamped;
  }

  if (electronIpcRenderer) {
    electronIpcRenderer.send('set-zoom-factor', clamped);
  }

  if (save) {
    localStorage.setItem(zoomStorageKey, clamped.toString());
  }

  updateZoomDisplay(clamped);
}

function adjustZoom(delta) {
  const current = getStoredZoom();
  applyZoom(current + delta);
}

function resetZoom() {
  applyZoom(1.0);
}

// sync zoom if the main process changed it
if (electronIpcRenderer) {
  electronIpcRenderer.on('zoom-factor-updated', (event, factor) => {
    localStorage.setItem(zoomStorageKey, factor.toString());
    updateZoomDisplay(factor);
  });
}

// keyboard shortcuts: ctrl/cmd + / - / 0
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      adjustZoom(0.1);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      adjustZoom(-0.1);
    } else if (e.key === '0') {
      e.preventDefault();
      resetZoom();
    }
  }
});

// apply saved zoom on page load
applyZoom(getStoredZoom(), false);

const countries = {
  KR: {
    name: 'South Korea',
    images: [
      'https://images.unsplash.com/photo-1768006378015-2cb810dbeb90?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1579282276647-5ba2566d5914?auto=format&fit=crop&w=700&q=80',
    ],
    places: {
      Seoul: { latitude: 37.5665, longitude: 126.9780 },
      Busan: { latitude: 35.1796, longitude: 129.0756 },
      Jeju: { latitude: 33.4996, longitude: 126.5312 },
    },
    packages: [
      {
        title: 'Seoul Heritage Package',
        place: 'Gyeongbokgung Palace',
        basePrice: 1200,
        days: 4,
        nights: 3,
        itinerary: [
          { day: 1, title: 'Arrival & City Walk', outdoor: 'Walk across Gwanghwamun Square & stroll along Cheonggyecheon Stream.', indoor: 'Explore Dongdaemun Design Plaza (DDP) architecture and indoor night food market.' },
          { day: 2, title: 'Royal Heritage & Culture', outdoor: 'Explore Gyeongbokgung Palace in traditional Hanbok & walk Bukchon Hanok Village.', indoor: 'Visit the National Museum of Korea & Insadong traditional craft workshops.' },
          { day: 3, title: 'Mountain Views & Modern Seoul', outdoor: 'Hike scenic trails at Namsan Park & admire sunset from N Seoul Tower.', indoor: 'Visit COEX Aquarium and read at the iconic Starfield Library.' },
          { day: 4, title: 'Riverside & Departure', outdoor: 'Cycle along Yeouido Hangang River Park & enjoy street food in Hongdae.', indoor: 'Visit Lotte World Tower Seoul Sky indoor observatory and duty-free mall.' }
        ]
      },
      {
        title: 'Busan Coast Package',
        place: 'Haeundae Beach',
        basePrice: 1350,
        days: 3,
        nights: 2,
        itinerary: [
          { day: 1, title: 'Coastal Arrival', outdoor: 'Walk along Haeundae Beach shoreline & Dongbaekseom coastal boardwalk.', indoor: 'Explore SEA LIFE Busan Aquarium & enjoy seafood at Haeundae covered market.' },
          { day: 2, title: 'Cliff Trails & Village Art', outdoor: 'Explore vibrant Gamcheon Culture Village & ride the Songdo Marine Cable Car.', indoor: 'Visit Busan Museum of Art and relax in luxurious Spa Land Centum City.' },
          { day: 3, title: 'Seaside Temples & Markets', outdoor: 'Catch morning ocean breeze at Haedong Yonggungsa Temple & walk Jagalchi Fish Market.', indoor: 'Tour the National Maritime Museum & Lotte Department Store indoor sky garden.' }
        ]
      },
      {
        title: 'Jeju Nature Package',
        place: 'Seongsan Ilchulbong',
        basePrice: 1500,
        days: 4,
        nights: 3,
        itinerary: [
          { day: 1, title: 'Island Welcome', outdoor: 'Visit Yongduam Dragon Head Rock & walk seaside volcanic coastal paths.', indoor: 'Explore Arte Museum immersive digital media art installations.' },
          { day: 2, title: 'Volcanic Sunrise Crater', outdoor: 'Hike the UNESCO volcanic crater ridge at Seongsan Ilchulbong peak.', indoor: 'Visit Jeju Aqua Planet & learn haenyeo female diver heritage.' },
          { day: 3, title: 'Waterfalls & Alpine Slopes', outdoor: 'Trek Hallasan Eoseoungsaengak trail & see Cheonjiyeon Waterfall.', indoor: 'Tour the famous Osulloc Tea Museum & Innisfree Jeju House workshops.' },
          { day: 4, title: 'Turquoise Waters & Departure', outdoor: 'Relax along Hyeopjae Beach turquoise waters & Hallim Park gardens.', indoor: 'Explore Jeju Folk & Natural History Museum & Dongmun covered market.' }
        ]
      },
    ],
  },
  JP: {
    name: 'Japan',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=700&q=80',
    ],
    places: {
      Tokyo: { latitude: 35.6762, longitude: 139.6503 },
      Kyoto: { latitude: 35.0116, longitude: 135.7681 },
      Osaka: { latitude: 34.6937, longitude: 135.5023 },
    },
    packages: [
      {
        title: 'Tokyo City Package',
        place: 'Tokyo Tower and Shibuya',
        basePrice: 1600,
        days: 5,
        nights: 4,
        itinerary: [
          { day: 1, title: 'Iconic Tokyo Arrival', outdoor: 'Cross world-famous Shibuya Crossing & visit Hachiko statue.', indoor: 'Admire Tokyo skyline from Shibuya Sky indoor observation deck.' },
          { day: 2, title: 'Old Tokyo & Historic Temples', outdoor: 'Walk through historic Senso-ji Temple & Nakamise shopping street in Asakusa.', indoor: 'Tour Tokyo National Museum in Ueno Park and samurai artifact galleries.' },
          { day: 3, title: 'Forest Shrines & Digital Art', outdoor: 'Walk through tranquil Meiji Shrine forest & Harajuku fashion lanes.', indoor: 'Experience immersive light and digital art at teamLab Planets TOKYO.' },
          { day: 4, title: 'Tower Landmarks & Shopping', outdoor: 'Visit Tokyo Tower outdoor gardens & promenade through upscale Ginza.', indoor: 'Tour Miraikan National Science Museum & explore indoor Odaiba complexes.' },
          { day: 5, title: 'Gardens & Farewell', outdoor: 'Stroll through the Imperial Palace East Gardens and Marunouchi.', indoor: 'Browse Tokyo Station Character Street and subterranean gourmet food halls.' }
        ]
      },
      {
        title: 'Kyoto Culture Package',
        place: 'Fushimi Inari Shrine',
        basePrice: 1750,
        days: 4,
        nights: 3,
        itinerary: [
          { day: 1, title: 'Geisha District & Canals', outdoor: 'Stroll through historic Gion geisha quarter & along Shirakawa canal.', indoor: 'Attend an authentic traditional Japanese matcha tea ceremony.' },
          { day: 2, title: 'Red Torii Gates & Textiles', outdoor: 'Hike the thousand vermilion torii gates winding up Mount Inari.', indoor: 'Explore Kyoto Railway Museum & traditional Nishijin silk textile center.' },
          { day: 3, title: 'Bamboo Groves & Zen', outdoor: 'Walk through towering Arashiyama Bamboo Grove & cross Togetsukyo Bridge.', indoor: 'Visit Kyoto International Manga Museum & Kyoto Handicraft Center.' },
          { day: 4, title: 'Golden Pavilion & Departure', outdoor: 'Admire the shimmering Golden Pavilion at Kinkaku-ji and Zen rock gardens.', indoor: 'Shop for traditional Kyoto Kiyomizu ceramics and confectionery.' }
        ]
      },
      {
        title: 'Osaka Food Package',
        place: 'Dotonbori',
        basePrice: 1550,
        days: 3,
        nights: 2,
        itinerary: [
          { day: 1, title: 'Neon Canals & Street Eats', outdoor: 'Evening neon walking tour along Dotonbori canal with the Glico Man.', indoor: 'Sample takoyaki and wagyu under covered Kuromon Ichiba Market.' },
          { day: 2, title: 'Historic Castle & Aquarium', outdoor: 'Walk through Osaka Castle Park gardens and take a scenic moat boat tour.', indoor: 'Visit world-class Osaka Aquarium Kaiyukan and Tempozan indoor marketplace.' },
          { day: 3, title: 'Retro Districts & Departure', outdoor: 'Stroll through nostalgic retro Shinsekai district and Tsutenkaku Tower.', indoor: 'Explore Umeda Sky Building floating garden observatory & shopping plazas.' }
        ]
      },
    ],
  },
  CH: {
    name: 'Switzerland',
    images: [
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?auto=format&fit=crop&w=700&q=80',
    ],
    places: {
      Zurich: { latitude: 47.3769, longitude: 8.5417 },
      Interlaken: { latitude: 46.6863, longitude: 7.8632 },
      Lucerne: { latitude: 47.0502, longitude: 8.3093 },
    },
    packages: [
      {
        title: 'Zurich City Package',
        place: 'Zurich Old Town',
        basePrice: 3200,
        days: 4,
        nights: 3,
        itinerary: [
          { day: 1, title: 'Lakeside Welcome', outdoor: 'Promenade along Lake Zurich shoreline & view Alpine peaks across the water.', indoor: 'Tour the Swiss National Museum (Landesmuseum) in a historic castle setting.' },
          { day: 2, title: 'Historic Altstadt', outdoor: 'Walking tour through cobblestone Zurich Old Town & scenic Lindenhof hilltop.', indoor: 'Admire European masterworks and Swiss art at Kunsthaus Zurich gallery.' },
          { day: 3, title: 'Mountain Panoramas & Chocolate', outdoor: 'Take the scenic train up Uetliberg mountain ridge for panoramic hiking.', indoor: 'Tour the interactive Lindt Home of Chocolate museum with unlimited tastings.' },
          { day: 4, title: 'Cruise & Shopping', outdoor: 'Board a classic cruise on Lake Zurich & explore lakeside parks.', indoor: 'Visit the FIFA World Football Museum and covered Niederdorf shopping arcade.' }
        ]
      },
      {
        title: 'Interlaken Mountain Package',
        place: 'Jungfraujoch',
        basePrice: 3800,
        days: 5,
        nights: 4,
        itinerary: [
          { day: 1, title: 'Alpine Gateway Arrival', outdoor: 'Walk through scenic Interlaken nestled between Lake Thun and Lake Brienz.', indoor: 'Visit traditional Swiss woodcarving ateliers & Swiss watchmaking boutiques.' },
          { day: 2, title: 'Top of Europe (Jungfraujoch)', outdoor: 'Ride the iconic cogwheel railway to Jungfraujoch high-alpine mountain pass.', indoor: 'Explore the carved Jungfraujoch Ice Palace & indoor Sphinx Observatory.' },
          { day: 3, title: 'Valley of 72 Waterfalls', outdoor: 'Hike through picturesque Lauterbrunnen valley & view Staubbach Falls.', indoor: 'Discover subterranean Trummelbach Falls churning inside mountain rock caves.' },
          { day: 4, title: 'Cliff Walk & Alpine Lakes', outdoor: 'Ride the gondola to Grindelwald First & brave the First Cliff Walk.', indoor: 'Relax at an alpine thermal spa & savor traditional Swiss cheese fondue.' },
          { day: 5, title: 'Lake Brienz & Departure', outdoor: 'Cruise the turquoise waters of Lake Brienz on a historic paddle steamer.', indoor: 'Visit Ballenberg Swiss Open-Air heritage indoor craft workshops.' }
        ]
      },
      {
        title: 'Lucerne Lake Package',
        place: 'Chapel Bridge',
        basePrice: 3400,
        days: 3,
        nights: 2,
        itinerary: [
          { day: 1, title: 'Lakeside Medieval Wonders', outdoor: 'Walk across the 14th-century wooden Chapel Bridge and Water Tower.', indoor: 'Explore the Swiss Museum of Transport, Switzerland’s most visited museum.' },
          { day: 2, title: 'Dragon Mountain (Mount Pilatus)', outdoor: 'Ride the world’s steepest cogwheel railway up Mount Pilatus for summit hikes.', indoor: 'Visit the Lucerne Glacier Garden indoor mirror maze & historic Bourbaki Panorama.' },
          { day: 3, title: 'Historic Ramparts & Fine Art', outdoor: 'Walk along historic Musegg Wall watchtowers & photograph the Lion Monument.', indoor: 'Tour the Rosengart Collection featuring classic Picasso masterworks.' }
        ]
      },
    ],
  },
};

const flagMap = { KR: '🇰🇷 South Korea', JP: '🇯🇵 Japan', CH: '🇨🇭 Switzerland' };
const storageKey = 'jomjalanPlans';
const currentSearchKey = 'jomjalanCurrentSearch';

let currentDestination = null;
let currentSuggestion = null;
let currentBudget = null;
let currentSelectedPackage = null;

// add-on expense options
const budgetOptionsData = {
  transport: [
    { id: 't_none', label: 'None / Self-Arranged', desc: 'Arrange own flight or transport tickets', cost: 0, icon: '🚶' },
    { id: 't_flight_eco', label: 'Economy Flight (Return)', desc: 'Standard return economy class flight ticket', cost: 850, icon: '✈️' },
    { id: 't_flight_biz', label: 'Business Class Flight', desc: 'Premium return business class flight', cost: 2200, icon: '💺' },
  ],
  hotel: [
    { id: 'h_included', label: 'Standard Package Stay', desc: 'Included in package base price', cost: 0, icon: '🛏️' },
    { id: 'h_mid', label: '3-Star Hotel Upgrade', desc: 'Comfortable hotel room (+MYR 160/night)', cost: 160, icon: '🏨' },
    { id: 'h_luxury', label: '5-Star Luxury Resort', desc: 'Luxury resort & amenities (+MYR 450/night)', cost: 450, icon: '🌟' },
  ],
  food: [
    { id: 'f_basic', label: 'Street Food & Budget Dining', desc: 'Local eateries and casual food', cost: 40, icon: '🍜' },
    { id: 'f_cafe', label: 'Cafes & Casual Dining', desc: 'Standard daily meals & cafes', cost: 90, icon: '🍱' },
    { id: 'f_fine', label: 'Fine Dining & Luxury Buffets', desc: 'Premium culinary experiences', cost: 220, icon: '🍷' },
  ],
  activities: [
    { id: 'a_none', label: 'Package Activities Only', desc: 'Included baseline itinerary only', cost: 0, icon: '📸' },
    { id: 'a_standard', label: 'Attraction & Museum Passes', desc: 'Entry tickets for major landmarks', cost: 150, icon: '🎟️' },
    { id: 'a_premium', label: 'Adventure & VIP Excursions', desc: 'Private tours & adventure sports', cost: 350, icon: '🧗' },
  ],
};

// remember what the user picked
const activeSelections = {
  transport: 't_flight_eco',
  hotel: 'h_included',
  food: 'f_cafe',
  activities: 'a_none',
};

function renderBudgetCategoryOptions(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = budgetOptionsData[category];
  const activeId = activeSelections[category];

  container.innerHTML = items.map(item => {
    const isSelected = item.id === activeId;
    const priceText = item.cost > 0 ? `+MYR ${item.cost}` : 'Included';
    const badgeClass = item.cost > 0 ? 'badge-extra' : 'badge-included';
    return `
      <div class="option-card ${isSelected ? 'active' : ''}" onclick="selectBudgetOption('${category}', '${item.id}')">
        <div class="option-card-top">
          <span class="option-icon">${item.icon}</span>
          <span class="option-price ${badgeClass}">${priceText}</span>
        </div>
        <div class="option-card-title">${item.label}</div>
        <div class="option-card-desc">${item.desc}</div>
        ${isSelected ? '<span class="option-selected-tag">✓ Active</span>' : ''}
      </div>
    `;
  }).join('');
}

function selectBudgetOption(category, optionId) {
  activeSelections[category] = optionId;
  const containerMap = {
    transport: 'transportOptions',
    hotel: 'hotelOptions',
    food: 'foodOptions',
    activities: 'activitiesOptions',
  };

  renderBudgetCategoryOptions(category, containerMap[category]);
  // recalculate if the dates are already valid
  const arrival = document.getElementById('arrival');
  const departure = document.getElementById('departure');
  if (arrival && departure && arrival.value && departure.value) {
    calculateBudget();
  }
}

function initBudgetOptionCards() {
  renderBudgetCategoryOptions('transport', 'transportOptions');
  renderBudgetCategoryOptions('hotel', 'hotelOptions');
  renderBudgetCategoryOptions('food', 'foodOptions');
  renderBudgetCategoryOptions('activities', 'activitiesOptions');
}

// keep the last searched destination between pages
try {
  const savedSearch = JSON.parse(localStorage.getItem(currentSearchKey));
  if (savedSearch) {
    currentDestination = savedSearch.destination;
    currentSuggestion = savedSearch.suggestion;
    currentSelectedPackage = savedSearch.selectedPackage || null;
  }
} catch {
  currentDestination = null;
  currentSuggestion = null;
}

function updatePlaces() {
  const countrySelect = document.getElementById('country');
  const placeSelect = document.getElementById('place');
  if (!countrySelect || !placeSelect) return;
  const places = Object.keys(countries[countrySelect.value].places);
  placeSelect.innerHTML = places.map(place => `<option value="${place}">${place}</option>`).join('');
}

function calculateEndDate(startDateStr, days) {
  if (!startDateStr || !days) return '';
  const parts = startDateStr.split('-');
  if (parts.length !== 3) return '';
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setDate(d.getDate() + (days - 1));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateAutoReturnDate() {
  const startEl = document.getElementById('weatherStart');
  const countryEl = document.getElementById('country');
  if (!startEl || !startEl.value || !countryEl) return;

  const code = countryEl.value;
  let pkgDays = 4;
  if (currentSelectedPackage && currentSelectedPackage.days) {
    pkgDays = currentSelectedPackage.days;
  } else if (countries[code] && countries[code].packages[0]) {
    pkgDays = countries[code].packages[0].days;
  }

  const newEndDate = calculateEndDate(startEl.value, pkgDays);
  if (currentDestination) {
    currentDestination.startDate = startEl.value;
    currentDestination.endDate = newEndDate;
    renderLocationInfo();
    if (currentSelectedPackage) {
      renderSelectedPackageBox(currentSelectedPackage);
    }
  }
}

function weatherText(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Cloudy';
  if (code >= 51 && code <= 82) return 'Rainy';
  if (code >= 95) return 'Thunderstorm';
  return 'Fair / Variable';
}

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code >= 51 && code <= 82) return '🌧️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

function formatDayName(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function renderPackagePicker() {
  const packageInfo = document.getElementById('packageInfo');
  if (!packageInfo || !currentDestination) return;

  const selected = countries[currentDestination.code];
  packageInfo.innerHTML = selected.packages.map((item, index) => {
    const activeClass = currentSelectedPackage && currentSelectedPackage.index === index ? ' selected-package' : '';
    return `
      <button class="package-option${activeClass}" type="button" onclick="selectPackage(${index})">
        <img src="${selected.images[index]}" alt="${item.place}">
        <span class="package-option-copy">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong>${item.title}</strong>
            <span class="selected-pkg-badge-inline" style="font-size: 9.5px; padding: 2px 6px;">${item.days}D / ${item.nights}N</span>
          </div>
          <small>📍 ${item.place} • 💵 <strong>MYR ${item.basePrice.toLocaleString()}</strong> / pax</small>
        </span>
      </button>
    `;
  }).join('');
}

function renderLocationInfo() {
  const travelInfoEl = document.getElementById('travelInfo');
  if (!travelInfoEl || !currentDestination) return;

  const totalDays = currentSelectedPackage ? currentSelectedPackage.days : (currentDestination.days || 4);
  const totalNights = currentSelectedPackage ? currentSelectedPackage.nights : (currentDestination.nights || 3);
  const countryWithFlag = flagMap[currentDestination.code] || currentDestination.country;
  const pkgTitle = currentSelectedPackage ? currentSelectedPackage.title : 'None Selected (Pick in Box 1)';

  travelInfoEl.innerHTML = `
    <div class="location-details-card">
      <div class="location-header-row">
        <div>
          <h4 class="location-city">${currentDestination.city}</h4>
          <span class="location-country">${countryWithFlag}</span>
        </div>
        <span class="location-days-badge">${totalDays}D, ${totalNights}N</span>
      </div>
      
      <div class="location-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Departure Date:</span>
          <span class="meta-value">${currentDestination.startDate}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Return Date (Auto):</span>
          <span class="meta-value highlight-value">${currentDestination.endDate}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">GPS Coordinates:</span>
          <span class="meta-value">${currentDestination.latitude.toFixed(4)}° N, ${currentDestination.longitude.toFixed(4)}° E</span>
        </div>
        <div class="meta-item meta-item-full">
          <span class="meta-label">Chosen Package:</span>
          <span class="meta-value highlight-value">${pkgTitle}</span>
        </div>
      </div>
    </div>
  `;
}

function renderProceedCta(packageInfo) {
  const container = document.getElementById('proceedBudgetCtaContainer');
  if (!container) return;

  if (packageInfo) {
    const pkgDays = packageInfo.days || (currentDestination ? currentDestination.days : 4);
    const pkgNights = packageInfo.nights || (currentDestination ? currentDestination.nights : 3);
    const city = currentDestination ? currentDestination.city : packageInfo.place;
    const basePrice = packageInfo.basePrice ? `MYR ${packageInfo.basePrice.toLocaleString()}` : '';

    container.innerHTML = `
      <div class="bento-cta-card">
        <div class="bento-cta-text">
          <span class="bento-cta-badge">✓ Package Selected: ${packageInfo.title}</span>
          <h3 id="proceedCtaTitle">Ready to Calculate Your Trip Budget?</h3>
          <p id="proceedCtaDesc">Your package for <strong>${city}</strong> (${pkgDays} Days, ${pkgNights} Nights • Base ${basePrice}) is locked in. Let's customize flights, accommodation, and daily expenses.</p>
        </div>
        <a href="calculator.html" id="proceedBudgetBtn" class="btn btn-primary btn-proceed-main">
          Proceed to Budget Calculator ➔
        </a>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="bento-cta-card bento-cta-idle">
        <div class="bento-cta-text">
          <span class="bento-cta-badge">Next Step</span>
          <h3 id="proceedCtaTitle">Ready to Calculate Your Trip Budget?</h3>
          <p id="proceedCtaDesc">Carry your selected destination, duration, and package straight to the budget calculator.</p>
        </div>
        <a href="calculator.html" id="proceedBudgetBtn" class="btn btn-primary btn-proceed-main">
          Proceed to Budget Calculator ➔
        </a>
      </div>
    `;
  }
}

function renderSelectedPackageBox(packageInfo) {
  const selectedPkgEl = document.getElementById('selectedPackageInfo');
  if (!selectedPkgEl) return;

  const startEl = document.getElementById('weatherStart');
  const startDate = (currentDestination && currentDestination.startDate) || (startEl ? startEl.value : '');
  const endDate = (currentDestination && currentDestination.endDate) || calculateEndDate(startDate, packageInfo.days);

  selectedPkgEl.innerHTML = `
    <div class="selected-pkg-card">
      <div class="selected-pkg-body">
        <div class="selected-pkg-header-row">
          <div>
            <h4 class="selected-pkg-title" style="display: inline-block; margin-right: 8px;">${packageInfo.title}</h4><span class="selected-pkg-badge-inline">⏱️ ${packageInfo.days}D, ${packageInfo.nights}N</span>
          </div>
        </div>

        <div class="selected-pkg-place" style="margin-bottom: 10px;">📍 <strong>Primary Place:</strong> ${packageInfo.place}</div>
        <div style="background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 5px; padding: 12px 10px 8px; margin-bottom: 8px; font-size: 11.5px; display: flex; justify-content: space-between; align-items: center;">
          <span>🛫 <strong>Departure:</strong> ${startDate || '-'}</span>
          <span>🛬 <strong>Return Date (Auto):</strong> <strong style="color: #db2777; font-size: 12px;">${endDate || '-'}</strong></span>
        </div>

      </div>
    </div>
  `;

  renderProceedCta(packageInfo);
}

function renderDayByDayItinerary(packageInfo, dailyWeather) {
  const suggestionEl = document.getElementById('suggestionInfo');
  if (!suggestionEl || !packageInfo || !packageInfo.itinerary) return;

  const dailyPlans = packageInfo.itinerary.map((dayItem, idx) => {
    const dayDate = dailyWeather.time[idx] || '';
    const code = dailyWeather.weather_code[idx] !== undefined ? dailyWeather.weather_code[idx] : 0;
    const maxTemp = dailyWeather.temperature_2m_max[idx] !== undefined ? dailyWeather.temperature_2m_max[idx] : 20;
    const minTemp = dailyWeather.temperature_2m_min[idx] !== undefined ? dailyWeather.temperature_2m_min[idx] : 15;

    const isRainy = code >= 51;
    const isHot = maxTemp >= 32;
    const useIndoor = isRainy || isHot;

    const activePlan = useIndoor ? dayItem.indoor : dayItem.outdoor;
    const altPlan = useIndoor ? dayItem.outdoor : dayItem.indoor;
    const altLabel = useIndoor ? 'Outdoor Version' : 'Indoor Version';

    return {
      day: dayItem.day,
      title: dayItem.title,
      date: dayDate,
      weatherText: weatherText(code),
      weatherIcon: weatherIcon(code),
      activePlan,
      altPlan,
      altLabel,
      useIndoor,
    };
  });

  currentSuggestion = dailyPlans.map(p => `Day ${p.day}: [${p.useIndoor ? 'Indoor' : 'Outdoor'}] ${p.activePlan}`).join(' | ');

  suggestionEl.innerHTML = `
    <div class="itinerary-wrapper">
      <div class="itinerary-header-row">
        <div>
          <strong style="font-size: 14px; color: #831843;">${packageInfo.title} — Itinerary</strong>
          <span style="font-size: 12px; color: #64748b; margin-left: 8px;">(${packageInfo.days}D, ${packageInfo.nights}N)</span>
        </div>
        
      </div>

      <div class="itinerary-timeline-grid">
        ${dailyPlans.map(p => `
          <div class="itinerary-card ${p.useIndoor ? 'itinerary-card-indoor' : 'itinerary-card-outdoor'}">
            <div class="itin-card-header">
              <div class="itin-day-col">
                <span class="itin-day-num">Day ${p.day} ${formatDayName(p.date)} - ${p.weatherIcon} ${p.weatherText}</span>
              </div>
            </div>

            <div class="itin-card-title">${p.title}</div>

            <div class="itin-active-plan">
              ${p.activePlan}
            </div>

            <details class="itin-alt-details">
              <summary>View Alternative (${p.altLabel})</summary>
              <div class="itin-alt-box">
                <span class="itin-icon">${p.useIndoor ? '🏞️' : '🏛️'}</span>
                <div><strong>Alternative Plan:</strong> ${p.altPlan}</div>
              </div>
            </details>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function fetchAndRenderForecast(destination, packageInfo) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${destination.latitude}&longitude=${destination.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${destination.startDate}&end_date=${destination.endDate}`;
  const weatherData = await fetch(weatherUrl).then(response => response.json());
  if (!weatherData.daily) throw new Error('Forecast dates are not available.');
  const dailyWeather = weatherData.daily;

  document.getElementById('weatherInfo').innerHTML = `
    <div class="weather-forecast-grid">
      ${dailyWeather.time.map((date, index) => {
        const code = dailyWeather.weather_code[index];
        const minTemp = dailyWeather.temperature_2m_min[index];
        const maxTemp = dailyWeather.temperature_2m_max[index];
        const rain = dailyWeather.precipitation_sum[index];
        const isRainy = code >= 51;
        const cardClass = isRainy ? 'weather-card-rainy' : 'weather-card-fair';

        return `
          <div class="weather-day-card ${cardClass}">
            <div class="weather-card-date">${formatDayName(date)} (Day ${index + 1})</div>
            <div class="weather-card-icon">${weatherIcon(code)}</div>
            <div class="weather-card-desc">${weatherText(code)}</div>
            <div class="weather-card-temp">
              <span class="temp-high" title="Max Temp">${maxTemp}°C</span>
              <span class="temp-divider">/</span>
              <span class="temp-low" title="Min Temp">${minTemp}°C</span>
            </div>
            <div class="weather-card-rain">
              <span class="rain-icon">💧</span> ${rain} mm
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  renderDayByDayItinerary(packageInfo, dailyWeather);
}

async function selectPackage(index) {
  const code = currentDestination ? currentDestination.code : document.getElementById('country').value;
  const selected = countries[code];
  const packageInfo = selected.packages[index];
  currentSelectedPackage = { ...packageInfo, index, code };

  const startEl = document.getElementById('weatherStart');
  if (startEl && startEl.value) {
    const newEndDate = calculateEndDate(startEl.value, packageInfo.days);
    if (currentDestination) {
      currentDestination.startDate = startEl.value;
      currentDestination.endDate = newEndDate;
      currentDestination.days = packageInfo.days;
      currentDestination.nights = packageInfo.nights;
    }
  }

  renderSelectedPackageBox(packageInfo);
  renderLocationInfo();

  if (currentDestination && currentDestination.latitude) {
    try {
      await fetchAndRenderForecast(currentDestination, packageInfo);
    } catch (e) {
      console.warn('Weather refresh error:', e);
    }
  }

  if (currentDestination) {
    localStorage.setItem(currentSearchKey, JSON.stringify({
      destination: currentDestination,
      suggestion: currentSuggestion,
      selectedPackage: currentSelectedPackage,
    }));
  }

  renderPackagePicker();
}

async function searchDestination() {
  const code = document.getElementById('country').value;
  const selected = countries[code];
  const placeName = document.getElementById('place').value;
  const place = selected.places[placeName];
  const startDate = document.getElementById('weatherStart').value;
  const today = new Date().toISOString().slice(0, 10);

  if (!startDate || startDate < today) {
    document.getElementById('searchMessage').textContent = 'Please choose a valid future departure date.';
    return;
  }

  if (!currentSelectedPackage || currentSelectedPackage.code !== code) {
    currentSelectedPackage = { ...selected.packages[0], index: 0, code };
  }

  const endDate = calculateEndDate(startDate, currentSelectedPackage.days);

  document.getElementById('searchMessage').textContent = 'Loading live destination & forecast data...';
  currentDestination = {
    city: placeName,
    country: selected.name,
    code,
    latitude: place.latitude,
    longitude: place.longitude,
    startDate,
    endDate,
    days: currentSelectedPackage.days,
    nights: currentSelectedPackage.nights,
  };

  document.querySelector('.bento-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    renderLocationInfo();
    renderSelectedPackageBox(currentSelectedPackage);
    await fetchAndRenderForecast(currentDestination, currentSelectedPackage);
    renderPackagePicker();
    localStorage.setItem(currentSearchKey, JSON.stringify({
      destination: currentDestination,
      suggestion: currentSuggestion,
      selectedPackage: currentSelectedPackage,
    }));
    document.getElementById('searchMessage').textContent = 'Search complete. Itinerary tailored to live weather!';
  } catch {
    document.getElementById('travelInfo').textContent = 'Unable to load travel information.';
    document.getElementById('weatherInfo').textContent = 'Unable to load weather information.';
    document.getElementById('suggestionInfo').textContent = 'No suggestion is available.';
    document.getElementById('searchMessage').textContent = 'Failed to load weather data. Please check connection.';
  }
}

function getCategoryCost(category) {
  const activeId = activeSelections[category];
  const item = budgetOptionsData[category].find(opt => opt.id === activeId);
  return item ? (item.cost || 0) : 0;
}

function calculateBudget() {
  const arrivalVal = document.getElementById('arrival').value;
  const departureVal = document.getElementById('departure').value;
  const arrival = new Date(arrivalVal);
  const departure = new Date(departureVal);
  const travellers = Number(document.getElementById('travellers').value);
  const rooms = Number(document.getElementById('rooms').value);

  // read the extra costs from the picked options
  const transportCost = getCategoryCost('transport');
  const activitiesCost = getCategoryCost('activities');
  const foodCost = getCategoryCost('food');
  const hotelCost = getCategoryCost('hotel');

  if (!arrival.getTime() || !departure.getTime() || departure < arrival || travellers < 1 || rooms < 1) {
    document.getElementById('budgetResult').innerHTML = '<span style="color: #dc2626;">Please enter valid travel dates, number of travellers, and rooms.</span>';
    currentBudget = null;
    return;
  }

  const nights = Math.round((departure - arrival) / 86400000);
  const days = nights + 1;

  // formula: package price x travellers, plus extras (transport, activities, food per day, hotel per room per night)
  const basePrice = currentSelectedPackage ? (currentSelectedPackage.basePrice || 0) : 0;
  const packageBaseCost = travellers * basePrice;

  const totalTransport = travellers * transportCost;
  const totalActivities = travellers * activitiesCost;
  const totalFood = travellers * days * foodCost;
  const totalHotel = nights * rooms * hotelCost;
  const totalExtras = totalTransport + totalActivities + totalFood + totalHotel;

  const total = packageBaseCost + totalExtras;
  const perPerson = total / travellers;

  currentBudget = {
    days,
    nights,
    travellers,
    rooms,
    basePrice,
    packageBaseCost,
    totalExtras,
    total,
    perPerson,
    breakdown: {
      packageBase: packageBaseCost,
      transport: totalTransport,
      hotel: totalHotel,
      food: totalFood,
      activities: totalActivities,
    },
    selections: {
      transport: budgetOptionsData.transport.find(o => o.id === activeSelections.transport).label,
      hotel: budgetOptionsData.hotel.find(o => o.id === activeSelections.hotel).label,
      food: budgetOptionsData.food.find(o => o.id === activeSelections.food).label,
      activities: budgetOptionsData.activities.find(o => o.id === activeSelections.activities).label,
    }
  };

  document.getElementById('budgetResult').innerHTML = `
    <div class="receipt-pills-row">
      <span class="receipt-pill">⏱️ <strong>${days}</strong>D, <strong>${nights}</strong>N</span>
      <span class="receipt-pill">👥 <strong>${travellers}</strong> Traveller${travellers > 1 ? 's' : ''}</span>
      <span class="receipt-pill">🏨 <strong>${rooms}</strong> Room${rooms > 1 ? 's' : ''}</span>
    </div>

    <div class="receipt-split-grid">
      <div class="receipt-table">
        <div class="receipt-row">
          <span class="receipt-label">📦 Base Package (${travellers} × MYR ${basePrice.toFixed(0)})</span>
          <span class="receipt-amount">MYR ${packageBaseCost.toFixed(2)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">✈️ Flight / Transport (${activeSelections.transport === 't_none' ? 'Self-Arranged' : budgetOptionsData.transport.find(o => o.id === activeSelections.transport).label})</span>
          <span class="receipt-amount">${totalTransport > 0 ? `+MYR ${totalTransport.toFixed(2)}` : '<span class="text-included">Included</span>'}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">🏨 Stay Upgrade (${nights}N × ${rooms}R)</span>
          <span class="receipt-amount">${totalHotel > 0 ? `+MYR ${totalHotel.toFixed(2)}` : '<span class="text-included">Standard</span>'}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">🍱 Dining Plan (${days}D × ${travellers} Pax)</span>
          <span class="receipt-amount">+MYR ${totalFood.toFixed(2)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">🎟️ Excursions &amp; Passes</span>
          <span class="receipt-amount">${totalActivities > 0 ? `+MYR ${totalActivities.toFixed(2)}` : '<span class="text-included">Included</span>'}</span>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-row receipt-subtotal-row">
          <span class="receipt-label">➕ Total Add-ons &amp; Extras:</span>
          <span class="receipt-amount receipt-extras-val">MYR ${totalExtras.toFixed(2)}</span>
        </div>
      </div>

      <div class="receipt-side-box">
        <div class="receipt-grand-total-box">
          <div>
            <span class="grand-label">Total Budget</span>
            <div class="grand-amount">MYR ${total.toFixed(2)}</div>
          </div>
          <div class="grand-per-person">
            <span class="pp-tag">MYR ${perPerson.toFixed(2)} / pax</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getPlans() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function savePlans(plans) {
  localStorage.setItem(storageKey, JSON.stringify(plans));
}

function savePlan() {
  const name = document.getElementById('planName').value.trim();
  if (!name || !currentDestination || !currentSuggestion || !currentSelectedPackage || !currentBudget) {
    document.getElementById('saveMessage').textContent = 'Please select a package on Explore Destination, calculate the budget, and enter a plan name first.';
    return;
  }
  const plans = getPlans();
  plans.push({ id: Date.now(), name, destination: currentDestination, suggestion: currentSuggestion, selectedPackage: currentSelectedPackage, budget: currentBudget });
  savePlans(plans);
  document.getElementById('saveMessage').textContent = 'Travel plan saved successfully! You can view it in My Travel Plans.';
  document.getElementById('planName').value = '';
}

let editingPlanId = null;

function displayPlans() {
  const list = document.getElementById('plansList');
  if (!list) return;
  const plans = getPlans();
  if (!plans.length) {
    list.innerHTML = `
      <div class="plans-empty-card">
        <div class="plans-empty-icon">🧳</div>
        <h3>No Travel Plans Saved Yet</h3>
        <p>Explore our curated holiday packages, forecast live weather, customize your budget add-ons, and save your trip here!</p>
        <div class="plans-empty-actions">
          <a href="index.html" class="btn-primary">✈️ Explore Destinations</a>
          <a href="calculator.html" class="btn-secondary">💰 Budget Calculator</a>
        </div>
      </div>
    `;
    return;
  }
  list.innerHTML = `
    <div class="plans-grid">
      ${plans.map((plan, index) => {
        const code = plan.destination.code || 'KR';
        const imgUrl = (countries[code] ? countries[code].images[0] : countries.KR.images[0]);
        const pkgTitle = plan.selectedPackage ? plan.selectedPackage.title : 'Travel Package';
        const pkgBase = plan.selectedPackage && plan.selectedPackage.basePrice ? plan.selectedPackage.basePrice : (plan.budget.basePrice || 0);
        const travellers = plan.budget.travellers || 1;
        const baseTotal = plan.budget.packageBaseCost !== undefined ? plan.budget.packageBaseCost : (travellers * pkgBase);
        const extrasTotal = plan.budget.totalExtras !== undefined ? plan.budget.totalExtras : (plan.budget.total - baseTotal);

        const itineraryDisplay = plan.selectedPackage && plan.selectedPackage.itinerary
          ? `
            <details class="plan-itinerary-preview">
              <summary>View Day-by-Day Schedule (${plan.selectedPackage.days} Days)</summary>
              <div class="plan-itin-content">
                ${plan.selectedPackage.itinerary.map(item => `
                  <div class="plan-itin-item">
                    <span class="plan-itin-day">Day ${item.day}</span>
                    <span>${item.outdoor}</span>
                  </div>
                `).join('')}
              </div>
            </details>
          `
          : '';

        return `
          <div class="tour-card">
            <div class="tour-card-thumb-wrap">
              <img class="tour-card-img" src="${imgUrl}" alt="${plan.destination.city}">
              <span class="tour-card-badge">⏱️ ${plan.selectedPackage ? plan.selectedPackage.days : plan.budget.days}D / ${plan.selectedPackage ? plan.selectedPackage.nights : plan.budget.nights}N</span>
            </div>
            <div class="tour-card-body">
              <div class="tour-card-header">
                ${editingPlanId === plan.id ? `
                  <div style="display: flex; gap: 6px; width: 100%; margin-bottom: 8px;">
                    <input type="text" id="renameInput-${plan.id}" value="${plan.name.replace(/"/g, "&quot;")}" style="flex: 1; padding: 4px 6px; font-size: 13px;" onkeydown="if(event.key === 'Enter') saveRename(${plan.id})">
                    <button type="button" class="btn-save-inline" onclick="saveRename(${plan.id})">Save</button>
                    <button type="button" class="btn-cancel-inline" onclick="cancelRename()">Cancel</button>
                  </div>
                ` : `
                  <h3>${plan.name}</h3>
                  <span class="tour-status-tag">★ Saved</span>
                `}
              </div>
              <div class="tour-location-row">
                📍 <strong>${plan.destination.city}, ${plan.destination.country}</strong>
              </div>
              <div class="tour-dates-row">
                📅 <strong>Dates:</strong> ${plan.destination.startDate} → ${plan.destination.endDate}
              </div>
              <div class="tour-cost-breakdown">
                <div><span>📦 Base Package:</span> <strong>MYR ${baseTotal.toFixed(2)}</strong></div>
                <div><span>➕ Extras (${travellers} Pax):</span> <strong>+MYR ${extrasTotal.toFixed(2)}</strong></div>
              </div>
              ${itineraryDisplay}
              <div class="tour-footer">
                <div>
                  <span class="tour-price">MYR ${plan.budget.total.toFixed(2)}</span>
                  <small class="tour-per-pax">MYR ${(plan.budget.perPerson || (plan.budget.total / travellers)).toFixed(2)} / pax</small>
                </div>
                <div class="tour-actions">
                  <button class="card-btn" onclick="editPlan(${plan.id})">✏️ Rename</button>
                  <button class="card-btn card-btn-danger" onclick="deletePlan(${plan.id})">🗑️ Delete</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function editPlan(id) {
  editingPlanId = id;
  displayPlans();
  setTimeout(() => {
    const input = document.getElementById(`renameInput-${id}`);
    if (input) {
      input.focus();
      input.select();
    }
  }, 50);
}

function saveRename(id) {
  const input = document.getElementById(`renameInput-${id}`);
  if (input && input.value.trim()) {
    const plans = getPlans();
    const plan = plans.find(item => item.id === id);
    if (plan) {
      plan.name = input.value.trim();
      savePlans(plans);
    }
  }
  editingPlanId = null;
  displayPlans();
}

function cancelRename() {
  editingPlanId = null;
  displayPlans();
}

function deletePlan(id) {
  if (confirm('Delete this travel plan?')) {
    savePlans(getPlans().filter(plan => plan.id !== id));
    if (editingPlanId === id) editingPlanId = null;
    displayPlans();
  }
}

// attach listeners for the page that is open
const exploreBtn = document.getElementById('exploreButton');
if (exploreBtn) exploreBtn.addEventListener('click', searchDestination);

const resetExploreBtn = document.getElementById('resetExploreButton');
if (resetExploreBtn) resetExploreBtn.addEventListener('click', resetExplorePage);

function resetExplorePage() {
  localStorage.removeItem(currentSearchKey);
  currentDestination = null;
  currentSuggestion = null;
  currentSelectedPackage = null;

  const countrySelect = document.getElementById('country');
  if (countrySelect) {
    countrySelect.value = 'KR';
    updatePlaces();
  }

  const startInput = document.getElementById('weatherStart');
  if (startInput) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    startInput.value = d.toISOString().slice(0, 10);
  }
  updateAutoReturnDate();

  const searchMsg = document.getElementById('searchMessage');
  if (searchMsg) searchMsg.textContent = 'Explore page content has been reset.';

  const packageInfo = document.getElementById('packageInfo');
  if (packageInfo) {
    packageInfo.innerHTML = '<p class="empty-note">Please search for a destination and dates above first.</p>';
  }

  const selectedPkg = document.getElementById('selectedPackageInfo');
  if (selectedPkg) {
    selectedPkg.innerHTML = `<p><i>No package selected yet.</i></p>`;
  }

  const travelInfo = document.getElementById('travelInfo');
  if (travelInfo) {
    travelInfo.innerHTML = `<p><i>Location details will appear here.</i></p>`;
  }

  const weatherInfo = document.getElementById('weatherInfo');
  if (weatherInfo) {
    weatherInfo.innerHTML = '<p class="empty-note">Daily weather forecast for your travel dates will appear here after searching.</p>';
  }

  const suggestionInfo = document.getElementById('suggestionInfo');
  if (suggestionInfo) {
    suggestionInfo.innerHTML = '<p class="empty-note">Smart indoor/outdoor activity recommendations based on the forecast will appear here.</p>';
  }

  renderProceedCta(null);
}

const countrySelect = document.getElementById('country');
if (countrySelect) {
  countrySelect.addEventListener('change', () => {
    updatePlaces();
    updateAutoReturnDate();
  });
  updatePlaces();
}

const startInput = document.getElementById('weatherStart');
if (startInput) {
  if (!startInput.value) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    startInput.value = d.toISOString().slice(0, 10);
  }
  updateAutoReturnDate();
  startInput.addEventListener('change', updateAutoReturnDate);
  startInput.addEventListener('input', updateAutoReturnDate);
}

const proceedContainer = document.getElementById('proceedBudgetCtaContainer');
if (proceedContainer) {
  renderProceedCta(currentSelectedPackage);
}

const calculateBtn = document.getElementById('calculateButton');
if (calculateBtn) calculateBtn.addEventListener('click', calculateBudget);

const saveBtn = document.getElementById('saveButton');
if (saveBtn) saveBtn.addEventListener('click', savePlan);

const destinationBanner = document.getElementById('selectedDestinationBanner');
if (destinationBanner) {
  if (currentDestination) {
    const pkgName = currentSelectedPackage ? currentSelectedPackage.title : 'Base Package';
    const pkgPrice = currentSelectedPackage ? currentSelectedPackage.basePrice : 0;
    const pkgDays = currentSelectedPackage ? currentSelectedPackage.days : (currentDestination.days || 4);
    const pkgNights = currentSelectedPackage ? currentSelectedPackage.nights : (currentDestination.nights || 3);
      const countryName = flagMap[currentDestination.code] || currentDestination.country;

    destinationBanner.innerHTML = `
      <div style="padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #2c3e50;">${pkgName} (${pkgDays}D / ${pkgNights}N)</h3>
        <p style="margin: 4px 0;">📍 <b>Location:</b> ${currentDestination.city}, ${countryName}</p>
        <p style="margin: 4px 0;">🛫 <b>Departure:</b> ${currentDestination.startDate} &nbsp;|&nbsp; 🛬 <b>Return:</b> ${currentDestination.endDate}</p>
        <p style="margin: 4px 0; color: #2980b9;">💵 <b>Base Price:</b> MYR ${pkgPrice.toFixed(2)} / person</p>
      </div>
    `;
    if (currentDestination.startDate) document.getElementById('arrival').value = currentDestination.startDate;
    if (currentDestination.endDate) document.getElementById('departure').value = currentDestination.endDate;
    const planNameInput = document.getElementById('planName');
    if (planNameInput && !planNameInput.value) {
      planNameInput.value = `Vacation in ${currentDestination.city} (${pkgName})`;
    }
  } else {
    destinationBanner.innerHTML = `
      <p><i>No destination package selected. Please select a package on <a href="index.html"><b>Explore Destination</b></a> first.</i></p>
    `;
  }
}

if (document.getElementById('plansList')) {
  displayPlans();
}

// set up the budget add-on cards on the calculator page
if (document.getElementById('transportOptions')) {
  initBudgetOptionCards();

  // listeners for travellers and rooms inputs
  ['travellers', 'rooms'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const arrival = document.getElementById('arrival');
        const departure = document.getElementById('departure');
        if (arrival && departure && arrival.value && departure.value) {
          calculateBudget();
        }
      });
    }
  });

  // listener for date changes
  ['arrival', 'departure'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        calculateBudget();
      });
    }
  });

  // auto calculate when the calculator page opens with dates
  const initArr = document.getElementById('arrival');
  const initDep = document.getElementById('departure');
  if (initArr && initDep && initArr.value && initDep.value) {
    calculateBudget();
  }
}
