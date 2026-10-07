Feature: User Approval Workflow
  As a System Administrator
  I want to be able to approve pending users
  So that they can access their respective portals

  Scenario: Admin approves a pending veterinarian
    Given a pending user exists with email "pendingvet@petnexus.com"
    When the admin approves the user
    Then the user status should become "Active"
