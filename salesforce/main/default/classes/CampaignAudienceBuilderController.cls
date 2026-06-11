public with sharing class CampaignAudienceBuilderController {
    private static final Integer DEFAULT_MAX_RECORDS = 5000;
    private static final Integer MAX_RECORDS = 5000;

    public class SelectOption {
        @AuraEnabled public String label { get; set; }
        @AuraEnabled public String value { get; set; }

        public SelectOption(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }

    public class AudienceCriteria {
        @AuraEnabled public Id campaignId { get; set; }
        @AuraEnabled public Boolean includeContacts { get; set; }
        @AuraEnabled public Boolean includeLeads { get; set; }
        @AuraEnabled public String industry { get; set; }
        @AuraEnabled public List<String> industries { get; set; }
        @AuraEnabled public String state { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String emailDomain { get; set; }
        @AuraEnabled public String companyName { get; set; }
        @AuraEnabled public String memberStatus { get; set; }
        @AuraEnabled public Boolean excludeEmailOptOut { get; set; }
        @AuraEnabled public Integer maxRecords { get; set; }
        @AuraEnabled public List<Id> excludedContactIds { get; set; }
        @AuraEnabled public List<Id> excludedLeadIds { get; set; }
    }

    public virtual class AudiencePreview {
        @AuraEnabled public Integer eligibleContacts { get; set; }
        @AuraEnabled public Integer eligibleLeads { get; set; }
        @AuraEnabled public Integer eligibleTotal { get; set; }
        @AuraEnabled public Integer existingContacts { get; set; }
        @AuraEnabled public Integer existingLeads { get; set; }
        @AuraEnabled public Integer maxRecords { get; set; }
        @AuraEnabled public Boolean willCapResults { get; set; }

        public AudiencePreview() {
            eligibleContacts = 0;
            eligibleLeads = 0;
            eligibleTotal = 0;
            existingContacts = 0;
            existingLeads = 0;
            maxRecords = DEFAULT_MAX_RECORDS;
            willCapResults = false;
        }
    }

    public class BuildResult extends AudiencePreview {
        @AuraEnabled public Integer createdMembers { get; set; }
        @AuraEnabled public Integer failedMembers { get; set; }
        @AuraEnabled public String message { get; set; }

        public BuildResult(AudiencePreview preview) {
            eligibleContacts = preview.eligibleContacts;
            eligibleLeads = preview.eligibleLeads;
            eligibleTotal = preview.eligibleTotal;
            existingContacts = preview.existingContacts;
            existingLeads = preview.existingLeads;
            maxRecords = preview.maxRecords;
            willCapResults = preview.willCapResults;
            createdMembers = 0;
            failedMembers = 0;
            message = '';
        }
    }

    public class AudienceRow {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String sourceType { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String company { get; set; }
        @AuraEnabled public String email { get; set; }
        @AuraEnabled public String state { get; set; }
        @AuraEnabled public String industry { get; set; }
        @AuraEnabled public String recordUrl { get; set; }
    }

    @AuraEnabled(cacheable=true)
    public static List<SelectOption> searchCampaigns(String searchTerm) {
        if (!Schema.sObjectType.Campaign.isAccessible()) {
            return new List<SelectOption>();
        }

        String query =
            'SELECT Id, Name, Status, IsActive ' +
            'FROM Campaign ';
        if (!String.isBlank(searchTerm)) {
            query += 'WHERE Name LIKE \'%' + escapeLike(searchTerm.trim()) + '%\' ';
        }
        query += 'ORDER BY IsActive DESC, LastModifiedDate DESC LIMIT 100';

        List<SelectOption> options = new List<SelectOption>();
        for (Campaign campaign : Database.query(query)) {
            String label = campaign.Name;
            if (!String.isBlank(campaign.Status)) {
                label += ' (' + campaign.Status + ')';
            }
            options.add(new SelectOption(label, campaign.Id));
        }
        return options;
    }

    @AuraEnabled(cacheable=true)
    public static List<SelectOption> getMemberStatusOptions(Id campaignId) {
        if (campaignId == null || !Schema.sObjectType.CampaignMemberStatus.isAccessible()) {
            return new List<SelectOption>();
        }

        List<SelectOption> options = new List<SelectOption>();
        for (CampaignMemberStatus status : [
            SELECT Label, IsDefault, SortOrder
            FROM CampaignMemberStatus
            WHERE CampaignId = :campaignId
            ORDER BY SortOrder ASC, Label ASC
        ]) {
            String label = status.Label + (status.IsDefault ? ' (Default)' : '');
            options.add(new SelectOption(label, status.Label));
        }
        return options;
    }

    @AuraEnabled(cacheable=true)
    public static List<SelectOption> getIndustryOptions() {
        Set<String> industryValues = new Set<String>();
        addPicklistValues(industryValues, Schema.SObjectType.Account.fields.Industry);
        addPicklistValues(industryValues, Schema.SObjectType.Lead.fields.Industry);

        List<String> sortedValues = new List<String>(industryValues);
        sortedValues.sort();

        List<SelectOption> options = new List<SelectOption>();
        for (String industryValue : sortedValues) {
            options.add(new SelectOption(industryValue, industryValue));
        }
        return options;
    }

    private static void addPicklistValues(Set<String> values, Schema.DescribeFieldResult fieldDescribe) {
        if (fieldDescribe == null || !fieldDescribe.isAccessible()) {
            return;
        }

        for (Schema.PicklistEntry picklistEntry : fieldDescribe.getPicklistValues()) {
            if (picklistEntry.isActive() && !String.isBlank(picklistEntry.getValue())) {
                values.add(picklistEntry.getValue());
            }
        }
    }

    @AuraEnabled(cacheable=true)
    public static AudiencePreview previewAudience(AudienceCriteria criteria) {
        validateCriteria(criteria, false);
        return buildPreview(criteria);
    }

    @AuraEnabled(cacheable=true)
    public static List<AudienceRow> getEligibleAudience(AudienceCriteria criteria) {
        validateCriteria(criteria, false);

        Integer rowLimit = Math.min(sanitizeMaxRecords(criteria.maxRecords), 200);
        ExistingMemberIds existing = getExistingMemberIds(criteria.campaignId);
        Set<Id> contactIdsToExclude = getContactIdsToExclude(criteria, existing.contactIds);
        Set<Id> leadIdsToExclude = getLeadIdsToExclude(criteria, existing.leadIds);
        List<AudienceRow> rows = new List<AudienceRow>();

        if (criteria.includeContacts == true && Schema.sObjectType.Contact.isAccessible() && rowLimit > 0) {
            for (Contact contact : Database.query(contactQuery(criteria, contactIdsToExclude, false, rowLimit))) {
                rows.add(rowFromContact(contact));
            }
            rowLimit -= rows.size();
        }

        if (criteria.includeLeads == true && Schema.sObjectType.Lead.isAccessible() && rowLimit > 0) {
            for (Lead lead : Database.query(leadQuery(criteria, leadIdsToExclude, false, rowLimit))) {
                rows.add(rowFromLead(lead));
            }
        }

        return rows;
    }

    @AuraEnabled
    public static BuildResult buildAudience(AudienceCriteria criteria) {
        validateCriteria(criteria, true);
        AudiencePreview preview = buildPreview(criteria);
        BuildResult result = new BuildResult(preview);

        List<CampaignMember> membersToInsert = new List<CampaignMember>();
        Integer rowLimit = sanitizeMaxRecords(criteria.maxRecords);
        ExistingMemberIds existing = getExistingMemberIds(criteria.campaignId);
        Set<Id> contactIdsToExclude = getContactIdsToExclude(criteria, existing.contactIds);
        Set<Id> leadIdsToExclude = getLeadIdsToExclude(criteria, existing.leadIds);

        if (criteria.includeContacts == true && rowLimit > 0) {
            for (Id contactId : queryContactIds(criteria, contactIdsToExclude, rowLimit)) {
                CampaignMember member = new CampaignMember(CampaignId = criteria.campaignId, ContactId = contactId);
                applyMemberStatus(member, criteria.memberStatus);
                membersToInsert.add(member);
            }
            rowLimit -= membersToInsert.size();
        }

        if (criteria.includeLeads == true && rowLimit > 0) {
            for (Id leadId : queryLeadIds(criteria, leadIdsToExclude, rowLimit)) {
                CampaignMember member = new CampaignMember(CampaignId = criteria.campaignId, LeadId = leadId);
                applyMemberStatus(member, criteria.memberStatus);
                membersToInsert.add(member);
            }
        }

        if (membersToInsert.isEmpty()) {
            result.message = 'No new campaign members matched the selected filters.';
            return result;
        }

        Database.SaveResult[] saveResults = Database.insert(membersToInsert, false);
        for (Database.SaveResult saveResult : saveResults) {
            if (saveResult.isSuccess()) {
                result.createdMembers++;
            } else {
                result.failedMembers++;
            }
        }
        result.message = result.createdMembers + ' campaign member' +
            (result.createdMembers == 1 ? '' : 's') + ' added.';
        if (result.failedMembers > 0) {
            result.message += ' ' + result.failedMembers + ' record' +
                (result.failedMembers == 1 ? '' : 's') + ' could not be added.';
        }
        return result;
    }

    private static void validateCriteria(AudienceCriteria criteria, Boolean requireWriteAccess) {
        if (criteria == null || criteria.campaignId == null) {
            throw new AuraHandledException('Choose a campaign before building an audience.');
        }
        if (criteria.includeContacts != true && criteria.includeLeads != true) {
            throw new AuraHandledException('Choose Contacts, Leads, or both as the audience source.');
        }
        if (!Schema.sObjectType.Campaign.isAccessible()) {
            throw new AuraHandledException('You do not have permission to read campaigns.');
        }
        if (requireWriteAccess && !Schema.sObjectType.CampaignMember.isCreateable()) {
            throw new AuraHandledException('You do not have permission to add campaign members.');
        }
        List<Campaign> campaigns = [SELECT Id FROM Campaign WHERE Id = :criteria.campaignId LIMIT 1];
        if (campaigns.isEmpty()) {
            throw new AuraHandledException('The selected campaign could not be found.');
        }
    }

    private static AudiencePreview buildPreview(AudienceCriteria criteria) {
        AudiencePreview preview = new AudiencePreview();
        preview.maxRecords = sanitizeMaxRecords(criteria.maxRecords);
        ExistingMemberIds existing = getExistingMemberIds(criteria.campaignId);
        preview.existingContacts = existing.contactIds.size();
        preview.existingLeads = existing.leadIds.size();
        Set<Id> contactIdsToExclude = getContactIdsToExclude(criteria, existing.contactIds);
        Set<Id> leadIdsToExclude = getLeadIdsToExclude(criteria, existing.leadIds);

        if (criteria.includeContacts == true && Schema.sObjectType.Contact.isAccessible()) {
            preview.eligibleContacts = countContacts(criteria, contactIdsToExclude);
        }
        if (criteria.includeLeads == true && Schema.sObjectType.Lead.isAccessible()) {
            preview.eligibleLeads = countLeads(criteria, leadIdsToExclude);
        }

        preview.eligibleTotal = preview.eligibleContacts + preview.eligibleLeads;
        preview.willCapResults = preview.eligibleTotal > preview.maxRecords;
        return preview;
    }

    private class ExistingMemberIds {
        Set<Id> contactIds = new Set<Id>();
        Set<Id> leadIds = new Set<Id>();
    }

    private static ExistingMemberIds getExistingMemberIds(Id campaignId) {
        ExistingMemberIds existing = new ExistingMemberIds();
        if (!Schema.sObjectType.CampaignMember.isAccessible()) {
            return existing;
        }

        for (CampaignMember member : [
            SELECT ContactId, LeadId
            FROM CampaignMember
            WHERE CampaignId = :campaignId
        ]) {
            if (member.ContactId != null) {
                existing.contactIds.add(member.ContactId);
            }
            if (member.LeadId != null) {
                existing.leadIds.add(member.LeadId);
            }
        }
        return existing;
    }

    private static Integer countContacts(AudienceCriteria criteria, Set<Id> contactIdsToExclude) {
        return Database.countQuery(contactQuery(criteria, contactIdsToExclude, true, null));
    }

    private static Integer countLeads(AudienceCriteria criteria, Set<Id> leadIdsToExclude) {
        return Database.countQuery(leadQuery(criteria, leadIdsToExclude, true, null));
    }

    private static List<Id> queryContactIds(AudienceCriteria criteria, Set<Id> contactIdsToExclude, Integer rowLimit) {
        List<Id> ids = new List<Id>();
        if (!Schema.sObjectType.Contact.isAccessible()) {
            return ids;
        }
        for (Contact contact : Database.query(contactQuery(criteria, contactIdsToExclude, false, rowLimit))) {
            ids.add(contact.Id);
        }
        return ids;
    }

    private static List<Id> queryLeadIds(AudienceCriteria criteria, Set<Id> leadIdsToExclude, Integer rowLimit) {
        List<Id> ids = new List<Id>();
        if (!Schema.sObjectType.Lead.isAccessible()) {
            return ids;
        }
        for (Lead lead : Database.query(leadQuery(criteria, leadIdsToExclude, false, rowLimit))) {
            ids.add(lead.Id);
        }
        return ids;
    }

    private static String contactQuery(
        AudienceCriteria criteria,
        Set<Id> contactIdsToExclude,
        Boolean countOnly,
        Integer rowLimit
    ) {
        String query = countOnly
            ? 'SELECT COUNT() FROM Contact'
            : 'SELECT Id, Name, Title, Email, MailingState, Account.Name, Account.Industry FROM Contact';
        query += ' WHERE Email != null';
        if (shouldExcludeEmailOptOut(criteria)) {
            query += ' AND HasOptedOutOfEmail = false';
        }
        query += contactFilters(criteria);
        if (!contactIdsToExclude.isEmpty()) {
            query += ' AND Id NOT IN :contactIdsToExclude';
        }
        if (!countOnly) {
            query += ' ORDER BY LastModifiedDate DESC LIMIT ' + rowLimit;
        }
        return query;
    }

    private static String leadQuery(
        AudienceCriteria criteria,
        Set<Id> leadIdsToExclude,
        Boolean countOnly,
        Integer rowLimit
    ) {
        String query = countOnly
            ? 'SELECT COUNT() FROM Lead'
            : 'SELECT Id, Name, Title, Company, Email, State, Industry FROM Lead';
        query += ' WHERE Email != null AND IsConverted = false';
        if (shouldExcludeEmailOptOut(criteria)) {
            query += ' AND HasOptedOutOfEmail = false';
        }
        query += leadFilters(criteria);
        if (!leadIdsToExclude.isEmpty()) {
            query += ' AND Id NOT IN :leadIdsToExclude';
        }
        if (!countOnly) {
            query += ' ORDER BY LastModifiedDate DESC LIMIT ' + rowLimit;
        }
        return query;
    }

    private static String contactFilters(AudienceCriteria criteria) {
        String filters = '';
        filters += industryFilter('Account.Industry', criteria);
        if (!String.isBlank(criteria.state)) {
            filters += ' AND MailingState = \'' + escape(criteria.state) + '\'';
        }
        if (!String.isBlank(criteria.title)) {
            filters += ' AND Title LIKE \'%' + escapeLike(criteria.title) + '%\'';
        }
        if (!String.isBlank(criteria.emailDomain)) {
            filters += ' AND Email LIKE \'%@' + escapeLike(cleanDomain(criteria.emailDomain)) + '\'';
        }
        if (!String.isBlank(criteria.companyName)) {
            filters += ' AND Account.Name LIKE \'%' + escapeLike(criteria.companyName) + '%\'';
        }
        return filters;
    }

    private static String leadFilters(AudienceCriteria criteria) {
        String filters = '';
        filters += industryFilter('Industry', criteria);
        if (!String.isBlank(criteria.state)) {
            filters += ' AND State = \'' + escape(criteria.state) + '\'';
        }
        if (!String.isBlank(criteria.title)) {
            filters += ' AND Title LIKE \'%' + escapeLike(criteria.title) + '%\'';
        }
        if (!String.isBlank(criteria.emailDomain)) {
            filters += ' AND Email LIKE \'%@' + escapeLike(cleanDomain(criteria.emailDomain)) + '\'';
        }
        if (!String.isBlank(criteria.companyName)) {
            filters += ' AND Company LIKE \'%' + escapeLike(criteria.companyName) + '%\'';
        }
        return filters;
    }

    private static Set<Id> getContactIdsToExclude(AudienceCriteria criteria, Set<Id> existingContactIds) {
        Set<Id> idsToExclude = new Set<Id>();
        idsToExclude.addAll(existingContactIds);
        if (criteria.excludedContactIds != null) {
            idsToExclude.addAll(criteria.excludedContactIds);
        }
        return idsToExclude;
    }

    private static Set<Id> getLeadIdsToExclude(AudienceCriteria criteria, Set<Id> existingLeadIds) {
        Set<Id> idsToExclude = new Set<Id>();
        idsToExclude.addAll(existingLeadIds);
        if (criteria.excludedLeadIds != null) {
            idsToExclude.addAll(criteria.excludedLeadIds);
        }
        return idsToExclude;
    }

    private static void applyMemberStatus(CampaignMember member, String memberStatus) {
        if (!String.isBlank(memberStatus)) {
            member.Status = memberStatus;
        }
    }

    private static AudienceRow rowFromContact(Contact contact) {
        AudienceRow row = new AudienceRow();
        row.id = contact.Id;
        row.sourceType = 'Contact';
        row.name = contact.Name;
        row.title = contact.Title;
        row.company = contact.Account != null ? contact.Account.Name : null;
        row.email = contact.Email;
        row.state = contact.MailingState;
        row.industry = contact.Account != null ? contact.Account.Industry : null;
        row.recordUrl = '/' + contact.Id;
        return row;
    }

    private static AudienceRow rowFromLead(Lead lead) {
        AudienceRow row = new AudienceRow();
        row.id = lead.Id;
        row.sourceType = 'Lead';
        row.name = lead.Name;
        row.title = lead.Title;
        row.company = lead.Company;
        row.email = lead.Email;
        row.state = lead.State;
        row.industry = lead.Industry;
        row.recordUrl = '/' + lead.Id;
        return row;
    }

    private static Integer sanitizeMaxRecords(Integer requestedMax) {
        if (requestedMax == null || requestedMax < 1) {
            return DEFAULT_MAX_RECORDS;
        }
        return Math.min(requestedMax, MAX_RECORDS);
    }

    private static String cleanDomain(String value) {
        if (value == null) {
            return '';
        }
        String domain = value.trim();
        if (domain.startsWith('@')) {
            domain = domain.substring(1);
        }
        return domain.toLowerCase();
    }

    private static Boolean shouldExcludeEmailOptOut(AudienceCriteria criteria) {
        return criteria == null || criteria.excludeEmailOptOut != false;
    }

    private static String industryFilter(String fieldName, AudienceCriteria criteria) {
        List<String> industries = normalizedIndustries(criteria);
        if (industries.isEmpty()) {
            return '';
        }
        return ' AND ' + fieldName + ' IN (' + toSoqlStringList(industries) + ')';
    }

    private static List<String> normalizedIndustries(AudienceCriteria criteria) {
        List<String> industries = new List<String>();
        Set<String> seenIndustries = new Set<String>();
        if (criteria == null) {
            return industries;
        }

        if (criteria.industries != null) {
            for (String industry : criteria.industries) {
                addNormalizedIndustry(industries, seenIndustries, industry);
            }
        }
        addNormalizedIndustry(industries, seenIndustries, criteria.industry);
        industries.sort();
        return industries;
    }

    private static void addNormalizedIndustry(List<String> industries, Set<String> seenIndustries, String industry) {
        if (String.isBlank(industry)) {
            return;
        }

        String trimmedIndustry = industry.trim();
        String industryKey = trimmedIndustry.toLowerCase();
        if (!seenIndustries.contains(industryKey)) {
            seenIndustries.add(industryKey);
            industries.add(trimmedIndustry);
        }
    }

    private static String toSoqlStringList(List<String> values) {
        List<String> escapedValues = new List<String>();
        for (String value : values) {
            escapedValues.add('\'' + escape(value) + '\'');
        }
        return String.join(escapedValues, ',');
    }

    private static String escape(String value) {
        return String.escapeSingleQuotes(value.trim());
    }

    private static String escapeLike(String value) {
        return escape(value).replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_');
    }
}