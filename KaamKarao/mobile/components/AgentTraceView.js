import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';

const AgentTraceView = ({ agent }) => {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    setExpanded(!expanded);
  };

  const isDone = agent.status === 'done' || agent.status === 'DONE';
  const borderColor = isDone ? '#4CAF50' : '#FFC107';
  const statusBg = isDone ? '#E8F5E9' : '#FFF8E1';
  const statusColor = isDone ? '#2E7D32' : '#F57F17';

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const outputData = agent.output || agent.result || { message: 'Processing complete' };
  const inputData = agent.input || agent.userInput || { query: agent.query || 'N/A' };

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>{agent.icon || '⚙️'}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.agentName}>{agent.agent || agent.name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {isDone ? '✅ DONE' : '⏳ RUNNING'}
              </Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                ⚡ {agent.duration || agent.durationMs || 0}ms
              </Text>
            </View>
          </View>
        </View>
        <Animated.Text
          style={[styles.arrow, { transform: [{ rotate: arrowRotation }] }]}
        >
          ▼
        </Animated.Text>
      </TouchableOpacity>

      <Animated.View style={[styles.body, { maxHeight: animatedHeight }]}>
        <View style={styles.bodyContent}>
          <Text style={styles.sectionLabel}>📥 INPUT</Text>
          <ScrollView
            style={styles.jsonScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.jsonText}>
              {JSON.stringify(inputData, null, 2)}
            </Text>
          </ScrollView>

          <Text style={styles.sectionLabel}>📤 OUTPUT</Text>
          <ScrollView
            style={styles.jsonScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.jsonText}>
              {JSON.stringify(outputData, null, 2)}
            </Text>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    marginVertical: 6,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ECEFF1',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#81D4FA',
  },
  arrow: {
    fontSize: 14,
    color: '#78909C',
    marginLeft: 8,
  },
  body: {
    overflow: 'hidden',
  },
  bodyContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4CAF50',
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 6,
  },
  jsonScroll: {
    backgroundColor: '#0d1b2a',
    borderRadius: 8,
    padding: 10,
    maxHeight: 80,
    marginBottom: 6,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#80CBC4',
    lineHeight: 16,
  },
});

export default AgentTraceView;
