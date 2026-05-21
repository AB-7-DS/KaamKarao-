import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AgentTraceView from '../components/AgentTraceView';

const DEFAULT_TRACE = [
  {
    agent: 'Intent Agent',
    icon: '🧠',
    status: 'done',
    duration: 342,
    input: { userInput: 'Plumber G-10 kal subah', language: 'roman-urdu' },
    output: {
      intent: 'book_service',
      service: 'plumber',
      location: 'G-10',
      timePreference: 'kal subah (tomorrow morning)',
      urgency: 'normal',
      confidence: 0.96,
    },
  },
  {
    agent: 'Matching Agent',
    icon: '🔍',
    status: 'done',
    duration: 567,
    input: { service: 'plumber', location: 'G-10', timePreference: 'morning' },
    output: {
      matchedProviders: 3,
      bestMatch: 'Ustad Karim',
      matchScore: 0.94,
      distance: '2.3km',
      rating: 4.8,
      availability: 'confirmed',
    },
  },
  {
    agent: 'Booking Agent',
    icon: '📅',
    status: 'done',
    duration: 623,
    input: { providerId: 'P-127', slot: '9:00-11:00', date: 'tomorrow' },
    output: {
      bookingId: 'KK-A3F7K2',
      confirmed: true,
      estimatedCost: 'Rs. 800-1500',
      paymentMethod: 'cash',
      cancellationPolicy: 'Free up to 2hrs before',
    },
  },
  {
    agent: 'Follow-up Agent',
    icon: '🔔',
    status: 'done',
    duration: 315,
    input: { bookingId: 'KK-A3F7K2', phone: '+923124567890' },
    output: {
      smsSent: true,
      smsLanguage: 'roman-urdu',
      reminders: ['1hr before', '15min before'],
      ratingScheduled: true,
      feedbackSurvey: 'pending',
    },
  },
];

const TraceScreen = ({ route }) => {
  const trace = route.params?.trace?.length ? route.params.trace : DEFAULT_TRACE;
  const bookingId = route.params?.bookingId || 'KK-A3F7K2';

  const totalDuration = trace.reduce((sum, a) => sum + (a.duration || 0), 0);

  // Entrance animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const cardAnims = useRef(trace.map(() => ({
    fade: new Animated.Value(0),
    slide: new Animated.Value(50),
  }))).current;
  const footerFade = useRef(new Animated.Value(0)).current;
  const footerScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Header
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger cards
    const cardAnimations = cardAnims.map((anim, idx) =>
      Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 1,
          duration: 400,
          delay: 300 + idx * 200,
          useNativeDriver: true,
        }),
        Animated.spring(anim.slide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          delay: 300 + idx * 200,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(cardAnimations).start();

    // Footer
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(footerFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(footerScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300 + trace.length * 200 + 200);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFade,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          <LinearGradient
            colors={['#16213e', '#0f3460']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerIcon}>🤖</Text>
            <Text style={styles.headerTitle}>AI Agent Pipeline</Text>
            <Text style={styles.headerSubtitle}>
              Multi-Agent Orchestration for Booking {bookingId}
            </Text>

            {/* Pipeline Visual */}
            <View style={styles.pipeline}>
              {trace.map((agent, idx) => (
                <React.Fragment key={idx}>
                  <View style={styles.pipelineNode}>
                    <View style={styles.pipelineCircle}>
                      <Text style={styles.pipelineEmoji}>{agent.icon}</Text>
                    </View>
                    <Text style={styles.pipelineLabel}>
                      {(agent.agent || '').split(' ')[0]}
                    </Text>
                  </View>
                  {idx < trace.length - 1 && (
                    <View style={styles.pipelineLine}>
                      <Text style={styles.pipelineArrow}>→</Text>
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Agent Cards */}
        <View style={styles.cardsSection}>
          <Text style={styles.cardsTitle}>📊 Agent Execution Details</Text>
          <Text style={styles.cardsSubtitle}>Tap any agent to see input/output data</Text>

          {trace.map((agent, idx) => (
            <Animated.View
              key={idx}
              style={{
                opacity: cardAnims[idx].fade,
                transform: [{ translateY: cardAnims[idx].slide }],
              }}
            >
              <View style={styles.stepIndicator}>
                <View style={styles.stepLine} />
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{idx + 1}</Text>
                </View>
                <View style={styles.stepLine} />
              </View>
              <AgentTraceView agent={agent} />
            </Animated.View>
          ))}
        </View>

        {/* Total Duration Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: footerFade,
              transform: [{ scale: footerScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.totalBadge}
          >
            <Text style={styles.totalIcon}>⚡</Text>
            <View>
              <Text style={styles.totalLabel}>Total Pipeline Duration</Text>
              <Text style={styles.totalValue}>{totalDuration.toLocaleString()}ms</Text>
            </View>
          </LinearGradient>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trace.length}</Text>
              <Text style={styles.statLabel}>Agents</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {trace.filter((a) => a.status === 'done').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(totalDuration / trace.length)}ms
              </Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
          </View>

          {/* Tech Stack Info */}
          <View style={styles.techCard}>
            <Text style={styles.techTitle}>🛠️ Tech Stack</Text>
            <View style={styles.techRow}>
              <View style={styles.techBadge}>
                <Text style={styles.techText}>Google ADK</Text>
              </View>
              <View style={styles.techBadge}>
                <Text style={styles.techText}>Gemini 2.5</Text>
              </View>
              <View style={styles.techBadge}>
                <Text style={styles.techText}>Multi-Agent</Text>
              </View>
            </View>
            <View style={styles.techRow}>
              <View style={styles.techBadge}>
                <Text style={styles.techText}>React Native</Text>
              </View>
              <View style={styles.techBadge}>
                <Text style={styles.techText}>Node.js</Text>
              </View>
              <View style={styles.techBadge}>
                <Text style={styles.techText}>Firestore</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 8,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ECEFF1',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 4,
    textAlign: 'center',
  },
  pipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  pipelineNode: {
    alignItems: 'center',
  },
  pipelineCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  pipelineEmoji: {
    fontSize: 20,
  },
  pipelineLabel: {
    fontSize: 9,
    color: '#78909C',
    marginTop: 4,
    fontWeight: '700',
  },
  pipelineLine: {
    marginHorizontal: 4,
    justifyContent: 'center',
    marginBottom: 16,
  },
  pipelineArrow: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
  },
  cardsSection: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  cardsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ECEFF1',
    marginBottom: 2,
    marginLeft: 4,
  },
  cardsSubtitle: {
    fontSize: 12,
    color: '#546E7A',
    marginBottom: 12,
    marginLeft: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: -4,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 14,
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  totalIcon: {
    fontSize: 32,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C8E6C9',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 14,
    marginTop: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 10,
    color: '#78909C',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  techCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ECEFF1',
    marginBottom: 10,
  },
  techRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  techBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  techText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#81C784',
  },
});

export default TraceScreen;
