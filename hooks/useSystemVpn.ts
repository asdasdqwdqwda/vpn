import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { SystemVpnService } from '@/services/SystemVpnService';
import { ConnectionStatus, VpnConfig } from '@/types/vpn';

export function useSystemVpn() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentConfig, setCurrentConfig] = useState<VpnConfig | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const systemVpnService = SystemVpnService.getInstance();

  useEffect(() => {
    // Subscribe to VPN status changes
    systemVpnService.onStatusChange(setConnectionStatus);
    systemVpnService.onConfigChange(setCurrentConfig);

    // Check initial permissions
    checkVpnPermissions();

    return () => {
      // Cleanup subscriptions
    };
  }, []);

  const checkVpnPermissions = async () => {
    try {
      if (Platform.OS === 'web') {
        setPermissionsGranted(true);
        return;
      }

      // Check if VPN permissions are already granted
      const granted = await systemVpnService.requestVpnPermissions();
      setPermissionsGranted(granted);

      if (!granted) {
        Alert.alert(
          'VPN Permissions Required',
          'This app needs VPN permissions to protect all your device traffic through our Canada servers.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permissions', onPress: requestPermissions },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to check VPN permissions:', error);
      setPermissionsGranted(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const granted = await systemVpnService.requestVpnPermissions();
      setPermissionsGranted(granted);

      if (granted) {
        Alert.alert(
          'System VPN Ready',
          'Your device is now ready for system-wide VPN protection. All app traffic will be routed through our secure Canada servers.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permissions Denied',
          'VPN permissions are required to protect your device traffic. Please enable them in system settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to request VPN permissions:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request VPN permissions. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const connectSystemVpn = async () => {
    if (!permissionsGranted) {
      await requestPermissions();
      return false;
    }

    try {
      const success = await systemVpnService.connectWithAutoFallback();
      
      if (success) {
        Alert.alert(
          'System VPN Connected',
          'All device traffic is now protected through our Canada VPN servers. YouTube, WhatsApp, Browser, and all other apps are secure.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Connection Failed',
          'Failed to establish system VPN connection. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }

      return success;
    } catch (error) {
      console.error('System VPN connection failed:', error);
      Alert.alert(
        'Connection Error',
        'An error occurred while connecting to the system VPN.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  const disconnectSystemVpn = async () => {
    try {
      const success = await systemVpnService.disconnect();
      
      if (success) {
        Alert.alert(
          'System VPN Disconnected',
          'Device traffic is no longer protected. Apps will use your regular internet connection.',
          [{ text: 'OK' }]
        );
      }

      return success;
    } catch (error) {
      console.error('System VPN disconnection failed:', error);
      return false;
    }
  };

  return {
    connectionStatus,
    currentConfig,
    permissionsGranted,
    connectSystemVpn,
    disconnectSystemVpn,
    requestPermissions,
  };
}