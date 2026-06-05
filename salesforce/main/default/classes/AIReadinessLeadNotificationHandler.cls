public with sharing class AIReadinessLeadNotificationHandler {
    private static final String AI_READINESS_LEAD_SOURCE = 'AI Readiness Assessment';
    private static final String JASON_USERNAME = 'jason.gelsomino@konakaicorp.com';
    private static final String DAVE_USERNAME = 'dave.koopman@konakaicorp.com';
    private static final String ELISSA_EMAIL = 'elissa.torres@konakaicorp.com';
    @TestVisible private static Integer messagesPreparedForTest = 0;

    public static void notifyOnChange(List<Lead> newLeads, Map<Id, Lead> oldLeadMap) {
        List<Lead> aiReadinessLeads = new List<Lead>();
        for (Lead newLead : newLeads) {
            Lead oldLead = oldLeadMap == null ? null : oldLeadMap.get(newLead.Id);
            Boolean isNewAiReadinessLead = oldLead == null && newLead.LeadSource == AI_READINESS_LEAD_SOURCE;
            Boolean becameAiReadinessLead = oldLead != null &&
                oldLead.LeadSource != AI_READINESS_LEAD_SOURCE &&
                newLead.LeadSource == AI_READINESS_LEAD_SOURCE;

            if (isNewAiReadinessLead || becameAiReadinessLead) {
                aiReadinessLeads.add(newLead);
            }
        }

        if (aiReadinessLeads.isEmpty()) {
            return;
        }

        List<String> recipientEmails = getRecipientEmails();
        if (recipientEmails.isEmpty()) {
            return;
        }

        List<Messaging.SingleEmailMessage> messages = new List<Messaging.SingleEmailMessage>();
        for (Lead aiReadinessLead : aiReadinessLeads) {
            Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
            message.setToAddresses(recipientEmails);
            message.setSubject('New AI Readiness Assessment Lead: ' + getLeadDisplayName(aiReadinessLead));
            message.setPlainTextBody(buildPlainTextBody(aiReadinessLead));
            message.setHtmlBody(buildHtmlBody(aiReadinessLead));
            message.setSaveAsActivity(false);
            messages.add(message);
        }

        if (Test.isRunningTest()) {
            messagesPreparedForTest = messages.size();
        }

        Messaging.sendEmail(messages);
    }

    private static List<String> getRecipientEmails() {
        if (Test.isRunningTest()) {
            return new List<String>{ UserInfo.getUserEmail() };
        }

        List<String> recipientEmails = new List<String>();
        for (User recipient : [
            SELECT Email
            FROM User
            WHERE IsActive = true
                AND (
                    Username = :JASON_USERNAME
                    OR Username = :DAVE_USERNAME
                    OR Email = :ELISSA_EMAIL
                )
            ORDER BY Name
        ]) {
            if (String.isNotBlank(recipient.Email) && !recipientEmails.contains(recipient.Email)) {
                recipientEmails.add(recipient.Email);
            }
        }

        return recipientEmails;
    }

    private static String getLeadDisplayName(Lead leadRecord) {
        String displayName = String.join(new List<String>{
            nullToBlank(leadRecord.FirstName),
            nullToBlank(leadRecord.LastName)
        }, ' ').trim();

        return String.isBlank(displayName) ? leadRecord.Company : displayName;
    }

    private static String buildPlainTextBody(Lead leadRecord) {
        return 'A new AI Readiness Assessment lead was created.' +
            '\n\nName: ' + getLeadDisplayName(leadRecord) +
            '\nCompany: ' + nullToBlank(leadRecord.Company) +
            '\nEmail: ' + nullToBlank(leadRecord.Email) +
            '\nPhone: ' + nullToBlank(leadRecord.Phone) +
            '\nLead Source: ' + nullToBlank(leadRecord.LeadSource) +
            '\nLead Link: ' + getLeadUrl(leadRecord);
    }

    private static String buildHtmlBody(Lead leadRecord) {
        return '<p>A new <strong>AI Readiness Assessment</strong> lead was created.</p>' +
            '<ul>' +
            '<li><strong>Name:</strong> ' + escapeHtml(getLeadDisplayName(leadRecord)) + '</li>' +
            '<li><strong>Company:</strong> ' + escapeHtml(leadRecord.Company) + '</li>' +
            '<li><strong>Email:</strong> ' + escapeHtml(leadRecord.Email) + '</li>' +
            '<li><strong>Phone:</strong> ' + escapeHtml(leadRecord.Phone) + '</li>' +
            '<li><strong>Lead Source:</strong> ' + escapeHtml(leadRecord.LeadSource) + '</li>' +
            '</ul>' +
            '<p><a href="' + getLeadUrl(leadRecord) + '">Open the Lead in Salesforce</a></p>';
    }

    private static String getLeadUrl(Lead leadRecord) {
        return URL.getOrgDomainUrl().toExternalForm() + '/' + leadRecord.Id;
    }

    private static String escapeHtml(String value) {
        return String.isBlank(value) ? '' : value.escapeHtml4();
    }

    private static String nullToBlank(String value) {
        return value == null ? '' : value;
    }
}
