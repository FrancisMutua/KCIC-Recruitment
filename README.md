# Kenya Climate Innovation Center Recruitment Portal

Simple setup instructions for running the solution in Visual Studio.

## Project structure

- **Solution file**: `KCIC-Recruitment.sln`
- **Backend project**: `KCIC-Recruitment.Server`
- **Frontend project**: `kcic-recruitment.client`

## Prerequisites

- Visual Studio 2022 (or later) with:
  - **ASP.NET and web development** workload
  - Matching **.NET SDK** (see `global.json`)

## Running the project in Visual Studio

1. Open `KCIC-Recruitment.sln` in Visual Studio.
2. Restore NuGet packages if prompted.
3. In **Solution Explorer**, right-click `KCIC-Recruitment.Server` and choose **Set as Startup Project**.
4. Select the `https` launch profile if available.
5. Press **F5** (or click **Run/Debug**).

Starting `KCIC-Recruitment.Server` also starts the React client through the ASP.NET SPA proxy. You do not need to start `kcic-recruitment.client` separately.

