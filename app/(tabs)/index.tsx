import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Power, MapPin, Timer, Wifi, Zap } from 'lucide-react-native';
import { SystemVpnService } from '@/services/SystemVpnService';
import { ConnectionStatus, VpnConfig } from '@/types/vpn';
import ConnectionStatusBar from '@/components/ConnectionStatusBar';

const { width } = Dimensions.get('window');

export default function ConnectScreen() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentConfig, setCurrentConfig] = useState<VpnConfig | null>(null);
  const [connectionTime, setConnectionTime] = useState('00:00:00');
  const [ipAddress, setIpAddress] = useState('Not connected');
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  const systemVpnService = SystemVpnService.getInstance();

  useEffect(() => {
    // Subscribe to status changes
    systemVpnService.onStatusChange(setConnectionStatus);
    systemVpnService.onConfigChange(setCurrentConfig);

    return () => {
      // Cleanup subscriptions would go here in a real implementation
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connectionStatus === 'connected') {
      let seconds = 0;
      interval = setInterval(() => {
        seconds++;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        setConnectionTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setConnectionTime('00:00:00');
    }
    return () => clearInterval(interval);
  }, [connectionStatus]);

  const handleConnect = async () => {
    if (connectionStatus === 'disconnected') {
      setFallbackAttempt(0);
      const success = await systemVpnService.connectWithAutoFallback();
      if (success) {
        setIpAddress('144.217.253.149');
      }
    } else if (connectionStatus === 'connected') {
      await systemVpnService.disconnect();
      setIpAddress('Not connected');
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return ['#22c55e', '#16a34a'];
      case 'connecting':
      case 'disconnecting':
        return ['#f59e0b', '#d97706'];
      default:
        return ['#ef4444', '#dc2626'];
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnecting':
        return 'Disconnecting...';
      default:
        return 'Disconnected';
    }
  };

  const getConnectionIcon = () => {
    if (connectionStatus === 'connecting' || connectionStatus === 'disconnecting') {
      return <Power size={64} color="white" strokeWidth={2.5} />;
    }
    return <Shield size={64} color="white" strokeWidth={2.5} />;
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* System VPN Status Bar */}
      <ConnectionStatusBar config={currentConfig} status={connectionStatus} />
      
      <View style={styles.header}>
        <Text style={styles.title}>SecureVPN</Text>
        <Text style={styles.subtitle}>System VPN • All Traffic Protected</Text>
      </View>

      <View style={styles.statusContainer}>
        <LinearGradient
          colors={getConnectionColor()}
          style={styles.connectionCircle}
        >
          <TouchableOpacity
            style={styles.connectionButton}
            onPress={handleConnect}
            disabled={connectionStatus === 'connecting' || connectionStatus === 'disconnecting'}
          >
            {getConnectionIcon()}
          </TouchableOpacity>
        </LinearGradient>
        
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.statusSubtext}>
          {connectionStatus === 'connected' 
            ? 'All device traffic is protected via Canada VPN' 
            : connectionStatus === 'connecting'
            ? 'Configuring system VPN with smart fallback'
            : 'Tap to enable system-wide VPN protection'
          }
        </Text>
      </View>

      {/* Smart Connection Info */}
      {connectionStatus === 'connecting' && (
        <View style={styles.fallbackInfo}>
          <Zap size={20} color="#f59e0b" />
          <Text style={styles.fallbackText}>
            System VPN: UDP first → TCP fallback (All apps protected)
          </Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Server Location</Text>
              <Text style={styles.infoValue}>Toronto, Canada</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Timer size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Connection Time</Text>
              <Text style={styles.infoValue}>{connectionTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Shield size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>IP Address</Text>
              <Text style={styles.infoValue}>{ipAddress}</Text>
            </View>
          </View>
        </View>

        {currentConfig && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Wifi size={20} color="#4ade80" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Active Protocol</Text>
                <Text style={styles.infoValue}>
                  {currentConfig.proto.toUpperCase()}:{currentConfig.port}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.protectionBanner}>
        <Text style={styles.bannerText}>
          {connectionStatus === 'connected' 
            ? '🔒 System VPN Active: YouTube, WhatsApp, Browser - All Protected'
            : '⚠️ System VPN Inactive: Device traffic not protected'
          }
        </Text>
      </View>

      {/* Fallback Chain Info */}
      <View style={styles.fallbackChain}>
        <Text style={styles.fallbackChainTitle}>System VPN Auto-Fallback Order:</Text>
        <View style={styles.authInfo}>
          <Text style={styles.authText}>
            🔐 Authentication: vpnbook / m34wk9w
          </Text>
        </View>
        <View style={styles.fallbackItems}>
          <View style={styles.fallbackItem}>
            <Text style={styles.fallbackNumber}>1</Text>
            <Text style={styles.fallbackProtocol}>UDP:53</Text>
            <Text style={styles.fallbackSpeed}>Fastest</Text>
          </View>
          <View style={styles.fallbackArrow}>
            <Text style={styles.fallbackArrowText}>→</Text>
          </View>
          <View style={styles.fallbackItem}>
            <Text style={styles.fallbackNumber}>2</Text>
            <Text style={styles.fallbackProtocol}>UDP:25000</Text>
            <Text style={styles.fallbackSpeed}>Fast</Text>
          </View>
          <View style={styles.fallbackArrow}>
            <Text style={styles.fallbackArrowText}>→</Text>
          </View>
          <View style={styles.fallbackItem}>
            <Text style={styles.fallbackNumber}>3</Text>
            <Text style={styles.fallbackProtocol}>TCP:443</Text>
            <Text style={styles.fallbackSpeed}>Reliable</Text>
          </View>
          <View style={styles.fallbackArrow}>
            <Text style={styles.fallbackArrowText}>→</Text>
          </View>
          <View style={styles.fallbackItem}>
            <Text style={styles.fallbackNumber}>4</Text>
            <Text style={styles.fallbackProtocol}>TCP:80</Text>
            <Text style={styles.fallbackSpeed}>Backup</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
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
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  connectionCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  connectionButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fallbackInfo: {
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
  fallbackText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  protectionBanner: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  fallbackChain: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fallbackChainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  authInfo: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  authText: {
    fontSize: 12,
    color: '#22c55e',
    textAlign: 'center',
    fontWeight: '500',
  },
  fallbackItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fallbackItem: {
    alignItems: 'center',
    flex: 1,
  },
  fallbackNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  fallbackProtocol: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  fallbackSpeed: {
    fontSize: 10,
    color: '#64748b',
  },
  fallbackArrow: {
    paddingHorizontal: 4,
  },
  fallbackArrowText: {
    fontSize: 16,
    color: '#64748b',
  },
});