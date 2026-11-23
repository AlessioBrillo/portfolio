# Analytics Assessment and Processing Record

Internal record for the processing described publicly on `/privacy`. This is the
legitimate-interest assessment (LIA) required by the legal basis chosen in
ADR-0029; it is not published as a page, but the public notice summarises it.

## Processing

| Field               | Value                                                       |
| ------------------- | ----------------------------------------------------------- |
| Purpose             | Serve the site securely; understand which pages are read    |
| Data                | IP address, User-Agent, URL, referrer, timestamp            |
| Legal basis         | Legitimate interest (Art. 6(1)(f) GDPR)                     |
| Recipients          | Vercel (hosting), Plausible (cookieless analytics)          |
| Transfers           | Vercel: US, DPA with SCC or DPF; Plausible: EU, DPA         |
| Retention           | Vercel runtime logs per plan; Plausible aggregate data only |
| Persistent cookies  | None                                                        |
| Automated decisions | None                                                        |

## Interest and necessity

The controller's interest is knowing whether the case studies are read, so the
portfolio can be maintained and improved. The site has no other source of that
signal. The processing is necessary and proportionate because the analytics is
aggregate, cookieless, confined to this origin and no profile is built.

## Balancing

- **Impact is low.** No cookies, no local/session storage, no cross-site
  identifiers, no profiling. The IP reaches Plausible transiently through the
  same-origin proxy and is used to count unique visitors; it is not retained by
  the analytics provider.
- **Visibility is high.** The notice is linked from the footer of every page
  and states the processing in plain language, in both Italian and English.
- **Control exists.** Visitors can object by email to `privacy@<domain>`, and
  can complain to the Garante. Honouring Do Not Track / Global Privacy Control
  is part of the analytics configuration when the provider exposes it.

Conclusion: the interest is not overridden by the rights and freedoms of data
subjects. The processing may continue without a consent banner.

## Review triggers

Re-assess this record if any of the following changes:

- a form, account, comment or any other data-collecting surface is added;
- a cookie, localStorage item or cross-site identifier is introduced;
- analytics starts retaining IPs or building profiles;
- a new processor or a new international transfer is added.
