// pricing.js - Nepalese Land Converter & Algorithmic Pricing Engine

export class PricingEngine {
  constructor(appState, localization) {
    this.appState = appState;
    this.localization = localization;
  }

  // Precise conversions to Square Feet
  convertHillyToSqFt(ropani, aana, paisa, daam) {
    const r = Number(ropani) || 0;
    const a = Number(aana) || 0;
    const p = Number(paisa) || 0;
    const d = Number(daam) || 0;

    // 1 Ropani = 5476 sq ft
    // 1 Aana = 342.25 sq ft
    // 1 Paisa = 85.56 sq ft
    // 1 Daam = 21.39 sq ft
    return (r * 5476) + (a * 342.25) + (p * 85.56) + (d * 21.39);
  }

  convertTeraiToSqFt(bigha, kattha, dhur) {
    const b = Number(bigha) || 0;
    const k = Number(kattha) || 0;
    const d = Number(dhur) || 0;

    // 1 Bigha = 72900 sq ft
    // 1 Kattha = 3645 sq ft
    // 1 Dhur = 182.25 sq ft
    return (b * 72900) + (k * 3645) + (d * 182.25);
  }

  convertSqFtToHilly(sqFt) {
    let rem = Number(sqFt) || 0;
    
    const ropani = Math.floor(rem / 5476);
    rem %= 5476;
    
    const aana = Math.floor(rem / 342.25);
    rem %= 342.25;
    
    const paisa = Math.floor(rem / 85.56);
    rem %= 85.56;
    
    const daam = Math.round(rem / 21.39 * 10) / 10; // keep one decimal for daam
    
    return { ropani, aana, paisa, daam };
  }

  convertSqFtToTerai(sqFt) {
    let rem = Number(sqFt) || 0;
    
    const bigha = Math.floor(rem / 72900);
    rem %= 72900;
    
    const kattha = Math.floor(rem / 3645);
    rem %= 3645;
    
    const dhur = Math.round(rem / 182.25 * 10) / 10;
    
    return { bigha, kattha, dhur };
  }

  // Statistical Price Estimation Model
  calculateValuation(params) {
    const {
      areaSqFt,
      roadWidthFt, // e.g. 8 ft, 13 ft, 20 ft
      highwayProximityM, // distance from main highway in meters
      zoning, // "residential", "commercial", "agricultural"
      district // "Kathmandu", "Lalitpur", "Bhaktapur", etc.
    } = params;

    // Base rate per square foot by district (historical averages)
    const baseRates = {
      "Kathmandu": 8000,    // approx Rs. 27 Lakh per Aana
      "Lalitpur": 7000,     // approx Rs. 24 Lakh per Aana
      "Bhaktapur": 5000,    // approx Rs. 17 Lakh per Aana
      "Kaski": 6000,        // Pokhara base
      "Morang": 3500,       // Biratnagar base
      "Chitwan": 4500,      // Bharatpur base
      "Rupandehi": 4000     // Butwal base
    };

    const baseRate = baseRates[district] || 4000;

    // 1. Zoning Multipliers
    let zoningMultiplier = 1.0;
    if (zoning === "commercial") zoningMultiplier = 1.8;
    if (zoning === "residential") zoningMultiplier = 1.15;
    if (zoning === "agricultural") zoningMultiplier = 0.45;

    // 2. Access Road Width Modifier
    // In Nepal, road width is critical. Dirt roads < 10ft suffer penalty; wide blacktopped roads > 20ft have high premiums
    let roadModifier = 0.7; // default narrow
    if (roadWidthFt >= 20) {
      roadModifier = 1.4; // 20ft+ blacktopped premium
    } else if (roadWidthFt >= 13) {
      roadModifier = 1.1; // 13-19ft standard municipal road
    } else if (roadWidthFt >= 8) {
      roadModifier = 0.95; // 8-12ft inner alley
    }

    // 3. Proximity to Highway / Town Center (exponential decay multiplier)
    // Closer is better. If distance is < 100m, high premium; > 1500m, normal
    let proximityModifier = 1.0;
    if (highwayProximityM <= 100) {
      proximityModifier = 1.35;
    } else if (highwayProximityM <= 500) {
      proximityModifier = 1.15;
    } else if (highwayProximityM > 2000) {
      proximityModifier = 0.8;
    }

    // Compute central estimated rate
    const calculatedRate = baseRate * zoningMultiplier * roadModifier * proximityModifier;
    const medianValuation = areaSqFt * calculatedRate;

    // Set Low and High Valuation Bands (+/- 10%)
    const lowEst = medianValuation * 0.9;
    const highEst = medianValuation * 1.1;

    // Estimate monthly rental yield (standard 2.5% to 3.5% yield per annum in Nepalese market)
    const annualRent = medianValuation * 0.03;
    const monthlyRentEst = annualRent / 12;

    return {
      ratePerSqFt: Math.round(calculatedRate),
      lowEst: Math.round(lowEst),
      medianValuation: Math.round(medianValuation),
      highEst: Math.round(highEst),
      monthlyRentEst: Math.round(monthlyRentEst)
    };
  }

  // Aggregate comparative listing data to display to user
  getComparableAnalytics(district, zoning) {
    // Return standard pre-audited local data
    const mockComparables = [
      { id: 1, location: "Budhanilkantha Ward 3", area: "0-8-0-0", rate: "NPR 3,200,000 / Aana", road: "13 ft gravel", price: 25600000 },
      { id: 2, location: "Dhapasi Ward 4", area: "0-10-2-0", rate: "NPR 3,500,000 / Aana", road: "20 ft blacktopped", price: 36750000 },
      { id: 3, location: "Bansbari", area: "0-5-0-0", rate: "NPR 4,200,000 / Aana", road: "16 ft blacktopped", price: 21000000 },
      { id: 4, location: "Imadol, Lalitpur", area: "0-4-0-0", rate: "NPR 2,600,000 / Aana", road: "13 ft gravel", price: 10400000 }
    ];

    return mockComparables.filter(item => {
      if (district === "Kathmandu" && item.location.includes("Kathmandu")) return true;
      if (district === "Lalitpur" && item.location.includes("Lalitpur")) return true;
      return true; // Fallback to list all
    });
  }
}
