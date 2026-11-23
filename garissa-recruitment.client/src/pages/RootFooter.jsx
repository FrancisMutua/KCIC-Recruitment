import { Link } from "react-router-dom";

const RootFooter = () => {
  return (
    <footer className="mt-auto bg-gradient-primary text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row sm:px-6 md:px-10">
        <p className="text-white/90">
          Copyright Garissa University &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
        <p className="text-white/70">
          Powered by{" "}
          <Link
            to="https://www.appkings.co.ke"
            target="_blank"
            className="font-medium text-brand-lime hover:underline"
          >
            Appkings Solutions Limited
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default RootFooter;
