import { Platform } from 'react-native';

// Use localhost for web, machine IP for device
const BASE_URL = Platform.select({
  web: 'http://localhost:3030',
  android: 'http://10.0.2.2:3030',
  ios: 'http://localhost:3030',
  default: 'http://localhost:3030',
});

export const sendServiceRequest = async (userInput) => {
  const response = await fetch(`${BASE_URL}/api/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput }),
  });
  if (!response.ok) throw new Error('Request failed');
  return response.json();
};

export const getBooking = async (bookingId) => {
  const response = await fetch(`${BASE_URL}/api/booking/${bookingId}`);
  if (!response.ok) throw new Error('Booking not found');
  return response.json();
};
