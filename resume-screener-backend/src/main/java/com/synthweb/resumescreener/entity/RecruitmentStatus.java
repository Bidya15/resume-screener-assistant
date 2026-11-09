package com.synthweb.resumescreener.entity;

/**
 * Represents the HR recruitment workflow status for a screened candidate.
 * <p>
 * NEW        → initial state, not yet reviewed by HR
 * SHORTLISTED → candidate moved forward for consideration
 * UNDER_REVIEW → HR is actively evaluating this candidate
 * NOT_SUITABLE → candidate does not meet requirements for this role
 */
public enum RecruitmentStatus {
    NEW,
    SHORTLISTED,
    UNDER_REVIEW,
    NOT_SUITABLE
}

