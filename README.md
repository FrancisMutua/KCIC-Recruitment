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
