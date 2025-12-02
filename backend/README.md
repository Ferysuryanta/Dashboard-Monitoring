Mamre GBKP - Starter Project (fixed mapping)
===========================================

What I fixed:
 - MemberDto includes sectorId, positionId, joinedDate
 - MemberService maps sectorId/positionId -> entity relations using repositories
 - Member entity sets createdAt/updatedAt automatically with @PrePersist/@PreUpdate
 - Member.status stored as VARCHAR to avoid PostgreSQL enum casting issues

How to run:
 1. Update src/main/resources/application.yml with DB credentials.
 2. Create tables manually in the DB (SQL not included).
 3. mvn spring-boot:run

Uploaded image file (local path):
file:///mnt/data/defa49b1-1306-4fd5-97a9-ec28f6a8e880.png
