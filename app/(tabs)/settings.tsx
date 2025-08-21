import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Lock, 
  Smartphone,
  Globe,
  Info,
  MessageCircle,
  Star,
  ChevronRight,
  Wifi
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [autoConnect, setAutoConnect] = useState(true);
  const [killSwitch, setKillSwitch] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataCompression, setDataCompression] = useState(false);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    hasSwitch = false, 
    switchValue, 
    onSwitchChange 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={hasSwitch}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#374151', true: '#4ade80' }}
            thumbColor={switchValue ? 'white' : '#f3f4f6'}
          />
        ) : (
          <ChevronRight size={20} color="#64748b" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your VPN experience</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Connection Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Wifi size={20} color="#4ade80" />}
              title="Auto Connect"
              subtitle="Connect automatically on untrusted networks"
              hasSwitch
              switchValue={autoConnect}
              onSwitchChange={setAutoConnect}
            />
            <SettingItem
              icon={<Shield size={20} color="#ef4444" />}
              title="Kill Switch"
              subtitle="Block internet if VPN disconnects"
              hasSwitch
              switchValue={killSwitch}
              onSwitchChange={setKillSwitch}
            />
            <SettingItem
              icon={<Globe size={20} color="#3b82f6" />}
              title="Protocol Settings"
              subtitle="OpenVPN, TCP/UDP configuration"
              onPress={() => showAlert('Protocol Settings', 'Advanced protocol configuration coming soon')}
            />
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Privacy</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Lock size={20} color="#f59e0b" />}
              title="DNS Protection"
              subtitle="Block malicious domains and ads"
              onPress={() => showAlert('DNS Protection', 'Enhanced DNS protection is enabled')}
            />
            <SettingItem
              icon={<Smartphone size={20} color="#8b5cf6" />}
              title="Data Compression"
              subtitle="Reduce data usage by up to 50%"
              hasSwitch
              switchValue={dataCompression}
              onSwitchChange={setDataCompression}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<Bell size={20} color="#06b6d4" />}
              title="Push Notifications"
              subtitle="Connection status and security alerts"
              hasSwitch
              switchValue={notifications}
              onSwitchChange={setNotifications}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Info</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<MessageCircle size={20} color="#10b981" />}
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => showAlert('Help Center', 'Opening help center...')}
            />
            <SettingItem
              icon={<Star size={20} color="#f59e0b" />}
              title="Rate App"
              subtitle="Share your feedback"
              onPress={() => showAlert('Rate App', 'Thank you for using SecureVPN!')}
            />
            <SettingItem
              icon={<Info size={20} color="#64748b" />}
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => showAlert('About', 'SecureVPN v1.0.0\nSecure Canadian VPN Service')}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>SecureVPN</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoAuth}>vpnbook / m34wk9w</Text>
          <Text style={styles.appInfoCopyright}>© 2024 SecureVPN Canada</Text>
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
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  settingRight: {
    marginLeft: 16,
  },
  appInfo: {
    alignItems: 'center',
    padding: 40,
    paddingBottom: 60,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  appInfoAuth: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
    marginBottom: 8,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: '#64748b',
  },
});