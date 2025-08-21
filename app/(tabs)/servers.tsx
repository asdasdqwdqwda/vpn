import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Server, Wifi, Shield, Check, Zap, Clock } from 'lucide-react-native';
import { VpnServer, VpnConfig } from '@/types/vpn';
import { SystemVpnService } from '@/services/SystemVpnService';

export default function ServersScreen() {
  const [selectedServer, setSelectedServer] = useState('canada-udp-53');
  const [currentConfig, setCurrentConfig] = useState<VpnConfig | null>(null);

  const systemVpnService = SystemVpnService.getInstance();

  useEffect(() => {
    systemVpnService.onConfigChange(setCurrentConfig);
  }, []);

  const servers: VpnServer[] = [
    {
      id: 'canada-udp-53',
      name: 'Canada - UDP 53',
      location: 'Toronto, Canada',
      protocol: 'UDP',
      port: 53,
      ping: 42,
      load: 18,
      premium: true,
      flag: '🇨🇦',
      priority: 1,
      speed: 'Fastest',
    },
    {
      id: 'canada-udp-25000',
      name: 'Canada - UDP 25000',
      location: 'Toronto, Canada',
      protocol: 'UDP',
      port: 25000,
      ping: 47,
      load: 28,
      premium: true,
      flag: '🇨🇦',
      priority: 2,
      speed: 'Fast',
    },
    {
      id: 'canada-tcp-443',
      name: 'Canada - TCP 443',
      location: 'Toronto, Canada',
      protocol: 'TCP',
      port: 443,
      ping: 45,
      load: 23,
      premium: false,
      flag: '🇨🇦',
      priority: 3,
      speed: 'Reliable',
    },
    {
      id: 'canada-tcp-80',
      name: 'Canada - TCP 80',
      location: 'Toronto, Canada',
      protocol: 'TCP',
      port: 80,
      ping: 48,
      load: 31,
      premium: false,
      flag: '🇨🇦',
      priority: 4,
      speed: 'Backup',
    },
  ];

  const getLoadColor = (load: number) => {
    if (load < 30) return '#22c55e';
    if (load < 70) return '#f59e0b';
    return '#ef4444';
  };

  const getPingColor = (ping: number) => {
    if (ping < 50) return '#22c55e';
    if (ping < 100) return '#f59e0b';
    return '#ef4444';
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Fastest': return '#22c55e';
      case 'Fast': return '#4ade80';
      case 'Reliable': return '#3b82f6';
      case 'Backup': return '#64748b';
      default: return '#64748b';
    }
  };

  const isCurrentlyConnected = (serverId: string) => {
    if (!currentConfig) return false;
    const server = servers.find(s => s.id === serverId);
    return server && 
           currentConfig.proto === server.protocol.toLowerCase() && 
           currentConfig.port === server.port;
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <Text style={styles.title}>VPN Servers</Text>
        <Text style={styles.subtitle}>System VPN • Smart Auto-Fallback</Text>
      </View>

      {/* System VPN Auto-Fallback Banner */}
      <View style={styles.fallbackBanner}>
        <Zap size={20} color="#f59e0b" />
        <Text style={styles.fallbackBannerText}>
          System VPN: UDP first → TCP fallback • All device traffic protected
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {servers.map((server) => (
          <TouchableOpacity
            key={server.id}
            style={[
              styles.serverCard,
              selectedServer === server.id && styles.selectedServer,
              isCurrentlyConnected(server.id) && styles.connectedServer,
            ]}
            onPress={() => setSelectedServer(server.id)}
          >
            <View style={styles.serverHeader}>
              <View style={styles.serverInfo}>
                <Text style={styles.flag}>{server.flag}</Text>
                <View style={styles.serverDetails}>
                  <View style={styles.serverNameRow}>
                    <Text style={styles.serverName}>{server.name}</Text>
                    <View style={styles.priorityBadge}>
                      <Clock size={12} color="#64748b" />
                      <Text style={styles.priorityText}>#{server.priority}</Text>
                    </View>
                  </View>
                  <Text style={styles.serverLocation}>{server.location}</Text>
                </View>
              </View>
              <View style={styles.serverStatus}>
                {isCurrentlyConnected(server.id) && (
                  <View style={styles.connectedBadge}>
                    <Check size={16} color="#22c55e" strokeWidth={2.5} />
                    <Text style={styles.connectedText}>ACTIVE</Text>
                  </View>
                )}
                {selectedServer === server.id && !isCurrentlyConnected(server.id) && (
                  <Check size={24} color="#4ade80" strokeWidth={2.5} />
                )}
                {server.premium && (
                  <View style={styles.premiumBadge}>
                    <Shield size={12} color="#f59e0b" />
                    <Text style={styles.premiumText}>PRO</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.serverStats}>
              <View style={styles.statItem}>
                <Wifi size={16} color={getPingColor(server.ping)} />
                <Text style={styles.statLabel}>Ping</Text>
                <Text style={[styles.statValue, { color: getPingColor(server.ping) }]}>
                  {server.ping}ms
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Server size={16} color={getLoadColor(server.load)} />
                <Text style={styles.statLabel}>Load</Text>
                <Text style={[styles.statValue, { color: getLoadColor(server.load) }]}>
                  {server.load}%
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Zap size={16} color={getSpeedColor(server.speed)} />
                <Text style={styles.statLabel}>Speed</Text>
                <Text style={[styles.statValue, { color: getSpeedColor(server.speed) }]}>
                  {server.speed}
                </Text>
              </View>
            </View>

            <View style={styles.protocolInfo}>
              <Text style={styles.protocolText}>
                {server.protocol}:{server.port} • Priority #{server.priority}
              </Text>
            </View>

            <View style={styles.loadBar}>
              <View style={styles.loadBarBackground}>
                <View
                  style={[
                    styles.loadBarFill,
                    {
                      width: `${server.load}%`,
                      backgroundColor: getLoadColor(server.load),
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 System VPN routes ALL device traffic (YouTube, WhatsApp, etc.)
        </Text>
        <Text style={styles.footerAuth}>
          🔐 All servers use: vpnbook / m34wk9w
        </Text>
      </View>
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
    marginBottom: 20,
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
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  fallbackBannerText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serverCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedServer: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  connectedServer: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  serverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  serverDetails: {
    flex: 1,
  },
  serverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginLeft: 2,
  },
  serverLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  connectedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#22c55e',
    marginLeft: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginLeft: 4,
  },
  serverStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
    marginRight: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  protocolInfo: {
    marginBottom: 12,
  },
  protocolText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  loadBar: {
    marginTop: 8,
  },
  loadBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerAuth: {
    fontSize: 11,
    color: '#22c55e',
    textAlign: 'center',
    fontWeight: '500',
  },
});