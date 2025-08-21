import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, Shield, Zap, Smartphone } from 'lucide-react-native';
import { VpnConfig, ConnectionStatus } from '@/types/vpn';

interface ConnectionStatusBarProps {
  config: VpnConfig | null;
  status: ConnectionStatus;
}

export default function ConnectionStatusBar({ config, status }: ConnectionStatusBarProps) {
  if (status === 'disconnected') {
    return null;
  }

  const getStatusInfo = () => {
    if (status === 'connected' && config) {
      return {
        icon: config.proto === 'udp' ? <Zap size={16} color="#4ade80" /> : <Shield size={16} color="#3b82f6" />,
        text: `System VPN: ${config.proto.toUpperCase()}:${config.port} • All Apps Protected`,
        color: config.proto === 'udp' ? '#4ade80' : '#3b82f6',
        bgColor: config.proto === 'udp' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(59, 130, 246, 0.2)',
        borderColor: config.proto === 'udp' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(59, 130, 246, 0.3)',
      };
    } else if (status === 'connecting') {
      return {
        icon: <Smartphone size={16} color="#f59e0b" />,
        text: 'Configuring System VPN • Smart Auto-Fallback Active',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      };
    } else if (status === 'disconnecting') {
      return {
        icon: <Shield size={16} color="#64748b" />,
        text: 'Disconnecting System VPN • Restoring Normal Traffic',
        color: '#64748b',
        bgColor: 'rgba(100, 116, 139, 0.2)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
      };
    }
    
    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: statusInfo.bgColor,
        borderBottomColor: statusInfo.borderColor,
      }
    ]}>
      <View style={styles.content}>
        {statusInfo.icon}
        <Text style={[styles.text, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
        <View style={[styles.indicator, { backgroundColor: statusInfo.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    textAlign: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});