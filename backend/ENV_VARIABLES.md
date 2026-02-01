# Environment Variables untuk Production

## Required Environment Variables

Berikut adalah environment variables yang **WAJIB** dikonfigurasi untuk deployment production:

### Database
```bash
DB_URL=jdbc:postgresql://hostname:5432/database_name
DB_USERNAME=database_user
DB_PASSWORD=strong_password_here
```

### JWT Authentication
```bash
# Generate secure JWT secret (minimal 256 bits / 32 bytes, base64 encoded)
# Example command: openssl rand -base64 64
JWT_SECRET=your_secure_jwt_secret_base64_encoded_minimum_256_bits
```

### CORS Configuration
```bash
# Comma-separated list of allowed origins for production
CORS_ORIGINS=https://your-production-domain.com
```

## Optional Environment Variables

### JWT Expiration (default: 1 hour)
```bash
JWT_EXPIRATION=3600000         # Access token expiration in milliseconds
JWT_REFRESH_EXPIRATION=604800000  # Refresh token expiration in milliseconds
```

### Server Configuration
```bash
SERVER_PORT=8080
LOG_PATH=/var/log/mamre
```

### Security
```bash
# Set to false only for development/testing (NOT recommended for production)
SECURITY_ENABLED=true
```

### Flyway Database Migration
```bash
FLYWAY_ENABLED=true
```

---

## Running in Production

```bash
# Run with production profile
java -jar mamre-starter-fixed.jar --spring.profiles.active=prod

# Or set via environment variable
export SPRING_PROFILES_ACTIVE=prod
java -jar mamre-starter-fixed.jar
```

## Running in Development

```bash
# Run with dev profile (relaxed security for testing)
java -jar mamre-starter-fixed.jar --spring.profiles.active=dev
```

---

## Security Checklist

Before deploying to production, ensure:

- [ ] `DB_PASSWORD` is set and is a strong password
- [ ] `JWT_SECRET` is set with at least 256-bit random string (base64 encoded)
- [ ] `CORS_ORIGINS` only contains your production domain(s)
- [ ] `SECURITY_ENABLED=true` is set (default)
- [ ] HTTPS is enabled on your server/load balancer
- [ ] Swagger UI is disabled or protected (not accessible publicly)
- [ ] Database credentials are not hardcoded anywhere
- [ ] Log files are secured and rotated properly
