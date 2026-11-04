# Garissa University Recruitment Portal

Simple setup instructions for running the solution in Visual Studio.

## Project structure

- **Solution file**: `Garissa-Recruitment.sln`
- **Backend project**: `Garissa-Recruitment.Server`
- **Frontend project**: `garissa-recruitment.client`

## Prerequisites

- Visual Studio 2022 (or later) with:
  - **ASP.NET and web development** workload
  - Matching **.NET SDK** (see `global.json`)

## Running the project in Visual Studio

1. Open `Garissa-Recruitment.sln` in Visual Studio.
2. Restore NuGet packages if prompted.
3. In **Solution Explorer**, right-click `Garissa-Recruitment.Server` and choose **Set as Startup Project**.
4. Select the `https` launch profile if available.
5. Press **F5** (or click **Run/Debug**).

Starting `Garissa-Recruitment.Server` also starts the React client through the ASP.NET SPA proxy. You do not need to start `garissa-recruitment.client` separately.

