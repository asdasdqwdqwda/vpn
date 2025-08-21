import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Activity, 
  Download, 
  Upload, 
  Timer, 
  Shield, 
  Wifi,
  Smartphone
} from 'lucide-react-native';
import { AndroidVpnService } from '@/services/AndroidVpnService';

export default function StatsScreen() {
  const [stats, setStats] = useState({
    totalData: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    sessionTime: '00:00:00',
    dataUsed: 0,
    dataSaved: 0,
    connections: 42,
    blockedThreats: 127,
  });
  const [protectedApps, setProtectedApps] = useState<string[]>([]);
  const [androidStats, setAndroidStats] = useState<any>(null);

  const androidVpnService = AndroidVpnService.getInstance();
  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        downloadSpeed: Math.floor(Math.random() * 50) + 10,
        uploadSpeed: Math.floor(Math.random() * 20) + 5,
        dataUsed: prev.dataUsed + Math.random() * 0.1,
      }));
    }, 2000);

    // Load Android-specific data
    if (Platform.OS === 'android') {
      loadAndroidData();
    }

    return () => clearInterval(interval);
  }, []);

  const loadAndroidData = async () => {
    try {
      const apps = await androidVpnService.getAppsUsingVpn();
      const vpnStats = await androidVpnService.getVpnStatistics();
      
      setProtectedApps(apps);
      setAndroidStats(vpnStats);
    } catch (error) {
      console.error('Failed to load Android VPN data:', error);
    }
  };
  const formatData = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(1)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getAppName = (packageName: string) => {
    const appNames: { [key: string]: string } = {
      'com.google.android.youtube': 'YouTube',
      'com.whatsapp': 'WhatsApp',
      'com.android.chrome': 'Chrome',
      'com.instagram.android': 'Instagram',
      'com.facebook.katana': 'Facebook',
      'com.twitter.android': 'Twitter',
      'com.spotify.music': 'Spotify',
      'com.netflix.mediaclient': 'Netflix',
    };
    return appNames[packageName] || packageName;
  };
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>
          {Platform.OS === 'android' ? 'Android System VPN Stats' : 'System VPN Usage Overview'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Real-time Speed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real-time Speed</Text>
          <View style={styles.speedContainer}>
            <View style={styles.speedCard}>
              <Download size={24} color="#4ade80" />
              <Text style={styles.speedValue}>{stats.downloadSpeed}</Text>
              <Text style={styles.speedUnit}>Mbps</Text>
              <Text style={styles.speedLabel}>Download</Text>
            </View>
            <View style={styles.speedCard}>
              <Upload size={24} color="#3b82f6" />
              <Text style={styles.speedValue}>{stats.uploadSpeed}</Text>
              <Text style={styles.speedUnit}>Mbps</Text>
              <Text style={styles.speedLabel}>Upload</Text>
            </View>
          </View>
        </View>

        {/* Session Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Session</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Timer size={20} color="#f59e0b" />
              <Text style={styles.statValue}>02:34:16</Text>
              <Text style={styles.statLabel}>Session Time</Text>
            </View>
            <View style={styles.statCard}>
              <Activity size={20} color="#8b5cf6" />
              <Text style={styles.statValue}>{formatData(stats.dataUsed * 1024 * 1024)}</Text>
              <Text style={styles.statLabel}>Data Used</Text>
            </View>
          </View>
        </View>

        {/* Security Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Protection</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Shield size={20} color="#10b981" />
              <Text style={styles.statValue}>{stats.blockedThreats}</Text>
              <Text style={styles.statLabel}>System Threats Blocked</Text>
            </View>
            <View style={styles.statCard}>
              <Wifi size={20} color="#06b6d4" />
              <Text style={styles.statValue}>{stats.connections}</Text>
              <Text style={styles.statLabel}>Protected App Connections</Text>
            </View>
          </View>
        </View>

        {/* Monthly Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>156.7 GB</Text>
              <Text style={styles.overviewLabel}>Total Data</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>127 hrs</Text>
              <Text style={styles.overviewLabel}>Connection Time</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>94.2%</Text>
              <Text style={styles.overviewLabel}>Uptime</Text>
            </View>
          </View>
        </View>

        {/* Data Savings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Optimization</Text>
          <View style={styles.savingsCard}>
            <View style={styles.savingsHeader}>
              <Text style={styles.savingsValue}>23.4 GB</Text>
              <Text style={styles.savingsLabel}>Data Saved</Text>
            </View>
            <View style={styles.savingsBar}>
              <View style={styles.savingsBarBackground}>
                <View style={[styles.savingsBarFill, { width: '67%' }]} />
              </View>
              <Text style={styles.savingsPercentage}>67% compression ratio</Text>
            </View>
          </View>
        </View>

        {/* Android Protected Apps */}
        {Platform.OS === 'android' && protectedApps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Protected Android Apps</Text>
            <View style={styles.appsGrid}>
              {protectedApps.slice(0, 8).map((app, index) => (
                <View key={index} style={styles.appCard}>
                  <Smartphone size={16} color="#4ade80" />
                  <Text style={styles.appName}>{getAppName(app)}</Text>
                  <View style={styles.protectedIndicator} />
                </View>
              ))}
            </View>
            <Text style={styles.appsNote}>
              All {protectedApps.length} installed apps are protected via system VPN
            </Text>
          </View>
        )}

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {Platform.OS === 'android' ? 'Android VPN Performance' : 'System VPN Performance'}
          </Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>18ms</Text>
              <Text style={styles.performanceLabel}>
                {Platform.OS === 'android' ? 'Android Latency' : 'System Latency'}
              </Text>
              <View style={[styles.performanceIndicator, { backgroundColor: '#22c55e' }]} />
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>99.9%</Text>
              <Text style={styles.performanceLabel}>Reliability</Text>
              <View style={[styles.performanceIndicator, { backgroundColor: '#22c55e' }]} />
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>AES-256</Text>
              <Text style={styles.performanceLabel}>Encryption</Text>
              <View style={[styles.performanceIndicator, { backgroundColor: '#22c55e' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  speedContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  speedCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  speedValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 2,
  },
  speedUnit: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  speedLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  savingsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  savingsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 4,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  savingsBar: {
    alignItems: 'center',
  },
  savingsBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  savingsBarFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  savingsPercentage: {
    fontSize: 12,
    color: '#64748b',
  },
  performanceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  performanceIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 8,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  appName: {
    fontSize: 12,
    color: 'white',
    marginLeft: 6,
    flex: 1,
  },
  protectedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  appsNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});