@IsTest
private class CampaignAudienceBuilderControllerTest {
    @TestSetup
    static void setupData() {
        Account healthcareAccount = new Account(
            Name = 'Kona Healthcare',
            Industry = 'Healthcare'
        );
        Account financeAccount = new Account(
            Name = 'Kona Finance',
            Industry = 'Finance'
        );
        insert new List<Account>{ healthcareAccount, financeAccount };

        insert new List<Contact>{
            new Contact(
                FirstName = 'Ada',
                LastName = 'Care',
                Email = 'ada@example.com',
                Title = 'Compliance Director',
                MailingState = 'CA',
                AccountId = healthcareAccount.Id
            ),
            new Contact(
                FirstName = 'Katherine',
                LastName = 'Finance',
                Email = 'katherine@example.com',
                Title = 'Compliance Director',
                MailingState = 'CA',
                AccountId = financeAccount.Id
            ),
            new Contact(
                FirstName = 'Grace',
                LastName = 'OptedOut',
                Email = 'grace@example.com',
                Title = 'Compliance Director',
                MailingState = 'CA',
                HasOptedOutOfEmail = true,
                AccountId = healthcareAccount.Id
            )
        };

        insert new List<Lead>{
            new Lead(
                FirstName = 'Linus',
                LastName = 'Lead',
                Company = 'Kona Healthcare',
                Email = 'linus@example.com',
                Industry = 'Healthcare',
                State = 'CA',
                Title = 'Compliance Manager'
            ),
            new Lead(
                FirstName = 'Mary',
                LastName = 'Finance',
                Company = 'Kona Finance',
                Email = 'mary@example.com',
                Industry = 'Finance',
                State = 'CA',
                Title = 'Compliance Manager'
            ),
            new Lead(
                FirstName = 'Alan',
                LastName = 'OptedOut',
                Company = 'Kona Healthcare',
                Email = 'alan@example.com',
                Industry = 'Healthcare',
                State = 'CA',
                Title = 'Compliance Manager',
                HasOptedOutOfEmail = true
            ),
            new Lead(
                FirstName = 'No',
                LastName = 'Email',
                Company = 'Kona Healthcare',
                Industry = 'Healthcare',
                State = 'CA',
                Title = 'Compliance Manager'
            )
        };
    }

    @IsTest
    static void previewsEligibleAudience() {
        Campaign campaign = createCampaign();
        Contact existingContact = [
            SELECT Id
            FROM Contact
            WHERE Email = 'ada@example.com'
            LIMIT 1
        ];
        insert new CampaignMember(CampaignId = campaign.Id, ContactId = existingContact.Id, Status = 'Sent');

        CampaignAudienceBuilderController.AudienceCriteria criteria = baseCriteria(campaign.Id);

        Test.startTest();
        CampaignAudienceBuilderController.AudiencePreview preview =
            CampaignAudienceBuilderController.previewAudience(criteria);
        Test.stopTest();

        System.assertEquals(0, preview.eligibleContacts, 'Existing and opted-out contacts should be excluded.');
        System.assertEquals(1, preview.eligibleLeads, 'One lead should match the selected filters.');
        System.assertEquals(1, preview.eligibleTotal, 'Expected one eligible audience member.');
        System.assertEquals(1, preview.existingContacts, 'Expected existing contact member to be counted.');
    }

    @IsTest
    static void buildsCampaignAudience() {
        Campaign campaign = createCampaign();
        CampaignAudienceBuilderController.AudienceCriteria criteria = baseCriteria(campaign.Id);
        criteria.maxRecords = 10;

        Test.startTest();
        CampaignAudienceBuilderController.BuildResult result =
            CampaignAudienceBuilderController.buildAudience(criteria);
        Test.stopTest();

        System.assertEquals(2, result.createdMembers, 'Expected one contact and one lead to be added.');
        System.assertEquals(0, result.failedMembers, 'Expected all members to be added.');
        System.assertEquals(2, [
            SELECT COUNT()
            FROM CampaignMember
            WHERE CampaignId = :campaign.Id
        ], 'Expected exactly two campaign members.');
    }

    @IsTest
    static void excludesSelectedPeopleFromPreviewAndBuild() {
        Campaign campaign = createCampaign();
        Contact contact = [
            SELECT Id
            FROM Contact
            WHERE Email = 'ada@example.com'
            LIMIT 1
        ];
        Lead lead = [
            SELECT Id
            FROM Lead
            WHERE Email = 'linus@example.com'
            LIMIT 1
        ];
        CampaignAudienceBuilderController.AudienceCriteria criteria = baseCriteria(campaign.Id);
        criteria.excludedContactIds = new List<Id>{ contact.Id };
        criteria.excludedLeadIds = new List<Id>{ lead.Id };

        Test.startTest();
        CampaignAudienceBuilderController.AudiencePreview preview =
            CampaignAudienceBuilderController.previewAudience(criteria);
        CampaignAudienceBuilderController.BuildResult result =
            CampaignAudienceBuilderController.buildAudience(criteria);
        Test.stopTest();

        System.assertEquals(0, preview.eligibleTotal, 'Excluded people should not count as eligible.');
        System.assertEquals(0, result.createdMembers, 'Excluded people should not be added.');
        System.assertEquals(0, [
            SELECT COUNT()
            FROM CampaignMember
            WHERE CampaignId = :campaign.Id
        ], 'Expected no campaign members to be created.');
    }

    @IsTest
    static void filtersByMultipleIndustries() {
        Campaign campaign = createCampaign();
        CampaignAudienceBuilderController.AudienceCriteria criteria = baseCriteria(campaign.Id);
        criteria.industries = new List<String>{ 'Healthcare', 'Finance' };

        Test.startTest();
        CampaignAudienceBuilderController.AudiencePreview preview =
            CampaignAudienceBuilderController.previewAudience(criteria);
        List<CampaignAudienceBuilderController.AudienceRow> rows =
            CampaignAudienceBuilderController.getEligibleAudience(criteria);
        Test.stopTest();

        System.assertEquals(2, preview.eligibleContacts, 'Expected contacts from both selected industries.');
        System.assertEquals(2, preview.eligibleLeads, 'Expected leads from both selected industries.');
        System.assertEquals(4, preview.eligibleTotal, 'Expected both industries to be included.');
        System.assertEquals(4, rows.size(), 'Expected eligible rows from both selected industries.');
    }

    @IsTest
    static void includesEmailOptOutWhenExclusionDisabled() {
        Campaign campaign = createCampaign();
        CampaignAudienceBuilderController.AudienceCriteria criteria = baseCriteria(campaign.Id);
        criteria.excludeEmailOptOut = false;

        Test.startTest();
        CampaignAudienceBuilderController.AudiencePreview preview =
            CampaignAudienceBuilderController.previewAudience(criteria);
        List<CampaignAudienceBuilderController.AudienceRow> rows =
            CampaignAudienceBuilderController.getEligibleAudience(criteria);
        Test.stopTest();

        System.assertEquals(2, preview.eligibleContacts, 'Expected opted-out contacts when exclusion is disabled.');
        System.assertEquals(2, preview.eligibleLeads, 'Expected opted-out leads when exclusion is disabled.');
        System.assertEquals(4, rows.size(), 'Expected eligible rows to include opted-out people.');
    }

    @IsTest
    static void returnsEligibleAudienceRows() {
        Campaign campaign = createCampaign();
        CampaignAudienceBuilderController.AudienceCriteria criteria = baseCriteria(campaign.Id);

        Test.startTest();
        List<CampaignAudienceBuilderController.AudienceRow> rows =
            CampaignAudienceBuilderController.getEligibleAudience(criteria);
        Test.stopTest();

        System.assertEquals(2, rows.size(), 'Expected one eligible contact and one eligible lead row.');
        System.assertEquals('Contact', rows[0].sourceType, 'Expected contacts to appear first.');
        System.assert(!String.isBlank(rows[0].recordUrl), 'Expected a record URL for navigation.');
    }

    @IsTest
    static void returnsCampaignAndStatusOptions() {
        Campaign campaign = createCampaign();

        Test.startTest();
        List<CampaignAudienceBuilderController.SelectOption> campaigns =
            CampaignAudienceBuilderController.searchCampaigns('Audience Builder');
        List<CampaignAudienceBuilderController.SelectOption> statuses =
            CampaignAudienceBuilderController.getMemberStatusOptions(campaign.Id);
        List<CampaignAudienceBuilderController.SelectOption> industries =
            CampaignAudienceBuilderController.getIndustryOptions();
        Test.stopTest();

        System.assert(!campaigns.isEmpty(), 'Expected campaign options.');
        System.assertNotEquals(null, statuses, 'Expected status lookup to return a list.');
        System.assert(!industries.isEmpty(), 'Expected industry options.');
    }

    private static Campaign createCampaign() {
        Campaign campaign = new Campaign(
            Name = 'Audience Builder Test Campaign',
            IsActive = true,
            Status = 'In Progress'
        );
        insert campaign;
        return campaign;
    }

    private static CampaignAudienceBuilderController.AudienceCriteria baseCriteria(Id campaignId) {
        CampaignAudienceBuilderController.AudienceCriteria criteria =
            new CampaignAudienceBuilderController.AudienceCriteria();
        criteria.campaignId = campaignId;
        criteria.includeContacts = true;
        criteria.includeLeads = true;
        criteria.industries = new List<String>{ 'Healthcare' };
        criteria.state = 'CA';
        criteria.title = 'Compliance';
        criteria.emailDomain = 'example.com';
        criteria.companyName = 'Kona';
        criteria.memberStatus = 'Sent';
        criteria.excludeEmailOptOut = true;
        criteria.maxRecords = 5000;
        return criteria;
    }
}