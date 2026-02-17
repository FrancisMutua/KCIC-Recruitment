import { AccountProviver } from "./AccountContext";
import { JobProvider } from "./JobContext";
import { ThemeProvider } from "./ThemeContext";

const AppProviders = ({ children }) => {
  return (
    <AccountProviver>
      <JobProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </JobProvider>
    </AccountProviver>
  );
};

export default AppProviders;
