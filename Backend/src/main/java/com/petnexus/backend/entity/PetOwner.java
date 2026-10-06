package com.petnexus.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "PET_OWNER")
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class PetOwner extends User {
    public PetOwner() {
        super();
    }
}
