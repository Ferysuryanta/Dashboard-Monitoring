package com.mamregbkp.service.spec;

import com.mamregbkp.model.Member;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class MemberSpecification {
    public static Specification<Member> search(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String like = "%" + keyword.toLowerCase() + "%";
            List<Predicate> preds = new ArrayList<>();
            try { preds.add(cb.like(cb.lower(root.get("firstName")), like)); } catch (Exception ignored) {}
            try { preds.add(cb.like(cb.lower(root.get("lastName")), like)); } catch (Exception ignored) {}
            try { preds.add(cb.like(cb.lower(root.get("email")), like)); } catch (Exception ignored) {}
            try { preds.add(cb.like(cb.lower(root.get("phone")), like)); } catch (Exception ignored) {}

            // try join position & sector safely
            try { preds.add(cb.like(cb.lower(root.join("position", JoinType.LEFT).get("name")), like)); } catch (Exception ignored) {}
            try { preds.add(cb.like(cb.lower(root.join("sector", JoinType.LEFT).get("name")), like)); } catch (Exception ignored) {}

            if (preds.isEmpty()) return cb.conjunction();
            return cb.or(preds.toArray(new Predicate[0]));
        };
    }

    public static Specification<Member> filterStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return cb.conjunction();
            try {
                Class<?> javaType = root.getModel().getAttribute("status").getJavaType();
                if (javaType.isEnum()) {
                    @SuppressWarnings("unchecked")
                    Class<? extends Enum> enumType = (Class<? extends Enum>) javaType;
                    try {
                        Enum e = Enum.valueOf(enumType, status.toUpperCase());
                        return cb.equal(root.get("status"), e);
                    } catch (Exception ex) {
                        return cb.equal(cb.lower(root.get("status").as(String.class)), status.toLowerCase());
                    }
                } else {
                    return cb.equal(cb.lower(root.get("status").as(String.class)), status.toLowerCase());
                }
            } catch (IllegalArgumentException ex) {
                return cb.conjunction();
            }
        };
    }
}

