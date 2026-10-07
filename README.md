# KCA Recruitment Portal

Simple setup instructions for running the solution in Visual Studio.

## Project structure

- **Solution file**: `Recruitment.sln`
- **Backend project**: `Recruitment.Server`
- **Frontend project**: `recruitment.client`

## Prerequisites

- Visual Studio 2022 (or later) with:
  - **ASP.NET and web development** workload
  - Matching **.NET SDK** (see `global.json`)

## Running the project in Visual Studio

1. Open `Recruitment.sln` in Visual Studio.
2. Restore NuGet packages if prompted.
3. In **Solution Explorer**, right-click `Recruitment.Server` and choose **Set as Startup Project**.
4. Select the `https` launch profile if available.
5. Press **F5** (or click **Run/Debug**).

Starting `Recruitment.Server` also starts the React client through the ASP.NET SPA proxy. You do not need to start `recruitment.client` separately.

## Publishing to Live

Select the server project's `Live` folder publish profile, or run `./publish.sh`
from the repository root. The profile builds in Release with project references
enabled so the React build is included under `wwwroot`. It targets
`../../../Live` relative to the server project and fails if the server assembly
or frontend entry point is missing.

For a different destination, run `./publish.sh /absolute/output/path`.
The profile requests deletion of existing files for IDE folder publishing;
`dotnet publish` alone does not guarantee removal of stale files.

## Business Central compatibility

Academic and work-experience date ranges show inline errors while editing and
block saving invalid ranges. Start dates cannot be in the future, and end dates
must be strictly after start dates. Academic end dates may be in the future for
ongoing studies. Past employment cannot have a future end date; current
employment does not require one. Dates are compared as local calendar days.

Run the focused validation tests with
`node --test recruitment.client/src/lib/dateValidation.test.js`.

Final submission is disabled when the referee count is below BC's
`MinimumReferees`, independently of `EnforceCompleteness`. The review screen
shows the shortfall and blocks submission if the minimum cannot be loaded.
The Referees step loads the same BC setting, displays the count, and disables
Next until the configured minimum is met.
Run `node --test recruitment.client/src/lib/refereeValidation.test.js` to test
the minimum-count boundaries.

Deploy the Recruitment codeunit exposing `GetApplicationInstructions`,
`ManageRecruitmentApplication`, and `AcceptOffer` before deploying the requirements,
document-management, and offer-response screens. When regenerating the NAVWS SOAP
reference, verify these operations are included.

## Application and advert fields

All starred application fields are validated before saving, including
whitespace-only values and conditional disability fields. Middle name is
optional. Salutation replaces the visible Initials label; the existing SOAP
enum contract is retained: Mr./Mrs./Miss. keep their BC values (0/1/2), with
Dr./Prof. appended as 3/4. Academic Area of Study is free text. The Relative /
Next of Kin component remains inactive and is not part of the application flow.
Required advert answers, configured consent, and required document uploads
block progression and final submission, even when optional completeness
warnings are disabled.

Advert details use `GetJobAdvertDetails` to expose job purpose, responsibilities,
requirements, competencies, grade, department, reporting position, vacancies,
dates, terms of service/employment, duty station, salary, allowances, requested
documents, and application questions. Empty list entries and leading bullet/
number decorations are removed before numbering the displayed sections.
Known mis-decoded punctuation from BC is repaired for advert lists and
requirement labels, as well as job titles in the job listing, detail view,
and application history (for example, `ËÇô` displays as an en dash).
Advert metadata labels remain visible when BC values are unavailable, with
blank values rather than placeholder text. Salary and allowance values are
shown as returned by BC; missing amounts remain blank.
BC's dedicated advert retrieval procedures use Employee Requisition values
first, then the linked Jobs Card when salary is unset (zero) or duty station/
employment terms are blank. Basic salary is returned as JSON null if neither
record contains a nonzero salary. Allowances are summed from requisition
allowance lines, or linked Jobs Card allowance lines when none exist on the
requisition. The total and breakdown always use the same source. No allowance
lines means JSON null, not an invented zero. Explicit zero-valued allowance
lines retain their actual stored value.
Business Central's Jobs Card and Employee Requisition expose Terms of Service.
Deploy the updated BC extension before publishing the portal; the existing
SOAP reference already includes the full-advert operation.

Run all client validation tests with
`node --test recruitment.client/src/lib/*.test.js`.
