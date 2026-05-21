const path = require('path');
const providers = require(path.join(__dirname, '..', 'data', 'providers.json'));

const SECTOR_COORDINATES = {
  'G-9':         { lat: 33.6900, lng: 73.0480 },
  'G-10':        { lat: 33.6938, lng: 73.0551 },
  'G-11':        { lat: 33.6850, lng: 73.0350 },
  'G-13':        { lat: 33.6720, lng: 73.0180 },
  'F-7':         { lat: 33.7200, lng: 73.0580 },
  'F-8':         { lat: 33.7100, lng: 73.0480 },
  'F-10':        { lat: 33.6990, lng: 73.0200 },
  'I-8':         { lat: 33.6680, lng: 73.0780 },
  'I-9':         { lat: 33.6600, lng: 73.0650 },
  'Bahria Town': { lat: 33.5200, lng: 73.0900 },
  'Bahria':      { lat: 33.5200, lng: 73.0900 }
};

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const matchingAgent = {
  name: 'MatchingAgent',

  findProviders(intent) {
    const startTime = Date.now();
    const agentTrace = {
      agent: 'MatchingAgent',
      input: intent,
      startTime: new Date().toISOString()
    };

    // Filter providers by service type
    const serviceProviders = providers.filter(
      (p) => p.service === intent.service
    );

    agentTrace.totalProviders = serviceProviders.length;

    // Get user location coordinates
    const userLocation = SECTOR_COORDINATES[intent.location] || SECTOR_COORDINATES['G-10']; // Default to G-10
    agentTrace.userLocation = { sector: intent.location, ...userLocation };

    // Score each provider
    const scored = serviceProviders.map((provider) => {
      // Distance score (40%) - closer is better, max 10km range
      const distance = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        provider.location.lat,
        provider.location.lng
      );
      const distanceScore = Math.max(0, 1 - distance / 10); // 0-1, 10km max

      // Rating score (35%) - normalized to 0-1
      const ratingScore = provider.rating / 5.0;

      // Availability score (25%)
      const availabilityScore = provider.available ? 1.0 : 0.0;

      // Sector bonus - same sector gets +0.2
      const sectorBonus =
        provider.location.sector.toLowerCase() === (intent.location || '').toLowerCase()
          ? 0.2
          : 0.0;

      const totalScore =
        distanceScore * 0.4 +
        ratingScore * 0.35 +
        availabilityScore * 0.25 +
        sectorBonus;

      return {
        ...provider,
        scoring: {
          distance: `${distance.toFixed(2)} km`,
          distanceScore: parseFloat(distanceScore.toFixed(3)),
          ratingScore: parseFloat(ratingScore.toFixed(3)),
          availabilityScore,
          sectorBonus,
          totalScore: parseFloat(totalScore.toFixed(3))
        }
      };
    });

    // Sort by total score descending
    scored.sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);

    const topProviders = scored.slice(0, 3);
    const selectedProvider = topProviders[0] || null;

    // Build reasoning
    let reasoning = '';
    if (selectedProvider) {
      reasoning = `Selected ${selectedProvider.name} (${selectedProvider.location.sector}) with score ${selectedProvider.scoring.totalScore}. `;
      reasoning += `Distance: ${selectedProvider.scoring.distance}, Rating: ${selectedProvider.rating}/5, `;
      reasoning += `${selectedProvider.available ? 'Available' : 'Unavailable'}. `;
      reasoning += `${selectedProvider.location.sector === intent.location ? 'Same sector bonus applied.' : 'Different sector.'}`;
    } else {
      reasoning = `No providers found for service: ${intent.service}`;
    }

    const duration = Date.now() - startTime;
    agentTrace.matchedCount = topProviders.length;
    agentTrace.reasoning = reasoning;
    agentTrace.duration = `${duration}ms`;
    agentTrace.endTime = new Date().toISOString();

    return {
      topProviders,
      selectedProvider,
      reasoning,
      agentTrace
    };
  }
};

module.exports = matchingAgent;
