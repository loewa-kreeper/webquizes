// ---- Supabase authentication setup ----
// replace with your own project credentials
const SUPABASE_URL = 'https://wvteuvquycbgyyuylook.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dms30CIhLFMCar0OHoGeYQ_pkH20lZC';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Titles & Badges ----
const TITLES = [
  { id: "none", name: "No Title", level: 0, color: "#6b7280" },
  { id: "beginner", name: "Beginner", level: 2, color: "#94a3b8" },
  { id: "rookie", name: "Rookie", level: 5, color: "#10b981" },
  { id: "pro", name: "Pro", level: 10, color: "#3b82f6" },
  { id: "expert", name: "Expert", level: 15, color: "#8b5cf6" },
  { id: "geograph", name: "Geograph", level: 25, color: "#ec4899" },
  { id: "veteran", name: "Veteran", level: 35, color: "#ef4444" },
  { id: "geo_god", name: "Geo God", level: 50, color: "#f59e0b" }
];

function renderTitleBadge(titleId, level = 0) {
  // If no specific title chosen, auto-assign based on level
  let idToUse = titleId;
  if (!idToUse || idToUse === "none") {
    // find highest unlocked title
    const unlocked = [...TITLES].reverse().find(t => level >= t.level);
    idToUse = unlocked ? unlocked.id : "none";
  }

  const title = TITLES.find(t => t.id === idToUse);
  if (!title || title.id === "none") return "";

  return `<span class="title-badge" style="background: ${title.color} !important; display: inline-block !important; visibility: visible !important; opacity: 1 !important;">${title.name}</span>`;
}

function renderLevelBadge(level) {
  if (!level) return "";
  return `<span class="leader-level" title="Level ${level}">${level}</span>`;
}

let loginForm, loginStatus, logoutBtn;
let signupForm, showSignupLink, showLoginLink;
let settingsBtn, closeSettingsBtn, settingsModal, settingsForm;
let loggedInMenu, resetLevelBtn;
let startEuropeQuizBtn, startEuropeFlagsBtn, startUsQuizBtn, startAfricaQuizBtn, startAfricaFlagsBtn, startAsiaQuizBtn, startAsiaFlagsBtn, startNorthAmericaQuizBtn, startNorthAmericaFlagsBtn, startSouthAmericaQuizBtn, startSouthAmericaFlagsBtn, startOceaniaQuizBtn, startOceaniaFlagsBtn, startWorldQuizBtn, startWorldFlagsBtn, backHomeBtn, giveUpBtn, scoreEl, timerEl, quizTitleEl, quizOverlay, startGameBtn, guessInput, guessForm, mapSvg, feedback, zoomInBtn, zoomOutBtn, pbDisplayEl;
let levelUpModal, levelUpCloseBtn, levelUpLevelText, levelUpUnlockSection, levelUpTitleContainer;
let customDialogModal, dialogTitle, dialogMessage, dialogOkBtn, dialogCancelBtn, dialogResolve;
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
  resetLevelBtn = document.getElementById('reset-level-btn');
  if (resetLevelBtn) {
    resetLevelBtn.addEventListener('click', handleResetLevel);
  }

  // Level up modal references
  levelUpModal = document.getElementById('level-up-modal');
  levelUpCloseBtn = document.getElementById('close-levelup-btn');
  levelUpLevelText = document.getElementById('levelup-new-level');
  levelUpUnlockSection = document.getElementById('levelup-unlock-section');
  levelUpTitleContainer = document.getElementById('levelup-title-container');

  if (levelUpCloseBtn) {
    levelUpCloseBtn.addEventListener('click', () => {
      if (levelUpModal) levelUpModal.style.display = 'none';
    });
  }

  // Custom Dialog references
  customDialogModal = document.getElementById('custom-dialog-modal');
  dialogTitle = document.getElementById('dialog-title');
  dialogMessage = document.getElementById('dialog-message');
  dialogOkBtn = document.getElementById('dialog-ok-btn');
  dialogCancelBtn = document.getElementById('dialog-cancel-btn');

  if (dialogOkBtn) {
    dialogOkBtn.onclick = () => {
      if (customDialogModal) customDialogModal.style.display = 'none';
      if (dialogResolve) dialogResolve(true);
    };
  }
  if (dialogCancelBtn) {
    dialogCancelBtn.onclick = () => {
      if (customDialogModal) customDialogModal.style.display = 'none';
      if (dialogResolve) dialogResolve(false);
    };
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && session.user) {
    setLoggedIn(session.user);
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) setLoggedIn(session.user);
    else setLoggedOut();
  });

  // Quiz UI references
  startEuropeQuizBtn = document.getElementById('start-europe-quiz-btn');
  startEuropeFlagsBtn = document.getElementById('start-europe-flags-btn');
  startUsQuizBtn = document.getElementById('start-us-quiz-btn');
  startAfricaQuizBtn = document.getElementById('start-africa-quiz-btn');
  startAfricaFlagsBtn = document.getElementById('start-africa-flags-btn');
  startAsiaQuizBtn = document.getElementById('start-asia-quiz-btn');
  startAsiaFlagsBtn = document.getElementById('start-asia-flags-btn');
  startNorthAmericaQuizBtn = document.getElementById('start-northamerica-quiz-btn');
  startNorthAmericaFlagsBtn = document.getElementById('start-northamerica-flags-btn');
  startSouthAmericaQuizBtn = document.getElementById('start-southamerica-quiz-btn');
  startSouthAmericaFlagsBtn = document.getElementById('start-southamerica-flags-btn');
  startOceaniaQuizBtn = document.getElementById('start-oceania-quiz-btn');
  startOceaniaFlagsBtn = document.getElementById('start-oceania-flags-btn');
  startWorldQuizBtn = document.getElementById('start-world-quiz-btn');
  startWorldFlagsBtn = document.getElementById('start-world-flags-btn');

  backHomeBtn = document.getElementById('back-home-btn');
  giveUpBtn = document.getElementById('give-up-btn');
  scoreEl = document.getElementById('score');
  timerEl = document.getElementById('timer');
  quizTitleEl = document.getElementById('quiz-title');
  quizOverlay = document.getElementById('quiz-overlay');
  startGameBtn = document.getElementById('start-game-btn');
  guessInput = document.getElementById('guess-input');
  guessForm = document.getElementById('guess-form');
  mapSvg = document.getElementById('map-svg');

  if (startEuropeQuizBtn) startEuropeQuizBtn.addEventListener('click', () => startQuiz('europe'));
  if (startEuropeFlagsBtn) startEuropeFlagsBtn.addEventListener('click', () => startQuiz('europe_flags'));
  if (startUsQuizBtn) startUsQuizBtn.addEventListener('click', () => startQuiz('us_states'));
  if (startAfricaQuizBtn) startAfricaQuizBtn.addEventListener('click', () => startQuiz('africa'));
  if (startAfricaFlagsBtn) startAfricaFlagsBtn.addEventListener('click', () => startQuiz('africa_flags'));
  if (startAsiaQuizBtn) startAsiaQuizBtn.addEventListener('click', () => startQuiz('asia'));
  if (startAsiaFlagsBtn) startAsiaFlagsBtn.addEventListener('click', () => startQuiz('asia_flags'));
  if (startNorthAmericaQuizBtn) startNorthAmericaQuizBtn.addEventListener('click', () => startQuiz('north_america'));
  if (startNorthAmericaFlagsBtn) startNorthAmericaFlagsBtn.addEventListener('click', () => startQuiz('north_america_flags'));
  if (startSouthAmericaQuizBtn) startSouthAmericaQuizBtn.addEventListener('click', () => startQuiz('south_america'));
  if (startSouthAmericaFlagsBtn) startSouthAmericaFlagsBtn.addEventListener('click', () => startQuiz('south_america_flags'));
  if (startOceaniaQuizBtn) startOceaniaQuizBtn.addEventListener('click', () => startQuiz('oceania'));
  if (startOceaniaFlagsBtn) startOceaniaFlagsBtn.addEventListener('click', () => startQuiz('oceania_flags'));
  if (startWorldQuizBtn) startWorldQuizBtn.addEventListener('click', () => startQuiz('world_196'));
  if (startWorldFlagsBtn) startWorldFlagsBtn.addEventListener('click', () => startQuiz('world_flags'));
  if (backHomeBtn) backHomeBtn.addEventListener('click', stopQuiz);
  if (giveUpBtn) giveUpBtn.addEventListener('click', handleGiveUp);
  if (startGameBtn) startGameBtn.addEventListener('click', beginQuiz);

  // Inject a Test Quiz button for the user (temporary for testing)
  const homeContent = document.querySelector('.home-content');
  if (homeContent) {
    const testBtn = document.createElement('button');
    testBtn.id = "start-test-quiz-btn";
    testBtn.className = "primary-btn";
    testBtn.style.marginTop = "12px";
    testBtn.style.background = "#6366f1";
    testBtn.textContent = "Start Test Quiz (1 Answer)";
    testBtn.onclick = () => startQuiz("test");
    homeContent.appendChild(testBtn);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    showCustomDialog('Login failed: ' + error.message, "Login Error");
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
    showCustomDialog('Passwords do not match', "Sign Up Error");
    return;
  }

  // prepare metadata: include username if provided, else it will be empty
  const metadata = {};
  if (username) {
    metadata.username = username;
    metadata.display_name = username;
    metadata.full_name = username;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  if (error) {
    showCustomDialog('Sign up failed: ' + error.message, "Sign Up Error");
  } else {
    showCustomDialog('Success! Check your email for a confirmation link (if enabled in project).', "Success");
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
function getLevelInfo(totalXp) {
  let level = 1;
  let xpLeft = totalXp;
  let req = 100;

  while (xpLeft >= req) {
    xpLeft -= req;
    level++;
    req += 50;
  }
  return { level, xpInLevel: xpLeft, xpRequired: req };
}

function updateRankDisplay() {
  const totalXp = currentUser?.user_metadata?.total_xp || 0;
  const info = getLevelInfo(totalXp);
  const pct = (info.xpInLevel / info.xpRequired) * 100;

  // Update Main Menu (Home Screen)
  const homeLevelEl = document.getElementById('home-user-level');
  const homeBarFill = document.getElementById('home-xp-bar-fill');
  const homeXpInfo = document.getElementById('home-xp-info');

  if (homeLevelEl) homeLevelEl.textContent = info.level;
  if (homeBarFill) homeBarFill.style.width = `${pct}%`;
  if (homeXpInfo) homeXpInfo.textContent = `${info.xpInLevel} / ${info.xpRequired} XP`;

  // Update Quiz Screen Header
  const qLevelEl = document.getElementById('quiz-user-level');
  const qBarFill = document.getElementById('quiz-xp-bar-fill');

  if (qLevelEl) qLevelEl.textContent = info.level;
  if (qBarFill) qBarFill.style.width = `${pct}%`;
}

function setLoggedIn(user) {
  currentUser = user;
  const meta = user.user_metadata || {};

  // AGGRESSIVE NAME RESOLUTION: Ensure email never appears if a name exists
  const rawName = meta.display_name || meta.username || meta.full_name || meta.name;
  const displayName = (rawName && String(rawName).trim() !== "") ? String(rawName).trim() : user.email;

  console.log("LOGIN DETECTED:", { email: user.email, resolvedName: displayName });

  if (loginStatus) {
    const titleHtml = renderTitleBadge(meta.selected_title || "none", getLevelInfo(meta.total_xp || 0).level);
    loginStatus.innerHTML = `Welcome, <span style="color: #f59e0b; font-weight: 800;">${displayName}</span>! ${titleHtml}`;
  }
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'none';
  if (showSignupLink) showSignupLink.style.display = 'none';
  if (loggedInMenu) loggedInMenu.style.display = 'flex';

  updateRankDisplay();

  const usernameInput = document.getElementById('settings-username');
  if (usernameInput) {
    usernameInput.value = (rawName && String(rawName).trim() !== "") ? String(rawName).trim() : "";
  }
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

  // Popuplate Title choices
  const titleSelect = document.getElementById('settings-title');
  if (titleSelect && currentUser) {
    const currentXp = currentUser.user_metadata?.total_xp || 0;
    const info = getLevelInfo(currentXp);
    const savedTitle = currentUser.user_metadata?.selected_title || "none";

    titleSelect.innerHTML = "";
    TITLES.forEach(t => {
      const isLocked = info.level < t.level;
      const option = document.createElement('option');
      option.value = t.id;
      // For testing, make them all available as requested, but show level req
      option.textContent = t.name + (t.level > 0 ? ` (Lv ${t.level})` : "") + (isLocked ? " 🔒" : "");
      option.selected = (t.id === savedTitle);
      titleSelect.appendChild(option);
    });
  }
}

function closeSettings() {
  if (settingsModal) settingsModal.style.display = 'none';
  if (settingsForm) settingsForm.reset();
}

async function handleSettingsSubmit(e) {
  e.preventDefault();
  const newUsername = document.getElementById('settings-username').value.trim();
  const newPassword = document.getElementById('settings-new-password').value;
  const confirmPassword = document.getElementById('settings-confirm-password').value;
  const currentPassword = document.getElementById('settings-current-password').value;

  // STRICT CHECK: Password is ONLY required if setting a NEW password
  const isChangingPassword = newPassword && newPassword.trim() !== '';

  if (isChangingPassword && !currentPassword) {
    alert('Security Check: You must enter your Current Password to change your password settings.');
    return;
  }

  if (isChangingPassword && newPassword !== confirmPassword) {
    alert('The new passwords you entered do not match.');
    return;
  }

  try {
    // Only verify password if user is actually trying to change it
    if (isChangingPassword) {
      console.log("Verifying current password for password update...");
      const { error: reAuthError } = await supabaseClient.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
      });
      if (reAuthError) throw new Error('Incorrect current password. Please try again.');
    }

    // Prepare update object - always include current metadata to avoid wipes
    const updates = { data: { ...(currentUser.user_metadata || {}) } };

    if (newUsername !== undefined && newUsername !== '') {
      updates.data.display_name = newUsername;
      updates.data.full_name = newUsername;
      updates.data.username = newUsername;
    }

    const titleSelect = document.getElementById('settings-title');
    if (titleSelect) {
      updates.data.selected_title = titleSelect.value;
      console.log("Selected title for update:", titleSelect.value);
    }

    if (isChangingPassword) {
      updates.password = newPassword;
    }

    const { data: { user }, error: updateError } = await supabaseClient.auth.updateUser(updates);
    if (updateError) throw updateError;

    // LIVE UPDATE SYNC: Update all past records with the new name, title, AND level
    const finalTitle = updates.data.selected_title || "none";
    const finalName = (updates.data.display_name || updates.data.username || currentUser.email);
    const finalLevel = getLevelInfo(updates.data.total_xp || 0).level;

    console.log("SYCNING LIVE PROFILES:", { finalName, finalTitle, finalLevel });

    // This ensures past records on the leaderboard change to the CURRENT state
    await supabaseClient
      .from('quiz_results')
      .update({
        user_name: finalName,
        user_title: finalTitle,
        user_level: finalLevel
      })
      .eq('user_id', currentUser.id);

    setLoggedIn(user);
    showCustomDialog('Settings saved! Your leaderboard presence has been updated.', 'Success');
    closeSettings();
    updateRankDisplay();
    updateLeaderboard();
  } catch (error) {
    showCustomDialog('Update Failed: ' + error.message, 'Error');
  }
}

async function handleResetLevel() {
  if (!currentUser) return;

  const confirm1 = await showCustomDialog("Are you sure you want to reset your Level and XP? This cannot be undone.", "Careful!", true);
  if (!confirm1) return;

  const confirm2 = await showCustomDialog("LAST CHANCE: All progress will be lost. Your best scores stay. Continue?", "Final Warning", true);
  if (!confirm2) return;

  try {
    const { data: { user }, error } = await supabaseClient.auth.updateUser({
      data: { total_xp: 0, selected_title: "none" }
    });
    if (error) throw error;

    // SYNC RESET TO LEADERBOARD: Keep scores, but reset personal status to Lv 1
    const currentName = user.user_metadata.display_name || user.user_metadata.username || user.email;
    await supabaseClient
      .from('quiz_results')
      .update({
        user_level: 1,
        user_title: "none",
        user_name: currentName
      })
      .eq('user_id', currentUser.id);

    setLoggedIn(user);
    updateRankDisplay();
    updateLeaderboard();
    showCustomDialog("Character data reset successfully! You are now Level 1.", "Reset Complete");
    closeSettings();
  } catch (err) {
    showCustomDialog("Reset failed: " + err.message, "Error");
  }
}

document.addEventListener('DOMContentLoaded', initializeAuth);

const QUIZZES = {
  test: {
    id: "test",
    title: "Test Quiz (1 Country)",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "test quiz",
    mapBounds: {
      minLon: -172,
      maxLon: 178,
      minLat: -55,
      maxLat: 81
    },
    clickZoomFactor: 2.2,
    guessableCountries: ["Greenland"],
    aliases: { "Test": "Greenland", "g": "Greenland" }
  },
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
  europe_flags: {
    id: "europe_flags",
    type: "flags",
    title: "European Flags Quiz",
    notFoundLabel: "flag list",
    guessableCountries: [
      { name: "Albania", code: "al" }, { name: "Andorra", code: "ad" }, { name: "Austria", code: "at" },
      { name: "Belarus", code: "by" }, { name: "Belgium", code: "be" }, { name: "Bosnia and Herzegovina", code: "ba" },
      { name: "Bulgaria", code: "bg" }, { name: "Croatia", code: "hr" }, { name: "Czechia", code: "cz" },
      { name: "Denmark", code: "dk" }, { name: "Estonia", code: "ee" }, { name: "Finland", code: "fi" },
      { name: "France", code: "fr" }, { name: "Germany", code: "de" }, { name: "Greece", code: "gr" },
      { name: "Hungary", code: "hu" }, { name: "Iceland", code: "is" }, { name: "Ireland", code: "ie" },
      { name: "Italy", code: "it" }, { name: "Latvia", code: "lv" }, { name: "Liechtenstein", code: "li" },
      { name: "Lithuania", code: "lt" }, { name: "Luxembourg", code: "lu" }, { name: "Malta", code: "mt" },
      { name: "Moldova", code: "md" }, { name: "Monaco", code: "mc" }, { name: "Montenegro", code: "me" },
      { name: "Netherlands", code: "nl" }, { name: "North Macedonia", code: "mk" }, { name: "Norway", code: "no" },
      { name: "Poland", code: "pl" }, { name: "Portugal", code: "pt" }, { name: "Romania", code: "ro" },
      { name: "Russia", code: "ru" }, { name: "San Marino", code: "sm" }, { name: "Serbia", code: "rs" },
      { name: "Slovakia", code: "sk" }, { name: "Slovenia", code: "si" }, { name: "Spain", code: "es" },
      { name: "Sweden", code: "se" }, { name: "Switzerland", code: "ch" }, { name: "Ukraine", code: "ua" },
      { name: "United Kingdom", code: "gb" }, { name: "Vatican City", code: "va" }
    ],
    aliases: {
      "uk": "United Kingdom", "britain": "United Kingdom", "england": "United Kingdom",
      "bosnia": "Bosnia and Herzegovina", "macedonia": "North Macedonia", "vatican": "Vatican City",
      "czech": "Czechia", "czech republic": "Czechia"
    }
  },
  africa_flags: {
    id: "africa_flags",
    type: "flags",
    title: "African Flags Quiz",
    notFoundLabel: "flag list",
    guessableCountries: [
      { name: "Algeria", code: "dz" }, { name: "Angola", code: "ao" }, { name: "Benin", code: "bj" },
      { name: "Botswana", code: "bw" }, { name: "Burkina Faso", code: "bf" }, { name: "Burundi", code: "bi" },
      { name: "Cabo Verde", code: "cv" }, { name: "Cameroon", code: "cm" }, { name: "Central African Republic", code: "cf" },
      { name: "Chad", code: "td" }, { name: "Comoros", code: "km" }, { name: "Democratic Republic of the Congo", code: "cd" },
      { name: "Republic of the Congo", code: "cg" }, { name: "Djibouti", code: "dj" }, { name: "Egypt", code: "eg" },
      { name: "Equatorial Guinea", code: "gq" }, { name: "Eritrea", code: "er" }, { name: "Eswatini", code: "sz" },
      { name: "Ethiopia", code: "et" }, { name: "Gabon", code: "ga" }, { name: "Gambia", code: "gm" },
      { name: "Ghana", code: "gh" }, { name: "Guinea", code: "gn" }, { name: "Guinea-Bissau", code: "gw" },
      { name: "Ivory Coast", code: "ci" }, { name: "Kenya", code: "ke" }, { name: "Lesotho", code: "ls" },
      { name: "Liberia", code: "lr" }, { name: "Libya", code: "ly" }, { name: "Madagascar", code: "mg" },
      { name: "Malawi", code: "mw" }, { name: "Mali", code: "ml" }, { name: "Mauritania", code: "mr" },
      { name: "Mauritius", code: "mu" }, { name: "Morocco", code: "ma" }, { name: "Mozambique", code: "mz" },
      { name: "Namibia", code: "na" }, { name: "Niger", code: "ne" }, { name: "Nigeria", code: "ng" },
      { name: "Rwanda", code: "rw" }, { name: "Sao Tome and Principe", code: "st" }, { name: "Senegal", code: "sn" },
      { name: "Seychelles", code: "sc" }, { name: "Sierra Leone", code: "sl" }, { name: "Somalia", code: "so" },
      { name: "South Africa", code: "za" }, { name: "South Sudan", code: "ss" }, { name: "Sudan", code: "sd" },
      { name: "Togo", code: "tg" }, { name: "Tunisia", code: "tn" }, { name: "United Republic of Tanzania", code: "tz" },
      { name: "Uganda", code: "ug" }, { name: "Zambia", code: "zm" }, { name: "Zimbabwe", code: "zw" }
    ],
    aliases: {
      "congo": "republic of the congo", "drc": "democratic republic of the congo",
      "swaziland": "eswatini", "tanzania": "united republic of tanzania", "ivory coast": "ivory coast"
    }
  },
  asia_flags: {
    id: "asia_flags",
    type: "flags",
    title: "Asian Flags Quiz",
    notFoundLabel: "flag list",
    guessableCountries: [
      { name: "Afghanistan", code: "af" }, { name: "Armenia", code: "am" }, { name: "Azerbaijan", code: "az" },
      { name: "Bahrain", code: "bh" }, { name: "Bangladesh", code: "bd" }, { name: "Bhutan", code: "bt" },
      { name: "Brunei", code: "bn" }, { name: "Cambodia", code: "kh" }, { name: "China", code: "cn" },
      { name: "Cyprus", code: "cy" }, { name: "Georgia", code: "ge" }, { name: "India", code: "in" },
      { name: "Indonesia", code: "id" }, { name: "Iran", code: "ir" }, { name: "Iraq", code: "iq" },
      { name: "Israel", code: "il" }, { name: "Japan", code: "jp" }, { name: "Jordan", code: "jo" },
      { name: "Kazakhstan", code: "kz" }, { name: "Kuwait", code: "kw" }, { name: "Kyrgyzstan", code: "kg" },
      { name: "Laos", code: "la" }, { name: "Lebanon", code: "lb" }, { name: "Malaysia", code: "my" },
      { name: "Maldives", code: "mv" }, { name: "Mongolia", code: "mn" }, { name: "Myanmar", code: "mm" },
      { name: "Nepal", code: "np" }, { name: "North Korea", code: "kp" }, { name: "Oman", code: "om" },
      { name: "Pakistan", code: "pk" }, { name: "Philippines", code: "ph" }, { name: "Qatar", code: "qa" },
      { name: "Saudi Arabia", code: "sa" }, { name: "Singapore", code: "sg" }, { name: "South Korea", code: "kr" },
      { name: "Sri Lanka", code: "lk" }, { name: "Syria", code: "sy" }, { name: "Taiwan", code: "tw" },
      { name: "Tajikistan", code: "tj" }, { name: "Thailand", code: "th" }, { name: "East Timor", code: "tl" },
      { name: "Turkey", code: "tr" }, { name: "Turkmenistan", code: "tm" }, { name: "United Arab Emirates", code: "ae" },
      { name: "Uzbekistan", code: "uz" }, { name: "Vietnam", code: "vn" }, { name: "Yemen", code: "ye" }
    ],
    aliases: {
      "uae": "united arab emirates", "timor leste": "east timor", "burma": "myanmar"
    }
  },
  north_america_flags: {
    id: "north_america_flags",
    type: "flags",
    title: "North American Flags Quiz",
    notFoundLabel: "flag list",
    guessableCountries: [
      { name: "Antigua and Barbuda", code: "ag" }, { name: "Bahamas", code: "bs" }, { name: "Barbados", code: "bb" },
      { name: "Belize", code: "bz" }, { name: "Canada", code: "ca" }, { name: "Costa Rica", code: "cr" },
      { name: "Cuba", code: "cu" }, { name: "Dominica", code: "dm" }, { name: "Dominican Republic", code: "do" },
      { name: "El Salvador", code: "sv" }, { name: "Grenada", code: "gd" }, { name: "Guatemala", code: "gt" },
      { name: "Haiti", code: "ht" }, { name: "Honduras", code: "hn" }, { name: "Jamaica", code: "jm" },
      { name: "Mexico", code: "mx" }, { name: "Nicaragua", code: "ni" }, { name: "Panama", code: "pa" },
      { name: "Saint Kitts and Nevis", code: "kn" }, { name: "Saint Lucia", code: "lc" },
      { name: "Saint Vincent and the Grenadines", code: "vc" }, { name: "Trinidad and Tobago", code: "tt" },
      { name: "United States of America", code: "us" }
    ],
    aliases: {
      "usa": "united states of america", "us": "united states of america", "trinidad": "trinidad and tobago"
    }
  },
  south_america_flags: {
    id: "south_america_flags",
    type: "flags",
    title: "South American Flags Quiz",
    notFoundLabel: "flag list",
    guessableCountries: [
      { name: "Argentina", code: "ar" }, { name: "Bolivia", code: "bo" }, { name: "Brazil", code: "br" },
      { name: "Chile", code: "cl" }, { name: "Colombia", code: "co" }, { name: "Ecuador", code: "ec" },
      { name: "Guyana", code: "gy" }, { name: "Paraguay", code: "py" }, { name: "Peru", code: "pe" },
      { name: "Suriname", code: "sr" }, { name: "Uruguay", code: "uy" }, { name: "Venezuela", code: "ve" }
    ],
    aliases: {}
  },
  oceania_flags: {
    id: "oceania_flags",
    type: "flags",
    title: "Oceanian Flags Quiz",
    notFoundLabel: "flag list",
    guessableCountries: [
      { name: "Australia", code: "au" }, { name: "Fiji", code: "fj" }, { name: "Kiribati", code: "ki" },
      { name: "Federated States of Micronesia", code: "fm" }, { name: "Marshall Islands", code: "mh" },
      { name: "Nauru", code: "nr" }, { name: "New Zealand", code: "nz" }, { name: "Palau", code: "pw" },
      { name: "Papua New Guinea", code: "pg" }, { name: "Samoa", code: "ws" }, { name: "Solomon Islands", code: "sb" },
      { name: "Tonga", code: "to" }, { name: "Tuvalu", code: "tv" }, { name: "Vanuatu", code: "vu" }
    ],
    aliases: {
      "micronesia": "federated states of micronesia", "png": "papua new guinea"
    }
  },
  world_flags: {
    id: "world_flags",
    type: "flags",
    title: "196 World Flags Quiz",
    notFoundLabel: "flag list",
    guessableCountries: [
      { name: "Afghanistan", code: "af" }, { name: "Albania", code: "al" }, { name: "Algeria", code: "dz" }, { name: "Andorra", code: "ad" }, { name: "Angola", code: "ao" }, { name: "Antigua and Barbuda", code: "ag" }, { name: "Argentina", code: "ar" }, { name: "Armenia", code: "am" }, { name: "Australia", code: "au" }, { name: "Austria", code: "at" }, { name: "Azerbaijan", code: "az" }, { name: "Bahamas", code: "bs" }, { name: "Bahrain", code: "bh" }, { name: "Bangladesh", code: "bd" }, { name: "Barbados", code: "bb" }, { name: "Belarus", code: "by" }, { name: "Belgium", code: "be" }, { name: "Belize", code: "bz" }, { name: "Benin", code: "bj" }, { name: "Bhutan", code: "bt" }, { name: "Bolivia", code: "bo" }, { name: "Bosnia and Herzegovina", code: "ba" }, { name: "Botswana", code: "bw" }, { name: "Brazil", code: "br" }, { name: "Brunei", code: "bn" }, { name: "Bulgaria", code: "bg" }, { name: "Burkina Faso", code: "bf" }, { name: "Burundi", code: "bi" }, { name: "Cambodia", code: "kh" }, { name: "Cameroon", code: "cm" }, { name: "Canada", code: "ca" }, { name: "Cabo Verde", code: "cv" }, { name: "Central African Republic", code: "cf" }, { name: "Chad", code: "td" }, { name: "Chile", code: "cl" }, { name: "China", code: "cn" }, { name: "Colombia", code: "co" }, { name: "Comoros", code: "km" }, { name: "Democratic Republic of the Congo", code: "cd" }, { name: "Republic of the Congo", code: "cg" }, { name: "Costa Rica", code: "cr" }, { name: "Ivory Coast", code: "ci" }, { name: "Croatia", code: "hr" }, { name: "Cuba", code: "cu" }, { name: "Cyprus", code: "cy" }, { name: "Czechia", code: "cz" }, { name: "Denmark", code: "dk" }, { name: "Djibouti", code: "dj" }, { name: "Dominica", code: "dm" }, { name: "Dominican Republic", code: "do" }, { name: "Ecuador", code: "ec" }, { name: "Egypt", code: "eg" }, { name: "El Salvador", code: "sv" }, { name: "Equatorial Guinea", code: "gq" }, { name: "Eritrea", code: "er" }, { name: "Estonia", code: "ee" }, { name: "Eswatini", code: "sz" }, { name: "Ethiopia", code: "et" }, { name: "Fiji", code: "fj" }, { name: "Finland", code: "fi" }, { name: "France", code: "fr" }, { name: "Gabon", code: "ga" }, { name: "Gambia", code: "gm" }, { name: "Georgia", code: "ge" }, { name: "Germany", code: "de" }, { name: "Ghana", code: "gh" }, { name: "Greece", code: "gr" }, { name: "Grenada", code: "gd" }, { name: "Guatemala", code: "gt" }, { name: "Guinea", code: "gn" }, { name: "Guinea-Bissau", code: "gw" }, { name: "Guyana", code: "gy" }, { name: "Haiti", code: "ht" }, { name: "Honduras", code: "hn" }, { name: "Hungary", code: "hu" }, { name: "Iceland", code: "is" }, { name: "India", code: "in" }, { name: "Indonesia", code: "id" }, { name: "Iran", code: "ir" }, { name: "Iraq", code: "iq" }, { name: "Ireland", code: "ie" }, { name: "Israel", code: "il" }, { name: "Italy", code: "it" }, { name: "Jamaica", code: "jm" }, { name: "Japan", code: "jp" }, { name: "Jordan", code: "jo" }, { name: "Kazakhstan", code: "kz" }, { name: "Kenya", code: "ke" }, { name: "Kiribati", code: "ki" }, { name: "Kuwait", code: "kw" }, { name: "Kyrgyzstan", code: "kg" }, { name: "Laos", code: "la" }, { name: "Latvia", code: "lv" }, { name: "Lebanon", code: "lb" }, { name: "Lesotho", code: "ls" }, { name: "Liberia", code: "lr" }, { name: "Libya", code: "ly" }, { name: "Liechtenstein", code: "li" }, { name: "Lithuania", code: "lt" }, { name: "Luxembourg", code: "lu" }, { name: "Madagascar", code: "mg" }, { name: "Malawi", code: "mw" }, { name: "Malaysia", code: "my" }, { name: "Maldives", code: "mv" }, { name: "Mali", code: "ml" }, { name: "Malta", code: "mt" }, { name: "Marshall Islands", code: "mh" }, { name: "Mauritania", code: "mr" }, { name: "Mauritius", code: "mu" }, { name: "Mexico", code: "mx" }, { name: "Federated States of Micronesia", code: "fm" }, { name: "Moldova", code: "md" }, { name: "Monaco", code: "mc" }, { name: "Mongolia", code: "mn" }, { name: "Montenegro", code: "me" }, { name: "Morocco", code: "ma" }, { name: "Mozambique", code: "mz" }, { name: "Myanmar", code: "mm" }, { name: "Namibia", code: "na" }, { name: "Nauru", code: "nr" }, { name: "Nepal", code: "np" }, { name: "Netherlands", code: "nl" }, { name: "New Zealand", code: "nz" }, { name: "Nicaragua", code: "ni" }, { name: "Niger", code: "ne" }, { name: "Nigeria", code: "ng" }, { name: "North Korea", code: "kp" }, { name: "North Macedonia", code: "mk" }, { name: "Norway", code: "no" }, { name: "Oman", code: "om" }, { name: "Pakistan", code: "pk" }, { name: "Palau", code: "pw" }, { name: "Panama", code: "pa" }, { name: "Papua New Guinea", code: "pg" }, { name: "Paraguay", code: "py" }, { name: "Peru", code: "pe" }, { name: "Philippines", code: "ph" }, { name: "Poland", code: "pl" }, { name: "Portugal", code: "pt" }, { name: "Qatar", code: "qa" }, { name: "Romania", code: "ro" }, { name: "Russia", code: "ru" }, { name: "Rwanda", code: "rw" }, { name: "Saint Kitts and Nevis", code: "kn" }, { name: "Saint Lucia", code: "lc" }, { name: "Saint Vincent and the Grenadines", code: "vc" }, { name: "Samoa", code: "ws" }, { name: "San Marino", code: "sm" }, { name: "Sao Tome and Principe", code: "st" }, { name: "Saudi Arabia", code: "sa" }, { name: "Senegal", code: "sn" }, { name: "Serbia", code: "rs" }, { name: "Seychelles", code: "sc" }, { name: "Sierra Leone", code: "sl" }, { name: "Singapore", code: "sg" }, { name: "Slovakia", code: "sk" }, { name: "Slovenia", code: "si" }, { name: "Solomon Islands", code: "sb" }, { name: "Somalia", code: "so" }, { name: "South Africa", code: "za" }, { name: "South Korea", code: "kr" }, { name: "South Sudan", code: "ss" }, { name: "Spain", code: "es" }, { name: "Sri Lanka", code: "lk" }, { name: "Sudan", code: "sd" }, { name: "Suriname", code: "sr" }, { name: "Sweden", code: "se" }, { name: "Switzerland", code: "ch" }, { name: "Syria", code: "sy" }, { name: "Taiwan", code: "tw" }, { name: "Tajikistan", code: "tj" }, { name: "United Republic of Tanzania", code: "tz" }, { name: "Thailand", code: "th" }, { name: "East Timor", code: "tl" }, { name: "Togo", code: "tg" }, { name: "Tonga", code: "to" }, { name: "Trinidad and Tobago", code: "tt" }, { name: "Tunisia", code: "tn" }, { name: "Turkey", code: "tr" }, { name: "Turkmenistan", code: "tm" }, { name: "Tuvalu", code: "tv" }, { name: "Uganda", code: "ug" }, { name: "Ukraine", code: "ua" }, { name: "United Arab Emirates", code: "ae" }, { name: "United Kingdom", code: "gb" }, { name: "United States of America", code: "us" }, { name: "Uruguay", code: "uy" }, { name: "Uzbekistan", code: "uz" }, { name: "Vanuatu", code: "vu" }, { name: "Vatican City", code: "va" }, { name: "Venezuela", code: "ve" }, { name: "Vietnam", code: "vn" }, { name: "Yemen", code: "ye" }, { name: "Zambia", code: "zm" }, { name: "Zimbabwe", code: "zw" }
    ],
    aliases: {
      "uk": "united kingdom", "usa": "united states of america", "us": "united states of america",
      "uae": "united arab emirates", "drc": "democratic republic of the congo", "congo": "republic of the congo"
    }
  },
  world_196: {
    id: "world_196",
    title: "196 Countries of the World",
    dataWindowKey: "WORLD_GEOJSON",
    dataUrl: "./world.geojson",
    featureNameKeys: ["name", "ADMIN", "NAME"],
    notFoundLabel: "world quiz",
    mapBounds: {
      minLon: -172,
      maxLon: 178,
      minLat: -55,
      maxLat: 81
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
      "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic",
      "Chad", "Comoros", "Democratic Republic of the Congo", "Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini",
      "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya",
      "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
      "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Togo",
      "Tunisia", "United Republic of Tanzania", "Uganda", "Zambia", "Zimbabwe"
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
      "madagascar", "comoros", "mauritius", "seychelles", "sao tome and principe", "cabo verde"
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
      "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Cyprus", "Georgia",
      "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon",
      "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Philippines", "Qatar", "Saudi Arabia",
      "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "East Timor", "Turkey", "Turkmenistan",
      "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"
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
      "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica", "Cuba", "Dominica", "Dominican Republic",
      "El Salvador", "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama",
      "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States of America"
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
      "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"
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
      "Australia", "Fiji", "Kiribati", "Federated States of Micronesia", "Marshall Islands", "Nauru", "New Zealand",
      "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"
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
startEuropeQuizBtn = document.getElementById("start-europe-quiz-btn");
startUsQuizBtn = document.getElementById("start-us-quiz-btn");
startAfricaQuizBtn = document.getElementById("start-africa-quiz-btn");
startAsiaQuizBtn = document.getElementById("start-asia-quiz-btn");
startNorthAmericaQuizBtn = document.getElementById("start-northamerica-quiz-btn");
startSouthAmericaQuizBtn = document.getElementById("start-southamerica-quiz-btn");
startOceaniaQuizBtn = document.getElementById("start-oceania-quiz-btn");
startWorldQuizBtn = document.getElementById("start-world-quiz-btn");
backHomeBtn = document.getElementById("back-home-btn");
guessForm = document.getElementById("guess-form");
guessInput = document.getElementById("guess-input");
feedback = document.getElementById("feedback");
scoreEl = document.getElementById("score");
timerEl = document.getElementById("timer");
mapSvg = document.getElementById("map-svg");
quizTitleEl = document.getElementById("quiz-title");
zoomInBtn = document.getElementById("zoom-in-btn");
zoomOutBtn = document.getElementById("zoom-out-btn");
pbDisplayEl = document.getElementById("personal-best-display");
giveUpBtn = document.getElementById("give-up-btn");
quizOverlay = document.getElementById("quiz-overlay");
startGameBtn = document.getElementById("start-game-btn");

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
  activeFlagIndex: 0, // NEW: for cycling through flag quizzes
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
  isZoomedIn: false,
  personalBest: { score: 0, timeMs: 0 }
};

function updatePBDisplay() {
  if (!pbDisplayEl) return;
  const { score, timeMs } = state.personalBest;
  const total = state.countries.length;

  if (score === 0) {
    pbDisplayEl.textContent = "PB: --";
  } else if (score === total && total > 0 && timeMs > 0) {
    pbDisplayEl.textContent = `PB: ${formatTime(timeMs)}`;
  } else {
    pbDisplayEl.textContent = `PB: ${score}/${total}`;
  }
}

async function savePB() {
  if (!currentUser) return;

  const currentScore = state.guessed.size;
  const currentTime = state.elapsedMs;
  const total = state.countries.length;
  const oldPB = state.personalBest;

  // Decide if this is a new PB
  let isBetter = false;
  if (currentScore > oldPB.score) {
    isBetter = true;
  } else if (currentScore === total && total > 0) {
    if (oldPB.score < total || oldPB.timeMs === 0 || currentTime < oldPB.timeMs) {
      isBetter = true;
    }
  }

  // Always save to the new quiz_results TABLE for the leaderboard
  try {
    const meta = currentUser.user_metadata || {};
    // ALWAYS use current profile data
    const rawName = meta.display_name || meta.username || meta.full_name || meta.name;
    const dName = (rawName && String(rawName).trim() !== "") ? String(rawName).trim() : currentUser.email;

    const dLevelInfo = getLevelInfo(meta.total_xp || 0);
    const dLevel = dLevelInfo.level;

    let dTitle = meta.selected_title || "none";
    if (dTitle === "none") {
      const best = [...TITLES].reverse().find(t => dLevel >= t.level);
      dTitle = best ? best.id : "none";
    }

    console.log("Saving new record with CURRENT status:", { dName, dTitle, dLevel });

    const { error: insertError } = await supabaseClient
      .from('quiz_results')
      .insert([
        {
          user_id: currentUser.id,
          user_name: dName,
          user_title: dTitle,
          user_level: dLevel,
          quiz_id: state.activeQuizId,
          score: currentScore,
          total_score: total,
          time_ms: currentTime
        }
      ]);

    // If that fails (maybe column missing), try without level/title
    if (insertError) {
      console.warn("Retrying save without newer columns...");
      await supabaseClient
        .from('quiz_results')
        .insert([
          {
            user_id: currentUser.id,
            user_name: dName,
            quiz_id: state.activeQuizId,
            score: currentScore,
            total_score: total,
            time_ms: currentTime
          }
        ]);
    }
    if (insertError) {
      console.error("LEADERBOARD SAVE ERROR:", insertError.message, insertError.details);
    } else {
      console.log("LEADERBOARD SAVE SUCCESS");
    }

    // XP AWARDING LOGIC
    if (total > 0) {
      const xpGained = Math.floor((currentScore / total) * 100);
      const oldTotalXp = meta.total_xp || 0;
      const newTotalXp = oldTotalXp + xpGained;

      const oldLevelInfo = getLevelInfo(oldTotalXp);
      const newLevelInfo = getLevelInfo(newTotalXp);

      console.log(`XP Awarded: ${xpGained}. New Total: ${newTotalXp}`);

      const { data: updatedData, error: xpError } = await supabaseClient.auth.updateUser({
        data: { total_xp: newTotalXp }
      });

      if (xpError) console.error("Error updating XP:", xpError.message);
      else if (updatedData.user) {
        currentUser = updatedData.user;
        updateRankDisplay();

        // LEVEL UP CELEBRATION: Show for EVERY level increase
        if (newLevelInfo.level > oldLevelInfo.level) {
          console.log(`CELEBRATION: Level ${oldLevelInfo.level} -> ${newLevelInfo.level}`);

          // Identify any newly unlocked titles in the jump
          const newTitles = TITLES.filter(t =>
            t.level > oldLevelInfo.level &&
            t.level <= newLevelInfo.level &&
            t.id !== "none"
          );

          if (newTitles.length > 0) {
            console.log("TITLES UNLOCKED:", newTitles.map(t => t.name));
          }

          showLevelUpModal(newLevelInfo.level, newTitles);

          // Force update past leaderboard records with the NEW live level
          await supabaseClient
            .from('quiz_results')
            .update({ user_level: newLevelInfo.level })
            .eq('user_id', currentUser.id);
        }
      }
    }
  } catch (e) {
    console.error("Supabase insert error:", e);
  }

  // Update personalBest metadata for local UI convenience
  if (isBetter) {
    const newPB = { score: currentScore, timeMs: (currentScore === total ? currentTime : 0) };
    state.personalBest = newPB;
    updatePBDisplay();

    const oldRecords = currentUser.user_metadata?.quiz_records || {};
    const newRecords = { ...oldRecords, [state.activeQuizId]: newPB };

    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        data: { quiz_records: newRecords }
      });
      if (error) console.error("Error saving metadata PB:", error.message);
      else if (data.user) currentUser = data.user;
    } catch (e) {
      console.error("Supabase metadata update error:", e);
    }
  }
}

async function updateLeaderboard() {
  if (!state.activeQuizId) return;
  const topScores = await fetchLeaderboard(state.activeQuizId);
  renderLeaderboard(topScores);
}

async function fetchLeaderboard(quizId) {
  try {
    // Show loading state
    const list = document.getElementById("leaderboard-list");
    if (list) list.innerHTML = `<li class="leader-empty">Loading scores...</li>`;

    // Fetch up to 100 rows to find unique users and local rank
    let { data, error } = await supabaseClient
      .from('quiz_results')
      .select('user_id, user_name, user_title, user_level, score, total_score, time_ms')
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .order('time_ms', { ascending: true })
      .limit(100);

    if (error) {
      console.warn("Extended fetch failed, trying fallback...");
      const fallback = await supabaseClient
        .from('quiz_results')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('time_ms', { ascending: true })
        .limit(100);

      if (fallback.error) throw fallback.error;
      return fallback.data;
    }
    return data;
  } catch (e) {
    console.error("Leaderboard fetch error:", e);
    return [];
  }
}

function renderLeaderboard(allData) {
  const container = document.getElementById("leaderboard-container");
  const list = document.getElementById("leaderboard-list");
  if (!container || !list) return;

  list.innerHTML = "";
  if (!allData || allData.length === 0) {
    list.innerHTML = `<li class="leader-empty">No results found yet. Be the first!</li>`;
    return;
  }

  // Deduplication: One record per user (their absolute best)
  const uniqueUsers = [];
  const seenIds = new Set();

  let userRank = -1;
  let userEntry = null;

  for (let i = 0; i < allData.length; i++) {
    const item = allData[i];
    if (!item.user_id) continue;

    if (!seenIds.has(item.user_id)) {
      seenIds.add(item.user_id);
      uniqueUsers.push(item);

      // If this is the current user, record their rank among unique bests
      if (currentUser && item.user_id === currentUser.id && userRank === -1) {
        userRank = uniqueUsers.length;
        userEntry = item;
      }
    }
  }

  // Take top 5 for the display
  const top5 = uniqueUsers.slice(0, 5);

  top5.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.className = `leader-item rank-${idx + 1}`;

    const isSelf = currentUser && entry.user_id === currentUser.id;
    if (isSelf) {
      li.classList.add("current-user-rank");
      li.style.borderLeft = "4px solid #f59e0b";
      li.style.background = "rgba(245, 158, 11, 0.1)";
    }

    const displayVal = (entry.score === entry.total_score && entry.total_score > 0)
      ? formatTime(entry.time_ms)
      : `${entry.score}/${entry.total_score}`;

    const titleHtml = renderTitleBadge(entry.user_title || "none", entry.user_level || 1);

    li.innerHTML = `
      <div class="leader-rank-info" style="display: flex; align-items: center; gap: 8px; flex: 1;">
        <span class="rank-pill">${idx + 1}</span>
        <div class="leader-name-row" style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
          ${renderLevelBadge(entry.user_level)}
          <span class="leader-name" style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${entry.user_name || "Guest"}
          </span>
          ${titleHtml}
        </div>
      </div>
      <span class="leader-val" style="font-weight: 800; color: #b45309; padding-left: 12px;">${displayVal}</span>
    `;
    list.appendChild(li);
  });

  // If user is logged in but not in Top 5, show their personal rank below
  if (currentUser && userRank > 5) {
    const divider = document.createElement("li");
    divider.className = "leader-divider";
    divider.innerHTML = "<span>•••</span>";
    list.appendChild(divider);

    const li = document.createElement("li");
    li.className = `leader-item current-user-rank`;
    li.style.borderLeft = "4px solid #f59e0b";
    li.style.marginTop = "4px";

    const displayVal = (userEntry.score === userEntry.total_score && userEntry.total_score > 0)
      ? formatTime(userEntry.time_ms)
      : `${userEntry.score}/${userEntry.total_score}`;

    li.innerHTML = `
      <div class="leader-rank-info">
        <span class="rank-pill">${userRank}</span>
        <div class="leader-name-row" style="display: flex; align-items: center; gap: 6px;">
          ${renderLevelBadge(userEntry.user_level)}
          <span class="leader-name" style="font-weight: 700;">(You) ${userEntry.user_name}</span>
          ${renderTitleBadge(userEntry.user_title || "none")}
        </div>
      </div>
      <span class="leader-val">${displayVal}</span>
    `;
    list.appendChild(li);
  }

  container.style.display = "block";
}

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
  const height = spanLon > 0 ? (width * (spanLat / spanLon)) * 1.45 : MAP_HEIGHT;
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

function buildFlagQuiz(quiz) {
  state.countries = [];
  state.lookup.clear();
  state.aliases.clear();
  state.guessed.clear();
  state.activeFlagIndex = 0;

  // Build the list based on flags
  quiz.guessableCountries.forEach((item, idx) => {
    const canonical = normalizeName(item.name);
    const country = {
      rawName: item.name,
      canonical,
      code: item.code,
      index: idx
    };
    state.countries.push(country);
    state.lookup.set(canonical, country);
  });

  // Load aliases
  if (quiz.aliases) {
    for (const [alias, canonical] of Object.entries(quiz.aliases)) {
      state.aliases.set(normalizeName(alias), normalizeName(canonical));
    }
  }

  scoreEl.textContent = `0 / ${state.countries.length}`;
  renderFlagGrid();
}

function renderFlagGrid() {
  const grid = document.getElementById("flag-grid");
  if (!grid) return;
  grid.innerHTML = "";

  state.countries.forEach((c, idx) => {
    const box = document.createElement("div");
    box.className = "flag-box";
    if (idx === state.activeFlagIndex) box.classList.add("active");
    if (state.guessed.has(c.canonical)) box.classList.add("guessed");

    box.innerHTML = `
      <div class="flag-img-container">
        <img src="https://flagcdn.com/w320/${c.code}.png" alt="Quiz Flag" loading="lazy">
      </div>
      <div class="flag-label">${state.guessed.has(c.canonical) ? c.rawName : ""}</div>
    `;
    grid.appendChild(box);
  });

  // ensure the active flag is visible
  const activeBox = grid.children[state.activeFlagIndex];
  if (activeBox) activeBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  // FLAG MODE LOGIC: Strict - only the active flag can be guessed
  if (state.activeQuiz.type === "flags") {
    const activeCountry = state.countries[state.activeFlagIndex];

    if (targetName !== activeCountry.canonical) {
      setMessage(`Incorrect! That is not the country for this flag.`, false);
      return;
    }

    state.guessed.add(targetName);

    // Find next un-guessed flag
    let nextIdx = state.activeFlagIndex;
    while (nextIdx < state.countries.length && state.guessed.has(state.countries[nextIdx].canonical)) {
      nextIdx++;
    }
    if (nextIdx >= state.countries.length) {
      // wrap around or find first un-guessed
      nextIdx = state.countries.findIndex(c => !state.guessed.has(c.canonical));
    }
    state.activeFlagIndex = nextIdx === -1 ? state.activeFlagIndex : nextIdx;

    renderFlagGrid();
  } else {
    // MAP MODE LOGIC
    state.guessed.add(targetName);
    for (const path of country.paths) {
      path.classList.add("guessed");
    }
    for (const halo of mapSvg.querySelectorAll(`[data-halo-for^="${targetName}:"]`)) {
      halo.classList.add("guessed");
    }
    renderCountryList();
  }

  setMessage(`Correct: ${country.rawName}`, true);
  scoreEl.textContent = `${state.guessed.size} / ${state.countries.length}`;

  if (state.guessed.size === state.countries.length) {
    endQuiz(true);
  }
}

function handleGiveUp() {
  if (state.mode !== "quiz" || state.guessed.size === state.countries.length) return;
  endQuiz(false);
}

async function endQuiz(win = false) {
  clearInterval(state.timerHandle);
  updateTimer();

  // reveal missed
  if (!win && state.activeQuiz.type !== "flags") { // Only reveal on map for now
    const missed = state.countries.filter(c => !state.guessed.has(c.canonical));
    for (const c of missed) {
      for (const p of c.paths) {
        p.style.fill = "#d44c4c";
      }
    }
  }

  const resultMsg = win ? `Quiz complete in ${formatTime(state.elapsedMs)}!` : `Quiz ended. You found ${state.guessed.size}/${state.countries.length}.`;
  setMessage(resultMsg, win);

  // ENSURE SAVE HAPPENS: Force data sync
  console.log("QUIZ END: Saving results...");
  await savePB();

  // Refresh leaderboard with fresh data
  console.log("QUIZ END: Refreshing leaderboard...");
  await updateLeaderboard();

  // Show Restart option
  quizOverlay.style.display = "flex";
  startGameBtn.textContent = "Play Again";
  guessForm.style.display = "none";
  giveUpBtn.style.display = "none";
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
  if (state.mode !== "quiz" || !state.activeQuiz) {
    return;
  }
  const raw = guessInput.value;
  const direct = normalizeName(raw);
  const targetName = state.aliases.get(direct) || direct;

  if (!targetName || !state.lookup.has(targetName) || state.guessed.has(targetName)) {
    return;
  }

  // If in Flag mode, only auto-submit if it's the CORRECT answer for the active slot
  if (state.activeQuiz.type === "flags") {
    const activeCountry = state.countries[state.activeFlagIndex];
    if (targetName !== activeCountry.canonical) {
      return;
    }
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

function buildFlagQuiz(quiz) {
  state.countries = [];
  state.lookup.clear();
  state.aliases.clear();
  state.guessed.clear();
  state.activeFlagIndex = 0;

  // Fisher-Yates shuffle for flags
  let flagList = [...quiz.guessableCountries];
  for (let i = flagList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flagList[i], flagList[j]] = [flagList[j], flagList[i]];
  }

  flagList.forEach((item, idx) => {
    const canonical = normalizeName(item.name);
    const country = {
      rawName: item.name,
      canonical,
      code: item.code,
      index: idx
    };
    state.countries.push(country);
    state.lookup.set(canonical, country);
  });

  // Load aliases
  if (quiz.aliases) {
    for (const [alias, canonical] of Object.entries(quiz.aliases)) {
      state.aliases.set(normalizeName(alias), normalizeName(canonical));
    }
  }

  scoreEl.textContent = `0 / ${state.countries.length}`;
  renderFlagGrid();
}

function renderFlagGrid() {
  const grid = document.getElementById("flag-grid");
  if (!grid) return;
  grid.innerHTML = "";

  state.countries.forEach((c, idx) => {
    const box = document.createElement("div");
    box.className = "flag-box";
    if (idx === state.activeFlagIndex) box.classList.add("active");
    if (state.guessed.has(c.canonical)) box.classList.add("guessed");

    box.innerHTML = `
      <div class="flag-img-container">
        <img src="https://flagcdn.com/w320/${c.code}.png" alt="Quiz Flag" loading="lazy">
      </div>
      <div class="flag-label">${state.guessed.has(c.canonical) ? c.rawName : ""}</div>
    `;
    grid.appendChild(box);
  });

  // ensure the active flag is visible
  const activeBox = grid.children[state.activeFlagIndex];
  if (activeBox) activeBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function startQuiz(quizId) {
  const q = QUIZZES[quizId];
  if (!q) return;

  state.activeQuizId = quizId;
  state.activeQuiz = q;
  state.activeFlagIndex = 0; // reset for new game

  // Toggle Visibility
  const mapWrap = document.getElementById("map-wrap");
  const flagGrid = document.getElementById("flag-grid");
  if (q.type === "flags") {
    if (mapWrap) mapWrap.style.display = "none";
    if (flagGrid) flagGrid.style.display = "grid";
  } else {
    if (mapWrap) mapWrap.style.display = "block";
    if (flagGrid) flagGrid.style.display = "none";
  }

  quizTitleEl.textContent = q.title;
  switchScreen("quiz");
  setMessage("Loading data...", true);

  try {
    if (q.type === "flags") {
      buildFlagQuiz(q);
    } else {
      const geojson = await loadGeoJsonByKeyOrUrl(q.dataWindowKey, q.dataUrl);
      let backgroundGeojson = null;
      if (q.background) {
        backgroundGeojson = await loadGeoJsonByKeyOrUrl(q.background.dataWindowKey, q.background.dataUrl);
      }

      // Merge global world aliases
      try {
        const worldAliases = (QUIZZES.world_196 && QUIZZES.world_196.aliases) || {};
        q.aliases = Object.assign({}, worldAliases, q.aliases || {});
      } catch (e) {
        console.warn("Could not merge world aliases.");
      }

      buildMap(geojson.features || [], (backgroundGeojson && backgroundGeojson.features) || []);
    }

    state.elapsedMs = 0;
    timerEl.textContent = "00:00";
    clearInterval(state.timerHandle);

    setMessage(q.type === "flags" ? "Flags ready. Click Start to begin!" : "Map ready. Click Start to begin!", true);

    const records = currentUser?.user_metadata?.quiz_records || {};
    state.personalBest = records[quizId] || { score: 0, timeMs: 0 };
    updatePBDisplay();
    updateLeaderboard();

    quizOverlay.style.display = "flex";
    startGameBtn.textContent = "Play Again";
    guessForm.style.display = "none";
    giveUpBtn.style.display = "none";
    timerEl.textContent = "00:00";
    state.elapsedMs = 0;
    guessInput.value = "";
  } catch (err) {
    console.error("Quiz Start Error:", err);
    showCustomDialog(`Failed to load quiz: ${err.message}`, "Error");
    setMessage(`Error: ${err.message}`);
  }
}

function beginQuiz() {
  // Clear any previous color reveal
  if (state.activeQuiz.type !== "flags") {
    for (const c of state.countries) {
      if (c.paths) {
        for (const p of c.paths) {
          p.style.fill = "";
          p.classList.remove("guessed");
        }
      }
    }
    for (const halo of mapSvg.querySelectorAll('.island-halo')) {
      halo.classList.remove("guessed");
    }
  } else {
    renderFlagGrid();
  }

  state.guessed.clear();
  renderCountryList();
  scoreEl.textContent = `0 / ${state.countries.length}`;

  state.startTime = Date.now();
  state.elapsedMs = 0;
  timerEl.textContent = "00:00";
  clearInterval(state.timerHandle);
  state.timerHandle = setInterval(updateTimer, 250);

  quizOverlay.style.display = "none";
  guessForm.style.display = "flex";
  giveUpBtn.style.display = "inline-block";
  guessInput.value = "";
  guessInput.focus();
  setMessage("Type names to begin!", true);
}

function stopQuiz() {
  clearInterval(state.timerHandle);
  switchScreen("home");
  setMessage("");
}

// Zoom controls
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

function showCustomDialog(message, title = "Notice", isConfirm = false) {
  return new Promise((resolve) => {
    if (!customDialogModal) {
      // fallback to native if modal not ready
      if (isConfirm) resolve(confirm(message));
      else { alert(message); resolve(true); }
      return;
    }

    dialogTitle.textContent = title;
    dialogMessage.textContent = message;
    dialogCancelBtn.style.display = isConfirm ? 'inline-block' : 'none';
    dialogOkBtn.textContent = isConfirm ? 'Yes' : 'OK';
    customDialogModal.style.display = 'flex';
    dialogResolve = resolve;
  });
}

function showLevelUpModal(newLevel, unlockedTitles = []) {
  if (!levelUpModal) return;

  if (levelUpLevelText) levelUpLevelText.textContent = newLevel;

  if (levelUpUnlockSection && levelUpTitleContainer) {
    if (unlockedTitles && unlockedTitles.length > 0) {
      console.log("Displaying Title Unlock Section");
      levelUpUnlockSection.style.display = 'block';
      levelUpTitleContainer.innerHTML = '';
      unlockedTitles.forEach(t => {
        levelUpTitleContainer.innerHTML += renderTitleBadge(t.id);
      });
    } else {
      console.log("Hiding Title Unlock Section (No titles in this level-up)");
      levelUpUnlockSection.style.display = 'none';
    }
  }

  levelUpModal.style.display = 'flex';
}

window.advanceTime = function advanceTime(ms) {
  if (state.mode !== "quiz") {
    return;
  }
  const increment = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  state.elapsedMs += increment;
  timerEl.textContent = formatTime(state.elapsedMs);
};
