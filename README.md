# SecureVPN - Android System VPN

A comprehensive VPN application with full Android system integration that routes ALL device traffic through secure Canada VPN servers.

## Features

### 🤖 Android System VPN Integration
- **Complete Device Protection**: Routes traffic from YouTube, WhatsApp, Chrome, Instagram, Facebook, and ALL Android apps
- **System-Level VPN**: Integrates with Android's VpnService for true system-wide protection
- **Persistent VPN Connection**: Maintains connection even when app is closed
- **Smart Auto-Fallback**: Automatically tries UDP first, then falls back to TCP if needed

### 🔒 Security & Privacy
- **AES-256 Encryption**: Military-grade encryption for all traffic
- **Kill Switch**: Blocks all traffic if VPN disconnects
- **DNS Protection**: System-wide DNS filtering and ad blocking
- **No Logs Policy**: Complete privacy protection

### 🇨🇦 Canada VPN Servers
- **Multiple Protocols**: UDP:53, UDP:25000, TCP:443, TCP:80
- **Smart Fallback Chain**: Intelligent protocol switching for optimal connection
- **High-Speed Servers**: Optimized for streaming, gaming, and browsing
- **24/7 Availability**: Reliable Canada-based infrastructure

### 📱 Android-Specific Features
- **VPN Permissions Management**: Handles Android VPN permissions seamlessly
- **Persistent Notifications**: Shows VPN status in notification bar
- **App Traffic Monitoring**: See which apps are protected
- **System Status Integration**: VPN indicator in Android status bar
- **Background Service**: Maintains connection in background

## Technical Implementation

### Android VPN Service
- Uses Android's `VpnService` API for system-level integration
- Creates TUN interface for routing all device traffic
- Implements proper permission handling and user consent
- Provides persistent foreground service for reliability

### Smart Connection Logic
1. **UDP Priority**: Attempts UDP:53 first (fastest protocol)
2. **UDP Fallback**: Falls back to UDP:25000 if first fails
3. **TCP Reliability**: Uses TCP:443 for reliable connections
4. **Final Fallback**: TCP:80 as last resort option

### Security Architecture
- **Certificate-based Authentication**: Uses embedded certificates for security
- **Credential Management**: Built-in authentication (vpnbook/m34wk9w)
- **Traffic Encryption**: All traffic encrypted with OpenVPN protocol
- **DNS Security**: Routes DNS through secure Canada servers

## Installation & Setup

### Development Setup
```bash
npm install
npm run dev
```

### Android Build
```bash
# Create development build
expo build:android

# Or create production build
expo build:android --type app-bundle
```

### Required Permissions
The app requests these Android permissions:
- `BIND_VPN_SERVICE`: Core VPN functionality
- `INTERNET`: Network access
- `ACCESS_NETWORK_STATE`: Network monitoring
- `CHANGE_NETWORK_STATE`: Network configuration
- `FOREGROUND_SERVICE`: Background VPN service
- `WAKE_LOCK`: Prevent device sleep during VPN

## Usage

### First Time Setup
1. **Install App**: Install on Android device
2. **Grant Permissions**: Allow VPN permissions when prompted
3. **Connect**: Tap the connect button to start system VPN
4. **Verify**: Check that all apps are protected

### Daily Usage
- **One-Tap Connection**: Single tap to connect/disconnect
- **Automatic Protection**: All apps automatically use VPN
- **Status Monitoring**: Check connection status and statistics
- **Server Selection**: Choose specific protocols if needed

### Monitoring & Statistics
- **Real-time Stats**: Monitor speed, data usage, and connection time
- **Protected Apps**: See which Android apps are using VPN
- **Performance Metrics**: Track latency, reliability, and encryption
- **Traffic Analysis**: Monitor data savings and optimization

## Architecture

### Core Services
- **SystemVpnService**: Main VPN coordination service
- **AndroidVpnService**: Android-specific VPN implementation
- **VpnService**: Cross-platform VPN logic

### UI Components
- **Connect Screen**: Main connection interface
- **Servers Screen**: Server selection and protocol info
- **Statistics Screen**: Usage stats and protected apps
- **Settings Screen**: Configuration and preferences

### Data Flow
1. User initiates connection
2. App requests Android VPN permissions
3. System configures VPN service with Canada servers
4. All device traffic routes through encrypted tunnel
5. Real-time monitoring and statistics collection

## Security Notes

### Privacy Protection
- **No User Data Collection**: App doesn't collect personal information
- **Local Configuration Storage**: VPN settings stored locally only
- **Encrypted Communications**: All VPN traffic encrypted end-to-end

### Network Security
- **Certificate Validation**: Validates server certificates
- **Protocol Security**: Uses industry-standard OpenVPN protocol
- **DNS Security**: Prevents DNS leaks with secure DNS servers

## Troubleshooting

### Common Issues
- **Permission Denied**: Ensure VPN permissions are granted in Android settings
- **Connection Failed**: Try different protocols (UDP → TCP fallback)
- **App Not Protected**: Verify VPN is active in Android notification bar
- **Slow Speeds**: Check server load and try different protocols

### Debug Information
- Check app logs for connection details
- Monitor Android system VPN status
- Verify DNS resolution through VPN servers
- Test with different apps to confirm protection

## Development

### Adding New Features
- Extend `AndroidVpnService` for Android-specific functionality
- Update `SystemVpnService` for cross-platform features
- Add UI components in respective tab screens

### Testing
- Test on physical Android devices (VPN requires device hardware)
- Verify all apps route through VPN tunnel
- Check persistent connection during app backgrounding
- Validate kill switch functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Check the troubleshooting section above
- Review Android VPN permissions in device settings
- Verify internet connectivity before connecting
- Contact support for persistent issues

---

**Note**: This VPN app provides system-level protection for Android devices, routing ALL app traffic through secure Canada VPN servers with intelligent protocol fallback and comprehensive monitoring.