// ─── Destination Preview Data V3 ───────────────────────────────────────
// Stage 1 enhancement for VibeModel Agent Playground V3
// Provides conversation examples and structural/outcome signatures per agent tile

export interface MockConversation {
  userQuery: string
  agentResponse: string
  isEdgeCase: boolean
  edgeCaseExplanation?: string
  sources?: string[]
}

export interface DestinationPreview {
  conversations: MockConversation[]
  structuralSignature: string // Technical mode text
  outcomeSignature: string // Business mode text
}

/**
 * Get destination preview data for a given tile ID.
 * Returns mock conversations and signatures describing agent behavior
 * and outcomes for the Stage 1 (Goal Definition) enhancement.
 */
export function getDestinationPreview(tileId: string): DestinationPreview | null {
  const previews: Record<string, DestinationPreview> = {
    // ── Invoice Processing Agent ────────────────────────────────────────
    'saas-copilot': {
      conversations: [
        {
          userQuery: 'What was our AWS S3 storage cost last month?',
          agentResponse:
            'Your AWS S3 Standard storage costs for February 2026 totaled $4,287.63. This breaks down as: 1,456 GB-months at $0.023/GB = $33.49/day average. Compared to January 2026 ($3,891.44), this represents a 10.2% increase, primarily due to a 340 GB data migration that completed mid-month. S3 costs represented 18.4% of your total AWS bill. Source: AWS Cost & Usage Report, invoice #AWS-2026-02-STORAGE.',
          isEdgeCase: false,
          sources: ['AWS Cost & Usage Report'],
        },
        {
          userQuery: 'Give me a breakdown of all storage costs across all vendors for Q4 2025.',
          agentResponse:
            'Total storage costs across all vendors for Q4 2025: $32,847.92\n\nBreakdown by vendor:\n- AWS S3 & EBS: $18,456.32 (56.2%)\n- GCP Cloud Storage & Persistent Disk: $9,234.15 (28.1%)\n- Staples Backup & Archive Services: $5,157.45 (15.7%)\n\nMonth-by-month:\nOctober 2025: $10,234.18\nNovember 2025: $10,891.34 (6.4% increase)\nDecember 2025: $11,722.40 (7.6% increase)\n\nQoQ comparison: Q3 2025 storage was $28,456.12, representing 15.4% growth. Sources: AWS CUR invoice #AWS-2025-10-12; GCP Billing Export, project-ids: prod-data, prod-analytics; Staples invoices #SP-2025-1847, SP-2025-1891, SP-2025-1934.',
          isEdgeCase: false,
          sources: [
            'AWS Cost & Usage Report',
            'GCP Billing Export',
            'Staples invoices',
          ],
        },
        {
          userQuery: 'Which cost categories showed unusual growth in the past 6 months?',
          agentResponse:
            'ANOMALY DETECTED: AWS Data Transfer costs spiked 340% in September 2025\n\nDetails:\n- Expected monthly run rate: $3,240 (based on 6-month average)\n- Actual September 2025: $13,896 (+$10,656 variance, +329%)\n- Root cause: Large-scale data migration to new region (project code: INFRA-2025-Q3-MIGRATION)\n- Impact period: Sept 1-25, 2025\n- Status: Resolved (migration completed, costs normalized in October)\n\nSecondary finding: GCP Compute costs grew 18.2% month-over-month in October 2025\n- October baseline: $8,456 vs September $7,156\n- Underlying trend: 8% MoM baseline growth + 10.2% above-trend growth\n- Root cause: Scaled recommendation engine service from 4 to 12 instances for holiday season\n- Expected duration: October-December, then scale-down planned for January 2026\n\nStaples office supply costs remained stable (2.1% variance, within normal range).\n\nSources: AWS CUR detail reports (September, October 2025); GCP Billing Export (Sept-Oct 2025); Staples invoices SP-2025-1847 through SP-2025-1934.',
          isEdgeCase: true,
          edgeCaseExplanation:
            'Anomaly detection across 6-month historical period with multi-vendor correlation',
          sources: [
            'AWS Cost & Usage Report',
            'GCP Billing Export',
            'Staples invoices',
          ],
        },
      ],
      structuralSignature:
        'This agent triggers 11 meta-patterns including reasoning-chain, multi-source-fetch, temporal-aggregation, cross-source-join, and mixed-format-composition. Estimated 12,847 execution paths across 3 vendors, 4 data formats, and 6 relation types.',
      outcomeSignature:
        'Your agent handles cross-vendor cost comparison, time-period aggregation, anomaly detection, and source-attributed reporting across every possible question your finance team could ask. Processes 5 data formats, 3 vendors, 18+ cost categories, with 94%+ accuracy.',
    },

    // ── Enterprise RAG Copilot ──────────────────────────────────────────
    'coding-agent': {
      conversations: [
        {
          userQuery: 'What is the architecture decision for our payment processing system?',
          agentResponse:
            'The payment processing system architecture was decided in ADR-2025-047, documented in the Engineering space. Key decision: Async event-driven architecture using Apache Kafka. Decision date: September 2025. Status: Approved. Rationale: Improves system resilience during high-volume periods (from team discussion #eng-payments, Sept 12-14). Key stakeholder: @sarah.chen (Engineering Lead). Implementation status: 60% complete, target completion Dec 2025 (from JIRA epic ENG-1847). Citation: Confluence page \'ADR-2025-047: Payment System Redesign\' + Slack thread #eng-payments + Jira epic ENG-1847.',
          isEdgeCase: false,
          sources: [
            'Confluence ADR-2025-047',
            'Slack #eng-payments',
            'Jira ENG-1847',
          ],
        },
        {
          userQuery:
            'What decisions were made about our customer data retention policy, and what was the discussion?',
          agentResponse:
            'Customer data retention policy decided in October 2025 across Legal and Product teams.\n\nDecision: Retain customer data for 7 years post-account-deletion, except PII which auto-deletes at 90 days.\nSource: Confluence space Legal > page \'Data Retention Policy v2.3\' (last updated Nov 2, 2025)\n\nDiscussion context: Policy was debated in Slack #legal-product-sync channel (Oct 18-25, 2025)\nKey points from thread:\n- Initial proposal: 10-year retention (submitted by @james.miller, Legal)\n- Concerns raised (Product): storage costs, GDPR compliance burden\n- Resolution: 7-year compromise balances compliance and cost\n- Participants: @james.miller (Legal), @priya.patel (Product), @david.lee (Data Privacy)\n\nImplementation: Jira task PROD-2847 (status: In Progress, assigned @james.miller, due Dec 15)\nCurrent implementation in Jira shows: retention schedule created, PII auto-delete configured, testing in progress.\n\nNote: Confluence page was updated Nov 2 (9 days ago); is current. Slack discussion resolved.\nCitation: Confluence Legal/Data-Retention-Policy-v2.3 + Slack #legal-product-sync + Jira PROD-2847.',
          isEdgeCase: false,
          sources: [
            'Confluence Legal/Data-Retention-Policy-v2.3',
            'Slack #legal-product-sync',
            'Jira PROD-2847',
          ],
        },
        {
          userQuery: 'What\'s our current strategy for API rate limiting?',
          agentResponse:
            'I found information about API rate limiting, but I can only share what you have access to:\n\nFull information (you have access):\n- Public strategy: Confluence Engineering > \'API Rate Limiting Strategy\' (last updated Oct 20, 2025, 149 days old)\n- Current status: Strategy is aging. Product team has ongoing discussion in #eng-infrastructure (Nov 1-15, 2025 messages visible)\n- Key points: Considering upgrade to token-bucket algorithm for higher throughput\n- Implementation: Jira task ENG-3421 (status: Planning, not started)\n\nWhat I cannot access:\n- Slack channel #eng-security (private, you don\'t have permission)\n- Google Drive folder \'Confidential/Rate-Limiting-RFP\' (restricted to Security team)\n\nWarning: The Confluence page is 149 days old and may not reflect current thinking in #eng-infrastructure. Recommend reviewing active Slack discussion for latest proposal.\n\nCitation: Confluence Engineering/API-Rate-Limiting-Strategy (Oct 20) + Slack #eng-infrastructure (Nov 1-15, visible) + Jira ENG-3421.',
          isEdgeCase: true,
          edgeCaseExplanation:
            'Access control with document freshness warning and partial information disclosure',
          sources: [
            'Confluence Engineering/API-Rate-Limiting-Strategy',
            'Slack #eng-infrastructure',
            'Jira ENG-3421',
          ],
        },
      ],
      structuralSignature:
        'This agent triggers 12 meta-patterns including multi-source-fetch, cross-source-join, entity-extraction, access-control-aware, document-data, reasoning-chain, and partial-data-handling. Estimated 2,847,000+ execution paths across 5 sources, 7 task types, and 11 relation types.',
      outcomeSignature:
        'Your agent answers any company question by searching Confluence, Slack, Drive, Jira, and employee directory in parallel. Handles document versioning, access control, and multi-source correlation. Returns citations to original sources. Works across all 340 employees and 8 organization units.',
    },

    // ── SaaS Customer Support Agent ─────────────────────────────────────
    'saas-copilot-support': {
      conversations: [
        {
          userQuery: 'I forgot my password. How do I reset it?',
          agentResponse:
            'I can help you reset your password right away. Verified account: acme-corp (Enterprise plan). I\'m sending a password reset link to your registered email. You\'ll have 24 hours to set a new password. Check your inbox in the next minute—if you don\'t see it, check spam. Once reset, you\'ll be able to log in immediately. Need help with anything else? KB: Account Management → Password Reset (article ID kb-0147)',
          isEdgeCase: false,
          sources: ['Knowledge Base kb-0147'],
        },
        {
          userQuery: 'We\'re getting periodic timeouts when accessing reports. Started yesterday morning.',
          agentResponse:
            'Thanks for reporting that. I see your account (techcorp-labs, Pro plan, $4,200/month) has been using reports heavily this week (8,200 API calls vs typical 3,400). Your rate limit is 10K calls/day. This could be a report performance issue or approaching limits. I\'m escalating this to our Engineering team (Ticket #SUP-2026-08847, P2-Medium) because it may require infrastructure investigation. They\'ll contact you within 4 hours. In the meantime, I found an optimization guide: KB: Reports → Performance Optimization (article ID kb-0341). Hang tight!',
          isEdgeCase: false,
          sources: [
            'Customer Database',
            'Knowledge Base kb-0341',
            'Ticket #SUP-2026-08847',
          ],
        },
        {
          userQuery: 'We need to upgrade from Pro to Enterprise. Can you do that?',
          agentResponse:
            'I can help with that upgrade. Current plan: Pro ($4,200/month) → Requested: Enterprise ($8,900/month). Checking account eligibility... Account in good standing ✓, no past-due invoices ✓, contract allows upgrades ✓. Applying upgrade effective immediately. Your next invoice will reflect the new rate. Updated features active now:\n- Unlimited team members (was 20) ✓\n- Custom workflows (was read-only) ✓\n- API rate limit increased to 50K/day (was 10K) ✓\n- Priority support enabled ✓\nEmail confirmation sent to all admins. Questions? Visit KB: Billing → Plan Changes (article ID kb-0089)',
          isEdgeCase: false,
          sources: [
            'Customer Database',
            'Action API',
            'Knowledge Base kb-0089',
          ],
        },
      ],
      structuralSignature:
        'This agent triggers 9 meta-patterns including multi-channel-ingestion, sentiment-aware-routing, kb-semantic-search, customer-context-enrichment, action-precondition-validation, and confidence-threshold-escalation. Estimated 8,640 execution paths across 3 channels, 12 KB categories, and 7 action types.',
      outcomeSignature:
        'Your agent resolves 68% of tickets via self-service (KB + simple actions). Routes remaining 32% to specialists with rich context. Reduces manual triage time by 85%, first-response time to <2 minutes, and customer satisfaction improves by 22% via personalized, context-aware responses.',
    },

    // ── FAQ Knowledge Agent ────────────────────────────────────────────
    'faq-knowledge': {
      conversations: [
        {
          userQuery: 'How many vacation days do I get as a new employee?',
          agentResponse:
            'As a new employee at VibeModel, you receive 20 vacation days per year, plus 10 company holidays. Your first day of eligibility is your hire date. Vacation requests should be submitted 2 weeks in advance through the HR portal. Source: HR Policies/Benefits Guide (doc-001, updated Jan 2025)',
          isEdgeCase: false,
          sources: ['HR Policies/Benefits Guide (doc-001)'],
        },
        {
          userQuery:
            'What equipment can I request as a new engineering hire working remote?',
          agentResponse:
            'Remote engineering hires are eligible for:\n- Laptop: MacBook Pro 14" or Linux workstation (request in onboarding)\n- Monitor + peripherals: $800 budget for monitor, keyboard, mouse\n- Home office setup: $600 budget for desk/chair (IT Guides suggest IKEA/Herman Miller)\n- Software licenses: standard dev tools provided (VS Code, JetBrains suite)\nRequests are processed via the IT Equipment Request form (typical 5-7 day turnaround).\nSources: IT Guides/New Hire Equipment (doc-038), Onboarding Checklist (doc-019)',
          isEdgeCase: false,
          sources: [
            'IT Guides/New Hire Equipment (doc-038)',
            'Onboarding Checklist (doc-019)',
          ],
        },
        {
          userQuery: 'Can I work from anywhere in the world whenever I want?',
          agentResponse:
            'This question spans multiple policies (Remote Work Policy, Tax Compliance, Travel & Expenses). Quick answer: VibeModel supports remote work in most countries, but some roles have restrictions and tax implications vary by location. For a precise answer, please schedule a meeting with HR to discuss:\n- Your specific role and responsibilities\n- Countries you plan to work from\n- Timeline (short-term travel vs permanent relocation)\nSources: Remote Work Policy (doc-007), Travel & Expenses Policy (doc-042). Escalation: recommend HR consultation for custom scenarios.',
          isEdgeCase: true,
          edgeCaseExplanation:
            'Multi-policy question requiring human escalation for tax and role-specific implications',
          sources: [
            'Remote Work Policy (doc-007)',
            'Travel & Expenses Policy (doc-042)',
          ],
        },
      ],
      structuralSignature:
        'This agent triggers 4 meta-patterns including single-source-lookup, document-data, entity-extraction, and citation-required. Estimated 2,840 execution paths across 12 document categories and 3 response types.',
      outcomeSignature:
        'Your agent answers employee questions about policies, procedures, benefits, IT setup, travel, and company culture from 280 documents. Provides accurate, cited answers for 85%+ of questions. Escalates ambiguous cases for human review.',
    },
  }

  return previews[tileId] || null
}
