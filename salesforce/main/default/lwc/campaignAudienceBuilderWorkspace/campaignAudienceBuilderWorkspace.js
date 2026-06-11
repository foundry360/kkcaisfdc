import { LightningElement } from 'lwc';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchCampaigns from '@salesforce/apex/CampaignAudienceBuilderController.searchCampaigns';
import getMemberStatusOptions from '@salesforce/apex/CampaignAudienceBuilderController.getMemberStatusOptions';
import getIndustryOptions from '@salesforce/apex/CampaignAudienceBuilderController.getIndustryOptions';
import previewAudience from '@salesforce/apex/CampaignAudienceBuilderController.previewAudience';
import buildAudience from '@salesforce/apex/CampaignAudienceBuilderController.buildAudience';
import getEligibleAudience from '@salesforce/apex/CampaignAudienceBuilderController.getEligibleAudience';

const COLUMNS = [
    {
        label: 'Name',
        fieldName: 'recordUrl',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'name' },
            target: '_blank'
        }
    },
    { label: 'Source', fieldName: 'sourceType', type: 'text' },
    { label: 'Title', fieldName: 'title', type: 'text' },
    { label: 'Company / Account', fieldName: 'company', type: 'text' },
    { label: 'Email', fieldName: 'email', type: 'email' },
    { label: 'State', fieldName: 'state', type: 'text' },
    { label: 'Industry', fieldName: 'industry', type: 'text' },
    {
        label: 'Exclude',
        type: 'button-icon',
        fixedWidth: 80,
        typeAttributes: {
            alternativeText: 'Exclude from this build',
            iconName: 'utility:ban',
            name: 'exclude',
            title: 'Exclude from this build',
            variant: 'neutral'
        }
    }
];

const EMPTY_PREVIEW = {
    eligibleContacts: 0,
    eligibleLeads: 0,
    eligibleTotal: 0,
    existingContacts: 0,
    existingLeads: 0,
    maxRecords: 5000,
    willCapResults: false
};

export default class CampaignAudienceBuilderWorkspace extends LightningElement {
    campaignSearchTerm = '';
    campaignOptions = [];
    memberStatusOptions = [];
    industryOptions = [];
    columns = COLUMNS;
    rows = [];
    preview = { ...EMPTY_PREVIEW };
    result;
    errorMessage;
    isBusy = false;
    hasPreviewed = false;

    criteria = {
        campaignId: '',
        includeContacts: false,
        includeLeads: false,
        excludeEmailOptOut: false,
        industries: [],
        state: '',
        title: '',
        emailDomain: '',
        companyName: '',
        memberStatus: '',
        maxRecords: '',
        excludedContactIds: [],
        excludedLeadIds: []
    };

    connectedCallback() {
        this.loadCampaigns();
        this.loadIndustryOptions();
    }

    get existingTotal() {
        if (!this.preview) {
            return 0;
        }
        return this.preview.existingContacts + this.preview.existingLeads;
    }

    get disableBuild() {
        return this.isBusy || !this.preview || this.preview.eligibleTotal === 0;
    }

    get disablePreview() {
        return this.isBusy || !this.criteria.campaignId;
    }

    get hasRows() {
        return this.rows.length > 0;
    }

    get excludedTotal() {
        return this.criteria.excludedContactIds.length + this.criteria.excludedLeadIds.length;
    }

    get hasExclusions() {
        return this.excludedTotal > 0;
    }

    handleCampaignSearchTermChange(event) {
        this.campaignSearchTerm = event.target.value;
    }

    handleCampaignSearchKeydown(event) {
        if (event.key === 'Enter') {
            this.loadCampaigns();
        }
    }

    async loadCampaigns() {
        this.isBusy = true;
        this.clearMessages();
        try {
            this.campaignOptions = await searchCampaigns({ searchTerm: this.campaignSearchTerm });
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
        } finally {
            this.isBusy = false;
        }
    }

    async loadIndustryOptions() {
        try {
            this.industryOptions = await getIndustryOptions();
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
        }
    }

    async handleCriteriaChange(event) {
        const { name, type } = event.target;
        let value = type === 'checkbox' ? event.target.checked : event.detail.value;
        if (Array.isArray(value)) {
            value = [...value];
        }
        const resetExclusions = name === 'campaignId';
        const criteriaValue = name === 'maxRecords' ? this.normalizeMaxRecords(value) : value;
        this.criteria = {
            ...this.criteria,
            [name]: criteriaValue,
            ...(resetExclusions ? { excludedContactIds: [], excludedLeadIds: [] } : {})
        };
        this.preview = { ...EMPTY_PREVIEW };
        this.rows = [];
        this.hasPreviewed = false;
        this.result = undefined;
        this.errorMessage = undefined;

        if (name === 'campaignId') {
            await this.loadMemberStatuses(value);
        }
    }

    async handleRowAction(event) {
        const { action, row } = event.detail;
        if (action.name !== 'exclude') {
            return;
        }
        await this.excludeRow(row);
    }

    async excludeRow(row) {
        const fieldName = row.sourceType === 'Contact' ? 'excludedContactIds' : 'excludedLeadIds';
        if (this.criteria[fieldName].includes(row.id)) {
            return;
        }

        this.criteria = {
            ...this.criteria,
            [fieldName]: [...this.criteria[fieldName], row.id]
        };
        this.isBusy = true;
        this.clearMessages();
        try {
            await this.refreshAudience();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: `${row.sourceType} excluded`,
                    message: `${row.name} will be skipped when this Campaign is built.`,
                    variant: 'success'
                })
            );
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
        } finally {
            this.isBusy = false;
        }
    }

    async handleClearExclusions() {
        this.criteria = {
            ...this.criteria,
            excludedContactIds: [],
            excludedLeadIds: []
        };
        this.isBusy = true;
        this.clearMessages();
        try {
            await this.refreshAudience();
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
        } finally {
            this.isBusy = false;
        }
    }

    async loadMemberStatuses(campaignId) {
        this.memberStatusOptions = [];
        this.criteria = { ...this.criteria, memberStatus: '' };
        if (!campaignId) {
            return;
        }

        try {
            const statuses = await getMemberStatusOptions({ campaignId });
            this.memberStatusOptions = [
                { label: 'Use campaign default', value: '' },
                ...statuses
            ];
            this.criteria = {
                ...this.criteria,
                memberStatus: ''
            };
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
        }
    }

    async handlePreview() {
        this.isBusy = true;
        this.clearMessages();
        try {
            await this.refreshAudience();
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
            this.preview = { ...EMPTY_PREVIEW };
            this.rows = [];
        } finally {
            this.isBusy = false;
        }
    }

    async handleBuild() {
        const criteria = this.getApexCriteria();
        const exclusionNote = this.hasExclusions ? ` ${this.excludedTotal} selected exclusion(s) will be skipped.` : '';
        const confirmed = await LightningConfirm.open({
            label: 'Build Campaign',
            message: `Add up to ${criteria.maxRecords} matching people to this Campaign?${exclusionNote}`,
            theme: 'warning'
        });
        if (!confirmed) {
            return;
        }

        this.isBusy = true;
        this.clearMessages();
        try {
            this.result = await buildAudience({ criteria });
            await this.refreshAudience();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Campaign audience updated',
                    message: this.result.message,
                    variant: this.result.failedMembers > 0 ? 'warning' : 'success'
                })
            );
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
        } finally {
            this.isBusy = false;
        }
    }

    clearMessages() {
        this.errorMessage = undefined;
        this.result = undefined;
    }

    async refreshAudience() {
        const criteria = this.getApexCriteria();
        this.preview = await previewAudience({ criteria });
        this.rows = await getEligibleAudience({ criteria });
        this.hasPreviewed = true;
    }

    getApexCriteria() {
        const maxRecords = Number.parseInt(this.criteria.maxRecords, 10);
        return {
            campaignId: this.criteria.campaignId || null,
            includeContacts: this.criteria.includeContacts === true,
            includeLeads: this.criteria.includeLeads === true,
            excludeEmailOptOut: this.criteria.excludeEmailOptOut === true,
            industry: null,
            industries: this.emptyArrayToNull(this.criteria.industries),
            state: this.emptyToNull(this.criteria.state),
            title: this.emptyToNull(this.criteria.title),
            emailDomain: this.emptyToNull(this.criteria.emailDomain),
            companyName: this.emptyToNull(this.criteria.companyName),
            memberStatus: this.emptyToNull(this.criteria.memberStatus),
            maxRecords: Number.isFinite(maxRecords) && maxRecords > 0 ? maxRecords : 5000,
            excludedContactIds: [...this.criteria.excludedContactIds],
            excludedLeadIds: [...this.criteria.excludedLeadIds]
        };
    }

    emptyArrayToNull(values) {
        if (!Array.isArray(values)) {
            return null;
        }
        const trimmedValues = values.map((value) => this.emptyToNull(value)).filter((value) => value !== null);
        return trimmedValues.length > 0 ? trimmedValues : null;
    }

    normalizeMaxRecords(value) {
        return value === '' || value === null || value === undefined ? '' : Number(value);
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