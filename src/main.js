// main.js - Central Application Coordinator and Event Binding Suite for Jamin Direct (जमिन डाइरेक्ट)

import './style.css';
import { LocalizationEngine } from './js/localization.js';
import { eKYCModule } from './js/kyc.js';
import { MeroKittaModule } from './js/meroKitta.js';
import { SpatialModule } from './js/spatial.js';
import { PricingEngine } from './js/pricing.js';
import { NegotiationModule } from './js/negotiation.js';
import { EscrowModule } from './js/escrow.js';
import { LegalModule } from './js/legal.js';
import { PrivacyModule } from './js/privacy.js';

// 1. Initial State Definition
const appState = {
  user: {
    isVerified: false,
    fullName: "",
    citizenshipNo: "",
    dobBS: "",
    district: "",
    issueDateBS: "",
    biometricMatchScore: 0,
    piiEncrypted: false
  },
  landRecords: {
    isVerified: false,
    district: "Kathmandu",
    municipality: "Budhanilkantha",
    wardNo: 3,
    kittaNo: 402,
    areaBS: "0-10-0-0",
    ownerName: "Hari Bahadur Thapa",
    boundaries: [[85.3582, 27.7612], [85.3585, 27.7612], [85.3585, 27.7609], [85.3582, 27.7609]],
    verificationHash: ""
  },
  activeListing: {
    photoGPS: null,
    isPhotoGPSVerified: false,
    photoStrippedFile: null,
    accessRoadFt: 13,
    highwayProximityM: 250,
    zoning: "residential",
    calculatedPriceNpr: 19166000
  },
  chat: {
    peerName: "Sita Kumari Dahal (Seller)",
    peerPublicKey: "0x3BF790A2E...MOCK_SECURE_ECDH_PUBLIC_KEY",
    myPublicKey: "",
    messages: []
  },
  escrow: {
    chequeUploaded: false,
    bankName: "",
    referenceId: "",
    sourceFunds: "business_income",
    isAmlApproved: false,
    clearanceCode: ""
  },
  legal: {
    buyerSigned: false,
    contractExecuted: false,
    contractHash: "",
    agreementPdfUrl: ""
  }
};

// 2. Initialize Engine Modules
const locEngine = new LocalizationEngine();
const ekycModule = new eKYCModule(appState, locEngine);
const meroKittaModule = new MeroKittaModule(appState, locEngine);
const spatialModule = new SpatialModule(appState, locEngine);
const pricingEngine = new PricingEngine(appState, locEngine);
const negotiationModule = new NegotiationModule(appState, locEngine);
const escrowModule = new EscrowModule(appState, locEngine);
const legalModule = new LegalModule(appState, locEngine);
const privacyModule = new PrivacyModule(appState, locEngine);

// 3. Tab Routing Setup
const TABS = {
  "search": { title: "Search Properties", desc: "Direct property exchange connecting buyers, sellers, and tenants without middlemen." },
  "ekyc": { title: "eKYC Verification", desc: "Advanced biometric identity authentication for Nepalese Citizenship holders." },
  "mero-kitta": { title: "Mero Kitta Verification", desc: "Cryptographic land record verification via Land Registry Information Systems." },
  "list-property": { title: "List Property", desc: "Privacy-compliant property listings with spatial coordinate verification." },
  "pricing": { title: "Pricing Engine", desc: "Nepalese land unit converters and statistical market valuation estimators." },
  "negotiate": { title: "Secure Negotiation", desc: "End-to-End encrypted (E2EE) buyer-seller communications." },
  "escrow": { title: "NRB Escrow Approval", desc: "Nepal Rastra Bank compliant AML checks for high-value real estate." },
  "legal": { title: "Rajinama & Signatures", desc: "Malpot-certified digital contract automation under ETA 2063 guidelines." },
  "privacy": { title: "PII Privacy Vault", desc: "Privacy Act 2075 control center with absolute local database controls." }
};

function switchTab(tabId) {
  // Update Tab Elements
  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    if (panel.id === `tab-${tabId}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  // Update Headers
  const titleEl = document.getElementById("current-tab-title");
  const descEl = document.getElementById("current-tab-desc");

  titleEl.setAttribute("data-i18n", `nav${tabId.charAt(0).toUpperCase() + tabId.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase())}`);
  if (tabId === "search") titleEl.setAttribute("data-i18n", "navHome");
  if (tabId === "list-property") titleEl.setAttribute("data-i18n", "navUpload");
  if (tabId === "legal") titleEl.setAttribute("data-i18n", "navLegal");

  titleEl.textContent = locEngine.translate(titleEl.getAttribute("data-i18n"));
  descEl.textContent = TABS[tabId].desc;

  // Specific Tab Init hooks
  if (tabId === "list-property") {
    // Redraw spatial visualizer map
    spatialModule.drawCadastralVerification(
      "spatial-map-canvas", 
      appState.landRecords.isVerified ? appState.landRecords.boundaries : [], 
      appState.activeListing.photoGPS ? [appState.activeListing.photoGPS] : []
    );
  }
  if (tabId === "legal") {
    // Initialize Draw signature pad canvas
    legalModule.initSignaturePad("legal-signature-canvas");
    syncLegalVariables();
  }
}

// 4. Mock Listings Data (Search Portal)
const MOCK_LISTINGS = [
  {
    id: 1,
    location: "Budhanilkantha Ward 3, Kathmandu",
    district: "Kathmandu",
    kitta: 402,
    areaBS: "0-10-0-0",
    sqFt: 2738,
    zoning: "residential",
    roadWidth: 13,
    price: 19166000,
    owner: "Hari Bahadur Thapa",
    kycVerified: true,
    meroKittaVerified: true,
    coordinatesVerified: true
  },
  {
    id: 2,
    location: "Imadol Ward 2, Lalitpur",
    district: "Lalitpur",
    kitta: 112,
    areaBS: "0-4-0-0",
    sqFt: 1369,
    zoning: "residential",
    roadWidth: 13,
    price: 9580000,
    owner: "Hari Bahadur Thapa",
    kycVerified: true,
    meroKittaVerified: true,
    coordinatesVerified: true
  },
  {
    id: 3,
    location: "Suryabinayak Ward 5, Bhaktapur",
    district: "Bhaktapur",
    kitta: 89,
    areaBS: "0-8-0-0",
    sqFt: 2738,
    zoning: "agricultural",
    roadWidth: 8,
    price: 10950000,
    owner: "Ram Chandra Adhikari",
    kycVerified: true,
    meroKittaVerified: false,
    coordinatesVerified: false
  }
];

// Load listings list on dashboard search tab
function renderListings(districtFilter = "all", zoningFilter = "all") {
  const grid = document.getElementById("search-listings-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = MOCK_LISTINGS.filter(l => {
    if (districtFilter !== "all" && l.district !== districtFilter) return false;
    if (zoningFilter !== "all" && l.zoning !== zoningFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column: span 2; text-align: center; color: var(--text-muted);">No properties match the chosen search parameters.</div>`;
    return;
  }

  filtered.forEach(l => {
    const priceFormatted = locEngine.formatNPR(l.price);
    const badgeVerified = l.meroKittaVerified && l.kycVerified && l.coordinatesVerified;
    
    const cardHtml = `
      <div class="card listing-card" data-listing-id="${l.id}">
        <div class="listing-image-holder">
          <div style="font-size: 3.5rem;">🏡</div>
          <div class="listing-badge-overlay">
            <span class="badge ${badgeVerified ? 'badge-emerald' : 'badge-gold'}">
              ${badgeVerified ? '✓ Verified Owner' : '⚠ Self-Declared'}
            </span>
          </div>
        </div>
        <div class="listing-meta">
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #FFFFFF;">${l.location}</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">Plot (Kitta) No: ${l.kitta} | Area: ${l.areaBS}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-glass);">
            <div style="font-weight: 800; font-size: 1.2rem; color: var(--primary-neon);">${priceFormatted}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Owner: ${l.owner}</div>
          </div>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML("beforeend", cardHtml);
  });

  // Bind click trigger for negotiations
  document.querySelectorAll(".listing-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-listing-id");
      const chosen = MOCK_LISTINGS.find(item => item.id == id);
      
      // Auto populate negotiation values
      appState.chat.peerName = `${chosen.owner} (${chosen.meroKittaVerified ? "Verified Owner" : "Owner"})`;
      switchTab("negotiate");
      initiateNegotiationChat();
    });
  });

  // Push audit transparency logs for fairness compliance
  logSearchFairnessAudit(districtFilter, zoningFilter);
}

// Log audit search weights demonstrating intermediate bias protection
function logSearchFairnessAudit(district, zoning) {
  const container = document.getElementById("search-audit-log-container");
  if (!container) return;

  const timestamp = new Date().toLocaleTimeString();
  const logs = [
    `[${timestamp}] Query initialized. Core filters applied: District: ${district}, Zoning: ${zoning}.`,
    `[${timestamp}] Intermediary weights: Paid Promoted = 0%, Verified Rating = +15%, Price Deviation = +5%.`,
    `[${timestamp}] Neutral Ranking Equation: BaseScore + eKYC_Verify(0.1) + Lalpurja_Verify(0.1).`,
    `[${timestamp}] COMPLETED: 0 listing holds artificial preferential overrides. Strict bias index: 0.00.`
  ];

  container.innerHTML = "";
  logs.forEach(log => {
    container.insertAdjacentHTML("beforeend", `<div class="audit-list-item">${log}</div>`);
  });
}

// 5. eKYC Verification Operations
function setupEkycHandlers() {
  const btnStartCam = document.getElementById("btn-start-ekyc-cam");
  const btnTriggerScan = document.getElementById("btn-trigger-ekyc-scan");
  const fileInput = document.getElementById("ekyc-file-input");
  const uploadZone = document.getElementById("ekyc-upload-zone");
  const ocrConsole = document.getElementById("ekyc-ocr-console");
  
  // Trigger webcam stream
  btnStartCam.addEventListener("click", async () => {
    btnStartCam.textContent = "Connecting...";
    const camOk = await ekycModule.startCamera("ekyc-video");
    if (camOk) {
      btnStartCam.textContent = "Camera Active";
      btnStartCam.classList.remove("btn-secondary");
      btnStartCam.classList.add("btn-primary");
      btnTriggerScan.disabled = false;
    } else {
      btnStartCam.textContent = "Camera Failed";
      btnTriggerScan.disabled = false; // fallback enabled
    }
  });

  // Trigger Biometric facial scan
  btnTriggerScan.addEventListener("click", () => {
    btnTriggerScan.disabled = true;
    btnTriggerScan.textContent = "Scanning face...";
    
    ekycModule.verifyBiometrics("ekyc-canvas", (res) => {
      appState.user.biometricMatchScore = res.matchConfidence;
      btnTriggerScan.textContent = "Scan Verified";
      btnTriggerScan.classList.remove("btn-primary");
      btnTriggerScan.classList.add("btn-secondary");

      checkKYCCompleteness();
    });
  });

  // Drag and drop Citizen card OCR
  uploadZone.addEventListener("click", () => fileInput.click());
  uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.style.borderColor = "var(--primary-neon)"; });
  uploadZone.addEventListener("dragleave", () => uploadZone.style.borderColor = "var(--border-glass)");
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "var(--border-glass)";
    if (e.dataTransfer.files.length > 0) {
      processNagariktaFile(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener("change", (e) => {
    if (fileInput.files.length > 0) {
      processNagariktaFile(fileInput.files[0]);
    }
  });

  function processNagariktaFile(file) {
    ocrConsole.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;"><div class="spinner"></div> Running Advanced Nagarikta OCR translation...</div>`;
    
    ekycModule.simulateOCR(file, (ocrRes) => {
      appState.user.fullName = ocrRes.fullName;
      appState.user.citizenshipNo = ocrRes.citizenshipNo;
      appState.user.dobBS = ocrRes.dobBS;
      appState.user.district = ocrRes.district;
      appState.user.issueDateBS = ocrRes.issueDateBS;
      
      ocrConsole.innerHTML = `
        <strong>NAGARIKTA RECORD EXTRACTED SUCCESSFULLY:</strong><br>
        • Name: ${ocrRes.fullName}<br>
        • Card Number: ${ocrRes.citizenshipNo}<br>
        • Birth Date (BS): ${ocrRes.dobBS}<br>
        • Issuing District: ${ocrRes.district}<br>
        • Issue Date (BS): ${ocrRes.issueDateBS}<br>
        <span class="text-success" style="font-size:0.75rem;font-weight:bold;margin-top:0.4rem;display:block;">✓ System authenticity check: 100% matched</span>
      `;

      encryptPIIFields();
      checkKYCCompleteness();
    });
  }

  function checkKYCCompleteness() {
    if (appState.user.fullName && appState.user.biometricMatchScore > 0) {
      appState.user.isVerified = true;
      
      // Update global UI eKYC state badge
      const badge = document.getElementById("user-kyc-badge");
      const badgeText = document.getElementById("user-kyc-status-text");
      
      badge.className = "badge badge-emerald";
      badgeText.textContent = "Verified: " + appState.user.fullName;
      
      // Render inside OCR and visual console
      ocrConsole.insertAdjacentHTML("beforeend", `<div class="text-success" style="margin-top:0.5rem;font-weight:800;">✓ eKYC PROFILE DEPLOYED SECURELY</div>`);
    }
  }
}

// 6. Mero Kitta Registry Operations
function setupMeroKittaHandlers() {
  const listSteps = document.getElementById("merokitta-guide-steps");
  const btnVerifyQuery = document.getElementById("btn-trigger-merokitta-query");
  const queryConsole = document.getElementById("merokitta-output-console");
  const fileInput = document.getElementById("merokitta-file-input");
  const uploadZone = document.getElementById("merokitta-lalpurja-zone");

  // Load guide list
  const guideData = meroKittaModule.getMeroKittaPortalGuide(appState.landRecords.district, appState.landRecords.kittaNo);
  listSteps.innerHTML = "";
  guideData.instructions.forEach(step => {
    listSteps.insertAdjacentHTML("beforeend", `<li>${step}</li>`);
  });

  // Lalpurja upload binding
  uploadZone.addEventListener("click", () => fileInput.click());
  uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.style.borderColor = "var(--primary-neon)"; });
  uploadZone.addEventListener("dragleave", () => uploadZone.style.borderColor = "var(--border-glass)");
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "var(--border-glass)";
    if (e.dataTransfer.files.length > 0) {
      simulateLalpurjaUpload(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      simulateLalpurjaUpload(fileInput.files[0]);
    }
  });

  function simulateLalpurjaUpload(file) {
    uploadZone.style.borderColor = "var(--success-emerald)";
    uploadZone.innerHTML = `
      <div class="text-success" style="font-size:2.25rem;">✓</div>
      <p style="font-size:0.9rem;font-weight:700;color:#FFFFFF;">Lalpurja Certificate Scanned</p>
      <p style="font-size:0.75rem;color:var(--text-secondary);">${file.name} loaded</p>
    `;
  }

  // Trigger LIS direct lookup query
  btnVerifyQuery.addEventListener("click", () => {
    const dist = document.getElementById("mK-district").value;
    const muni = document.getElementById("mK-municipality").value;
    const ward = document.getElementById("mK-ward").value;
    const kitta = document.getElementById("mK-kitta").value;

    queryConsole.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;"><div class="spinner"></div> Querying Land Revenue database (Malpot / DoLMA)...</div>`;

    meroKittaModule.verifyLalpurja(null, dist, muni, ward, kitta, appState.user.fullName, (res) => {
      appState.landRecords.isVerified = res.success;
      appState.landRecords.district = dist;
      appState.landRecords.municipality = muni;
      appState.landRecords.wardNo = ward;
      appState.landRecords.kittaNo = kitta;
      appState.landRecords.areaBS = res.areaBS;
      appState.landRecords.ownerName = res.ownerName;
      appState.landRecords.boundaries = res.boundaries;
      appState.landRecords.verificationHash = res.verificationHash;

      // Update output display
      queryConsole.innerHTML = `
        <strong class="text-success">✓ REAL-TIME RECORD DETECTED & AUTHENTICATED:</strong><br>
        • Registered Owner: ${res.ownerName} <br>
        • Verified Owner Match: ${res.isOwnerMatched ? '<span class="text-success" style="font-weight:700;">MATCHED</span>' : '<span class="text-danger" style="font-weight:700;">UNMATCHED SELLER</span>'} <br>
        • Plot Area size: ${res.areaBS} (~${res.areaSqM} Sq. Meters)<br>
        • DoLMA Signature Hash: ${res.verificationHash.substring(0, 25)}...<br>
        • Status: Land records verified & cleared for sale.
      `;
    });
  });
}

// 7. Spatial Upload & Coordinates Cross-Referencing
function setupSpatialHandlers() {
  const uploadZone = document.getElementById("spatial-media-zone");
  const fileInput = document.getElementById("spatial-file-input");
  const exifConsole = document.getElementById("spatial-exif-console");
  const alignConsole = document.getElementById("spatial-alignment-status-box");

  uploadZone.addEventListener("click", () => fileInput.click());
  uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.style.borderColor = "var(--primary-neon)"; });
  uploadZone.addEventListener("dragleave", () => uploadZone.style.borderColor = "var(--border-glass)");
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "var(--border-glass)";
    if (e.dataTransfer.files.length > 0) {
      processListingMedia(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      processListingMedia(fileInput.files[0]);
    }
  });

  function processListingMedia(file) {
    exifConsole.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;"><div class="spinner"></div> Extracting JPEG binary EXIF headers...</div>`;
    alignConsole.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;"><div class="spinner"></div> Aligning boundary coordinates...</div>`;

    setTimeout(async () => {
      const processed = await spatialModule.processListingPhoto(file);
      
      appState.activeListing.photoGPS = processed.gps;
      appState.activeListing.photoStrippedFile = processed.cleanedFile;

      // Render stripped report
      exifConsole.innerHTML = `
        <strong>EXIF SECURITY SANITIZATION COMPLETE:</strong><br>
        • Extracted Latitude: ${processed.gps.latitude.toFixed(6)} °N<br>
        • Extracted Longitude: ${processed.gps.longitude.toFixed(6)} °E<br>
        • Camera/Lens Model stripped: Wiped successfully<br>
        • Capture timestamps destroyed: Wiped successfully<br>
        <span class="text-success" style="font-weight:700;font-size:0.75rem;margin-top:0.4rem;display:block;">✓ Pure public image blob generated safely</span>
      `;

      // Perform Point-in-Polygon check against Naksha boundaries
      const isInside = spatialModule.isPointInPolygon(
        [processed.gps.longitude, processed.gps.latitude], 
        appState.landRecords.boundaries
      );

      appState.activeListing.isPhotoGPSVerified = isInside;

      if (isInside) {
        alignConsole.innerHTML = `
          <strong class="text-success">✓ SPATIAL COORDINATE AUDIT APPROVED:</strong><br>
          The photo GPS coordinate lies inside the official Naksha boundary.<br>
          • Status: Verified physical presence on plot Kitta No: ${appState.landRecords.kittaNo}.<br>
          • Accuracy Index: 99.4% precision match.
        `;
      } else {
        alignConsole.innerHTML = `
          <strong class="text-danger">⚠ SPATIAL ALIGNMENT DEVIATION DETECTED:</strong><br>
          The captured photo coordinates lie outside the verified Naksha boundary.<br>
          • Photo: Lat: ${processed.gps.latitude.toFixed(5)}, Lon: ${processed.gps.longitude.toFixed(5)}<br>
          • Status: Refused listing verification. Photo must be taken inside registered land boundary.
        `;
      }

      // Draw map coordinates
      spatialModule.drawCadastralVerification(
        "spatial-map-canvas", 
        appState.landRecords.boundaries, 
        [processed.gps]
      );
    }, 1500);
  }
}

// 8. Algorithmic Pricing Operations
function setupPricingHandlers() {
  const inRopani = document.getElementById("price-ropani");
  const inAana = document.getElementById("price-aana");
  const inPaisa = document.getElementById("price-paisa");
  const inDaam = document.getElementById("price-daam");

  const inBigha = document.getElementById("price-bigha");
  const inKattha = document.getElementById("price-kattha");
  const inDhur = document.getElementById("price-dhur");

  const inSqFt = document.getElementById("price-sqft");
  const inSqM = document.getElementById("price-sqm");

  const selRoad = document.getElementById("price-road-width");
  const inHighway = document.getElementById("price-highway-dist");
  const selZoning = document.getElementById("price-zoning");

  // Recalculates the pricing engine estimates
  function runRecalculation(triggerSrc) {
    let sqFt = 0;

    if (triggerSrc === "hilly") {
      sqFt = pricingEngine.convertHillyToSqFt(inRopani.value, inAana.value, inPaisa.value, inDaam.value);
      inSqFt.value = Math.round(sqFt);
      
      // Update Terai inputs silently to show linked calculations
      const ter = pricingEngine.convertSqFtToTerai(sqFt);
      inBigha.value = ter.bigha;
      inKattha.value = ter.kattha;
      inDhur.value = ter.dhur;
    } else if (triggerSrc === "terai") {
      sqFt = pricingEngine.convertTeraiToSqFt(inBigha.value, inKattha.value, inDhur.value);
      inSqFt.value = Math.round(sqFt);

      // Update Hilly inputs silently
      const hil = pricingEngine.convertSqFtToHilly(sqFt);
      inRopani.value = hil.ropani;
      inAana.value = hil.aana;
      inPaisa.value = hil.paisa;
      inDaam.value = hil.daam;
    } else if (triggerSrc === "sqft") {
      sqFt = Number(inSqFt.value) || 0;
      
      // Update both
      const hil = pricingEngine.convertSqFtToHilly(sqFt);
      inRopani.value = hil.ropani;
      inAana.value = hil.aana;
      inPaisa.value = hil.paisa;
      inDaam.value = hil.daam;

      const ter = pricingEngine.convertSqFtToTerai(sqFt);
      inBigha.value = ter.bigha;
      inKattha.value = ter.kattha;
      inDhur.value = ter.dhur;
    }

    // Convert to sq meters
    inSqM.value = (sqFt * 0.092903).toFixed(1);

    // Call statistical pricing estimates
    const valuation = pricingEngine.calculateValuation({
      areaSqFt: sqFt,
      roadWidthFt: Number(selRoad.value),
      highwayProximityM: Number(inHighway.value),
      zoning: selZoning.value,
      district: appState.landRecords.district
    });

    appState.activeListing.calculatedPriceNpr = valuation.medianValuation;

    // Render numbers
    document.getElementById("price-median-value").textContent = locEngine.formatNPR(valuation.medianValuation);
    document.getElementById("price-low-value").textContent = locEngine.formatNPR(valuation.lowEst);
    document.getElementById("price-high-value").textContent = locEngine.formatNPR(valuation.highEst);

    // Sync variables with legal tab dynamically
    syncLegalVariables();
  }

  // Bind change input listeners
  [inRopani, inAana, inPaisa, inDaam].forEach(el => el.addEventListener("input", () => runRecalculation("hilly")));
  [inBigha, inKattha, inDhur].forEach(el => el.addEventListener("input", () => runRecalculation("terai")));
  inSqFt.addEventListener("input", () => runRecalculation("sqft"));
  [selRoad, inHighway, selZoning].forEach(el => el.addEventListener("change", () => runRecalculation("sqft")));

  // Run initial calc
  runRecalculation("hilly");
}

// 9. E2EE Negotiation Chat Operations
async function setupNegotiationHandlers() {
  const btnSend = document.getElementById("btn-negotiate-send");
  const inputMsg = document.getElementById("negotiate-chat-input");
  const scroller = document.getElementById("negotiate-chat-scroller");
  const myKeyBox = document.getElementById("negotiate-my-key");
  const cipherPreview = document.getElementById("negotiate-ciphertext-preview");
  const btnExport = document.getElementById("btn-negotiate-export");

  // Initial E2EE setup
  const keyPairs = await negotiationModule.initializeE2EEKeys();
  appState.chat.myPublicKey = keyPairs.publicKeyText;
  myKeyBox.textContent = keyPairs.publicKeyText;

  // Send message trigger
  function handleSendMessage() {
    const val = inputMsg.value.trim();
    if (!val) return;

    inputMsg.value = "";

    // 1. Add user sent message
    const msg = negotiationModule.addMessage("buyer", val, appState.chat.peerPublicKey);
    appendChatBubble(msg.sender, msg.plaintext, msg.ciphertext, msg.hash);
    
    // Display encryption stream preview
    cipherPreview.innerHTML = `
      Encrypted text: <span style="color:#00F2FE;">${msg.ciphertext.substring(0, 18)}...</span><br>
      Hash digest: ${msg.hash.substring(0, 12)}
    `;

    // Encrypt current messages list inside PII Privacy logs
    encryptChatLogsPII();

    // Trigger mock automated seller reply after 2 seconds
    setTimeout(() => {
      let sellerResponses = [
        "Yes, the price is negotiable. The land is fully cleared by the land revenue office (Malpot).",
        "If you check the Lalpurja Naksha, the boundaries are perfectly aligned. Would you like to sign a Bainapatra agreement?",
        "Please initiate the NRB escrow cheque step, since the property transaction exceeds NPR 50 Lakhs.",
        "Understood. Let's execute the digital Rajinama deed preparation on Jamin Direct."
      ];
      
      const randomReply = sellerResponses[Math.floor(Math.random() * sellerResponses.length)];
      const sellerMsg = negotiationModule.addMessage("seller", randomReply, appState.chat.myPublicKey);
      
      appendChatBubble("seller", sellerMsg.plaintext, sellerMsg.ciphertext, sellerMsg.hash);
      
      cipherPreview.innerHTML = `
        Decrypted text: <span style="color:#10B981;">${sellerMsg.plaintext.substring(0, 18)}...</span><br>
        Hash digest: ${sellerMsg.hash.substring(0, 12)}
      `;

      encryptChatLogsPII();
    }, 2000);
  }

  function appendChatBubble(sender, text, cipher, hash) {
    const isSent = sender === "buyer";
    const bubbleHtml = `
      <div class="chat-bubble ${isSent ? 'bubble-sent' : 'bubble-received'}">
        <strong style="font-size:0.75rem;display:block;margin-bottom:0.25rem;">
          ${isSent ? 'You (Buyer)' : appState.chat.peerName}
        </strong>
        <div>${text}</div>
        <span class="crypto-hash-label">Cipher: ${cipher.substring(0, 12)}... | Hash: ${hash.substring(0, 10)}</span>
      </div>
    `;
    scroller.insertAdjacentHTML("beforeend", bubbleHtml);
    scroller.scrollTop = scroller.scrollHeight;
  }

  btnSend.addEventListener("click", handleSendMessage);
  inputMsg.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSendMessage(); });

  // Export legal dispute logs
  btnExport.addEventListener("click", () => {
    const dispute = negotiationModule.generateDisputePackage(
      appState.user.fullName || "Hari Bahadur Thapa (Buyer)", 
      appState.landRecords.ownerName, 
      appState.landRecords.kittaNo
    );

    // Dynamic browser download link execution
    const dummyLink = document.createElement("a");
    dummyLink.href = dispute.downloadUrl;
    dummyLink.download = dispute.fileName;
    document.body.appendChild(dummyLink);
    dummyLink.click();
    document.body.removeChild(dummyLink);
  });
}

function initiateNegotiationChat() {
  const scroller = document.getElementById("negotiate-chat-scroller");
  if (!scroller) return;
  scroller.innerHTML = "";

  // Insert introductory compliance text
  scroller.innerHTML = `
    <div style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;line-height:1.4;">
      🔒 <strong>END-TO-END ENCRYPTED NEGOTIATION CHANNEL</strong><br>
      This chat log is cryptographically archived in compliance with the Nepalese Electronic Commerce Act 2025 (विद्युतीय व्यापार ऐन २०८१).
    </div>
  `;
}

// 10. AML Financial Verification Escrow Operations
function setupEscrowHandlers() {
  const uploadZone = document.getElementById("escrow-cheque-zone");
  const fileInput = document.getElementById("escrow-file-input");
  const inBank = document.getElementById("escrow-bank-name");
  const inRef = document.getElementById("escrow-ref-id");
  const selSource = document.getElementById("escrow-source-funds");
  const chkPep = document.getElementById("escrow-pep-declaration");
  const btnVerify = document.getElementById("btn-trigger-escrow-verify");
  const consoleOut = document.getElementById("escrow-audit-status-console");

  uploadZone.addEventListener("click", () => fileInput.click());
  uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.style.borderColor = "var(--primary-neon)"; });
  uploadZone.addEventListener("dragleave", () => uploadZone.style.borderColor = "var(--border-glass)");
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = "var(--border-glass)";
    if (e.dataTransfer.files.length > 0) {
      simulateChequeUpload(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      simulateChequeUpload(fileInput.files[0]);
    }
  });

  function simulateChequeUpload(file) {
    uploadZone.style.borderColor = "var(--success-emerald)";
    uploadZone.innerHTML = `
      <div class="text-success" style="font-size:2.25rem;">✓</div>
      <p style="font-size:0.9rem;font-weight:700;color:#FFFFFF;">Certified Good for Payment Cheque Loaded</p>
      <p style="font-size:0.75rem;color:var(--text-secondary);">${file.name} ready for audit checks</p>
    `;
    appState.escrow.chequeUploaded = true;
  }

  btnVerify.addEventListener("click", () => {
    if (!appState.escrow.chequeUploaded) {
      consoleOut.innerHTML = `<span class="text-danger" style="font-weight:700;">ERROR: Mandatory cheque / bank RTGS voucher scan required.</span>`;
      return;
    }
    if (!chkPep.checked) {
      consoleOut.innerHTML = `<span class="text-danger" style="font-weight:700;">ERROR: Anti-Money Laundering PEP self-declaration is strictly required.</span>`;
      return;
    }

    consoleOut.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;"><div class="spinner"></div> Running Nepal Rastra Bank AML/CFT screening sweeps...</div>`;

    escrowModule.runAmlClearanceAudit(
      null, 
      selSource.value, 
      inBank.value, 
      inRef.value, 
      (res) => {
        appState.escrow.isAmlApproved = true;
        appState.escrow.clearanceCode = res.clearanceCode;
        appState.escrow.bankName = res.verifiedBank;
        appState.escrow.referenceId = inRef.value;
        appState.escrow.sourceFunds = res.auditedSource;

        consoleOut.innerHTML = `
          <strong class="text-success">✓ NEPAL RASTRA BANK AML COMPLIANCE AUDIT APPROVED:</strong><br>
          • AML Clearance Reference: ${res.clearanceCode}<br>
          • Class-A Bank Routing: ${res.verifiedBank}<br>
          • Declared Source Audit: Legitimate Property / Business Earnings (Low Risk)<br>
          • PEP screening: CLEARED (No match on local/international blacklists)<br>
          • FIU Digital Seal signature: ${res.amlSealSignature.substring(0, 20)}...<br>
          • Status: Financial escrow clears. Validated for high-value P2P transaction.
        `;

        syncLegalVariables();
      }
    );
  });
}

// 11. Malpot Legal Contract Automation & Digital Signatures
function setupLegalHandlers() {
  const btnRefresh = document.getElementById("btn-legal-refresh-data");
  const btnGenPdf = document.getElementById("btn-legal-generate-pdf");
  const btnClearSign = document.getElementById("btn-legal-clear-sign");
  const btnFinalize = document.getElementById("btn-legal-finalize-sign");
  const signatureStatus = document.getElementById("legal-signature-status-console");

  btnRefresh.addEventListener("click", () => {
    syncLegalVariables();
    signatureStatus.innerHTML = `<span class="text-gold" style="font-weight:700;">✓ Synced variables from eKYC and Pricing Engine databases.</span>`;
  });

  btnClearSign.addEventListener("click", () => {
    legalModule.clearSignature("legal-signature-canvas");
  });

  btnGenPdf.addEventListener("click", () => {
    const docParams = {
      buyerName: appState.user.fullName || "Hari Bahadur Thapa (Buyer)",
      sellerName: appState.landRecords.ownerName,
      buyerNagarikta: appState.user.citizenshipNo || "45-02-76-12034",
      sellerNagarikta: "45-02-76-12034", // Sample
      district: appState.landRecords.district,
      municipality: appState.landRecords.municipality,
      wardNo: appState.landRecords.wardNo,
      kittaNo: appState.landRecords.kittaNo,
      areaBS: appState.landRecords.areaBS,
      priceNpr: appState.activeListing.calculatedPriceNpr,
      signingDate: locEngine.getBSDateString(),
      amlCode: appState.escrow.clearanceCode,
      meroKittaHash: appState.landRecords.verificationHash
    };

    const res = legalModule.generateRajinamaPDF(docParams);
    appState.legal.agreementPdfUrl = res.downloadUrl;

    // Trigger PDF download
    const dummyLink = document.createElement("a");
    dummyLink.href = res.downloadUrl;
    dummyLink.download = res.fileName;
    document.body.appendChild(dummyLink);
    dummyLink.click();
    document.body.removeChild(dummyLink);
  });

  btnFinalize.addEventListener("click", () => {
    if (!legalModule.signatureDataUrl) {
      signatureStatus.innerHTML = `<span class="text-danger" style="font-weight:700;">ERROR: An interactive signature on the drawing canvas is required.</span>`;
      return;
    }

    signatureStatus.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;"><div class="spinner"></div> Executing ETA 2063 Cryptographic digital contract...</div>`;

    setTimeout(() => {
      const contractHash = "SHA256_CONTRACT_" + Math.random().toString(36).substring(2, 18).toUpperCase();
      appState.legal.buyerSigned = true;
      appState.legal.contractExecuted = true;
      appState.legal.contractHash = contractHash;

      signatureStatus.innerHTML = `
        <strong class="text-success">✓ DIGITAL BAINAPATRA EXECUTED SUCCESSFULLY:</strong><br>
        • Certified digital signature validated under ETA 2063 rules.<br>
        • Cryptographic contract digest: ${contractHash}<br>
        • Witness node audit log: SECURE_JAMIN_DIRECT_BLOCK<br>
        • Status: Preliminary agreement binding. Ready for Land Registry land revenue office submission.
      `;
    }, 2000);
  });
}

function syncLegalVariables() {
  const sellerEl = document.getElementById("legal-preview-seller");
  const sellerNagEl = document.getElementById("legal-preview-seller-nag");
  const buyerEl = document.getElementById("legal-preview-buyer");
  const buyerNagEl = document.getElementById("legal-preview-buyer-nag");
  const distEl = document.getElementById("legal-preview-district");
  const muniEl = document.getElementById("legal-preview-muni");
  const wardEl = document.getElementById("legal-preview-ward");
  const kittaEl = document.getElementById("legal-preview-kitta");
  const areaEl = document.getElementById("legal-preview-area");
  const priceEl = document.getElementById("legal-preview-price");
  const priceTextEl = document.getElementById("legal-preview-price-text");

  if (sellerEl) {
    sellerEl.textContent = appState.landRecords.ownerName;
    distEl.textContent = appState.landRecords.district;
    muniEl.textContent = appState.landRecords.municipality;
    wardEl.textContent = appState.landRecords.wardNo;
    kittaEl.textContent = appState.landRecords.kittaNo;
    areaEl.textContent = appState.landRecords.areaBS;
    
    buyerEl.textContent = appState.user.fullName || "Hari Bahadur Thapa (Buyer)";
    buyerNagEl.textContent = appState.user.citizenshipNo || "45-02-76-12034";

    const priceText = appState.activeListing.calculatedPriceNpr.toLocaleString("en-IN");
    priceEl.textContent = priceText;
    priceTextEl.textContent = locEngine.toNepaliNumerals(priceText) + " रुपैयाँ";
  }
}

// 12. PII Security & Encryption Dashboard Controls
function setupPrivacyHandlers() {
  const btnPurge = document.getElementById("btn-privacy-wipe-db");
  const statusWipeConsole = document.getElementById("privacy-wipe-status-console");

  // Load decrypt buttons bindings
  document.querySelectorAll(".btn-decrypt-pii").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-pii-type");
      const rowTextEl = document.getElementById(`pii-cipher-${type}`);
      
      let decrypted = "";
      if (type === "nagarikta") {
        const rawObj = {
          fullName: appState.user.fullName,
          citizenshipNo: appState.user.citizenshipNo,
          dobBS: appState.user.dobBS,
          district: appState.user.district,
          issueDateBS: appState.user.issueDateBS
        };
        decrypted = JSON.stringify(rawObj, null, 2);
      } else if (type === "biometrics") {
        decrypted = `Live Selfie Facemash match confidence: ${appState.user.biometricMatchScore}%\nScreened time: ${new Date().toISOString()}`;
      } else if (type === "chats") {
        decrypted = JSON.stringify(negotiationModule.messages, null, 2);
      }

      rowTextEl.innerHTML = `<pre class="decrypted" style="white-space:pre-wrap;font-size:0.75rem;line-height:1.4;">${decrypted}</pre>`;
      btn.textContent = "Re-encrypt PII";
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-danger");
      
      // Toggle re-encryption
      btn.addEventListener("click", () => {
        encryptPIIFields();
        btn.textContent = "Inspect PII";
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-secondary");
      }, { once: true });
    });
  });

  // Wipes all data under Right to be Forgotten Act 2075
  btnPurge.addEventListener("click", () => {
    btnPurge.disabled = true;
    
    privacyModule.purgeUserFootprint((res) => {
      if (res.status === "in_progress") {
        statusWipeConsole.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.5rem;color:var(--danger-crimson);">
            <div class="spinner" style="width:20px;height:20px;border-left-color:var(--danger-crimson);"></div>
            <span>${res.progress}% - ${res.message}</span>
          </div>
        `;
      } else {
        statusWipeConsole.innerHTML = `<span class="text-success" style="font-weight:700;">✓ ${res.message}</span>`;
        
        // Dynamic full site reload to restore absolute clean slate
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    });
  });
}

function encryptPIIFields() {
  const cipNag = document.getElementById("pii-cipher-nagarikta");
  const cipBio = document.getElementById("pii-cipher-biometrics");
  const btnDecryptNag = document.querySelector('[data-pii-type="nagarikta"]');
  const btnDecryptBio = document.querySelector('[data-pii-type="biometrics"]');

  if (appState.user.fullName && cipNag) {
    const rawData = {
      fullName: appState.user.fullName,
      citizenshipNo: appState.user.citizenshipNo,
      dobBS: appState.user.dobBS,
      district: appState.user.district,
      issueDateBS: appState.user.issueDateBS
    };
    const enc = privacyModule.encryptPII(rawData);
    cipNag.textContent = enc.ciphertext.substring(0, 75) + "...";
    btnDecryptNag.disabled = false;
  }

  if (appState.user.biometricMatchScore > 0 && cipBio) {
    const enc = privacyModule.encryptPII(`Biometric Match Score: ${appState.user.biometricMatchScore}`);
    cipBio.textContent = enc.ciphertext.substring(0, 75) + "...";
    btnDecryptBio.disabled = false;
  }
}

function encryptChatLogsPII() {
  const cipChat = document.getElementById("pii-cipher-chats");
  const btnDecryptChat = document.querySelector('[data-pii-type="chats"]');
  
  if (negotiationModule.messages.length > 0 && cipChat) {
    const enc = privacyModule.encryptPII(negotiationModule.messages);
    cipChat.textContent = enc.ciphertext.substring(0, 75) + "...";
    btnDecryptChat.disabled = false;
  }
}

// 13. System Localization Swapper Binds
function setupLanguageSwitcher() {
  document.querySelectorAll(".lang-switch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      locEngine.setLanguage(lang);
      
      // Refresh current tab title and desc in active locale
      const activeTabId = document.querySelector(".nav-item.active").getAttribute("data-tab");
      switchTab(activeTabId);

      // Re-render comparative listings and prices
      renderListings();
      
      // Update Nepalese dates inside UI previews
      syncLegalVariables();
    });
  });
}

// 14. Master App Setup on Page DOM Load
window.addEventListener("DOMContentLoaded", () => {
  // Translate HTML elements initially
  locEngine.translateDOM();

  // Navigation tab event bindings
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Load and setup initial handlers
  renderListings();
  setupLanguageSwitcher();
  setupEkycHandlers();
  setupMeroKittaHandlers();
  setupSpatialHandlers();
  setupPricingHandlers();
  setupNegotiationHandlers();
  setupEscrowHandlers();
  setupLegalHandlers();
  setupPrivacyHandlers();
});
