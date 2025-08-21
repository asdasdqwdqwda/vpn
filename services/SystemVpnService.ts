import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VpnConfig, ConnectionStatus } from '@/types/vpn';

// System VPN integration for mobile devices
export class SystemVpnService {
  private static instance: SystemVpnService;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private currentConfig: VpnConfig | null = null;
  private statusCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private configCallbacks: ((config: VpnConfig | null) => void)[] = [];

  // VPN Authentication credentials
  private readonly VPN_USERNAME = 'vpnbook';
  private readonly VPN_PASSWORD = 'm34wk9w';

  static getInstance(): SystemVpnService {
    if (!SystemVpnService.instance) {
      SystemVpnService.instance = new SystemVpnService();
    }
    return SystemVpnService.instance;
  }

  // Request VPN permissions for system-level integration
  async requestVpnPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Web platform: VPN permissions not required');
        return true;
      }

      // For mobile platforms, request VPN permissions
      if (Platform.OS === 'ios') {
        // iOS VPN permission request
        const { VpnManager } = require('react-native-vpn');
        const granted = await VpnManager.requestPermissions();
        return granted;
      } else if (Platform.OS === 'android') {
        // Android VPN permission request
        const { VpnService } = require('react-native-vpn');
        const granted = await VpnService.prepare();
        return granted;
      }

      return false;
    } catch (error) {
      console.error('Failed to request VPN permissions:', error);
      return false;
    }
  }

  // Configure system VPN with Canada server
  async configureSystemVpn(config: VpnConfig): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web simulation
        console.log('Web platform: Simulating VPN configuration');
        await this.simulateVpnSetup(config);
        return true;
      }

      const vpnConfig = {
        serverAddress: config.remote,
        serverPort: config.port,
        protocol: config.proto.toUpperCase(),
        username: this.VPN_USERNAME,
        password: this.VPN_PASSWORD,
        certificate: config.ca,
        clientCertificate: config.cert,
        clientKey: config.key,
        // Route all traffic through VPN
        routes: ['0.0.0.0/0'],
        dnsServers: ['8.8.8.8', '8.8.4.4'],
        // Enable for all apps
        allowedApps: [], // Empty means all apps
        disallowedApps: [], // No excluded apps
      };

      if (Platform.OS === 'ios') {
        const { VpnManager } = require('react-native-vpn');
        await VpnManager.configure(vpnConfig);
      } else if (Platform.OS === 'android') {
        const { VpnService } = require('react-native-vpn');
        await VpnService.configure(vpnConfig);
      }

      // Store configuration
      await AsyncStorage.setItem('vpn_config', JSON.stringify(config));
      this.currentConfig = config;
      this.notifyConfigChange();

      return true;
    } catch (error) {
      console.error('Failed to configure system VPN:', error);
      return false;
    }
  }

  // Start system VPN connection
  async startSystemVpn(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web simulation
        this.connectionStatus = 'connected';
        this.notifyStatusChange();
        return true;
      }

      if (Platform.OS === 'ios') {
        const { VpnManager } = require('react-native-vpn');
        await VpnManager.connect();
      } else if (Platform.OS === 'android') {
        const { VpnService } = require('react-native-vpn');
        await VpnService.start();
      }

      this.connectionStatus = 'connected';
      this.notifyStatusChange();

      // Update device status bar
      await this.updateDeviceStatusBar(true);

      return true;
    } catch (error) {
      console.error('Failed to start system VPN:', error);
      this.connectionStatus = 'disconnected';
      this.notifyStatusChange();
      return false;
    }
  }

  // Stop system VPN connection
  async stopSystemVpn(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web simulation
        this.connectionStatus = 'disconnected';
        this.currentConfig = null;
        this.notifyStatusChange();
        this.notifyConfigChange();
        return true;
      }

      if (Platform.OS === 'ios') {
        const { VpnManager } = require('react-native-vpn');
        await VpnManager.disconnect();
      } else if (Platform.OS === 'android') {
        const { VpnService } = require('react-native-vpn');
        await VpnService.stop();
      }

      this.connectionStatus = 'disconnected';
      this.currentConfig = null;
      this.notifyStatusChange();
      this.notifyConfigChange();

      // Update device status bar
      await this.updateDeviceStatusBar(false);

      return true;
    } catch (error) {
      console.error('Failed to stop system VPN:', error);
      return false;
    }
  }

  // Update device status bar to show VPN status
  private async updateDeviceStatusBar(connected: boolean): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web: Update document title
        if (connected && this.currentConfig) {
          document.title = `🔒 VPN: ${this.currentConfig.proto.toUpperCase()}:${this.currentConfig.port} - SecureVPN`;
        } else {
          document.title = 'SecureVPN';
        }
        return;
      }

      // Mobile: Update system status bar
      if (connected && this.currentConfig) {
        const statusText = `VPN: ${this.currentConfig.proto.toUpperCase()}:${this.currentConfig.port}`;
        
        if (Platform.OS === 'ios') {
          // iOS: Update status bar via native module
          const { StatusBarManager } = require('react-native');
          StatusBarManager.setNetworkActivityIndicatorVisible(true);
        } else if (Platform.OS === 'android') {
          // Android: Show persistent notification
          const { NotificationManager } = require('react-native-vpn');
          await NotificationManager.showVpnNotification({
            title: 'VPN Connected',
            message: `Secure connection via ${statusText}`,
            icon: 'vpn_key',
            ongoing: true,
          });
        }
      } else {
        // Clear VPN indicators
        if (Platform.OS === 'ios') {
          const { StatusBarManager } = require('react-native');
          StatusBarManager.setNetworkActivityIndicatorVisible(false);
        } else if (Platform.OS === 'android') {
          const { NotificationManager } = require('react-native-vpn');
          await NotificationManager.hideVpnNotification();
        }
      }
    } catch (error) {
      console.error('Failed to update device status bar:', error);
    }
  }

  // Smart auto-fallback connection with all Canada servers
  async connectWithAutoFallback(): Promise<boolean> {
    try {
      // Request VPN permissions first
      const permissionGranted = await this.requestVpnPermissions();
      if (!permissionGranted) {
        console.error('VPN permissions not granted');
        return false;
      }

      this.connectionStatus = 'connecting';
      this.notifyStatusChange();

      // Canada server configurations in priority order
      const fallbackConfigs = [
        {
          id: 'canada-udp-53',
          config: {
            client: 'client',
            dev: 'tun0',
            proto: 'udp',
            remote: '144.217.253.149',
            port: 53,
            priority: 1,
            ca: `-----BEGIN CERTIFICATE-----
MIIDSzCCAjOgAwIBAgIUJdJ6+6lTiYZBvpl2P40Lgx3BeHowDQYJKoZIhvcNAQEL
BQAwFjEUMBIGA1UEAwwLdnBuYm9vay5jb20wHhcNMjMwMjIwMTk0NTM1WhcNMzMw
MjE3MTk0NTM1WjAWMRQwEgYDVQQDDAt2cG5ib29rLmNvbTCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAMcVK+hYl6Wl57YxXIVy7Jlgglj42LaC2sUWK3ls
aRcKQfs/ridG6+9dSP1ziCrZ1f5pOLz34gMYXChhUOc/x9rSIRGHao4gHeXmEoGs
twjxA+kRBSv5xqeUgaTKAhdwiV5SvBE8EViWe3rlHLoUbWBQ7Kky/L4cg7u+ma1V
31PgOPhWY3RqZJLBMu3PHCctaaHQyoPLDNDyCz7Zb2Wos+tjIb3YP5GTfkZlnJsN
va0HdSGEyerTQL5fqW2V6IZ4t2Np2kVnJcfEWgJF0Kw1nqoPfKjxM44bR+K1EGGW
ir1rs/RFPg8yFVxd4ZHpqoCo2lXZjc6oP1cwtIswIHb6EbsCAwEAAaOBkDCBjTAd
BgNVHQ4EFgQULgM8Z91cLOSHl6EDF8jalx3piqQwUQYDVR0jBEowSIAULgM8Z91c
LOSHl6EDF8jalx3piqShGqQYMBYxFDASBgNVBAMMC3ZwbmJvb2suY29tghQl0nr7
qVOJhkG+mXY/jQuDHcF4ejAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIBBjANBgkq
hkiG9w0BAQsFAAOCAQEAT5hsP+dz11oREADNMlTEehXWfoI0aBws5c8noDHoVgnc
BXuI4BREP3k6OsOXedHrAPA4dJXG2e5h33Ljqr5jYbm7TjUVf1yT/r3TDKIJMeJ4
+KFs7tmXy0ejLFORbk8v0wAYMQWM9ealEGePQVjOhJJysEhJfA4u5zdGmJDYkCr+
3cTiig/a53JqpwjjYFVHYPSJkC/nTz6tQOw9crDlZ3j+LLWln0Cy/bdj9oqurnrc
xUtl3+PWM9D1HoBpdGduvQJ4HXfss6OrajukKfDsbDS4njD933vzRd4E36GjOI8Q
1VKIe7kamttHV5HCsoeSYLjdxbXBAY2E0ZhQzpZB7g==
-----END CERTIFICATE-----`,
            cert: `-----BEGIN CERTIFICATE-----
MIIDYDCCAkigAwIBAgIQP/z/mAlVNddzohzjQghcqzANBgkqhkiG9w0BAQsFADAW
MRQwEgYDVQQDDAt2cG5ib29rLmNvbTAeFw0yMzAyMjAyMzMwNDlaFw0zMzAyMTcy
MzMwNDlaMB0xGzAZBgNVBAMMEmNsaWVudC52cG5ib29rLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBANPiNyyYH6yLXss6AeHLzJ6/9JfUzVAs7ttq
8OWJRkBjKuEPW3MUVjpMgptm6+zJohM4IdSo/ES6H81sLK4AWiUUOzeOt8xAzgib
NrLss5px0D0Pm+uXH8hGOle386JH5oyOQ6ub2O3ro0TeTF4rg43TF1oOz2AVS/gc
sB3d6AG73otZ4C6/wabiGz4rFO8xl4S4PBKX73Eb7cdSoACc8AIrqcR+PEDHOZYt
1qp4lM87+5ADEXelpe9vLTaoXonIuZElqA9rwFi/KQmPCHsl7eEnmSo1iOg0y3iP
0CRHzv8FkvhhpB9Z3i3TUxq8XvnLtEQ38eD5Dw20WMYPmPShtXMCAwEAAaOBojCB
nzAJBgNVHRMEAjAAMB0GA1UdDgQWBBQKO5Ub8pRCA8iTdRIxUIeMpNX2vzBRBgNV
HSMESjBIgBQuAzxn3Vws5IeXoQMXyNqXHemKpKEapBgwFjEUMBIGA1UEAwwLdnBu
Ym9vay5jb22CFCXSevupU4mGQb6Zdj+NC4MdwXh6MBMGA1UdJQQMMAoGCCsGAQUF
BwMCMAsGA1UdDwQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAQEAel1YOAWHWFLH3N41
SCIdQNbkQ18UFBbtZz4bzV6VeCWHNzPtWQ6UIeADpcBp0mngS09qJCQ8PwOBMvFw
MizhDz2Ipz817XtLJuEMQ3Io51LRxPP394mlw46e8KFOh06QI8jnC/QlBH19PI+M
OeQ3Gx6uYK41HHmyu/Z7dUE4c4s2iiHA7UgD98dkrU0rGAv1R/d2xRXqEm4PrwDj
MlC1TY8LrIJd6Ipt00uUfHVAzhX3NKR528azYH3bud5NV+KEiQZSyirUyoMbMQeO
UXh+GEDX5GBPElzQmPOsLete/PMH9Ayg6Gh/sccqwgH7BxjqcVLKXg2S4jL5BUPd
kI3/sg==
-----END CERTIFICATE-----`,
            key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDT4jcsmB+si17L
OgHhy8yev/SX1M1QLO7bavDliUZAYyrhD1tzFFY6TIKbZuvsyaITOCHUqPxEuh/N
bCyuAFolFDs3jrfMQM4Imzay7LOacdA9D5vrlx/IRjpXt/OiR+aMjkOrm9jt66NE
3kxeK4ON0xdaDs9gFUv4HLAd3egBu96LWeAuv8Gm4hs+KxTvMZeEuDwSl+9xG+3H
UqAAnPACK6nEfjxAxzmWLdaqeJTPO/uQAxF3paXvby02qF6JyLmRJagPa8BYvykJ
jwh7Je3hJ5kqNYjoNMt4j9AkR87/BZL4YaQfWd4t01MavF75y7REN/Hg+Q8NtFjG
D5j0obVzAgMBAAECggEAAV/BLdfatLq+paC9rGIu9ISYKHfn0PJJpkCeSU7HltlN
yOHZnPhvyrb+TdWwB/wSwf8mMQPbhvKSDDn8XDCCZSUpcSXKyVdOPr4K78QbMhA0
4oB8aV20hg72h+UYfl/q/dRaWf2LvZc+ms66Pg4YL05EI4BfFedtc7Fz7u2meIRl
Wm0b7/QQ10wrR1I7PonZzgnU9diB1cKxptJ06AfJmCGobymjq/A1JsAr/NFnJlmu
yq3n5tcRpfc8K+XsfnpwDQJo3kKwLGIoBmUkGEcHgQhVwOL5+P+3pTYr1bt4cAUp
FxbExqcxW0es//g3x2Z80icUpa4/OvSTAa0XF3J4UQKBgQDv4E/3/r5lULYIksNC
zO1yRp7awv41ZAUpDSglNtWsehnhhUsiVE/Ezmyz4E0qjsW2+EUxUZ990T4ZVK4b
9cEhB/TDBc6PBPd498aIGiiqznWXMdsU2o6xrvkQeWdmXoVjvWTcRWlfAQ+PQBOJ
tJ3wR7ZoHgu0P/yzIzn0eQ+BiQKBgQDiIDgRtlQBw8tZc66OzxWOuJh6M5xUF5zY
S0SLXFWlKVkfGACaerHUlFwZKID39BBifgXO1VOQ6AzalDd2vaIU9CHo2bFpTY7S
EkkcIt9Gpl5o1sjEyJChXBIz+s48XBMXlqFN7AdhX/H6R43g8eS/YlzqSBxkUcAa
V3tt8n+sGwKBgD+aSXnnKNKyWOHjEDUJIzh2sy4sH71GXPvqiid756II6g3bCvX6
RwBW/4meQrezDYebQrV2AAUbUwziYBv3yJKainKfeop/daK0iAaUcQ4BGjrRtFZO
MSG51D5jAmCpVVMB59lj6jGPlXGVOtj7dBk+2oW22cGcacOR5o8E/nCJAoGBALVP
KCXrj8gqea4rt1cCbEKXeIrjPwGePUCgeUFUs8dONAteb31ty5CrtHznoSEvLMQM
UBPbsLmLlmLcXOx0eLVcWqQdiMbqTQ3bY4uP2n8HfsOJFEnUl0MKU/4hp6N2IEjV
mlikW/aTu632Gai3y7Y45E9lqn41nlaAtpMd0YjpAoGBAL8VimbhI7FK7X1vaxXy
tnqLuYddL+hsxXXfcIVNjLVat3L2WN0YKZtbzWD8TW8hbbtnuS8F8REg7YvYjkZJ
t8VO6ZmI7I++borJBNmbWS4gEk85DYnaLI9iw4oF2+Dr0LKKAaUL+Pq67wmvufOn
hTobb/WAAcA75GKmU4jn5Ln2
-----END PRIVATE KEY-----`,
          },
        },
        {
          id: 'canada-udp-25000',
          config: {
            client: 'client',
            dev: 'tun2',
            proto: 'udp',
            remote: '144.217.253.149',
            port: 25000,
            priority: 2,
            ca: `-----BEGIN CERTIFICATE-----
MIIDSzCCAjOgAwIBAgIUJdJ6+6lTiYZBvpl2P40Lgx3BeHowDQYJKoZIhvcNAQEL
BQAwFjEUMBIGA1UEAwwLdnBuYm9vay5jb20wHhcNMjMwMjIwMTk0NTM1WhcNMzMw
MjE3MTk0NTM1WjAWMRQwEgYDVQQDDAt2cG5ib29rLmNvbTCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAMcVK+hYl6Wl57YxXIVy7Jlgglj42LaC2sUWK3ls
aRcKQfs/ridG6+9dSP1ziCrZ1f5pOLz34gMYXChhUOc/x9rSIRGHao4gHeXmEoGs
twjxA+kRBSv5xqeUgaTKAhdwiV5SvBE8EViWe3rlHLoUbWBQ7Kky/L4cg7u+ma1V
31PgOPhWY3RqZJLBMu3PHCctaaHQyoPLDNDyCz7Zb2Wos+tjIb3YP5GTfkZlnJsN
va0HdSGEyerTQL5fqW2V6IZ4t2Np2kVnJcfEWgJF0Kw1nqoPfKjxM44bR+K1EGGW
ir1rs/RFPg8yFVxd4ZHpqoCo2lXZjc6oP1cwtIswIHb6EbsCAwEAAaOBkDCBjTAd
BgNVHQ4EFgQULgM8Z91cLOSHl6EDF8jalx3piqQwUQYDVR0jBEowSIAULgM8Z91c
LOSHl6EDF8jalx3piqShGqQYMBYxFDASBgNVBAMMC3ZwbmJvb2suY29tghQl0nr7
qVOJhkG+mXY/jQuDHcF4ejAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIBBjANBgkq
hkiG9w0BAQsFAAOCAQEAT5hsP+dz11oREADNMlTEehXWfoI0aBws5c8noDHoVgnc
BXuI4BREP3k6OsOXedHrAPA4dJXG2e5h33Ljqr5jYbm7TjUVf1yT/r3TDKIJMeJ4
+KFs7tmXy0ejLFORbk8v0wAYMQWM9ealEGePQVjOhJJysEhJfA4u5zdGmJDYkCr+
3cTiig/a53JqpwjjYFVHYPSJkC/nTz6tQOw9crDlZ3j+LLWln0Cy/bdj9oqurnrc
xUtl3+PWM9D1HoBpdGduvQJ4HXfss6OrajukKfDsbDS4njD933vzRd4E36GjOI8Q
1VKIe7kamttHV5HCsoeSYLjdxbXBAY2E0ZhQzpZB7g==
-----END CERTIFICATE-----`,
            key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDT4jcsmB+si17L
OgHhy8yev/SX1M1QLO7bavDliUZAYyrhD1tzFFY6TIKbZuvsyaITOCHUqPxEuh/N
bCyuAFolFDs3jrfMQM4Imzay7LOacdA9D5vrlx/IRjpXt/OiR+aMjkOrm9jt66NE
3kxeK4ON0xdaDs9gFUv4HLAd3egBu96LWeAuv8Gm4hs+KxTvMZeEuDwSl+9xG+3H
UqAAnPACK6nEfjxAxzmWLdaqeJTPO/uQAxF3paXvby02qF6JyLmRJagPa8BYvykJ
jwh7Je3hJ5kqNYjoNMt4j9AkR87/BZL4YaQfWd4t01MavF75y7REN/Hg+Q8NtFjG
D5j0obVzAgMBAAECggEAAV/BLdfatLq+paC9rGIu9ISYKHfn0PJJpkCeSU7HltlN
yOHZnPhvyrb+TdWwB/wSwf8mMQPbhvKSDDn8XDCCZSUpcSXKyVdOPr4K78QbMhA0
4oB8aV20hg72h+UYfl/q/dRaWf2LvZc+ms66Pg4YL05EI4BfFedtc7Fz7u2meIRl
Wm0b7/QQ10wrR1I7PonZzgnU9diB1cKxptJ06AfJmCGobymjq/A1JsAr/NFnJlmu
yq3n5tcRpfc8K+XsfnpwDQJo3kKwLGIoBmUkGEcHgQhVwOL5+P+3pTYr1bt4cAUp
FxbExqcxW0es//g3x2Z80icUpa4/OvSTAa0XF3J4UQKBgQDv4E/3/r5lULYIksNC
zO1yRp7awv41ZAUpDSglNtWsehnhhUsiVE/Ezmyz4E0qjsW2+EUxUZ990T4ZVK4b
9cEhB/TDBc6PBPd498aIGiiqznWXMdsU2o6xrvkQeWdmXoVjvWTcRWlfAQ+PQBOJ
tJ3wR7ZoHgu0P/yzIzn0eQ+BiQKBgQDiIDgRtlQBw8tZc66OzxWOuJh6M5xUF5zY
S0SLXFWlKVkfGACaerHUlFwZKID39BBifgXO1VOQ6AzalDd2vaIU9CHo2bFpTY7S
EkkcIt9Gpl5o1sjEyJChXBIz+s48XBMXlqFN7AdhX/H6R43g8eS/YlzqSBxkUcAa
V3tt8n+sGwKBgD+aSXnnKNKyWOHjEDUJIzh2sy4sH71GXPvqiid756II6g3bCvX6
RwBW/4meQrezDYebQrV2AAUbUwziYBv3yJKainKfeop/daK0iAaUcQ4BGjrRtFZO
MSG51D5jAmCpVVMB59lj6jGPlXGVOtj7dBk+2oW22cGcacOR5o8E/nCJAoGBALVP
KCXrj8gqea4rt1cCbEKXeIrjPwGePUCgeUFUs8dONAteb31ty5CrtHznoSEvLMQM
UBPbsLmLlmLcXOx0eLVcWqQdiMbqTQ3bY4uP2n8HfsOJFEnUl0MKU/4hp6N2IEjV
mlikW/aTu632Gai3y7Y45E9lqn41nlaAtpMd0YjpAoGBAL8VimbhI7FK7X1vaxXy
tnqLuYddL+hsxXXfcIVNjLVat3L2WN0YKZtbzWD8TW8hbbtnuS8F8REg7YvYjkZJ
t8VO6ZmI7I++borJBNmbWS4gEk85DYnaLI9iw4oF2+Dr0LKKAaUL+Pq67wmvufOn
hTobb/WAAcA75GKmU4jn5Ln2
-----END PRIVATE KEY-----`,
          },
        },
        {
          id: 'canada-tcp-443',
          config: {
            client: 'client',
            dev: 'tun1',
            proto: 'tcp',
            remote: '144.217.253.149',
            port: 443,
            priority: 3,
            ca: `-----BEGIN CERTIFICATE-----
MIIDSzCCAjOgAwIBAgIUJdJ6+6lTiYZBvpl2P40Lgx3BeHowDQYJKoZIhvcNAQEL
BQAwFjEUMBIGA1UEAwwLdnBuYm9vay5jb20wHhcNMjMwMjIwMTk0NTM1WhcNMzMw
MjE3MTk0NTM1WjAWMRQwEgYDVQQDDAt2cG5ib29rLmNvbTCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAMcVK+hYl6Wl57YxXIVy7Jlgglj42LaC2sUWK3ls
aRcKQfs/ridG6+9dSP1ziCrZ1f5pOLz34gMYXChhUOc/x9rSIRGHao4gHeXmEoGs
twjxA+kRBSv5xqeUgaTKAhdwiV5SvBE8EViWe3rlHLoUbWBQ7Kky/L4cg7u+ma1V
31PgOPhWY3RqZJLBMu3PHCctaaHQyoPLDNDyCz7Zb2Wos+tjIb3YP5GTfkZlnJsN
va0HdSGEyerTQL5fqW2V6IZ4t2Np2kVnJcfEWgJF0Kw1nqoPfKjxM44bR+K1EGGW
ir1rs/RFPg8yFVxd4ZHpqoCo2lXZjc6oP1cwtIswIHb6EbsCAwEAAaOBkDCBjTAd
BgNVHQ4EFgQULgM8Z91cLOSHl6EDF8jalx3piqQwUQYDVR0jBEowSIAULgM8Z91c
LOSHl6EDF8jalx3piqShGqQYMBYxFDASBgNVBAMMC3ZwbmJvb2suY29tghQl0nr7
qVOJhkG+mXY/jQuDHcF4ejAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIBBjANBgkq
hkiG9w0BAQsFAAOCAQEAT5hsP+dz11oREADNMlTEehXWfoI0aBws5c8noDHoVgnc
BXuI4BREP3k6OsOXedHrAPA4dJXG2e5h33Ljqr5jYbm7TjUVf1yT/r3TDKIJMeJ4
+KFs7tmXy0ejLFORbk8v0wAYMQWM9ealEGePQVjOhJJysEhJfA4u5zdGmJDYkCr+
3cTiig/a53JqpwjjYFVHYPSJkC/nTz6tQOw9crDlZ3j+LLWln0Cy/bdj9oqurnrc
xUtl3+PWM9D1HoBpdGduvQJ4HXfss6OrajukKfDsbDS4njD933vzRd4E36GjOI8Q
1VKIe7kamttHV5HCsoeSYLjdxbXBAY2E0ZhQzpZB7g==
-----END CERTIFICATE-----`,
            cert: `-----BEGIN CERTIFICATE-----
MIIDYDCCAkigAwIBAgIQP/z/mAlVNddzohzjQghcqzANBgkqhkiG9w0BAQsFADAW
MRQwEgYDVQQDDAt2cG5ib29rLmNvbTAeFw0yMzAyMjAyMzMwNDlaFw0zMzAyMTcy
MzMwNDlaMB0xGzAZBgNVBAMMEmNsaWVudC52cG5ib29rLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBANPiNyyYH6yLXss6AeHLzJ6/9JfUzVAs7ttq
8OWJRkBjKuEPW3MUVjpMgptm6+zJohM4IdSo/ES6H81sLK4AWiUUOzeOt8xAzgib
NrLss5px0D0Pm+uXH8hGOle386JH5oyOQ6ub2O3ro0TeTF4rg43TF1oOz2AVS/gc
sB3d6AG73otZ4C6/wabiGz4rFO8xl4S4PBKX73Eb7cdSoACc8AIrqcR+PEDHOZYt
1qp4lM87+5ADEXelpe9vLTaoXonIuZElqA9rwFi/KQmPCHsl7eEnmSo1iOg0y3iP
0CRHzv8FkvhhpB9Z3i3TUxq8XvnLtEQ38eD5Dw20WMYPmPShtXMCAwEAAaOBojCB
nzAJBgNVHRMEAjAAMB0GA1UdDgQWBBQKO5Ub8pRCA8iTdRIxUIeMpNX2vzBRBgNV
HSMESjBIgBQuAzxn3Vws5IeXoQMXyNqXHemKpKEapBgwFjEUMBIGA1UEAwwLdnBu
Ym9vay5jb22CFCXSevupU4mGQb6Zdj+NC4MdwXh6MBMGA1UdJQQMMAoGCCsGAQUF
BwMCMAsGA1UdDwQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAQEAel1YOAWHWFLH3N41
SCIdQNbkQ18UFBbtZz4bzV6VeCWHNzPtWQ6UIeADpcBp0mngS09qJCQ8PwOBMvFw
MizhDz2Ipz817XtLJuEMQ3Io51LRxPP394mlw46e8KFOh06QI8jnC/QlBH19PI+M
OeQ3Gx6uYK41HHmyu/Z7dUE4c4s2iiHA7UgD98dkrU0rGAv1R/d2xRXqEm4PrwDj
MlC1TY8LrIJd6Ipt00uUfHVAzhX3NKR528azYH3bud5NV+KEiQZSyirUyoMbMQeO
UXh+GEDX5GBPElzQmPOsLete/PMH9Ayg6Gh/sccqwgH7BxjqcVLKXg2S4jL5BUPd
kI3/sg==
-----END CERTIFICATE-----`,
            key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDT4jcsmB+si17L
OgHhy8yev/SX1M1QLO7bavDliUZAYyrhD1tzFFY6TIKbZuvsyaITOCHUqPxEuh/N
bCyuAFolFDs3jrfMQM4Imzay7LOacdA9D5vrlx/IRjpXt/OiR+aMjkOrm9jt66NE
3kxeK4ON0xdaDs9gFUv4HLAd3egBu96LWeAuv8Gm4hs+KxTvMZeEuDwSl+9xG+3H
UqAAnPACK6nEfjxAxzmWLdaqeJTPO/uQAxF3paXvby02qF6JyLmRJagPa8BYvykJ
jwh7Je3hJ5kqNYjoNMt4j9AkR87/BZL4YaQfWd4t01MavF75y7REN/Hg+Q8NtFjG
D5j0obVzAgMBAAECggEAAV/BLdfatLq+paC9rGIu9ISYKHfn0PJJpkCeSU7HltlN
yOHZnPhvyrb+TdWwB/wSwf8mMQPbhvKSDDn8XDCCZSUpcSXKyVdOPr4K78QbMhA0
4oB8aV20hg72h+UYfl/q/dRaWf2LvZc+ms66Pg4YL05EI4BfFedtc7Fz7u2meIRl
Wm0b7/QQ10wrR1I7PonZzgnU9diB1cKxptJ06AfJmCGobymjq/A1JsAr/NFnJlmu
yq3n5tcRpfc8K+XsfnpwDQJo3kKwLGIoBmUkGEcHgQhVwOL5+P+3pTYr1bt4cAUp
FxbExqcxW0es//g3x2Z80icUpa4/OvSTAa0XF3J4UQKBgQDv4E/3/r5lULYIksNC
zO1yRp7awv41ZAUpDSglNtWsehnhhUsiVE/Ezmyz4E0qjsW2+EUxUZ990T4ZVK4b
9cEhB/TDBc6PBPd498aIGiiqznWXMdsU2o6xrvkQeWdmXoVjvWTcRWlfAQ+PQBOJ
tJ3wR7ZoHgu0P/yzIzn0eQ+BiQKBgQDiIDgRtlQBw8tZc66OzxWOuJh6M5xUF5zY
S0SLXFWlKVkfGACaerHUlFwZKID39BBifgXO1VOQ6AzalDd2vaIU9CHo2bFpTY7S
EkkcIt9Gpl5o1sjEyJChXBIz+s48XBMXlqFN7AdhX/H6R43g8eS/YlzqSBxkUcAa
V3tt8n+sGwKBgD+aSXnnKNKyWOHjEDUJIzh2sy4sH71GXPvqiid756II6g3bCvX6
RwBW/4meQrezDYebQrV2AAUbUwziYBv3yJKainKfeop/daK0iAaUcQ4BGjrRtFZO
MSG51D5jAmCpVVMB59lj6jGPlXGVOtj7dBk+2oW22cGcacOR5o8E/nCJAoGBALVP
KCXrj8gqea4rt1cCbEKXeIrjPwGePUCgeUFUs8dONAteb31ty5CrtHznoSEvLMQM
UBPbsLmLlmLcXOx0eLVcWqQdiMbqTQ3bY4uP2n8HfsOJFEnUl0MKU/4hp6N2IEjV
mlikW/aTu632Gai3y7Y45E9lqn41nlaAtpMd0YjpAoGBAL8VimbhI7FK7X1vaxXy
tnqLuYddL+hsxXXfcIVNjLVat3L2WN0YKZtbzWD8TW8hbbtnuS8F8REg7YvYjkZJ
t8VO6ZmI7I++borJBNmbWS4gEk85DYnaLI9iw4oF2+Dr0LKKAaUL+Pq67wmvufOn
hTobb/WAAcA75GKmU4jn5Ln2
-----END PRIVATE KEY-----`,
          },
        },
        {
          id: 'canada-tcp-80',
          config: {
            client: 'client',
            dev: 'tun3',
            proto: 'tcp',
            remote: '144.217.253.149',
            port: 80,
            priority: 4,
            ca: `-----BEGIN CERTIFICATE-----
MIIDSzCCAjOgAwIBAgIUJdJ6+6lTiYZBvpl2P40Lgx3BeHowDQYJKoZIhvcNAQEL
BQAwFjEUMBIGA1UEAwwLdnBuYm9vay5jb20wHhcNMjMwMjIwMTk0NTM1WhcNMzMw
MjE3MTk0NTM1WjAWMRQwEgYDVQQDDAt2cG5ib29rLmNvbTCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAMcVK+hYl6Wl57YxXIVy7Jlgglj42LaC2sUWK3ls
aRcKQfs/ridG6+9dSP1ziCrZ1f5pOLz34gMYXChhUOc/x9rSIRGHao4gHeXmEoGs
twjxA+kRBSv5xqeUgaTKAhdwiV5SvBE8EViWe3rlHLoUbWBQ7Kky/L4cg7u+ma1V
31PgOPhWY3RqZJLBMu3PHCctaaHQyoPLDNDyCz7Zb2Wos+tjIb3YP5GTfkZlnJsN
va0HdSGEyerTQL5fqW2V6IZ4t2Np2kVnJcfEWgJF0Kw1nqoPfKjxM44bR+K1EGGW
ir1rs/RFPg8yFVxd4ZHpqoCo2lXZjc6oP1cwtIswIHb6EbsCAwEAAaOBkDCBjTAd
BgNVHQ4EFgQULgM8Z91cLOSHl6EDF8jalx3piqQwUQYDVR0jBEowSIAULgM8Z91c
LOSHl6EDF8jalx3piqShGqQYMBYxFDASBgNVBAMMC3ZwbmJvb2suY29tghQl0nr7
qVOJhkG+mXY/jQuDHcF4ejAMBgNVHRMEBTADAQH/MAsGA1UdDwQEAwIBBjANBgkq
hkiG9w0BAQsFAAOCAQEAT5hsP+dz11oREADNMlTEehXWfoI0aBws5c8noDHoVgnc
BXuI4BREP3k6OsOXedHrAPA4dJXG2e5h33Ljqr5jYbm7TjUVf1yT/r3TDKIJMeJ4
+KFs7tmXy0ejLFORbk8v0wAYMQWM9ealEGePQVjOhJJysEhJfA4u5Ln2
-----END PRIVATE KEY-----`,
          },
        },
      ];

      console.log('🚀 Starting intelligent auto-fallback connection...');
      console.log('📋 Authentication: vpnbook / m34wk9w');

      // Try each configuration in priority order
      for (const { id, config } of fallbackConfigs) {
        console.log(`🔍 Attempting ${config.proto.toUpperCase()}:${config.port}...`);
        
        // Configure system VPN
        const configured = await this.configureSystemVpn(config);
        if (!configured) {
          console.log(`❌ Failed to configure ${config.proto.toUpperCase()}:${config.port}`);
          continue;
        }

        // Attempt connection
        const connected = await this.startSystemVpn();
        if (connected) {
          console.log(`✅ Successfully connected via ${config.proto.toUpperCase()}:${config.port}`);
          return true;
        }

        console.log(`❌ Connection failed for ${config.proto.toUpperCase()}:${config.port}`);
        
        // Brief pause before trying next config
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // All connections failed
      console.log('❌ All auto-fallback attempts failed');
      this.connectionStatus = 'disconnected';
      this.currentConfig = null;
      this.notifyStatusChange();
      this.notifyConfigChange();
      return false;

    } catch (error) {
      console.error('Auto-fallback connection failed:', error);
      this.connectionStatus = 'disconnected';
      this.currentConfig = null;
      this.notifyStatusChange();
      this.notifyConfigChange();
      return false;
    }
  }

  // Disconnect from system VPN
  async disconnect(): Promise<boolean> {
    try {
      this.connectionStatus = 'disconnecting';
      this.notifyStatusChange();

      const success = await this.stopSystemVpn();
      
      if (success) {
        console.log('🔌 Disconnected from system VPN');
      }
      
      return success;
    } catch (error) {
      console.error('VPN disconnection failed:', error);
      return false;
    }
  }

  // Web simulation for development
  private async simulateVpnSetup(config: VpnConfig): Promise<void> {
    console.log(`🌐 Web simulation: Configuring ${config.proto.toUpperCase()}:${config.port}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Event subscription methods
  onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.statusCallbacks.push(callback);
  }

  onConfigChange(callback: (config: VpnConfig | null) => void) {
    this.configCallbacks.push(callback);
  }

  private notifyStatusChange() {
    this.statusCallbacks.forEach(callback => callback(this.connectionStatus));
  }

  private notifyConfigChange() {
    this.configCallbacks.forEach(callback => callback(this.currentConfig));
  }

  // Getters
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  getCurrentConfig(): VpnConfig | null {
    return this.currentConfig;
  }

  getAuthCredentials() {
    return {
      username: this.VPN_USERNAME,
      password: this.VPN_PASSWORD,
    };
  }
}