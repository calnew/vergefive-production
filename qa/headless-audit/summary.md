# Verge Five Headless Audit

Base URL: https://vergefive.pages.dev
Generated: 2026-05-14T12:38:01.640Z

## Summary

- Public page checks: 22
- Protected logged-out route checks: 26
- Flow checks: 3
- Authenticated member page checks: 26
- Public page issues found: 2
- Member page issues found: 18
- Protected route failures: 0
- Flow failures: 0

## Flow Results
- PASS /membership/: monthly selected count: 1 | monthly message: Monthly selected: $49/month. | annual selected count: 1 | annual message: Annual selected: $497/year.
- PASS /homeefe757a6/: https://vergefive.pages.dev/login/?next=%2Fhomeefe757a6%2F
- PASS /: scan score text: 3/ 10

## Public Page Issues
- desktop /membership/ -> status 200, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/verge-five-homepage-promo.webm (net::ERR_ABORTED)
- mobile /membership/ -> status 200, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/verge-five-homepage-promo.webm (net::ERR_ABORTED)

## Protected Route Results
- All protected routes redirected logged-out users to login.

## Authenticated Member Page Issues
- /phones-and-411/ -> status 200, finalUrl https://vergefive.pages.dev/phones-and-411/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/start-here-nap-overview.webm (net::ERR_ABORTED) | GET https://pub-15820b1cee7544748132a3028ca4c32a.r2.dev/LiAShjxGRy2IefFnUSSJ_Biz%20411-v.mp4 (net::ERR_ABORTED)
- /business-address/ -> status 200, finalUrl https://vergefive.pages.dev/business-address/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/phones-and-411-phone-recreated.webm (net::ERR_ABORTED)
- /newpage87229491/ -> status 200, finalUrl https://vergefive.pages.dev/newpage87229491/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/business-address-recreated.webm (net::ERR_ABORTED)
- /newpage7c157847/ -> status 200, finalUrl https://vergefive.pages.dev/newpage7c157847/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/newpage87229491-recreated.webm (net::ERR_ABORTED)
- /contact-list/ -> status 200, finalUrl https://vergefive.pages.dev/contact-list/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/newpage7c157847-lesson.webm (net::ERR_ABORTED)
- /ein/ -> status 200, finalUrl https://vergefive.pages.dev/ein/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/contact-list-lesson.webm (net::ERR_ABORTED)
- /bank-account/ -> status 200, finalUrl https://vergefive.pages.dev/bank-account/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/ein-recreated.webm (net::ERR_ABORTED)
- /bank-rating/ -> status 200, finalUrl https://vergefive.pages.dev/bank-rating/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/bank-account-recreated.webm (net::ERR_ABORTED)
- /your-bank-rating/ -> status 200, finalUrl https://vergefive.pages.dev/bank-rating/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/bank-rating-lesson.webm (net::ERR_ABORTED)
- /business-plan/ -> status 200, finalUrl https://vergefive.pages.dev/business-plan/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/bank-rating-lesson.webm (net::ERR_ABORTED)
- /equifax-business/ -> status 200, finalUrl https://vergefive.pages.dev/equifax-business/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/business-plan-recreated.webm (net::ERR_ABORTED)
- /comparable-credit/ -> status 200, finalUrl https://vergefive.pages.dev/comparable-credit/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/equifax-business-lesson.webm (net::ERR_ABORTED)
- /newpagea5b34995/ -> status 200, finalUrl https://vergefive.pages.dev/newpagea5b34995/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/comparable-credit-lesson.webm (net::ERR_ABORTED)
- /about-net-30/ -> status 200, finalUrl https://vergefive.pages.dev/about-net-30/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/newpagea5b34995-lesson.webm (net::ERR_ABORTED)
- /nav-boot/ -> status 200, finalUrl https://vergefive.pages.dev/nav-boot/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/about-net-30-recreated.webm (net::ERR_ABORTED)
- /revolving-business-credit-cards/ -> status 200, finalUrl https://vergefive.pages.dev/revolving-business-credit-cards/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/nav-boot-recreated.webm (net::ERR_ABORTED)
- /cd-business-loans/ -> status 200, finalUrl https://vergefive.pages.dev/cd-business-loans/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/revolving-business-credit-cards-recreated.webm (net::ERR_ABORTED)
- /starter-net-30-vendors/ -> status 200, finalUrl https://vergefive.pages.dev/starter-net-30-vendors/, overflowX 0
  - Failed requests: GET https://vergefive.pages.dev/Resources/videos/cd-business-loans-lesson.webm (net::ERR_ABORTED)

Full JSON report: D:\Cowork\veregefive\vergefive_cloudflare\qa\headless-audit\report.json