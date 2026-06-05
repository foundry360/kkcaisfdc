@IsTest
private class AIReadinessLeadNotificationHandlerTest {
    @IsTest
    static void sendsEmailForAiReadinessLeadOnly() {
        Lead assessmentLead = new Lead(
            FirstName = 'Avery',
            LastName = 'Stone',
            Company = 'Acme Health Partners',
            Email = 'avery@example.com',
            Phone = '555-0101',
            LeadSource = 'AI Readiness Assessment'
        );
        Lead otherLead = new Lead(
            FirstName = 'Casey',
            LastName = 'Other',
            Company = 'Other Company',
            Email = 'casey@example.com',
            LeadSource = 'Web'
        );

        Test.startTest();
        insert new List<Lead>{ assessmentLead, otherLead };
        Test.stopTest();

        System.assertEquals(
            1,
            AIReadinessLeadNotificationHandler.messagesPreparedForTest,
            'Expected one notification message for the AI Readiness lead.'
        );
    }

    @IsTest
    static void sendsEmailWhenExistingLeadBecomesAiReadinessLead() {
        Lead existingLead = new Lead(
            FirstName = 'Jordan',
            LastName = 'Case',
            Company = 'Existing Company',
            Email = 'jordan@example.com',
            LeadSource = 'Web'
        );
        insert existingLead;

        AIReadinessLeadNotificationHandler.messagesPreparedForTest = 0;
        existingLead.LeadSource = 'AI Readiness Assessment';

        Test.startTest();
        update existingLead;
        Test.stopTest();

        System.assertEquals(
            1,
            AIReadinessLeadNotificationHandler.messagesPreparedForTest,
            'Expected one notification when an existing lead becomes an AI Readiness lead.'
        );
    }
}
