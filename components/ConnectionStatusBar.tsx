import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, Shield, Zap } from 'lucide-react-native';
import { VpnConfig, ConnectionStatus } from '@/types/vpn';

interface ConnectionStatusBarProps {
  config: VpnConfig | null;
  status: ConnectionStatus;
}

export default function ConnectionStatusBar({ config, status }: ConnectionStatusBarProps) {
  if (!config || status !== 'connected') {
    return null;
  }

  const getProtocolIcon = () => {
    if (config.proto === 'udp') {
      return <Zap size={16} color="#4ade80" />;
    }
    return <Shield size={16} color="#3b82f6" />;
  };

  const getProtocolColor = () => {
    return config.proto === 'udp' ? '#4ade80' : '#3b82f6';
  };

  return (
    <View style={[styles.container, { backgroundColor: `rgba(${config.proto === 'udp' ? '74, 222, 128' : '59, 130, 246'}, 0.2)` }]}>
      <View style={styles.content}>
        {getProtocolIcon()}
        <Text style={[styles.text, { color: getProtocolColor() }]}>
          Connected via {config.proto.toUpperCase()}:{config.port}
        </Text>
        <View style={[styles.indicator, { backgroundColor: getProtocolColor() }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 20,
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
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});