trigger AIReadinessLeadNotification on Lead (after insert, after update) {
    AIReadinessLeadNotificationHandler.notifyOnChange(
        Trigger.new,
        Trigger.isInsert ? null : Trigger.oldMap
    );
}
