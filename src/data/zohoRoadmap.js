// Zoho Admin learning roadmap — 9 phases from zero to certified admin
// Each phase has: id, title, description, color, icon, tasks[], resources[], practiceProject

export const PHASES = [
  {
    id: 'phase-1',
    title: 'Ecosystem & Account Setup',
    description: 'Get your bearings in Zoho One — create your org, understand the app landscape, and set up the basics.',
    color: 'sky',
    icon: '🌐',
    tasks: [
      { id: 'p1-t1', title: 'Create a Zoho One trial account', description: 'Sign up at zoho.com/one and activate the 30-day trial. Use a dedicated email.', difficulty: 'easy' },
      { id: 'p1-t2', title: 'Explore the Zoho One home screen', description: 'Browse all 45+ apps. Click into each category (Sales, Finance, HR, Collab, IT) to get oriented.', difficulty: 'easy' },
      { id: 'p1-t3', title: 'Configure organization settings', description: 'Set company name, logo, timezone, business hours, and fiscal year in Admin Panel > Organization.', difficulty: 'easy' },
      { id: 'p1-t4', title: 'Add your first users', description: 'Invite 2–3 test users via Admin Panel > Users. Understand the difference between admin and user roles.', difficulty: 'easy' },
      { id: 'p1-t5', title: 'Understand roles vs profiles', description: 'Read the help docs on Roles (data hierarchy) vs Profiles (permissions). Know when to use each.', difficulty: 'medium' },
      { id: 'p1-t6', title: 'Set up groups and departments', description: 'Create a Sales, Support, and Finance department. Assign test users to each.', difficulty: 'easy' },
      { id: 'p1-t7', title: 'Configure business email (Zoho Mail)', description: 'Set up or connect a business email domain in Zoho Mail. Verify MX records.', difficulty: 'medium' },
      { id: 'p1-t8', title: 'Tour the Zoho Admin Panel', description: 'Go through every section: Users, Groups, Apps, Security, Reports. Know what lives where.', difficulty: 'easy' },
    ],
    resources: [
      { title: 'Zoho One Admin Guide', url: 'https://www.zoho.com/one/help/admin-panel/' },
      { title: 'Zoho Mail Setup', url: 'https://www.zoho.com/mail/help/adminguide/' },
    ],
    practiceProject: 'Set up a fictional company "Acme Corp" — configure org settings, add 3 departments, create 5 test users with different roles.',
  },

  {
    id: 'phase-2',
    title: 'Zoho CRM Fundamentals',
    description: 'Master the core of Zoho\'s flagship product — leads, contacts, pipelines, and automations.',
    color: 'blue',
    icon: '📊',
    tasks: [
      { id: 'p2-t1', title: 'Understand CRM modules', description: 'Know the difference between Leads, Contacts, Accounts, and Deals. Understand their relationships.', difficulty: 'easy' },
      { id: 'p2-t2', title: 'Customize fields and layouts', description: 'Add a custom field to Leads. Reorganize a page layout. Understand field types (text, picklist, lookup).', difficulty: 'medium' },
      { id: 'p2-t3', title: 'Configure a sales pipeline', description: 'Set up deal stages with probability percentages. Create a second pipeline for a different product.', difficulty: 'medium' },
      { id: 'p2-t4', title: 'Import data via CSV', description: 'Import a sample CSV of 20+ leads. Handle duplicate detection and field mapping.', difficulty: 'medium' },
      { id: 'p2-t5', title: 'Set up workflow rules', description: 'Create a workflow: when a lead is created, auto-assign to a user and send a welcome email.', difficulty: 'medium' },
      { id: 'p2-t6', title: 'Build a CRM report', description: 'Create a "Leads by Source" tabular report and a "Deals by Stage" chart. Add both to a dashboard.', difficulty: 'medium' },
      { id: 'p2-t7', title: 'Configure email integration', description: 'Connect a Gmail/Outlook mailbox to CRM. Set up email templates for lead nurturing.', difficulty: 'medium' },
      { id: 'p2-t8', title: 'Set up Blueprint (process automation)', description: 'Create a simple Blueprint for the deal closing process with state transitions and mandatory fields.', difficulty: 'hard' },
      { id: 'p2-t9', title: 'Configure data sharing rules', description: 'Set org-wide defaults (Public/Private) for Leads. Create a sharing rule for regional managers.', difficulty: 'hard' },
      { id: 'p2-t10', title: 'Understand CRM sandbox', description: 'Access the Sandbox environment. Learn how to test changes before pushing to production.', difficulty: 'medium' },
    ],
    resources: [
      { title: 'CRM Admin Guide', url: 'https://www.zoho.com/crm/help/administrator/' },
      { title: 'Blueprint Setup', url: 'https://www.zoho.com/crm/help/blueprint/' },
      { title: 'CRM YouTube Channel', url: 'https://www.youtube.com/@ZohoCRM' },
    ],
    practiceProject: 'Build a complete sales process for Acme Corp: 3 pipelines, custom lead fields, a workflow that creates a deal when a lead is qualified, and a dashboard showing pipeline health.',
  },

  {
    id: 'phase-3',
    title: 'Zoho Books & Finance',
    description: 'Set up and manage the accounting backbone — invoicing, expenses, taxes, and reconciliation.',
    color: 'green',
    icon: '💰',
    tasks: [
      { id: 'p3-t1', title: 'Set up the chart of accounts', description: 'Review default accounts. Create custom income and expense accounts for your business type.', difficulty: 'medium' },
      { id: 'p3-t2', title: 'Configure taxes', description: 'Set up VAT/GST or sales tax rates. Understand tax groups and compound taxes.', difficulty: 'medium' },
      { id: 'p3-t3', title: 'Create and send an invoice', description: 'Build a branded invoice template. Create an invoice with line items, discounts, and taxes. Send it.', difficulty: 'easy' },
      { id: 'p3-t4', title: 'Set up payment gateways', description: 'Connect Stripe or PayPal. Enable online payment links on invoices.', difficulty: 'medium' },
      { id: 'p3-t5', title: 'Record expenses', description: 'Log expense entries manually. Import bank statement expenses via CSV. Categorize them.', difficulty: 'easy' },
      { id: 'p3-t6', title: 'Connect a bank account', description: 'Add a bank account and connect it via bank feeds (Plaid or CSV import). Set up auto-categorization rules.', difficulty: 'medium' },
      { id: 'p3-t7', title: 'Perform bank reconciliation', description: 'Reconcile 1 month of a connected bank account. Understand clearing items and reconciliation reports.', difficulty: 'hard' },
      { id: 'p3-t8', title: 'Create recurring invoices', description: 'Set up a recurring invoice profile for a monthly subscription client.', difficulty: 'easy' },
      { id: 'p3-t9', title: 'Run financial reports', description: 'Generate P&L, Balance Sheet, and Cash Flow statements. Export to PDF and Excel.', difficulty: 'medium' },
      { id: 'p3-t10', title: 'Set up multi-currency', description: 'Enable foreign currencies. Create an invoice in USD and another in EUR. Track exchange gains/losses.', difficulty: 'hard' },
    ],
    resources: [
      { title: 'Zoho Books Help Center', url: 'https://www.zoho.com/books/help/' },
      { title: 'Books Getting Started', url: 'https://www.zoho.com/books/help/getting-started/' },
    ],
    practiceProject: 'Set up Acme Corp financials: chart of accounts, 3 tax rates, send 5 invoices, record 10 expenses, reconcile a mock bank feed, generate monthly P&L.',
  },

  {
    id: 'phase-4',
    title: 'Zoho Desk (Customer Support)',
    description: 'Configure a full-featured help desk — tickets, SLAs, automation macros, and the customer portal.',
    color: 'orange',
    icon: '🎧',
    tasks: [
      { id: 'p4-t1', title: 'Create departments in Desk', description: 'Set up Sales Support, Technical Support, and Billing departments with their email channels.', difficulty: 'easy' },
      { id: 'p4-t2', title: 'Configure ticket channels', description: 'Add email, chat widget, and web form as ticket sources. Map each to the right department.', difficulty: 'medium' },
      { id: 'p4-t3', title: 'Set up SLA policies', description: 'Create a Business SLA (M-F 9-5) and a Premium SLA (24/7). Set response and resolution targets.', difficulty: 'medium' },
      { id: 'p4-t4', title: 'Create automation rules', description: 'Auto-assign tickets by keyword, escalate overdue tickets, and send follow-up emails on resolved tickets.', difficulty: 'medium' },
      { id: 'p4-t5', title: 'Build canned responses', description: 'Create 10 canned responses for common issues. Organize them by category.', difficulty: 'easy' },
      { id: 'p4-t6', title: 'Create macros', description: 'Build a macro that assigns a ticket, adds a tag, applies an SLA, and sends a canned response in one click.', difficulty: 'medium' },
      { id: 'p4-t7', title: 'Set up the Help Center', description: 'Enable the customer self-service portal. Create a knowledge base with 5 articles. Customize the theme.', difficulty: 'medium' },
      { id: 'p4-t8', title: 'Configure customer happiness ratings', description: 'Enable CSAT ratings. Set the timing (24h after resolution). Review the happiness dashboard.', difficulty: 'easy' },
      { id: 'p4-t9', title: 'Build Desk reports', description: 'Create reports for: tickets by channel, agent performance, SLA compliance, and avg resolution time.', difficulty: 'medium' },
      { id: 'p4-t10', title: 'Integrate Desk with CRM', description: 'Connect Zoho Desk to CRM so contacts and accounts sync. View ticket history from CRM contact record.', difficulty: 'hard' },
    ],
    resources: [
      { title: 'Zoho Desk Admin Guide', url: 'https://www.zoho.com/desk/help/administrator/' },
      { title: 'SLA Configuration', url: 'https://www.zoho.com/desk/help/sla-policies.html' },
    ],
    practiceProject: 'Build a complete support system for Acme Corp: 3 departments, email + web form channels, 2 SLA policies, 5 automations, 10 canned responses, and a knowledge base with 3 categories.',
  },

  {
    id: 'phase-5',
    title: 'Zoho Projects & Collaboration',
    description: 'Manage work, teams, and timelines using Zoho Projects, Cliq, and WorkDrive.',
    color: 'purple',
    icon: '📋',
    tasks: [
      { id: 'p5-t1', title: 'Create a project with milestones', description: 'Create a project for a product launch. Add 4 milestones with due dates.', difficulty: 'easy' },
      { id: 'p5-t2', title: 'Build a task structure', description: 'Create task lists and sub-tasks. Set dependencies (Task B starts after Task A finishes).', difficulty: 'medium' },
      { id: 'p5-t3', title: 'View and manage the Gantt chart', description: 'Switch to Gantt view. Drag tasks to adjust dates. Add a baseline to compare planned vs actual.', difficulty: 'medium' },
      { id: 'p5-t4', title: 'Set up time tracking', description: 'Enable time logging on tasks. Log time manually. Set up a timesheet approval workflow.', difficulty: 'medium' },
      { id: 'p5-t5', title: 'Configure project templates', description: 'Save a completed project structure as a template. Create a new project from that template.', difficulty: 'easy' },
      { id: 'p5-t6', title: 'Set up Zoho Cliq (team chat)', description: 'Create channels for General, Sales, and Engineering. Configure Cliq notifications for project updates.', difficulty: 'easy' },
      { id: 'p5-t7', title: 'Organize files in WorkDrive', description: 'Create a WorkDrive team folder structure. Set sharing permissions for departments. Upload sample files.', difficulty: 'medium' },
      { id: 'p5-t8', title: 'Integrate Projects with CRM', description: 'Link a CRM deal to a project. View project progress from the deal record.', difficulty: 'hard' },
    ],
    resources: [
      { title: 'Zoho Projects Help', url: 'https://www.zoho.com/projects/help/' },
      { title: 'WorkDrive Admin Guide', url: 'https://www.zoho.com/workdrive/help/' },
    ],
    practiceProject: 'Plan a "Website Redesign" project: 4 milestones, 20+ tasks with dependencies, Gantt chart, time-tracked tasks, and a summary dashboard.',
  },

  {
    id: 'phase-6',
    title: 'Zoho People (HR)',
    description: 'Manage the employee lifecycle — onboarding, leave, attendance, and performance reviews.',
    color: 'pink',
    icon: '👥',
    tasks: [
      { id: 'p6-t1', title: 'Set up the org chart', description: 'Import employees and build the reporting hierarchy in Zoho People. Verify the org tree looks correct.', difficulty: 'easy' },
      { id: 'p6-t2', title: 'Configure leave types', description: 'Set up Annual Leave (15 days), Sick Leave (10 days), and Unpaid Leave. Configure accrual and carryover rules.', difficulty: 'medium' },
      { id: 'p6-t3', title: 'Set up attendance', description: 'Enable attendance tracking. Configure work schedules (shifts). Set up check-in/check-out methods.', difficulty: 'medium' },
      { id: 'p6-t4', title: 'Create an onboarding checklist', description: 'Build a new hire onboarding form with tasks: IT setup, HR docs, benefits enrollment, intro meetings.', difficulty: 'medium' },
      { id: 'p6-t5', title: 'Configure performance reviews', description: 'Set up a 360-degree review cycle. Create a review form with competency ratings and goal tracking.', difficulty: 'hard' },
      { id: 'p6-t6', title: 'Build HR reports', description: 'Generate headcount, turnover, leave balance, and attendance reports. Schedule them for monthly email delivery.', difficulty: 'medium' },
      { id: 'p6-t7', title: 'Integrate People with CRM/Projects', description: 'Ensure employee records sync so CRM users match People employees. Link time-off to project availability.', difficulty: 'hard' },
    ],
    resources: [
      { title: 'Zoho People Help Center', url: 'https://www.zoho.com/people/help/' },
      { title: 'Leave Configuration', url: 'https://www.zoho.com/people/help/leave-management.html' },
    ],
    practiceProject: 'Set up HR for Acme Corp: org chart with 3 levels, 4 leave types with accrual, a new-hire onboarding workflow, and a performance review template.',
  },

  {
    id: 'phase-7',
    title: 'Automation, Flow & Deluge',
    description: 'Connect apps and automate workflows using Zoho Flow, custom functions in Deluge, and webhooks.',
    color: 'amber',
    icon: '⚡',
    tasks: [
      { id: 'p7-t1', title: 'Build your first Zoho Flow', description: 'Create a Flow: when a new CRM lead is added, create a Desk ticket and notify a Cliq channel.', difficulty: 'medium' },
      { id: 'p7-t2', title: 'Use conditional logic in flows', description: 'Add an if/else branch: if lead source is "Web", assign to Sales rep A; else assign to rep B.', difficulty: 'medium' },
      { id: 'p7-t3', title: 'Set up a scheduled flow', description: 'Create a scheduled flow that runs daily: fetch overdue CRM tasks and post a Cliq digest to the team.', difficulty: 'hard' },
      { id: 'p7-t4', title: 'Write your first Deluge script', description: 'Write a custom CRM function in Deluge: calculate a discount % based on deal size and update a field.', difficulty: 'hard' },
      { id: 'p7-t5', title: 'Configure webhooks', description: 'Set up a webhook in CRM that posts deal data to a test endpoint (use webhook.site). Verify the payload.', difficulty: 'medium' },
      { id: 'p7-t6', title: 'Build a cross-app automation', description: 'Flow: CRM deal marked "Won" → create a Books invoice → create a Projects project → notify via Cliq.', difficulty: 'hard' },
      { id: 'p7-t7', title: 'Use Zoho Analytics for BI', description: 'Connect CRM and Books to Zoho Analytics. Build a cross-app report: revenue vs pipeline by month.', difficulty: 'hard' },
      { id: 'p7-t8', title: 'Explore Zoho Creator (no-code apps)', description: 'Build a simple custom form app in Zoho Creator. Connect it to CRM via a Deluge function.', difficulty: 'hard' },
    ],
    resources: [
      { title: 'Zoho Flow Help', url: 'https://help.zoho.com/portal/en/kb/flow' },
      { title: 'Deluge Language Reference', url: 'https://www.zoho.com/deluge/help/' },
      { title: 'Zoho Creator Tutorials', url: 'https://www.zoho.com/creator/help/' },
    ],
    practiceProject: 'Build an end-to-end automation: web form (Creator) → CRM lead → auto-qualify → create deal + Books quote → win deal → create invoice + project → notify Cliq.',
  },

  {
    id: 'phase-8',
    title: 'Security, Compliance & Advanced Admin',
    description: 'Lock down the org with SSO, IP restrictions, data policies, audit logs, and backup strategies.',
    color: 'red',
    icon: '🔐',
    tasks: [
      { id: 'p8-t1', title: 'Configure password policies', description: 'Set minimum length, complexity, expiry (90 days), and lockout rules in Admin Panel > Security.', difficulty: 'easy' },
      { id: 'p8-t2', title: 'Enable two-factor authentication', description: 'Enforce 2FA for all admin users. Understand the difference between TOTP, SMS, and YubiKey options.', difficulty: 'easy' },
      { id: 'p8-t3', title: 'Set up IP restrictions', description: 'Allow access only from your office IP range. Test that external access is blocked.', difficulty: 'medium' },
      { id: 'p8-t4', title: 'Configure SSO (Single Sign-On)', description: 'Set up SAML SSO with a test IdP (use Zoho Directory or a free Okta dev account).', difficulty: 'hard' },
      { id: 'p8-t5', title: 'Review audit logs', description: 'Explore Admin Panel > Audit Log. Filter by user, app, and action type. Export a 7-day log.', difficulty: 'medium' },
      { id: 'p8-t6', title: 'Configure data retention policies', description: 'Set backup and data retention rules in CRM and Books. Understand what gets auto-purged.', difficulty: 'medium' },
      { id: 'p8-t7', title: 'Perform a manual data backup', description: 'Export a full backup of CRM (all modules as CSV). Export Books data. Store securely.', difficulty: 'easy' },
      { id: 'p8-t8', title: 'Set up mobile device management', description: 'Configure MDM policies in Zoho OneAuth. Enforce device PIN and remote-wipe capability.', difficulty: 'hard' },
      { id: 'p8-t9', title: 'Review GDPR/compliance settings', description: 'Enable GDPR mode in CRM (consent tracking, data subject requests). Export a data subject report.', difficulty: 'medium' },
      { id: 'p8-t10', title: 'Configure custom domain for apps', description: 'Set up a custom domain (help.acmecorp.com) for Zoho Desk Help Center. Verify SSL.', difficulty: 'hard' },
    ],
    resources: [
      { title: 'Zoho Security Best Practices', url: 'https://www.zoho.com/security.html' },
      { title: 'SAML SSO Configuration', url: 'https://www.zoho.com/accounts/help/saml.html' },
      { title: 'GDPR Compliance in CRM', url: 'https://www.zoho.com/crm/help/gdpr-compliance.html' },
    ],
    practiceProject: 'Security audit of Acme Corp: enforce 2FA for all admins, set IP restriction for test, review 1 week of audit logs, perform full data backup, document the security policy.',
  },

  {
    id: 'phase-9',
    title: 'Mastery & Certification',
    description: 'Tie everything together with real-world scenarios and earn your Zoho Admin certifications.',
    color: 'gold',
    icon: '🏆',
    tasks: [
      { id: 'p9-t1', title: 'Complete Zoho CRM admin practice exam', description: 'Use Zoho\'s official practice questions. Score 80%+ before attempting the real exam.', difficulty: 'hard' },
      { id: 'p9-t2', title: 'Take the Zoho CRM Certified Administrator exam', description: 'Register and complete the official Zoho CRM certification at learn.zoho.com.', difficulty: 'hard' },
      { id: 'p9-t3', title: 'Complete Zoho Books certification', description: 'Complete the Zoho Books professional certification or Accountant training.', difficulty: 'hard' },
      { id: 'p9-t4', title: 'Build a complete business setup from scratch', description: 'Using a blank org, set up a full B2B SaaS company: CRM, Books, Desk, Projects, People, Flow — in under 4 hours.', difficulty: 'hard' },
      { id: 'p9-t5', title: 'Conduct a mock admin audit', description: 'Pretend you\'re auditing a client org. Check security, data hygiene, automation errors, and unused licenses.', difficulty: 'hard' },
      { id: 'p9-t6', title: 'Write a runbook', description: 'Document your Acme Corp setup in a Google Doc or Notion: every config decision, why you made it, and how to replicate it.', difficulty: 'medium' },
      { id: 'p9-t7', title: 'Join the Zoho Community', description: 'Post 3 helpful answers in the Zoho CRM or Books community forum. Build your public presence.', difficulty: 'easy' },
      { id: 'p9-t8', title: 'Complete a capstone project', description: 'Take a real (or simulated) client brief and implement their full Zoho stack from scratch. Present the solution.', difficulty: 'hard' },
    ],
    resources: [
      { title: 'Zoho Certifications', url: 'https://www.zoho.com/certification.html' },
      { title: 'Zoho Learn (LMS)', url: 'https://learn.zoho.com' },
      { title: 'Zoho Community', url: 'https://help.zoho.com/portal/en/community' },
      { title: 'Zoho YouTube (All Apps)', url: 'https://www.youtube.com/@ZohoTV' },
    ],
    practiceProject: 'Full capstone: build a complete Zoho stack for a fictional logistics company from a written brief. Present a demo showing every phase of a customer journey from lead to invoice to support ticket.',
  },
];

export const DIFFICULTY_META = {
  easy:   { label: 'Easy',   color: 'green'  },
  medium: { label: 'Medium', color: 'amber'  },
  hard:   { label: 'Hard',   color: 'red'    },
};

export const PHASE_COLOR_META = {
  sky:    { bg: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-700',    icon: 'bg-sky-100',    bar: 'sky',    badge: 'sky'    },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: 'bg-blue-100',   bar: 'sky',    badge: 'sky'    },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  icon: 'bg-green-100',  bar: 'green',  badge: 'green'  },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'bg-orange-100', bar: 'amber',  badge: 'amber'  },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'bg-purple-100', bar: 'sky',    badge: 'purple' },
  pink:   { bg: 'bg-pink-50',   border: 'border-pink-200',   text: 'text-pink-700',   icon: 'bg-pink-100',   bar: 'red',    badge: 'red'    },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  icon: 'bg-amber-100',  bar: 'amber',  badge: 'amber'  },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    icon: 'bg-red-100',    bar: 'red',    badge: 'red'    },
  gold:   { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'bg-yellow-100', bar: 'amber',  badge: 'amber'  },
};

export const ALL_TASK_IDS = PHASES.flatMap((p) => p.tasks.map((t) => t.id));
export const TOTAL_TASKS = ALL_TASK_IDS.length;
