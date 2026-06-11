import { LightningElement } from 'lwc';
import getCommandCenterData from '@salesforce/apex/CampaignCommandCenterController.getCommandCenterData';

const EMPTY_SUMMARY = {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalMembers: 0,
    respondedMembers: 0,
    openedEmails: 0,
    clickedEmails: 0,
    responseRate: 0,
    openClickRate: 0
};

const CAMPAIGN_COLUMNS = [
    {
        label: 'Campaign',
        fieldName: 'recordUrl',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'name' },
            target: '_blank'
        }
    },
    { label: 'Status', fieldName: 'status', type: 'text' },
    { label: 'Type', fieldName: 'type', type: 'text' },
    { label: 'Active', fieldName: 'isActive', type: 'boolean', fixedWidth: 90 },
    { label: 'Start', fieldName: 'startDate', type: 'date-local' },
    { label: 'End', fieldName: 'endDate', type: 'date-local' },
    { label: 'Members', fieldName: 'totalMembers', type: 'number' },
    { label: 'Responded', fieldName: 'respondedMembers', type: 'number' },
    { label: 'Response %', fieldName: 'responseRate', type: 'number' },
    {
        label: 'View',
        type: 'button-icon',
        fixedWidth: 70,
        typeAttributes: {
            alternativeText: 'View campaign details',
            iconName: 'utility:preview',
            name: 'view',
            title: 'View campaign details',
            variant: 'neutral'
        }
    }
];

const STATUS_COLUMNS = [
    { label: 'Status', fieldName: 'status', type: 'text' },
    { label: 'Members', fieldName: 'totalMembers', type: 'number' },
    { label: 'Share %', fieldName: 'shareOfMembers', type: 'number' }
];

const ACTIVITY_COLUMNS = [
    { label: 'Type', fieldName: 'activityType', type: 'text' },
    {
        label: 'Subject',
        fieldName: 'recordUrl',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'subject' },
            target: '_blank'
        }
    },
    { label: 'Status', fieldName: 'status', type: 'text' },
    { label: 'Date', fieldName: 'activityDate', type: 'date-local' },
    { label: 'Owner', fieldName: 'ownerName', type: 'text' }
];

const CHART_COLORS = ['#0176d3', '#2e844a', '#fe9339', '#ba0517', '#747474', '#8a3ffc', '#06a59a'];
const DONUT_CIRCUMFERENCE = 100;

export default class CampaignCommandCenter extends LightningElement {
    searchTerm = '';
    selectedCampaignId;
    summary = { ...EMPTY_SUMMARY };
    campaignRows = [];
    selectedCampaign;
    statusRows = [];
    activityRows = [];
    errorMessage;
    isBusy = false;
    loadSequence = 0;

    campaignColumns = CAMPAIGN_COLUMNS;
    statusColumns = STATUS_COLUMNS;
    activityColumns = ACTIVITY_COLUMNS;

    connectedCallback() {
        this.loadDashboard();
    }

    get hasCampaigns() {
        return this.campaignRows.length > 0;
    }

    get activeCampaignRows() {
        return this.campaignRows.filter((campaign) => campaign.isActive === true);
    }

    get inactiveCampaignRows() {
        return this.campaignRows.filter((campaign) => campaign.isActive !== true);
    }

    get hasActiveCampaigns() {
        return this.activeCampaignRows.length > 0;
    }

    get hasInactiveCampaigns() {
        return this.inactiveCampaignRows.length > 0;
    }

    get hasSelectedCampaign() {
        return this.selectedCampaign !== undefined && this.selectedCampaign !== null;
    }

    get hasStatusRows() {
        return this.statusRows.length > 0;
    }

    get hasActivityRows() {
        return this.activityRows.length > 0;
    }

    get campaignStatusSegments() {
        if (!this.hasCampaigns) {
            return [];
        }

        const statusCounts = new Map();
        this.campaignRows.forEach((campaign) => {
            const status = campaign.status || 'No Status';
            statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
        });

        let offset = 25;
        return Array.from(statusCounts.entries()).map(([status, count], index) => {
            const percentage = Math.round((count / this.campaignRows.length) * 100);
            const segment = {
                color: CHART_COLORS[index % CHART_COLORS.length],
                count,
                dashArray: `${percentage} ${DONUT_CIRCUMFERENCE - percentage}`,
                dashOffset: String(offset),
                key: status,
                legendStyle: `background: ${CHART_COLORS[index % CHART_COLORS.length]};`,
                percentage,
                status
            };
            offset -= percentage;
            return segment;
        });
    }

    get hasCampaignStatusSegments() {
        return this.campaignStatusSegments.length > 0;
    }

    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
    }

    handleSearchKeydown(event) {
        if (event.key === 'Enter') {
            this.selectedCampaignId = undefined;
            this.loadDashboard();
        }
    }

    handleRefresh() {
        this.loadDashboard();
    }

    async handleCampaignRowAction(event) {
        const { action, row } = event.detail;
        if (action.name !== 'view') {
            return;
        }
        this.selectedCampaignId = row.id;
        this.selectedCampaign = { ...row };
        this.statusRows = [];
        this.activityRows = [];
        await this.loadDashboard();
    }

    async loadDashboard() {
        const loadId = ++this.loadSequence;
        this.isBusy = true;
        this.errorMessage = undefined;
        try {
            const dashboard = await getCommandCenterData({
                searchTerm: this.emptyToNull(this.searchTerm),
                selectedCampaignId: this.selectedCampaignId || null
            });
            if (loadId !== this.loadSequence) {
                return;
            }
            this.summary = dashboard?.summary || { ...EMPTY_SUMMARY };
            this.campaignRows = dashboard?.campaigns || [];
            this.selectedCampaign = dashboard?.selectedCampaign;
            this.statusRows = dashboard?.statusBreakdown || [];
            this.activityRows = dashboard?.activity || [];
        } catch (error) {
            if (loadId !== this.loadSequence) {
                return;
            }
            this.errorMessage = this.getErrorMessage(error);
            this.summary = { ...EMPTY_SUMMARY };
            this.campaignRows = [];
            this.selectedCampaign = undefined;
            this.statusRows = [];
            this.activityRows = [];
        } finally {
            if (loadId === this.loadSequence) {
                this.isBusy = false;
            }
        }
    }

    emptyToNull(value) {
        if (typeof value !== 'string') {
            return value ?? null;
        }
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }

    getErrorMessage(error) {
        if (Array.isArray(error?.body)) {
            return error.body.map((item) => item.message).join(', ');
        }
        return error?.body?.message || error?.message || 'Something went wrong.';
    }
}
