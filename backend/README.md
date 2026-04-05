Mamre GBKP - Starter Project (fixed mapping)
===========================================

What I fixed:
 - MemberDto includes sectorId, positionId, joinedDate
 - MemberService maps sectorId/positionId -> entity relations using repositories
 - Member entity sets createdAt/updatedAt automatically with @PrePersist/@PreUpdate
 - Member.status stored as VARCHAR to avoid PostgreSQL enum casting issues

How to run:
 1. Update `src/main/resources/application.yml` or set env vars for DB credentials.
 2. Run backend with Maven:
	```
    mvn "-Dspring-boot.run.profiles=dev" spring-boot:run
	```

Monitoring & Grafana:
 - Project-specific Grafana / Prometheus setup ada di `backend/MONITORING_GRAFANA.md`.
 - Sample config files tersedia di folder `backend/monitoring/`.
 - Cara termudah untuk monitoring lokal sekarang adalah:
   ```
   cd backend/monitoring
   docker compose up -d
   ```
