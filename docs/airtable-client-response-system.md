# Airtable Client Response System

Airtable base used for the pilot: **Phylia2You Contacts** (`appeAO1DmgjwwZ5ZQ`).

I added these tables for the PhyliA Consulting pilot system:

## 1. Inquiries

Tracks leads, pilot clients, and future paid clients.

Fields:

- Business Name
- Contact Name
- Email
- Phone
- Business Type
- Website
- Location
- Inquiry Source
- Main Problem
- Interested In
- Status
- Priority
- Date Received
- Next Follow-Up Date
- Notes

Status options:

- New
- Needs Review
- Replied
- Mini-Audit Sent
- Waiting
- Pilot
- Paid Client
- Not a Fit
- Closed

## 2. Client Problems

Stores common problems so the service becomes repeatable.

Seed examples added:

- Missed customer inquiries
- Repeating the same answers
- No follow-up process
- Too many disconnected tools
- Manual appointment or quote reminders

## 3. Response Templates

Stores reusable messages for low-pressure sales and delivery.

Seed templates added:

- New inquiry reply
- Send intake form
- Free mini-audit offer
- Follow-up after no response
- Testimonial request

## 4. Services / Offers

Keeps the offer ladder simple.

Seed offers added:

- Free Workflow Checkup
- Customer Response Mini-Cleanup
- Starter Admin System

## 5. Tasks

Keeps next actions out of vague business fog.

Seed tasks added:

- Create Phylia intake form questions
- Run one fake client through the workflow
- Find one friendly pilot business

## Suggested Airtable views to create manually

The Airtable API created the tables and records. Create these views in Airtable UI when convenient:

### Inquiries

- **New / Needs Review**: filter Status is New or Needs Review
- **Follow Up This Week**: filter Next Follow-Up Date is within the next 7 days
- **Pilots**: filter Status is Pilot

### Tasks

- **Today / Doing**: filter Status is Doing or To Do
- **Waiting**: filter Status is Waiting
- **Done**: filter Status is Done

### Response Templates

- **Active Templates**: filter Active? is Yes

## Manual form recommendation

Create an Airtable form from the **Inquiries** table with these visible fields:

1. Business Name
2. Contact Name
3. Email
4. Phone
5. Business Type
6. Website
7. Location
8. Main Problem
9. Interested In
10. Notes

Use the form as the low-pressure alternative to sales calls.
