import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (!result.success) {
                Alert.alert('Error', result.error || 'Logout failed');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated Background */}
      <View style={styles.backgroundGradient}>
        <View style={styles.floatingOrbs}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
          <View style={[styles.orb, styles.orb3]} />
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Ionicons name="person" size={32} color="#FFFFFF" style={styles.titleIcon} />
                <Text style={styles.title}>Profile</Text>
              </View>
              <Text style={styles.subtitle}>Your AI assistant account</Text>
            </View>

            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.aiStatusIndicator}>
                  <View style={styles.aiPulse} />
                  <View style={styles.aiDot} />
                </View>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                <Text style={styles.userStatus}>AI Assistant Active</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <Text style={styles.sectionSubtitle}>Your profile details</Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="id-card" size={18} color="#6366F1" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>User ID</Text>
                    <Text style={styles.infoValue}>{user?.id || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="calendar" size={18} color="#6366F1" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="refresh" size={18} color="#6366F1" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Last Updated</Text>
                    <Text style={styles.infoValue}>
                      {user?.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actionsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <Text style={styles.sectionSubtitle}>Manage your account</Text>
              </View>

              <View style={styles.actionsCard}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert('Coming Soon', 'Edit profile functionality will be available soon');
                  }}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="create" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Edit Profile</Text>
                    <Text style={styles.actionSubtitle}>Update your information</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert('Coming Soon', 'Settings functionality will be available soon');
                  }}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="settings" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Settings</Text>
                    <Text style={styles.actionSubtitle}>App preferences</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <View style={styles.logoutIconContainer}>
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                  </View>
                  <View style={styles.logoutContent}>
                    <Text style={styles.logoutTitle}>Sign Out</Text>
                    <Text style={styles.logoutSubtitle}>Logout from your account</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0A0A',
  },
  floatingOrbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: '#6366F1',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: '#8B5CF6',
    top: 200,
    left: -30,
  },
  orb3: {
    width: 100,
    height: 100,
    backgroundColor: '#EC4899',
    top: 400,
    right: 50,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120, // Add space for the bottom tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#6366F1',
    textAlign: 'center',
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  aiStatusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  aiPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  aiDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  userStatus: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionsSection: {
    flex: 1,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutContent: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 2,
  },
  logoutSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});