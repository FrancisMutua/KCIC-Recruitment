import { Link } from "react-router-dom";

const RootFooter = () => {
  return (
    <div className="mt-auto bg-cyan-900 text-white flex justify-center items-center flex-col py-5">
      <p>
        Copright BioVax &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
      <p>
        Powered by{" "}
        <Link
          to="https://www.appkings.co.ke"
          target="_blank"
          className="text-white/60 underline hover:no-underline"
        >
          Appkings Solutions Limited
        </Link>
      </p>
    </div>
  );
};

export default RootFooter;
