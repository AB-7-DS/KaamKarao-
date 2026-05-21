import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ProviderCard = ({
  name = 'Ustad Karim',
  service = 'Plumber',
  rating = 4.8,
  totalRatings = 127,
  distance = '2.3 km',
  available = true,
  phone = '+92 312 456 7890',
  priceRange = 'Rs. 800 - 1,500',
  experience = '8 years',
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (hasHalf) stars += '★';
    while (stars.length < 5) stars += '☆';
    return stars;
  };

  const getServiceColor = (svc) => {
    const colors = {
      Plumber: '#2196F3',
      Electrician: '#FF9800',
      'AC Repair': '#00BCD4',
      Carpenter: '#795548',
      Painter: '#9C27B0',
    };
    return colors[svc] || '#4CAF50';
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>{renderStars(rating)}</Text>
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.ratingCount}>({totalRatings})</Text>
          </View>
        </View>
        <View style={[styles.statusDot, { backgroundColor: available ? '#4CAF50' : '#F44336' }]} />
        <Text style={[styles.statusText, { color: available ? '#4CAF50' : '#F44336' }]}>
          {available ? 'Available' : 'Busy'}
        </Text>
      </View>

      {/* Service Badge */}
      <View style={styles.badgeRow}>
        <View style={[styles.serviceBadge, { backgroundColor: getServiceColor(service) + '20' }]}>
          <Text style={[styles.serviceBadgeText, { color: getServiceColor(service) }]}>
            {service}
          </Text>
        </View>
        <View style={styles.experienceBadge}>
          <Text style={styles.experienceBadgeText}>🏆 {experience}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>{distance}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💰</Text>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>{priceRange}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📞</Text>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{phone}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 4,
    elevation: 6,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1B5E20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    color: '#FF6F00',
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6F00',
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: '#757575',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  serviceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  experienceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
  },
  experienceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8F5E9',
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default ProviderCard;
