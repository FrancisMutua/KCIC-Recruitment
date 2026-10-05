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

## Business Central compatibility

Deploy the Recruitment codeunit exposing `GetApplicationInstructions`,
`ManageRecruitmentApplication`, and `AcceptOffer` before deploying the requirements,
document-management, and offer-response screens. When regenerating the NAVWS SOAP
reference, verify these operations are included.
