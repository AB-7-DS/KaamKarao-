import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProviderCard from '../components/ProviderCard';

const { width } = Dimensions.get('window');

const BookingScreen = ({ navigation, route }) => {
  const booking = route.params?.booking || {
    bookingId: 'KK-A3F7K2',
    service: 'Plumber',
    location: 'G-10/2, Islamabad',
    timeSlot: 'Tomorrow, 9:00 AM - 11:00 AM',
    provider: {
      name: 'Ustad Karim',
      service: 'Plumber',
      rating: 4.8,
      totalRatings: 127,
      distance: '2.3 km',
      available: true,
      phone: '+92 312 456 7890',
      priceRange: 'Rs. 800 - 1,500',
      experience: '8 years',
    },
    smsPreview:
      'Booking confirmed! Ustad Karim (Plumber) will arrive at G-10/2 tomorrow 9 AM. Booking ID: KK-A3F7K2. Call: 0312-4567890',
    agentTrace: [],
  };

  // Animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const smsSlide = useRef(new Animated.Value(80)).current;
  const smsOpacity = useRef(new Animated.Value(0)).current;
  const reminderAnims = useRef([
    { slide: new Animated.Value(40), opacity: new Animated.Value(0) },
    { slide: new Animated.Value(40), opacity: new Animated.Value(0) },
    { slide: new Animated.Value(40), opacity: new Animated.Value(0) },
  ]).current;
  const btnScale = useRef(new Animated.Value(0.8)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence the entrance animations
    Animated.sequence([
      // 1. Checkmark bounce in
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 2. Badge pop
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      // 3. Details card slide up
      Animated.parallel([
        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 4. SMS bubble
      Animated.parallel([
        Animated.spring(smsSlide, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(smsOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // 5. Reminders staggered
      Animated.stagger(150, reminderAnims.map((a) =>
        Animated.parallel([
          Animated.spring(a.slide, {
            toValue: 0,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.timing(a.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      )),
      // 6. Button
      Animated.parallel([
        Animated.spring(btnScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const reminders = [
    { icon: '✅', text: 'Booking Confirmed', time: 'Just now', color: '#4CAF50' },
    { icon: '⏰', text: '1 Hour Before Reminder', time: 'Tomorrow 8:00 AM', color: '#FF6F00' },
    { icon: '⭐', text: 'Rate & Review', time: 'After service', color: '#7C4DFF' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Green Checkmark Animation */}
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
        style={styles.checkSection}
      >
        <Animated.View
          style={[
            styles.checkCircle,
            {
              opacity: checkOpacity,
              transform: [{ scale: checkScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['#2E7D32', '#1B5E20']}
            style={styles.checkGradient}
          >
            <Text style={styles.checkMark}>✓</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
        <Text style={styles.confirmedSubtitle}>Your service provider is on the way</Text>

        {/* Booking ID Badge */}
        <Animated.View style={[styles.idBadge, { transform: [{ scale: badgeScale }] }]}>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.idBadgeGradient}
          >
            <Text style={styles.idLabel}>BOOKING ID</Text>
            <Text style={styles.idValue}>{booking.bookingId}</Text>
          </LinearGradient>
        </Animated.View>
      </LinearGradient>

      {/* Provider Card */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>👨‍🔧 Your Provider</Text>
        <ProviderCard {...booking.provider} />
      </Animated.View>

      {/* Booking Details */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>📋 Booking Details</Text>
        <View style={styles.detailsCard}>
          <DetailRow icon="🔧" label="Service" value={booking.service} />
          <View style={styles.detailDivider} />
          <DetailRow icon="📍" label="Location" value={booking.location} />
          <View style={styles.detailDivider} />
          <DetailRow icon="⏰" label="Time Slot" value={booking.timeSlot} />
          <View style={styles.detailDivider} />
          <DetailRow icon="💰" label="Estimated" value={booking.provider.priceRange} />
        </View>
      </Animated.View>

      {/* SMS Preview */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: smsOpacity,
            transform: [{ translateY: smsSlide }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>📱 Confirmation SMS</Text>
        <View style={styles.smsCard}>
          <View style={styles.smsHeader}>
            <View style={styles.smsNotch} />
            <Text style={styles.smsHeaderText}>Messages</Text>
          </View>
          <View style={styles.smsBubble}>
            <Text style={styles.smsSender}>Kaam Karao</Text>
            <Text style={styles.smsText}>{booking.smsPreview}</Text>
            <Text style={styles.smsTime}>Just now ✓✓</Text>
          </View>
        </View>
      </Animated.View>

      {/* Upcoming Reminders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Upcoming</Text>
        {reminders.map((reminder, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.reminderItem,
              {
                opacity: reminderAnims[idx].opacity,
                transform: [{ translateX: reminderAnims[idx].slide }],
              },
            ]}
          >
            <View style={[styles.reminderIcon, { backgroundColor: reminder.color + '20' }]}>
              <Text style={styles.reminderIconText}>{reminder.icon}</Text>
            </View>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderText}>{reminder.text}</Text>
              <Text style={styles.reminderTime}>{reminder.time}</Text>
            </View>
            <View
              style={[styles.reminderDot, { backgroundColor: reminder.color }]}
            />
          </Animated.View>
        ))}
      </View>

      {/* Agent Trace Button */}
      <Animated.View
        style={[
          styles.btnContainer,
          {
            opacity: btnOpacity,
            transform: [{ scale: btnScale }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('Trace', {
              trace: booking.agentTrace,
              bookingId: booking.bookingId,
            })
          }
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.traceBtn}
          >
            <Text style={styles.traceBtnEmoji}>🤖</Text>
            <View>
              <Text style={styles.traceBtnText}>View Agent Trace</Text>
              <Text style={styles.traceBtnSub}>See how AI processed your request</Text>
            </View>
            <Text style={styles.traceBtnArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Home Button */}
      <TouchableOpacity
        style={styles.homeBtn}
        activeOpacity={0.7}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.homeBtnText}>🏠 Back to Home</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 20,
  },
  checkSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 16,
  },
  checkGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
  },
  confirmedTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  confirmedSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 16,
  },
  idBadge: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  idBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 10,
  },
  idLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A5D6A7',
    letterSpacing: 1.5,
  },
  idValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 10,
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
    fontWeight: '700',
    textAlign: 'right',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  smsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  smsHeader: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  smsNotch: {
    width: 40,
    height: 5,
    backgroundColor: '#BDBDBD',
    borderRadius: 3,
    marginBottom: 4,
  },
  smsHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#757575',
  },
  smsBubble: {
    backgroundColor: '#E8F5E9',
    margin: 12,
    padding: 14,
    borderRadius: 14,
    borderTopLeftRadius: 4,
  },
  smsSender: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  smsText: {
    fontSize: 13,
    color: '#212121',
    lineHeight: 19,
  },
  smsTime: {
    fontSize: 10,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 6,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  reminderIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderIconText: {
    fontSize: 20,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  reminderTime: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  reminderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  btnContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  traceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  traceBtnEmoji: {
    fontSize: 28,
  },
  traceBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  traceBtnSub: {
    fontSize: 11,
    color: '#78909C',
    marginTop: 2,
  },
  traceBtnArrow: {
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: '700',
    marginLeft: 'auto',
  },
  homeBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
});

export default BookingScreen;
