@IsTest
private class CampaignCommandCenterControllerTest {
    @TestSetup
    static void setupData() {
        Campaign activeCampaign = new Campaign(
            Name = 'Command Center Webinar',
            IsActive = true,
            Status = 'In Progress',
            Type = 'Webinar',
            StartDate = Date.today().addDays(-7),
            EndDate = Date.today().addDays(7)
        );
        Campaign completedCampaign = new Campaign(
            Name = 'Command Center Completed',
            IsActive = false,
            Status = 'Completed',
            Type = 'Email',
            StartDate = Date.today().addDays(-30),
            EndDate = Date.today().addDays(-20)
        );
        insert new List<Campaign>{ activeCampaign, completedCampaign };

        Account account = new Account(Name = 'Kona Command Center');
        insert account;

        Contact contact = new Contact(
            FirstName = 'Ada',
            LastName = 'Command',
            Email = 'ada.command@example.com',
            AccountId = account.Id
        );
        insert contact;

        Lead lead = new Lead(
            FirstName = 'Linus',
            LastName = 'Command',
            Company = 'Kona Command Center',
            Email = 'linus.command@example.com'
        );
        insert lead;

        insert new List<CampaignMember>{
            new CampaignMember(CampaignId = activeCampaign.Id, ContactId = contact.Id, Status = 'Sent'),
            new CampaignMember(CampaignId = activeCampaign.Id, LeadId = lead.Id, Status = 'Responded')
        };

        insert new Task(
            Subject = 'Review campaign performance',
            Status = 'Completed',
            Priority = 'Normal',
            WhatId = activeCampaign.Id,
            ActivityDate = Date.today()
        );
    }

    @IsTest
    static void returnsPortfolioMetricsAndSelectedCampaignDetails() {
        Campaign campaign = [
            SELECT Id
            FROM Campaign
            WHERE Name = 'Command Center Webinar'
            LIMIT 1
        ];

        Test.startTest();
        CampaignCommandCenterController.Dashboard dashboard =
            CampaignCommandCenterController.getCommandCenterData('Command Center', campaign.Id);
        Test.stopTest();

        System.assertEquals(2, dashboard.summary.totalCampaigns, 'Expected matching campaigns to be counted.');
        System.assertEquals(1, dashboard.summary.activeCampaigns, 'Expected one active campaign.');
        System.assertEquals(2, dashboard.summary.totalMembers, 'Expected total members across matching campaigns.');
        System.assertEquals(1, dashboard.summary.respondedMembers, 'Expected responded members to be counted.');
        System.assertEquals(50, dashboard.summary.responseRate, 'Expected overall response rate.');
        System.assertEquals(0, dashboard.summary.openedEmails, 'Expected summary open count to default to zero.');
        System.assertEquals(0, dashboard.summary.clickedEmails, 'Expected summary click count to default to zero.');
        System.assertEquals(0, dashboard.summary.openClickRate, 'Expected open/click rate to default to zero.');
        System.assertEquals(campaign.Id, dashboard.selectedCampaign.id, 'Expected selected campaign details.');
        System.assertEquals(2, dashboard.selectedCampaign.totalMembers, 'Expected selected campaign members.');
        System.assertEquals(1, dashboard.selectedCampaign.contactMembers, 'Expected contact member count.');
        System.assertEquals(1, dashboard.selectedCampaign.leadMembers, 'Expected lead member count.');
        System.assertEquals(0, dashboard.selectedCampaign.openedEmails, 'Expected open count to default to zero.');
        System.assertEquals(0, dashboard.selectedCampaign.clickedEmails, 'Expected click count to default to zero.');
        System.assert(!dashboard.statusBreakdown.isEmpty(), 'Expected campaign member status breakdown.');
        System.assert(!dashboard.activity.isEmpty(), 'Expected recent campaign activity.');
    }

    @IsTest
    static void returnsEmptyDashboardWhenSearchHasNoMatches() {
        Test.startTest();
        CampaignCommandCenterController.Dashboard dashboard =
            CampaignCommandCenterController.getCommandCenterData('No Matching Campaigns', null);
        Test.stopTest();

        System.assertEquals(0, dashboard.summary.totalCampaigns, 'Expected no matching campaigns.');
        System.assertEquals(0, dashboard.campaigns.size(), 'Expected an empty campaign list.');
        System.assertEquals(null, dashboard.selectedCampaign, 'Expected no selected campaign.');
        System.assertEquals(0, dashboard.statusBreakdown.size(), 'Expected no status rows.');
        System.assertEquals(0, dashboard.activity.size(), 'Expected no activity rows.');
    }
}
