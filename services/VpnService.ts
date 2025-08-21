import { VpnConfig, ConnectionStatus, VpnServer } from '@/types/vpn';

export class VpnService {
  private static instance: VpnService;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private currentServer: VpnServer | null = null;
  private currentConfig: VpnConfig | null = null;
  private statusCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private configCallbacks: ((config: VpnConfig | null) => void)[] = [];

  static getInstance(): VpnService {
    if (!VpnService.instance) {
      VpnService.instance = new VpnService();
    }
    return VpnService.instance;
  }

  // Canada server configurations with auto-fallback priority
  private serverConfigs: Record<string, VpnConfig> = {
    'canada-udp-53': {
      client: 'client',
      dev: 'tun0',
      proto: 'udp',
      remote: '144.217.253.149',
      port: 53,
      priority: 1, // Try UDP first (fastest)
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
    'canada-udp-25000': {
      client: 'client',
      dev: 'tun2',
      proto: 'udp',
      remote: '144.217.253.149',
      port: 25000,
      priority: 2, // Second UDP option
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
    'canada-tcp-443': {
      client: 'client',
      dev: 'tun1',
      proto: 'tcp',
      remote: '144.217.253.149',
      port: 443,
      priority: 3, // TCP fallback
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
    'canada-tcp-80': {
      client: 'client',
      dev: 'tun3',
      proto: 'tcp',
      remote: '144.217.253.149',
      port: 80,
      priority: 4, // Final TCP fallback
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
  };

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

  private async tryConnection(configId: string): Promise<boolean> {
    try {
      const config = this.serverConfigs[configId];
      if (!config) return false;

      console.log(`Attempting connection to ${config.remote}:${config.port} (${config.proto.toUpperCase()})`);
      
      // Simulate connection attempt with realistic timing
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      // Simulate connection success/failure based on protocol
      // UDP has higher chance of failure to demonstrate fallback
      const successRate = config.proto === 'udp' ? 0.7 : 0.9;
      const success = Math.random() < successRate;
      
      if (success) {
        this.currentConfig = config;
        this.notifyConfigChange();
        console.log(`✅ Connected successfully via ${config.proto.toUpperCase()}:${config.port}`);
        return true;
      } else {
        console.log(`❌ Connection failed for ${config.proto.toUpperCase()}:${config.port}`);
        return false;
      }
    } catch (error) {
      console.error('Connection attempt failed:', error);
      return false;
    }
  }

  async connectWithFallback(): Promise<boolean> {
    try {
      this.connectionStatus = 'connecting';
      this.notifyStatusChange();

      // Get configs sorted by priority (UDP first, then TCP)
      const sortedConfigs = Object.entries(this.serverConfigs)
        .sort(([, a], [, b]) => (a.priority || 999) - (b.priority || 999));

      console.log('🔄 Starting smart connection with auto-fallback...');

      for (const [configId, config] of sortedConfigs) {
        console.log(`🔍 Trying ${config.proto.toUpperCase()}:${config.port}...`);
        
        const success = await this.tryConnection(configId);
        if (success) {
          this.connectionStatus = 'connected';
          this.notifyStatusChange();
          return true;
        }
        
        // Brief pause before trying next config
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // All connections failed
      console.log('❌ All connection attempts failed');
      this.connectionStatus = 'disconnected';
      this.currentConfig = null;
      this.notifyStatusChange();
      this.notifyConfigChange();
      return false;

    } catch (error) {
      console.error('VPN connection failed:', error);
      this.connectionStatus = 'disconnected';
      this.currentConfig = null;
      this.notifyStatusChange();
      this.notifyConfigChange();
      return false;
    }
  }

  async connect(serverId?: string): Promise<boolean> {
    if (serverId) {
      // Manual server selection
      try {
        this.connectionStatus = 'connecting';
        this.notifyStatusChange();

        const success = await this.tryConnection(serverId);
        if (success) {
          this.connectionStatus = 'connected';
          this.notifyStatusChange();
          return true;
        } else {
          this.connectionStatus = 'disconnected';
          this.currentConfig = null;
          this.notifyStatusChange();
          this.notifyConfigChange();
          return false;
        }
      } catch (error) {
        console.error('Manual VPN connection failed:', error);
        this.connectionStatus = 'disconnected';
        this.currentConfig = null;
        this.notifyStatusChange();
        this.notifyConfigChange();
        return false;
      }
    } else {
      // Auto-fallback connection
      return this.connectWithFallback();
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.connectionStatus = 'disconnecting';
      this.notifyStatusChange();

      // Simulate disconnection process
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.connectionStatus = 'disconnected';
      this.currentServer = null;
      this.currentConfig = null;
      this.notifyStatusChange();
      this.notifyConfigChange();
      
      console.log('🔌 Disconnected successfully');
      return true;
    } catch (error) {
      console.error('VPN disconnection failed:', error);
      return false;
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  getCurrentServer(): VpnServer | null {
    return this.currentServer;
  }

  getCurrentConfig(): VpnConfig | null {
    return this.currentConfig;
  }

  getConfigDisplayName(config: VpnConfig): string {
    return `${config.proto.toUpperCase()}:${config.port}`;
  }

  generateOvpnConfig(serverId: string): string {
    const config = this.serverConfigs[serverId];
    if (!config) {
      throw new Error('Server configuration not found');
    }

    return `client
dev ${config.dev}
proto ${config.proto}
remote ${config.remote} ${config.port}
resolv-retry infinite
nobind
persist-key
persist-tun
auth-user-pass
comp-lzo
verb 3
cipher AES-256-CBC
fast-io
pull
route-delay 2
redirect-gateway
<ca>
${config.ca}
</ca>
<cert>
${config.cert}
</cert>
<key>
${config.key}
</key>`;
  }

  // Get available fallback options
  getFallbackChain(): VpnConfig[] {
    return Object.values(this.serverConfigs)
      .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  }
}