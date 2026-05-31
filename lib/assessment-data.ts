export const assessmentQuestions = [
  {
    id: "q01-ai-strategy",
    category: "Strategy & Leadership",
    statement:
      "We have a documented AI strategy, owned by a named executive, with regular board updates on AI risk.",
    prompt:
      "How clearly is AI strategy documented, executive-owned, and reported to the board?",
    goodLooksLike:
      "Someone at the C-suite owns AI, the strategy is written down, and the board hears about AI risk at least once a year.",
    frameworkAnchors: "NIST AI RMF GOVERN 1.1, EU AI Act Art. 26, ISO/IEC 42001 section 5.1",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Let's start with leadership alignment. Responsible AI needs clear sponsorship, decision rights, and measurable goals."
  },
  {
    id: "q02-governance-group",
    category: "Strategy & Leadership",
    statement:
      "An AI governance group meets regularly, with members from Legal, Risk, Compliance, IT, and the business.",
    prompt:
      "How consistently does a cross-functional AI governance group meet and make decisions?",
    goodLooksLike:
      "A standing cross-functional council with a charter and a meeting cadence, not just an ad hoc working group.",
    frameworkAnchors: "NIST AI RMF GOVERN 2.1, ISO/IEC 42001 section 5.3",
    targetScore: 4,
    criticality: 2,
    agentContext:
      "Governance works best when the right functions meet consistently with a clear charter and decision process."
  },
  {
    id: "q03-ai-policies",
    category: "Policy & Standards",
    statement:
      "Our AI policies cover acceptable use, model risk, data, ethics, vendors, and incidents, and are reviewed yearly.",
    prompt: "How complete and current are your AI policies and standards?",
    goodLooksLike:
      "Written policies exist for the major AI risk areas, including how employees can and cannot use tools like ChatGPT.",
    frameworkAnchors: "NIST AI RMF GOVERN 1.2-1.7, EU AI Act Art. 9, ISO/IEC 42001 section 6.1",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Teams need clear standards for acceptable use, model risk, data, ethics, vendor AI, and incident response."
  },
  {
    id: "q04-risk-assessment-tiering",
    category: "Risk Management",
    statement:
      "Every new AI use case gets a risk assessment and a tier before it goes live.",
    prompt: "How consistently are AI use cases assessed and tiered before deployment?",
    goodLooksLike:
      "No AI gets deployed without a documented risk review, and the risk tier determines how much governance applies.",
    frameworkAnchors: "NIST AI RMF MAP 1.1-1.5, EU AI Act Art. 6, ISO/IEC 42001 section 6.1.2",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Risk assessment should be a practical release gate that scales governance to the level of AI risk."
  },
  {
    id: "q05-risk-register",
    category: "Risk Management",
    statement:
      "We maintain an enterprise AI risk register tied to ERM, with defined risk appetite and escalation thresholds.",
    prompt: "How well are AI risks tracked, escalated, and tied into enterprise risk management?",
    goodLooksLike:
      "AI risks live in the same risk system as everything else, with clear rules for when something gets escalated to leadership.",
    frameworkAnchors: "NIST AI RMF GOVERN 4.1-4.3, ISO/IEC 42001 section 6.1.3, COSO ERM",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "AI risk needs to be visible in enterprise risk management, not trapped in spreadsheets or project notes."
  },
  {
    id: "q06-model-inventory",
    category: "Model Lifecycle & Validation",
    statement:
      "We have a complete inventory of every production AI model, with owner, version, risk tier, and a model card.",
    prompt: "How complete is your production AI model inventory and model card coverage?",
    goodLooksLike:
      "If asked, you can produce a current list of every AI model running in production and basic facts about each one.",
    frameworkAnchors: "NIST AI RMF MANAGE 1.1-1.3, EU AI Act Art. 11, ISO/IEC 42001 section 8.1",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Model lifecycle governance starts with knowing which AI systems are live, who owns them, and how they are classified."
  },
  {
    id: "q07-independent-validation",
    category: "Model Lifecycle & Validation",
    statement:
      "High-risk models are validated by someone independent of the developer, including bias testing and explainability.",
    prompt:
      "How consistently are high-risk models independently validated before deployment?",
    goodLooksLike:
      "The person who built the model is not the one who signs off on it, and validation includes fairness checks, not just accuracy.",
    frameworkAnchors: "NIST AI RMF MEASURE 2.1-2.9, EU AI Act Art. 9, 15, ISO/IEC 42001 section 8.3",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Independent validation creates effective challenge and helps ensure high-risk AI is tested beyond performance alone."
  },
  {
    id: "q08-fairness-testing",
    category: "Ethics, Fairness & Equity",
    statement:
      "Customer-facing models pass mandatory fairness testing with documented thresholds before deployment, and are monitored after.",
    prompt:
      "How consistently do customer-facing AI models pass fairness testing and post-deployment monitoring?",
    goodLooksLike:
      "Bias testing is required to ship, not optional, and fairness is monitored after the model is live.",
    frameworkAnchors: "NIST AI RMF MEASURE 2.5, EU AI Act Art. 10, ISO/IEC 42001 section 6.1.4",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Fairness controls should be deployment gates with defined thresholds, not informal reviews after launch."
  },
  {
    id: "q09-human-review-appeals",
    category: "Ethics, Fairness & Equity",
    statement:
      "A human reviews high-risk AI decisions, customers get a plain-language explanation, and there is an appeals process.",
    prompt:
      "How consistently do high-risk AI decisions include human review, explanations, and appeals?",
    goodLooksLike:
      "AI is never the only thing that says no to a customer; a person is in the loop and customers can challenge the decision.",
    frameworkAnchors: "NIST AI RMF MEASURE 2.9, EU AI Act Art. 14, 86, ISO/IEC 42001 section 6.1.4",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Human review and appeals protect stakeholders when AI influences high-impact decisions."
  },
  {
    id: "q10-training-data-governance",
    category: "Data Governance For AI",
    statement:
      "Sensitive data used for AI training is inventoried, properly de-identified, access-controlled, and has a clear legal basis.",
    prompt: "How well governed is sensitive data used for AI training?",
    goodLooksLike:
      "You know what sensitive data goes into models, treat it correctly under privacy rules, and restrict access appropriately.",
    frameworkAnchors: "NIST AI RMF MAP 2.1-2.3, EU AI Act Art. 10, ISO/IEC 42001 section 7.5",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "AI readiness depends on trusted training data controls, including lineage, de-identification, access, and legal basis."
  },
  {
    id: "q11-decision-logging",
    category: "Data Governance For AI",
    statement:
      "AI inputs and outputs are logged with enough detail to reconstruct any decision, retained per regulatory requirements.",
    prompt:
      "How well can you reconstruct AI decisions from logged inputs, outputs, and context?",
    goodLooksLike:
      "If an auditor asks why the AI made a specific decision six months ago, you can show the inputs and the output.",
    frameworkAnchors: "NIST AI RMF MEASURE 2.8, EU AI Act Art. 12, ISO/IEC 42001 section 9.1",
    targetScore: 4,
    criticality: 2,
    agentContext:
      "Decision logging supports auditability, accountability, and regulatory response."
  },
  {
    id: "q12-ai-vendor-diligence",
    category: "Vendor & Third-Party AI",
    statement:
      "AI vendors, including LLM providers, go through AI-specific due diligence, with the right contracts and an inventory.",
    prompt: "How mature is your AI-specific vendor due diligence and contract process?",
    goodLooksLike:
      "AI vendors get extra scrutiny, with audit rights and notification when they change their model.",
    frameworkAnchors: "NIST AI RMF GOVERN 1.7, EU AI Act Art. 25, ISO/IEC 42001 section 8.4",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Third-party AI creates risk through vendor models, data use, contracts, and model change practices."
  },
  {
    id: "q13-public-genai-controls",
    category: "Vendor & Third-Party AI",
    statement:
      "Controls prevent employees from putting sensitive data into public GenAI tools.",
    prompt: "How effectively do your controls prevent sensitive data from entering public GenAI tools?",
    goodLooksLike:
      "DLP, an approved-tool list, and training together stop confidential information from leaving through public AI chatbots.",
    frameworkAnchors: "NIST AI RMF MAP 2.2, EU AI Act Art. 50, ISO/IEC 42001 section 6.1.3",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Public GenAI controls help reduce leakage of confidential, regulated, or proprietary information."
  },
  {
    id: "q14-monitoring-incident-response",
    category: "Monitoring & Incident Response",
    statement:
      "Production models are monitored for drift and fairness, with tested AI incident response procedures.",
    prompt:
      "How prepared are you to monitor production AI and respond to drift, fairness issues, leakage, or incidents?",
    goodLooksLike:
      "You watch models in production and know who does what if bias spikes, leakage occurs, or an attack happens.",
    frameworkAnchors:
      "NIST AI RMF MEASURE 2.8, MANAGE 4.1, EU AI Act Art. 17, 72, ISO/IEC 42001 section 9.1, 10.1",
    targetScore: 4,
    criticality: 3,
    agentContext:
      "Once AI is in use, monitoring and incident response need defined owners, alerts, playbooks, and practice."
  }
] as const;

export const answerOptions = [
  {
    label: "Not Started",
    value: 1,
    detail: "No formal practice"
  },
  {
    label: "Early",
    value: 2,
    detail: "Informal or draft"
  },
  {
    label: "Developing",
    value: 3,
    detail: "Partially in place"
  },
  {
    label: "Established",
    value: 4,
    detail: "Formal, repeatable"
  },
  {
    label: "Optimized",
    value: 5,
    detail: "Measured, improving"
  }
] as const;

export type AssessmentQuestion = (typeof assessmentQuestions)[number];
export type AssessmentAnswerOption = (typeof answerOptions)[number];
