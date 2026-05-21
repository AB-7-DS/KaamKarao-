const bookings = new Map();

const bookingAgent = {
  name: 'BookingAgent',

  createBooking(provider, intent, slot) {
    const startTime = Date.now();
    const agentTrace = {
      agent: 'BookingAgent',
      input: { providerId: provider.id, service: intent.service, slot },
      startTime: new Date().toISOString()
    };

    const bookingId = `KK-${Date.now().toString(36).toUpperCase()}`;

    // Pick the best slot
    let selectedSlot = slot;
    if (!selectedSlot && provider.availableSlots && provider.availableSlots.length > 0) {
      // Try to match time preference
      if (intent.time === 'morning' || intent.time === 'subah') {
        selectedSlot = provider.availableSlots.find(s => {
          const hour = parseInt(s.split(':')[0]);
          return hour >= 8 && hour < 12;
        }) || provider.availableSlots[0];
      } else if (intent.time === 'afternoon' || intent.time === 'dopahar') {
        selectedSlot = provider.availableSlots.find(s => {
          const hour = parseInt(s.split(':')[0]);
          return hour >= 12 && hour < 17;
        }) || provider.availableSlots[0];
      } else if (intent.time === 'evening' || intent.time === 'sham') {
        selectedSlot = provider.availableSlots.find(s => {
          const hour = parseInt(s.split(':')[0]);
          return hour >= 16;
        }) || provider.availableSlots[provider.availableSlots.length - 1];
      } else {
        selectedSlot = provider.availableSlots[0];
      }
    }

    if (!selectedSlot) {
      selectedSlot = '10:00';
    }

    const serviceEmoji = {
      plumber: '🔧',
      electrician: '⚡',
      ac_technician: '❄️',
      tutor: '📚',
      beautician: '💄'
    };

    const serviceNameUrdu = {
      plumber: 'Plumber',
      electrician: 'Electrician',
      ac_technician: 'AC Technician',
      tutor: 'Tutor',
      beautician: 'Beautician'
    };

    const emoji = serviceEmoji[intent.service] || '🔧';
    const serviceName = serviceNameUrdu[intent.service] || intent.service;

    const timeLabel = intent.time === 'tomorrow' ? 'Kal' : 'Aaj';

    const confirmationMessage =
      `${emoji} Booking Confirmed!\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 Booking ID: ${bookingId}\n` +
      `👤 Provider: ${provider.name}\n` +
      `🛠️ Service: ${serviceName}\n` +
      `📍 Location: ${intent.location || provider.location.sector}\n` +
      `🕐 Time: ${timeLabel}, ${selectedSlot}\n` +
      `📞 Contact: ${provider.phone}\n` +
      `💰 Price: ${provider.priceRange}\n` +
      `⭐ Rating: ${provider.rating}/5 (${provider.reviewCount} reviews)\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ ${provider.name} ko aapki booking ki notification bhej di gayi hai. Shukriya!`;

    const booking = {
      id: bookingId,
      provider: {
        id: provider.id,
        name: provider.name,
        phone: provider.phone,
        rating: provider.rating,
        experience: provider.experience,
        priceRange: provider.priceRange,
        sector: provider.location.sector
      },
      service: intent.service,
      location: intent.location || provider.location.sector,
      slot: selectedSlot,
      timePreference: intent.time || 'today',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      confirmationMessage
    };

    // Store booking
    bookings.set(bookingId, booking);

    const duration = Date.now() - startTime;
    agentTrace.bookingId = bookingId;
    agentTrace.selectedSlot = selectedSlot;
    agentTrace.duration = `${duration}ms`;
    agentTrace.endTime = new Date().toISOString();

    return {
      booking,
      agentTrace
    };
  },

  getBooking(bookingId) {
    return bookings.get(bookingId) || null;
  },

  getAllBookings() {
    return Array.from(bookings.values());
  }
};

module.exports = bookingAgent;
