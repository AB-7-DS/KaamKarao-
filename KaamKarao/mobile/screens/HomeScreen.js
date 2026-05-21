import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ChatBubble from '../components/ChatBubble';
import { sendServiceRequest } from '../services/api';

const { width } = Dimensions.get('window');

const AGENTS = [
  { name: 'Intent Agent', icon: '🧠', desc: 'Understanding your request...' },
  { name: 'Matching Agent', icon: '🔍', desc: 'Finding best providers...' },
  { name: 'Booking Agent', icon: '📅', desc: 'Securing your slot...' },
  { name: 'Follow-up Agent', icon: '🔔', desc: 'Scheduling reminders...' },
];

const QUICK_MESSAGES = [
  '🔧 Plumber G-10 kal subah',
  '❄️ AC repair F-7 today',
  '⚡ Bijli wala I-8 abhi',
];

const MOCK_RESPONSE = {
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
  smsPreview: 'Booking confirmed! Ustad Karim (Plumber) will arrive at G-10/2 tomorrow 9 AM. Booking ID: KK-A3F7K2. Call: 0312-4567890',
  agentTrace: [
    {
      agent: 'Intent Agent',
      icon: '🧠',
      status: 'done',
      duration: 342,
      input: { userInput: '', language: 'roman-urdu' },
      output: { intent: 'book_service', service: 'plumber', location: 'G-10', timePreference: 'kal subah', urgency: 'normal' },
    },
    {
      agent: 'Matching Agent',
      icon: '🔍',
      status: 'done',
      duration: 567,
      input: { service: 'plumber', location: 'G-10', timePreference: 'morning' },
      output: { matchedProviders: 3, bestMatch: 'Ustad Karim', score: 0.94, distance: '2.3km' },
    },
    {
      agent: 'Booking Agent',
      icon: '📅',
      status: 'done',
      duration: 623,
      input: { providerId: 'P-127', slot: '9:00-11:00', date: 'tomorrow' },
      output: { bookingId: 'KK-A3F7K2', confirmed: true, estimatedCost: 'Rs. 800-1500' },
    },
    {
      agent: 'Follow-up Agent',
      icon: '🔔',
      status: 'done',
      duration: 315,
      input: { bookingId: 'KK-A3F7K2', phone: '+923124567890' },
      output: { smsSent: true, reminders: ['1hr before', '15min before'], ratingScheduled: true },
    },
  ],
};

const HomeScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      message: 'Assalam o Alaikum! 👋\n\nMein aapka AI assistant hoon. Kaam karane ke liye bas bataayein:\n\n• Kya service chahiye?\n• Kahan chahiye?\n• Kab chahiye?\n\nYa neeche se koi option tap karein! 👇',
      isUser: false,
      timestamp: formatTime(new Date()),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(-1);
  const [selectedLang, setSelectedLang] = useState(1);
  const scrollViewRef = useRef(null);

  // Agent animations
  const agentAnims = useRef(AGENTS.map(() => ({
    opacity: new Animated.Value(0.3),
    scale: new Animated.Value(0.85),
    progress: new Animated.Value(0),
  }))).current;

  // Header animation
  const headerScale = useRef(new Animated.Value(1)).current;

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  const animateAgents = useCallback((onComplete) => {
    setLoading(true);
    setActiveAgent(0);

    const animateAgent = (index) => {
      if (index >= AGENTS.length) {
        onComplete();
        return;
      }

      setActiveAgent(index);

      // Activate current agent
      Animated.parallel([
        Animated.timing(agentAnims[index].opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(agentAnims[index].scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(agentAnims[index].progress, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]).start();

      // Move to next after delay
      setTimeout(() => {
        // Dim current agent
        Animated.parallel([
          Animated.timing(agentAnims[index].opacity, {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(agentAnims[index].scale, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        animateAgent(index + 1);
      }, 1500);
    };

    // Reset all anims
    agentAnims.forEach((a) => {
      a.opacity.setValue(0.3);
      a.scale.setValue(0.85);
      a.progress.setValue(0);
    });

    animateAgent(0);
  }, [agentAnims]);

  const handleSend = async (text) => {
    const userMsg = text || inputText;
    if (!userMsg.trim()) return;

    const now = new Date();
    const newUserMsg = {
      id: String(Date.now()),
      message: userMsg.trim(),
      isUser: true,
      timestamp: formatTime(now),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');

    // Update mock with user input
    const mockData = { ...MOCK_RESPONSE };
    mockData.agentTrace = mockData.agentTrace.map((a) =>
      a.agent === 'Intent Agent'
        ? { ...a, input: { ...a.input, userInput: userMsg.trim() } }
        : a
    );

    // Try real API first, fallback to mock
    let responseData = null;

    animateAgents(() => {
      setLoading(false);
      setActiveAgent(-1);

      const botResponse = responseData || mockData;
      const botMsg = {
        id: String(Date.now() + 1),
        message: `✅ Booking Confirmed!\n\n🔧 Service: ${botResponse.service}\n📍 Location: ${botResponse.location}\n⏰ Time: ${botResponse.timeSlot}\n👨‍🔧 Provider: ${botResponse.provider.name}\n⭐ Rating: ${botResponse.provider.rating}/5\n\n🆔 Booking ID: ${botResponse.bookingId}`,
        isUser: false,
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, botMsg]);

      setTimeout(() => {
        navigation.navigate('Booking', { booking: botResponse });
      }, 1800);
    });

    // Attempt API call in background
    try {
      const res = await sendServiceRequest(userMsg.trim());
      responseData = res;
    } catch {
      responseData = null; // fall back to mock
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages, loading]);

  const languages = ['🇵🇰 Urdu', 'Roman Urdu', 'English'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Gradient Header Area */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#388E3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerContent, { transform: [{ scale: headerScale }] }]}>
          <Text style={styles.headerUrdu}>کام کراؤ</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Service Booking</Text>
          <Text style={styles.headerTagline}>🇵🇰 Pakistan's Smartest Service Platform</Text>
        </Animated.View>

        {/* Language Selector */}
        <View style={styles.langRow}>
          {languages.map((lang, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.langPill, selectedLang === idx && styles.langPillActive]}
              onPress={() => setSelectedLang(idx)}
              activeOpacity={0.7}
            >
              <Text style={[styles.langText, selectedLang === idx && styles.langTextActive]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}

        {/* Agent Progress Loader */}
        {loading && (
          <View style={styles.agentProgressContainer}>
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={styles.agentProgressCard}
            >
              <Text style={styles.agentProgressTitle}>🤖 AI Agents Working...</Text>
              {AGENTS.map((agent, idx) => {
                const progressWidth = agentAnims[idx].progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                });
                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.agentStep,
                      {
                        opacity: agentAnims[idx].opacity,
                        transform: [{ scale: agentAnims[idx].scale }],
                      },
                      activeAgent === idx && styles.agentStepActive,
                    ]}
                  >
                    <View style={styles.agentStepHeader}>
                      <Text style={styles.agentIcon}>{agent.icon}</Text>
                      <View style={styles.agentStepInfo}>
                        <Text style={[
                          styles.agentName,
                          activeAgent === idx && styles.agentNameActive,
                        ]}>
                          {agent.name}
                        </Text>
                        <Text style={styles.agentDesc}>{agent.desc}</Text>
                      </View>
                      {activeAgent > idx && (
                        <Text style={styles.agentDone}>✅</Text>
                      )}
                      {activeAgent === idx && (
                        <Text style={styles.agentRunning}>⚡</Text>
                      )}
                    </View>
                    {activeAgent === idx && (
                      <View style={styles.progressBarBg}>
                        <Animated.View
                          style={[styles.progressBarFill, { width: progressWidth }]}
                        />
                      </View>
                    )}
                  </Animated.View>
                );
              })}
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      {!loading && messages.length <= 1 && (
        <View style={styles.quickActions}>
          <Text style={styles.quickLabel}>⚡ Quick Demo</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScroll}
          >
            {QUICK_MESSAGES.map((msg, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                onPress={() => handleSend(msg)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#E8F5E9', '#C8E6C9']}
                  style={styles.quickChipGradient}
                >
                  <Text style={styles.quickChipText}>{msg}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your request..."
            placeholderTextColor="#9E9E9E"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={!loading}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || loading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              !inputText.trim() || loading
                ? ['#A5D6A7', '#A5D6A7']
                : ['#1B5E20', '#2E7D32']
            }
            style={styles.sendBtnGradient}
          >
            <Text style={styles.sendBtnText}>▶</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerUrdu: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#C8E6C9',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  headerTagline: {
    fontSize: 11,
    color: '#A5D6A7',
    marginTop: 4,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  langPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  langText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#1B5E20',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 12,
    paddingBottom: 16,
  },
  agentProgressContainer: {
    marginHorizontal: 12,
    marginTop: 8,
  },
  agentProgressCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  agentProgressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 12,
  },
  agentStep: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  agentStepActive: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F1F8E9',
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  agentStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  agentStepInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#616161',
  },
  agentNameActive: {
    color: '#1B5E20',
    fontSize: 14,
  },
  agentDesc: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 1,
  },
  agentDone: {
    fontSize: 16,
  },
  agentRunning: {
    fontSize: 18,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  quickActions: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#757575',
    marginBottom: 8,
    marginLeft: 4,
  },
  quickScroll: {
    gap: 8,
  },
  quickChip: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickChipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B5E20',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  textInput: {
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#212121',
  },
  sendBtn: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 2,
  },
});

export default HomeScreen;
