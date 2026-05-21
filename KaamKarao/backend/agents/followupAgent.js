const followupAgent = {
  name: 'FollowupAgent',

  schedule(booking) {
    const startTime = Date.now();
    const agentTrace = {
      agent: 'FollowupAgent',
      input: { bookingId: booking.id, slot: booking.slot },
      startTime: new Date().toISOString()
    };

    // Parse slot time
    const [hours, minutes] = booking.slot.split(':').map(Number);
    const now = new Date();

    // Calculate booking datetime
    const bookingDate = new Date();
    if (booking.timePreference === 'tomorrow') {
      bookingDate.setDate(bookingDate.getDate() + 1);
    }
    bookingDate.setHours(hours, minutes, 0, 0);

    // 1 hour before
    const reminderTime = new Date(bookingDate);
    reminderTime.setHours(reminderTime.getHours() - 1);

    // 2 hours after
    const completionTime = new Date(bookingDate);
    completionTime.setHours(completionTime.getHours() + 2);

    const reminders = [
      {
        type: 'CONFIRMATION',
        scheduledFor: now.toISOString(),
        status: 'SENT',
        message: `✅ Booking ${booking.id} confirmed! ${booking.provider.name} will arrive at ${booking.location} at ${booking.slot}. Contact: ${booking.provider.phone}`
      },
      {
        type: 'REMINDER_1HR',
        scheduledFor: reminderTime.toISOString(),
        status: 'SCHEDULED',
        message: `⏰ Reminder: ${booking.provider.name} (${booking.service}) will arrive at ${booking.location} in 1 hour at ${booking.slot}. Be ready! Contact: ${booking.provider.phone}`
      },
      {
        type: 'COMPLETION',
        scheduledFor: completionTime.toISOString(),
        status: 'SCHEDULED',
        message: `⭐ How was your experience with ${booking.provider.name}? Rate your ${booking.service} service and help others find great providers! Reply with 1-5 stars.`
      }
    ];

    const duration = Date.now() - startTime;
    agentTrace.remindersScheduled = reminders.length;
    agentTrace.duration = `${duration}ms`;
    agentTrace.endTime = new Date().toISOString();

    return {
      reminders,
      agentTrace
    };
  }
};

module.exports = followupAgent;
