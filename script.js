// ---- Supabase authentication setup ----
// replace with your own project credentials
const SUPABASE_URL = 'https://wvteuvquycbgyyuylook.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dms30CIhLFMCar0OHoGeYQ_pkH20lZC';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let loginForm, loginStatus, logoutBtn;
let signupForm, showSignupLink, showLoginLink;
let settingsBtn, closeSettingsBtn, settingsModal, settingsForm;
let loggedInMenu;
let currentUser = null;

async function initializeAuth() {
  // grab elements once DOM is ready
  loginForm = document.getElementById('login-form');
  signupForm = document.getElementById('signup-form');
  showSignupLink = document.getElementById('show-signup');
  showLoginLink = document.getElementById('show-login');
  loginStatus = document.getElementById('login-status');
  logoutBtn = document.getElementById('logout-btn');
  settingsBtn = document.getElementById('settings-btn');
  closeSettingsBtn = document.getElementById('close-settings');
  settingsModal = document.getElementById('settings-modal');
  settingsForm = document.getElementById('settings-form');
  loggedInMenu = document.getElementById('logged-in-menu');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignUp);
  }
  if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showSignupForm(); });
  }
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettings);
  }
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettings);
  }
  if (settingsForm) {
    settingsForm.addEventListener('submit', handleSettingsSubmit);
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && session.user) {
    setLoggedIn(session.user);
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) setLoggedIn(session.user);
    else setLoggedOut();
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    setLoggedIn(data.user);
  }
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  setLoggedOut();
}

async function handleSignUp(e) {
  e.preventDefault();
  const username = signupForm.username.value.trim();
  const email = signupForm.email.value.trim();
  const password = signupForm.password.value;
  const confirm = signupForm.confirm.value;
  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
  if (error) {
    alert('Sign up failed: ' + error.message);
  } else {
    alert('Check your email for confirmation link');
    showLoginForm();
    signupForm.reset();
  }
}

function showSignupForm() {
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'flex';
  if (showSignupLink) showSignupLink.style.display = 'none';
}

function showLoginForm() {
  if (signupForm) signupForm.style.display = 'none';
  if (loginForm) loginForm.style.display = 'flex';
  if (showSignupLink) showSignupLink.style.display = 'block';
}
function setLoggedIn(user) {
  currentUser = user;
  const username = user.user_metadata?.username || user.email;
  if (loginStatus) loginStatus.textContent = `Welcome, ${username}!`;
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'none';
  if (showSignupLink) showSignupLink.style.display = 'none';
  if (loggedInMenu) loggedInMenu.style.display = 'flex';
  // pre-fill settings form with current username
  const usernameInput = document.getElementById('settings-username');
  if (usernameInput) usernameInput.value = username;
}

function setLoggedOut() {
  currentUser = null;
  if (loginStatus) loginStatus.textContent = '';
  if (loginForm) loginForm.style.display = 'flex';
  if (signupForm) signupForm.style.display = 'none';
  if (showSignupLink) showSignupLink.style.display = 'block';
  if (loggedInMenu) loggedInMenu.style.display = 'none';
  if (settingsModal) settingsModal.style.display = 'none';
}

function openSettings() {
  if (settingsModal) settingsModal.style.display = 'flex';
}

function closeSettings() {
  if (settingsModal) settingsModal.style.display = 'none';
  settingsForm.reset();
}

async function handleSettingsSubmit(e) {
  e.preventDefault();
  const newUsername = document.getElementById('settings-username').value.trim();
  const newPassword = document.getElementById('settings-new-password').value;
  const confirmPassword = document.getElementById('settings-confirm-password').value;
  const currentPassword = document.getElementById('settings-current-password').value;

  if (!currentPassword) {
    alert('Current password is required to make changes');
    return;
  }

  if (newPassword && newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }

  try {
    // re-authenticate with current password
    const { error: reAuthError } = await supabaseClient.auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword
    });
    if (reAuthError) throw new Error('Current password is incorrect');

    // update username in metadata
    if (newUsername) {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: { username: newUsername }
      });
      if (updateError) throw updateError;
    }

    // update password if provided
    if (newPassword) {
      const { error: pwError } = await supabaseClient.auth.updateUser({
        password: newPassword
      });
      if (pwError) throw pwError;
    }

    alert('Settings updated successfully!');
    closeSettings();
    // refresh current user data
    const { data } = await supabaseClient.auth.getUser();
    if (data.user) setLoggedIn(data.user);
  } catch (err) {
    alert('Error updating settings: ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', initializeAuth);

const QUIZZES = {
  europe: {
    id: "europe",
    title: "Europe Countries Quiz",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "Europe quiz",
    mapBounds: {
      minLon: -27,
      maxLon: 60,
      minLat: 33,
      maxLat: 72
    },
    clickZoomFactor: 2.4,
    guessableCountries: [
      "albania",
      "andorra",
      "austria",
      "belarus",
      "belgium",
      "bosnia and herzegovina",
      "bulgaria",
      "croatia",
      "czechia",
      "denmark",
      "estonia",
      "finland",
      "france",
      "germany",
      "greece",
      "vatican",
      "hungary",
      "iceland",
      "ireland",
      "italy",
      "kosovo",
      "latvia",
      "liechtenstein",
      "lithuania",
      "luxembourg",
      "malta",
      "monaco",
      "montenegro",
      "netherlands",
      "norway",
      "poland",
      "portugal",
      "moldova",
      "romania",
      "russia",
      "san marino",
      "republic of serbia",
      "slovakia",
      "slovenia",
      "spain",
      "sweden",
      "switzerland",
      "north macedonia",
      "ukraine",
      "united kingdom"
    ],
    aliases: {
      "uk": "united kingdom",
      "u.k.": "united kingdom",
      "great britain": "united kingdom",
      "britain": "united kingdom",
      "england": "united kingdom",
      "bosnia": "bosnia and herzegovina",
      "czech republic": "czechia",
      "macedonia": "north macedonia",
      "vatican city": "vatican",
      "lichtenstein": "liechtenstein",
      "serbia": "republic of serbia"
    },
    excludedNames: [
      "svalbard and jan mayen",
      "faroe islands",
      "guernsey",
      "jersey",
      "isle of man",
      "gibraltar",
      "aland islands"
    ],
    islandHaloCountries: ["malta"],
    coordinateTransform: null
  },
  world_196: {
    id: "world_196",
    title: "196 Countries of the World",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "world quiz",
    mapBounds: {
      minLon: -180,
      maxLon: 180,
      minLat: -58,
      maxLat: 85
    },
    clickZoomFactor: 2.2,
    guessableCountries: [
      "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
      "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
      "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
      "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Costa Rica",
      "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
      "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "eSwatini", "Ethiopia",
      "Federated States of Micronesia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
      "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
      "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo",
      "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
      "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
      "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
      "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
      "Guinea-Bissau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Republic of Serbia",
      "Republic of the Congo", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
      "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
      "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
      "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Thailand", "The Bahamas", "Togo", "Tonga", "Trinidad and Tobago",
      "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
      "United Republic of Tanzania", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican", "Venezuela", "Vietnam",
      "Yemen", "Zambia", "Zimbabwe"
    ],
    aliases: {
      "antigua": "antigua and barbuda",
      "antigua & barbuda": "antigua and barbuda",
      "bahamas": "the bahamas",
      "bosnia herzegovina": "bosnia and herzegovina",
      "cape verde": "cabo verde",
      "car": "central african republic",
      "columbbia": "colombia",
      "congo": "republic of the congo",
      "congo democratic republic": "democratic republic of the congo",
      "usa": "united states of america",
      "united states": "united states of america",
      "us": "united states of america",
      "u.s.a.": "united states of america",
      "uae": "united arab emirates",
      "uk": "united kingdom",
      "u.k.": "united kingdom",
      "great britain": "united kingdom",
      "dr": "dominican republic",
      "dr congo": "democratic republic of the congo",
      "democratic republic of congo": "democratic republic of the congo",
      "drc": "democratic republic of the congo",
      "congo kinshasa": "democratic republic of the congo",
      "congo brazzaville": "republic of the congo",
      "cote divoire": "ivory coast",
      "cote d ivoire": "ivory coast",
      "czech republic": "czechia",
      "eswatini": "eswatini",
      "swaziland": "eswatini",
      "east timor": "east timor",
      "timor leste": "east timor",
      "kirgistan": "kyrgyzstan",
      "kyrgistan": "kyrgyzstan",
      "lichtenstein": "liechtenstein",
      "macedonia": "north macedonia",
      "burma": "myanmar",
      "micronesia": "federated states of micronesia",
      "png": "papua new guinea",
      "st kitts": "saint kitts and nevis",
      "st kitts & nevis": "saint kitts and nevis",
      "st lucia": "saint lucia",
      "saint vincent": "saint vincent and the grenadines",
      "st vincent": "saint vincent and the grenadines",
      "saint vincent & the grenadines": "saint vincent and the grenadines",
      "st vincent & the grenadines": "saint vincent and the grenadines",
      "sao tome": "sao tome and principe",
      "sao tome & principe": "sao tome and principe",
      "trinidad": "trinidad and tobago",
      "trinidad & tobago": "trinidad and tobago",
      "tanzania": "united republic of tanzania",
      "korea north": "north korea",
      "korea south": "south korea",
      "vatican city": "vatican",
      "north macedonia": "north macedonia",
      "serbia": "republic of serbia",
      "guinea bissau": "guinea-bissau"
    },
    featureCountryOverrides: {
      "greenland": "denmark"
    },
    hiddenFeatures: [
      "akrotiri sovereign base area",
      "dhekelia sovereign base area",
      "cyprus no mans area",
      "northern cyprus",
      "bajo nuevo bank petrel is",
      "scarborough reef",
      "siachen glacier",
      "spratly islands"
    ],
    hideNonGuessableFeatures: true,
    excludedNames: [],
    islandHaloCountries: [
      "antigua and barbuda",
      "the bahamas",
      "barbados",
      "cabo verde",
      "comoros",
      "dominica",
      "fiji",
      "grenada",
      "kiribati",
      "maldives",
      "malta",
      "marshall islands",
      "mauritius",
      "federated states of micronesia",
      "nauru",
      "palau",
      "saint kitts and nevis",
      "saint lucia",
      "saint vincent and the grenadines",
      "samoa",
      "sao tome and principe",
      "seychelles",
      "solomon islands",
      "tonga",
      "trinidad and tobago",
      "tuvalu",
      "vanuatu"
    ],
    haloCoordinateOverrides: {
      "fiji": { lon: 178.0, lat: -17.8 },
      "kiribati": { lon: 173.0, lat: 1.9 }
    },
    coordinateTransform: null
  },
  africa: {
    id: "africa",
    title: "African Countries Quiz",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "Africa quiz",
    mapBounds: {
      minLon: -25,
      maxLon: 60,
      minLat: -37,
      maxLat: 38
    },
    clickZoomFactor: 2.6,
    guessableCountries: [
      "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon","Central African Republic",
      "Chad","Comoros","Democratic Republic of the Congo","Republic of the Congo","Djibouti","Egypt","Equatorial Guinea","Eritrea","Eswatini",
      "Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau","Ivory Coast","Kenya","Lesotho","Liberia","Libya",
      "Madagascar","Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria","Rwanda",
      "Sao Tome and Principe","Senegal","Seychelles","Sierra Leone","Somalia","South Africa","South Sudan","Sudan","Togo",
      "Tunisia","United Republic of Tanzania","Uganda","Zambia","Zimbabwe"
    ],
    aliases: {
      "congo": "republic of the congo",
      "congo democratic republic": "democratic republic of the congo",
      "dr congo": "democratic republic of the congo",
      "drc": "democratic republic of the congo",
      "congo kinshasa": "democratic republic of the congo",
      "congo brazzaville": "republic of the congo"
    },
    excludedNames: [],
    islandHaloCountries: [
      "madagascar","comoros","mauritius","seychelles","sao tome and principe","cabo verde"
    ],
    coordinateTransform: null,
    hideNonGuessableFeatures: false,
    background: {
      dataWindowKey: "WORLD_GEOJSON",
      dataUrl: "./world.geojson",
      featureNameKeys: ["name", "ADMIN", "NAME"],
      excludedNames: []
    }
  },
  asia: {
    id: "asia",
    title: "Asian Countries Quiz",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "Asia quiz",
    mapBounds: {
      minLon: 20,
      maxLon: 160,
      minLat: -15,
      maxLat: 80
    },
    clickZoomFactor: 2.4,
    guessableCountries: [
      "Afghanistan","Armenia","Azerbaijan","Bahrain","Bangladesh","Bhutan","Brunei","Cambodia","China","Cyprus","Georgia",
      "India","Indonesia","Iran","Iraq","Israel","Japan","Jordan","Kazakhstan","Kuwait","Kyrgyzstan","Laos","Lebanon",
      "Malaysia","Maldives","Mongolia","Myanmar","Nepal","North Korea","Oman","Pakistan","Philippines","Qatar","Saudi Arabia",
      "Singapore","South Korea","Sri Lanka","Syria","Taiwan","Tajikistan","Thailand","East Timor","Turkey","Turkmenistan",
      "United Arab Emirates","Uzbekistan","Vietnam","Yemen"
    ],
    aliases: {},
    excludedNames: [],
    islandHaloCountries: ["maldives"],
    coordinateTransform: null,
    hideNonGuessableFeatures: false,
    background: {
      dataWindowKey: "WORLD_GEOJSON",
      dataUrl: "./world.geojson",
      featureNameKeys: ["name", "ADMIN", "NAME"],
      excludedNames: []
    }
  },
  north_america: {
    id: "north_america",
    title: "North American Countries Quiz",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "North America quiz",
    mapBounds: {
      minLon: -175,
      maxLon: -45,
      minLat: 5,
      maxLat: 85
    },
    clickZoomFactor: 2.4,
    guessableCountries: [
      "Antigua and Barbuda","Bahamas","Barbados","Belize","Canada","Costa Rica","Cuba","Dominica","Dominican Republic",
      "El Salvador","Grenada","Guatemala","Haiti","Honduras","Jamaica","Mexico","Nicaragua","Panama",
      "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Trinidad and Tobago","United States of America"
    ],
    aliases: {},
    excludedNames: [],
    islandHaloCountries: [],
    coordinateTransform: null,
    hideNonGuessableFeatures: false,
    background: {
      dataWindowKey: "WORLD_GEOJSON",
      dataUrl: "./world.geojson",
      featureNameKeys: ["name", "ADMIN", "NAME"],
      excludedNames: []
    }
  },
  south_america: {
    id: "south_america",
    title: "South American Countries Quiz",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "South America quiz",
    mapBounds: {
      minLon: -85,
      maxLon: -30,
      minLat: -57,
      maxLat: 13
    },
    clickZoomFactor: 2.4,
    guessableCountries: [
      "Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay","Peru","Suriname","Uruguay","Venezuela"
    ],
    aliases: {},
    excludedNames: [],
    islandHaloCountries: [],
    coordinateTransform: null,
    hideNonGuessableFeatures: false,
    background: {
      dataWindowKey: "WORLD_GEOJSON",
      dataUrl: "./world.geojson",
      featureNameKeys: ["name", "ADMIN", "NAME"],
      excludedNames: []
    }
  },
  oceania: {
    id: "oceania",
    title: "Oceania Countries Quiz",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "Oceania quiz",
    mapBounds: {
      minLon: 95,
      maxLon: 180,
      minLat: -55,
      maxLat: 10
    },
    clickZoomFactor: 2.4,
    guessableCountries: [
      "Australia","Fiji","Kiribati","Federated States of Micronesia","Marshall Islands","Nauru","New Zealand",
      "Palau","Papua New Guinea","Samoa","Solomon Islands","Tonga","Tuvalu","Vanuatu"
    ],
    aliases: { "micronesia": "federated states of micronesia", "fsm": "federated states of micronesia" },
    excludedNames: [],
    islandHaloCountries: [],
    coordinateTransform: null,
    hideNonGuessableFeatures: false,
    background: {
      dataWindowKey: "WORLD_GEOJSON",
      dataUrl: "./world.geojson",
      featureNameKeys: ["ADMIN", "NAME", "name"],
      excludedNames: []
    }
  },
  us_states: {
    id: "us_states",
    title: "US States Quiz",
    dataWindowKey: "US_STATES_GEOJSON",
    dataUrl: "./us-states.geojson",
    featureNameKeys: ["name", "NAME", "ADMIN"],
    notFoundLabel: "US states quiz",
    mapBounds: {
      minLon: -130,
      maxLon: -64,
      minLat: 22,
      maxLat: 52
    },
    clickZoomFactor: 2.7,
    guessableCountries: [
      "alabama",
      "alaska",
      "arizona",
      "arkansas",
      "california",
      "colorado",
      "connecticut",
      "delaware",
      "florida",
      "georgia",
      "hawaii",
      "idaho",
      "illinois",
      "indiana",
      "iowa",
      "kansas",
      "kentucky",
      "louisiana",
      "maine",
      "maryland",
      "massachusetts",
      "michigan",
      "minnesota",
      "mississippi",
      "missouri",
      "montana",
      "nebraska",
      "nevada",
      "new hampshire",
      "new jersey",
      "new mexico",
      "new york",
      "north carolina",
      "north dakota",
      "ohio",
      "oklahoma",
      "oregon",
      "pennsylvania",
      "rhode island",
      "south carolina",
      "south dakota",
      "tennessee",
      "texas",
      "utah",
      "vermont",
      "virginia",
      "washington",
      "west virginia",
      "wisconsin",
      "wyoming"
    ],
    aliases: {
      "washington dc": "district of columbia",
      "dc": "district of columbia"
    },
    excludedNames: [],
    islandHaloCountries: ["hawaii"],
    background: {
      dataWindowKey: "WORLD_GEOJSON",
      dataUrl: "./world.geojson",
      featureNameKeys: ["ADMIN", "NAME", "name"],
      excludedNames: ["united states of america", "united states"]
    },
    coordinateTransform(canonical, lon, lat) {
      if (canonical === "alaska") {
        return {
          lon: (lon + 170) * 0.26 - 125,
          lat: (lat - 54) * 0.26 + 22.8
        };
      }
      if (canonical === "hawaii") {
        return {
          lon: lon + 40,
          lat: lat + 7
        };
      }
      return { lon, lat };
    }
  }
};

const HALO_CONFIG = {
  paddingX: 2,
  paddingY: 1.5,
  minRx: 4,
  minRy: 3.5,
  autoEnabled: true,
  autoMaxWidth: 16,
  autoMaxHeight: 12,
  autoMaxArea: 90,
  autoNeighborGap: 0,
  forcedPathMaxWidth: 30,
  forcedPathMaxHeight: 22,
  forcedPathMaxArea: 380,
  forcedMaxHalosPerCountry: 3,
  overlapMargin: 2,
  forcedScale: 0.85,
  forcedMaxRx: 11,
  forcedMaxRy: 9
};

const MAP_WIDTH = 980;
let MAP_HEIGHT = 620; // will be recalculated per quiz to preserve geographic aspect ratio

// continent names for grouping
const QUIZ_CONTINENT_NAME = {
  europe: 'Europe',
  africa: 'Africa',
  asia: 'Asia',
  north_america: 'North America',
  south_america: 'South America',
  oceania: 'Oceania'
};

// build sets of normalized names per continent for world quiz grouping
const CONTINENT_SETS = {};
for (const [qid, label] of Object.entries(QUIZ_CONTINENT_NAME)) {
  const quiz = QUIZZES[qid];
  if (quiz && Array.isArray(quiz.guessableCountries)) {
    CONTINENT_SETS[label] = new Set(quiz.guessableCountries.map(normalizeName));
  }
}

const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const startEuropeQuizBtn = document.getElementById("start-europe-quiz-btn");
const startUsQuizBtn = document.getElementById("start-us-quiz-btn");
const startAfricaQuizBtn = document.getElementById("start-africa-quiz-btn");
const startAsiaQuizBtn = document.getElementById("start-asia-quiz-btn");
const startNorthAmericaQuizBtn = document.getElementById("start-northamerica-quiz-btn");
const startSouthAmericaQuizBtn = document.getElementById("start-southamerica-quiz-btn");
const startOceaniaQuizBtn = document.getElementById("start-oceania-quiz-btn");
const startWorldQuizBtn = document.getElementById("start-world-quiz-btn");
const backHomeBtn = document.getElementById("back-home-btn");
const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const mapSvg = document.getElementById("map-svg");
const quizTitleEl = document.getElementById("quiz-title");
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");

let pageZoom = 1;

function updatePageZoom() {
  document.documentElement.style.zoom = pageZoom;
}

// initialize page zoom
updatePageZoom();

const state = {
  mode: "home",
  activeQuizId: null,
  activeQuiz: null,
  countries: [],
  guessed: new Set(),
  lookup: new Map(),
  aliases: new Map(),
  displayNames: new Map(),
  guessableSet: new Set(),
  excludedSet: new Set(),
  hiddenFeatureSet: new Set(),
  featureOverrideMap: new Map(),
  haloSet: new Set(),
  haloBBoxes: [],
  startTime: 0,
  elapsedMs: 0,
  lastGuess: "",
  message: "",
  timerHandle: null,
  viewBox: { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT },
  isZoomedIn: false
};

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateTimer() {
  if (state.mode !== "quiz") {
    return;
  }
  state.elapsedMs = Date.now() - state.startTime;
  timerEl.textContent = formatTime(state.elapsedMs);
}

function setMessage(text, ok = false) {
  state.message = text;
  feedback.textContent = text;
  feedback.style.color = ok ? "#1f6f50" : "#8b3b2b";
}

function switchScreen(mode) {
  state.mode = mode;
  homeScreen.classList.toggle("active", mode === "home");
  quizScreen.classList.toggle("active", mode === "quiz");
}

function setViewBox(x, y, width, height) {
  state.viewBox = { x, y, width, height };
  mapSvg.setAttribute("viewBox", `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}`);
}

function resetMapZoom() {
  setViewBox(0, 0, MAP_WIDTH, MAP_HEIGHT);
  state.isZoomedIn = false;
}

function zoomMapAt(clientX, clientY, factor) {
  const ctm = mapSvg.getScreenCTM();
  if (!ctm) {
    return;
  }
  const point = mapSvg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const svgPoint = point.matrixTransform(ctm.inverse());

  const minWidth = MAP_WIDTH / 6;
  const minHeight = MAP_HEIGHT / 6;
  const nextWidth = Math.max(minWidth, Math.min(MAP_WIDTH, state.viewBox.width / factor));
  const nextHeight = Math.max(minHeight, Math.min(MAP_HEIGHT, state.viewBox.height / factor));

  let nextX = svgPoint.x - nextWidth / 2;
  let nextY = svgPoint.y - nextHeight / 2;
  nextX = Math.max(0, Math.min(MAP_WIDTH - nextWidth, nextX));
  nextY = Math.max(0, Math.min(MAP_HEIGHT - nextHeight, nextY));
  setViewBox(nextX, nextY, nextWidth, nextHeight);
}

function transformLonLat(canonical, lon, lat) {
  if (state.activeQuiz && typeof state.activeQuiz.coordinateTransform === "function") {
    return state.activeQuiz.coordinateTransform(canonical, lon, lat);
  }
  return { lon, lat };
}

function adjustLonForBounds(lon, minLon, maxLon) {
  // If bounds do not wrap (min <= max) return lon unchanged.
  // If bounds wrap across the dateline (min > max), shift lon into [minLon, maxLon+360]
  if (minLon <= maxLon) {
    return lon;
  }
  let l = lon;
  if (l < minLon) {
    l = l + 360;
  }
  return l;
}

function lonLatToXY(canonical, lon, lat, width, height) {
  const transformed = transformLonLat(canonical, lon, lat);
  const { minLon, maxLon, minLat, maxLat } = state.activeQuiz.mapBounds;
  const x = ((transformed.lon - minLon) / (maxLon - minLon)) * width;
  const y = (1 - (transformed.lat - minLat) / (maxLat - minLat)) * height;
  return [x, y];
}

function geometryIntersectsBounds(canonical, geometry) {
  if (!geometry || !geometry.coordinates) {
    return false;
  }

  const { minLon, maxLon, minLat, maxLat } = state.activeQuiz.mapBounds;
  let foundInside = false;

  function visit(coords) {
    if (!Array.isArray(coords) || !coords.length || foundInside) {
      return;
    }
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      const p = transformLonLat(canonical, coords[0], coords[1]);
      const testLon = adjustLonForBounds(p.lon, minLon, maxLon);
      const testMinLon = minLon;
      const testMaxLon = (minLon <= maxLon) ? maxLon : (maxLon + 360);
      if (testLon >= testMinLon && testLon <= testMaxLon && p.lat >= minLat && p.lat <= maxLat) {
        foundInside = true;
      }
      return;
    }
    for (const c of coords) {
      visit(c);
    }
  }

  visit(geometry.coordinates);
  return foundInside;
}

function lonLatToXYRaw(lon, lat, width, height) {
  const { minLon, maxLon, minLat, maxLat } = state.activeQuiz.mapBounds;
  let l = lon;
  let minL = minLon;
  let maxL = maxLon;
  if (minLon > maxLon) {
    // bounds wrap across dateline: shift longitudes < minLon by +360
    if (l < minLon) l = l + 360;
    maxL = maxLon + 360;
  }
  const x = ((l - minL) / (maxL - minL)) * width;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * height;
  return [x, y];
}

function geometryIntersectsBoundsRaw(geometry) {
  if (!geometry || !geometry.coordinates) {
    return false;
  }
  const { minLon, maxLon, minLat, maxLat } = state.activeQuiz.mapBounds;
  let foundInside = false;

  function visit(coords) {
    if (!Array.isArray(coords) || !coords.length || foundInside) {
      return;
    }
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      let lon = coords[0];
      const lat = coords[1];
      let minL = minLon;
      let maxL = maxLon;
      if (minLon > maxLon) {
        if (lon < minLon) lon = lon + 360;
        maxL = maxLon + 360;
      }
      if (lon >= minL && lon <= maxL && lat >= minLat && lat <= maxLat) {
        foundInside = true;
      }
      return;
    }
    for (const c of coords) {
      visit(c);
    }
  }

  visit(geometry.coordinates);
  return foundInside;
}

function polygonToPath(canonical, rings, width, height) {
  let path = "";
  for (const ring of rings) {
    ring.forEach((coord, idx) => {
      const [x, y] = lonLatToXY(canonical, coord[0], coord[1], width, height);
      path += `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
    });
    path += "Z ";
  }
  return path.trim();
}

function polygonToPathRaw(rings, width, height) {
  let path = "";
  for (const ring of rings) {
    ring.forEach((coord, idx) => {
      const [x, y] = lonLatToXYRaw(coord[0], coord[1], width, height);
      path += `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
    });
    path += "Z ";
  }
  return path.trim();
}

function bboxGap(a, b) {
  const dx = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width));
  const dy = Math.max(0, b.y - (a.y + a.height), a.y - (b.y + b.height));
  if (dx === 0 && dy === 0) {
    return 0;
  }
  return Math.hypot(dx, dy);
}

function computeUnionBBox(paths) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const path of paths) {
    let b;
    try {
      b = path.getBBox();
    } catch {
      continue;
    }
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  if (!Number.isFinite(minX)) {
    return null;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function hasLikelyLandNeighbor(country, countries) {
  if (!country.bbox) {
    return false;
  }
  for (const other of countries) {
    if (other.canonical === country.canonical || !other.bbox) {
      continue;
    }
    if (bboxGap(country.bbox, other.bbox) <= HALO_CONFIG.autoNeighborGap) {
      return true;
    }
  }
  return false;
}

function addHaloEllipse(canonical, bbox, anchorPath, idx = 0, options = {}) {
  const scale = options.scale || 1;
  const paddingX = HALO_CONFIG.paddingX * scale;
  const paddingY = HALO_CONFIG.paddingY * scale;
  const haloBox = {
    x: bbox.x - paddingX,
    y: bbox.y - paddingY,
    width: bbox.width + paddingX * 2,
    height: bbox.height + paddingY * 2
  };
  if (!options.allowOverlap) {
    const overlaps = state.haloBBoxes.some((b) => {
      const xSeparated = haloBox.x + haloBox.width + HALO_CONFIG.overlapMargin < b.x ||
        b.x + b.width + HALO_CONFIG.overlapMargin < haloBox.x;
      const ySeparated = haloBox.y + haloBox.height + HALO_CONFIG.overlapMargin < b.y ||
        b.y + b.height + HALO_CONFIG.overlapMargin < haloBox.y;
      return !(xSeparated || ySeparated);
    });
    if (overlaps) {
      return;
    }
  }

  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  let rx = Math.max(HALO_CONFIG.minRx * scale, bbox.width / 2 + paddingX);
  let ry = Math.max(HALO_CONFIG.minRy * scale, bbox.height / 2 + paddingY);
  if (typeof options.maxRx === "number") {
    rx = Math.min(rx, options.maxRx);
  }
  if (typeof options.maxRy === "number") {
    ry = Math.min(ry, options.maxRy);
  }
  const halo = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  halo.setAttribute("cx", cx.toFixed(2));
  halo.setAttribute("cy", cy.toFixed(2));
  halo.setAttribute("rx", rx.toFixed(2));
  halo.setAttribute("ry", ry.toFixed(2));
  halo.setAttribute("data-halo-for", `${canonical}:${idx}`);
  halo.classList.add("island-halo");
  mapSvg.insertBefore(halo, anchorPath);
  state.haloBBoxes.push(haloBox);
}

function addIslandHaloForCountry(country, countries) {
  const canonical = country.canonical;
  const forceHalo = state.haloSet.has(canonical);
  const manualHalo = state.activeQuiz.haloCoordinateOverrides && state.activeQuiz.haloCoordinateOverrides[canonical];
  if (manualHalo) {
    const [mx, my] = lonLatToXY(canonical, manualHalo.lon, manualHalo.lat, MAP_WIDTH, MAP_HEIGHT);
    const manualBBox = { x: mx - 3, y: my - 2.5, width: 6, height: 5 };
    addHaloEllipse(canonical, manualBBox, country.paths[0], 0, {
      allowOverlap: true,
      scale: HALO_CONFIG.forcedScale,
      maxRx: HALO_CONFIG.forcedMaxRx,
      maxRy: HALO_CONFIG.forcedMaxRy
    });
    return;
  }
  const pathBBoxes = [];
  for (const path of country.paths) {
    try {
      const b = path.getBBox();
      pathBBoxes.push({ bbox: b, path, area: b.width * b.height });
    } catch {
      // ignore bad geometry
    }
  }
  if (!pathBBoxes.length) {
    return;
  }

  if (forceHalo) {
    const candidates = pathBBoxes
      .filter((p) =>
        p.bbox.width <= HALO_CONFIG.forcedPathMaxWidth &&
        p.bbox.height <= HALO_CONFIG.forcedPathMaxHeight &&
        p.area <= HALO_CONFIG.forcedPathMaxArea
      )
      .sort((a, b) => a.area - b.area)
      .slice(0, HALO_CONFIG.forcedMaxHalosPerCountry);

    candidates.forEach((c, idx) => addHaloEllipse(
      canonical,
      c.bbox,
      c.path,
      idx,
      {
        allowOverlap: true,
        scale: HALO_CONFIG.forcedScale,
        maxRx: HALO_CONFIG.forcedMaxRx,
        maxRy: HALO_CONFIG.forcedMaxRy
      }
    ));
    if (!candidates.length) {
      const smallest = pathBBoxes.sort((a, b) => a.area - b.area)[0];
      addHaloEllipse(
        canonical,
        smallest.bbox,
        smallest.path,
        0,
        {
          allowOverlap: true,
          scale: HALO_CONFIG.forcedScale,
          maxRx: HALO_CONFIG.forcedMaxRx,
          maxRy: HALO_CONFIG.forcedMaxRy
        }
      );
    }
    return;
  }

  const bbox = country.bbox;
  if (!bbox) {
    return;
  }
  const islandLike = !hasLikelyLandNeighbor(country, countries);
  const autoHalo = HALO_CONFIG.autoEnabled &&
    bbox.width <= HALO_CONFIG.autoMaxWidth &&
    bbox.height <= HALO_CONFIG.autoMaxHeight &&
    (bbox.width * bbox.height) <= HALO_CONFIG.autoMaxArea &&
    islandLike;
  if (!autoHalo) {
    return;
  }
  addHaloEllipse(canonical, bbox, country.paths[0], 0);
}

function getFeatureName(feature) {
  const props = feature.properties || {};
  for (const key of state.activeQuiz.featureNameKeys) {
    if (props[key]) {
      return String(props[key]);
    }
  }
  return "";
}

function getFeatureNameByKeys(feature, keys) {
  const props = feature.properties || {};
  for (const key of keys) {
    if (props[key]) {
      return String(props[key]);
    }
  }
  return "";
}

function drawBackgroundMap(features, backgroundCfg) {
  if (!backgroundCfg || !Array.isArray(features) || !features.length) {
    return;
  }
  const width = MAP_WIDTH;
  const height = MAP_HEIGHT;
  const bgExcluded = new Set((backgroundCfg.excludedNames || []).map((name) => normalizeName(name)));

  for (const feature of features) {
    const rawName = getFeatureNameByKeys(feature, backgroundCfg.featureNameKeys || ["name"]);
    if (!rawName) {
      continue;
    }
    const canonical = normalizeName(rawName);
    if (bgExcluded.has(canonical)) {
      continue;
    }

    const geometry = feature.geometry;
    if (!geometry || !geometryIntersectsBoundsRaw(geometry)) {
      continue;
    }

    let pathData = "";
    if (geometry.type === "Polygon") {
      pathData = polygonToPathRaw(geometry.coordinates, width, height);
    } else if (geometry.type === "MultiPolygon") {
      pathData = geometry.coordinates.map((poly) => polygonToPathRaw(poly, width, height)).join(" ");
    } else {
      continue;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.classList.add("background-country");
    path.setAttribute("aria-hidden", "true");
    mapSvg.appendChild(path);
  }
}

function buildMap(features, backgroundFeatures = []) {
  const width = MAP_WIDTH;
  // calculate height using the active quiz bounds to match real aspect ratio
  const bounds = state.activeQuiz.mapBounds;
  const spanLon = bounds.maxLon - bounds.minLon;
  const spanLat = bounds.maxLat - bounds.minLat;
  const height = spanLon > 0 ? width * (spanLat / spanLon) : MAP_HEIGHT;
  MAP_HEIGHT = height;
  
  // Update SVG viewBox to match new height
  mapSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  mapSvg.innerHTML = "";
  resetMapZoom();
  state.countries = [];
  state.lookup.clear();
  state.aliases.clear();
  state.displayNames.clear();
  state.guessed.clear();
  state.haloBBoxes = [];

  state.guessableSet = new Set(state.activeQuiz.guessableCountries.map((name) => normalizeName(name)));
  state.excludedSet = new Set((state.activeQuiz.excludedNames || []).map((name) => normalizeName(name)));
  state.hiddenFeatureSet = new Set((state.activeQuiz.hiddenFeatures || []).map((name) => normalizeName(name)));
  state.featureOverrideMap = new Map(
    Object.entries(state.activeQuiz.featureCountryOverrides || {}).map(([k, v]) => [normalizeName(k), normalizeName(v)])
  );
  const noStrokeMergedCountries = new Set((state.activeQuiz.noStrokeMergedCountries || []).map((name) => normalizeName(name)));
  state.haloSet = new Set((state.activeQuiz.islandHaloCountries || []).map((name) => normalizeName(name)));
  for (const name of state.activeQuiz.guessableCountries) {
    state.displayNames.set(normalizeName(name), name);
  }

  for (const [alias, canonical] of Object.entries(state.activeQuiz.aliases || {})) {
    state.aliases.set(normalizeName(alias), normalizeName(canonical));
  }

  if (state.activeQuiz.background) {
    drawBackgroundMap(backgroundFeatures, state.activeQuiz.background);
  }

  for (const feature of features) {
    const rawName = getFeatureName(feature);
    if (!rawName) {
      continue;
    }

    const featureName = normalizeName(rawName);
    if (state.hiddenFeatureSet.has(featureName)) {
      continue;
    }
    const isOverriddenFeature = state.featureOverrideMap.has(featureName);
    const canonical = state.featureOverrideMap.get(featureName) || featureName;
    if (state.excludedSet.has(canonical)) {
      continue;
    }

    const geometry = feature.geometry;
    if (!geometry || !geometryIntersectsBounds(canonical, geometry)) {
      continue;
    }

    let pathData = "";
    if (geometry.type === "Polygon") {
      pathData = polygonToPath(canonical, geometry.coordinates, width, height);
    } else if (geometry.type === "MultiPolygon") {
      pathData = geometry.coordinates.map((poly) => polygonToPath(canonical, poly, width, height)).join(" ");
    } else {
      continue;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.classList.add("country");
    path.setAttribute("data-country", canonical);
    path.setAttribute("aria-label", rawName);
    if (!state.guessableSet.has(canonical)) {
      if (state.activeQuiz.hideNonGuessableFeatures) {
        continue;
      }
      path.classList.add("non-europe");
    }
    if (isOverriddenFeature || noStrokeMergedCountries.has(canonical)) {
      path.classList.add("merged-segment");
    }
    mapSvg.appendChild(path);
    if (state.guessableSet.has(canonical)) {
      if (!state.lookup.has(canonical)) {
        const display = state.displayNames.get(canonical) || rawName;
        const country = { rawName: display, canonical, paths: [] };
        state.countries.push(country);
        state.lookup.set(canonical, country);
      }
      state.lookup.get(canonical).paths.push(path);
    }
  }

  for (const country of state.countries) {
    country.bbox = computeUnionBBox(country.paths);
  }
  for (const country of state.countries) {
    addIslandHaloForCountry(country, state.countries);
  }

  scoreEl.textContent = `0 / ${state.countries.length}`;
  renderCountryList();
}

function applyGuess(input) {
  const direct = normalizeName(input);
  const targetName = state.aliases.get(direct) || direct;
  state.lastGuess = input;

  if (!targetName) {
    setMessage("Type a name.");
    return;
  }

  const country = state.lookup.get(targetName);
  if (!country) {
    setMessage(`Not on this ${state.activeQuiz.notFoundLabel}: ${input}`);
    return;
  }

  if (state.guessed.has(targetName)) {
    setMessage(`${country.rawName} was already guessed.`);
    return;
  }

  state.guessed.add(targetName);
  for (const path of country.paths) {
    path.classList.add("guessed");
  }
  for (const halo of mapSvg.querySelectorAll(`[data-halo-for^="${targetName}:"]`)) {
    halo.classList.add("guessed");
  }
  setMessage(`Correct: ${country.rawName}`, true);
  scoreEl.textContent = `${state.guessed.size} / ${state.countries.length}`;
  renderCountryList();

  if (state.guessed.size === state.countries.length) {
    clearInterval(state.timerHandle);
    updateTimer();
    setMessage(`Quiz complete in ${formatTime(state.elapsedMs)}!`, true);
  }
}

function renderCountryList() {
  const container = document.getElementById("country-list");
  if (!container) return;
  container.innerHTML = "";

  const sorted = state.countries.slice().sort((a, b) =>
    a.rawName.localeCompare(b.rawName)
  );

  if (state.activeQuizId === "world_196") {
    // create a column for each continent
    const assigned = new Set();
    for (const [continent, set] of Object.entries(CONTINENT_SETS)) {
      const col = document.createElement("div");
      col.className = "country-column";
      const hdr = document.createElement("h3");
      hdr.textContent = continent;
      col.appendChild(hdr);
      sorted.forEach((c) => {
        if (set.has(c.canonical)) {
          assigned.add(c.canonical);
          const item = document.createElement("div");
          item.className = "country-item";
          item.dataset.country = c.canonical;
          item.textContent = state.guessed.has(c.canonical) ? c.rawName : "".padEnd(c.rawName.length, "_");
          col.appendChild(item);
        }
      });
      container.appendChild(col);
    }
    // others not categorized
    const others = sorted.filter((c) => !assigned.has(c.canonical));
    if (others.length) {
      const col = document.createElement("div");
      col.className = "country-column";
      const hdr = document.createElement("h3");
      hdr.textContent = "Other";
      col.appendChild(hdr);
      others.forEach((c) => {
        const item = document.createElement("div");
        item.className = "country-item";
        item.dataset.country = c.canonical;
        item.textContent = state.guessed.has(c.canonical) ? c.rawName : "".padEnd(c.rawName.length, "_");
        col.appendChild(item);
      });
      container.appendChild(col);
    }
  } else {
    const col = document.createElement("div");
    col.className = "country-column";
    sorted.forEach((c) => {
      const item = document.createElement("div");
      item.className = "country-item";
      item.dataset.country = c.canonical;
      item.textContent = state.guessed.has(c.canonical) ? c.rawName : "".padEnd(c.rawName.length, "_");
      col.appendChild(item);
    });
    container.appendChild(col);
  }
}

function tryAutoSubmitGuess() {
  if (state.mode !== "quiz") {
    return;
  }
  const raw = guessInput.value;
  const direct = normalizeName(raw);
  const targetName = state.aliases.get(direct) || direct;
  if (!targetName || !state.lookup.has(targetName) || state.guessed.has(targetName)) {
    return;
  }
  applyGuess(raw);
  guessInput.value = "";
}

async function loadGeoJsonForActiveQuiz() {
  if (!state.activeQuiz) {
    throw new Error("No active quiz");
  }
  const preloaded = window[state.activeQuiz.dataWindowKey];
  if (preloaded && Array.isArray(preloaded.features)) {
    return preloaded;
  }
  const response = await fetch(state.activeQuiz.dataUrl);
  if (!response.ok) {
    throw new Error(`Map request failed: ${response.status}`);
  }
  return response.json();
}

async function loadGeoJsonByKeyOrUrl(windowKey, dataUrl) {
  const preloaded = window[windowKey];
  if (preloaded && Array.isArray(preloaded.features)) {
    return preloaded;
  }
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Map request failed: ${response.status}`);
  }
  return response.json();
}

async function startQuiz(quizId) {
  const quiz = QUIZZES[quizId];
  if (!quiz) {
    return;
  }

  state.activeQuizId = quizId;
  state.activeQuiz = quiz;
  quizTitleEl.textContent = quiz.title;
  switchScreen("quiz");
  setMessage("Loading map data...", true);

  try {
    const geojson = await loadGeoJsonForActiveQuiz();
    let backgroundGeojson = null;
    if (quiz.background) {
      backgroundGeojson = await loadGeoJsonByKeyOrUrl(quiz.background.dataWindowKey, quiz.background.dataUrl);
    }
    // Merge global world aliases so regional quizzes accept common alternate names
    try {
      const worldAliases = (QUIZZES.world_196 && QUIZZES.world_196.aliases) || {};
      quiz.aliases = Object.assign({}, worldAliases, quiz.aliases || {});
    } catch (e) {
      // ignore
    }
    buildMap(geojson.features || [], (backgroundGeojson && backgroundGeojson.features) || []);
    if (!state.countries.length) {
      throw new Error("No locations were parsed from map data");
    }

    state.startTime = Date.now();
    state.elapsedMs = 0;
    timerEl.textContent = "00:00";
    clearInterval(state.timerHandle);
    state.timerHandle = setInterval(updateTimer, 250);

    setMessage("Map ready. Start typing names.", true);
    guessInput.value = "";
    guessInput.focus();
  } catch (err) {
    setMessage(`Failed to load map: ${err.message}`);
  }
}

function stopQuiz() {
  clearInterval(state.timerHandle);
  switchScreen("home");
  setMessage("");
}

startEuropeQuizBtn.addEventListener("click", () => startQuiz("europe"));
startUsQuizBtn.addEventListener("click", () => startQuiz("us_states"));
startAfricaQuizBtn.addEventListener("click", () => startQuiz("africa"));
startAsiaQuizBtn.addEventListener("click", () => startQuiz("asia"));
startNorthAmericaQuizBtn.addEventListener("click", () => startQuiz("north_america"));
startSouthAmericaQuizBtn.addEventListener("click", () => startQuiz("south_america"));
startOceaniaQuizBtn.addEventListener("click", () => startQuiz("oceania"));
startWorldQuizBtn.addEventListener("click", () => startQuiz("world_196"));
backHomeBtn.addEventListener("click", stopQuiz);


if (zoomInBtn && zoomOutBtn) {
  zoomInBtn.addEventListener("click", () => { pageZoom *= 1.25; updatePageZoom(); });
  zoomOutBtn.addEventListener("click", () => { pageZoom /= 1.25; updatePageZoom(); });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "+" || event.key === "=") {
    pageZoom *= 1.25;
    updatePageZoom();
  } else if (event.key === "-") {
    pageZoom /= 1.25;
    updatePageZoom();
  }
});

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.mode !== "quiz") {
    return;
  }
  applyGuess(guessInput.value);
  guessInput.value = "";
  guessInput.focus();
});

guessInput.addEventListener("input", () => {
  tryAutoSubmitGuess();
});

mapSvg.addEventListener("click", (event) => {
  if (state.mode !== "quiz" || !state.activeQuiz) {
    return;
  }
  if (!state.isZoomedIn) {
    zoomMapAt(event.clientX, event.clientY, state.activeQuiz.clickZoomFactor || 2.2);
    state.isZoomedIn = true;
  } else {
    resetMapZoom();
  }
});

mapSvg.addEventListener("dblclick", (event) => {
  event.preventDefault();
  resetMapZoom();
});

document.addEventListener("keydown", async (event) => {
  if (event.key.toLowerCase() !== "f") {
    return;
  }
  if (document.activeElement === guessInput) {
    return;
  }

  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

window.render_game_to_text = function renderGameToText() {
  const missing = state.countries
    .filter((c) => !state.guessed.has(c.canonical))
    .slice(0, 10)
    .map((c) => c.rawName);

  return JSON.stringify({
    coordinate_system: `SVG viewport ${MAP_WIDTH}x${MAP_HEIGHT}, origin top-left, +x right, +y down`,
    mode: state.mode,
    quiz: state.activeQuizId,
    countries_total: state.countries.length,
    countries_guessed: state.guessed.size,
    timer: timerEl.textContent,
    last_guess: state.lastGuess,
    feedback: state.message,
    sample_missing_countries: missing
  });
};

window.advanceTime = function advanceTime(ms) {
  if (state.mode !== "quiz") {
    return;
  }
  const increment = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  state.elapsedMs += increment;
  timerEl.textContent = formatTime(state.elapsedMs);
};
