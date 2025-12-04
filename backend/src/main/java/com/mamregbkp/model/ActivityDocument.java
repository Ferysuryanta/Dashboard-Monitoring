package com.mamregbkp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    private String url; // location of the stored file

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;
}
