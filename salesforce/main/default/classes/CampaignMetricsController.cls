public with sharing class CampaignMetricsController {
    public class CampaignMetrics {
        @AuraEnabled public Integer totalMembers;
        @AuraEnabled public Integer openedEmails;
        @AuraEnabled public Integer clickedEmails;
        @AuraEnabled public Integer respondedMembers;
        @AuraEnabled public Decimal responseRate;

        public CampaignMetrics() {
            totalMembers = 0;
            openedEmails = 0;
            clickedEmails = 0;
            respondedMembers = 0;
            responseRate = 0;
        }
    }

    @AuraEnabled(cacheable=true)
    public static CampaignMetrics getCampaignMetrics(Id campaignId) {
        if (campaignId == null) {
            throw new AuraHandledException('Campaign Id is required.');
        }
        if (!Schema.sObjectType.Campaign.isAccessible()) {
            throw new AuraHandledException('You do not have permission to read campaigns.');
        }

        List<Campaign> campaigns = [
            SELECT Id
            FROM Campaign
            WHERE Id = :campaignId
            LIMIT 1
        ];
        if (campaigns.isEmpty()) {
            throw new AuraHandledException('The selected campaign could not be found.');
        }

        CampaignMetrics metrics = new CampaignMetrics();
        populateMemberMetrics(metrics, campaignId);
        populateListEmailMetrics(metrics, campaignId);
        populateCustomClickMetrics(metrics, campaignId);
        return metrics;
    }

    private static void populateMemberMetrics(CampaignMetrics metrics, Id campaignId) {
        if (!Schema.sObjectType.CampaignMember.isAccessible()) {
            return;
        }

        metrics.totalMembers = [
            SELECT COUNT()
            FROM CampaignMember
            WHERE CampaignId = :campaignId
        ];
        metrics.respondedMembers = [
            SELECT COUNT()
            FROM CampaignMember
            WHERE CampaignId = :campaignId
                AND HasResponded = true
        ];
        metrics.responseRate = metrics.totalMembers == 0
            ? 0
            : ((Decimal) metrics.respondedMembers / metrics.totalMembers * 100).setScale(0);
    }

    private static void populateListEmailMetrics(CampaignMetrics metrics, Id campaignId) {
        if (!Schema.sObjectType.ListEmail.isAccessible() || !Schema.sObjectType.ListEmailSentResult.isAccessible()) {
            return;
        }

        Set<Id> listEmailIds = new Set<Id>();
        for (ListEmail email : [
            SELECT Id
            FROM ListEmail
            WHERE CampaignId = :campaignId
        ]) {
            listEmailIds.add(email.Id);
        }
        if (listEmailIds.isEmpty()) {
            return;
        }

        metrics.openedEmails = Database.countQuery(
            'SELECT COUNT() FROM ListEmailSentResult ' +
            'WHERE ListEmailId IN :listEmailIds AND FirstOpenedDate != null'
        );
        metrics.clickedEmails = Database.countQuery(
            'SELECT COUNT() FROM ListEmailSentResult ' +
            'WHERE ListEmailId IN :listEmailIds AND FirstClickedDate != null'
        );
    }

    private static void populateCustomClickMetrics(CampaignMetrics metrics, Id campaignId) {
        if (!Schema.sObjectType.Marketing_Email_Click__c.isAccessible()) {
            return;
        }

        String campaignIdValue = String.valueOf(campaignId);
        Integer totalClicks = [
            SELECT COUNT()
            FROM Marketing_Email_Click__c
            WHERE Campaign_Id__c = :campaignIdValue
        ];
        if (totalClicks > 0) {
            metrics.clickedEmails = totalClicks;
        }
    }
}