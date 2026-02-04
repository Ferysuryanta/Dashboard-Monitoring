package com.mamregbkp.service.spec;

import com.mamregbkp.model.Attendance;
import com.mamregbkp.model.Member;
import com.mamregbkp.model.Sector;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Objects;

public class AttendanceSpecification {

    public static Specification<Attendance> withFilters(String member, LocalDate from, LocalDate to, Long sectorId, String sectorName) {
        return (Root<Attendance> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            // join member and sector for filtering (do NOT use fetch here to avoid issues with count query)
            Join<Attendance, Member> memberJoin = root.join("member", JoinType.LEFT);
            Join<Member, Sector> sectorJoin = memberJoin.join("sector", JoinType.LEFT);

            // ensure distinct results when fetch joins used
            query.distinct(true);

            Predicate p = cb.conjunction();

            if (member != null && !member.isBlank()) {
                String like = "%" + member.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(cb.concat(cb.coalesce(memberJoin.get("firstName"), cb.literal("")), cb.concat(cb.literal(" "),
                        cb.coalesce(memberJoin.get("lastName"), cb.literal(""))))), like);
                Predicate emailLike = cb.like(cb.lower(cb.coalesce(memberJoin.get("email"), cb.literal(""))), like);
                p = cb.and(p, cb.or(nameLike, emailLike));
            }

            if (from != null) {
                p = cb.and(p, cb.greaterThanOrEqualTo(root.get("attendDate"), from));
            }
            if (to != null) {
                p = cb.and(p, cb.lessThanOrEqualTo(root.get("attendDate"), to));
            }

            if (sectorId != null) {
                p = cb.and(p, cb.equal(sectorJoin.get("id"), sectorId));
            } else if (sectorName != null && !sectorName.isBlank()) {
                String sLike = "%" + sectorName.trim().toLowerCase() + "%";
                p = cb.and(p, cb.like(cb.lower(cb.coalesce(sectorJoin.get("name"), cb.literal(""))), sLike));
            }

            return p;
        };
    }
}
