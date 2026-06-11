public with sharing class CampaignCommandCenterController {
    private static final Integer CAMPAIGN_LIMIT = 50;
    private static final Integer ACTIVITY_LIMIT = 20;

    public class Dashboard {
        @AuraEnabled public DashboardSummary summary;
        @AuraEnabled public List<CampaignRow> campaigns;
        @AuraEnabled public CampaignRow selectedCampaign;
        @AuraEnabled public List<StatusBreakdownRow> statusBreakdown;
        @AuraEnabled public List<ActivityRow> activity;

        public Dashboard() {
            summary = new DashboardSummary();
            campaigns = new List<CampaignRow>();
            statusBreakdown = new List<StatusBreakdownRow>();
            activity = new List<ActivityRow>();
        }
    }

    public class DashboardSummary {
        @AuraEnabled public Integer totalCampaigns = 0;
        @AuraEnabled public Integer activeCampaigns = 0;
        @AuraEnabled public Integer totalMembers = 0;
        @AuraEnabled public Integer respondedMembers = 0;
        @AuraEnabled public Integer openedEmails = 0;
        @AuraEnabled public Integer clickedEmails = 0;
        @AuraEnabled public Decimal responseRate = 0;
        @AuraEnabled public Decimal openClickRate = 0;
    }

    public class CampaignRow {
        @AuraEnabled public Id id;
        @AuraEnabled public String recordUrl;
        @AuraEnabled public String name;
        @AuraEnabled public String status;
        @AuraEnabled public String type;
        @AuraEnabled public Boolean isActive;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        @AuraEnabled public String ownerName;
        @AuraEnabled public Integer totalMembers = 0;
        @AuraEnabled public Integer contactMembers = 0;
        @AuraEnabled public Integer leadMembers = 0;
        @AuraEnabled public Integer respondedMembers = 0;
        @AuraEnabled public Integer openedEmails = 0;
        @AuraEnabled public Integer clickedEmails = 0;
        @AuraEnabled public Decimal responseRate = 0;
    }

    public class StatusBreakdownRow {
        @AuraEnabled public String status;
        @AuraEnabled public Integer totalMembers = 0;
        @AuraEnabled public Decimal shareOfMembers = 0;
    }

    public class ActivityRow {
        @AuraEnabled public Id id;
        @AuraEnabled public String recordUrl;
        @AuraEnabled public String activityType;
        @AuraEnabled public String subject;
        @AuraEnabled public String status;
        @AuraEnabled public Date activityDate;
        @AuraEnabled public Datetime activityDateTime;
        @AuraEnabled public String ownerName;
    }

    @AuraEnabled
    public static Dashboard getCommandCenterData(String searchTerm, Id selectedCampaignId) {
        if (!Schema.sObjectType.Campaign.isAccessible()) {
            throw new AuraHandledException('You do not have permission to read campaigns.');
        }

        Dashboard dashboard = new Dashboard();
        dashboard.campaigns = queryCampaignRows(searchTerm);
        populateCampaignMetrics(dashboard.campaigns);
        populateEmailMetrics(dashboard.campaigns);
        populateSummary(dashboard);

        if (selectedCampaignId != null) {
            dashboard.selectedCampaign = findSelectedCampaign(dashboard.campaigns, selectedCampaignId);
            if (dashboard.selectedCampaign == null) {
                dashboard.selectedCampaign = querySingleCampaignRow(selectedCampaignId);
                if (dashboard.selectedCampaign != null) {
                    populateCampaignMetrics(new List<CampaignRow>{ dashboard.selectedCampaign });
                    populateEmailMetrics(new List<CampaignRow>{ dashboard.selectedCampaign });
                }
            }
            if (dashboard.selectedCampaign != null) {
                dashboard.statusBreakdown = queryStatusBreakdown(selectedCampaignId, dashboard.selectedCampaign.totalMembers);
                dashboard.activity = queryRecentActivity(selectedCampaignId);
            }
        }

        return dashboard;
    }

    private static List<CampaignRow> queryCampaignRows(String searchTerm) {
        String query =
            'SELECT Id, Name, Status, Type, IsActive, StartDate, EndDate, Owner.Name ' +
            'FROM Campaign ';
        if (!String.isBlank(searchTerm)) {
            query += 'WHERE Name LIKE \'%' + escapeLike(searchTerm.trim()) + '%\' ';
        }
        query += 'ORDER BY IsActive DESC, LastModifiedDate DESC LIMIT ' + CAMPAIGN_LIMIT;

        List<CampaignRow> rows = new List<CampaignRow>();
        for (Campaign campaign : Database.query(query)) {
            rows.add(rowFromCampaign(campaign));
        }
        return rows;
    }

    private static CampaignRow querySingleCampaignRow(Id campaignId) {
        List<Campaign> campaigns = [
            SELECT Id, Name, Status, Type, IsActive, StartDate, EndDate, Owner.Name
            FROM Campaign
            WHERE Id = :campaignId
            LIMIT 1
        ];
        return campaigns.isEmpty() ? null : rowFromCampaign(campaigns[0]);
    }

    private static CampaignRow rowFromCampaign(Campaign campaign) {
        CampaignRow row = new CampaignRow();
        row.id = campaign.Id;
        row.recordUrl = '/' + campaign.Id;
        row.name = campaign.Name;
        row.status = campaign.Status;
        row.type = campaign.Type;
        row.isActive = campaign.IsActive;
        row.startDate = campaign.StartDate;
        row.endDate = campaign.EndDate;
        row.ownerName = campaign.Owner != null ? campaign.Owner.Name : null;
        return row;
    }

    private static void populateCampaignMetrics(List<CampaignRow> campaignRows) {
        if (campaignRows.isEmpty() || !Schema.sObjectType.CampaignMember.isAccessible()) {
            return;
        }

        Map<Id, CampaignRow> rowsById = new Map<Id, CampaignRow>();
        for (CampaignRow row : campaignRows) {
            rowsById.put(row.id, row);
        }

        for (AggregateResult result : [
            SELECT CampaignId, COUNT(Id) totalMembers
            FROM CampaignMember
            WHERE CampaignId IN :rowsById.keySet()
            GROUP BY CampaignId
        ]) {
            rowsById.get((Id) result.get('CampaignId')).totalMembers = (Integer) result.get('totalMembers');
        }
        for (AggregateResult result : [
            SELECT CampaignId, COUNT(Id) respondedMembers
            FROM CampaignMember
            WHERE CampaignId IN :rowsById.keySet()
                AND HasResponded = true
            GROUP BY CampaignId
        ]) {
            rowsById.get((Id) result.get('CampaignId')).respondedMembers = (Integer) result.get('respondedMembers');
        }
        for (AggregateResult result : [
            SELECT CampaignId, COUNT(Id) contactMembers
            FROM CampaignMember
            WHERE CampaignId IN :rowsById.keySet()
                AND ContactId != null
            GROUP BY CampaignId
        ]) {
            rowsById.get((Id) result.get('CampaignId')).contactMembers = (Integer) result.get('contactMembers');
        }
        for (AggregateResult result : [
            SELECT CampaignId, COUNT(Id) leadMembers
            FROM CampaignMember
            WHERE CampaignId IN :rowsById.keySet()
                AND LeadId != null
            GROUP BY CampaignId
        ]) {
            rowsById.get((Id) result.get('CampaignId')).leadMembers = (Integer) result.get('leadMembers');
        }

        for (CampaignRow row : campaignRows) {
            row.responseRate = calculateRate(row.respondedMembers, row.totalMembers);
        }
    }

    private static void populateEmailMetrics(List<CampaignRow> campaignRows) {
        if (campaignRows.isEmpty()) {
            return;
        }

        Map<Id, CampaignRow> rowsById = new Map<Id, CampaignRow>();
        for (CampaignRow row : campaignRows) {
            rowsById.put(row.id, row);
        }

        populateListEmailMetrics(rowsById);
        populateCustomClickMetrics(rowsById);
    }

    private static void populateListEmailMetrics(Map<Id, CampaignRow> rowsById) {
        if (!Schema.sObjectType.ListEmail.isAccessible() || !Schema.sObjectType.ListEmailSentResult.isAccessible()) {
            return;
        }

        Map<Id, CampaignRow> rowByListEmailId = new Map<Id, CampaignRow>();
        Set<Id> listEmailIds = new Set<Id>();
        for (ListEmail email : [
            SELECT Id, CampaignId
            FROM ListEmail
            WHERE CampaignId IN :rowsById.keySet()
        ]) {
            listEmailIds.add(email.Id);
            rowByListEmailId.put(email.Id, rowsById.get(email.CampaignId));
        }
        if (listEmailIds.isEmpty()) {
            return;
        }

        try {
            for (SObject sentResult : Database.query(
                'SELECT FIELDS(STANDARD) ' +
                'FROM ListEmailSentResult ' +
                'WHERE ListEmailId IN :listEmailIds'
            )) {
                Map<String, Object> sentResultFields = sentResult.getPopulatedFieldsAsMap();
                CampaignRow row = rowByListEmailId.get((Id) sentResultFields.get('ListEmailId'));
                if (row != null) {
                    if (sentResultFields.get('FirstOpenedDate') != null) {
                        row.openedEmails++;
                    }
                    if (sentResultFields.get('FirstClickedDate') != null) {
                        row.clickedEmails++;
                    }
                }
            }
        } catch (QueryException e) {
            return;
        }
    }

    private static void populateCustomClickMetrics(Map<Id, CampaignRow> rowsById) {
        if (!Schema.sObjectType.Marketing_Email_Click__c.isAccessible()) {
            return;
        }

        Map<String, CampaignRow> rowsByCampaignIdValue = new Map<String, CampaignRow>();
        for (Id campaignId : rowsById.keySet()) {
            rowsByCampaignIdValue.put(String.valueOf(campaignId), rowsById.get(campaignId));
        }

        for (AggregateResult result : [
            SELECT Campaign_Id__c campaignIdValue, COUNT(Id) clickedEmails
            FROM Marketing_Email_Click__c
            WHERE Campaign_Id__c IN :rowsByCampaignIdValue.keySet()
            GROUP BY Campaign_Id__c
        ]) {
            CampaignRow row = rowsByCampaignIdValue.get((String) result.get('campaignIdValue'));
            if (row != null) {
                row.clickedEmails = (Integer) result.get('clickedEmails');
            }
        }
    }

    private static void populateSummary(Dashboard dashboard) {
        dashboard.summary.totalCampaigns = dashboard.campaigns.size();
        for (CampaignRow row : dashboard.campaigns) {
            if (row.isActive == true) {
                dashboard.summary.activeCampaigns++;
            }
            dashboard.summary.totalMembers += row.totalMembers;
            dashboard.summary.respondedMembers += row.respondedMembers;
            dashboard.summary.openedEmails += row.openedEmails;
            dashboard.summary.clickedEmails += row.clickedEmails;
        }
        dashboard.summary.responseRate = calculateRate(
            dashboard.summary.respondedMembers,
            dashboard.summary.totalMembers
        );
        dashboard.summary.openClickRate = calculateRate(
            dashboard.summary.clickedEmails,
            dashboard.summary.openedEmails
        );
    }

    private static CampaignRow findSelectedCampaign(List<CampaignRow> campaignRows, Id selectedCampaignId) {
        for (CampaignRow row : campaignRows) {
            if (row.id == selectedCampaignId) {
                return row;
            }
        }
        return null;
    }

    private static List<StatusBreakdownRow> queryStatusBreakdown(Id campaignId, Integer totalMembers) {
        List<StatusBreakdownRow> rows = new List<StatusBreakdownRow>();
        if (!Schema.sObjectType.CampaignMember.isAccessible()) {
            return rows;
        }

        for (AggregateResult result : [
            SELECT Status, COUNT(Id) totalMembers
            FROM CampaignMember
            WHERE CampaignId = :campaignId
            GROUP BY Status
            ORDER BY Status ASC
        ]) {
            StatusBreakdownRow row = new StatusBreakdownRow();
            row.status = (String) result.get('Status');
            row.totalMembers = (Integer) result.get('totalMembers');
            row.shareOfMembers = calculateRate(row.totalMembers, totalMembers);
            rows.add(row);
        }
        return rows;
    }

    private static List<ActivityRow> queryRecentActivity(Id campaignId) {
        List<ActivityRow> rows = new List<ActivityRow>();
        if (Schema.sObjectType.Task.isAccessible()) {
            for (Task task : [
                SELECT Id, Subject, Status, ActivityDate, LastModifiedDate, Owner.Name
                FROM Task
                WHERE WhatId = :campaignId
                ORDER BY LastModifiedDate DESC
                LIMIT :ACTIVITY_LIMIT
            ]) {
                ActivityRow row = new ActivityRow();
                row.id = task.Id;
                row.recordUrl = '/' + task.Id;
                row.activityType = 'Task';
                row.subject = task.Subject;
                row.status = task.Status;
                row.activityDate = task.ActivityDate;
                row.activityDateTime = task.LastModifiedDate;
                row.ownerName = task.Owner != null ? task.Owner.Name : null;
                rows.add(row);
            }
        }
        if (rows.size() < ACTIVITY_LIMIT && Schema.sObjectType.Event.isAccessible()) {
            Integer remainingLimit = ACTIVITY_LIMIT - rows.size();
            for (Event event : [
                SELECT Id, Subject, StartDateTime, ActivityDate, Owner.Name
                FROM Event
                WHERE WhatId = :campaignId
                ORDER BY StartDateTime DESC
                LIMIT :remainingLimit
            ]) {
                ActivityRow row = new ActivityRow();
                row.id = event.Id;
                row.recordUrl = '/' + event.Id;
                row.activityType = 'Event';
                row.subject = event.Subject;
                row.activityDate = event.ActivityDate;
                row.activityDateTime = event.StartDateTime;
                row.ownerName = event.Owner != null ? event.Owner.Name : null;
                rows.add(row);
            }
        }
        return rows;
    }

    private static Decimal calculateRate(Integer numerator, Integer denominator) {
        if (denominator == null || denominator == 0 || numerator == null) {
            return 0;
        }
        return ((Decimal) numerator / denominator * 100).setScale(0);
    }

    private static String escape(String value) {
        return String.escapeSingleQuotes(value.trim());
    }

    private static String escapeLike(String value) {
        return escape(value).replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_');
    }
}
